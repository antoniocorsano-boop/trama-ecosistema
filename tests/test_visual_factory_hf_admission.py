import importlib.util
import json
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "services" / "visual-factory-hf" / "contract.py"
APP = ROOT / "services" / "visual-factory-hf" / "app.py"


def load_contract():
    spec = importlib.util.spec_from_file_location("visual_factory_hf_admission_contract", CONTRACT)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class VisualFactoryHfAdmissionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.contract = load_contract()

    def plan(self):
        return {
            "schemaVersion": "atlas.visual-generation-plan/v0.1",
            "pathwayId": "pw-strategy-selection-01-museo-zero",
            "packageDigest": "a" * 64,
            "planType": "REFERENCE_GENERATION",
            "decision": "REFERENCE_GENERATION_READY",
            "jobs": [{
                "jobId": "reference-lia",
                "purpose": "CHARACTER_REFERENCE",
                "subjectRef": "lia",
                "workflowFamily": "flux2-klein-4b/v0.2",
                "prompt": "cinematic editorial museum scene",
                "negativeConstraints": ["dashboard aesthetic"],
                "referenceInputs": [],
                "referenceInputDigests": [],
                "aspectRatio": "3:4",
                "maxVariants": 1,
                "preflightReceiptId": "vpc-test-receipt",
                "preflightSpecDigest": "b" * 64,
                "compiledPromptDigest": "c" * 64,
                "preflightState": "PREFLIGHT_PASS",
            }],
            "blockers": [],
            "paidComputeAuthorized": False,
            "allowQualityDowngrade": False,
            "runtimeAuthorized": False,
            "publicationAuthorityGranted": False,
        }

    def test_valid_signed_admission_is_bound_to_exact_plan_and_expiry(self):
        secret = "server-only-admission-secret"
        plan = self.plan()
        capability = self.contract.create_provider_admission(
            plan,
            secret,
            issued_at_epoch=1_800_000_000,
            ttl_seconds=120,
        )
        self.contract.verify_provider_admission(
            plan,
            capability,
            secret,
            now_epoch=1_800_000_060,
        )
        forged = json.loads(json.dumps(plan))
        forged["jobs"][0]["prompt"] += " forged"
        with self.assertRaisesRegex(ValueError, "PROVIDER_ADMISSION_PLAN_MISMATCH"):
            self.contract.verify_provider_admission(
                forged,
                capability,
                secret,
                now_epoch=1_800_000_060,
            )
        with self.assertRaisesRegex(ValueError, "PROVIDER_ADMISSION_EXPIRED"):
            self.contract.verify_provider_admission(
                plan,
                capability,
                secret,
                now_epoch=1_800_000_121,
            )

    def test_missing_or_wrong_secret_cannot_authorize_provider_execution(self):
        plan = self.plan()
        capability = self.contract.create_provider_admission(
            plan,
            "issuer-secret",
            issued_at_epoch=1_800_000_000,
            ttl_seconds=120,
        )
        for secret in ("", "wrong-secret"):
            with self.assertRaisesRegex(ValueError, "PROVIDER_ADMISSION"):
                self.contract.verify_provider_admission(
                    plan,
                    capability,
                    secret,
                    now_epoch=1_800_000_060,
                )

    def test_hf_execute_endpoint_requires_separate_admission_payload(self):
        source = APP.read_text(encoding="utf-8")
        self.assertIn("admission_json", source)
        self.assertIn("VISUAL_FACTORY_ADMISSION_SECRET", source)
        self.assertIn("verify_provider_admission", source)


if __name__ == "__main__":
    unittest.main()
