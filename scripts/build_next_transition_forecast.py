#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / "control-center/data/ecosystem-snapshot.json"
POLICY = ROOT / "config/governed-forecast-policy.json"
SELF_TEST_FIXTURE = ROOT / "fixtures/cc3-f1/next-transition-snapshot.json"
FALLBACK_EVIDENCE_REF = "EV-SOURCE-ECOSYSTEM-STATUS"


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def safe_id(value: str) -> str:
    normalized = re.sub(r"[^A-Z0-9]+", "-", value.upper()).strip("-")
    return normalized or "UNKNOWN"


def subject_index(snapshot: dict) -> dict[str, dict]:
    items: dict[str, dict] = {}
    for collection in ("capabilities", "expansionCandidates", "areas"):
        for item in snapshot.get(collection, []):
            ref = item.get("id")
            if ref:
                items[str(ref)] = item
    return items


def evidence_for_subject(index: dict[str, dict], subject_ref: str) -> list[str]:
    refs = index.get(subject_ref, {}).get("evidenceRefs") or []
    unique = sorted({str(ref) for ref in refs if ref})
    return unique or [FALLBACK_EVIDENCE_REF]


def subjects_for_gate(snapshot: dict, gate_id: str) -> list[str]:
    subjects = []
    for item in snapshot.get("capabilities", []):
        if gate_id in item.get("gateRefs", []):
            subjects.append(str(item["id"]))
    return sorted(set(subjects)) or [gate_id]


def derive(snapshot: dict) -> list[dict]:
    generated_at = snapshot["generatedAt"]
    index = subject_index(snapshot)
    items = []

    for gate in snapshot.get("gates", []):
        if gate.get("blocking") and gate.get("status") != "PASS":
            gid = str(gate["id"])
            for subject in subjects_for_gate(snapshot, gid):
                subject_doc = index.get(subject, {})
                current_state = str(subject_doc.get("state") or gate.get("status") or "UNKNOWN")
                items.append({
                    "id": f"FC-{safe_id(subject)}-{safe_id(gid)}",
                    "subjectRef": subject,
                    "currentState": current_state,
                    "candidateTransition": "ELIGIBLE_AFTER_GATE_PASS",
                    "blockingGateRefs": [gid],
                    "dependencyRefs": [],
                    "evidenceRefs": evidence_for_subject(index, subject),
                    "confidence": "HIGH",
                    "confidenceRationale": [
                        "Derivazione deterministica da un gate blocking esplicito nello snapshot; la confidence descrive la derivazione, non la probabilità di passaggio."
                    ],
                    "invalidators": [
                        "Cambio dello stato del gate, del soggetto o dello snapshot sorgente."
                    ],
                    "scenarioRef": None,
                    "generatedAt": generated_at,
                    "sourceSnapshotGeneratedAt": generated_at,
                    "canonicalStateImpact": "NONE",
                    "authorityImpact": "NONE",
                    "runtimeAuthorizationImpact": "NONE",
                })

    for dep in snapshot.get("operationalPath", {}).get("unmetDependencies", []):
        subject = str(dep["subjectRef"])
        dep_ref = str(dep["dependencyRef"])
        items.append({
            "id": f"FC-{safe_id(subject)}-{safe_id(dep_ref)}",
            "subjectRef": subject,
            "currentState": str(index.get(subject, {}).get("state") or "BLOCKED_BY_DEPENDENCY"),
            "candidateTransition": "ELIGIBLE_WHEN_DEPENDENCIES_PASS",
            "blockingGateRefs": [dep_ref] if dep.get("dependencyKind") == "GATE" else [],
            "dependencyRefs": [dep_ref],
            "evidenceRefs": evidence_for_subject(index, subject),
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

    deduped = {item["id"]: item for item in items}
    return [deduped[key] for key in sorted(deduped)]


def validate(items: list[dict]) -> None:
    forbidden = {"probability", "likelihood", "score", "overallScore", "approved", "authorized", "runtimeState", "state"}
    seen_ids = set()
    for item in items:
        present = forbidden.intersection(item)
        if present:
            raise ValueError(f"forbidden fields: {sorted(present)}")
        if item["id"] in seen_ids:
            raise ValueError(f"duplicate forecast id: {item['id']}")
        seen_ids.add(item["id"])
        if item["confidence"] not in {"LOW", "MEDIUM", "HIGH"}:
            raise ValueError("invalid qualitative confidence")
        for key in ("canonicalStateImpact", "authorityImpact", "runtimeAuthorizationImpact"):
            if item[key] != "NONE":
                raise ValueError(f"{key} must remain NONE")
        if not item["confidenceRationale"] or not item["invalidators"] or not item["evidenceRefs"]:
            raise ValueError("rationale, invalidators and evidenceRefs are required")


def self_test() -> None:
    fixture = load(SELF_TEST_FIXTURE)
    before = copy.deepcopy(fixture)
    first = derive(fixture)
    second = derive(fixture)
    validate(first)

    if fixture != before:
        raise ValueError("derive mutated the source snapshot")
    if first != second:
        raise ValueError("identical input did not produce identical output")
    if len(first) != 2:
        raise ValueError(f"expected 2 fixture candidates, got {len(first)}")

    by_subject = {item["subjectRef"]: item for item in first}
    gate_candidate = by_subject["CAP-A"]
    dependency_candidate = by_subject["CAP-B"]

    if gate_candidate["candidateTransition"] != "ELIGIBLE_AFTER_GATE_PASS":
        raise ValueError("open blocking gate fixture not derived correctly")
    if gate_candidate["blockingGateRefs"] != ["GATE-A"]:
        raise ValueError("gate reference not preserved")
    if gate_candidate["evidenceRefs"] != ["EV-A"]:
        raise ValueError("gate candidate evidence is not subject-bound")

    if dependency_candidate["candidateTransition"] != "ELIGIBLE_WHEN_DEPENDENCIES_PASS":
        raise ValueError("unmet dependency fixture not derived correctly")
    if dependency_candidate["dependencyRefs"] != ["CAP-A"]:
        raise ValueError("dependency reference not preserved")
    if dependency_candidate["evidenceRefs"] != ["EV-B"]:
        raise ValueError("dependency candidate evidence is not subject-bound")

    print("TRAMA_CC3_F1_SELF_TEST_PASS candidates=2")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--output")
    args = parser.parse_args()

    policy = load(POLICY)
    if policy.get("mode") != "ADVISORY_READ_ONLY":
        raise SystemExit("forecast policy must remain ADVISORY_READ_ONLY")

    if args.self_test or args.check:
        self_test()

    snapshot = load(SNAPSHOT)
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
