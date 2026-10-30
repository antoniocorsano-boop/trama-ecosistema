from __future__ import annotations
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from auth import load_or_create_local_token, bearer_matches

class _Handler(BaseHTTPRequestHandler):
    server_version = 'trama-memoryd/0.1'
    def log_message(self, fmt, *args):
        return
    @property
    def cfg(self): return self.server.runtime_config
    @property
    def svc(self): return self.server.runtime_service
    @property
    def token(self): return self.server.runtime_token
    def _origin_ok(self):
        origin = self.headers.get('Origin')
        return origin is None or origin in self.cfg.allowed_origins
    def _cors(self):
        origin = self.headers.get('Origin')
        if origin and origin in self.cfg.allowed_origins:
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Vary', 'Origin')
    def _json(self, status, payload):
        body = json.dumps(payload, separators=(',',':')).encode()
        self.send_response(status)
        self._cors()
        self.send_header('Content-Type','application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers(); self.wfile.write(body)
    def do_GET(self):
        if self.path != '/v1/health': return self._json(404, {'error':'not_found'})
        if not self._origin_ok(): return self._json(403, {'error':'origin_forbidden'})
        data = self.svc.health()
        safe = {k:v for k,v in data.items() if k not in {'token','dbPath','tokenFile','path'}}
        return self._json(200, safe)
    def do_OPTIONS(self):
        if not self._origin_ok(): return self._json(403, {'error':'origin_forbidden'})
        self.send_response(204); self._cors()
        self.send_header('Access-Control-Allow-Headers','Authorization, Content-Type')
        self.send_header('Access-Control-Allow-Methods','GET, POST, OPTIONS')
        self.end_headers()
    def do_POST(self):
        if not self._origin_ok(): return self._json(403, {'error':'origin_forbidden'})
        if not bearer_matches(self.headers.get('Authorization'), self.token):
            return self._json(401, {'error':'unauthorized'})
        return self._json(404, {'error':'not_found'})

def create_server(config, service):
    token = load_or_create_local_token(config.token_file)
    server = ThreadingHTTPServer((config.host, config.port), _Handler)
    server.runtime_config = config
    server.runtime_service = service
    server.runtime_token = token
    return server
