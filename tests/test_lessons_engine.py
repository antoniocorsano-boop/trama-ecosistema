#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import tempfile
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
INDEX_BUILDER = ROOT / "scripts/build_lessons_index.py"
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


class LessonIndexContractTests(unittest.TestCase):
    def index_builder(self):
        return load_module(self, "build_lessons_index", INDEX_BUILDER)

    def event(self, lesson_id: str, *, status="CURRENT", title=None, supersedes=None):
        title = title or f"Lesson {lesson_id}"
        fingerprint = "sha256:" + ("1" if lesson_id.endswith("001") else "2") * 64
        return {
            "eventId": f"TRAMA-EVT-LESSON-{lesson_id}",
            "type": "FAILURE_LEARNING",
            "subject": "test-driven-development",
            "statement": f"Principle for {lesson_id}",
            "status": status,
            "rationale": f"Rule for {lesson_id}",
            "sourceRefs": [
                {
                    "repository": "example/repo",
                    "pullRequest": 42,
                    "exactHead": "c" * 40,
                    "workflowRun": "123456789",
                    "ref": "github-actions:workflow-run/123456789",
                    "evidenceKind": "FAILED_ASSERTION",
                }
            ],
            "validFrom": "2026-10-23T21:10:00Z",
            "supersedes": [f"TRAMA-EVT-LESSON-{item}" for item in (supersedes or [])],
            "invalidatedBy": [],
            "freshness": {"policy": "UNTIL_CHANGE"},
            "lesson": {
                "lessonId": lesson_id,
                "title": title,
                "category": "TDD_CI",
                "scope": "TRAMA",
                "priority": "HIGH",
                "subjects": ["test-driven-development", "ci-qualification"],
                "fingerprint": fingerprint,
                "causalStatus": "CERTIFIED",
                "humanDecisionRef": "github:example/repo/pull/42/comment/9",
                "humanDecisionKind": "PR_EXPLICIT_DECISION",
                "humanDecisionHead": "d" * 40,
                "humanReviewer": "authorized-human",
                "canonicalDocument": f"docs/knowledge/lessons/canonical/{lesson_id}.md",
                "supersedes": list(supersedes or []),
            },
        }

    def write_doc(self, lesson_root: Path, event: dict):
        lesson = event["lesson"]
        path = lesson_root / f"{lesson['lessonId']}.md"
        path.write_text(
            f"# {lesson['lessonId']} — {lesson['title']}\n\n"
            f"**Status:** CANONICAL  \n"
            f"**Fingerprint:** `{lesson['fingerprint']}`\n",
            encoding="utf-8",
        )
        return path

    def test_duplicate_canonical_lesson_ids_fail_closed(self):
        builder = self.index_builder()
        first = self.event("LL-INDEX-001")
        second = deepcopy(first)
        second["eventId"] = "TRAMA-EVT-LESSON-DUPLICATE"
        with tempfile.TemporaryDirectory() as tmp:
            lesson_root = Path(tmp)
            self.write_doc(lesson_root, first)
            with self.assertRaisesRegex(builder.LessonIndexError, "DUPLICATE_LESSON_ID"):
                builder.build_index({"events": [first, second]}, lesson_root)

    def test_current_event_without_canonical_document_fails_closed(self):
        builder = self.index_builder()
        event = self.event("LL-INDEX-001")
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaisesRegex(builder.LessonIndexError, "CANONICAL_LESSON_DOCUMENT_MISSING"):
                builder.build_index({"events": [event]}, Path(tmp))

    def test_canonical_document_without_matching_event_fails_closed(self):
        builder = self.index_builder()
        orphan = self.event("LL-INDEX-001")
        with tempfile.TemporaryDirectory() as tmp:
            lesson_root = Path(tmp)
            self.write_doc(lesson_root, orphan)
            with self.assertRaisesRegex(builder.LessonIndexError, "ORPHAN_CANONICAL_LESSON_DOCUMENT"):
                builder.build_index({"events": []}, lesson_root)

    def test_superseded_lesson_remains_indexed_but_inactive(self):
        builder = self.index_builder()
        event = self.event("LL-INDEX-001", status="SUPERSEDED")
        with tempfile.TemporaryDirectory() as tmp:
            lesson_root = Path(tmp)
            self.write_doc(lesson_root, event)
            index = builder.build_index({"events": [event]}, lesson_root)
        self.assertEqual(index["schemaVersion"], "trama.lessons-index/v1")
        self.assertEqual(len(index["lessons"]), 1)
        self.assertEqual(index["lessons"][0]["status"], "SUPERSEDED")
        self.assertIs(index["lessons"][0]["active"], False)

    def test_json_and_markdown_order_is_deterministic_by_lesson_id(self):
        builder = self.index_builder()
        event_b = self.event("LL-INDEX-002", title="Second")
        event_a = self.event("LL-INDEX-001", title="First")
        with tempfile.TemporaryDirectory() as tmp:
            lesson_root = Path(tmp)
            self.write_doc(lesson_root, event_b)
            self.write_doc(lesson_root, event_a)
            index = builder.build_index({"events": [event_b, event_a]}, lesson_root)
            markdown = builder.render_markdown(index)
        self.assertEqual([item["lessonId"] for item in index["lessons"]], ["LL-INDEX-001", "LL-INDEX-002"])
        self.assertLess(markdown.index("LL-INDEX-001"), markdown.index("LL-INDEX-002"))

    def test_index_preserves_provenance_and_supersession_metadata(self):
        builder = self.index_builder()
        event = self.event("LL-INDEX-002", supersedes=["LL-INDEX-001"])
        with tempfile.TemporaryDirectory() as tmp:
            lesson_root = Path(tmp)
            self.write_doc(lesson_root, event)
            index = builder.build_index({"events": [event]}, lesson_root)
        item = index["lessons"][0]
        self.assertEqual(item["sourceRepository"], "example/repo")
        self.assertEqual(item["sourceRefs"][0]["pullRequest"], 42)
        self.assertEqual(item["sourceRefs"][0]["exactHead"], "c" * 40)
        self.assertEqual(item["sourceRefs"][0]["workflowRun"], "123456789")
        self.assertEqual(item["supersedes"], ["LL-INDEX-001"])
        self.assertEqual(item["canonicalDocument"], "docs/knowledge/lessons/canonical/LL-INDEX-002.md")


if __name__ == "__main__":
    unittest.main()
