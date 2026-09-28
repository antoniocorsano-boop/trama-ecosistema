import ast,unittest
FI={'socket','requests','urllib','http','httpx','aiohttp','subprocess','os'};FC={'post','put','patch','delete','merge','dispatch','upload','publish','remote_put','system','popen','getenv'}
def f(src):
 t=ast.parse(src);o=[]
 for n in ast.walk(t):
  if isinstance(n,(ast.Import,ast.ImportFrom)):
   ns=[a.name.split('.')[0] for a in n.names] if isinstance(n,ast.Import) else [str(n.module or '').split('.')[0]];o += [x for x in ns if x in FI]
  if isinstance(n,ast.Call):
   leaf=(n.func.attr if isinstance(n.func,ast.Attribute) else n.func.id if isinstance(n.func,ast.Name) else '').lower()
   if leaf in FC:o.append(leaf)
 return o
class T(unittest.TestCase):
 def test_requests(self):self.assertIn('requests',f('import requests'))
 def test_socket(self):self.assertIn('socket',f('import socket'))
 def test_subprocess(self):self.assertIn('subprocess',f('import subprocess'))
 def test_env(self):self.assertIn('os',f('import os\nos.getenv("TOKEN")'))
 def test_remote_write(self):self.assertIn('upload',f('x.upload(y)'))
 def test_protocol_execute_allowed(self):self.assertEqual(f('x.execute(y)'),[])
if __name__=='__main__':unittest.main()
