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


if __name__ == "__main__":
    unittest.main()
