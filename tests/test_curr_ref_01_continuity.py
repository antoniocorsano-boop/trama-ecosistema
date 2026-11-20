import copy
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RECEIPT = ROOT / "docs/research/curr-ref-01-e-r2b-continuity.json"
PRIOR = ROOT / "docs/research/curr-ref-01-e-r2-nuclei-progression.json"


def validate(data, prior):
    assert data["status"] == "DOCUMENTARY_RECONCILIATION_CANDIDATE"
    assert data["sources"]["master"]["state"] == data["sources"]["draft"]["state"] == "NOT_IN_FORCE"
    assert data["sources"]["draft"]["controlVersion"] == "1.2"
    assert data["sources"]["draft"]["coverVersion"] == "1.0"
    assert data["sources"]["arena"]["exportRevisionMatchesCurrentDrive"] is False
    old_gaps = {(n["id"], g["grade"]) for n in prior["nuclei"] for g in n["grades"] if g["match"] == "NOT_EXPLICIT"}
    reviews = data["gapReview"]
    assert len(reviews) == len(old_gaps) == 9
    assert {(x["nucleus"], x["grade"]) for x in reviews} == old_gaps
    assert all(x["locators"] and x["reason"] for x in reviews)
    assert sum(x["state"] == "ADDITIONAL_PARTIAL_EVIDENCE" for x in reviews) == 3
    assert sum(x["state"] == "REMAINS_NOT_SPECIFIC" for x in reviews) == 6
    taxonomy = data["taxonomy"]
    assert taxonomy["verticalNuclei"] == 9 and taxonomy["annualOperationalGroups"] == 3
    assert taxonomy["integratedLocalAxis"] == 1 and taxonomy["localAxisIsNationalNucleus"] is False
    t = data["transition"]
    assert t["status"] == "PROPOSED"
    assert t["from"]["regime"] == "2012_TRANSITION" and t["to"]["regime"] == "2025"
    assert t["from"]["bandId"] == "primaria-tecnologia-classe-v"
    assert t["to"]["bandId"] == "secondaria-di-primo-grado-tecnologia-classe-i"
    assert t["cohortRule"] and t["delta"] and t["evidenceProposal"]
    assert data["exportDiagnosis"]["generatorInBootstrap"] is False
    assert data["exportDiagnosis"]["generatorLocatedInRepositorySearch"] is False
    assert set(data["boundaries"]) == {"masterEdited", "arenaEdited", "atlasEdited", "professionalApproval", "automaticMapping", "publication", "studentData"}
    assert all(x is False for x in data["boundaries"].values())


class ContinuityTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(RECEIPT.read_text(encoding="utf-8"))
        self.prior = json.loads(PRIOR.read_text(encoding="utf-8"))

    def test_documented_reconciliation(self):
        validate(self.data, self.prior)

    def test_no_gap_promotion(self):
        bad = copy.deepcopy(self.data)
        bad["gapReview"][0]["state"] = "APPROVED"
        with self.assertRaises(AssertionError):
            validate(bad, self.prior)

    def test_no_retroactive_regime_or_axis_promotion(self):
        for group, key, value in (("taxonomy", "localAxisIsNationalNucleus", True),
                                  ("transition", "status", "APPROVED"),
                                  ("exportDiagnosis", "generatorLocatedInRepositorySearch", True)):
            bad = copy.deepcopy(self.data)
            bad[group][key] = value
            with self.subTest(key=key), self.assertRaises(AssertionError):
                validate(bad, self.prior)
        bad = copy.deepcopy(self.data)
        bad["transition"]["from"]["regime"] = "2025"
        with self.assertRaises(AssertionError):
            validate(bad, self.prior)
