"""G03: test true cross-source identity and the absence of write authority."""
import copy
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from qualify_curr_ref_g02_editorial import load_case, project_editorial  # noqa: E402
from qualify_curr_ref_g03_link import (  # noqa: E402
    G03_REL, CASE_REL, G02_BLOB, git_blob_sha, render_reference_link,
    validate_link
)


class G03ActivityLinkTests(unittest.TestCase):
    def setUp(self):
        self.g01, self.g02, raw = load_case()
        self.preview = project_editorial(self.g01, self.g02, raw, surface="EDITORIAL")
        self.g02raw = (ROOT / CASE_REL).read_bytes()
        self.manifest = json.loads((ROOT / G03_REL).read_text(encoding="utf-8"))

    def check_denied(self, *, m=None, g=None, v=None, data=None):
        with self.assertRaisesRegex(ValueError, "G03_BLOCKED"):
            validate_link(
                self.manifest if m is None else m,
                self.g01 if g is None else g,
                self.preview if v is None else v,
                self.g02raw if data is None else data,
            )

    def test_00_pinned_source_and_projected_view(self):
        self.assertEqual(git_blob_sha(self.g02raw), G02_BLOB)
        validate_link(self.manifest, self.g01, self.preview, self.g02raw)
        original = copy.deepcopy(self.manifest)
        view = render_reference_link(self.manifest)
        self.assertEqual(view, render_reference_link(self.manifest))
        self.assertEqual(original, self.manifest)
        self.assertEqual(view["status"], "EDITORIAL_PROPOSAL_NOT_IMPORTABLE")
        self.assertEqual(view["activityRef"]["projectionId"], "HTC-PRIMA-B25-PLAN-v1")
        self.assertEqual(view["activityRef"]["blockId"], "B25")
        self.assertEqual(view["activityRef"]["udaCode"], "CAN-UDA-1-05")
        self.assertEqual(view["activityRef"]["schoolYear"], "2026/2027")
        self.assertEqual(view["curricoloRef"]["reference"], "confrontare soluzioni")
        self.assertEqual(view["curricoloRef"]["authority"], "PROVISIONAL_COMPLETE_NOT_IN_FORCE")
        self.assertFalse(view["curricoloRef"]["bindable"])
        self.assertEqual([c["focus"] for c in view["criterionCandidates"]],
                         ["process", "argumentation"])
        self.assertTrue(all(c["approval"] == "PENDING_TEACHER_REVIEW"
                            for c in view["criterionCandidates"]))
        self.assertEqual(view["permissions"], {
            "view": "OFFLINE_EDITORIAL_ONLY",
            "registroImport": False,
            "externalTransfer": False,
            "teacherConfirmation": None,
            "grade": None,
            "competenceJudgement": None,
        })
        serialized = json.dumps(view, ensure_ascii=False)
        for forbidden in ("studentId", "studentIds", "gradeId",
                          "confirmedAt", "revisionId", "observationEventId",
                          "assessmentId", "classId"):
            self.assertNotIn(forbidden, serialized)

    def test_01_surface_is_read_only(self):
        for surface in ("PUBLIC", "RUNTIME", "REGISTRO_DOCENTE", "EXPORT", None):
            with self.subTest(surface=surface), self.assertRaisesRegex(ValueError, "G03_BLOCKED"):
                render_reference_link(self.manifest, surface=surface)

    def test_02_source_revisions_are_bound(self):
        for key in ("g02GitBlob", "g02Path", "g02CaseId", "matchingPolicy"):
            m = copy.deepcopy(self.manifest)
            m["origin"][key] = "changed"
            with self.subTest(field=key):
                self.check_denied(m=m)
        self.check_denied(data=self.g02raw + b" ")

    def test_03_plan_uda_block_and_projection_must_match(self):
        for key in ("product", "planCode", "udaCode", "blockId", "projectionId"):
            m = copy.deepcopy(self.manifest)
            m["links"][0]["activity"][key] = "WRONG"
            with self.subTest(field=key):
                self.check_denied(m=m)

    def test_04_scope_and_regime_not_guessed(self):
        for key in ("schoolYear", "schoolOrder", "grade", "discipline", "regime"):
            m = copy.deepcopy(self.manifest)
            m["links"][0]["scope"][key] = "WRONG"
            with self.subTest(field=key):
                self.check_denied(m=m)

    def test_05_curricolo_authority_not_promoted(self):
        for key in ("masterVersion", "masterFingerprint", "bandRef",
                    "sourceSection", "referenceKind", "referenceText", "authority"):
            m = copy.deepcopy(self.manifest)
            m["links"][0]["curricolo"][key] = "APPROVED"
            with self.subTest(field=key):
                self.check_denied(m=m)
        m = copy.deepcopy(self.manifest)
        m["links"][0]["usableForAssessment"] = True
        self.check_denied(m=m)

    def test_06_criteria_must_be_source_derived_and_pending(self):
        for criteria in ([], ["CR-G01-01"], ["CR-G01-02", "CR-G01-01"],
                         ["CR-G01-01", "CR-G01-01"], ["CR-G01-01", "UNKNOWN"]):
            m = copy.deepcopy(self.manifest)
            m["links"][0]["criteriaRefs"] = criteria
            with self.subTest(criteria=criteria):
                self.check_denied(m=m)
        m = copy.deepcopy(self.manifest)
        m["links"][0]["teacherReview"] = "APPROVED"
        self.check_denied(m=m)

    def test_07_only_controlled_relation_and_reason(self):
        for name in ("relation", "rationaleCode"):
            m = copy.deepcopy(self.manifest)
            m["links"][0][name] = "AUTO_CONFIRMED"
            with self.subTest(field=name):
                self.check_denied(m=m)

    def test_08_reject_personal_data_and_extra_fields(self):
        for field in ("studentId", "gradeId", "confirmedByTeacher",
                      "observation", "rubric", "score"):
            m = copy.deepcopy(self.manifest)
            m["links"][0][field] = "forbidden"
            with self.subTest(field=field):
                self.check_denied(m=m)
        m = copy.deepcopy(self.manifest)
        m["links"][0]["scope"]["classId"] = "real-class"
        self.check_denied(m=m)

    def test_09_reject_new_permissions_and_extra_link(self):
        for key in ("publicFacing", "runtimeEnabled", "registerImportEnabled",
                    "automaticConfirmation", "personalDataIncluded", "studentsObserved",
                    "gradesGenerated", "competenceCertifications"):
            m = copy.deepcopy(self.manifest)
            m["safety"][key] = True
            with self.subTest(field=key):
                self.check_denied(m=m)
        m = copy.deepcopy(self.manifest)
        m["links"].append(copy.deepcopy(m["links"][0]))
        self.check_denied(m=m)

    def test_10_fail_when_reference_source_promoted(self):
        g = copy.deepcopy(self.g01)
        g["example"]["masterReference"]["state"] = "APPROVED"
        self.check_denied(g=g)
        v = copy.deepcopy(self.preview)
        v["curricolo"]["bindable"] = True
        self.check_denied(v=v)


if __name__ == "__main__":
    unittest.main()
