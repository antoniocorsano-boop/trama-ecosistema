#!/usr/bin/env python3
"""Build the TRAMA Control Center v2 ecosystem snapshot.

CC2-F1 foundation only:
- reads declared canonical local sources;
- emits a schema-compatible snapshot;
- does not infer maturity levels yet;
- does not call external APIs;
- does not write to any source system.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from evaluate_maturity_definitions import evaluate_area, validate_definitions

ROOT = Path(__file__).resolve().parents[1]


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def capability_map(status_doc: dict) -> dict:
    return {item["id"]: item for item in status_doc.get("capabilities", [])}


def normalize_gate_status(value: str | None) -> str:
    mapping = {
        "PENDING": "OPEN",
        "PASS": "PASS",
        "FAIL": "FAIL",
        "NOT_REQUIRED": "NOT_APPLICABLE",
    }
    return mapping.get(value or "", "OPEN")


def phase_status(capabilities: dict) -> list[dict]:
    eco01 = capabilities.get("ECO-01", {})
    eco02 = capabilities.get("ECO-02-P1", {})
    r3f0 = capabilities.get("R3-F0", {})
    r4p1 = capabilities.get("R4-P1", {})
    brand = capabilities.get("TRAMA-BRAND", {})

    return [
        {
            "id": "R1",
            "name": "Fondazione del governo",
            "status": "COMPLETE" if eco01.get("state") == "CLOSED" else "ACTIVE",
            "gateRefs": [],
        },
        {
            "id": "R2",
            "name": "Pilota ECO-02/P1",
            "status": eco02.get("state", "UNVERIFIED"),
            "gateRefs": ["GATE-ECO02-HUMAN-FINAL"] if eco02.get("state") != "CLOSED" else [],
        },
        {
            "id": "R3",
            "name": "Consolidamento Atlas",
            "status": r3f0.get("state", "UNVERIFIED"),
            "gateRefs": ["GATE-R3-F0-EXIT"] if r3f0.get("reviewGates", {}).get("exit") != "PASS" else [],
        },
        {
            "id": "R4",
            "name": "Esperienza professionale guidata",
            "status": r4p1.get("state", "PLANNED"),
            "gateRefs": [],
        },
        {
            "id": "R5",
            "name": "Preparazione all'adozione",
            "status": brand.get("state", "PLANNED"),
            "gateRefs": [],
        },
    ]


def build_snapshot(root: Path) -> dict:
    observed_at = datetime.now(timezone.utc).isoformat()
    config = load_json(root / "config/control-center-snapshot-sources.json")
    eco_status = load_json(root / "status/ecosystem-status.json")
    decisions = load_json(root / "docs/decisions/decision-register.json")
    maturity_definitions = load_json(root / "config/maturity-area-definitions.json")
    validate_definitions(maturity_definitions)
    caps = capability_map(eco_status)

    source_state = {}
    evidence = []

    for source in config["sources"]:
        path = root / source["path"]
        exists = path.exists()
        source_state[source["id"]] = {
            "status": "FRESH" if exists else "BLOCKED",
            "observedAt": observed_at if exists else None,
            "ref": source["path"],
            "sha256": sha256_file(path) if exists else None,
        }
        if exists:
            evidence.append(
                {
                    "id": f"EV-SOURCE-{source['id'].upper()}",
                    "type": "DOCUMENT_CANONICAL",
                    "area": "governance",
                    "subject": source["role"],
                    "status": "PASS",
                    "source": {
                        "path": source["path"],
                        "sha256": sha256_file(path),
                    },
                    "observedAt": observed_at,
                    "freshness": {"policy": source["freshnessPolicy"], "expiresAt": None},
                    "confidence": "HIGH",
                    "supports": [],
                }
            )

    gates = [
        {
            "id": "GATE-ECO02-HUMAN-FINAL",
            "area": "interoperability",
            "type": "HUMAN",
            "status": "PASS" if caps.get("ECO-02-P1", {}).get("humanReview") == "PASS" else "OPEN",
            "blocking": True,
            "requiredEvidenceTypes": ["REAL_CASE_VALIDATION", "HUMAN_REVIEW"],
            "decisionAuthority": "Human Review",
        },
        {
            "id": "GATE-R3-F0-EXIT",
            "area": "atlas",
            "type": "HUMAN",
            "status": normalize_gate_status(caps.get("R3-F0", {}).get("reviewGates", {}).get("exit")),
            "blocking": True,
            "requiredEvidenceTypes": ["ACCESSIBILITY_GATE", "HUMAN_REVIEW"],
            "decisionAuthority": "TRAMA/Human Review",
        },
    ]

    adr014 = next((d for d in decisions.get("decisions", []) if d.get("id") == "TRAMA-ADR-014"), None)
    if adr014:
        evidence.append(
            {
                "id": "EV-TRAMA-ADR-014",
                "type": "CONTRACT_APPROVED" if adr014.get("status") == "APPROVED" else "DOCUMENT_CANONICAL",
                "area": "governance",
                "subject": "TRAMA-ADR-014",
                "status": "PASS",
                "source": {"path": "docs/decisions/decision-register.json", "ref": "TRAMA-ADR-014"},
                "observedAt": observed_at,
                "freshness": {"policy": "UNTIL_CHANGE", "expiresAt": None},
                "confidence": "HIGH",
                "supports": [],
            }
        )

    maturity_results = [
        evaluate_area(area_def, evidence)
        for area_def in maturity_definitions["areas"]
    ]
    maturity_areas = [
        {
            "id": result["id"],
            "name": result["name"],
            "ownerDomain": result["ownerDomain"],
            "confirmedLevel": result["confirmedLevel"],
            "candidateLevel": result["confirmedLevel"],
            "confidence": "LOW",
            "status": "PARTIAL",
            "evidenceRefs": result["currentEvidenceRefs"],
            "blockingGateRefs": [
                gate["id"]
                for gate in gates
                if gate.get("area") == result["id"] and gate.get("blocking") and gate.get("status") != "PASS"
            ],
            "dependencies": result["dependencies"],
            "lastEvaluatedAt": observed_at,
        }
        for result in maturity_results
    ]

    return {
        "$schema": "../../schemas/ecosystem-snapshot.schema.json",
        "schemaVersion": "1.0.0",
        "generatedAt": observed_at,
        "sourceState": source_state,
        "phases": phase_status(caps),
        "areas": maturity_areas,
        "gates": gates,
        "evidence": evidence,
        "dependencies": [
            {"from": "Arena", "to": "Docente OS", "kind": "AUTHORITY", "status": "ACTIVE"},
            {"from": "Arena", "to": "Atlas", "kind": "DATA_FLOW", "status": "GOVERNED"},
            {"from": "Docente OS", "to": "Atlas", "kind": "FUTURE_NOT_AUTHORIZED", "status": "NOT_AUTHORIZED"},
        ],
        "expansionCandidates": [
            {"id": "R3-P2", "name": "Curriculum pubblico", "status": "PLANNED", "dependencyRefs": ["GATE-R3-F0-EXIT"]},
            {"id": "R3-P5", "name": "Smart Navigation", "status": "PLANNED", "dependencyRefs": ["GATE-R3-F0-EXIT"]},
        ],
    }


def validate(snapshot: dict) -> None:
    required = {
        "schemaVersion",
        "generatedAt",
        "sourceState",
        "phases",
        "areas",
        "gates",
        "evidence",
        "dependencies",
        "expansionCandidates",
    }
    missing = sorted(required - snapshot.keys())
    if missing:
        raise ValueError(f"Missing snapshot keys: {missing}")

    phase_ids = {p["id"] for p in snapshot["phases"]}
    if phase_ids != {"R1", "R2", "R3", "R4", "R5"}:
        raise ValueError(f"Unexpected phase set: {sorted(phase_ids)}")

    gate_ids = {g["id"] for g in snapshot["gates"]}
    valid_gate_statuses = {"OPEN", "IN_PROGRESS", "PASS", "FAIL", "WAIVED", "NOT_APPLICABLE"}
    for gate in snapshot["gates"]:
        if gate["status"] not in valid_gate_statuses:
            raise ValueError(f"Invalid gate status {gate['status']} for {gate['id']}")

    for phase in snapshot["phases"]:
        for gate_ref in phase.get("gateRefs", []):
            if gate_ref not in gate_ids:
                raise ValueError(f"Unresolved gate reference: {gate_ref}")

    source_statuses = {"FRESH", "STALE", "PARTIAL", "UNVERIFIED", "BLOCKED"}
    for source_id, source in snapshot["sourceState"].items():
        if source["status"] not in source_statuses:
            raise ValueError(f"Invalid source status {source['status']} for {source_id}")

    evidence_ids = {item["id"] for item in snapshot["evidence"]}
    if len(evidence_ids) != len(snapshot["evidence"]):
        raise ValueError("Duplicate evidence id detected")


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
