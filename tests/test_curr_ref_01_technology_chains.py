import copy
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "docs/research/curr-ref-01-e-r1b-technology-chains.json"


def validate(record):
    assert record["state"] == "PROPOSED_RELATIONSHIPS_REVIEW_REQUIRED"
    source = record["source"]
    assert source["masterVersion"] == "1.3"
    assert source["fingerprint"] == "b355be71"
    assert source["exportBlob"] == "d1ab3fd860db9c043452e62359e404e4c9b94bfd"
    assert source["authorityState"] == "PROVISIONAL_COMPLETE"
    assert {x["id"] for x in record["normativeSources"]} == {"IN2012", "IN2025"}
    assert all(x["sourceReview"] == "LOCATED_IN_OFFICIAL_PUBLICATION_NOT_HUMAN_VERIFIED" for x in record["normativeSources"])
    chains = record["chains"]
    assert len(chains) == 2
    assert {x["regime"] for x in chains} == {"IN2012", "IN2025"}
    for chain in chains:
        assert chain["status"] == "PROPOSED"
        assert chain["year"] == "2026/2027"
        assert chain["nationalCompetence"]["scope"] == chain["nationalObjective"]["scope"] == "END_OF_LOWER_SECONDARY"
        assert chain["nucleusRef"] == "DISEGNO_MODELLAZIONE"
        assert chain["local"]["section"] == "7.3.8"
        entries = chain["local"]["entries"]
        assert len(entries) == 4
        assert {x["field"] for x in entries} == {"competences", "objectives", "knowledge", "evidence"}
        assert all(x["ordinal"] > 0 and x["text"] for x in entries)
        assert chain["relationReason"] and chain["evidenceProposal"]
    new = next(c for c in chains if c["regime"] == "IN2025")
    old = next(c for c in chains if c["regime"] == "IN2012")
    assert new["grade"] == "I" and new["local"]["bandId"] == "secondaria-di-primo-grado-tecnologia-classe-i"
    assert old["grade"] == "II" and old["local"]["bandId"] == "secondaria-di-primo-grado-tecnologia-classe-ii"
    assert new["generalObjective"]["scope"] == "END_OF_LOWER_SECONDARY"
    assert new["generalObjective"]["selection"] == "TEAM_PENDING"
    assert new["nationalKnowledge"] is not None
    assert old["generalObjective"] is None and old["nationalKnowledge"] is None
    assert old["generalObjectiveReason"] and old["nationalKnowledgeReason"]
    assert set(record["boundaries"]) == {"masterEdited", "arenaEdited", "professionalApproval", "sourceVerifiedByHuman", "nationalPrescriptivePromotion", "publication", "studentData"}
    assert all(v is False for v in record["boundaries"].values())


class TechnologyAlignmentTests(unittest.TestCase):
    def setUp(self):
        self.record = json.loads(EVIDENCE.read_text(encoding="utf-8"))

    def test_two_regime_specific_chains(self):
        validate(self.record)

    def test_reject_retroactive_ogpf(self):
        bad = copy.deepcopy(self.record)
        bad["chains"][1]["generalObjective"] = bad["chains"][0]["generalObjective"]
        with self.assertRaises(AssertionError):
            validate(bad)

    def test_reject_annualization_as_national_benchmark(self):
        bad = copy.deepcopy(self.record)
        bad["chains"][0]["nationalObjective"]["scope"] = "GRADE_I"
        with self.assertRaises(AssertionError):
            validate(bad)

    def test_reject_unsupported_promotion(self):
        for key in self.record["boundaries"]:
            bad = copy.deepcopy(self.record)
            bad["boundaries"][key] = True
            with self.subTest(key=key), self.assertRaises(AssertionError):
                validate(bad)
