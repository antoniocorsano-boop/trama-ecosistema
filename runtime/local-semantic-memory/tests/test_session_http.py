import http.client
import json
import sys
import tempfile
import threading
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


READY_HEALTH = {
    'schema': 'trama.semantic-memory-health/v1',
    'status': 'ready',
    'protocolVersion': 1,
    'modelId': 'embeddinggemma-2-local',
    'dimensions': 768,
    'indexRevision': '1',
}


class _Service:
    def __init__(self):
        self.fail_health = False
        self.health_calls = 0
        self.search_calls = 0

    def health(self):
        self.health_calls += 1
        if self.fail_health:
            raise RuntimeError('health unavailable')
        return dict(READY_HEALTH)

    def search(self, payload):
        self.search_calls += 1
        return {
            'schema': 'trama.semantic-memory-search-response/v1',
            'hits': [],
        }


class SessionHttpTests(unittest.TestCase):
    def setUp(self):
        from config import load_runtime_config
        from server import create_server

        self.td = tempfile.TemporaryDirectory()
        self.cfg = load_runtime_config({
            'TRAMA_MEMORY_HOME': self.td.name,
            'TRAMA_MEMORY_ALLOWED_ORIGINS': 'http://127.0.0.1:4173',
            'TRAMA_MEMORY_PORT': '0',
            'TRAMA_MEMORY_SESSION_TTL_SECONDS': '3600',
        })
        self.svc = _Service()
        self.server = create_server(self.cfg, self.svc)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.port = self.server.server_port
        self.master_token = Path(self.cfg.token_file).read_text().strip()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        self.td.cleanup()

    def request(
        self,
        method,
        path,
        *,
        origin='http://127.0.0.1:4173',
        auth_token=None,
        body=None,
    ):
        connection = http.client.HTTPConnection('127.0.0.1', self.port, timeout=3)
        headers = {}
        if origin is not None:
            headers['Origin'] = origin
        if auth_token is not None:
            headers['Authorization'] = 'Bearer ' + auth_token
        if body is not None:
            headers['Content-Type'] = 'application/json'
            body = json.dumps(body)
        connection.request(method, path, body=body, headers=headers)
        response = connection.getresponse()
        raw = response.read()
        headers_out = dict(response.getheaders())
        connection.close()
        payload = json.loads(raw) if raw else None
        return response.status, payload, headers_out

    def test_session_requires_explicit_allowed_origin(self):
        self.assertEqual(self.request('POST', '/v1/session', origin=None)[0], 403)
        self.assertEqual(self.request('POST', '/v1/session', origin='https://evil.test')[0], 403)
        self.assertEqual(self.server.runtime_sessions.active_count(), 0)
        self.assertEqual(self.svc.health_calls, 0)

    def test_session_returns_ephemeral_capability_and_health(self):
        status, payload, headers = self.request('POST', '/v1/session')

        self.assertEqual(status, 200)
        self.assertEqual(payload['schema'], 'trama.semantic-memory-session/v1')
        self.assertGreaterEqual(len(payload['token']), 43)
        self.assertTrue(payload['expiresAt'].endswith('Z'))
        self.assertEqual(payload['health'], READY_HEALTH)
        self.assertEqual(headers.get('Access-Control-Allow-Origin'), 'http://127.0.0.1:4173')
        self.assertEqual(headers.get('Vary'), 'Origin')
        self.assertEqual(self.server.runtime_sessions.active_count(), 1)
        self.assertEqual(self.svc.health_calls, 1)

    def test_session_health_failure_does_not_issue_capability(self):
        self.svc.fail_health = True
        status, payload, _ = self.request('POST', '/v1/session')

        self.assertEqual(status, 503)
        self.assertEqual(payload, {'error': 'service_unavailable'})
        self.assertEqual(self.server.runtime_sessions.active_count(), 0)
        self.assertEqual(self.svc.health_calls, 1)

    def test_session_options_uses_exact_cors_origin(self):
        status, _, headers = self.request('OPTIONS', '/v1/session')
        self.assertEqual(status, 204)
        self.assertEqual(headers.get('Access-Control-Allow-Origin'), 'http://127.0.0.1:4173')
        self.assertIn('POST', headers.get('Access-Control-Allow-Methods', ''))

    def test_session_capability_authorizes_only_same_origin(self):
        status, session, _ = self.request('POST', '/v1/session')
        self.assertEqual(status, 200)
        capability = session['token']

        status, payload, _ = self.request(
            'POST',
            '/v1/search',
            auth_token=capability,
            body={'probe': True},
        )
        self.assertEqual(status, 200)
        self.assertEqual(payload['schema'], 'trama.semantic-memory-search-response/v1')
        self.assertEqual(self.svc.search_calls, 1)

        self.assertEqual(self.request(
            'POST',
            '/v1/search',
            origin=None,
            auth_token=capability,
            body={'probe': True},
        )[0], 401)
        self.assertEqual(self.request(
            'POST',
            '/v1/search',
            origin='https://evil.test',
            auth_token=capability,
            body={'probe': True},
        )[0], 403)
        self.assertEqual(self.svc.search_calls, 1)

    def test_master_token_still_authorizes_without_origin(self):
        status, payload, _ = self.request(
            'POST',
            '/v1/search',
            origin=None,
            auth_token=self.master_token,
            body={'probe': True},
        )
        self.assertEqual(status, 200)
        self.assertEqual(payload['schema'], 'trama.semantic-memory-search-response/v1')
        self.assertEqual(self.svc.search_calls, 1)


if __name__ == '__main__':
    unittest.main()
