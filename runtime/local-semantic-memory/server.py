from __future__ import annotations
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json, socket
from auth import load_or_create_local_token, bearer_matches
from contracts import ValidationError, RevisionConflictError, RebuildRequiredError, EmbeddingError, StorageError
from session_auth import SessionCapabilityStore
POST_ROUTES={'/v1/projections/upsert':'upsert','/v1/projections/remove':'remove','/v1/search':'search'}
SESSION_PATH='/v1/session'
KNOWN_PATHS={'/v1/health',SESSION_PATH,*POST_ROUTES.keys()}
class _ThreadingHTTPServerV6(ThreadingHTTPServer):
    address_family=socket.AF_INET6
class _Handler(BaseHTTPRequestHandler):
    server_version='trama-memoryd/0.1'
    def log_message(self,fmt,*args): return
    @property
    def cfg(self): return self.server.runtime_config
    @property
    def svc(self): return self.server.runtime_service
    @property
    def token(self): return self.server.runtime_token
    @property
    def sessions(self): return self.server.runtime_sessions
    def _origin_ok(self):
        origin=self.headers.get('Origin'); return origin is None or origin in self.cfg.allowed_origins
    def _session_origin(self):
        origin=self.headers.get('Origin')
        return origin if origin and origin in self.cfg.allowed_origins else None
    def _cors(self):
        origin=self.headers.get('Origin')
        if origin and origin in self.cfg.allowed_origins: self.send_header('Access-Control-Allow-Origin',origin); self.send_header('Vary','Origin')
    def _json(self,status,payload):
        body=json.dumps(payload,separators=(',',':'),ensure_ascii=False).encode('utf-8'); self.send_response(status); self._cors(); self.send_header('Content-Type','application/json; charset=utf-8'); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body)
    def _error(self,status,code): self._json(status,{'error':code})
    def _read_json(self):
        ctype=(self.headers.get('Content-Type') or '').split(';',1)[0].strip().lower()
        if ctype!='application/json': raise _HttpProblem(415,'content_type_required')
        raw_len=self.headers.get('Content-Length')
        if raw_len is None: raise _HttpProblem(411,'content_length_required')
        try: size=int(raw_len)
        except ValueError: raise _HttpProblem(400,'invalid_content_length')
        if size<0: raise _HttpProblem(400,'invalid_content_length')
        if size>self.cfg.max_body_bytes: raise _HttpProblem(413,'payload_too_large')
        raw=self.rfile.read(size)
        try: return json.loads(raw.decode('utf-8'))
        except (UnicodeDecodeError,json.JSONDecodeError): raise _HttpProblem(400,'invalid_json')
    def do_GET(self):
        if self.path in POST_ROUTES or self.path==SESSION_PATH: return self._error(405,'method_not_allowed')
        if self.path!='/v1/health': return self._error(404,'not_found')
        if not self._origin_ok(): return self._error(403,'origin_forbidden')
        try: payload=self.svc.health()
        except Exception: return self._error(503,'service_unavailable')
        return self._json(200,payload)
    def do_OPTIONS(self):
        if self.path not in KNOWN_PATHS: return self._error(404,'not_found')
        if self.path==SESSION_PATH:
            if self._session_origin() is None: return self._error(403,'origin_forbidden')
        elif not self._origin_ok(): return self._error(403,'origin_forbidden')
        self.send_response(204); self._cors(); self.send_header('Access-Control-Allow-Headers','Authorization, Content-Type'); self.send_header('Access-Control-Allow-Methods','GET, POST, OPTIONS'); self.end_headers()
    def do_POST(self):
        if self.path=='/v1/health': return self._error(405,'method_not_allowed')
        if self.path==SESSION_PATH:
            origin=self._session_origin()
            if origin is None: return self._error(403,'origin_forbidden')
            try: health=self.svc.health()
            except Exception: return self._error(503,'service_unavailable')
            capability=self.sessions.issue(origin)
            expires_at=datetime.fromtimestamp(capability.expires_at_epoch,tz=timezone.utc).isoformat().replace('+00:00','Z')
            return self._json(200,{
                'schema':'trama.semantic-memory-session/v1',
                'token':capability.token,
                'expiresAt':expires_at,
                'health':health,
            })
        method=POST_ROUTES.get(self.path)
        if method is None: return self._error(404,'not_found')
        if not self._origin_ok(): return self._error(403,'origin_forbidden')
        if not bearer_matches(self.headers.get('Authorization'),self.token): return self._error(401,'unauthorized')
        try: payload=self._read_json(); result=getattr(self.svc,method)(payload)
        except _HttpProblem as exc: return self._error(exc.status,exc.code)
        except ValidationError: return self._error(422,'invalid_request')
        except RevisionConflictError: return self._error(409,'revision_conflict')
        except (RebuildRequiredError,EmbeddingError,StorageError): return self._error(503,'service_unavailable')
        except Exception: return self._error(503,'service_unavailable')
        return self._json(200,result)
class _HttpProblem(Exception):
    def __init__(self,status,code): super().__init__(code); self.status=status; self.code=code
def create_server(config, service):
    token=load_or_create_local_token(config.token_file)
    sessions=SessionCapabilityStore(config.session_ttl_seconds)
    server_cls=_ThreadingHTTPServerV6 if config.host=='::1' else ThreadingHTTPServer
    server=server_cls((config.host,config.port),_Handler)
    server.runtime_config=config; server.runtime_service=service; server.runtime_token=token; server.runtime_sessions=sessions
    return server
