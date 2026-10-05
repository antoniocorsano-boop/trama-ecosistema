import json
from pathlib import Path

AUDIT = Path("docs/audits/TRAMA-AUDIT-2026-10-03.md")
STATUS = Path("STATUS.md")
EVENTS = Path("status/project-knowledge-events.json")

old_head = "c3b4aa3cf952f6d4a5cc91d3015c3bfa8143ea8f"
new_head = "e40054349db5ed28ea663d24f4c4d048481ba3b5"


def must_replace(text: str, old: str, new: str, label: str) -> str:
    if old in text:
        return text.replace(old, new, 1)
    if new in text:
        return text
    raise SystemExit(f"{label}_ANCHOR_NOT_FOUND")


audit = AUDIT.read_text(encoding="utf-8")
audit = must_replace(
    audit,
    "A45 passa da `REMEDIATION_IMPLEMENTED / SECOND_HUMAN_PRODUCT_REVIEW_PENDING` a **`REAL_REFERENCES_GENERATED / HUMAN_VISUAL_REVIEW_REWORK / REFERENCE_LOCK_PENDING / SECOND_HUMAN_PRODUCT_REVIEW_PENDING`**.",
    "A45 passa da `REMEDIATION_IMPLEMENTED / SECOND_HUMAN_PRODUCT_REVIEW_PENDING` a **`REAL_REFERENCES_GENERATED / ART_DIRECTION_REMEDIATION_IMPLEMENTED_CANDIDATE / REGENERATION_PENDING / HUMAN_VISUAL_REVIEW_PENDING / REFERENCE_LOCK_PENDING / SECOND_HUMAN_PRODUCT_REVIEW_PENDING`**.",
    "AUDIT_A45_STATUS",
)
audit = must_replace(
    audit,
    "La prima Human Visual Review delle reference reali non concede reference lock. La PR #249, osservata come Draft sull'exact head `c3b4aa3cf952f6d4a5cc91d3015c3bfa8143ea8f`, apre una remediation bounded dell'art direction: rafforzare l'identità di Lia/Omar/Teo, eliminare pseudo-testo e dashboard spurie, rendere Sala Zero uno spazio narrativo fisico e Cabina regia un ambiente adiacente e coerente. Nessun F1–F6 parte prima del nuovo Human Visual Review PASS.",
    "La prima Human Visual Review delle reference reali non concede reference lock. La PR #249 ha ora implementato il candidato di remediation art-direction sull'exact head `e40054349db5ed28ea663d24f4c4d048481ba3b5`: Governance, Studio Atlas S1 Standalone, Visual Factory Generation Pipeline v0.2 e Studio Atlas ↔ Atlas Preview E2E risultano PASS. La remediation rafforza l'identità di Lia/Omar/Teo, elimina pseudo-testo e dashboard spurie, rende Sala Zero uno spazio narrativo fisico e Cabina regia un ambiente adiacente e coerente. La nuova generazione reale delle cinque reference e la successiva Human Visual Review restano necessarie; nessun F1–F6 parte prima del reference lock PASS.",
    "AUDIT_A45_DETAIL",
)
AUDIT.write_text(audit, encoding="utf-8")

status = STATUS.read_text(encoding="utf-8")
status = must_replace(
    status,
    "- **MUSEO ZERO v0.2:** `REAL_REFERENCES_GENERATED / HUMAN_VISUAL_REVIEW_REWORK / REFERENCE_LOCK_PENDING / SECOND_HUMAN_PRODUCT_REVIEW_PENDING`; la prima review visuale delle reference reali richiede remediation art-direction v0.3; nessun F1–F6 prima del reference lock;",
    "- **MUSEO ZERO v0.2:** `REAL_REFERENCES_GENERATED / ART_DIRECTION_REMEDIATION_IMPLEMENTED_CANDIDATE / REGENERATION_PENDING / HUMAN_VISUAL_REVIEW_PENDING / REFERENCE_LOCK_PENDING / SECOND_HUMAN_PRODUCT_REVIEW_PENDING`; PR #249 `e40054349db5ed28ea663d24f4c4d048481ba3b5` ha i quattro gate principali PASS; nuova generazione reale e Human Visual Review restano necessarie; nessun F1–F6 prima del reference lock;",
    "STATUS_MUSEO",
)
STATUS.write_text(status, encoding="utf-8")

data = json.loads(EVENTS.read_text(encoding="utf-8"))
found = False
for event in data["events"]:
    if event.get("eventId") == "TRAMA-EVT-AUDIT-V1.4-VISUAL-FACTORY-LIVE-PROOF-2026-10-05":
        found = True
        event["statement"] = (
            "Audit v1.4 records real Visual Factory reference generation as proven, VF-ORCH-01 live FREE_ONLY reference execution as proven, "
            "MUSEO ZERO art-direction remediation v0.3 as an implemented and automatically qualified candidate with regeneration and Human Visual Review still pending, "
            "P5 as REQUALIFICATION_PREPARED_NOT_AUTHORIZED and P4 as local-proof-package-ready candidate. Formal maturity levels remain unchanged and DOS-A1 remains RUNTIME_DEFERRED."
        )
        for ref in event.get("sourceRefs", []):
            if ref.get("pullRequest") == 249:
                ref["exactHead"] = new_head
        break
if not found:
    raise SystemExit("AUDIT_V1_4_EVENT_NOT_FOUND")
data["updatedAt"] = "2026-10-05T18:02:00Z"
EVENTS.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

print("AUDIT_V1_4_MUSEO_ZERO_REFRESHED")
