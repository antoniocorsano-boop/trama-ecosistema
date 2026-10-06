import importlib.util
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = ROOT / "services" / "visual-factory-hf" / "contract.py"
APP_PATH = ROOT / "services" / "visual-factory-hf" / "app.py"


def load_contract():
    spec = importlib.util.spec_from_file_location("visual_factory_hf_reference_contract", CONTRACT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class VisualFactoryHfReferenceIntegrityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.contract = load_contract()

    def plan(self):
        return {
            "schemaVersion": "atlas.visual-generation-plan/v0.1",
            "pathwayId": "pw-strategy-selection-01-museo-zero",
            "packageDigest": "a" * 64,
            "planType": "SHOT_GENERATION",
            "decision": "SHOT_GENERATION_READY",
            "jobs": [{
                "jobId": "shot-F4",
                "purpose": "SCENE_FRAME",
                "subjectRef": "F4",
                "shotId": "F4",
                "sceneRef": "MZ4_TEST_MAPPING",
                "workflowFamily": "flux2-klein-4b/v0.2",
                "prompt": "museum control booth",
                "negativeConstraints": [],
                "referenceInputs": ["https://assets.invalid/teo.webp"],
                "referenceInputDigests": ["d" * 64],
                "aspectRatio": "16:9",
                "maxVariants": 1,
                "preflightReceiptId": "vpc-fixture",
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

    def test_scene_reference_digests_are_required_and_compiled_in_order(self):
        plan = self.plan()
        jobs = self.contract.compile_execution_jobs(plan)
        self.assertEqual(jobs[0].reference_input_digests, ("d" * 64,))

        missing = self.plan()
        del missing["jobs"][0]["referenceInputDigests"]
        with self.assertRaisesRegex(ValueError, "REFERENCE_INPUT_DIGEST_INVALID"):
            self.contract.validate_plan(missing)

        mismatch = self.plan()
        mismatch["jobs"][0]["referenceInputDigests"] = []
        with self.assertRaisesRegex(ValueError, "REFERENCE_INPUT_DIGEST_INVALID"):
            self.contract.validate_plan(mismatch)

    def test_hf_app_verifies_reference_bytes_before_image_decode(self):
        source = APP_PATH.read_text(encoding="utf-8")
        self.assertIn("reference_input_digests", source)
        self.assertIn("REFERENCE_CONTENT_DIGEST_MISMATCH", source)
        self.assertIn("hashlib.sha256", source)
        self.assertNotIn("load_image(ref)", source)


if __name__ == "__main__":
    unittest.main()
