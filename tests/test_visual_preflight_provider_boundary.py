import importlib.util
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "services" / "visual-factory-hf" / "contract.py"


def load_contract():
    spec = importlib.util.spec_from_file_location("visual_factory_hf_contract_vpc", CONTRACT)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class VisualPreflightProviderBoundaryTests(unittest.TestCase):
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
                "prompt": "exact compiled prompt",
                "negativeConstraints": ["dashboard aesthetic"],
                "referenceInputs": [],
                "aspectRatio": "3:4",
                "maxVariants": 1,
                "preflightReceiptId": "vpc-0123456789abcdef0123456789abcdef",
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

    def test_exact_bound_plan_is_accepted_and_preserved(self):
        plan = self.contract.validate_plan(self.plan())
        job = self.contract.compile_execution_jobs(plan)[0]
        self.assertEqual(job.max_variants, 1)
        self.assertEqual(job.preflight_receipt_id, "vpc-0123456789abcdef0123456789abcdef")
        self.assertEqual(job.preflight_spec_digest, "b" * 64)
        self.assertEqual(job.compiled_prompt_digest, "c" * 64)

    def test_missing_or_invalid_preflight_binding_fails_closed(self):
        cases = [
            ("preflightReceiptId", None, "PREFLIGHT_RECEIPT_REQUIRED"),
            ("preflightSpecDigest", None, "PREFLIGHT_SPEC_DIGEST_INVALID"),
            ("preflightSpecDigest", "NOT_A_DIGEST", "PREFLIGHT_SPEC_DIGEST_INVALID"),
            ("compiledPromptDigest", None, "COMPILED_PROMPT_DIGEST_INVALID"),
            ("compiledPromptDigest", "D" * 64, "COMPILED_PROMPT_DIGEST_INVALID"),
            ("preflightState", None, "PREFLIGHT_NOT_PASSED"),
            ("preflightState", "PREFLIGHT_REVISE", "PREFLIGHT_NOT_PASSED"),
        ]
        for field, value, error in cases:
            with self.subTest(field=field, value=value):
                plan = self.plan()
                if value is None:
                    plan["jobs"][0].pop(field, None)
                else:
                    plan["jobs"][0][field] = value
                with self.assertRaisesRegex(ValueError, error):
                    self.contract.validate_plan(plan)

    def test_more_than_one_variant_is_rejected(self):
        plan = self.plan()
        plan["jobs"][0]["maxVariants"] = 2
        with self.assertRaisesRegex(ValueError, "MAX_VARIANTS_MUST_BE_ONE"):
            self.contract.validate_plan(plan)


if __name__ == "__main__":
    unittest.main()
