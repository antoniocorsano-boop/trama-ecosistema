import copy
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RECEIPT = ROOT / "docs/research/curr-ref-01-e-r3-infanzia.json"


def validate(data):
    assert data["status"] == "NATIVE_FIELD_ALIGNMENT_CANDIDATE"
    source = data["source"]
    assert source["masterVersion"] == "1.3"
    assert source["authorityState"] == "PROVISIONAL_COMPLETE"
    assert source["fingerprint"] == "b355be71"
    assert source["exportBlob"] == "d1ab3fd860db9c043452e62359e404e4c9b94bfd"
    assert source["review"] == "LOCATED_NOT_HUMAN_VERIFIED"
    fields = data["fields"]
    assert len(fields) == len({f["id"] for f in fields}) == 5
    assert sum(len(f["targets"]) for f in fields) == 10
    bands = [b for f in fields for b in f["bands"]]
    assert len(bands) == len({b["id"] for b in bands}) == 15
    for f in fields:
        assert f["scope"] == "FIELD_OF_EXPERIENCE"
        assert f["competencesAreFieldLevel"] is True
        assert [b["age"] for b in f["bands"]] == [3, 4, 5]
        for b in f["bands"]:
            assert b["sourceTextMatch"] is True
            assert b["objectiveCount"] > 0 and b["knowledgeCount"] > 0
            assert b["evidenceCount"] == b["connectionCount"] == 0
    world = data["worldField"]
    field = next(f for f in fields if f["id"] == world["id"])
    assert set(field["targets"]) == {"matematica", "scienze", "tecnologia"}
    assert world["nationalCompetenceCount"] == world["nationalObjectiveCount"] == 5
    assert world["nationalScope"] == "END_OF_INFANCY_FIELD_NOT_AGE_THRESHOLD"
    assert [r["bandId"] for r in world["localAgeRefs"]] == [b["id"] for b in field["bands"]]
    assert all(r["status"] == "PROPOSED" for r in world["localAgeRefs"])
    t = world["transition"]
    assert t["from"] == field["bands"][-1]["id"]
    assert t["to"] == "primaria-tecnologia-classe-i"
    assert t["kind"] == "PROPOSED_VERTICAL_CONTINUITY"
    assert t["noPrerequisiteGate"] is True
    assert set(t["otherTargets"]) == {"matematica", "scienze"}
    assert all(v is False for v in data["boundaries"].values())
    assert len(data["boundaries"]) == 10


class InfancyAlignmentTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(RECEIPT.read_text(encoding="utf-8"))

    def test_native_fields_and_transition(self):
        validate(self.data)

    def test_no_disciplinary_equivalence(self):
        bad = copy.deepcopy(self.data)
        bad["fields"][0]["scope"] = "DISCIPLINE"
        with self.assertRaises(AssertionError):
            validate(bad)

    def test_no_national_age_threshold(self):
        bad = copy.deepcopy(self.data)
        bad["worldField"]["transition"]["noPrerequisiteGate"] = False
        with self.assertRaises(AssertionError):
            validate(bad)

    def test_no_implicit_authority_or_publication(self):
        for key in self.data["boundaries"]:
            bad = copy.deepcopy(self.data)
            bad["boundaries"][key] = True
            with self.subTest(key=key), self.assertRaises(AssertionError):
                validate(bad)
