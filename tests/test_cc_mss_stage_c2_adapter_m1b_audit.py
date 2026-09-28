import ast,unittest
FI={'socket','httpx','httpcore','requests','urllib','urllib3','aiohttp','subprocess','os','importlib','ssl'}
FC={'open','post','put','patch','delete','send','request','connect','urlopen','system','popen','getenv','__import__','eval','exec'}
def findings(src):
 out=[];t=ast.parse(src)
 for n in ast.walk(t):
  if isinstance(n,(ast.Import,ast.ImportFrom)):
   names=[a.name.split('.')[0] for a in n.names] if isinstance(n,ast.Import) else [str(n.module or '').split('.')[0]]
   out += [x for x in names if x in FI]
  if isinstance(n,ast.Call):
   leaf=(n.func.attr if isinstance(n.func,ast.Attribute) else n.func.id if isinstance(n.func,ast.Name) else '').lower()
   if leaf in FC:out.append(leaf)
 low=src.lower()
 for x in ('api.github.com','https://','http://','os.environ','.env','github_pat_','ghp_','live_one_shot'):
  if x in low:out.append(x)
 return out
class T(unittest.TestCase):
 def test_socket(self):self.assertIn('socket',findings('import socket'))
 def test_httpx(self):self.assertIn('httpx',findings('import httpx'))
 def test_requests(self):self.assertIn('requests',findings('import requests'))
 def test_ssl(self):self.assertIn('ssl',findings('import ssl'))
 def test_subprocess(self):self.assertIn('subprocess',findings('from subprocess import run'))
 def test_os_environment(self):self.assertIn('os',findings('import os\nos.getenv("TOKEN")'))
 def test_dynamic_import(self):self.assertIn('importlib',findings('import importlib\nimportlib.import_module("httpx")'))
 def test_dunder_import(self):self.assertIn('__import__',findings('__import__("socket")'))
 def test_send(self):self.assertIn('send',findings('client.send(req)'))
 def test_connect(self):self.assertIn('connect',findings('client.connect()'))
 def test_url_literal(self):self.assertIn('https://',findings('u="https://api.github.com"'))
 def test_real_token_shape(self):self.assertIn('ghp_',findings('token="ghp_secret"'))
 def test_live_mode_literal(self):self.assertIn('live_one_shot',findings('mode="LIVE_ONE_SHOT"'))
 def test_safe_state_model(self):self.assertEqual(findings('state="CLAIMED"\nremaining=3'),[])
if __name__=='__main__':unittest.main()
