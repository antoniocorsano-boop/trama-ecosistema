import importlib.util
import re
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "services" / "visual-factory-hf" / "contract.py"
ORCHESTRATOR_WORKFLOW = ROOT / ".github" / "workflows" / "visual-factory-orchestrator-v0.1.yml"


def load_contract():
    spec = importlib.util.spec_from_file_location("visual_factory_hf_contract", CONTRACT)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class VisualFactoryHfContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.contract = load_contract()

    def plan(self, purpose="CHARACTER_REFERENCE", aspect_ratio="3:4", refs=None):
        return {
            "schemaVersion": "atlas.visual-generation-plan/v0.1",
            "pathwayId": "pw-strategy-selection-01-museo-zero",
            "packageDigest": "a" * 64,
            "planType": "REFERENCE_GENERATION" if purpose != "SCENE_FRAME" else "SHOT_GENERATION",
            "decision": "REFERENCE_GENERATION_READY" if purpose != "SCENE_FRAME" else "SHOT_GENERATION_READY",
            "jobs": [{
                "jobId": "job-1",
                "purpose": purpose,
                "subjectRef": "lia" if purpose != "SCENE_FRAME" else "F1",
                "shotId": "F1" if purpose == "SCENE_FRAME" else None,
                "sceneRef": "MZ1_FAILED_REHEARSAL" if purpose == "SCENE_FRAME" else None,
                "workflowFamily": "flux2-klein-4b/v0.2",
                "prompt": "cinematic editorial museum scene",
                "negativeConstraints": ["dashboard aesthetic"],
                "referenceInputs": refs or [],
                "aspectRatio": aspect_ratio,
                "maxVariants": 3,
            }],
            "blockers": [],
            "paidComputeAuthorized": False,
            "allowQualityDowngrade": False,
            "runtimeAuthorized": False,
            "publicationAuthorityGranted": False,
        }

    def test_reference_job_dimensions_are_bounded(self):
        plan = self.contract.validate_plan(self.plan())
        job = self.contract.compile_execution_jobs(plan)[0]
        self.assertEqual((job.width, job.height), (768, 1024))
        self.assertEqual(job.max_variants, 3)

    def test_scene_job_requires_locked_reference_inputs(self):
        with self.assertRaisesRegex(ValueError, "SCENE_REFERENCE_REQUIRED"):
            self.contract.validate_plan(self.plan("SCENE_FRAME", "4:3", refs=[]))

    def test_scene_dimensions_and_reference_inputs_are_preserved(self):
        refs = ["https://assets.invalid/lia.png", "https://assets.invalid/sala-zero.png"]
        plan = self.contract.validate_plan(self.plan("SCENE_FRAME", "4:3", refs=refs))
        job = self.contract.compile_execution_jobs(plan)[0]
        self.assertEqual((job.width, job.height), (1024, 768))
        self.assertEqual(job.reference_inputs, tuple(refs))

    def test_paid_or_quality_downgrade_flags_are_rejected(self):
        for field in ("paidComputeAuthorized", "allowQualityDowngrade", "runtimeAuthorized", "publicationAuthorityGranted"):
            plan = self.plan()
            plan[field] = True
            with self.assertRaisesRegex(ValueError, "AUTHORITY_VIOLATION"):
                self.contract.validate_plan(plan)

    def test_variant_count_is_bounded(self):
        plan = self.plan()
        plan["jobs"][0]["maxVariants"] = 4
        with self.assertRaisesRegex(ValueError, "MAX_VARIANTS_EXCEEDED"):
            self.contract.validate_plan(plan)

    def test_receipt_never_grants_authority(self):
        plan = self.contract.validate_plan(self.plan())
        receipt = self.contract.success_receipt(
            plan,
            [{
                "assetId": "asset-1",
                "subjectRef": "lia",
                "purpose": "CHARACTER_REFERENCE",
                "url": "https://assets.invalid/lia.png",
                "sha256": "b" * 64,
                "modelRef": "black-forest-labs/FLUX.2-klein-4B",
                "workflowRef": "hf-zerogpu.flux2-klein-4b/v0.1",
                "createdAt": "2026-10-04T20:00:00Z",
                "packageDigest": "a" * 64,
                "provenanceStatus": "RECORDED",
            }],
        )
        self.assertFalse(receipt["paidComputeAuthorized"])
        self.assertFalse(receipt["allowQualityDowngrade"])
        self.assertFalse(receipt["runtimeAuthorized"])
        self.assertFalse(receipt["publicationAuthorityGranted"])
        self.assertEqual(receipt["costClass"], "FREE_ONLY")

    def test_manual_orchestrator_binds_hf_credentials_without_hardcoding(self):
        workflow = ORCHESTRATOR_WORKFLOW.read_text(encoding="utf-8")
        self.assertRegex(workflow, r"HF_TOKEN:\s*\$\{\{\s*secrets\.HF_TOKEN\s*\}\}")
        self.assertRegex(
            workflow,
            r"HF_VISUAL_FACTORY_SPACE_REPO:\s*\$\{\{\s*vars\.HF_VISUAL_FACTORY_SPACE_REPO\s*\}\}",
        )
        self.assertEqual(workflow.count("HF_TOKEN:"), 1)
        self.assertEqual(workflow.count("HF_VISUAL_FACTORY_SPACE_REPO:"), 1)

    def test_manual_orchestrator_fails_closed_without_hf_binding_for_live_modes(self):
        workflow = ORCHESTRATOR_WORKFLOW.read_text(encoding="utf-8")
        self.assertIn('if [ "$MODE" != "dry-run" ]; then', workflow)
        self.assertIn('test -n "${HF_TOKEN:-}"', workflow)
        self.assertIn('test -n "${HF_VISUAL_FACTORY_SPACE_REPO:-}"', workflow)
        self.assertIn("LIVE_ZERO_COST_EXECUTION_REQUIRES_TRUSTED_CREDENTIAL_BINDING", workflow)


if __name__ == "__main__":
    unittest.main()
