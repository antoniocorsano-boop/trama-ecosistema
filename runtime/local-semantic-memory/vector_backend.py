from __future__ import annotations
import math, sqlite3, struct
from pathlib import Path
from contracts import RebuildRequiredError, StorageError


def _decode(blob, dims):
    if dims <= 0 or len(blob) != dims * 4:
        raise StorageError('stored vector dimensions are inconsistent')
    return struct.unpack('<' + 'f' * dims, blob)


def _cosine(a, b):
    if len(a) != len(b):
        raise StorageError('vector dimension mismatch')
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0.0 or nb == 0.0:
        return 0.0
    score = dot / (na * nb)
    if not math.isfinite(score):
        raise StorageError('non-finite cosine score')
    return float(score)


class LinearVectorBackend:
    mode = 'linear'
    version = None

    def __init__(self, *, degraded_reason=None):
        self.degraded_reason = degraded_reason

    @property
    def degraded(self):
        return self.degraded_reason is not None

    def rank(self, rows, query_vector, *, model_id, dimensions, limit):
        ranked = []
        for row in rows:
            dims = int(row['dimensions'])
            if dims != dimensions or row['model_id'] != model_id:
                raise RebuildRequiredError('stored vector is incompatible with query embedding')
            score = _cosine(query_vector, _decode(row['embedding'], dims))
            ranked.append((row, score))
        ranked.sort(key=lambda item: (
            -item[1], item[0]['source_app_id'], item[0]['source_type'],
            item[0]['source_id'], item[0]['chunk_id']
        ))
        return ranked[:limit]


class SqliteVecBackend(LinearVectorBackend):
    mode = 'sqlite-vec'

    def __init__(self, extension_path, *, version, native_distance=None):
        super().__init__()
        self.extension_path = Path(extension_path)
        self.version = version
        self.native_distance = native_distance

    def rank(self, rows, query_vector, *, model_id, dimensions, limit):
        if self.native_distance is None:
            return super().rank(rows, query_vector, model_id=model_id, dimensions=dimensions, limit=limit)
        query_blob = struct.pack('<' + 'f' * dimensions, *query_vector)
        ranked = []
        for row in rows:
            dims = int(row['dimensions'])
            if dims != dimensions or row['model_id'] != model_id:
                raise RebuildRequiredError('stored vector is incompatible with query embedding')
            try:
                distance = float(self.native_distance(row['embedding'], query_blob))
            except Exception as exc:
                raise StorageError('sqlite-vec distance failed') from exc
            score = 1.0 - distance
            if not math.isfinite(score):
                raise StorageError('sqlite-vec produced non-finite score')
            ranked.append((row, score))
        ranked.sort(key=lambda item: (
            -item[1], item[0]['source_app_id'], item[0]['source_type'],
            item[0]['source_id'], item[0]['chunk_id']
        ))
        return ranked[:limit]


def _probe_sqlite_vec(path):
    conn = sqlite3.connect(':memory:')
    try:
        conn.enable_load_extension(True)
        try:
            conn.load_extension(str(path))
        finally:
            conn.enable_load_extension(False)
        row = conn.execute('SELECT vec_version()').fetchone()
        if not row or not row[0]:
            raise RuntimeError('vec_version unavailable')
        return str(row[0])
    finally:
        conn.close()


def _native_distance_from_extension(path):
    def distance(left_blob, right_blob):
        conn = sqlite3.connect(':memory:')
        try:
            conn.enable_load_extension(True)
            try:
                conn.load_extension(str(path))
            finally:
                conn.enable_load_extension(False)
            return conn.execute('SELECT vec_distance_cosine(?, ?)', (left_blob, right_blob)).fetchone()[0]
        finally:
            conn.close()
    return distance


def select_vector_backend(extension_path, *, probe=None, native_distance=None):
    if extension_path is None:
        return LinearVectorBackend()
    path = Path(extension_path)
    probe_fn = probe or _probe_sqlite_vec
    try:
        version = probe_fn(path)
    except Exception:
        return LinearVectorBackend(degraded_reason='sqlite-vec-unavailable')
    return SqliteVecBackend(path, version=version, native_distance=native_distance or _native_distance_from_extension(path))
