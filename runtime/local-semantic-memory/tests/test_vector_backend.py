import json, struct, sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def _blob(values):
    return struct.pack('<' + 'f' * len(values), *values)


def _row(source_id, vector, *, namespace='n1', data_class='TEACHER_PROFESSIONAL'):
    return {
        'source_app_id': 'app', 'source_type': 'doc', 'source_id': str(source_id),
        'revision': 'r1', 'namespace': namespace, 'canonical_ref': f'app://doc/{source_id}',
        'chunk_id': f'c{source_id}', 'chunk_text': f'text {source_id}',
        'data_class': data_class, 'metadata_json': json.dumps({'id': str(source_id)}),
        'model_id': 'm1', 'dimensions': len(vector), 'embedding': _blob(vector),
    }


class VectorBackendTests(unittest.TestCase):
    def test_config_rejects_nonabsolute_and_missing_sqlite_vec_paths(self):
        from config import load_runtime_config, ConfigError
        with tempfile.TemporaryDirectory() as td:
            base = {'TRAMA_MEMORY_HOME': td, 'TRAMA_MEMORY_ALLOWED_ORIGINS': 'https://allowed.test'}
            with self.assertRaises(ConfigError):
                load_runtime_config({**base, 'TRAMA_SQLITE_VEC_PATH': 'relative/vec0.so'})
            missing = str(Path(td) / 'missing-vec0.so')
            with self.assertRaises(ConfigError):
                load_runtime_config({**base, 'TRAMA_SQLITE_VEC_PATH': missing})

    def test_no_extension_path_selects_canonical_linear_backend(self):
        from vector_backend import LinearVectorBackend, select_vector_backend
        backend = select_vector_backend(None)
        self.assertIsInstance(backend, LinearVectorBackend)
        self.assertIsNone(backend.degraded_reason)

    def test_probe_failure_degrades_to_linear_without_changing_results(self):
        from vector_backend import LinearVectorBackend, select_vector_backend
        with tempfile.TemporaryDirectory() as td:
            ext = Path(td) / 'vec0.so'; ext.write_bytes(b'not-a-real-extension')
            backend = select_vector_backend(ext, probe=lambda path: (_ for _ in ()).throw(RuntimeError('bad extension')))
            self.assertIsInstance(backend, LinearVectorBackend)
            self.assertEqual(backend.degraded_reason, 'sqlite-vec-unavailable')
            rows = [_row(1, (1.0, 0.0)), _row(2, (0.0, 1.0))]
            ranked = backend.rank(rows, (1.0, 0.0), model_id='m1', dimensions=2, limit=2)
            self.assertEqual([r[0]['source_id'] for r in ranked], ['1', '2'])

    def test_sqlite_vec_backend_matches_linear_order_and_scores(self):
        from vector_backend import LinearVectorBackend, SqliteVecBackend, select_vector_backend
        with tempfile.TemporaryDirectory() as td:
            ext = Path(td) / 'vec0.so'; ext.write_bytes(b'fake')
            def distance(left_blob, right_blob):
                # fake the sqlite-vec cosine distance using the canonical formula
                vals = lambda blob: struct.unpack('<' + 'f' * (len(blob)//4), blob)
                a, b = vals(left_blob), vals(right_blob)
                import math
                dot = sum(x*y for x,y in zip(a,b)); na=math.sqrt(sum(x*x for x in a)); nb=math.sqrt(sum(y*y for y in b))
                return 1.0 - (dot/(na*nb) if na and nb else 0.0)
            backend = select_vector_backend(ext, probe=lambda path: 'v-test', native_distance=distance)
            self.assertIsInstance(backend, SqliteVecBackend)
            rows = [_row(2, (0.0, 1.0)), _row(1, (1.0, 0.0)), _row(3, (1.0, 1.0))]
            linear = LinearVectorBackend().rank(rows, (1.0, 0.0), model_id='m1', dimensions=2, limit=3)
            accelerated = backend.rank(rows, (1.0, 0.0), model_id='m1', dimensions=2, limit=3)
            self.assertEqual([x[0]['source_id'] for x in accelerated], [x[0]['source_id'] for x in linear])
            for (_, a), (_, b) in zip(accelerated, linear):
                self.assertAlmostEqual(a, b, places=6)

    def test_service_health_reports_degraded_when_optional_probe_failed(self):
        from service import MemoryService
        from vector_backend import LinearVectorBackend
        class Indexer:
            def health(self):
                return {'schema':'trama.semantic-memory-health/v1','status':'ready','protocolVersion':1,'modelId':None,'dimensions':None,'indexRevision':'0'}
        class Search:
            backend = LinearVectorBackend(degraded_reason='sqlite-vec-unavailable')
        health = MemoryService(Indexer(), Search()).health()
        self.assertEqual(health['status'], 'degraded')
        self.assertEqual(set(health), {'schema','status','protocolVersion','modelId','dimensions','indexRevision'})


if __name__ == '__main__': unittest.main()
