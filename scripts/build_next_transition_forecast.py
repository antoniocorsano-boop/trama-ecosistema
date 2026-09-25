#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / "control-center/data/ecosystem-snapshot.json"
POLICY = ROOT / "config/governed-forecast-policy.json"


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def derive(snapshot: dict) -> list[dict]:
    evidence_ref = "EV-SOURCE-ECOSYSTEM-STATUS"
    generated_at = snapshot["generatedAt"]
    items = []

    for gate in snapshot.get("gates", []):
        if gate.get("blocking") and gate.get("status") != "PASS":
            gid = gate["id"]
            items.append({
                "id": f"FC-{gid.replace('_', '-').upper()}",
                "subjectRef": gid,
                "currentState": str(gate.get("status") or "UNKNOWN"),
                "candidateTransition": "ELIGIBLE_AFTER_GATE_PASS",
                "blockingGateRefs": [gid],
                "dependencyRefs": [],
                "evidenceRefs": [evidence_ref],
                "confidence": "HIGH",
                "confidenceRationale": [
                    "Derivazione deterministica da un gate blocking esplicito nello snapshot; la confidence descrive la derivazione, non la probabilità di passaggio."
                ],
                "invalidators": [
                    "Cambio dello stato del gate o dello snapshot sorgente."
                ],
                "scenarioRef": None,
                "generatedAt": generated_at,
                "sourceSnapshotGeneratedAt": generated_at,
                "canonicalStateImpact": "NONE",
                "authorityImpact": "NONE",
                "runtimeAuthorizationImpact": "NONE",
            })

    for dep in snapshot.get("operationalPath", {}).get("unmetDependencies", []):
        subject = dep["subjectRef"]
        dep_ref = dep["dependencyRef"]
        fid = f"FC-{subject}-{dep_ref}".replace("_", "-").upper()
        items.append({
            "id": fid,
            "subjectRef": subject,
            "currentState": "BLOCKED_BY_DEPENDENCY",
            "candidateTransition": "ELIGIBLE_WHEN_DEPENDENCIES_PASS",
            "blockingGateRefs": [dep_ref] if dep.get("dependencyKind") == "GATE" else [],
            "dependencyRefs": [dep_ref],
            "evidenceRefs": [evidence_ref],
            "confidence": "HIGH",
            "confidenceRationale": [
                "Derivazione deterministica da una dipendenza non soddisfatta esplicitamente registrata nello snapshot."
            ],
            "invalidators": [
                "Cambio della dipendenza, del soggetto o dello snapshot sorgente."
            ],
            "scenarioRef": None,
            "generatedAt": generated_at,
            "sourceSnapshotGeneratedAt": generated_at,
            "canonicalStateImpact": "NONE",
            "authorityImpact": "NONE",
            "runtimeAuthorizationImpact": "NONE",
        })

    return sorted(items, key=lambda item: item["id"])


def validate(items: list[dict]) -> None:
    forbidden = {"probability", "likelihood", "score", "overallScore", "approved", "authorized", "runtimeState", "state"}
    for item in items:
        present = forbidden.intersection(item)
        if present:
            raise ValueError(f"forbidden fields: {sorted(present)}")
        if item["confidence"] not in {"LOW", "MEDIUM", "HIGH"}:
            raise ValueError("invalid qualitative confidence")
        for key in ("canonicalStateImpact", "authorityImpact", "runtimeAuthorizationImpact"):
            if item[key] != "NONE":
                raise ValueError(f"{key} must remain NONE")
        if not item["confidenceRationale"] or not item["invalidators"] or not item["evidenceRefs"]:
            raise ValueError("rationale, invalidators and evidenceRefs are required")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--output")
    args = parser.parse_args()

    snapshot = load(SNAPSHOT)
    policy = load(POLICY)
    if policy.get("mode") != "ADVISORY_READ_ONLY":
        raise SystemExit("forecast policy must remain ADVISORY_READ_ONLY")
    items = derive(snapshot)
    validate(items)
    if not items:
        raise SystemExit("no deterministic transition candidates derived")

    if args.output:
        Path(args.output).write_text(json.dumps(items, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if args.check:
        print(f"TRAMA_CC3_F1_NEXT_TRANSITION_ENGINE_PASS candidates={len(items)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
