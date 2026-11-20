"""Validate the F-R4b review receipt, not the private product or human approval."""
import copy
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "docs/capabilities/atlas-percorsi/production"
RECEIPT = BASE / "CURR-REF-01-F-R4b-M118-review-v0.1.json"
DOSSIER = BASE / "CURR-REF-01-F-R2-M118-v0.1.json"
BOUNDARIES = {"humanApproval", "scienceApproval", "accessibilityApproval", "learningClaim",
              "studentData", "assessmentAutomation", "packageModified", "publicArtifact",
              "runtimeAuthorized", "publicationAuthorized", "changesArena", "changesMaster"}


def validate(r):
    assert r["status"] == "REVIEW_FINDINGS_REWORK_PROPOSED"
    assert set(r["boundaries"]) == BOUNDARIES
    assert all(v is False for v in r["boundaries"].values())
    s = r["source"]
    original = json.loads(DOSSIER.read_text(encoding="utf-8"))
    assert s["activityId"] == original["activity"]["id"]
    assert s["version"] == original["activity"]["version"] == "0.4.2-draft"
    assert s["manifestSha256"] == original["activity"]["manifestDigest"]
    assert s["guideSha256"] == original["activity"]["guideDigestRecorded"]
    assert s["archiveSha256"] == "ecf9c51f03070bc5d70e2e2a0906026371fb0ea39f9d01c8f397377d1a16e95b"
    assert s["htmlSha256"] == "03c3a6e5136d73ef1595c785c1a37455a83785fa08e53f2cf67bee3856fc33f9"
    assert s["archiveBytes"] == 1897576 and s["assetsVerified"] == 10 and s["archiveEntries"] == 11
    assert s["zipIntegrity"] is True and s["manifestArenaRefs"] == 0
    assert s["guideDurationRange"] == [40, 50] and s["phaseSumRange"] == [45, 50]
    method = r["method"]
    assert method["csp"] == "NOT_REPRODUCED_EXACT_STUDIO_CSP"
    assert method["review"] == "STATIC_SOURCE_AND_LOCAL_INTERACTION_NO_LEARNER"
    assert method["viewports"] == [{"width":320,"height":640},{"width":1280,"height":720}]
    assert [o["viewport"] for o in method["observations"]] == ["320x640","1280x720"]
    for o in method["observations"]:
        for field in ("filterInconsistency","predictionRequiresBothAndResets","twoCasesRequired","nonidealCanFinish","textPrologue"):
            assert o[field] is True
        assert o["transferHorizontalOverflow"] is False
        assert o["pendingDiaryRows"] == 2 and o["transferSteps"] == 4
        assert o["externalRequests"] == o["pageErrors"] == 0
    findings = {f["id"]: f for f in r["findings"]}
    assert len(findings) == len(r["findings"]) == 5
    assert set(findings) == {f"M118-R{i}" for i in range(1, 6)}
    assert findings["M118-R1"]["kind"] == "REPRODUCED_DEFECT"
    assert findings["M118-R3"]["kind"] == "VERIFIED_DESIGN_LIMIT"
    assert findings["M118-R5"]["kind"] == "VERIFIED_DOCUMENTARY_MISMATCH"
    assert {f["id"] for f in findings.values() if f["severity"] == "CORRECTION_REQUIRED"} == {"M118-R1","M118-R3","M118-R5"}
    assert all(f["action"] and f["acceptance"] for f in findings.values())
    assert [o["id"] for o in r["outcomes"]] == [o["id"] for o in original["outcomes"]]
    assert all(o["state"] in {"PARTIAL","DOCUMENTED_AND_INTERACTION_CHECKED"} and
               o["evidenceLimit"] and o["findingRefs"] and
               set(o["findingRefs"]) <= findings.keys() for o in r["outcomes"])
    assert len(r["pending"]) == 7


class MissionReviewReceiptTests(unittest.TestCase):
    def setUp(self):
        self.r = json.loads(RECEIPT.read_text(encoding="utf-8"))

    def test_exact_receipt(self):
        validate(self.r)

    def test_no_promotion(self):
        for key in BOUNDARIES:
            r = copy.deepcopy(self.r)
            r["boundaries"][key] = True
            with self.subTest(key=key), self.assertRaises(AssertionError):
                validate(r)

    def test_no_unchecked_archive_or_source(self):
        r = copy.deepcopy(self.r)
        r["source"]["assetsVerified"] = 9
        with self.assertRaises(AssertionError):
            validate(r)
        r = copy.deepcopy(self.r)
        r["source"]["manifestSha256"] = "0" * 64
        with self.assertRaises(AssertionError):
            validate(r)

    def test_no_erased_reproduced_defect(self):
        r = copy.deepcopy(self.r)
        r["method"]["observations"][0]["filterInconsistency"] = False
        with self.assertRaises(AssertionError):
            validate(r)
        r = copy.deepcopy(self.r)
        r["findings"].pop()
        with self.assertRaises(AssertionError):
            validate(r)

    def test_no_unsupported_science_or_accessibility_pass(self):
        r = copy.deepcopy(self.r)
        r["outcomes"][1]["state"] = "PASS"
        with self.assertRaises(AssertionError):
            validate(r)
        r = copy.deepcopy(self.r)
        r["method"]["csp"] = "EXACT"
        with self.assertRaises(AssertionError):
            validate(r)
