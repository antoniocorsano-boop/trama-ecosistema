import importlib.util,time,unittest
from pathlib import Path
R=Path(__file__).resolve().parents[1]
def load(name,path):
 s=importlib.util.spec_from_file_location(name,R/path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
m=load('live_sim','scripts/cc_mss_stage_c2_live_probe_sim.py')
class T(unittest.TestCase):
 def env(self,**k):
  d=dict(probeRunId='r1',implementationSha='abc',authorizedSha='abc',repository='antoniocorsano-boop/trama-ecosistema',enrolled=True,operations=('repo.read',),expiresAt=200,maxRequests=4);d.update(k);return m.Envelope(**d)
 def perms(self):return {'contents:read':True}
 def tr(self,end='h1'):return m.FakeTransport([{'head':'h1'},{'id':1},{'head':end}])
 def test_happy_path_local_evidence(self):
  e,log=m.run(self.env(),self.perms(),self.tr(),100);self.assertEqual(e['consistency'],'CONSISTENT');self.assertEqual(e['requestCount'],3);self.assertNotIn('Bearer',log)
 def test_sha_mismatch(self):
  with self.assertRaisesRegex(m.ProbeError,'IMPLEMENTATION_SHA_MISMATCH'):m.run(self.env(authorizedSha='def'),self.perms(),self.tr(),100)
 def test_expired(self):
  with self.assertRaisesRegex(m.ProbeError,'AUTHORIZATION_EXPIRED'):m.run(self.env(expiresAt=100),self.perms(),self.tr(),100)
 def test_unenrolled(self):
  with self.assertRaisesRegex(m.ProbeError,'UNENROLLED_REPOSITORY'):m.run(self.env(enrolled=False),self.perms(),self.tr(),100)
 def test_operation_mismatch(self):
  with self.assertRaisesRegex(m.ProbeError,'OPERATION_NOT_AUTHORIZED'):m.run(self.env(operations=('workflow.read',)),self.perms(),self.tr(),100)
 def test_permission_unknown(self):
  with self.assertRaisesRegex(m.ProbeError,'SOURCE_PERMISSION_UNVERIFIED'):m.run(self.env(),{},self.tr(),100)
 def test_permission_write(self):
  with self.assertRaisesRegex(m.ProbeError,'SOURCE_PERMISSION_UNVERIFIED'):m.run(self.env(),{'contents:read':True,'contents:write':True},self.tr(),100)
 def test_budget_close_reserve(self):
  with self.assertRaises(Exception):m.run(self.env(maxRequests=2),self.perms(),self.tr(),100)
 def test_anchor_change(self):
  with self.assertRaisesRegex(m.ProbeError,'COLLECTION_INVALIDATED'):m.run(self.env(),self.perms(),self.tr('h2'),100)
 def test_transport_is_fake_only(self):
  self.assertFalse(hasattr(m.FakeTransport,'get'));self.assertFalse(hasattr(m.FakeTransport,'post'))
if __name__=='__main__':unittest.main()
