"""Raccordo diagnostico J07: usa i compilatori esistenti, nessuna esecuzione."""
import copy
import datetime as dt
import json
from pathlib import Path
import unittest

from scripts.compile_visual_factory_3d_plan import compile_plan
from scripts.compile_compute_factory_handoff import handoff
from scripts.compute_factory_quota_ledger import QuotaLedger

ROOT=Path(__file__).resolve().parents[1]/"fixtures/visual-factory-3d"
def load(name):
    return json.loads((ROOT/name).read_text())

class J07ComputeReview(unittest.TestCase):
    def setUp(self):
        self.bundle=load("j07-admission-review.json")
        self.evidence=load("j07-diagnostic-review.v0.1.json")
        self.registry=load("engine-registry.v0.1.json")
        self.recipes=load("comfyui-recipe-catalog.v0.1.json")
        self.now=dt.datetime.fromisoformat("2026-11-18T05:51:31+00:00")
    def plan(self):
        return compile_plan(self.bundle,self.registry,self.recipes,self.now)
    def test_evidence_binding(self):
        a=self.bundle["request"]["assets"][0]
        self.assertEqual(a["sha256"],self.evidence["baseScene"]["sha256"])
        self.assertEqual(a["bytes"],self.evidence["baseScene"]["bytes"])
        self.assertEqual(self.bundle["request"]["sourceRevision"],self.evidence["sourceRevision"])
        self.assertEqual(self.evidence["scope"],"DIAGNOSTIC_ONLY")
        self.assertEqual(self.evidence["costStatus"],"UNKNOWN")
        self.assertEqual(self.evidence["resources"]["productionPoolCount"],0)
        self.assertFalse(self.evidence["executionAuthorized"])
        self.assertEqual(self.evidence["security"]["acceptance"],"NOT_REVIEWED_FOR_PRODUCTION")
    def test_existing_planner_stops(self):
        p=self.plan()
        self.assertEqual(p["decision"],"STOP_NO_ADMISSIBLE_ENGINE")
        self.assertEqual(p["plannedJobs"],0)
        self.assertFalse(p["executionAuthorized"])
        reasons=p["jobs"][0]["considered"][0]["reasons"]
        self.assertIn("LICENSE_NOT_ADMITTED",reasons)
        self.assertIn("ENGINE_NOT_QUALIFIED",reasons)
        self.assertIn("NO_ADMISSION",reasons)
    def test_handoff_and_quota_stop(self):
        h=handoff(self.bundle["request"],self.plan())
        self.assertEqual(h["binding"],"REQUEST_DIGEST_MATCH")
        self.assertEqual(h["sourceDecision"],"STOP_NO_ADMISSIBLE_ENGINE")
        self.assertFalse(h["liveEvidenceVerified"])
        self.assertFalse(h["executionAuthorized"])
        q=QuotaLedger(":memory:")
        try:
            q.seed("synthetic:j07","CPU_SECOND_SIM",900,1000)
            with self.assertRaises(ValueError):
                q.reserve(h,"synthetic:j07","CPU_SECOND_SIM",10,900,100)
            self.assertEqual(q.balance("synthetic:j07")[2],0)
        finally:
            q.close()
    def test_altered_request_rejected(self):
        p=self.plan()
        req=copy.deepcopy(self.bundle["request"])
        req["packageDigest"]="0"*64
        with self.assertRaises(ValueError):
            handoff(req,p)
    def test_no_paid_fallback(self):
        self.bundle["request"]["paidComputeAuthorized"]=True
        with self.assertRaises(ValueError):
            self.plan()

if __name__=="__main__":
    unittest.main()
