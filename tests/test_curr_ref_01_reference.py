"""Structural checks only: no normative or scientific qualification."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "governance/pedagogy/curr-ref-01-v0.1.json"


class CurrRef01Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(PATH.read_text(encoding="utf-8"))

    def ids(self, key):
        values = [item["id"] for item in self.data[key]]
        self.assertEqual(len(values), len(set(values)), key)
        return set(values)

    def test_provenance_and_unique_ids(self):
        sources = self.ids("sources")
        evidence = self.ids("evidence")
        for group in ("terms", "foundations", "principles", "gaps"):
            self.ids(group)
            for item in self.data[group]:
                self.assertIn(item["evidence"], evidence)
        for item in self.data["history"]:
            self.assertIn(item["evidence"], evidence)
        for item in self.data["evidence"]:
            self.assertIn(item["source"], sources)
            self.assertTrue(item["pages"])
            self.assertEqual(item["classification"], "SOURCE_LOCATOR")
        for source in self.data["sources"]:
            self.assertEqual(source["rights"], "BIBLIOGRAPHIC_REFERENCE_ONLY")

    def test_relationships_are_references_not_schema_constraints(self):
        terms = self.ids("terms")
        evidence = self.ids("evidence")
        seen = set()
        for relation in self.data["relationships"]:
            self.assertIn(relation["from"], terms)
            self.assertIn(relation["to"], terms)
            self.assertTrue(relation["evidence"])
            self.assertTrue(set(relation["evidence"]) <= evidence)
            self.assertEqual(relation["classification"], "DESIGN_RULE")
            self.assertEqual(relation["cardinality"], "MANY_TO_MANY_NOT_ENFORCED")
            triple = (relation["from"], relation["relation"], relation["to"])
            self.assertNotIn(triple, seen)
            seen.add(triple)
        self.assertIn(("certificazione", "si-raccorda-a", "profilo"), seen)
        self.assertIn(("nucleo", "organizza", "osa"), seen)

    def test_principles_pending_and_auditable(self):
        self.assertEqual(len(self.data["principles"]), 12)
        for item in self.data["principles"]:
            self.assertTrue(item["id"].startswith("CURR-REF-01/"))
            self.assertTrue(item["check"])
            self.assertTrue(item["owner"])
            self.assertEqual(item["classification"], "DESIGN_RULE")
            self.assertEqual(item["verification"], "PENDING")
        for item in self.data["productAudit"]:
            self.assertEqual(item["state"], "PLANNED")

    def test_authority_and_safety_boundaries(self):
        self.assertEqual(self.data["status"], "PROPOSED")
        self.assertEqual(self.data["sourceOfInstitutionalCurricolo"], "Arena")
        self.assertIs(self.data["normativeAuthority"], False)
        self.assertIs(self.data["runtimeAuthorization"], False)
        expected = {"changesExistingContracts", "createsCurricoloAuthority",
                    "studentData", "publishesLearningContent",
                    "authorizesAssessmentAutomation", "authorizesDeployment",
                    "sourcePdfRedistribution"}
        self.assertEqual(set(self.data["boundaries"]), expected)
        for value in self.data["boundaries"].values():
            self.assertIs(value, False)
        for field in ("existingVocabulary", "evidenceStandard"):
            self.assertTrue((ROOT / self.data[field]).is_file(), field)
        self.assertTrue(all(gap["blocking"] and gap["resolution"] for gap in self.data["gaps"]))


if __name__ == "__main__":
    unittest.main()
