"""Offline tests. Qualified profiles and compute pools are synthetic, never live evidence."""
import copy
import datetime as dt
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from compile_visual_factory_3d_plan import AUTH, PROFILE_FIELDS, compile_plan, sha

NOW = dt.datetime(2026, 11, 17, 15, 30, tzinfo=dt.timezone.utc)
FIX = ROOT / "fixtures" / "visual-factory-3d"


def load(name):
    return json.loads((FIX / name).read_text(encoding="utf-8"))


class PlanTest(unittest.TestCase):
    def setUp(self):
        self.registry = load("engine-registry.v0.1.json")
        self.recipes = load("comfyui-recipe-catalog.v0.1.json")
        self.bundle = {
            "schemaVersion": "trama.visual-3d-planning-input/v0.1",
            "request": {"requestId": "test-storie", "subjectRef": "storie",
                        "packageDigest": "a"*64, "artDirectionRef": "synthetic-test-only",
                        "sourceRevision": "b"*40, "purpose": "EVALUATION",
                        "qualityProfile": "Q4", "costClass": "FREE_ONLY",
                        "maxAttempts": 4, "maxConcurrentGpuJobs": 1,
                        "assets": [{"id": "source", "kind": "IMAGE", "sha256": "c"*64,
                                    "bytes": 100, "rightsRef": "fixture", "reviewRef": "fixture",
                                    "dataClass": "NONPERSONAL"}],
                        "jobs": [{"id": "form", "role": "QUICK_SHAPE", "inputIds": ["source"],
                                  "engineOrder": ["triposr", "sf3d"]}],
                        **{k: False for k in AUTH}},
            "admissions": [], "pools": [],
        }

    def engine(self, eid):
        return next(e for e in self.registry["engines"] if e["id"] == eid)

    def pool(self, **kwargs):
        p = {"id": "pool1", "providerId": "synthetic", "computePlanDigest": "d"*64,
             "evidenceRef": "SYNTHETIC_TEST_ONLY", "observedAt": "2026-11-17T15:29:00Z",
             "expiresAt": "2026-11-17T15:40:00Z", "costClass": "ZERO_MARGINAL",
             "zeroMarginalVerified": True, "availableSeconds": 60,
             "vramMiB": 32768, "ramMiB": 65536, "diskMiB": 102400}
        p.update(kwargs)
        self.bundle["pools"].append(p)
        return p

    def admit(self, eid="triposr", role="QUICK_SHAPE", pool_id="pool1", **kwargs):
        e = self.engine(eid)
        e["licenseGate"] = "PRODUCTION_ELIGIBLE"
        e["executionGate"] = "QUALIFIED_FOR_PLANNING"
        a = {"id": f"{eid}-{role}-{len(self.bundle['admissions'])}", "engineId": eid,
             "role": role, "backendId": "direct-cli", "recipeId": None, "graphDigest": None,
             "sourceRevision": "1"*40, "backendRevision": "2"*40, "modelArtifactDigest": "3"*64,
             "environmentDigest": "4"*64, "parametersDigest": "5"*64,
             "licenseEvidenceRef": "SYNTHETIC_TEST_ONLY", "qualificationEvidenceRef": "SYNTHETIC_TEST_ONLY",
             "qualityProfile": "Q4", "poolId": pool_id, "computePlanDigest": "d"*64,
             "expiresAt": "2026-11-17T16:00:00Z", "minVramMiB": 6144,
             "minRamMiB": 8192, "minDiskMiB": 8192, "reservedSeconds": 40}
        a.update(kwargs)
        e.setdefault("qualifiedProfiles", []).append({k: a[k] for k in PROFILE_FIELDS})
        self.bundle["admissions"].append(a)
        return a

    def run_plan(self):
        return compile_plan(self.bundle, self.registry, self.recipes, NOW)

    def first(self):
        return self.run_plan()["jobs"][0]

    def reasons(self):
        j = self.first()
        return [x for e in j["considered"] for x in e["reasons"] +
                [r for a in e["rejectedAdmissions"] for r in a["reasons"]]]

    def test_actual_catalog_no_admission(self):
        p = self.run_plan()
        self.assertEqual(p["decision"], "STOP_NO_ADMISSIBLE_ENGINE")
        self.assertEqual(p["plannedJobs"], 0)
        self.assertIn("LICENSE_NOT_ADMITTED", self.reasons())

    def test_synthetic_positive_is_review_only(self):
        self.pool()
        a = self.admit()
        p = self.run_plan()
        self.assertEqual(p["decision"], "PLAN_READY_FOR_REVIEW")
        self.assertEqual(p["jobs"][0]["selected"]["admissionId"], a["id"])
        self.assertEqual(p["quotaRemainingSeconds"], {"pool1": 20})
        self.assertTrue(p["humanReviewRequired"])
        for k in (*AUTH, "executionAuthorized", "referenceBytesVerified", "liveEvidenceVerified"):
            self.assertIs(p[k], False)
        self.assertEqual(p["planDigest"], sha({k:v for k,v in p.items() if k != "planDigest"}))
        self.assertEqual(p, self.run_plan())

    def test_missing_reference(self):
        self.bundle["request"]["assets"] = []
        self.bundle["request"]["jobs"][0]["inputIds"] = []
        self.assertEqual(self.run_plan()["decision"], "WAITING_FOR_REFERENCE")

    def test_required_mesh_and_image(self):
        self.bundle["request"]["jobs"][0].update(role="TEXTURE_ON_MESH", engineOrder=["mv-adapter"])
        self.assertEqual(self.run_plan()["decision"], "WAITING_FOR_REFERENCE")

    def test_role_not_supported(self):
        self.bundle["request"]["jobs"][0]["role"] = "HIGH_FIDELITY_SHAPE"
        self.pool()
        self.admit()
        self.assertIn("ROLE_NOT_SUPPORTED", self.reasons())

    def test_license_block_cannot_be_overridden_by_admission(self):
        self.pool()
        self.admit()
        self.engine("triposr")["licenseGate"] = "BLOCKED_EU_TRANSITIVE_LICENSE"
        self.assertIn("LICENSE_NOT_ADMITTED", self.reasons())

    def test_unknown_license(self):
        self.pool()
        self.admit()
        self.engine("triposr")["licenseGate"] = "UNKNOWN"
        self.assertIn("LICENSE_NOT_ADMITTED", self.reasons())

    def test_evaluation_only_not_production(self):
        self.pool()
        self.admit()
        self.engine("triposr")["licenseGate"] = "EVALUATION_ONLY"
        self.bundle["request"]["purpose"] = "PRODUCTION_CANDIDATE"
        self.assertIn("EVALUATION_ONLY", self.reasons())

    def test_engine_qualification_needed(self):
        self.pool()
        self.admit()
        self.engine("triposr")["executionGate"] = "NOT_QUALIFIED"
        self.assertIn("ENGINE_NOT_QUALIFIED", self.reasons())

    def test_model_digest_mismatch(self):
        self.pool()
        a = self.admit()
        a["modelArtifactDigest"] = "6"*64
        self.assertIn("QUALIFIED_PROFILE_BINDING_MISMATCH", self.reasons())

    def test_parameter_digest_mismatch(self):
        self.pool()
        a = self.admit()
        a["parametersDigest"] = "6"*64
        self.assertIn("QUALIFIED_PROFILE_BINDING_MISMATCH", self.reasons())

    def test_wrong_admission_role(self):
        self.pool()
        self.admit(role="UV_TEXTURE")
        self.assertIn("ADMISSION_ROLE_MISMATCH", self.reasons())

    def test_quality_no_downgrade(self):
        self.pool()
        self.admit(qualityProfile="Q3")
        self.assertIn("QUALITY_PROFILE_MISMATCH", self.reasons())

    def test_compute_binding(self):
        self.pool()
        self.admit(computePlanDigest="6"*64)
        self.assertIn("COMPUTE_BINDING_MISMATCH", self.reasons())

    def test_expired_admission(self):
        self.pool()
        self.admit(expiresAt="2026-11-17T15:30:00Z")
        self.assertIn("ADMISSION_EXPIRED", self.reasons())

    def test_stale_and_future_entitlement(self):
        self.pool(observedAt="2026-11-17T15:00:00Z")
        self.admit()
        self.assertIn("STALE_ENTITLEMENT", self.reasons())
        self.bundle["pools"][0]["observedAt"] = "2026-11-17T15:31:00Z"
        self.assertIn("STALE_ENTITLEMENT", self.reasons())

    def test_expired_entitlement(self):
        self.pool(expiresAt="2026-11-17T15:30:00Z")
        self.admit()
        self.assertIn("STALE_ENTITLEMENT", self.reasons())

    def test_cost_unknown_or_paid_or_unverified(self):
        p = self.pool()
        self.admit()
        for cost, verified in [("UNKNOWN", True), ("PAID", True), ("ZERO_MARGINAL", False)]:
            p.update(costClass=cost, zeroMarginalVerified=verified)
            self.assertIn("ZERO_COST_NOT_VERIFIED", self.reasons())

    def test_hardware(self):
        self.pool(vramMiB=4096)
        self.admit(minVramMiB=2048)
        self.assertIn("HARDWARE_INSUFFICIENT", self.reasons())

    def test_quota(self):
        self.pool(availableSeconds=39)
        self.admit()
        self.assertIn("QUOTA_INSUFFICIENT", self.reasons())

    def test_shared_quota_not_double_counted(self):
        self.pool()
        self.admit()
        self.admit("sf3d")
        self.bundle["request"]["jobs"].append({"id":"comparison", "role":"QUICK_SHAPE",
            "inputIds":["source"], "engineOrder":["sf3d"]})
        p = self.run_plan()
        self.assertEqual(p["decision"], "PARTIAL_PLAN_FOR_REVIEW")
        self.assertEqual(p["plannedJobs"], 1)
        self.assertIn("QUOTA_INSUFFICIENT", p["jobs"][1]["considered"][0]["rejectedAdmissions"][0]["reasons"])
        self.assertEqual(p["quotaRemainingSeconds"]["pool1"], 20)

    def test_explicit_alternative_only(self):
        self.pool()
        self.admit("sf3d")
        self.assertEqual(self.first()["selected"]["engineId"], "sf3d")
        self.bundle["request"]["jobs"][0]["engineOrder"] = ["triposr"]
        self.assertIsNone(self.first()["selected"])

    def test_duplicate_provider_budget(self):
        self.pool()
        self.pool(id="pool2")
        with self.assertRaisesRegex(ValueError, "duplicate provider quota"):
            self.run_plan()

    def test_duplicate_engine_ids(self):
        self.registry["engines"].append(copy.deepcopy(self.registry["engines"][0]))
        with self.assertRaisesRegex(ValueError, "duplicate id"):
            self.run_plan()

    def test_unqualified_comfy_backend_and_recipe(self):
        self.pool()
        self.admit(backendId="comfyui-local", recipeId="triposr-mesh", graphDigest="7"*64)
        self.assertIn("BACKEND_NOT_QUALIFIED", self.reasons())
        self.assertIn("RECIPE_NOT_QUALIFIED", self.reasons())

    def test_synthetic_qualified_graph_requires_exact_digest(self):
        self.pool()
        a = self.admit(backendId="comfyui-local", recipeId="triposr-mesh", graphDigest="7"*64)
        backend = self.registry["backends"][0]
        self.assertEqual(backend["id"], "comfyui-local")
        backend.update(executionGate="QUALIFIED_FOR_PLANNING", qualifiedRevision=a["backendRevision"])
        recipe = next(r for r in self.recipes["recipes"] if r["id"] == a["recipeId"])
        recipe.update(status="QUALIFIED_FOR_PLANNING", apiGraphDigest=a["graphDigest"], backendRevision=a["backendRevision"])
        self.assertEqual(self.first()["selected"]["backendId"], "comfyui-local")
        recipe["apiGraphDigest"] = "8"*64
        self.assertIn("RECIPE_NOT_QUALIFIED", self.reasons())

    def test_full_pack_not_backend(self):
        self.pool()
        self.admit(backendId="comfyui-3d-pack")
        with self.assertRaisesRegex(ValueError, "admission engine/backend/pool"):
            self.run_plan()

    def test_flags_and_unknown_fields(self):
        self.bundle["request"]["runtimeAuthorized"] = True
        with self.assertRaisesRegex(ValueError, "AUTHORITY_ESCALATION"):
            self.run_plan()
        self.bundle["request"]["runtimeAuthorized"] = False
        self.bundle["request"]["secret"] = "never-accepted"
        with self.assertRaisesRegex(ValueError, "unexpected or missing fields"):
            self.run_plan()

    def test_personal_asset_and_bad_digest(self):
        a = self.bundle["request"]["assets"][0]
        a["dataClass"] = "PERSONAL"
        with self.assertRaisesRegex(ValueError, "asset binding/privacy"):
            self.run_plan()
        a.update(dataClass="NONPERSONAL", sha256="not-a-digest")
        with self.assertRaisesRegex(ValueError, "asset binding/privacy"):
            self.run_plan()

    def test_attempts_and_concurrency(self):
        self.bundle["request"]["maxConcurrentGpuJobs"] = 2
        with self.assertRaisesRegex(ValueError, "attempt/concurrency"):
            self.run_plan()
        self.bundle["request"]["maxConcurrentGpuJobs"] = 1
        self.bundle["request"]["maxAttempts"] = 0
        with self.assertRaisesRegex(ValueError, "attempt/concurrency"):
            self.run_plan()


if __name__ == "__main__":
    unittest.main()
