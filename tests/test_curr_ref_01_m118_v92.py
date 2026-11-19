"""Check the V9.2 evidence receipt, not the private package or human approval."""
import copy
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "docs/capabilities/atlas-percorsi/production"
RECEIPT = BASE / "CURR-REF-01-F-R4b-M118-V92-evidence.json"
PRIOR = BASE / "CURR-REF-01-F-R4b-M118-review-v0.1.json"


def validate(r):
    assert r["status"] == "LOCAL_FUNCTIONAL_PASS_HUMAN_REVIEW_PENDING"
    expected = {"humanApproval", "scienceApproval", "accessibilityApproval",
                "learningClaim", "studentData", "assessmentAutomation",
                "studioImportVerified", "studioPinChanged", "publicArtifact",
                "runtimeAuthorized", "publicationAuthorized", "changesArena", "changesMaster"}
    assert set(r["boundaries"]) == expected
    assert all(v is False for v in r["boundaries"].values())
    prior = json.loads(PRIOR.read_text(encoding="utf-8"))
    assert r["source"]["archiveSha256"] == prior["source"]["archiveSha256"]
    assert r["source"]["version"] == prior["source"]["version"] == "0.4.2-draft"
    assert r["source"]["preserved"] is True
    c = r["candidate"]
    assert c["activityId"] == prior["source"]["activityId"]
    assert c["version"] == "0.4.3-draft" and c["privateArchive"] is True
    assert c["archiveSha256"] == "c259d5810b88a1255d7ff3a1079e66195c75c983d066b72155b3093c5003812c"
    assert c["manifestSha256"] == "516f1c696c520d614fdcc3564230d77c1958570e4d9addb5f0e47281cbb103f5"
    assert c["htmlSha256"] == "4274a7de3aff3b04d2da3645753106116dc16694dd9cb848b1969391f1afaa27"
    assert c["guideSha256"] == "76a762a1adf288dbbb4da439735a2c41ff7b47a7e670713f15bd52753ab9c5c0"
    assert c["archiveBytes"] == 1898508 and c["zipIntegrity"] is True
    assert (c["assetsVerified"], c["unchangedArtFiles"], c["unchangedEmbeddedMedia"]) == (10, 8, 9)
    assert c["arenaRefs"] == 0
    assert c["guideDuration"] == c["phaseSum"] == [45, 50]
    assert c["manifestSuggestedDuration"] == 45
    assert [x["id"] for x in r["corrections"]] == [x["id"] for x in prior["findings"]]
    assert [x["status"] for x in r["corrections"]] == ["LOCAL_FUNCTIONAL_CHECK_PASS"] * 4 + ["DOCUMENT_CHECK_PASS"]
    assert all(x["evidence"] for x in r["corrections"])
    assert r["method"]["localImport"] == "NOT_EXECUTED"
    assert r["method"]["csp"] == "NOT_REPRODUCED_EXACT_STUDIO_CSP"
    assert [x["viewport"] for x in r["observations"]] == ["320x640", "393x873", "1280x720"]
    for o in r["observations"]:
        assert o["fourContextCombinations"] == [["now","now"],["now","later"],["later","now"],["later","later"]]
        for key in ("contextResetAndDiary", "predictionRegression", "tutorBothModesNeutral",
                    "classificationBeforeFeedback", "reclassificationResetsResponse",
                    "nonidealCanFinish", "optionalExamplesTwoContexts", "keyboardReset",
                    "audioPlayPause", "textPrologue"):
            assert o[key] is True
        assert o["transferOverflow"] is False and o["externalRequests"] == o["pageErrors"] == 0


class MissionV92ReceiptTests(unittest.TestCase):
    def setUp(self):
        self.r = json.loads(RECEIPT.read_text(encoding="utf-8"))

    def test_local_receipt(self):
        validate(self.r)

    def test_no_promotion(self):
        for key in self.r["boundaries"]:
            r = copy.deepcopy(self.r)
            r["boundaries"][key] = True
            with self.subTest(key=key), self.assertRaises(AssertionError):
                validate(r)

    def test_source_preservation_and_candidate_identity(self):
        for field, value in (("archiveSha256", "0"*64), ("unchangedArtFiles", 7), ("version", "0.4.2-draft")):
            r = copy.deepcopy(self.r)
            r["candidate"][field] = value
            with self.subTest(field=field), self.assertRaises(AssertionError):
                validate(r)

    def test_no_erasure_of_case_or_viewport(self):
        r = copy.deepcopy(self.r)
        r["observations"].pop()
        with self.assertRaises(AssertionError):
            validate(r)
        r = copy.deepcopy(self.r)
        r["observations"][0]["fourContextCombinations"].pop()
        with self.assertRaises(AssertionError):
            validate(r)

    def test_no_unsupported_import_or_review(self):
        r = copy.deepcopy(self.r)
        r["method"]["localImport"] = "PASS"
        with self.assertRaises(AssertionError):
            validate(r)
        r = copy.deepcopy(self.r)
        r["corrections"][0]["status"] = "HUMAN_PASS"
        with self.assertRaises(AssertionError):
            validate(r)
