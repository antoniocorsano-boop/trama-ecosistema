import importlib.util,unittest
from pathlib import Path
R=Path(__file__).resolve().parents[1]
def load(n,p):
 s=importlib.util.spec_from_file_location(n,R/p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
m=load('sim','scripts/cc_mss_stage_c2_live_probe_sim.py')
class T(unittest.TestCase):
 def env(self,**k):
  d=dict(probeRunId='r1',implementationSha='abc',authorizedSha='abc',repository='antoniocorsano-boop/trama-ecosistema',enrolled=True,operations=('repo.read',),credentialRef='cred:readonly-1',issuedAt=50,expiresAt=200,maxRequests=5,maxRetries=0,timeoutMs=1000,maxCompressedBytes=1000,maxDecompressedBytes=1000,maxPages=2,maxItems=20,maxSessionBytes=2000,canonicalizationVersion='cc-mss-c1-v1',evidenceDestination='ephemeral://memory');d.update(k);return m.Envelope(**d)
 def perms(self):return {'contents:read':True}
 def tr(self,middle=None,end='h1'):return m.FakeTransport([{'head':'h1'},middle or {'id':1,'paginationComplete':True},{'head':end}])
 def test_happy_and_binding(self):
  e,_=m.run(self.env(),self.perms(),self.tr(),100);self.assertEqual(e['consistency'],'CONSISTENT');self.assertEqual(e['requestCount'],3);self.assertEqual(len(e['attestationDigest']),64)
 def test_sha(self):
  with self.assertRaisesRegex(m.ProbeError,'IMPLEMENTATION_SHA_MISMATCH'):m.run(self.env(authorizedSha='x'),self.perms(),self.tr(),100)
 def test_expiry(self):
  with self.assertRaisesRegex(m.ProbeError,'AUTHORIZATION_EXPIRED'):m.run(self.env(expiresAt=100),self.perms(),self.tr(),100)
 def test_unenrolled(self):
  with self.assertRaisesRegex(m.ProbeError,'UNENROLLED_REPOSITORY'):m.run(self.env(enrolled=False),self.perms(),self.tr(),100)
 def test_operation_binding(self):
  e,_=m.run(self.env(operations=('commit.read',)),self.perms(),self.tr(),100);self.assertEqual(e['items'][0]['schema'],'commit-v1')
 def test_boundary_host(self):
  with self.assertRaisesRegex(m.ProbeError,'SOURCE_BOUNDARY_VIOLATION'):m.run(self.env(),self.perms(),self.tr(),100,{'scheme':'https','host':'evil.example','redirect':False})
 def test_boundary_redirect(self):
  with self.assertRaisesRegex(m.ProbeError,'SOURCE_BOUNDARY_VIOLATION'):m.run(self.env(),self.perms(),self.tr(),100,{'scheme':'https','host':'api.github.com','redirect':True})
 def test_permission_write(self):
  with self.assertRaisesRegex(m.ProbeError,'SOURCE_PERMISSION_UNVERIFIED'):m.run(self.env(),{'contents:read':True,'contents:write':True},self.tr(),100)
 def test_envelope_destination(self):
  with self.assertRaisesRegex(m.ProbeError,'AUTHORIZATION_ENVELOPE_INVALID'):m.run(self.env(evidenceDestination='https://x'),self.perms(),self.tr(),100)
 def test_failed_attempt_consumes_and_fails(self):
  tr=m.FakeTransport([TimeoutError('x')]);
  with self.assertRaisesRegex(m.ProbeError,'SOURCE_UNAVAILABLE'):m.run(self.env(maxRequests=4),self.perms(),tr,100)
  self.assertEqual(len(tr.calls),1)
 def test_retry_budget_and_close_reserve(self):
  tr=m.FakeTransport([TimeoutError('x'),{'head':'h1'},{'id':1},{'head':'h1'}])
  with self.assertRaises(Exception):m.run(self.env(maxRetries=1,maxRequests=3),self.perms(),tr,100)
 def test_resource_limit(self):
  with self.assertRaisesRegex(m.ProbeError,'SOURCE_RESOURCE_LIMIT_EXCEEDED'):m.run(self.env(maxDecompressedBytes=20),self.perms(),self.tr({'payload':'x'*100}),100)
 def test_pagination_partial(self):
  with self.assertRaisesRegex(m.ProbeError,'INCOMPLETE_PAGINATION'):m.run(self.env(),self.perms(),self.tr({'paginationComplete':False}),100)
 def test_anchor_change(self):
  with self.assertRaisesRegex(m.ProbeError,'COLLECTION_INVALIDATED'):m.run(self.env(),self.perms(),self.tr(end='h2'),100)
if __name__=='__main__':unittest.main()
