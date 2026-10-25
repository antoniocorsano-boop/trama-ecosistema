import copy
import json
import unittest
from pathlib import Path

from scripts.validate_didactic_composer_v1 import (
    canonical_json,
    compute_content_digest,
    qualify_matrix,
    semantic_composition_payload,
    validate_adoption_receipt,
    validate_proposal,
    validate_request,
)
from scripts.validate_governed_product_identities import load_product_registry


ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "governance/runtime/didactic-composer-v1-fixtures.json"


class DidacticComposerV1Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.matrix = json.loads(FIXTURES.read_text(encoding="utf-8"))
        cls.registry = load_product_registry()
        cls.request = cls.matrix["request"]
        cls.alpha = cls.matrix["proposals"][0]
        cls.beta = cls.matrix["proposals"][1]
        cls.receipt = cls.matrix["adoptionReceipt"]

    def test_valid_request_passes(self):
        self.assertEqual(validate_request(self.request, self.registry), [])

    def test_valid_proposals_pass(self):
        self.assertEqual(validate_proposal(self.request, self.alpha), [])
        self.assertEqual(validate_proposal(self.request, self.beta), [])

    def test_two_fake_adapters_have_same_semantic_digest_but_distinct_provenance(self):
        self.assertEqual(
            semantic_composition_payload(self.alpha),
            semantic_composition_payload(self.beta),
        )
        self.assertEqual(
            compute_content_digest(self.alpha),
            compute_content_digest(self.beta),
        )
        self.assertNotEqual(self.alpha["provenance"], self.beta["provenance"])

    def test_canonical_json_is_deterministic(self):
        self.assertEqual(
            canonical_json(self.alpha),
            canonical_json(copy.deepcopy(self.alpha)),
        )

    def test_valid_adoption_receipt_passes(self):
        self.assertEqual(validate_adoption_receipt(self.receipt, self.alpha), [])

    def test_valid_matrix_qualifies(self):
        result = qualify_matrix(self.matrix, self.registry)
        self.assertTrue(result["pass"])
        self.assertEqual(result["validErrors"], [])

    def test_all_adversarial_fixtures_fail_with_expected_codes(self):
        self.assertGreaterEqual(len(self.matrix["invalid"]), 14)
        result = qualify_matrix(self.matrix, self.registry)
        by_id = {item["id"]: item for item in result["invalidResults"]}
        for item in self.matrix["invalid"]:
            with self.subTest(item=item["id"]):
                observed = by_id[item["id"]]
                self.assertTrue(observed["errors"])
                for code in item["expect"]:
                    self.assertIn(code, observed["errors"])
                self.assertTrue(observed["pass"])

    def test_recursive_student_personal_data_cases_are_all_rejected(self):
        result = qualify_matrix(self.matrix, self.registry)
        by_id = {item["id"]: item for item in result["invalidResults"]}
        ids = [
            "personal-student-name",
            "personal-student-id",
            "personal-student-email",
            "personal-grade",
            "personal-diagnosis",
            "personal-health-data",
        ]
        for case_id in ids:
            with self.subTest(case_id=case_id):
                self.assertIn("DC-03", by_id[case_id]["errors"])

    def test_transitional_context_is_preserved_by_both_valid_proposals(self):
        self.assertEqual(self.request["curricoloContext"]["applicabilityStatus"], "TRANSITIONAL")
        for proposal in (self.alpha, self.beta):
            self.assertEqual(proposal["curricoloBinding"]["applicabilityStatus"], "TRANSITIONAL")
            self.assertEqual(
                proposal["curricoloBinding"]["regimeRef"],
                self.request["curricoloContext"]["regimeRef"],
            )

    def test_drive_export_is_deferred_in_both_valid_proposals(self):
        for proposal in (self.alpha, self.beta):
            self.assertEqual(
                proposal["projectionHints"]["driveExport"],
                "DEFERRED_WRITE_SLICE",
            )

    def test_receipt_is_human_and_product_local(self):
        self.assertEqual(self.receipt["decidedBy"], "HUMAN")
        self.assertEqual(self.receipt["product"], "REGISTRO_DOCENTE")
        self.assertNotIn("globalApproval", self.receipt)
        self.assertNotIn("adoptedProducts", self.receipt)


if __name__ == "__main__":
    unittest.main()
