import copy
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RECEIPT = ROOT / "docs/research/curr-ref-01-e-r2-nuclei-progression.json"
EXPECTED = {
    "CULTURA_TECNICA_SISTEMI", "METODO_PROGETTUALE", "MATERIALI_CICLO_VITA",
    "DISEGNO_MODELLAZIONE", "ENERGIA_SOSTENIBILITA", "ABITARE_TERRITORIO",
    "ALIMENTAZIONE_FILIERE", "DIGITALE_DATI_IA", "ORIENTAMENTO_PROFESSIONI",
}


def validate(data):
    assert data["status"] == "CANDIDATE_VERTICAL_RECONCILIATION"
    source = data["source"]
    assert source["masterVersion"] == "1.3"
    assert source["fingerprint"] == "b355be71"
    assert source["authority"] == "PROVISIONAL_COMPLETE"
    assert source["pilotAuthority"] == "WORKING_DRAFT_NOT_ADOPTED"
    assert source["exportBlob"] == "d1ab3fd860db9c043452e62359e404e4c9b94bfd"
    assert source["pilotBlob"] == "a13ad797a7d65d68b509ba8e9ca08f6baa586cf9"
    nuclei = data["nuclei"]
    assert len(nuclei) == 9 and {n["id"] for n in nuclei} == EXPECTED
    refs = set()
    counts = {"PARTIAL": 0, "NOT_EXPLICIT": 0}
    for n in nuclei:
        assert n["correspondence"] == "CANDIDATE_SEMANTIC_MATCH"
        assert n["review"] == "PENDING"
        assert n["masterLabel"] and n["reason"]
        assert [g["grade"] for g in n["grades"]] == ["I", "II", "III"]
        assert [g["regime"] for g in n["grades"]] == ["2025", "2012_TRANSITION", "2012_TRANSITION"]
        for g, suffix in zip(n["grades"], ["prima", "seconda", "terza"]):
            assert g["bandId"] == "secondaria-di-primo-grado-tecnologia-classe-" + g["grade"].lower()
            assert g["pilotRef"] == f'technology-progression:{n["id"]}:{suffix}'
            assert g["pilotRef"] not in refs and g["pilotText"]
            refs.add(g["pilotRef"])
            assert g["match"] in counts
            counts[g["match"]] += 1
            if g["match"] == "NOT_EXPLICIT":
                assert g["masterRef"] is None
            else:
                assert g["masterRef"]["field"] == "objectives"
                assert g["masterRef"]["ordinal"] > 0 and g["masterRef"]["text"]
    assert len(refs) == 27 and counts == {"PARTIAL": 18, "NOT_EXPLICIT": 9}
    projection = data["projection"]
    assert projection["primaryProgressionPresent"] == 4
    assert projection["primaryWithoutExplicitTag"] == 1
    assert projection["secondaryIdentityInSource"] == 3
    assert projection["secondaryProgressionFieldPresent"] == 0
    assert projection["materializerRecognizesBothTags"] is True
    assert projection["exportProducerVerified"] is False
    assert {s["section"] for s in data["supplements"]} == {"16.1", "16.2", "15–16.3"}
    assert set(data["boundaries"]) == {"masterEdited", "arenaEdited", "atlasEdited",
                                       "professionalApproval", "automaticMapping", "publication", "studentData"}
    assert all(v is False for v in data["boundaries"].values())


class NucleiProgressionTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(RECEIPT.read_text(encoding="utf-8"))

    def test_pinned_candidate(self):
        validate(self.data)

    def test_reject_invented_relation(self):
        bad = copy.deepcopy(self.data)
        missing = next(g for n in bad["nuclei"] for g in n["grades"] if g["match"] == "NOT_EXPLICIT")
        missing["masterRef"] = {"field": "objectives", "ordinal": 1, "text": "invented"}
        with self.assertRaises(AssertionError):
            validate(bad)

    def test_reject_wrong_regime(self):
        bad = copy.deepcopy(self.data)
        bad["nuclei"][0]["grades"][1]["regime"] = "2025"
        with self.assertRaises(AssertionError):
            validate(bad)

    def test_reject_approval_and_unverified_producer(self):
        for key in self.data["boundaries"]:
            bad = copy.deepcopy(self.data)
            bad["boundaries"][key] = True
            with self.subTest(key=key), self.assertRaises(AssertionError):
                validate(bad)
        bad = copy.deepcopy(self.data)
        bad["projection"]["exportProducerVerified"] = True
        with self.assertRaises(AssertionError):
            validate(bad)
