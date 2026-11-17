"""Cross-branch offline contract test; upstream planner is pinned in CI."""
import datetime as dt
import importlib.util
import json
import os
from pathlib import Path
import unittest

from scripts.compile_compute_factory_handoff import handoff, digest, atlas_cache_review_reference

ROOT = Path(__file__).resolve().parents[1]
UPSTREAM = os.environ.get("TRAMA_VF3D_SOURCE")


@unittest.skipUnless(UPSTREAM, "pinned upstream checkout required")
class ConvergenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        root = Path(UPSTREAM)
        spec = importlib.util.spec_from_file_location(
            "vf3d_pinned", root / "scripts/compile_visual_factory_3d_plan.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        fixture = root / "fixtures/visual-factory-3d"
        def read(name):
            return json.loads((fixture / name).read_text(encoding="utf-8"))
        cls.bundle = read("storie-planning-example.json")
        cls.registry = read("engine-registry.v0.1.json")
        cls.recipes = read("comfyui-recipe-catalog.v0.1.json")
        cls.compile = staticmethod(module.compile_plan)
        cls.now = dt.datetime(2026, 11, 17, 15, 30, tzinfo=dt.timezone.utc)

    def actual_plan(self):
        return self.compile(self.bundle, self.registry, self.recipes, self.now)

    def test_actual_planner_output(self):
        plan = self.actual_plan()
        result = handoff(self.bundle["request"], plan)
        self.assertEqual(result["binding"], "REQUEST_DIGEST_MATCH")
        self.assertEqual(result["sourcePlanDigest"], digest(plan))
        self.assertEqual(result["sourceDecision"], "WAITING_FOR_REFERENCE")
        self.assertEqual(plan["plannedJobs"], 0)
        self.assertTrue(all(job["selected"] is None for job in plan["jobs"]))

    def test_actual_plan_never_authorizes(self):
        result = handoff(self.bundle["request"], self.actual_plan())
        for key in ("executionAuthorized", "runtimeAuthorized", "paidComputeAuthorized",
                    "publicationAuthorityGranted", "studentAuthorized",
                    "trustedOriginVerified", "liveEvidenceVerified"):
            self.assertIs(result[key], False, key)
        self.assertIs(result["humanReviewRequired"], True)

    def test_repeatable(self):
        self.assertEqual(self.actual_plan(), self.actual_plan())

    def test_modified_reference_rejected(self):
        req = dict(self.bundle["request"], artDirectionRef="CHANGED")
        with self.assertRaises(ValueError):
            handoff(req, self.actual_plan())

    def test_modified_plan_rejected(self):
        plan = self.actual_plan()
        plan["plannedJobs"] = 1
        with self.assertRaises(ValueError):
            handoff(self.bundle["request"], plan)


class CacheReferenceTests(unittest.TestCase):
    def setUp(self):
        fixture = ROOT / "fixtures/visual-factory-compute/atlas-sp02-observed-restore.json"
        self.evidence = json.loads(fixture.read_text(encoding="utf-8"))
        self.receipt = self.evidence["receipt"]
        self.key = self.receipt["dependencyKey"]

    def test_observed_restore_reference(self):
        ref = atlas_cache_review_reference(self.receipt, self.key)
        self.assertEqual(ref["scope"], "BASE_DEPENDENCIES_ONLY")
        self.assertEqual(ref["receiptDigest"], digest(self.receipt))
        self.assertEqual(self.evidence["qualification"], "BLOCKED")
        for field in ("candidateQualified", "reuseAuthorized", "artifactBytesVerified",
                      "trustedOriginVerified", "executionAuthorized", "publicationAuthorityGranted"):
            self.assertIs(ref[field], False, field)

    def test_wrong_key(self):
        with self.assertRaises(ValueError):
            atlas_cache_review_reference(self.receipt, "f" * 64)

    def test_candidate_reuse_rejected(self):
        with self.assertRaises(ValueError):
            atlas_cache_review_reference(dict(self.receipt, candidateReused=True), self.key)

    def test_wrong_files_or_status(self):
        for patch in ({"verifiedFiles": 9}, {"status": "FAIL"}, {"mode": "save"},
                      {"publicationAuthorityGranted": True}):
            with self.subTest(patch=patch), self.assertRaises(ValueError):
                atlas_cache_review_reference(dict(self.receipt, **patch), self.key)


if __name__ == "__main__":
    unittest.main()
