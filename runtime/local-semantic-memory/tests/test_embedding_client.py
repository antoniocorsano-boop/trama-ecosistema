import json, math, sys, threading, unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

class FakeHandler(BaseHTTPRequestHandler):
    response = {'model':'local-model','data':[{'embedding':[0.1,0.2,0.3]}]}
    status = 200
    calls = 0
    def log_message(self,*a): pass
    def do_POST(self):
        type(self).calls += 1
        self.assert_path = self.path
        n=int(self.headers.get('Content-Length','0')); self.rfile.read(n)
        body=json.dumps(type(self).response).encode(); self.send_response(type(self).status)
        self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body)

class EmbeddingClientTests(unittest.TestCase):
    def setUp(self):
        FakeHandler.calls=0; FakeHandler.status=200; FakeHandler.response={'model':'local-model','data':[{'embedding':[0.1,0.2,0.3]}]}
        self.server=ThreadingHTTPServer(('127.0.0.1',0),FakeHandler); threading.Thread(target=self.server.serve_forever,daemon=True).start()
    def tearDown(self): self.server.shutdown(); self.server.server_close()
    def test_loopback_embedding_preserves_model_and_dimensions(self):
        from embedding import LocalEmbeddingClient
        c=LocalEmbeddingClient(f'http://127.0.0.1:{self.server.server_port}','configured',timeout=2)
        r=c.embed('hello')
        self.assertEqual(r.model_id,'local-model'); self.assertEqual(r.dimensions,3); self.assertEqual(tuple(r.vector),(0.1,0.2,0.3)); self.assertEqual(FakeHandler.calls,1)
    def test_remote_url_rejected_before_network(self):
        from embedding import LocalEmbeddingClient
        from contracts import EmbeddingError
        with self.assertRaises(EmbeddingError): LocalEmbeddingClient('https://api.example.com','x')
    def test_invalid_vectors_and_http_failures_are_technical_errors(self):
        from embedding import LocalEmbeddingClient
        from contracts import EmbeddingError
        c=LocalEmbeddingClient(f'http://127.0.0.1:{self.server.server_port}','configured',timeout=2)
        for bad in ([], ['x'], [float('inf')]):
            FakeHandler.response={'data':[{'embedding':bad}]}
            with self.assertRaises(EmbeddingError): c.embed('x')
        FakeHandler.status=500; FakeHandler.response={'error':'boom'}
        with self.assertRaises(EmbeddingError): c.embed('x')

if __name__ == '__main__': unittest.main()
