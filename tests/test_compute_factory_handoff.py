import datetime as dt
import json
from pathlib import Path
import unittest
from scripts.compile_compute_factory_handoff import digest, handoff
from scripts.compile_visual_factory_compute_plan import compile_plan

class HandoffTests(unittest.TestCase):
    def setUp(self):
        self.request = {"schemaVersion": "atlas.visual-production-request/v0.1", "requestId": "req-1",
                        "packageDigest": "a"*64, "qualityProfile": "Q4", "maxAttempts": 2,
                        "paidComputeAuthorized": False, "allowQualityDowngrade": False,
                        "computePolicyRef": "TRAMA Compute Policy v0.1"}
        self.plan = {"schemaVersion": "trama.compute-plan/v0.1", "qualityProfile": "Q4",
                     "costMode": "FREE_ONLY", "runtimeAuthorized": False, "decision": "PLAN_READY",
                     "noPaidFallback": True, "noQualityDowngrade": True}
    def three_d(self):
        req = dict(self.request, costClass="FREE_ONLY", runtimeAuthorized=False,
                   publicationAuthorityGranted=False, studentAuthorized=False)
        plan = {"schemaVersion": "trama.visual-3d-plan/v0.1", "qualityProfile": "Q4",
                "costClass": "FREE_ONLY", "executionAuthorized": False, "paidComputeAuthorized": False,
                "runtimeAuthorized": False, "allowQualityDowngrade": False,
                "publicationAuthorityGranted": False, "studentAuthorized": False,
                "humanReviewRequired": True, "requestId": req["requestId"],
                "requestDigest": digest(req), "decision": "WAITING_FOR_REFERENCE"}
        plan["planDigest"] = digest(plan)
        return req, plan
    def test_compute_is_unbound(self):
        h = handoff(self.request, self.plan)
        self.assertEqual(h["binding"], "POLICY_ONLY_UNBOUND")
        self.assertFalse(h["executionAuthorized"])
    def test_determinism(self):
        self.assertEqual(handoff(self.request, self.plan), handoff(self.request, self.plan))
    def test_3d_binding(self):
        h = handoff(*self.three_d())
        self.assertEqual(h["binding"], "REQUEST_DIGEST_MATCH")
        self.assertFalse(h["trustedOriginVerified"])
    def test_stale_plan(self):
        p = dict(self.plan, decision="STOP_STALE_ENTITLEMENT_SNAPSHOT")
        p.pop("noPaidFallback"); p.pop("noQualityDowngrade")
        self.assertFalse(handoff(self.request,p)["runtimeAuthorized"])
    def test_quality_mismatch(self):
        with self.assertRaises(ValueError): handoff(self.request, dict(self.plan, qualityProfile="Q3"))
    def test_cost_mismatch(self):
        with self.assertRaises(ValueError): handoff(self.request, dict(self.plan, costMode="PAID"))
    def test_paid_fallback(self):
        with self.assertRaises(ValueError): handoff(self.request, dict(self.plan, noPaidFallback=False))
    def test_downgrade(self):
        with self.assertRaises(ValueError): handoff(self.request, dict(self.plan, noQualityDowngrade=False))
    def test_execution_authority(self):
        with self.assertRaises(ValueError): handoff(self.request, dict(self.plan, executionAuthorized=True))
    def test_publication_authority(self):
        with self.assertRaises(ValueError): handoff(self.request, dict(self.plan, publicationAuthorityGranted=True))
    def test_student_authority(self):
        with self.assertRaises(ValueError): handoff(dict(self.request, studentAuthorized=True), self.plan)
    def test_attempt_bound(self):
        for v in (True, 0, 5):
            with self.subTest(v=v), self.assertRaises(ValueError): handoff(dict(self.request,maxAttempts=v),self.plan)
    def test_tampered_plan(self):
        r,p = self.three_d(); p["decision"] = "PLAN_READY_FOR_REVIEW"
        with self.assertRaises(ValueError): handoff(r,p)
    def test_tampered_request(self):
        r,p = self.three_d(); r["packageDigest"] = "b"*64
        with self.assertRaises(ValueError): handoff(r,p)
    def test_unknown_version(self):
        with self.assertRaises(ValueError): handoff(self.request,dict(self.plan,schemaVersion="unknown"))
    def test_existing_compiler_fixture(self):
        root = Path(__file__).resolve().parents[1] / "fixtures/visual-factory-compute"
        policy = json.loads((root / "policy-free-q4.json").read_text())
        snapshot = json.loads((root / "snapshot-eligible.json").read_text())
        plan = compile_plan(policy, snapshot, dt.datetime(2026,10,4,13,30,tzinfo=dt.timezone.utc))
        self.assertEqual(plan["decision"], "PLAN_READY")
        self.assertEqual(handoff(self.request, plan)["binding"], "POLICY_ONLY_UNBOUND")
    def test_digest(self):
        h = handoff(self.request,self.plan)
        self.assertEqual(h.pop("handoffDigest"),digest(h))

if __name__ == "__main__":
    unittest.main()
