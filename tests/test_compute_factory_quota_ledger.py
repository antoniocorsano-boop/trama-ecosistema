import concurrent.futures
import tempfile
import unittest
from pathlib import Path

from scripts.compile_compute_factory_handoff import handoff
from scripts.compute_factory_quota_ledger import QuotaLedger

def reference(i=1, decision="PLAN_READY"):
    req = {"schemaVersion":"atlas.visual-production-request/v0.1","requestId":f"synthetic-{i}",
           "packageDigest":"a"*64,"qualityProfile":"Q4","maxAttempts":2,
           "paidComputeAuthorized":False,"allowQualityDowngrade":False,
           "computePolicyRef":"TRAMA Compute Policy v0.1"}
    plan = {"schemaVersion":"trama.compute-plan/v0.1","qualityProfile":"Q4",
            "costMode":"FREE_ONLY","runtimeAuthorized":False,"decision":decision,
            "noPaidFallback":True,"noQualityDowngrade":True}
    return handoff(req,plan)

class QuotaTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.path=Path(self.tmp.name)/"ledger.db"
        self.q=QuotaLedger(self.path)
        self.q.seed("synthetic:gpu","GPU_WEIGHTED_SECOND_SIM",20,100)
        self.q.seed("synthetic:api","NEURON_SIM",30,100)
    def tearDown(self):
        self.q.close()
        self.tmp.cleanup()
    def reserve(self,i=1,amount=3,expiry=30):
        return self.q.reserve(reference(i),"synthetic:gpu","GPU_WEIGHTED_SECOND_SIM",amount,expiry,10)
    def test_concurrent_distinct(self):
        def attempt(i):
            q=QuotaLedger(self.path)
            try: return q.reserve(reference(i),"synthetic:gpu","GPU_WEIGHTED_SECOND_SIM",3,30,10)[1]
            finally: q.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
            states=list(pool.map(attempt,range(30)))
        self.assertEqual(states.count("RESERVED"),6)
        self.assertEqual(states.count("STOP_QUOTA"),24)
        self.assertEqual(self.q.balance("synthetic:gpu")[2],18)
    def test_concurrent_duplicate(self):
        def attempt(_):
            q=QuotaLedger(self.path)
            try: return q.reserve(reference(),"synthetic:gpu","GPU_WEIGHTED_SECOND_SIM",3,30,10)
            finally: q.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            results=list(pool.map(attempt,range(16)))
        self.assertEqual(len(set(results)),1)
        self.assertEqual(self.q.balance("synthetic:gpu")[2],3)
    def test_exact_limit(self):
        self.assertEqual(self.reserve(amount=20)[1],"RESERVED")
        self.assertEqual(self.reserve(i=2,amount=1)[1],"STOP_QUOTA")
    def test_independent_units(self):
        self.reserve(amount=20)
        self.assertEqual(self.q.reserve(reference(2),"synthetic:api","NEURON_SIM",30,30,10)[1],"RESERVED")
        self.assertEqual(self.q.balance("synthetic:api")[2],30)
    def test_wrong_unit(self):
        for i in (1,2):
            if i==2: self.reserve(i=2)
            with self.assertRaises(ValueError):
                self.q.reserve(reference(i),"synthetic:gpu","NEURON_SIM",3,30,10)
    def test_seed_immutable(self):
        with self.assertRaises(ValueError): self.q.seed("synthetic:gpu","GPU_WEIGHTED_SECOND_SIM",21,100)
        with self.assertRaises(ValueError): self.q.seed("real-provider","LAB_UNIT",20,100)
    def test_expired_or_invalid(self):
        for amount,expiry in ((0,30),(True,30),(3,10),(3,101)):
            with self.subTest(amount=amount,expiry=expiry),self.assertRaises(ValueError):
                self.reserve(amount=amount,expiry=expiry)
    def test_blocked_plan(self):
        with self.assertRaises(ValueError):
            self.q.reserve(reference(decision="STOP_NO_FREE_PROVIDER"),"synthetic:gpu","GPU_WEIGHTED_SECOND_SIM",3,30,10)
    def test_forged_authority(self):
        r=reference();r["runtimeAuthorized"]=True
        with self.assertRaises(ValueError):
            self.q.reserve(r,"synthetic:gpu","GPU_WEIGHTED_SECOND_SIM",3,30,10)
    def test_tampered_digest(self):
        r=reference();r["qualityProfile"]="Q3"
        with self.assertRaises(ValueError):
            self.q.reserve(r,"synthetic:gpu","GPU_WEIGHTED_SECOND_SIM",3,30,10)
    def test_no_duplicate_amount_or_bucket(self):
        self.reserve()
        with self.assertRaises(ValueError): self.reserve(amount=4)
        with self.assertRaises(ValueError): self.q.reserve(reference(),"synthetic:api","NEURON_SIM",3,30,10)
    def test_recovery_unstarted(self):
        key,_=self.reserve()
        self.assertEqual(self.q.recover(30),1)
        self.assertEqual(self.q.balance("synthetic:gpu")[2],0)
        self.assertEqual(self.reserve(),(key,"CANCELLED"))
        self.assertFalse(self.q.transition(key,"start_simulation",30))
    def test_recovery_uncertain(self):
        key,_=self.reserve()
        self.assertTrue(self.q.transition(key,"start_simulation",11))
        self.assertEqual(self.q.recover(30),1)
        self.assertEqual(self.q.balance("synthetic:gpu")[2],3)
        self.assertEqual(self.reserve(),(key,"UNCERTAIN"))
        self.assertFalse(self.q.transition(key,"finish_simulation",31))
        self.assertEqual(self.q.recover(31),0)
    def test_completed_retains_quota(self):
        key,_=self.reserve()
        self.assertTrue(self.q.transition(key,"start_simulation",11))
        self.assertTrue(self.q.transition(key,"finish_simulation",12))
        self.assertEqual(self.q.recover(30),0)
        self.assertEqual(self.q.balance("synthetic:gpu")[2],3)
    def test_persistence(self):
        self.reserve()
        q=QuotaLedger(self.path)
        try: self.assertEqual(q.balance("synthetic:gpu")[2],3)
        finally: q.close()
    def test_rollback(self):
        with self.assertRaises(RuntimeError):
            with self.q.transaction():
                self.q.db.execute("UPDATE cf_bucket SET used=5 WHERE id='synthetic:gpu'")
                raise RuntimeError("abort")
        self.assertEqual(self.q.balance("synthetic:gpu")[2],0)

if __name__=="__main__": unittest.main()
