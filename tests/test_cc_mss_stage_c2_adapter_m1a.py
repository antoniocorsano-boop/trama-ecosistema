import importlib.util,unittest,httpx
from pathlib import Path
R=Path(__file__).resolve().parents[1];s=importlib.util.spec_from_file_location('m1',R/'scripts/cc_mss_stage_c2_adapter_m1a.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
REQ={'operation':'repo.read','method':'GET','scheme':'https','host':'api.github.com','path':'/repos/o/r','redirect':'DENY','credentialRef':'fixture:1'}
class CountingTransport(httpx.BaseTransport):
 def __init__(self):self.calls=0
 def handle_request(self,request):
  self.calls+=1
  return httpx.Response(200,headers={'content-type':'application/json'},content=b'{}',request=request)
class Allow:
 def authorize(self,r):return True
class T(unittest.TestCase):
 def test_default_interlock_prevents_transport(self):
  t=CountingTransport();x=m.M1ATransport(t,m.OfflineCredentialProvider())
  with self.assertRaisesRegex(m.M1AError,'LIVE_NOT_AUTHORIZED'):x.execute(REQ)
  self.assertEqual(t.calls,0);x.close()
 def test_injected_mock_only_can_exercise_composition(self):
  t=CountingTransport();x=m.M1ATransport(t,m.OfflineCredentialProvider(),Allow());status,enc,chunks=x.execute(REQ);self.assertEqual(status,200);self.assertEqual(enc,'identity');self.assertEqual(b''.join(chunks),b'{}');self.assertEqual(t.calls,1);x.close()
 def test_boundary_mutations(self):
  for k,v in [('method','POST'),('scheme','http'),('host','evil.example'),('redirect','FOLLOW')]:
   r=dict(REQ);r[k]=v
   with self.assertRaisesRegex(m.M1AError,'SOURCE_BOUNDARY_VIOLATION'):m.validate_request(r)
 def test_absolute_path_rejected(self):
  r=dict(REQ);r['path']='https://evil.example/x'
  with self.assertRaises(m.M1AError):m.validate_request(r)
 def test_real_credential_shape_rejected(self):
  with self.assertRaisesRegex(m.M1AError,'REAL_CREDENTIAL_FORBIDDEN'):m.OfflineCredentialProvider('ghp_secret')
 def test_non_fixture_ref_rejected(self):
  with self.assertRaisesRegex(m.M1AError,'CREDENTIAL_REF_NOT_OFFLINE'):m.OfflineCredentialProvider().get_secret('prod:1')
 def test_header_crlf_rejected(self):
  with self.assertRaisesRegex(m.M1AError,'HEADER_VALUE_INVALID'):m._headers('x\r\ny')
 def test_encoding_closed_world(self):
  self.assertEqual(m.validate_encoding(None),'identity');self.assertEqual(m.validate_encoding('deflate'),'deflate')
  for x in ('gzip','br','deflate, gzip'):
   with self.assertRaisesRegex(m.M1AError,'CONTENT_ENCODING_REJECTED'):m.validate_encoding(x)
 def test_redirect_classification(self):self.assertEqual(m.classify_status(302),'SOURCE_BOUNDARY_VIOLATION')
 def test_permission_classification(self):self.assertEqual(m.classify_status(403),'SOURCE_PERMISSION_UNVERIFIED')
 def test_policy_bounds(self):
  for p in (m.ClientPolicy(connect_timeout=0),m.ClientPolicy(read_timeout=31)):
   with self.assertRaisesRegex(m.M1AError,'CLIENT_POLICY_INVALID'):p.validate()
 def test_httpx_pin_expected(self):self.assertEqual(httpx.__version__,'0.28.1')
if __name__=='__main__':unittest.main()
