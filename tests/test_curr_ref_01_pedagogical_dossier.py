"""Structural F-R2 dossier checks; no pedagogical or authority qualification."""
import copy
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOSSIER = ROOT / "docs/capabilities/atlas-percorsi/production/CURR-REF-01-F-R2-M118-v0.1.json"
REFERENCE = ROOT / "governance/pedagogy/curr-ref-01-v0.1.json"
TEMPLATE = ROOT / "docs/capabilities/atlas-percorsi/templates/PATHWAY-DOSSIER-TEMPLATE.md"


def validate_candidate(record, principle_ids):
    assert record["status"] == "DOCUMENTARY_CANDIDATE"
    assert record["activity"]["version"] == "0.4.2-draft"
    assert re.fullmatch("[0-9a-f]{64}", record["activity"]["manifestDigest"])
    assert record["activity"]["manifestDigest"] == "c9dc1c6b909d8496dfaf1bc9f7cc43e9ab7e5b2511c0f68e64050e51ed4b5aa4"
    assert record["alignment"]["authority"] == "Arena"
    assert record["alignment"]["authorityState"] == "PROVISIONAL_COMPLETE"
    assert record["alignment"]["state"] == "PROPOSED_NOT_VERIFIED"
    assert record["alignment"]["unresolved"]
    assert re.fullmatch("[0-9a-f]{40}", record["alignment"]["sourceBlob"])
    assert record["alignment"]["masterVersion"] == "1.3"
    assert record["alignment"]["fingerprint"] == "b355be71"
    band_id = record["alignment"]["bandId"]
    candidates = record["alignment"]["objectiveCandidates"]
    assert candidates
    assert len({item["ordinal"] for item in candidates}) == len(candidates)
    for item in candidates:
        assert type(item["ordinal"]) is int and item["ordinal"] > 0
        assert item["text"] and item["reason"]
        assert item["projectionId"] == f'{band_id}-o{item["ordinal"]}'
        assert item["status"] == "PROPOSED"
        assert item["projectionState"] == "F-R0_CANDIDATE_NOT_MERGED"
    assert all(item["state"] == "PROPOSED" for item in record["alignment"]["crossCuttingCandidates"])
    outcomes = record["outcomes"]
    ids = {item["id"] for item in outcomes}
    assert len(ids) == len(outcomes) and ids
    assert all(item["intent"] and item["knowledge"] and item["evidence"] and item["criterion"] for item in outcomes)
    assert all(item["action"] and item["product"] and item["outcomes"] for item in record["phases"])
    mapped = {outcome for phase in record["phases"] for outcome in phase["outcomes"]}
    assert mapped == ids
    assert record["evaluation"]["completionIsCompetence"] is False
    assert record["evaluation"]["rubricState"] == "DESCRIPTIVE_CRITERIA_PROPOSED_NOT_SCALED"
    assert all(record["evaluation"][key] for key in ("process", "product", "knowledge"))
    assert record["representation"]["alternatives"]
    assert record["representation"]["necessity3D"] == "NOT_ESTABLISHED"
    assert set(record["principles"]) == principle_ids
    assert len(record["principles"]) == len(principle_ids)
    assert record["review"] == {
        "human": "PENDING", "science": "PENDING", "binding": "PENDING",
        "accessibility": "PENDING", "use": "PENDING", "publication": "NOT_AUTHORIZED"
    }
    assert set(record["boundaries"]) == {
        "studentData", "assessmentAutomation", "runtimeAuthorized", "publicationAuthorized",
        "changesArena", "changesPackage"
    }
    assert all(value is False for value in record["boundaries"].values())


class PedagogicalDossierTests(unittest.TestCase):
    def setUp(self):
        self.record = json.loads(DOSSIER.read_text(encoding="utf-8"))
        self.ids = {item["id"] for item in json.loads(REFERENCE.read_text(encoding="utf-8"))["principles"]}

    def test_candidate_integrity(self):
        validate_candidate(self.record, self.ids)

    def test_existing_dossier_extension(self):
        content = TEMPLATE.read_text(encoding="utf-8")
        self.assertIn("## 1A. Scheda pedagogica CURR-REF-01", content)
        self.assertIn("## 8A. Experience Quality Gate", content)
        self.assertIn("## 13. Product/specification handoff readiness", content)
        self.assertIn("candidate requirement", content)

    def test_reject_promotion_or_authorization(self):
        for field in ("publicationAuthorized", "runtimeAuthorized", "studentData", "assessmentAutomation"):
            bad = copy.deepcopy(self.record)
            bad["boundaries"][field] = True
            with self.subTest(field=field), self.assertRaises(AssertionError):
                validate_candidate(bad, self.ids)
        bad = copy.deepcopy(self.record)
        bad["alignment"]["objectiveCandidates"][0]["status"] = "VERIFIED"
        with self.assertRaises(AssertionError):
            validate_candidate(bad, self.ids)
        bad = copy.deepcopy(self.record)
        bad["review"]["human"] = "PASS"
        with self.assertRaises(AssertionError):
            validate_candidate(bad, self.ids)

    def test_reject_unresolved_or_wrong_mapping(self):
        bad = copy.deepcopy(self.record)
        bad["phases"][0]["outcomes"] = ["UNKNOWN"]
        with self.assertRaises(AssertionError):
            validate_candidate(bad, self.ids)
        bad = copy.deepcopy(self.record)
        bad["alignment"]["objectiveCandidates"][0]["projectionId"] = "wrong-band-o2"
        with self.assertRaises(AssertionError):
            validate_candidate(bad, self.ids)
        bad = copy.deepcopy(self.record)
        bad["activity"]["manifestDigest"] = "0" * 64
        with self.assertRaises(AssertionError):
            validate_candidate(bad, self.ids)


if __name__ == "__main__":
    unittest.main()
