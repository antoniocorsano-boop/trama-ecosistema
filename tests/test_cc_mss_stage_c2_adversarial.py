import importlib.util,json,runpy,socket,subprocess,sys,unittest,zlib
from pathlib import Path
R=Path(__file__).resolve().parents[1]
def load(name,path):
 s=importlib.util.spec_from_file_location(name,R/path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
safety=load('c2s','scripts/cc_mss_stage_c2_safety.py');qual=load('c2q','scripts/qualify_cc_mss_stage_c2_pre_live.py')
class T(unittest.TestCase):
 def test_network_guard_actually_blocks(self):
  old=(socket.socket,socket.create_connection,socket.getaddrinfo);socket.socket=qual.deny;socket.create_connection=qual.deny;socket.getaddrinfo=qual.deny
  try:
   with self.assertRaises(qual.NetworkForbidden):socket.create_connection(('api.github.com',443))
  finally:socket.socket,socket.create_connection,socket.getaddrinfo=old
 def test_permission_derived(self):
  self.assertEqual(safety.permission_attestation({'contents:read':True},{'contents:read'})['attestationStatus'],'VERIFIED_READ_ONLY')
  self.assertEqual(safety.permission_attestation({}, {'contents:read'})['attestationStatus'],'UNKNOWN')
  self.assertEqual(safety.permission_attestation({'contents:read':True,'contents:write':True},{'contents:read'})['attestationStatus'],'WRITE_PRESENT')
 def test_budget_ledger(self):
  b=safety.BudgetLedger(3,1);b.consume();b.consume(dependent=True)
  with self.assertRaises(safety.SafetyError):b.consume(dependent=True)
  b.close();self.assertEqual(b.used,3)
 def test_failed_attempt_consumes(self):
  b=safety.BudgetLedger(2,1);b.consume();self.assertEqual(b.used,1)
 def test_bounded_decompression(self):
  bomb=zlib.compress(b'x'*5000)
  with self.assertRaises(safety.SafetyError):safety.BoundedInflater(1000,1000).inflate(bomb)
 def test_ephemeral_sink(self):
  x=safety.EphemeralSink();x.put({'a':1});self.assertEqual(len(x.items),1)
  with self.assertRaises(safety.SafetyError):x.remote_put({'a':1})
 def test_safe_log_nested_and_variants(self):
  x=safety.safe_log({'Authorization':'Bearer abc.def','nested':{'access_token':'xyz'},'url':'?api_key=qwerty&x=1','message':'BEARER zzz'})
  self.assertNotIn('abc.def',x);self.assertNotIn('xyz',x);self.assertNotIn('qwerty',x);self.assertNotIn('zzz',x)
if __name__=='__main__':unittest.main()
