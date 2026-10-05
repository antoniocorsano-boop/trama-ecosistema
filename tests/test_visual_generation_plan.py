import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "visual_generation_compiler",
    ROOT / "scripts" / "compile_visual_generation_plan.py",
)
module = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(module)


class VisualGenerationCompilerTests(unittest.TestCase):
    def setUp(self):
        self.open_bible = module.load_json(
            str(
                ROOT
                / "docs/capabilities/atlas-percorsi/pathways/PW-STRATEGY-SELECTION-01/worlds/MUSEO-ZERO"
                / "museo-zero.visual-bible-v0.2.json"
            )
        )
        self.locked_bible = module.load_json(
            str(ROOT / "fixtures/visual-factory-generation/museo-zero-locked.visual-bible.json")
        )
        self.shot_plan = module.load_json(
            str(ROOT / "fixtures/visual-factory-generation/museo-zero.visual-shot-plan.json")
        )

    def test_reference_generation_exists_for_unlocked_museo_zero(self):
        plan = module.compile_reference_jobs(self.open_bible)
        self.assertEqual(plan["decision"], "REFERENCE_GENERATION_READY")
        self.assertEqual(len(plan["jobs"]), 5)
        purposes = {job["purpose"] for job in plan["jobs"]}
        self.assertEqual(purposes, {"CHARACTER_REFERENCE", "ENVIRONMENT_REFERENCE"})
        self.assertTrue(all(job["referenceInputs"] == [] for job in plan["jobs"]))

    def test_production_stops_until_reference_lock(self):
        plan = module.compile_shot_jobs(self.open_bible, self.shot_plan)
        self.assertEqual(plan["decision"], "STOP_REFERENCE_LOCK_REQUIRED")
        self.assertEqual(plan["jobs"], [])
        self.assertGreater(len(plan["blockers"]), 0)

    def test_locked_bible_compiles_all_six_frames(self):
        plan = module.compile_shot_jobs(self.locked_bible, self.shot_plan)
        self.assertEqual(plan["decision"], "SHOT_GENERATION_READY")
        self.assertEqual([job["shotId"] for job in plan["jobs"]], ["F1", "F2", "F3", "F4", "F5", "F6"])
        self.assertTrue(all(job["referenceInputs"] for job in plan["jobs"]))

    def test_lia_reference_is_reused_in_rehearsal_frames(self):
        plan = module.compile_shot_jobs(self.locked_bible, self.shot_plan)
        by_id = {job["shotId"]: job for job in plan["jobs"]}
        lia_ref = "fixture://visual/museo-zero/lia-reference-sheet-v1.png"
        for shot_id in ("F1", "F2", "F3", "F6"):
            self.assertIn(lia_ref, by_id[shot_id]["referenceInputs"])

    def test_no_authority_is_granted(self):
        ref_plan = module.compile_reference_jobs(self.open_bible)
        shot_plan = module.compile_shot_jobs(self.locked_bible, self.shot_plan)
        for plan in (ref_plan, shot_plan):
            self.assertFalse(plan["paidComputeAuthorized"])
            self.assertFalse(plan["allowQualityDowngrade"])
            self.assertFalse(plan["runtimeAuthorized"])
            self.assertFalse(plan["publicationAuthorityGranted"])


if __name__ == "__main__":
    unittest.main()
