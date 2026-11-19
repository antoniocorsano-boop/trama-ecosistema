"""CURR-REF-01/G02: offline editorial crosswalk, synthetic data only."""
import copy
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from qualify_curr_ref_g02_editorial import (  # noqa: E402
    EXPECTED_G01_BLOB, git_blob_sha, load_case, project_editorial, validate
)


class G02EditorialTests(unittest.TestCase):
    def setUp(self):
        self.g01, self.case, self.raw = load_case()

    def test_upstream_blob_is_exact(self):
        self.assertEqual(git_blob_sha(self.raw), EXPECTED_G01_BLOB)
        validate(self.g01, self.case, self.raw)

    def test_editorial_projection_is_stable_and_no_mutation(self):
        g01_before, case_before = copy.deepcopy(self.g01), copy.deepcopy(self.case)
        a = project_editorial(self.g01, self.case, self.raw, surface="EDITORIAL")
        self.assertEqual(a, project_editorial(self.g01, self.case, self.raw, surface="EDITORIAL"))
        self.assertEqual(self.g01, g01_before)
        self.assertEqual(self.case, case_before)
        self.assertEqual(a["status"], "NON_PUBLISHABLE_EDITORIAL_PREVIEW")
        self.assertEqual(a["lesson"]["block"], "B25")
        self.assertEqual(a["lesson"]["uda"], "CAN-UDA-1-05")
        self.assertEqual(a["lesson"]["minutes"], 120)
        self.assertEqual(a["lesson"]["expectedProduct"], "Matrice di scelta motivata.")
        self.assertEqual(a["curricolo"]["reference"], "confrontare soluzioni")
        self.assertEqual(a["curricolo"]["authority"], "PROVISIONAL_COMPLETE_NOT_IN_FORCE")
        self.assertIs(a["curricolo"]["bindable"], False)
        self.assertEqual([x["focus"] for x in a["criteria"]], ["process", "argumentation"])
        self.assertTrue(all(x["status"] == "PENDING_TEACHER_REVIEW" for x in a["criteria"]))
        self.assertTrue(all(x["illustration"]["status"] == "SYNTHETIC_NOT_OBSERVED"
                            for x in a["criteria"]))
        self.assertEqual(a["decisions"], {
            "teacherReview": "PENDING", "studentObservation": None,
            "numericGrade": None, "competenceJudgement": None,
            "integrationAuthorized": False, "externalTransfer": False,
        })
        output = json.dumps(a, ensure_ascii=False)
        for token in ('studentId', 'studentIds', 'gradeId', 'confirmedAt',
                      'individualRecords', 'dataPersona'):
            self.assertNotIn(token, output)

    def test_surface_deny_by_default(self):
        for surface in ("PUBLIC", "RUNTIME", "", "PERSISTENCE", "STUDENT", None):
            with self.subTest(surface=surface), self.assertRaises(ValueError):
                project_editorial(self.g01, self.case, self.raw, surface=surface)

    def test_reject_upstream_edit_without_new_pin(self):
        changed = self.raw + b" "
        with self.assertRaisesRegex(ValueError, "content drift"):
            validate(self.g01, self.case, changed)

    def test_reject_unapproved_master_promotion(self):
        changed = copy.deepcopy(self.g01)
        changed["authority"]["state"] = "APPROVED"
        with self.assertRaises(ValueError):
            validate(changed, self.case, self.raw)

    def test_reject_actual_individual_evidence(self):
        changed = copy.deepcopy(self.g01)
        changed["example"]["docenteOs"]["actualStudentEvidence"] = ["not-a-real-id"]
        with self.assertRaises(ValueError):
            validate(changed, self.case, self.raw)

    def test_reject_extra_student_identifier_field(self):
        changed = copy.deepcopy(self.case)
        changed["illustrations"][0]["studentId"] = "personal-data"
        with self.assertRaisesRegex(ValueError, "illustration keys"):
            validate(self.g01, changed, self.raw)

    def test_reject_new_or_unconfirmed_criteria(self):
        changed = copy.deepcopy(self.case)
        changed["criteriaRefs"].append("CR-G02-UNKNOWN")
        with self.assertRaises(ValueError):
            validate(self.g01, changed, self.raw)
        changed = copy.deepcopy(self.g01)
        changed["example"]["candidateCriteria"][0]["teacherDecision"] = "APPROVED"
        with self.assertRaises(ValueError):
            validate(changed, self.case, self.raw)

    def test_reject_fake_source_revisions(self):
        for field in ("g01GitBlob", "docenteOsProjectionBlob",
                      "registroEvidenceContractBlob", "arenaFingerprint"):
            changed = copy.deepcopy(self.case)
            changed["source"][field] = "fake"
            with self.subTest(field=field), self.assertRaises(ValueError):
                validate(self.g01, changed, self.raw)

    def test_reject_automatic_grade_or_publication(self):
        for field in ("publicExposure", "runtimeIntegration", "individualRecords",
                      "automaticTransfer", "automaticScore", "authorizationToPublish"):
            changed = copy.deepcopy(self.case)
            changed["boundaries"][field] = True
            with self.subTest(field=field), self.assertRaises(ValueError):
                validate(self.g01, changed, self.raw)
        changed = copy.deepcopy(self.case)
        changed["review"]["canCreateGrade"] = True
        with self.assertRaises(ValueError):
            validate(self.g01, changed, self.raw)


if __name__ == "__main__":
    unittest.main()
