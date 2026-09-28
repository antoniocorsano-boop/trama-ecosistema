import ast,unittest
FORBIDDEN_IMPORTS={'socket','requests','urllib','http','httpx','aiohttp','subprocess'};FORBIDDEN_CALLS={'post','patch','delete','merge','dispatch','upload','publish','remote_put'}
def findings(src):
 t=ast.parse(src);out=[]
 for n in ast.walk(t):
  if isinstance(n,(ast.Import,ast.ImportFrom)):
   ns=[a.name.split('.')[0] for a in n.names] if isinstance(n,ast.Import) else [str(n.module or '').split('.')[0]]
   out += [x for x in ns if x in FORBIDDEN_IMPORTS]
  if isinstance(n,ast.Call):
   leaf=(n.func.attr if isinstance(n.func,ast.Attribute) else n.func.id if isinstance(n.func,ast.Name) else '').lower()
   if leaf in FORBIDDEN_CALLS:out.append(leaf)
 return out
class T(unittest.TestCase):
 def test_network_import_detected(self):self.assertIn('requests',findings('import requests\nrequests.get("x")'))
 def test_subprocess_detected(self):self.assertIn('subprocess',findings('import subprocess'))
 def test_remote_put_detected(self):self.assertIn('remote_put',findings('sink.remote_put(x)'))
 def test_upload_detected(self):self.assertIn('upload',findings('client.upload(x)'))
 def test_local_ephemeral_put_allowed(self):self.assertEqual(findings('sink.put(x)'),[])
if __name__=='__main__':unittest.main()
