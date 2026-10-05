# Permanent regression guard for P3 closure and version-bound provenance.
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class P3StatusAlignmentTests(unittest.TestCase):
    def test_status_marks_p3_reconciled_not_next(self):
        status = (ROOT / "STATUS.md").read_text(encoding="utf-8")
        self.assertNotIn("**P3 evidenze/distribuzioni:** **NEXT**", status)
        self.assertIn("**P3 evidenze/distribuzioni:** **CLOSED / BASELINE_RECONCILED**", status)

    def test_project_knowledge_supersedes_p3_next_and_records_residuals(self):
        payload = json.loads((ROOT / "status/project-knowledge-events.json").read_text(encoding="utf-8"))
        events = {event["eventId"]: event for event in payload["events"]}

        old = events["TRAMA-EVT-P3-EVIDENCE-DISTRIBUTION-NEXT-2026-10-04"]
        self.assertEqual(old["status"], "SUPERSEDED")
        self.assertIn("TRAMA-EVT-P3-BASELINE-RECONCILED-2026-10-04", old["invalidatedBy"])

        closure = events["TRAMA-EVT-P3-BASELINE-RECONCILED-2026-10-04"]
        self.assertEqual(closure["status"], "CURRENT")
        self.assertIn("TRAMA-EVT-P3-EVIDENCE-DISTRIBUTION-NEXT-2026-10-04", closure["supersedes"])
        closure_refs = closure["sourceRefs"]
        self.assertIn(
            {
                "repository": "antoniocorsano-boop/trama-ecosistema",
                "exactHead": "937392cb4de74344040adfd1dd35355776bb15b6",
                "ref": "STATUS.md",
            },
            closure_refs,
        )

        qe = events["TRAMA-EVT-QE01-REQUALIFICATION-REQUIRED-2026-10-04"]
        self.assertEqual(qe["status"], "CURRENT")
        self.assertIn(
            {
                "repository": "antoniocorsano-boop/trama-ecosistema",
                "pullRequest": 212,
                "exactHead": "2889189ceab3c83a759b0b1f86a9a3797188ff9a",
                "ref": "runtime: prepare QE-01 first qualified execution",
            },
            qe["sourceRefs"],
        )
        self.assertIn(
            {
                "repository": "antoniocorsano-boop/trama-ecosistema",
                "exactHead": "0000ca9be8a8dfa24535a4b718eecdbcde82ab8c",
                "ref": "docs/audits/TRAMA-AUDIT-2026-10-03.md",
            },
            qe["sourceRefs"],
        )

        argo = events["TRAMA-EVT-ARGO-G5C-REAL-IMPORT-PENDING-2026-10-04"]
        self.assertEqual(argo["status"], "CURRENT")

        ghaw_old = events["TRAMA-EVT-GHAW-T0-STAGED-NOT-EXECUTABLE-2026-10-04"]
        self.assertEqual(ghaw_old["status"], "SUPERSEDED")
        self.assertIn("TRAMA-EVT-GHAW-T0-CLOSED-INTEGRATED-2026-10-05", ghaw_old["invalidatedBy"])

        ghaw_closed = events["TRAMA-EVT-GHAW-T0-CLOSED-INTEGRATED-2026-10-05"]
        self.assertEqual(ghaw_closed["status"], "CURRENT")
        self.assertEqual(ghaw_closed["type"], "CLOSURE")
        self.assertIn("TRAMA-EVT-GHAW-T0-STAGED-NOT-EXECUTABLE-2026-10-04", ghaw_closed["supersedes"])
        self.assertIn(
            {
                "repository": "antoniocorsano-boop/trama-ecosistema",
                "pullRequest": 236,
                "exactHead": "3327162f9045619fed6e5c3ba2712334390d0d24",
                "ref": "gh-aw T0 — controlled staged issue triage qualification",
            },
            ghaw_closed["sourceRefs"],
        )
        self.assertIn(
            {
                "repository": "antoniocorsano-boop/trama-ecosistema",
                "exactHead": "4ee44c1b906f3f816600c911614f6a9b43c3785c",
                "ref": "main",
            },
            ghaw_closed["sourceRefs"],
        )

    def test_audit_records_p3_and_p6_closure_evidence(self):
        audit = (ROOT / "docs/audits/TRAMA-AUDIT-2026-10-03.md").read_text(encoding="utf-8")
        self.assertIn("P3 — BASELINE_RECONCILED", audit)
        self.assertIn("0000ca9be8a8dfa24535a4b718eecdbcde82ab8c", audit)
        self.assertIn("09a3a3600b81992f3675be82d1d2f188f1643909", audit)
        self.assertIn("Versione 1.2", audit)
        self.assertIn("P6 — CLOSED / INTEGRATED", audit)
        self.assertIn("4ee44c1b906f3f816600c911614f6a9b43c3785c", audit)

    def test_status_records_p6_closed_and_remaining_residuals(self):
        status = (ROOT / "STATUS.md").read_text(encoding="utf-8")
        self.assertIn("**P6 gh-aw T0:** **CLOSED / INTEGRATED**", status)
        self.assertNotIn("gh-aw T0 restano residui separati P5/P4/P6", status)
        self.assertIn("Argo G5-C e QE-01 restano residui separati P4/P5", status)


if __name__ == "__main__":
    unittest.main()
