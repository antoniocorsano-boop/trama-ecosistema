#!/usr/bin/env python3
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
GOVERNANCE = ROOT / ".github/workflows/governance.yml"
LESSON_GOVERNANCE = ROOT / ".github/workflows/lesson-governance.yml"
OPERATING_MODEL = ROOT / "docs/knowledge/TRAMA-SECOND-BRAIN-OPERATING-MODEL.md"


class LessonGovernanceWorkflowTests(unittest.TestCase):
    def test_governance_explicitly_checks_lesson_index_and_lesson_contracts(self):
        text = GOVERNANCE.read_text(encoding="utf-8")
        self.assertIn("python3 scripts/build_lessons_index.py --check", text)
        self.assertIn("python3 -m unittest tests.test_lessons_engine -v", text)

    def test_governance_blocks_main_bound_candidate_artifacts(self):
        text = GOVERNANCE.read_text(encoding="utf-8")
        self.assertIn("docs/knowledge/lessons/candidates", text)
        self.assertIn("LESSON_CANDIDATE_MAIN_BOUND_FORBIDDEN", text)

    def test_lesson_governance_workflow_exists_and_is_read_only(self):
        self.assertTrue(LESSON_GOVERNANCE.is_file(), "missing .github/workflows/lesson-governance.yml")
        text = LESSON_GOVERNANCE.read_text(encoding="utf-8")
        self.assertIn("contents: read", text)
        self.assertIn("pull-requests: read", text)
        self.assertNotIn("contents: write", text)
        self.assertNotIn("pull-requests: write", text)

    def test_lesson_governance_reports_human_gate_without_mutation(self):
        self.assertTrue(LESSON_GOVERNANCE.is_file(), "missing .github/workflows/lesson-governance.yml")
        text = LESSON_GOVERNANCE.read_text(encoding="utf-8")
        self.assertIn("AWAITING_HUMAN_DECISION", text)
        self.assertIn("APPROVED_FOR_CANONICAL_MATERIALIZATION", text)
        self.assertIn("scripts/verify_lesson_human_gate.py", text)
        self.assertIn("docs/knowledge/lessons/candidates", text)
        forbidden = (
            "gh pr merge",
            "pulls.merge",
            "merge_pull_request",
            "git push",
            "enable-auto-merge",
        )
        for token in forbidden:
            with self.subTest(token=token):
                self.assertNotIn(token, text)

    def test_lesson_governance_binds_decision_to_exact_pr_head(self):
        self.assertTrue(LESSON_GOVERNANCE.is_file(), "missing .github/workflows/lesson-governance.yml")
        text = LESSON_GOVERNANCE.read_text(encoding="utf-8")
        self.assertIn("github.event.pull_request.number", text)
        self.assertIn("github.event.pull_request.head.sha", text)
        self.assertIn("APPROVE_CANONICAL", text)

    def test_second_brain_closure_requires_reusable_lesson_evaluation(self):
        text = OPERATING_MODEL.read_text(encoding="utf-8").casefold()
        self.assertIn("reusable lesson evaluation", text)
        self.assertIn("failure/process learning", text)
        self.assertIn("lesson candidate", text)
        self.assertIn("human decision", text)


if __name__ == "__main__":
    unittest.main()
