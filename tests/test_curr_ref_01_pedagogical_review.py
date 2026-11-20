"""Documentary F-R4 receipt checks; no automated pedagogical approval."""
import copy
import hashlib
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "docs/capabilities/atlas-percorsi/production"
RECEIPT = BASE / "CURR-REF-01-F-R4-review-v0.1.json"
REF = ROOT / "governance/pedagogy/curr-ref-01-v0.1.json"
M118 = BASE / "CURR-REF-01-F-R2-M118-v0.1.json"
BOUNDARIES = {"humanApproval", "automaticQualityPass", "learningClaim", "studentData",
              "assessmentAutomation", "runtimeAuthorized", "publicationAuthorized",
              "changesArena", "changesPackage", "changesMaster"}


def blob(path):
    raw = path.read_bytes()
    return hashlib.sha1(f"blob {len(raw)}\0".encode() + raw).hexdigest()


def validate(record):
    assert record["status"] == "DOCUMENTARY_REVIEW_CANDIDATE"
    assert set(record["boundaries"]) == BOUNDARIES
    assert all(v is False for v in record["boundaries"].values())
    source = {s["id"]: s for s in record["sources"]}
    assert len(source) == len(record["sources"]) == 8
    assert set(source) == {"REF", "TEMPLATE", "WORKFLOW", "QUALITY", "M118", "CQP07", "INFO", "VINCOLI"}
    for s in source.values():
        assert re.fullmatch("[a-f0-9]{40}", s["revision"])
        assert re.fullmatch("[a-f0-9]{40}", s["blob"])
        assert s["path"] and not s["path"].startswith("/")
        # TEMPLATE is the historical input, now deliberately extended by F-R4.
        if s["id"] != "TEMPLATE":
            assert blob(ROOT / s["path"]) == s["blob"]
    principles = [p["id"] for p in json.loads(REF.read_text(encoding="utf-8"))["principles"]]
    assert len(principles) == 12
    assert [p["principle"] for p in record["principleCrosswalk"]] == principles
    assert {p["check"] for p in record["principleCrosswalk"]} == {"PURPOSE", "SCIENCE", "ACCESSIBILITY", "USE", "CURRICOLO"}
    assert all(p["scope"] == "Supporto al riesame; non emissione di esito" for p in record["principleCrosswalk"])
    assert set(record["states"]) == {"DOCUMENTED", "PARTIAL", "GAP", "NOT_APPLICABLE_SCOPE"}
    cases = {c["id"]: c for c in record["cases"]}
    assert len(cases) == len(record["cases"]) == 3
    expected = {
        "trama-missione-118-2026": ("0.4.2-draft", "DISCIPLINARY_CANDIDATE", (6,4,2,0)),
        "pw-missing-information-01": ("1.1.0", "TRANSVERSAL_CANDIDATE", (4,7,0,1)),
        "pw-constraints-tradeoffs-01": ("1.1.0", "TRANSVERSAL_CANDIDATE", (4,7,0,1)),
    }
    assert set(cases) == set(expected)
    for ident, (version, kind, counts) in expected.items():
        case = cases[ident]
        assert case["version"] == version and case["kind"] == kind
        assert case["humanReview"] == "PENDING"
        assert case["runtimeAuthorized"] is False and case["publicationAuthorized"] is False
        assert [r["principle"] for r in case["rows"]] == principles
        assert all(r["status"] in record["states"] and r["finding"] and r["next"] for r in case["rows"])
        assert all(r["locator"].split("/")[0] in source for r in case["rows"])
        assert tuple(sum(r["status"] == s for r in case["rows"]) for s in
                     ("DOCUMENTED","PARTIAL","GAP","NOT_APPLICABLE_SCOPE")) == counts
        if kind == "TRANSVERSAL_CANDIDATE":
            assert [r["principle"] for r in case["rows"] if r["status"] == "NOT_APPLICABLE_SCOPE"] == ["CURR-REF-01/P05"]
    m = cases["trama-missione-118-2026"]
    original = json.loads(M118.read_text(encoding="utf-8"))
    assert m["manifestDigest"] == original["activity"]["manifestDigest"]
    assert [r["principle"] for r in m["rows"] if r["status"] == "GAP"] == ["CURR-REF-01/P01","CURR-REF-01/P05"]
    assert record["next"]["id"] == "F-R4b"
    template = (ROOT / source["TEMPLATE"]["path"]).read_text(encoding="utf-8")
    assert "Riesame dei dodici principi (F-R4, requisito candidato)" in template
    assert "Nessuno equivale a PASS umano" in template


class PedagogicalReviewTests(unittest.TestCase):
    def setUp(self):
        self.record = json.loads(RECEIPT.read_text(encoding="utf-8"))

    def test_three_cases_twelve_principles(self):
        validate(self.record)

    def test_no_automatic_authorization(self):
        for key in BOUNDARIES:
            bad = copy.deepcopy(self.record)
            bad["boundaries"][key] = True
            with self.subTest(key=key), self.assertRaises(AssertionError):
                validate(bad)

    def test_no_missing_principle_or_false_pass(self):
        bad = copy.deepcopy(self.record)
        bad["cases"][0]["rows"].pop()
        with self.assertRaises(AssertionError):
            validate(bad)
        bad = copy.deepcopy(self.record)
        bad["cases"][1]["rows"][0]["status"] = "PASS"
        with self.assertRaises(AssertionError):
            validate(bad)

    def test_no_forced_transversal_binding_or_gap_erasure(self):
        bad = copy.deepcopy(self.record)
        bad["cases"][1]["rows"][4]["status"] = "DOCUMENTED"
        with self.assertRaises(AssertionError):
            validate(bad)
        bad = copy.deepcopy(self.record)
        bad["cases"][0]["rows"][0]["status"] = "DOCUMENTED"
        with self.assertRaises(AssertionError):
            validate(bad)

    def test_no_wrong_source_version(self):
        bad = copy.deepcopy(self.record)
        bad["cases"][0]["manifestDigest"] = "0" * 64
        with self.assertRaises(AssertionError):
            validate(bad)
        bad = copy.deepcopy(self.record)
        bad["sources"][0]["blob"] = "0" * 40
        with self.assertRaises(AssertionError):
            validate(bad)
