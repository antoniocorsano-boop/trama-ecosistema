import copy
import importlib.util
import json
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location(
    "validator", Path("scripts/validate_qe01_provider_qualification.py")
)
validator = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)

BASE = json.loads(
    Path("governance/runtime/qe01-provider-qualification-v1.json").read_text()
)


class TestQE01ProviderQualification(unittest.TestCase):
    def test_pending_observation_is_valid_and_not_qualified(self):
        self.assertEqual(validator.validate(BASE), [])
        self.assertFalse(BASE["qualified"])

    def test_catalog_only_identity_is_rejected(self):
        d = copy.deepcopy(BASE)
        d["qualificationPolicy"]["allowCatalogOnlyIdentity"] = True
        self.assertIn("QE01-PQ-POLICY", validator.validate(d))

    def test_silent_substitution_is_rejected(self):
        d = copy.deepcopy(BASE)
        d["qualificationPolicy"]["allowSilentModelSubstitution"] = True
        self.assertIn("QE01-PQ-POLICY", validator.validate(d))

    def test_retry_is_rejected(self):
        d = copy.deepcopy(BASE)
        d["executionConstraints"]["maxRetries"] = 1
        self.assertIn("QE01-PQ-ONESHOT", validator.validate(d))

    def test_student_data_is_rejected(self):
        d = copy.deepcopy(BASE)
        d["executionConstraints"]["personalStudentData"] = True
        self.assertIn("QE01-PQ-DATA", validator.validate(d))

    def test_dos_a1_activation_is_rejected(self):
        d = copy.deepcopy(BASE)
        d["executionConstraints"]["dosA1"] = "ACTIVE"
        self.assertIn("QE01-PQ-DOSA1", validator.validate(d))

    def test_qualified_requires_real_observed_binding(self):
        d = copy.deepcopy(BASE)
        d["qualified"] = True
        d["status"] = "PROVIDER_REAL_QUALIFIED"
        for key in d["gates"]:
            d["gates"][key] = True
        self.assertIn("QE01-PQ-INCOMPLETE", validator.validate(d))


if __name__ == "__main__":
    unittest.main()
