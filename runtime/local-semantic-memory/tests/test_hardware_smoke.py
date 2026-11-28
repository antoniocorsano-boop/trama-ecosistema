import importlib
import json
import unittest


class FakeTransport:
    def __init__(self):
        self.generation = 1
        self.session_count = 0
        self.projection = None
        self.requests = []
        self.fail_first_search = False
        self.fail_after_upsert_commit = False
        self.fail_remove = False
        self.empty_health_until_upsert = False
        self.search_calls = 0

    def restart(self):
        self.generation += 1

    def _health(self):
        uninitialized = self.empty_health_until_upsert and self.projection is None
        return {
            'schema': 'trama.semantic-memory-health/v1',
            'status': 'ready',
            'protocolVersion': 1,
            'modelId': None if uninitialized else 'embeddinggemma-2-local',
            'dimensions': None if uninitialized else 768,
            'indexRevision': '7',
        }

    def request(self, method, url, *, origin=None, bearer=None, payload=None, timeout_seconds=10):
        path = '/' + url.split('/', 3)[3] if url.count('/') >= 3 else '/'
        self.requests.append({
            'method': method,
            'path': path,
            'origin': origin,
            'bearer': bearer,
            'payload': payload,
        })
        if method == 'GET' and path == '/v1/health':
            return 200, self._health(), {}
        if method == 'POST' and path == '/v1/session':
            self.session_count += 1
            token = f'cap-{self.generation}-{self.session_count}'
            return 200, {
                'schema': 'trama.semantic-memory-session/v1',
                'token': token,
                'expiresAt': '2026-11-01T12:00:00Z',
                'health': self._health(),
            }, {'Access-Control-Allow-Origin': origin}

        expected = None
        for item in reversed(self.requests):
            if item['path'] == '/v1/session':
                expected = f'cap-{self.generation}-{self.session_count}'
                break
        if bearer != expected:
            return 401, {'error': 'unauthorized'}, {}

        if method == 'POST' and path == '/v1/projections/upsert':
            self.projection = payload['projection']
            if self.fail_after_upsert_commit:
                raise RuntimeError('simulated response loss after committed upsert')
            return 200, {
                'schema': 'trama.semantic-memory-upsert-receipt/v1',
                'status': 'indexed',
                'source': {
                    'sourceAppId': self.projection['sourceAppId'],
                    'sourceType': self.projection['sourceType'],
                    'sourceId': self.projection['sourceId'],
                },
                'revision': self.projection['revision'],
            }, {}
        if method == 'POST' and path == '/v1/search':
            self.search_calls += 1
            if self.fail_first_search and self.search_calls == 1:
                return 503, {'error': 'service_unavailable'}, {}
            hits = [] if self.projection is None else [{
                'sourceAppId': self.projection['sourceAppId'],
                'sourceType': self.projection['sourceType'],
                'sourceId': self.projection['sourceId'],
                'revision': self.projection['revision'],
                'namespace': self.projection['namespace'],
                'canonicalRef': self.projection['canonicalRef'],
                'chunkId': 'chunk-1',
                'text': self.projection['text'],
                'score': 0.91,
                'dataClass': self.projection['dataClass'],
                'metadata': self.projection.get('metadata', {}),
            }]
            return 200, {'schema': 'trama.semantic-memory-search-response/v1', 'hits': hits}, {}
        if method == 'POST' and path == '/v1/projections/remove':
            if self.fail_remove:
                return 503, {'error': 'cleanup_unavailable'}, {}
            self.projection = None
            return 200, {
                'schema': 'trama.semantic-memory-remove-receipt/v1',
                'status': 'removed',
            }, {}
        return 404, {'error': 'not_found'}, {}


class FakeControl:
    def __init__(self, transport):
        self.transport = transport
        self.restarts = 0

    def restart_memoryd(self):
        self.restarts += 1
        self.transport.restart()


class HardwareSmokeContractTests(unittest.TestCase):
    def setUp(self):
        self.module = importlib.import_module('hardware_smoke')

    def test_generated_payloads_pass_canonical_runtime_validators(self):
        contracts = importlib.import_module('contracts')
        contracts.validate_upsert_request(self.module._upsert_payload())
        contracts.validate_search_request(self.module._search_payload())
        contracts.validate_remove_request(self.module._remove_payload())

    def test_smoke_qualifies_session_search_restart_persistence_and_cleanup_without_leaking_capability(self):
        transport = FakeTransport()
        control = FakeControl(transport)
        report = self.module.run_smoke(
            base_url='http://127.0.0.1:8765',
            origin='http://127.0.0.1:4174',
            control=control,
            transport=transport,
        )

        self.assertTrue(report['passed'])
        self.assertEqual(report['modelId'], 'embeddinggemma-2-local')
        self.assertEqual(report['dimensions'], 768)
        self.assertEqual(report['cleanup'], 'removed')
        self.assertEqual(control.restarts, 1)
        self.assertIsNone(transport.projection)

        session_requests = [r for r in transport.requests if r['path'] == '/v1/session']
        self.assertGreaterEqual(len(session_requests), 2)
        self.assertTrue(all(r['bearer'] is None for r in session_requests))

        unauthorized = [
            r for r in transport.requests
            if r['path'] == '/v1/search' and r['bearer'] and r['bearer'].startswith('cap-1-')
        ]
        self.assertGreaterEqual(len(unauthorized), 2)

        serialized = json.dumps(report, sort_keys=True)
        self.assertNotIn('cap-', serialized)
        self.assertNotIn('Bearer', serialized)

    def test_smoke_accepts_ready_uninitialized_index_before_first_upsert(self):
        transport = FakeTransport()
        transport.empty_health_until_upsert = True
        control = FakeControl(transport)

        report = self.module.run_smoke(
            base_url='http://127.0.0.1:8765',
            origin='http://127.0.0.1:4174',
            control=control,
            transport=transport,
        )

        self.assertTrue(report['passed'])
        self.assertEqual(report['modelId'], 'embeddinggemma-2-local')
        self.assertEqual(report['dimensions'], 768)
        self.assertEqual(report['cleanup'], 'removed')

    def test_smoke_attempts_cleanup_when_a_post_upsert_check_fails(self):
        transport = FakeTransport()
        transport.fail_first_search = True
        control = FakeControl(transport)
        with self.assertRaises(self.module.SmokeFailure):
            self.module.run_smoke(
                base_url='http://127.0.0.1:8765',
                origin='http://127.0.0.1:4174',
                control=control,
                transport=transport,
            )
        self.assertIsNone(transport.projection)

    def test_smoke_cleans_up_when_upsert_commits_but_response_is_lost(self):
        transport = FakeTransport()
        transport.fail_after_upsert_commit = True
        control = FakeControl(transport)
        with self.assertRaises(self.module.SmokeFailure):
            self.module.run_smoke(
                base_url='http://127.0.0.1:8765',
                origin='http://127.0.0.1:4174',
                control=control,
                transport=transport,
            )
        self.assertIsNone(transport.projection)
        self.assertTrue(any(r['path'] == '/v1/projections/remove' for r in transport.requests))

    def test_smoke_surfaces_cleanup_failure_alongside_primary_failure(self):
        transport = FakeTransport()
        transport.fail_first_search = True
        transport.fail_remove = True
        control = FakeControl(transport)
        with self.assertRaisesRegex(self.module.SmokeFailure, '(?i:cleanup)') as raised:
            self.module.run_smoke(
                base_url='http://127.0.0.1:8765',
                origin='http://127.0.0.1:4174',
                control=control,
                transport=transport,
            )
        self.assertIn('503', str(raised.exception))
        self.assertIsNotNone(transport.projection)

    def test_cli_exposes_smoke_as_a_single_command(self):
        cli = importlib.import_module('trama_memory')
        parser = cli.build_parser()
        args = parser.parse_args(['smoke', '--home', '/tmp/home', '--prefix', '/tmp/usr'])
        self.assertEqual(args.command, 'smoke')


if __name__ == '__main__':
    unittest.main()
