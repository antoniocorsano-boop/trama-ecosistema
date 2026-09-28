import ast,unittest
FI={'socket','requests','urllib','urllib3','aiohttp','subprocess','os','importlib'}
FC={'post','put','patch','delete','merge','dispatch','upload','publish','system','popen','getenv','__import__','eval','exec'}
def findings(src):
 t=ast.parse(src);out=[]
 for n in ast.walk(t):
  if isinstance(n,(ast.Import,ast.ImportFrom)):
   names=[a.name.split('.')[0] for a in n.names] if isinstance(n,ast.Import) else [str(n.module or '').split('.')[0]]
   out += [x for x in names if x in FI]
  if isinstance(n,ast.Call):
   leaf=(n.func.attr if isinstance(n.func,ast.Attribute) else n.func.id if isinstance(n.func,ast.Name) else '').lower()
   if leaf in FC:out.append(leaf)
  if isinstance(n,ast.ClassDef):
   bases={(b.id if isinstance(b,ast.Name) else b.attr if isinstance(b,ast.Attribute) else '') for b in n.bases}
   if 'PermissionSource' in bases:out.append('concrete-permission-source')
 low=src.lower()
 for x in ('os.environ','trust_env=true','follow_redirects=true','verify=false','http2=true','proxy=','mounts=','cookies=','cookiejar'):
  if x in low:out.append(x)
 return out
class T(unittest.TestCase):
 def test_socket_alias(self):self.assertIn('socket',findings('import socket as s'))
 def test_requests(self):self.assertIn('requests',findings('import requests'))
 def test_subprocess(self):self.assertIn('subprocess',findings('from subprocess import run'))
 def test_environment(self):self.assertIn('os',findings('import os\nos.getenv("HTTPS_PROXY")'))
 def test_dynamic_import(self):self.assertIn('importlib',findings('import importlib\nimportlib.import_module("httpx")'))
 def test_dunder_import(self):self.assertIn('__import__',findings('__import__("socket")'))
 def test_exec(self):self.assertIn('exec',findings('exec("import socket")'))
 def test_remote_write(self):self.assertIn('upload',findings('client.upload(x)'))
 def test_follow_redirects(self):self.assertIn('follow_redirects=true',findings('httpx.Client(follow_redirects=True)'))
 def test_tls_bypass(self):self.assertIn('verify=false',findings('httpx.Client(verify=False)'))
 def test_env_trust(self):self.assertIn('trust_env=true',findings('httpx.Client(trust_env=True)'))
 def test_proxy(self):self.assertIn('proxy=',findings('httpx.Client(proxy="x")'))
 def test_mounts(self):self.assertIn('mounts=',findings('httpx.Client(mounts={})'))
 def test_cookies(self):self.assertIn('cookies=',findings('httpx.Client(cookies={})'))
 def test_concrete_permission_source(self):self.assertIn('concrete-permission-source',findings('class X(PermissionSource):\n pass'))
 def test_safe_profile(self):self.assertEqual(findings('httpx.Client(trust_env=False,follow_redirects=False,http2=False,verify=True)'),[])
if __name__=='__main__':unittest.main()
