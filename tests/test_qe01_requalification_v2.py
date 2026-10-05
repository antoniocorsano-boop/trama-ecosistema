import copy
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "governance/runtime/qe01-requalification-v2.json"
VALIDATOR = ROOT / "scripts/validate_qe01_requalification_v2.py"


def load_validator():
    if not VALIDATOR.exists():
        raise AssertionError("QE-01 v2 validator is missing")
    spec = importlib.util.spec_from_file_location("qe01_v2_validator", VALIDATOR)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def load_manifest():
    if not MANIFEST.exists():
        raise AssertionError("QE-01 v2 manifest is missing")
    return json.loads(MANIFEST.read_text(encoding="utf-8"))


class Qe01RequalificationV2Tests(unittest.TestCase):
    def test_requalification_artifacts_exist(self):
        self.assertTrue(MANIFEST.exists(), "QE-01 v2 manifest is missing")
        self.assertTrue(VALIDATOR.exists(), "QE-01 v2 validator is missing")

    def test_canonical_package_is_non_executable_and_valid(self):
        validator = load_validator()
        data = load_manifest()
        self.assertFalse(data["executable"])
        self.assertEqual(data["status"], "REQUALIFICATION_PREPARED_NOT_AUTHORIZED")
        self.assertEqual([], validator.validate(data))

    def test_executable_state_is_rejected(self):
        validator = load_validator()
        data = load_manifest()
        data["executable"] = True
        self.assertIn("QE01V2-EXECUTABLE-FORBIDDEN", validator.validate(data))

    def test_retries_mutation_and_student_data_are_rejected(self):
        validator = load_validator()
        data = load_manifest()
        bad = copy.deepcopy(data)
        bad["executionConstraints"]["maxRetries"] = 1
        bad["executionConstraints"]["mutation"] = True
        bad["executionConstraints"]["personalStudentData"] = True
        errors = validator.validate(bad)
        self.assertIn("QE01V2-RETRIES", errors)
        self.assertIn("QE01V2-MUTATION", errors)
        self.assertIn("QE01V2-STUDENT-DATA", errors)

    def test_prior_pr212_authorization_cannot_be_current(self):
        validator = load_validator()
        data = load_manifest()
        bad = copy.deepcopy(data)
        bad["priorCandidate"]["authorizationReusable"] = True
        errors = validator.validate(bad)
        self.assertIn("QE01V2-STALE-AUTHORITY", errors)

    def test_local_gates_cannot_pass_without_current_evidence(self):
        validator = load_validator()
        data = load_manifest()
        for gate in (
            "LOCAL_RUNTIME_BINDING_REOBSERVED",
            "LOCAL_ADAPTER_VERSION_REOBSERVED",
            "LOCAL_PROVIDER_ROUTE_REOBSERVED",
            "LOCAL_CREDENTIAL_REFERENCE_REOBSERVED",
            "EXACT_EXECUTION_TARGET_FROZEN",
            "HUMAN_EXACT_HEAD_REVIEW",
            "HUMAN_AUTHORIZATION_FOR_NEW_EXECUTION",
        ):
            bad = copy.deepcopy(data)
            bad["gates"][gate] = "PASS"
            bad["evidenceRefs"].pop(gate, None)
            self.assertIn("QE01V2-UNBACKED-GATE", validator.validate(bad), gate)

    def test_prior_failure_receipt_is_preserved_exactly(self):
        validator = load_validator()
        data = load_manifest()
        prior = data["priorFailure"]
        self.assertEqual("deepseek-official", prior["providerRouteObserved"])
        self.assertEqual("nvidia", prior["expectedProviderId"])
        self.assertEqual("STALE_BINDING", prior["failureClass"])
        self.assertEqual("MISSING_CREDENTIAL", prior["providerErrorClass"])
        self.assertFalse(prior["modelInvoked"])
        self.assertFalse(prior["validGenerationRequestSent"])
        self.assertEqual([], validator.validate(data))


if __name__ == "__main__":
    unittest.main()
