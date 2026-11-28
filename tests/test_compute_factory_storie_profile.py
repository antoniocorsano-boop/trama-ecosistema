"""Replay Atlas-owned procedural geometry without invoking Blender or a provider."""
import importlib
import json
import os
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "fixtures/visual-factory-compute/storie-procedural-profile-review.json"
ATLAS = os.environ.get("TRAMA_ATLAS_SOURCE")
VF3D = os.environ.get("TRAMA_VF3D_SOURCE")


@unittest.skipUnless(ATLAS and VF3D, "pinned upstream checkouts required")
class StorieProfileTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.profile = json.loads(FIXTURE.read_text())
        upstream = Path(ATLAS).resolve() / "scripts/atlas-gateway-c3"
        sys.path.insert(0, str(upstream))
        cls.addClassCleanup(sys.path.remove, str(upstream))
        cls.sculpture = importlib.import_module("star_sculpture")
        cls.adaptive = importlib.import_module("adaptive_identity")
        cls.composition = importlib.import_module("knowledge_composition")
        for module in (cls.sculpture, cls.adaptive, cls.composition):
            if Path(module.__file__).resolve().parent != upstream:
                raise RuntimeError("unexpected source module")
        cls.plan, _, _ = cls.composition.load()
        cls.result = cls.adaptive.solve(cls.plan)
        cls.policy, _ = cls.adaptive.read_policy()
        cls.registry = json.loads((Path(VF3D) / "fixtures/visual-factory-3d/engine-registry.v0.1.json").read_text())
        cls.request = json.loads((Path(VF3D) / "fixtures/visual-factory-3d/storie-planning-example.json").read_text())

    def test_existing_generator_not_duplicated(self):
        self.assertEqual(self.result["shapeKinds"]["storie"], "libro-aperto")
        self.assertEqual(self.result["status"], "PASS")
        self.assertEqual(self.result["selectedAttempt"], self.profile["selectedAttempt"])
        self.assertEqual(self.result["selectedScales"]["storie"], self.profile["selectedScale"])

    def test_exact_observed_geometry(self):
        actual = self.result["sculptureEvidence"]["storie"]
        self.assertTrue(actual["valid"])
        for field, expected in self.profile["geometry"].items():
            self.assertEqual(actual[field], expected, field)

    def test_geometry_replayed_by_owner(self):
        actual = self.result["meshes"]["storie"]
        v, f = self.sculpture.geometry("storie", self.profile["selectedScale"],
                                       self.policy["halfThicknessM"])
        self.assertEqual(actual["vertices"], [list(x) for x in v])
        self.assertEqual(actual["faces"], [list(x) for x in f])
        self.assertEqual(self.sculpture.inspect("storie", v, f),
                         self.result["sculptureEvidence"]["storie"])

    def test_broken_geometry_rejected(self):
        v, f = self.sculpture.geometry("storie", self.profile["selectedScale"],
                                       self.policy["halfThicknessM"])
        self.assertFalse(self.sculpture.inspect("storie", v, f[:-1])["valid"])
        self.assertFalse(self.sculpture.inspect("storie", *self.sculpture.geometry(
            "storie", .70, self.policy["halfThicknessM"]))["valid"])

    def test_bounded_determinism(self):
        self.assertEqual(self.result, self.adaptive.solve(self.plan))
        self.assertEqual(self.adaptive.run(self.plan, self.policy, 1)["status"], "EXHAUSTED")
        self.assertFalse(self.policy["resources"]["externalServices"])
        self.assertFalse(self.policy["resources"]["paidServices"])

    def test_registry_still_unqualified(self):
        p = self.profile["blenderProfile"]
        entries = [x for x in self.registry["engines"] if x["id"] == p["engineId"]]
        self.assertEqual(len(entries), 1)
        self.assertIn("CONTROLLED_SHAPE", entries[0]["roles"])
        self.assertEqual(entries[0]["licenseGate"], p["licenseGate"])
        self.assertEqual(entries[0]["executionGate"], p["executionGate"])

    def test_reference_lock_not_present(self):
        self.assertEqual(self.request["request"]["artDirectionRef"],
                         "SYNTHETIC_TEST_ONLY_NOT_A_REFERENCE_LOCK")
        self.assertEqual(self.request["admissions"], [])
        self.assertEqual(self.request["pools"], [])
        self.assertFalse(self.profile["referenceLockVerified"])

    def test_no_authority_escalation(self):
        for key in ("visualAcceptance", "qualified", "publishable"):
            self.assertIs(self.result[key], False, key)
        for key in ("engineAdmitted", "blenderExecutedByComputeFactory", "visualAcceptance",
                    "candidateQualified", "publicationAuthorityGranted", "executionAuthorized",
                    "studentAuthorized", "paidComputeAuthorized"):
            self.assertIs(self.profile[key], False, key)


if __name__ == "__main__":
    unittest.main()
