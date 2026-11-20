"""F-R3e static evidence consistency; never a joint runtime qualification."""
import copy
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RECEIPT = ROOT / "docs/research/curr-ref-01-f-r3e-convergenza-atlas.json"
BOUNDARIES = {"merge", "publication", "studentAccess", "masterChange",
              "newPortal", "newResolver", "newCatalog", "jointBrowserPass", "artisticApproval"}


def validate(r):
    assert r["status"] == "STATIC_COMPATIBILITY_CHECKED_INTEGRATION_BLOCKED"
    assert set(r["boundaries"]) == BOUNDARIES
    assert all(v is False for v in r["boundaries"].values())
    a, t, g = r["atlas"], r["trama"], r["gateway"]
    for sha in [a["commonBase"], t["commonBase"],
                a["semantic"]["head"], a["library"]["head"], a["qualifiedBay"]["head"],
                a["worldComposer"]["head"], t["knowledge"]["head"], t["reference"]["head"]]:
        assert re.fullmatch("[a-f0-9]{40}", sha)
    assert a["overlap"] == ["docs/governance/TRAMA_TERM_01_CURRICOLO_VOCABULARY.json"]
    assert a["semantic"]["filesChanged"] == 12 and a["library"]["filesChanged"] == 232
    assert t["overlap"] == [] and t["knowledge"]["filesChanged"] == 12
    assert t["reference"]["filesChanged"] == 39
    tr = a["termReconciliation"]
    assert tr["basePreserved"] is True and tr["otherFieldsEqual"] is True
    assert tr["applied"] is False and tr["overlappingAdditions"] == 0
    assert (tr["baseCount"], tr["libraryCount"], tr["semanticCount"], tr["unionCount"]) == (15, 18, 16, 19)
    assert tr["unionCount"] == tr["libraryCount"] + tr["semanticCount"] - tr["baseCount"]
    assert a["library"]["failed"] == 1 and a["library"]["failureRun"] == 44576299297
    assert a["library"]["state"] == a["semantic"]["state"] == "OPEN_NOT_MERGED"
    assert a["qualifiedBay"]["checksPassed"] == 5
    assert a["worldComposer"]["state"] == "SEPARATE_LINE_NOT_MERGED"
    assert g["portalIds"] == ["curricolo", "esperienze", "studio"]
    assert g["portalDestinations"] == ["/curricolo", "/esperienze", None]
    assert g["previewGate"] is True
    assert g["registeredPathways"] == 2 and g["authorizedPathways"] == 0
    assert g["editorialSearchPublicResults"] == 0
    assert len(g["sources"]) == 9 and len({s["path"] for s in g["sources"]}) == 9
    assert all(re.fullmatch("[a-f0-9]{40}", s["blob"]) for s in g["sources"])
    gate = r["nextGate"]
    assert gate["id"] == "LBC-03/F-R3e-joint"
    assert gate["state"] == "BLOCKED_BEFORE_INTEGRATION"
    assert len(gate["requires"]) == 8
    assert "LBC-01 material completion PASS" in gate["requires"]
    assert "LBC-02 whole-library extension qualified" in gate["requires"]
    assert "F-R4" in gate["parallelAllowed"]


class AtlasConvergenceTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(RECEIPT.read_text(encoding="utf-8"))

    def test_pinned_static_evidence(self):
        validate(self.data)

    def test_reject_unsupported_promotion(self):
        for key in BOUNDARIES:
            bad = copy.deepcopy(self.data)
            bad["boundaries"][key] = True
            with self.subTest(key=key), self.assertRaises(AssertionError):
                validate(bad)

    def test_reject_registry_loss_or_premature_application(self):
        for key, value in (("unionCount", 18), ("basePreserved", False), ("applied", True)):
            bad = copy.deepcopy(self.data)
            bad["atlas"]["termReconciliation"][key] = value
            with self.subTest(key=key), self.assertRaises(AssertionError):
                validate(bad)

    def test_reject_false_portal_and_public_availability(self):
        for key, value in (("portalDestinations", ["/curricolo", "/esperienze", "/studio"]),
                           ("authorizedPathways", 1), ("editorialSearchPublicResults", 1)):
            bad = copy.deepcopy(self.data)
            bad["gateway"][key] = value
            with self.subTest(key=key), self.assertRaises(AssertionError):
                validate(bad)

    def test_reject_ignoring_library_blocker(self):
        bad = copy.deepcopy(self.data)
        bad["nextGate"]["state"] = "READY"
        with self.assertRaises(AssertionError):
            validate(bad)
