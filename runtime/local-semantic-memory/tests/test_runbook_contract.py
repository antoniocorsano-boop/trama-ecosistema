import json, sys, tempfile, threading, unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError

RUNTIME = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RUNTIME))


class FakeEmbeddingHandler(BaseHTTPRequestHandler):
    def log_message(self, *args): pass
    def do_POST(self):
        if self.path != '/v1/embeddings':
            self.send_response(404); self.end_headers(); return
        size = int(self.headers.get('Content-Length', '0'))
        payload = json.loads(self.rfile.read(size))
        text = payload.get('input', '').lower()
        if 'alpha' in text:
            vector = [1.0, 0.0]
        elif 'beta' in text:
            vector = [0.0, 1.0]
        else:
            vector = [0.5, 0.5]
        body = json.dumps({'model':'embeddinggemma-2-local','data':[{'embedding':vector}]}).encode()
        self.send_response(200); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body)


def call_json(base, path, *, token=None, origin='https://app.example.test', payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    headers = {'Origin': origin}
    if payload is not None: headers['Content-Type'] = 'application/json'
    if token is not None: headers['Authorization'] = f'Bearer {token}'
    req = Request(base + path, data=data, headers=headers, method='GET' if payload is None else 'POST')
    with urlopen(req, timeout=3) as resp:
        return resp.status, json.loads(resp.read())


def projection(source_id, revision, text):
    return {'schema':'trama.semantic-memory-projection/v1','sourceAppId':'smoke','sourceType':'doc','sourceId':source_id,
            'revision':revision,'namespace':'smoke','title':source_id,'text':text,'dataClass':'TEACHER_PROFESSIONAL',
            'canonicalRef':f'smoke://doc/{source_id}','updatedAt':'2026-10-30T20:00:00Z','metadata':{'test':'true'}}


class RunbookContractTests(unittest.TestCase):
    def test_runbook_and_launcher_exist_without_automatic_downloads(self):
        readme = (RUNTIME/'README.md').read_text(encoding='utf-8')
        launcher = (RUNTIME/'run_termux.sh').read_text(encoding='utf-8')
        self.assertIn('EmbeddingGemma 2', readme)
        self.assertIn('--embedding', readme)
        self.assertIn('127.0.0.1', readme)
        self.assertIn('loopback-network', readme)
        self.assertIn('gesto esplicito', readme.lower())
        self.assertIn('rebuild', readme.lower())
        self.assertNotIn('TRAMA_MEMORY_ALLOWED_ORIGINS=*', readme)
        for forbidden in ('curl | sh', 'curl|sh', 'wget | sh', 'wget|sh', '--model-url', ' -hf '):
            self.assertNotIn(forbidden, readme)
        self.assertIn('main.py', launcher)
        self.assertNotIn('curl', launcher)
        self.assertNotIn('wget', launcher)

    def test_end_to_end_smoke_persists_across_restart(self):
        from auth import load_or_create_local_token
        from config import load_runtime_config
        from main import build_service
        from server import create_server

        emb = ThreadingHTTPServer(('127.0.0.1', 0), FakeEmbeddingHandler)
        emb_thread = threading.Thread(target=emb.serve_forever, daemon=True); emb_thread.start()
        try:
            with tempfile.TemporaryDirectory() as td:
                env = {
                    'TRAMA_MEMORY_HOME': td,
                    'TRAMA_MEMORY_ALLOWED_ORIGINS': 'https://app.example.test',
                    'TRAMA_MEMORY_PORT': '0',
                    'TRAMA_EMBEDDING_URL': f'http://127.0.0.1:{emb.server_port}',
                    'TRAMA_EMBEDDING_MODEL': 'embeddinggemma-2-local',
                }
                cfg = load_runtime_config(env)
                token = load_or_create_local_token(cfg.token_file)

                def start():
                    service = build_service(cfg)
                    server = create_server(cfg, service)
                    thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
                    return server, thread, f'http://127.0.0.1:{server.server_port}'

                server, thread, base = start()
                try:
                    for sid, text in (('a','alpha material'),('b','beta material')):
                        status, body = call_json(base, '/v1/projections/upsert', token=token,
                            payload={'schema':'trama.semantic-memory-upsert-request/v1','projection':projection(sid,'r1',text),'expectedRevision':None})
                        self.assertEqual(status, 200); self.assertEqual(body['status'], 'inserted')
                    status, result = call_json(base, '/v1/search', token=token,
                        payload={'schema':'trama.semantic-memory-search-request/v1','query':'alpha','namespaces':['smoke'],'allowedDataClasses':['TEACHER_PROFESSIONAL'],'limit':2})
                    self.assertEqual(status, 200); self.assertEqual(result['hits'][0]['sourceId'], 'a')
                    status, body = call_json(base, '/v1/projections/upsert', token=token,
                        payload={'schema':'trama.semantic-memory-upsert-request/v1','projection':projection('a','r2','beta replacement'),'expectedRevision':'r1'})
                    self.assertEqual(body['status'], 'replaced')
                    status, body = call_json(base, '/v1/projections/remove', token=token,
                        payload={'schema':'trama.semantic-memory-remove-request/v1','source':{'sourceAppId':'smoke','sourceType':'doc','sourceId':'b'},'expectedRevision':'r1'})
                    self.assertEqual(body['status'], 'removed')
                finally:
                    server.shutdown(); server.server_close(); thread.join(timeout=2)

                server2, thread2, base2 = start()
                try:
                    status, result = call_json(base2, '/v1/search', token=token,
                        payload={'schema':'trama.semantic-memory-search-request/v1','query':'beta','namespaces':['smoke'],'allowedDataClasses':['TEACHER_PROFESSIONAL'],'limit':5})
                    self.assertEqual(status, 200)
                    self.assertEqual([h['sourceId'] for h in result['hits']], ['a'])
                    status, health = call_json(base2, '/v1/health')
                    self.assertEqual(status, 200); self.assertEqual(health['status'], 'ready')
                    self.assertEqual(health['modelId'], 'embeddinggemma-2-local')
                finally:
                    server2.shutdown(); server2.server_close(); thread2.join(timeout=2)
        finally:
            emb.shutdown(); emb.server_close(); emb_thread.join(timeout=2)


if __name__ == '__main__': unittest.main()
