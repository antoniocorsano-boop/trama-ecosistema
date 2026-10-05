#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVENTS_PATH = ROOT / "status/project-knowledge-events.json"

CLOSURE_ID = "TRAMA-EVT-P3-BASELINE-RECONCILED-2026-10-04"
QE_ID = "TRAMA-EVT-QE01-REQUALIFICATION-REQUIRED-2026-10-04"

CLOSURE_STATUS_REF = {
    "repository": "antoniocorsano-boop/trama-ecosistema",
    "exactHead": "937392cb4de74344040adfd1dd35355776bb15b6",
    "ref": "STATUS.md",
}
QE_PR_REF = {
    "repository": "antoniocorsano-boop/trama-ecosistema",
    "pullRequest": 212,
    "exactHead": "2889189ceab3c83a759b0b1f86a9a3797188ff9a",
    "ref": "runtime: prepare QE-01 first qualified execution",
}
QE_AUDIT_REF = {
    "repository": "antoniocorsano-boop/trama-ecosistema",
    "exactHead": "0000ca9be8a8dfa24535a4b718eecdbcde82ab8c",
    "ref": "docs/audits/TRAMA-AUDIT-2026-10-03.md",
}


def replace_ref(refs: list[dict], predicate, replacement: dict) -> list[dict]:
    result: list[dict] = []
    replaced = False
    for ref in refs:
        if predicate(ref):
            if not replaced:
                result.append(replacement)
                replaced = True
            continue
        result.append(ref)
    if not replaced:
        result.append(replacement)
    return result


def main() -> None:
    payload = json.loads(EVENTS_PATH.read_text(encoding="utf-8"))
    events = {event["eventId"]: event for event in payload["events"]}

    closure = events[CLOSURE_ID]
    closure["sourceRefs"] = replace_ref(
        closure["sourceRefs"],
        lambda ref: ref.get("ref") == "STATUS.md"
        and ref.get("repository") == "antoniocorsano-boop/trama-ecosistema",
        CLOSURE_STATUS_REF,
    )

    qe = events[QE_ID]
    qe["sourceRefs"] = replace_ref(
        qe["sourceRefs"],
        lambda ref: ref.get("pullRequest") == 212
        and ref.get("repository") == "antoniocorsano-boop/trama-ecosistema",
        QE_PR_REF,
    )
    qe["sourceRefs"] = replace_ref(
        qe["sourceRefs"],
        lambda ref: ref.get("ref") == "docs/audits/TRAMA-AUDIT-2026-10-03.md"
        and ref.get("repository") == "antoniocorsano-boop/trama-ecosistema",
        QE_AUDIT_REF,
    )

    EVENTS_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
