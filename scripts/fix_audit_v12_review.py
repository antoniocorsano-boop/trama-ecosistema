#!/usr/bin/env python3
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVENTS_PATH = ROOT / "status/project-knowledge-events.json"
AUDIT_PATH = ROOT / "docs/audits/TRAMA-AUDIT-2026-10-03.md"
EVENT_ID = "TRAMA-EVT-GHAW-T0-CLOSED-INTEGRATED-2026-10-05"


def main() -> None:
    payload = json.loads(EVENTS_PATH.read_text(encoding="utf-8"))
    event = next(item for item in payload["events"] if item["eventId"] == EVENT_ID)

    marker = "project-knowledge context pack"
    if marker not in event.get("rationale", ""):
        event["rationale"] = (
            event["rationale"].rstrip()
            + " The closure is part of the project-knowledge context pack so distributed agents and the Control Center can resolve the current P6 state from the governed projection."
        )

    payload["updatedAt"] = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    EVENTS_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    audit = AUDIT_PATH.read_text(encoding="utf-8")
    old_heading = "### Stato dei pacchetti al 4 ottobre 2026\n\n| Pacchetto | Stato v1.1 | Nota |"
    new_heading = "### Stato dei pacchetti al 5 ottobre 2026\n\n| Pacchetto | Stato v1.2 | Nota |"
    if old_heading not in audit:
        raise RuntimeError("AUDIT_PACKAGE_TABLE_BASELINE_NOT_FOUND")
    audit = audit.replace(old_heading, new_heading, 1)
    audit = audit.replace(
        "Audit presente su `main`; questa v1.1 aggiunge il collegamento operativo da STATUS",
        "Audit presente su `main`; questa v1.2 mantiene il collegamento operativo da STATUS",
        1,
    )
    AUDIT_PATH.write_text(audit, encoding="utf-8")


if __name__ == "__main__":
    main()
