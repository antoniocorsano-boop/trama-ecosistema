#!/usr/bin/env python3
"""Build the governed snapshot and bind explicit human-review evidence."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone

import build_ecosystem_snapshot_core as core

ROOT = core.ROOT
ECO02_RECEIPT_PATH = "docs/pilots/ECO-02-P1-FINAL-HUMAN-ACCEPTANCE-2026-09-25.md"
ECO02_GATE_REF = "GATE-ECO02-HUMAN-FINAL"
ECO02_CAPABILITY_REF = "ECO-02-P1"
CC3F1_RECEIPT_PATH = "docs/reviews/CC3-F1-HUMAN-REVIEW-2026-09-26.md"
CC3F1_GATE_REF = "GATE-CC3-F1-HUMAN"
CC3F1_CAPABILITY_REF = "CC3-F1"
CC3F1_REVIEWED_EXACT_HEAD = "686fe01b91b5e5b38a9956198e79c5ff713b0b8f"


def _eco02_final_evidence(snapshot: dict) -> list[dict]:
    capability = next(
        (item for item in snapshot.get("capabilities", []) if item.get("id") == ECO02_CAPABILITY_REF),
        None,
    )
    gate = next(
        (item for item in snapshot.get("gates", []) if item.get("id") == ECO02_GATE_REF),
        None,
    )
    receipt = ROOT / ECO02_RECEIPT_PATH
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
        "path": ECO02_RECEIPT_PATH,
        "sha256": core.sha256_file(receipt),
    }
    common = {
        "area": "interoperability",
        "status": "PASS",
        "source": source,
        "observedAt": "2026-09-25T12:46:47Z",
        "freshness": {"policy": "EVENT_BOUND", "expiresAt": None},
        "confidence": "HIGH",
        "supports": [{"gateRef": ECO02_GATE_REF}],
        "binding": {
            "capabilityRef": ECO02_CAPABILITY_REF,
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


def _cc3f1_human_evidence(snapshot: dict) -> list[dict]:
    capability = next(
        (item for item in snapshot.get("capabilities", []) if item.get("id") == CC3F1_CAPABILITY_REF),
        None,
    )
    gate = next(
        (item for item in snapshot.get("gates", []) if item.get("id") == CC3F1_GATE_REF),
        None,
    )
    receipt = ROOT / CC3F1_RECEIPT_PATH
    if (
        capability is None
        or gate is None
        or capability.get("state") != "CLOSED"
        or capability.get("humanReview") != "PASS"
        or gate.get("status") != "PASS"
        or not receipt.exists()
    ):
        return []

    return [
        {
            "id": "EV-CC3-F1-HUMAN",
            "type": "HUMAN_REVIEW",
            "area": "governance",
            "subject": "CC3-F1 Next Transition Engine human exact-head review",
            "status": "PASS",
            "source": {
                "path": CC3F1_RECEIPT_PATH,
                "sha256": core.sha256_file(receipt),
            },
            "observedAt": "2026-09-26T00:00:00Z",
            "freshness": {"policy": "EVENT_BOUND", "expiresAt": None},
            "confidence": "HIGH",
            "supports": [{"gateRef": CC3F1_GATE_REF}],
            "binding": {
                "capabilityRef": CC3F1_CAPABILITY_REF,
                "releaseRef": "trama-ecosistema#97",
                "exactHead": CC3F1_REVIEWED_EXACT_HEAD,
            },
        }
    ]


def build_snapshot(root=ROOT) -> dict:
    snapshot = core.build_snapshot(root)
    existing = {item.get("id") for item in snapshot.get("evidence", [])}
    governed_evidence = _eco02_final_evidence(snapshot) + _cc3f1_human_evidence(snapshot)
    snapshot["evidence"].extend(
        item for item in governed_evidence if item["id"] not in existing
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
