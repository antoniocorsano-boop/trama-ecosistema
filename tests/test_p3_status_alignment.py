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

        for event_id in (
            "TRAMA-EVT-QE01-REQUALIFICATION-REQUIRED-2026-10-04",
            "TRAMA-EVT-ARGO-G5C-REAL-IMPORT-PENDING-2026-10-04",
            "TRAMA-EVT-GHAW-T0-STAGED-NOT-EXECUTABLE-2026-10-04",
        ):
            self.assertIn(event_id, events)
            self.assertEqual(events[event_id]["status"], "CURRENT")

    def test_audit_records_p3_closure_evidence(self):
        audit = (ROOT / "docs/audits/TRAMA-AUDIT-2026-10-03.md").read_text(encoding="utf-8")
        self.assertIn("P3 — BASELINE_RECONCILED", audit)
        self.assertIn("0000ca9be8a8dfa24535a4b718eecdbcde82ab8c", audit)
        self.assertIn("09a3a3600b81992f3675be82d1d2f188f1643909", audit)


if __name__ == "__main__":
    unittest.main()
