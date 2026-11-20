"""CURR-REF-01/G01: provenance and no-promotion assertions for a read-only pedagogical handoff."""
import copy
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RECEIPT = ROOT / "docs/research/curr-ref-01-g01-uda-valutazione.json"
EXPECTED_PATHS = {
    "DOCENTE_OS": {
        "docs/architecture/UDA_CANONICAL_COVERAGE.md",
        "docs/architecture/HUMAN_TASK_CONTENT_PIPELINE.md",
        "docs/architecture/HUMAN_TASK_PROJECT_PROCESS_B23_B27.md",
        "product/src/core/presentation/human-task-approved-projections-b23-b27.ts",
        "product/src/core/application/human-task-projection-recipes-b23-b27.ts",
    },
    "REGISTRO_DOCENTE": {
        "src/planning/arenaPlanningContext.ts",
        "src/planning/planningFrameResolver.ts",
        "src/assessment/assessmentEvidence.ts",
        "src/assessment/assessmentEvidenceProjection.ts",
        "src/assessment/assessmentRevisionBindings.ts",
    },
}


def validate(record):
    assert record["status"] == "READ_ONLY_DESIGN_REVIEW_NO_PRODUCT_INTEGRATION"
    authority = record["authority"]
    assert authority["sourceOfTruth"] == "ARENA"
    assert authority["version"] == "1.3"
    assert authority["fingerprint"] == "b355be71"
    assert authority["state"] == "PROVISIONAL_COMPLETE_NOT_IN_FORCE"
    assert authority["professionalReview"] == "OPEN"
    products = record["productEvidence"]
    assert len(products) == 2
    assert {p["product"] for p in products} == set(EXPECTED_PATHS)
    for product in products:
        assert len(product["revision"]) == 40
        evidence = product["sources"]
        assert {s["path"] for s in evidence} == EXPECTED_PATHS[product["product"]]
        assert len({s["path"] for s in evidence}) == len(evidence)
        assert all(len(s["blob"]) == 40 and s["state"] for s in evidence)
    rules = record["crossProductRules"]
    assert rules["exportRule"] == "NO_GENERAL_INTEROP_TRANSFORMATION_CONFIRMED"
    assert rules["assessmentRule"] == "NO_AUTOMATIC_GRADE_NO_AUTOMATIC_COMPETENCE_NO_AUTO_CERTIFICATION"
    assert rules["sourceBindingRule"] == "DO_NOT_TRANSLATE_DOCENTE_OS_CML_LOCAL_HANDOFF_V2_INTO_REGISTRO_PLANNING_CONTEXT_V1"
    ex = record["example"]
    assert ex["id"] == "CURR-REF-01/G01-B25"
    assert ex["status"] == "SYNTHETIC_PLANNING_EXAMPLE_NOT_RECORDED_AS_OBSERVATION"
    assert ex["grade"] == "I"
    assert ex["masterReference"]["state"] == "NOT_APPROVED_OR_BINDABLE"
    assert ex["masterReference"]["referenceKind"] == "LOCAL_COMPETENCE_CANDIDATE"
    assert ex["docenteOs"]["block"] == "B25"
    assert ex["docenteOs"]["uda"] == "CAN-UDA-1-05"
    assert ex["docenteOs"]["projectionId"] == "HTC-PRIMA-B25-PLAN-v1"
    assert ex["docenteOs"]["durationMinutes"] == 120
    assert ex["docenteOs"]["sourceAlignment"] == "COMPOSED"
    assert ex["docenteOs"]["expectedProduct"] == "Matrice di scelta motivata."
    assert ex["docenteOs"]["actualStudentEvidence"] == []
    criteria = ex["candidateCriteria"]
    assert len(criteria) == 2
    assert {c["focus"] for c in criteria} == {"process", "argumentation"}
    assert all(c["teacherDecision"] == "PENDING" for c in criteria)
    protocol = ex["observationProtocol"]
    assert protocol["purpose"] == "FORMATIVE_ONLY"
    assert protocol["studentEvidenceStorage"] == "REGISTRO_DOCENTE_LOCAL_ONLY"
    assert protocol["factAndInterpretationSeparate"] is True
    assert protocol["groupProductIsNotIndividualEvidence"] is True
    assert protocol["accessibilitySupportNotPenalty"] is True
    assert protocol["assessmentGrade"] == "NOT_CREATED"
    assert protocol["competenceJudgement"] == "NOT_CREATED"
    assert protocol["teacherConfirmation"] == "REQUIRED_FOR_REAL_RECORD"
    assert {f["id"] for f in record["findings"]} == {
        "G01-01", "G01-02", "G01-03", "G01-04", "G01-05"
    }
    assert record["next"]["id"] == "CURR-REF-01/G02"
    boundaries = record["boundaries"]
    assert set(boundaries) == {
        "masterEdited", "docenteOsEdited", "registroDocenteEdited", "studentDataIncluded",
        "liveLinkCreated", "personalDataTransfer", "gradeCreated", "publication", "professionalApproval"
    }
    assert all(value is False for value in boundaries.values())


class CrossProductG01Tests(unittest.TestCase):
    def setUp(self):
        self.record = json.loads(RECEIPT.read_text(encoding="utf-8"))

    def test_evidence_contract_and_sources(self):
        validate(self.record)

    def test_provisional_cannot_be_approved(self):
        mutated = copy.deepcopy(self.record)
        mutated["authority"]["state"] = "APPROVED"
        with self.assertRaises(AssertionError):
            validate(mutated)

    def test_no_student_or_grade_promotion(self):
        for field in self.record["boundaries"]:
            mutated = copy.deepcopy(self.record)
            mutated["boundaries"][field] = True
            with self.subTest(field=field), self.assertRaises(AssertionError):
                validate(mutated)

    def test_no_real_observation_in_illustrative_case(self):
        mutated = copy.deepcopy(self.record)
        mutated["example"]["docenteOs"]["actualStudentEvidence"] = ["student-1"]
        with self.assertRaises(AssertionError):
            validate(mutated)

    def test_no_silent_product_mapping(self):
        mutated = copy.deepcopy(self.record)
        mutated["crossProductRules"]["sourceBindingRule"] = "AUTO_CONVERT"
        with self.assertRaises(AssertionError):
            validate(mutated)

    def test_no_grade_from_matrix(self):
        mutated = copy.deepcopy(self.record)
        mutated["example"]["observationProtocol"]["assessmentGrade"] = "8"
        with self.assertRaises(AssertionError):
            validate(mutated)


if __name__ == "__main__":
    unittest.main()
