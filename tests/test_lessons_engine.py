#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import unittest
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "tests/fixtures/lessons/LL-TDD-RED-001.localized.json"
VALIDATOR = ROOT / "scripts/validate_lesson_proposal.py"
COMMON = ROOT / "scripts/lesson_engine_common.py"
SCHEMA = ROOT / "schemas/lesson-proposal.schema.json"
GATE = ROOT / "scripts/verify_lesson_human_gate.py"
PROMOTION = ROOT / "scripts/promote_lesson_proposal.py"
GOVERNANCE_CONFIG = ROOT / "config/lesson-governance.json"
TEST_PR = 278
TEST_HEAD = "a" * 40


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def load_module(testcase: unittest.TestCase, name: str, path: Path):
    testcase.assertTrue(path.is_file(), f"missing implementation: {path.relative_to(ROOT)}")
    spec = importlib.util.spec_from_file_location(name, path)
    testcase.assertIsNotNone(spec)
    module = importlib.util.module_from_spec(spec)
    assert spec is not None and spec.loader is not None
    spec.loader.exec_module(module)
    return module


class LessonProposalContractTests(unittest.TestCase):
    def setUp(self):
        self.proposal = load_json(FIXTURE)

    def validator(self):
        self.assertTrue(SCHEMA.is_file(), "missing implementation: schemas/lesson-proposal.schema.json")
        return load_module(self, "validate_lesson_proposal", VALIDATOR)

    def common(self):
        return load_module(self, "lesson_engine_common", COMMON)

    def test_localized_red_candidate_is_valid_without_certified_exception(self):
        validator = self.validator()
        result = validator.validate_proposal(deepcopy(self.proposal))
        self.assertEqual(result["lessonId"], "LL-TDD-RED-001")
        self.assertEqual(result["causalStatus"], "LOCALIZED")
        self.assertEqual(self.proposal["sourceRepository"], "antoniocorsano-boop/docente-os-2026-27")
        source = self.proposal["sourceRefs"][0]
        self.assertEqual(source["pullRequest"], 736)
        self.assertEqual(source["exactHead"], "ca3950cadf645e8c250d9192373d27794dab3457")
        self.assertEqual(source["workflowRun"], "40018037974")
        self.assertNotIn("ERR_MODULE_NOT_FOUND", json.dumps(self.proposal, ensure_ascii=False))
        common = self.common()
        self.assertEqual(common.direct_causal_evidence(self.proposal), [])

    def test_certified_causal_claim_requires_direct_evidence(self):
        validator = self.validator()
        proposal = deepcopy(self.proposal)
        proposal["causalStatus"] = "CERTIFIED"
        with self.assertRaisesRegex(validator.LessonProposalError, "CERTIFIED_CAUSAL_EVIDENCE_REQUIRED"):
            validator.validate_proposal(proposal)

    def test_duplicate_evidence_refs_are_rejected(self):
        validator = self.validator()
        proposal = deepcopy(self.proposal)
        proposal["sourceRefs"].append(deepcopy(proposal["sourceRefs"][0]))
        with self.assertRaisesRegex(validator.LessonProposalError, "DUPLICATE_SOURCE_REF"):
            validator.validate_proposal(proposal)

    def test_candidate_requires_source_repository_and_source_refs(self):
        validator = self.validator()
        for field in ("sourceRepository", "sourceRefs"):
            with self.subTest(field=field):
                proposal = deepcopy(self.proposal)
                proposal.pop(field)
                with self.assertRaises(validator.LessonProposalError):
                    validator.validate_proposal(proposal)

    def test_fingerprint_is_stable_for_semantically_identical_whitespace(self):
        common = self.common()
        a = deepcopy(self.proposal)
        b = deepcopy(self.proposal)
        b["title"] = "  RED   localizzato non equivale a RED causale certificato  "
        b["learnedPrinciple"] = "Un RED localizzato   dimostra dove il workflow fallisce,\nnon dimostra da solo la causa puntuale richiesta dal ciclo TDD."
        b["proposedRule"] = "Prima di passare al GREEN,  la causa prevista dal RED deve essere direttamente osservabile tramite eccezione, asserzione fallita o riproduzione controllata equivalente."
        self.assertEqual(common.lesson_fingerprint(a), common.lesson_fingerprint(b))


class LessonHumanGateAndPromotionTests(unittest.TestCase):
    def setUp(self):
        self.proposal = load_json(FIXTURE)
        self.runtime_config = {
            "schemaVersion": "trama.lesson-governance/v1",
            "authorizedHumanReviewers": ["antoniocorsano-boop"],
            "allowedDecisionKinds": ["PR_REVIEW_APPROVAL", "PR_EXPLICIT_DECISION"],
            "explicitDecisionToken": "APPROVE_CANONICAL",
            "autoMergeAllowed": False,
            "proposalBinding": {
                "pullRequest": TEST_PR,
                "headSha": TEST_HEAD,
            },
        }

    def gate(self):
        return load_module(self, "verify_lesson_human_gate", GATE)

    def promotion(self):
        return load_module(self, "promote_lesson_proposal", PROMOTION)

    def approved_review(self, actor="antoniocorsano-boop", head=TEST_HEAD):
        return {
            "kind": "PR_REVIEW_APPROVAL",
            "state": "APPROVED",
            "actor": actor,
            "pullRequest": TEST_PR,
            "headSha": head,
            "decisionRef": "github:trama-ecosistema/pull/278/review/1001",
            "decidedAt": "2026-10-23T21:00:00Z",
        }

    def explicit_decision(self, actor="antoniocorsano-boop", head=TEST_HEAD):
        return {
            "kind": "PR_EXPLICIT_DECISION",
            "token": "APPROVE_CANONICAL",
            "actor": actor,
            "pullRequest": TEST_PR,
            "headSha": head,
            "decisionRef": "github:trama-ecosistema/pull/278/comment/2001",
            "decidedAt": "2026-10-23T21:01:00Z",
        }

    def verified_decision(self):
        return self.gate().verify_human_gate([self.explicit_decision()], deepcopy(self.runtime_config))

    def test_static_governance_config_is_fail_closed(self):
        self.assertTrue(GOVERNANCE_CONFIG.is_file(), "missing implementation: config/lesson-governance.json")
        config = load_json(GOVERNANCE_CONFIG)
        self.assertEqual(config["authorizedHumanReviewers"], ["antoniocorsano-boop"])
        self.assertEqual(config["allowedDecisionKinds"], ["PR_REVIEW_APPROVAL", "PR_EXPLICIT_DECISION"])
        self.assertEqual(config["explicitDecisionToken"], "APPROVE_CANONICAL")
        self.assertIs(config["autoMergeAllowed"], False)
        self.assertNotIn("proposalBinding", config)

    def test_bot_approval_does_not_satisfy_human_gate(self):
        gate = self.gate()
        config = deepcopy(self.runtime_config)
        config["authorizedHumanReviewers"].append("lesson-bot[bot]")
        with self.assertRaisesRegex(gate.LessonGateError, "HUMAN_DECISION_REQUIRED"):
            gate.verify_human_gate([self.approved_review(actor="lesson-bot[bot]")], config)

    def test_unlisted_human_does_not_satisfy_human_gate(self):
        gate = self.gate()
        with self.assertRaisesRegex(gate.LessonGateError, "HUMAN_DECISION_REQUIRED"):
            gate.verify_human_gate([self.approved_review(actor="other-maintainer")], deepcopy(self.runtime_config))

    def test_stale_head_human_decision_does_not_satisfy_gate(self):
        gate = self.gate()
        with self.assertRaisesRegex(gate.LessonGateError, "HUMAN_DECISION_REQUIRED"):
            gate.verify_human_gate([self.explicit_decision(head="b" * 40)], deepcopy(self.runtime_config))

    def test_authorized_human_review_approval_satisfies_gate(self):
        decision = self.gate().verify_human_gate([self.approved_review()], deepcopy(self.runtime_config))
        self.assertEqual(decision["decisionKind"], "PR_REVIEW_APPROVAL")
        self.assertEqual(decision["reviewer"], "antoniocorsano-boop")
        self.assertEqual(decision["humanDecisionRef"], "github:trama-ecosistema/pull/278/review/1001")
        self.assertEqual(decision["pullRequest"], TEST_PR)
        self.assertEqual(decision["headSha"], TEST_HEAD)

    def test_authorized_explicit_pr_decision_satisfies_gate(self):
        decision = self.gate().verify_human_gate([self.explicit_decision()], deepcopy(self.runtime_config))
        self.assertEqual(decision["decisionKind"], "PR_EXPLICIT_DECISION")
        self.assertEqual(decision["reviewer"], "antoniocorsano-boop")
        self.assertEqual(decision["humanDecisionRef"], "github:trama-ecosistema/pull/278/comment/2001")
        self.assertEqual(decision["headSha"], TEST_HEAD)

    def test_promotion_produces_failure_learning_event_and_markdown(self):
        promotion = self.promotion()
        decision = self.verified_decision()
        event = promotion.build_failure_learning_event(deepcopy(self.proposal), decision)
        markdown = promotion.render_canonical_markdown(deepcopy(self.proposal), decision)
        self.assertEqual(event["eventId"], "TRAMA-EVT-LESSON-LL-TDD-RED-001")
        self.assertEqual(event["type"], "FAILURE_LEARNING")
        self.assertEqual(event["status"], "CURRENT")
        self.assertEqual(event["lesson"]["lessonId"], "LL-TDD-RED-001")
        self.assertEqual(event["lesson"]["humanDecisionRef"], decision["humanDecisionRef"])
        self.assertIn("LL-TDD-RED-001", markdown)
        self.assertIn(decision["humanDecisionRef"], markdown)
        self.assertIn("LOCALIZED", markdown)

    def test_promotion_preserves_source_pr_sha_and_run(self):
        promotion = self.promotion()
        event = promotion.build_failure_learning_event(deepcopy(self.proposal), self.verified_decision())
        self.assertEqual(event["sourceRefs"], self.proposal["sourceRefs"])
        source = event["sourceRefs"][0]
        self.assertEqual(source["pullRequest"], 736)
        self.assertEqual(source["exactHead"], "ca3950cadf645e8c250d9192373d27794dab3457")
        self.assertEqual(source["workflowRun"], "40018037974")

    def test_promotion_rejects_candidate_without_human_gate(self):
        promotion = self.promotion()
        with self.assertRaisesRegex(promotion.LessonPromotionError, "HUMAN_GATE_REQUIRED"):
            promotion.build_failure_learning_event(deepcopy(self.proposal), {})


if __name__ == "__main__":
    unittest.main()
