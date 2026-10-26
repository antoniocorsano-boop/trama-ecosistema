import copy
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "governance/runtime/argo-g5c-local-proof-package-v1.json"
VALIDATOR = ROOT / "scripts/validate_argo_g5c_local_proof_package.py"
DOSSIER = ROOT / "docs/runtime/ARGO-G5C-LOCAL-PROOF-PACKAGE-v1.md"
GOVERNANCE = ROOT / ".github/workflows/governance.yml"


def load_validator():
    if not VALIDATOR.exists():
        raise AssertionError("Argo G5-C local proof validator is missing")
    spec = importlib.util.spec_from_file_location("argo_g5c_validator", VALIDATOR)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def load_manifest():
    if not MANIFEST.exists():
        raise AssertionError("Argo G5-C local proof manifest is missing")
    return json.loads(MANIFEST.read_text(encoding="utf-8"))


class ArgoG5CLocalProofPackageTests(unittest.TestCase):
    def test_package_artifacts_exist(self):
        self.assertTrue(MANIFEST.exists(), "Argo G5-C local proof manifest is missing")
        self.assertTrue(VALIDATOR.exists(), "Argo G5-C local proof validator is missing")

    def test_canonical_package_is_fail_closed_and_valid(self):
        validator = load_validator()
        data = load_manifest()
        self.assertEqual("P4", data["packageId"])
        self.assertEqual("ARGO_G5C_LOCAL_PROOF_PACKAGE_PREPARED", data["status"])
        self.assertFalse(data["executable"])
        self.assertFalse(data["runtimeAuthorized"])
        self.assertEqual("LOCAL_EVIDENCE_REQUIRED", data["finalGate"])
        self.assertEqual([], validator.validate(data))

    def test_claiming_didup_or_libreoffice_pass_without_evidence_is_rejected(self):
        validator = load_validator()
        data = load_manifest()
        for gate in ("LIBREOFFICE_OPENING_ATTESTED", "DIDUP_MANUAL_IMPORT_ATTESTED"):
            bad = copy.deepcopy(data)
            bad["gates"][gate] = "PASS"
            bad["evidenceRefs"].pop(gate, None)
            self.assertIn("ARGOG5C-UNBACKED-LOCAL-GATE", validator.validate(bad), gate)

    def test_runtime_credentials_and_automation_are_rejected(self):
        validator = load_validator()
        data = load_manifest()
        bad = copy.deepcopy(data)
        bad["prohibitions"]["argoCredentials"] = True
        bad["prohibitions"]["browserAutomation"] = True
        bad["prohibitions"]["externalWrite"] = True
        bad["runtimeAuthorized"] = True
        errors = validator.validate(bad)
        self.assertIn("ARGOG5C-RUNTIME-AUTHORITY-FORBIDDEN", errors)
        self.assertIn("ARGOG5C-CREDENTIALS-FORBIDDEN", errors)
        self.assertIn("ARGOG5C-BROWSER-AUTOMATION-FORBIDDEN", errors)
        self.assertIn("ARGOG5C-EXTERNAL-WRITE-FORBIDDEN", errors)

    def test_source_pr647_state_is_preserved(self):
        validator = load_validator()
        data = load_manifest()
        source = data["sourcePackage"]
        self.assertEqual("antoniocorsano-boop/docente-os-2026-27", source["repository"])
        self.assertEqual(647, source["pullRequest"])
        self.assertEqual("e5dd179f074421f08b2c7952238fa0764d643ce6", source["exactHead"])
        self.assertEqual("DRAFT", source["pullRequestState"])
        self.assertEqual("success", source["productCiConclusion"])
        self.assertEqual("PRONTA_PER_PROVA_REALE", source["qualifiedState"])
        self.assertEqual([], validator.validate(data))

    def test_future_local_steps_are_minimal_and_ordered(self):
        validator = load_validator()
        data = load_manifest()
        steps = data["futureLocalProcedure"]
        self.assertEqual([step["step"] for step in steps], [1, 2, 3, 4, 5, 6, 7])
        self.assertIn("LibreOffice", steps[2]["action"])
        self.assertIn("didUP", steps[4]["action"])
        self.assertEqual([], validator.validate(data))

    def test_dossier_and_explicit_governance_gate_exist(self):
        self.assertTrue(DOSSIER.exists(), "Argo G5-C dossier is missing")
        dossier = DOSSIER.read_text(encoding="utf-8")
        for token in (
            "ARGO_G5C_LOCAL_PROOF_PACKAGE_PREPARED",
            "LOCAL_EVIDENCE_REQUIRED",
            "LibreOffice",
            "BIFF8",
            "didUP",
            "Docente OS #647",
            "e5dd179f074421f08b2c7952238fa0764d643ce6",
            "DOS-A1=RUNTIME_DEFERRED",
            "DO NOT DECLARE PASS",
        ):
            self.assertIn(token, dossier)
        governance = GOVERNANCE.read_text(encoding="utf-8")
        self.assertIn("Validate Argo G5-C local proof package", governance)
        self.assertIn("python3 scripts/validate_argo_g5c_local_proof_package.py", governance)
        self.assertIn("python3 -m unittest tests.test_argo_g5c_local_proof_package -v", governance)


if __name__ == "__main__":
    unittest.main()
