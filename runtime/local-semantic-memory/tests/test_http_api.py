import http.client, json, sys, tempfile, threading, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

class E:
    def __init__(self): self.fail=False; self.calls=0
    def embed(self,text):
        from embedding import EmbeddingResult
        self.calls += 1
        if self.fail: raise RuntimeError('secret internal embedding failure /tmp/private')
        return EmbeddingResult((1.0,0.0),'m1',2)

def projection(rev='r1', text='alpha'):
    return {'schema':'trama.semantic-memory-projection/v1','sourceAppId':'app','sourceType':'doc','sourceId':'1','revision':rev,'namespace':'n1','text':text,'dataClass':'TEACHER_PROFESSIONAL','canonicalRef':'app://doc/1','updatedAt':'2026-10-30T20:00:00Z'}
def upsert(p,expected=None): return {'schema':'trama.semantic-memory-upsert-request/v1','projection':p,'expectedRevision':expected}
def search(q='alpha'): return {'schema':'trama.semantic-memory-search-request/v1','query':q,'namespaces':['n1'],'allowedDataClasses':['TEACHER_PROFESSIONAL'],'limit':5}

class HttpApiTests(unittest.TestCase):
    def setUp(self):
        from config import load_runtime_config
        from storage import ProjectionStore
        from indexer import SemanticIndexer
        from search import SemanticSearchService
        from service import MemoryService
        from server import create_server
        self.td=tempfile.TemporaryDirectory(); self.cfg=load_runtime_config({'TRAMA_MEMORY_HOME':self.td.name,'TRAMA_MEMORY_ALLOWED_ORIGINS':'https://allowed.test','TRAMA_MEMORY_PORT':'0'})
        self.store=ProjectionStore(self.cfg.db_path); self.emb=E(); self.idx=SemanticIndexer(self.store,self.emb); self.svc=MemoryService(self.idx,SemanticSearchService(self.store,self.emb)); self.server=create_server(self.cfg,self.svc)
        self.thread=threading.Thread(target=self.server.serve_forever,daemon=True); self.thread.start(); self.port=self.server.server_port
        self.token=Path(self.cfg.token_file).read_text().strip()
    def tearDown(self): self.server.shutdown(); self.server.server_close(); self.thread.join(timeout=2); self.td.cleanup()
    def request(self,method,path,body=None,origin='https://allowed.test',auth=True,ctype='application/json'):
        c=http.client.HTTPConnection('127.0.0.1',self.port,timeout=3); headers={}
        if origin is not None: headers['Origin']=origin
        if auth: headers['Authorization']='Bearer '+self.token
        if body is not None:
            if isinstance(body,(dict,list)): body=json.dumps(body)
            headers['Content-Type']=ctype
        c.request(method,path,body=body,headers=headers); r=c.getresponse(); data=r.read(); hdr=dict(r.getheaders()); c.close()
        try: payload=json.loads(data) if data else None
        except Exception: payload=data.decode(errors='replace')
        return r.status,payload,hdr

    def test_auth_origin_and_cors(self):
        status,_,_=self.request('POST','/v1/search',search(),auth=False); self.assertEqual(status,401)
        status,_,_=self.request('POST','/v1/search',search(),origin='https://evil.test'); self.assertEqual(status,403)
        status,_,h=self.request('OPTIONS','/v1/search',None,auth=False); self.assertEqual(status,204); self.assertEqual(h.get('Access-Control-Allow-Origin'),'https://allowed.test'); self.assertEqual(h.get('Vary'),'Origin')

    def test_json_limits_validation_conflict_and_no_match(self):
        status,_,_=self.request('POST','/v1/search','{bad'); self.assertEqual(status,400)
        status,_,_=self.request('POST','/v1/search',search(),ctype='text/plain'); self.assertEqual(status,415)
        status,_,_=self.request('POST','/v1/search',{'bad':'schema'}); self.assertEqual(status,422)
        status,p,_=self.request('POST','/v1/search',search()); self.assertEqual(status,200); self.assertEqual(p['hits'],[])
        status,_,_=self.request('POST','/v1/projections/upsert',upsert(projection())); self.assertEqual(status,200)
        status,_,_=self.request('POST','/v1/projections/upsert',upsert(projection('r2','beta'),None)); self.assertEqual(status,409)
        c=http.client.HTTPConnection('127.0.0.1',self.port,timeout=3)
        c.putrequest('POST','/v1/search'); c.putheader('Origin','https://allowed.test'); c.putheader('Authorization','Bearer '+self.token); c.putheader('Content-Type','application/json'); c.putheader('Content-Length',str(1024*1024+1)); c.endheaders()
        r=c.getresponse(); r.read(); self.assertEqual(r.status,413); c.close()

    def test_technical_error_is_503_and_does_not_leak_details(self):
        self.emb.fail=True
        status,p,_=self.request('POST','/v1/projections/upsert',upsert(projection()))
        self.assertEqual(status,503); raw=json.dumps(p); self.assertNotIn('/tmp/private',raw); self.assertNotIn(self.token,raw); self.assertNotIn('Traceback',raw)
        self.assertIsNone(self.store.get_projection(('app','doc','1')))

    def test_method_path_and_health_are_bounded(self):
        status,p,_=self.request('GET','/v1/health',None,auth=False); self.assertEqual(status,200); self.assertEqual(p['protocolVersion'],1); self.assertNotIn('dbPath',p); self.assertNotIn('token',p)
        self.assertEqual(self.request('GET','/v1/search',None,auth=False)[0],405)
        self.assertEqual(self.request('POST','/v1/health',{},auth=True)[0],405)
        self.assertEqual(self.request('POST','/v1/unknown',{},auth=True)[0],404)

if __name__=='__main__': unittest.main()
