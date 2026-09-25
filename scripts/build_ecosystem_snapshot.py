#!/usr/bin/env python3
"""Build the governed snapshot and bind ECO-02/P1 final human evidence."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone

import build_ecosystem_snapshot_core as core

ROOT = core.ROOT
RECEIPT_PATH = "docs/pilots/ECO-02-P1-FINAL-HUMAN-ACCEPTANCE-2026-09-25.md"
GATE_REF = "GATE-ECO02-HUMAN-FINAL"
CAPABILITY_REF = "ECO-02-P1"


def _eco02_final_evidence(snapshot: dict) -> list[dict]:
    capability = next(
        (item for item in snapshot.get("capabilities", []) if item.get("id") == CAPABILITY_REF),
        None,
    )
    gate = next(
        (item for item in snapshot.get("gates", []) if item.get("id") == GATE_REF),
        None,
    )
    receipt = ROOT / RECEIPT_PATH
    if (
        capability is None
        or gate is None
        or capability.get("state") != "CLOSED"
        or capability.get("humanReview") != "PASS"
        or gate.get("status") != "PASS"
        or not receipt.exists()
    ):
        return []

    source = {
        "path": RECEIPT_PATH,
        "sha256": core.sha256_file(receipt),
    }
    common = {
        "area": "interoperability",
        "status": "PASS",
        "source": source,
        "observedAt": "2026-09-25T12:46:47Z",
        "freshness": {"policy": "EVENT_BOUND", "expiresAt": None},
        "confidence": "HIGH",
        "supports": [{"gateRef": GATE_REF}],
        "binding": {
            "capabilityRef": CAPABILITY_REF,
            "releaseRef": "trama-ecosistema#93",
        },
    }
    return [
        {
            "id": "EV-ECO02-P1-REAL-CASE",
            "type": "REAL_CASE_VALIDATION",
            "subject": "ECO-02/P1 final real-case end-to-end validation",
            **common,
        },
        {
            "id": "EV-ECO02-P1-HUMAN",
            "type": "HUMAN_REVIEW",
            "subject": "ECO-02/P1 final human acceptance",
            **common,
        },
    ]


def build_snapshot(root=ROOT) -> dict:
    snapshot = core.build_snapshot(root)
    existing = {item.get("id") for item in snapshot.get("evidence", [])}
    snapshot["evidence"].extend(
        item for item in _eco02_final_evidence(snapshot) if item["id"] not in existing
    )
    observed_at = core.parse_timestamp(snapshot.get("generatedAt")) or datetime.now(timezone.utc)
    snapshot["integrityChecks"] = core.build_integrity_checks(snapshot, observed_at)
    snapshot["operationalPath"] = core.build_operational_path(snapshot)
    return snapshot


def validate(snapshot: dict) -> None:
    core.validate(snapshot)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        default="control-center/data/ecosystem-snapshot.json",
        help="Output path relative to repository root.",
    )
    parser.add_argument("--check", action="store_true", help="Build and validate without writing.")
    args = parser.parse_args()

    snapshot = build_snapshot(ROOT)
    validate(snapshot)

    if args.check:
        print("TRAMA_ECOSYSTEM_SNAPSHOT_CHECK_PASS")
        return 0

    output = ROOT / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
