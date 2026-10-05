# Permanent regression guard for P3 reconciliation, P6 closure, and Audit v1.3 provenance.
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
V13_EVENT_ID = "TRAMA-EVT-AUDIT-V1.3-STUDIO-ATLAS-BASELINE-2026-10-05"
V13_SPEC_PATH = "docs/superpowers/specs/2026-10-05-trama-audit-v1-3-studio-atlas-baseline-design.md"


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
        self.assertIn("### Stato dei pacchetti al 5 ottobre 2026", audit)
        self.assertIn("| Pacchetto | Stato v1.2 | Nota |", audit)
        self.assertNotIn("### Stato dei pacchetti al 4 ottobre 2026\n\n| Pacchetto | Stato v1.1 | Nota |", audit)

    def test_project_knowledge_pack_projects_p6_closure(self):
        pack = json.loads(
            (ROOT / "control-center/data/context-packs/project-knowledge.json").read_text(encoding="utf-8")
        )
        facts = {item.get("eventId"): item for item in pack.get("facts", []) if item.get("eventId")}
        event_id = "TRAMA-EVT-GHAW-T0-CLOSED-INTEGRATED-2026-10-05"
        self.assertIn(event_id, facts)
        self.assertEqual(facts[event_id]["status"], "CURRENT")
        self.assertIn(
            "4ee44c1b906f3f816600c911614f6a9b43c3785c",
            json.dumps(facts[event_id], ensure_ascii=False),
        )

    def test_status_records_p6_closed_and_remaining_residuals(self):
        status = (ROOT / "STATUS.md").read_text(encoding="utf-8")
        self.assertIn("**P6 gh-aw T0:** **CLOSED / INTEGRATED**", status)
        self.assertNotIn("gh-aw T0 restano residui separati P5/P4/P6", status)
        self.assertIn("Argo G5-C e QE-01 restano residui separati P4/P5", status)

    def test_audit_v13_adds_studio_atlas_without_rewriting_history(self):
        audit = (ROOT / "docs/audits/TRAMA-AUDIT-2026-10-03.md").read_text(encoding="utf-8")
        self.assertIn("Versione 1.3", audit)
        for audit_id in range(42, 50):
            self.assertIn(f"A{audit_id:02d}", audit)
        self.assertIn("Studio Atlas", audit)
        self.assertIn("SECOND_HUMAN_PRODUCT_REVIEW_PENDING", audit)
        self.assertIn("REAL_VISUAL_RUN_PENDING", audit)
        self.assertIn("CORE_IMPLEMENTED / PLAN_INCOMPLETE", audit)
        self.assertIn("A01", audit)
        self.assertIn("A41", audit)
        self.assertIn("P6 — CLOSED / INTEGRATED", audit)
        self.assertIn("REVISE", audit)
        self.assertNotIn("MUSEO ZERO Human Product Review: PASS", audit)

    def test_status_projects_studio_atlas_as_first_level_domain_without_authority_promotion(self):
        status = (ROOT / "STATUS.md").read_text(encoding="utf-8")
        self.assertIn("v1.3", status)
        self.assertIn("Studio Atlas", status)
        self.assertIn("NOT_RUNTIME_AUTHORIZED", status)
        self.assertIn("DOS-A1", status)
        self.assertIn("RUNTIME_DEFERRED", status)
        for marker in (
            "P1 Orario + PWA + Android",
            "P2 Arena→Atlas",
            "P3 evidenze/distribuzioni",
            "P6 gh-aw T0",
            "P4",
            "P5",
        ):
            self.assertIn(marker, status)

    def test_project_knowledge_records_audit_v13_as_current_source_bound_delta(self):
        payload = json.loads((ROOT / "status/project-knowledge-events.json").read_text(encoding="utf-8"))
        events = {event["eventId"]: event for event in payload["events"]}
        self.assertIn(V13_EVENT_ID, events)
        event = events[V13_EVENT_ID]
        self.assertEqual(event["status"], "CURRENT")
        self.assertEqual(event["type"], "BASELINE")
        self.assertEqual(event["subject"], "ecosystem-audit")
        self.assertIn("Studio Atlas", event["statement"])
        self.assertIn("A42", event["statement"])
        self.assertIn("A49", event["statement"])
        self.assertTrue(
            any(ref.get("ref") == V13_SPEC_PATH or ref.get("path") == V13_SPEC_PATH for ref in event["sourceRefs"])
        )

    def test_context_pack_projects_audit_v13_event(self):
        pack = json.loads(
            (ROOT / "control-center/data/context-packs/project-knowledge.json").read_text(encoding="utf-8")
        )
        facts = {item.get("eventId"): item for item in pack.get("facts", []) if item.get("eventId")}
        self.assertIn(V13_EVENT_ID, facts)
        event = facts[V13_EVENT_ID]
        self.assertEqual(event["status"], "CURRENT")
        rendered = json.dumps(event, ensure_ascii=False)
        self.assertIn("Studio Atlas", rendered)
        self.assertIn("NOT_RUNTIME_AUTHORIZED", rendered)
        self.assertNotIn("STUDENT_AUTHORIZED", rendered)


if __name__ == "__main__":
    unittest.main()
