import copy
import json
import unittest

from scripts.validate_or06_cross_ecosystem_readonly_proof import (
    load_matrix,
    materialize_invalid,
    qualify_matrix,
    validate_case,
)


class Or06CrossEcosystemProofTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.matrix = load_matrix()

    def test_valid_fixture_passes(self):
        self.assertEqual(validate_case(self.matrix["valid"]), [])

    def test_all_negative_fixtures_fail_with_expected_codes(self):
        valid = self.matrix["valid"]
        self.assertGreaterEqual(len(self.matrix["invalid"]), 7)
        for item in self.matrix["invalid"]:
            with self.subTest(item=item["id"]):
                errors = validate_case(materialize_invalid(valid, item))
                self.assertTrue(errors)
                for code in item["expect"]:
                    self.assertIn(code, errors)

    def test_matrix_qualification_passes(self):
        result = qualify_matrix(self.matrix)
        self.assertTrue(result["pass"])

    def test_atlas_is_optional(self):
        case = copy.deepcopy(self.matrix["valid"])
        case["input"].pop("atlas", None)
        self.assertEqual(validate_case(case), [])

    def test_observation_is_deterministic(self):
        observation = self.matrix["valid"]["observation"]
        a = json.dumps(observation, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        b = json.dumps(copy.deepcopy(observation), ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        self.assertEqual(a, b)

    def test_mutation_authority_fails_closed(self):
        case = copy.deepcopy(self.matrix["valid"])
        case["capabilities"].append({
            "key": "lesson.preparation.publish",
            "supported": True,
            "available": True,
            "authorized": True,
        })
        self.assertIn("CE-04", validate_case(case))


if __name__ == "__main__":
    unittest.main()
