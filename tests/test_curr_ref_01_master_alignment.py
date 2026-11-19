import copy
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "docs/research/curr-ref-01-e-r1-master-alignment.json"


def validate(record):
    assert record["status"] == "READ_ONLY_SOURCE_COMPARISON"
    assert record["master"]["version"] == record["arena"]["masterVersion"] == "1.3"
    assert record["master"]["state"] == "MATERIALIZED_HUMAN_VALIDATION_OPEN_NOT_IN_FORCE"
    assert record["arena"]["authorityState"] == "PROVISIONAL_COMPLETE"
    assert record["master"]["sourceRead"] is True
    assert record["master"]["privateRevisionNotRepublished"] is True
    assert record["arena"]["exportBlob"] == "d1ab3fd860db9c043452e62359e404e4c9b94bfd"
    assert record["arena"]["fingerprint"] == "b355be71"
    bands = record["bands"]
    assert len(bands) == len({b["id"] for b in bands}) == 8
    assert all(b["sourceTextMatch"] and b["chain"] == "NOT_FULLY_DEMONSTRATED" for b in bands)
    assert sum(b["progressionField"] for b in bands) == 4
    assert sum(b["formativeIdentityInSource"] for b in bands) == 3
    assert all(not b["progressionField"] for b in bands if b["formativeIdentityInSource"])
    assert all(all(n > 0 for n in b["counts"].values()) for b in bands)
    assert [b["regime"] for b in bands] == ["2025"] + ["2012_TRANSITION"] * 4 + ["2025"] + ["2012_TRANSITION"] * 2
    assert record["normative"]["scope"] == "TRANSITION_ONLY_NOT_ELEMENT_VALIDATION"
    assert len(record["findings"]) == 7
    assert record["next"]["priority"] == "E-R1b"
    assert set(record["boundaries"]) == {"masterEdited", "arenaEdited", "atlasEdited", "officialElementValidation", "professionalApproval", "publication", "studentData"}
    assert all(v is False for v in record["boundaries"].values())


class MasterAlignmentTests(unittest.TestCase):
    def setUp(self):
        self.record = json.loads(PATH.read_text(encoding="utf-8"))

    def test_source_comparison(self):
        validate(self.record)

    def test_reject_unsupported_approval(self):
        for key in self.record["boundaries"]:
            bad = copy.deepcopy(self.record)
            bad["boundaries"][key] = True
            with self.subTest(key=key), self.assertRaises(AssertionError):
                validate(bad)

    def test_reject_progression_invention(self):
        bad = copy.deepcopy(self.record)
        bad["bands"][5]["progressionField"] = True
        with self.assertRaises(AssertionError):
            validate(bad)

    def test_reject_regime_promotion(self):
        bad = copy.deepcopy(self.record)
        bad["bands"][6]["regime"] = "2025"
        with self.assertRaises(AssertionError):
            validate(bad)
