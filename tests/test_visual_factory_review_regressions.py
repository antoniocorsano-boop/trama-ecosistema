import importlib.util
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "services" / "visual-factory-hf" / "contract.py"
APP = ROOT / "services" / "visual-factory-hf" / "app.py"
RECEIPT_SCHEMA = ROOT / "schemas" / "atlas-visual-preflight-receipt.v0.1.schema.json"
OFFLINE_PREFLIGHT = ROOT / "products" / "studio-atlas" / "scripts" / "compile-canonical-visual-preflight.ts"


def load_contract():
    spec = importlib.util.spec_from_file_location("visual_factory_review_contract", CONTRACT)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def valid_plan():
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
            "prompt": "bounded reference prompt",
            "negativeConstraints": [],
            "referenceInputs": [],
            "referenceInputDigests": [],
            "aspectRatio": "3:4",
            "maxVariants": 1,
            "preflightReceiptId": "vpc-test",
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


class VisualFactoryReviewRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.contract = load_contract()

    def test_max_variants_rejects_json_booleans(self):
        for malformed in (True, False):
            plan = valid_plan()
            plan["jobs"][0]["maxVariants"] = malformed
            with self.assertRaisesRegex(ValueError, "MAX_VARIANTS_MUST_BE_ONE"):
                self.contract.validate_plan(plan)

    def test_receipt_schema_encodes_not_available_human_preflight_fail_closed_rule(self):
        schema = json.loads(RECEIPT_SCHEMA.read_text(encoding="utf-8"))
        rules = schema.get("allOf", [])
        unavailable_rule = None
        for rule in rules:
            mode = (
                rule.get("if", {})
                .get("properties", {})
                .get("semanticCritic", {})
                .get("properties", {})
                .get("mode", {})
                .get("const")
            )
            if mode == "NOT_AVAILABLE":
                unavailable_rule = rule
                break
        self.assertIsNotNone(unavailable_rule)
        then = unavailable_rule["then"]
        self.assertTrue(then["properties"]["humanPreflightRequired"]["const"])
        self.assertIn("humanPreflightDecision", then["required"])
        self.assertEqual(
            then["properties"]["semanticCritic"]["properties"]["result"]["const"],
            "NOT_RUN",
        )
        encoded = json.dumps(rules, sort_keys=True)
        self.assertIn("PREFLIGHT_PASS", encoded)
        self.assertIn("PREFLIGHT_REVISE", encoded)
        self.assertIn("humanPreflightDecision", encoded)

    def test_hf_reference_network_digest_and_decode_are_outside_gpu_function(self):
        source = APP.read_text(encoding="utf-8")
        gpu_start = source.index("@spaces.GPU")
        execute_start = source.index("def execute_plan")
        gpu_segment = source[gpu_start:execute_start]
        execute_segment = source[execute_start:]
        self.assertNotIn("_load_references(", gpu_segment)
        self.assertIn("_prepare_verified_references(plan)", execute_segment)
        self.assertLess(
            execute_segment.index("_prepare_verified_references(plan)"),
            execute_segment.index("_execute_admitted("),
        )

    def test_offline_shot_cli_requires_reference_lock_evidence(self):
        source = OFFLINE_PREFLIGHT.read_text(encoding="utf-8")
        self.assertIn('argument("--reference-locks")', source)
        self.assertIn("VPC_CANONICAL_SHOT_REFERENCE_LOCKS_REQUIRED", source)


if __name__ == "__main__":
    unittest.main()
