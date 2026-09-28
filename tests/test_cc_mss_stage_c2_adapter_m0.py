import importlib.util,json,unittest,zlib
from pathlib import Path
R=Path(__file__).resolve().parents[1];s=importlib.util.spec_from_file_location('m0',R/'scripts/cc_mss_stage_c2_adapter_m0.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class T(unittest.TestCase):
 def test_repo_descriptor(self):
  r=m.request('repo.read','owner','repo','cred:1');self.assertEqual((r['method'],r['host'],r['redirect']),('GET','api.github.com','DENY'))
 def test_ref_descriptor(self):self.assertIn('/heads/main',m.request('ref.read','owner','repo','cred:1',ref='main')['path'])
 def test_commit_descriptor(self):self.assertTrue(m.request('commit.read','owner','repo','cred:1',sha='a'*40)['path'].endswith('a'*40))
 def test_unknown_operation(self):
  with self.assertRaisesRegex(m.M0Error,'UNKNOWN_OPERATION'):m.request('workflow.read','o','r','cred:1')
 def test_absolute_injection(self):
  with self.assertRaisesRegex(m.M0Error,'PATH_INPUT_INVALID'):m.request('repo.read','https://evil.example','r','cred:1')
 def test_traversal(self):
  with self.assertRaisesRegex(m.M0Error,'PATH_INPUT_INVALID'):m.request('ref.read','o','r','cred:1',ref='../x')
 def test_query_fragment_control(self):
  for x in ('main?x=1','main#x','main\nX: y','main%2Fetc'):
   with self.assertRaises(m.M0Error):m.request('ref.read','o','r','cred:1',ref=x)
 def test_bad_sha(self):
  with self.assertRaises(m.M0Error):m.request('commit.read','o','r','cred:1',sha='HEAD')
 def test_token_not_ref(self):
  with self.assertRaisesRegex(m.M0Error,'CREDENTIAL_REF_INVALID'):m.request('repo.read','o','r','ghp_secret')
 def test_bounded_plain(self):self.assertEqual(m.bounded_json([b'{"a":1}']),{'a':1})
 def test_bounded_compressed_bomb(self):
  b=zlib.compress(json.dumps({'x':'z'*5000}).encode())
  with self.assertRaisesRegex(m.M0Error,'SOURCE_RESOURCE_LIMIT_EXCEEDED'):m.bounded_json([b],m.Limits(1000,100,1000,32),True)
 def test_truncated_compressed_rejected(self):
  b=zlib.compress(b'{"a":1}')
  with self.assertRaisesRegex(m.M0Error,'MALFORMED_RESPONSE'):m.bounded_json([b[:-1]],compressed=True)
 def test_complete_compressed_accepted(self):
  b=zlib.compress(b'{"a":1}');self.assertEqual(m.bounded_json([b],compressed=True),{'a':1})
 def test_malformed(self):
  with self.assertRaisesRegex(m.M0Error,'MALFORMED_RESPONSE'):m.bounded_json([b'{bad'])
 def test_depth(self):
  x='0'
  for _ in range(8):x='['+x+']'
  with self.assertRaisesRegex(m.M0Error,'SOURCE_RESOURCE_LIMIT_EXCEEDED'):m.bounded_json([x.encode()],m.Limits(1000,1000,1000,3))
 def test_invalid_limits(self):
  for lim in (m.Limits(0,1,1,1),m.Limits(1,-1,1,1),m.Limits(1,1,0,1),m.Limits(1,1,1,0)):
   with self.assertRaisesRegex(m.M0Error,'RESOURCE_POLICY_INVALID'):m.bounded_json([b'{}'],lim)
 def test_session_budget_cumulative(self):
  s=m.SessionBudget(12);lim=m.Limits(100,100,12,32);m.bounded_json([b'{"a":1}'],lim,session=s)
  with self.assertRaisesRegex(m.M0Error,'SOURCE_RESOURCE_LIMIT_EXCEEDED'):m.bounded_json([b'{"b":2}'],lim,session=s)
 def test_permission_source_is_protocol(self):self.assertTrue(hasattr(m.PermissionSource,'observed_permissions'))
 def test_transport_is_protocol(self):self.assertTrue(hasattr(m.Transport,'execute'))
if __name__=='__main__':unittest.main()
