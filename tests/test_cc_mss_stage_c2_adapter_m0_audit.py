import ast,unittest
FI={'socket','requests','urllib','http','httpx','aiohttp','subprocess','os','importlib'};FC={'post','put','patch','delete','merge','dispatch','upload','publish','remote_put','system','popen','getenv','__import__','eval','exec'}
def f(src):
 t=ast.parse(src);o=[]
 for n in ast.walk(t):
  if isinstance(n,(ast.Import,ast.ImportFrom)):
   ns=[a.name.split('.')[0] for a in n.names] if isinstance(n,ast.Import) else [str(n.module or '').split('.')[0]];o += [x for x in ns if x in FI]
  if isinstance(n,ast.Call):
   leaf=(n.func.attr if isinstance(n.func,ast.Attribute) else n.func.id if isinstance(n.func,ast.Name) else '').lower()
   if leaf in FC:o.append(leaf)
  if isinstance(n,ast.ClassDef):
   bases={(b.id if isinstance(b,ast.Name) else b.attr if isinstance(b,ast.Attribute) else '') for b in n.bases}
   if bases&{'Transport','PermissionSource'}:o.append('concrete-protocol')
 return o
class T(unittest.TestCase):
 def test_requests(self):self.assertIn('requests',f('import requests'))
 def test_socket_alias(self):self.assertIn('socket',f('import socket as s'))
 def test_subprocess_from_alias(self):self.assertIn('subprocess',f('from subprocess import run as r'))
 def test_env(self):self.assertIn('os',f('import os\nos.getenv("TOKEN")'))
 def test_importlib(self):self.assertIn('importlib',f('import importlib\nimportlib.import_module("requests")'))
 def test_dunder_import(self):self.assertIn('__import__',f('__import__("requests")'))
 def test_dynamic_exec(self):self.assertIn('exec',f('exec("import requests")'))
 def test_remote_write(self):self.assertIn('upload',f('x.upload(y)'))
 def test_concrete_transport(self):self.assertIn('concrete-protocol',f('class X(Transport):\n def execute(self,a,b): pass'))
 def test_concrete_permission_source(self):self.assertIn('concrete-protocol',f('class X(PermissionSource):\n def observed_permissions(self,r): return {}'))
 def test_protocol_execute_allowed(self):self.assertEqual(f('x.execute(y)'),[])
if __name__=='__main__':unittest.main()
