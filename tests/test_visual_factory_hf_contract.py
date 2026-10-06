import importlib.util
import json
import re
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "services" / "visual-factory-hf" / "contract.py"
APP = ROOT / "services" / "visual-factory-hf" / "app.py"
ORCHESTRATOR_WORKFLOW = ROOT / ".github" / "workflows" / "visual-factory-orchestrator-v0.1.yml"
DEPLOY_WORKFLOW = ROOT / ".github" / "workflows" / "visual-factory-hf-space-deploy.yml"
GENERATION_WORKFLOW = ROOT / ".github" / "workflows" / "visual-factory-generation-v0.2.yml"
DEPLOY_SCRIPT = ROOT / "scripts" / "deploy_visual_factory_hf_space.py"
STUDIO_PACKAGE = ROOT / "products" / "studio-atlas" / "package.json"
CANONICAL_PLAN_CLI = ROOT / "products" / "studio-atlas" / "scripts" / "compile-canonical-reference-plan.ts"


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
        refs = refs or []
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
                "referenceInputs": refs,
                "referenceInputDigests": ["d" * 64 for _ in refs],
                "aspectRatio": aspect_ratio,
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

    def test_reference_job_dimensions_are_bounded(self):
        plan = self.contract.validate_plan(self.plan())
        job = self.contract.compile_execution_jobs(plan)[0]
        self.assertEqual((job.width, job.height), (768, 1024))
        self.assertEqual(job.max_variants, 1)
        self.assertEqual(job.preflight_state, "PREFLIGHT_PASS")

    def test_provider_ready_prompt_matches_cloudflare_fallback_contract(self):
        plan = self.contract.validate_plan(self.plan())
        job = self.contract.compile_execution_jobs(plan)[0]
        self.assertEqual(
            self.contract.provider_ready_prompt(job),
            "cinematic editorial museum scene\n\nAvoid: dashboard aesthetic.",
        )
        self.assertNotIn("Keep the authored world coherent", self.contract.provider_ready_prompt(job))

    def test_scene_job_requires_locked_reference_inputs(self):
        with self.assertRaisesRegex(ValueError, "SCENE_REFERENCE_REQUIRED"):
            self.contract.validate_plan(self.plan("SCENE_FRAME", "4:3", refs=[]))

    def test_scene_dimensions_and_reference_inputs_are_preserved(self):
        refs = ["https://assets.invalid/lia.png", "https://assets.invalid/sala-zero.png"]
        plan = self.contract.validate_plan(self.plan("SCENE_FRAME", "4:3", refs=refs))
        job = self.contract.compile_execution_jobs(plan)[0]
        self.assertEqual((job.width, job.height), (1024, 768))
        self.assertEqual(job.reference_inputs, tuple(refs))
        self.assertEqual(job.reference_input_digests, ("d" * 64, "d" * 64))

    def test_scene_reference_digests_are_required_and_aligned(self):
        plan = self.plan("SCENE_FRAME", "4:3", refs=["https://assets.invalid/lia.png"])
        plan["jobs"][0].pop("referenceInputDigests")
        with self.assertRaisesRegex(ValueError, "REFERENCE_INPUT_DIGEST_INVALID"):
            self.contract.validate_plan(plan)
        mismatch = self.plan("SCENE_FRAME", "4:3", refs=["https://assets.invalid/lia.png"])
        mismatch["jobs"][0]["referenceInputDigests"] = []
        with self.assertRaisesRegex(ValueError, "REFERENCE_INPUT_DIGEST_INVALID"):
            self.contract.validate_plan(mismatch)

    def test_hf_app_verifies_reference_bytes_before_image_decode(self):
        source = APP.read_text(encoding="utf-8")
        self.assertIn("reference_input_digests", source)
        self.assertIn("REFERENCE_CONTENT_DIGEST_MISMATCH", source)
        self.assertIn("hashlib.sha256", source)
        self.assertNotIn("load_image(ref)", source)

    def test_paid_or_quality_downgrade_flags_are_rejected(self):
        for field in ("paidComputeAuthorized", "allowQualityDowngrade", "runtimeAuthorized", "publicationAuthorityGranted"):
            plan = self.plan()
            plan[field] = True
            with self.assertRaisesRegex(ValueError, "AUTHORITY_VIOLATION"):
                self.contract.validate_plan(plan)

    def test_variant_count_is_exactly_one(self):
        for variants in (0, 2, 3, 4):
            plan = self.plan()
            plan["jobs"][0]["maxVariants"] = variants
            with self.assertRaisesRegex(ValueError, "MAX_VARIANTS_MUST_BE_ONE"):
                self.contract.validate_plan(plan)

    def test_preflight_bindings_are_required(self):
        for field, error in (
            ("preflightReceiptId", "PREFLIGHT_RECEIPT_REQUIRED"),
            ("preflightSpecDigest", "PREFLIGHT_SPEC_DIGEST_INVALID"),
            ("compiledPromptDigest", "COMPILED_PROMPT_DIGEST_INVALID"),
            ("preflightState", "PREFLIGHT_NOT_PASSED"),
        ):
            plan = self.plan()
            plan["jobs"][0].pop(field)
            with self.assertRaisesRegex(ValueError, error):
                self.contract.validate_plan(plan)

    def test_signed_provider_admission_is_bound_to_exact_plan_and_expiry(self):
        plan = self.plan()
        secret = "server-only-admission-secret"
        capability = self.contract.create_provider_admission(plan, secret, issued_at_epoch=1_800_000_000, ttl_seconds=120)
        self.contract.verify_provider_admission(plan, capability, secret, now_epoch=1_800_000_060)
        forged = json.loads(json.dumps(plan))
        forged["jobs"][0]["prompt"] += " forged"
        with self.assertRaisesRegex(ValueError, "PROVIDER_ADMISSION_PLAN_MISMATCH"):
            self.contract.verify_provider_admission(forged, capability, secret, now_epoch=1_800_000_060)
        with self.assertRaisesRegex(ValueError, "PROVIDER_ADMISSION_EXPIRED"):
            self.contract.verify_provider_admission(plan, capability, secret, now_epoch=1_800_000_121)

    def test_wrong_or_missing_provider_admission_secret_fails_closed(self):
        plan = self.plan()
        capability = self.contract.create_provider_admission(plan, "issuer-secret", issued_at_epoch=1_800_000_000, ttl_seconds=120)
        for secret in ("", "wrong-secret"):
            with self.assertRaisesRegex(ValueError, "PROVIDER_ADMISSION"):
                self.contract.verify_provider_admission(plan, capability, secret, now_epoch=1_800_000_060)

    def test_hf_execute_endpoint_requires_separate_signed_admission(self):
        source = APP.read_text(encoding="utf-8")
        self.assertIn("admission_json", source)
        self.assertIn("VISUAL_FACTORY_ADMISSION_SECRET", source)
        self.assertIn("verify_provider_admission", source)

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
        self.assertRegex(workflow, r"HF_VISUAL_FACTORY_SPACE_REPO:\s*\$\{\{\s*vars\.HF_VISUAL_FACTORY_SPACE_REPO\s*\}\}")
        self.assertEqual(len(re.findall(r"(?m)^\s*HF_TOKEN:\s*", workflow)), 1)
        self.assertEqual(len(re.findall(r"(?m)^\s*HF_VISUAL_FACTORY_SPACE_REPO:\s*", workflow)), 1)

    def test_dry_run_is_credential_free_and_live_modes_fail_closed(self):
        workflow = ORCHESTRATOR_WORKFLOW.read_text(encoding="utf-8")
        job_prefix = workflow.split("    steps:", 1)[0]
        self.assertNotIn("HF_TOKEN:", job_prefix)
        self.assertNotIn("HF_VISUAL_FACTORY_SPACE_REPO:", job_prefix)
        self.assertIn("- name: Execute bounded orchestrator dry-run\n        if: inputs.mode == 'dry-run'", workflow)
        self.assertIn("- name: Execute bounded orchestrator live\n        if: inputs.mode != 'dry-run'", workflow)
        self.assertIn('test -n "${HF_TOKEN:-}"', workflow)
        self.assertIn('test -n "${HF_VISUAL_FACTORY_SPACE_REPO:-}"', workflow)
        self.assertIn("LIVE_ZERO_COST_EXECUTION_REQUIRES_TRUSTED_CREDENTIAL_BINDING", workflow)

    def test_manual_orchestrator_uses_canonical_studio_atlas_reference_plan(self):
        workflow = ORCHESTRATOR_WORKFLOW.read_text(encoding="utf-8")
        package = STUDIO_PACKAGE.read_text(encoding="utf-8")
        self.assertTrue(CANONICAL_PLAN_CLI.is_file())
        self.assertIn('"visual-factory:compile-reference-plan": "tsx scripts/compile-canonical-reference-plan.ts"', package)
        self.assertIn("npm run visual-factory:compile-reference-plan", workflow)
        self.assertNotIn("python scripts/compile_visual_generation_plan.py", workflow)

    def test_hf_space_bootstrap_workflow_is_manual_bounded_and_secret_safe(self):
        self.assertTrue(DEPLOY_SCRIPT.is_file())
        self.assertTrue(DEPLOY_WORKFLOW.is_file())
        workflow = DEPLOY_WORKFLOW.read_text(encoding="utf-8")
        self.assertIn("workflow_dispatch:", workflow)
        self.assertNotRegex(workflow, r"(?m)^\s*push:\s*$")
        self.assertNotRegex(workflow, r"(?m)^\s*pull_request:\s*$")
        self.assertRegex(workflow, r"HF_TOKEN:\s*\$\{\{\s*secrets\.HF_TOKEN\s*\}\}")
        self.assertRegex(workflow, r"HF_VISUAL_FACTORY_SPACE_REPO:\s*\$\{\{\s*vars\.HF_VISUAL_FACTORY_SPACE_REPO\s*\}\}")
        self.assertIn("python scripts/deploy_visual_factory_hf_space.py", workflow)
        self.assertIn("services/visual-factory-hf", workflow)
        self.assertIn("zero-a10g", DEPLOY_SCRIPT.read_text(encoding="utf-8"))

    def test_hf_space_deploy_workflow_changes_trigger_generation_qualification(self):
        workflow = GENERATION_WORKFLOW.read_text(encoding="utf-8")
        self.assertIn('- ".github/workflows/visual-factory-hf-space-deploy.yml"', workflow)


if __name__ == "__main__":
    unittest.main()
