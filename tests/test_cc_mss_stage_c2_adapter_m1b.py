import importlib.util,unittest
from datetime import datetime,timezone,timedelta
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
R=Path(__file__).resolve().parents[1];s=importlib.util.spec_from_file_location('m1b',R/'scripts/cc_mss_stage_c2_adapter_m1b.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
NOW=datetime(2026,9,28,20,0,tzinfo=timezone.utc);SHA='a'*40
class Clock:
 def __init__(self,now=NOW):self.value=now
 def now(self):return self.value
def receipt(ref='r1',principal='fixture-principal',sha=SHA,exp=None):
 return m.Receipt(ref,'p1','antoniocorsano-boop/trama-ecosistema',sha,('repo.read',),'fixture:cred',principal,NOW-timedelta(minutes=1),exp or NOW+timedelta(minutes=10),'policy','resource')
def setup(r=None,cred=None,perm=None,clock=None):
 st=m.ReceiptStore();st.issue(r or receipt());c=cred or m.FakeCredentialSource();p=perm or m.FakePermissionSource();cl=clock or Clock();return st,c,p,m.M1BOfflineSession(st,cl,c,p,SHA)
class T(unittest.TestCase):
 def test_happy_offline_lifecycle(self):
  st,c,p,x=setup();b=m.RequestBudget(3);ctx=x.prepare('r1','p1',b);self.assertEqual(st.state('r1'),'CLAIMED');self.assertEqual(ctx['evidenceState'],'IN_PROGRESS');ctx=x.complete(ctx,b);self.assertEqual(st.state('r1'),'CONSUMED');self.assertEqual(ctx['evidenceState'],'VALID');self.assertIsNone(ctx['secret'])
 def test_expired_before_claim_never_materializes(self):
  r=receipt(exp=NOW);st,c,p,x=setup(r)
  with self.assertRaisesRegex(m.M1BError,'RECEIPT_EXPIRED'):x.prepare('r1','p1',m.RequestBudget(3))
  self.assertEqual(st.state('r1'),'ISSUED');self.assertEqual(c.calls,0)
 def test_exact_head_mismatch_before_credential(self):
  st,c,p,x=setup(receipt(sha='b'*40))
  with self.assertRaisesRegex(m.M1BError,'RECEIPT_BINDING_MISMATCH'):x.prepare('r1','p1',m.RequestBudget(3))
  self.assertEqual(c.calls,0)
 def test_principal_mismatch_fails_claimed_session(self):
  st,c,p,x=setup(cred=m.FakeCredentialSource(principal='other'))
  with self.assertRaisesRegex(m.M1BError,'PRINCIPAL_MISMATCH'):x.prepare('r1','p1',m.RequestBudget(3))
  self.assertEqual(st.state('r1'),'FAILED')
 def test_attested_principal_mismatch(self):
  st,c,p,x=setup(perm=m.FakePermissionSource(principal='other'))
  with self.assertRaisesRegex(m.M1BError,'PRINCIPAL_MISMATCH'):x.prepare('r1','p1',m.RequestBudget(3))
  self.assertEqual(st.state('r1'),'FAILED')
 def test_write_permission_rejected(self):
  st,c,p,x=setup(perm=m.FakePermissionSource(permissions=('contents:write',)))
  with self.assertRaisesRegex(m.M1BError,'PERMISSION_NOT_READ_ONLY'):x.prepare('r1','p1',m.RequestBudget(3))
 def test_budget_reserve_protected(self):
  b=m.RequestBudget(2)
  b.consume()
  with self.assertRaisesRegex(m.M1BError,'BUDGET_EXHAUSTED'):b.consume()
  b.consume(allow_reserve=True);self.assertEqual(b.remaining,0)
 def test_replay_rejected(self):
  st,c,p,x=setup();x.prepare('r1','p1',m.RequestBudget(3))
  with self.assertRaisesRegex(m.M1BError,'RECEIPT_NOT_CLAIMABLE'):x.prepare('r1','p1',m.RequestBudget(3))
 def test_concurrent_claim_one_winner(self):
  st=m.ReceiptStore();st.issue(receipt())
  def claim(_):
   try:st.claim('r1','p1',SHA);return 'ok'
   except m.M1BError:return 'deny'
  with ThreadPoolExecutor(max_workers=2) as ex:out=list(ex.map(claim,(1,2)))
  self.assertEqual(sorted(out),['deny','ok']);self.assertEqual(st.state('r1'),'CLAIMED')
 def test_restart_claimed_not_resumable(self):
  st=m.ReceiptStore();st.issue(receipt());st.claim('r1','p1',SHA)
  with self.assertRaisesRegex(m.M1BError,'RECEIPT_NOT_CLAIMABLE'):st.claim('r1','p1',SHA)
 def test_anchor_change_invalidates(self):
  st,c,p,x=setup();b=m.RequestBudget(3);ctx=x.prepare('r1','p1',b)
  with self.assertRaisesRegex(m.M1BError,'ANCHOR_CHANGED'):x.complete(ctx,b,False)
  self.assertEqual(st.state('r1'),'FAILED');self.assertEqual(ctx['evidenceState'],'INVALID/INCOMPLETE');self.assertIsNone(ctx['secret'])
 def test_naive_clock_fails_closed(self):
  st,c,p,x=setup(clock=Clock(datetime(2026,9,28,20,0)))
  with self.assertRaisesRegex(m.M1BError,'CLOCK_INVALID'):x.prepare('r1','p1',m.RequestBudget(3))
  self.assertEqual(c.calls,0)
 def test_real_credential_ref_rejected_after_claim(self):
  r=receipt();r=m.Receipt(r.ref,r.probe_id,r.repository,r.exact_sha,r.operations,'prod:cred',r.principal_ref,r.issued_at,r.expires_at,r.policy_digest,r.resource_digest);st,c,p,x=setup(r)
  with self.assertRaisesRegex(m.M1BError,'REAL_CREDENTIAL_FORBIDDEN'):x.prepare('r1','p1',m.RequestBudget(3))
  self.assertEqual(st.state('r1'),'FAILED')
if __name__=='__main__':unittest.main()
