#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

ALLOWED_EVIDENCE_TYPES = {
    "DOCUMENT_CANONICAL",
    "CONTRACT_APPROVED",
    "PR_EXACT_HEAD",
    "AUTOMATED_TEST",
    "SECURITY_GATE",
    "ACCESSIBILITY_GATE",
    "RUNTIME_CANARY",
    "HUMAN_REVIEW",
    "REAL_CASE_VALIDATION",
    "PROMOTION_DECISION",
    "REGRESSION_HISTORY",
    "ADOPTION_EVIDENCE",
}

STRONG_BOUND_EVIDENCE_TYPES = {
    "PR_EXACT_HEAD",
    "AUTOMATED_TEST",
    "SECURITY_GATE",
    "ACCESSIBILITY_GATE",
    "RUNTIME_CANARY",
    "HUMAN_REVIEW",
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def parse_time(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def validate_definitions(definitions: dict) -> None:
    areas = definitions.get("areas", [])
    area_ids = [area.get("id") for area in areas]
    if not areas:
        raise ValueError("At least one maturity area is required")
    if any(not area_id for area_id in area_ids):
        raise ValueError("Every maturity area requires an id")
    if len(area_ids) != len(set(area_ids)):
        raise ValueError("Duplicate maturity area id")

    area_id_set = set(area_ids)
    expected_levels = {str(i) for i in range(6)}

    for area in areas:
        levels = area.get("levels", {})
        if set(levels) != expected_levels:
            raise ValueError(f"{area.get('id')}: levels must be exactly 0..5")

        dependencies = area.get("dependencies", [])
        if len(dependencies) != len(set(dependencies)):
            raise ValueError(f"{area['id']}: duplicate dependencies")
        unknown_dependencies = set(dependencies) - area_id_set
        if unknown_dependencies:
            raise ValueError(
                f"{area['id']}: unknown dependencies {sorted(unknown_dependencies)}"
            )
        if area["id"] in dependencies:
            raise ValueError(f"{area['id']}: area cannot depend on itself")

        if levels["0"].get("requiredEvidenceTypes") != []:
            raise ValueError(f"{area['id']}: L0 must not require evidence")

        previous = set()
        for level in range(1, 6):
            required = set(levels[str(level)].get("requiredEvidenceTypes", []))
            unknown = required - ALLOWED_EVIDENCE_TYPES
            if unknown:
                raise ValueError(
                    f"{area['id']} L{level}: unknown evidence types {sorted(unknown)}"
                )
            if not previous.issubset(required):
                missing = sorted(previous - required)
                raise ValueError(
                    f"{area['id']} L{level}: non-cumulative requirements, missing {missing}"
                )
            previous = required


def validate_evidence_record(evidence: dict) -> None:
    evidence_type = evidence.get("type")
    if evidence_type not in ALLOWED_EVIDENCE_TYPES:
        raise ValueError(f"{evidence.get('id')}: unsupported evidence type {evidence_type}")

    freshness = evidence.get("freshness") or {}
    policy = freshness.get("policy")
    if policy not in {
        "EVENT_BOUND",
        "UNTIL_CHANGE",
        "TIME_BOUND",
        "RUNTIME_BOUND",
        "MANUAL_REVIEW",
    }:
        raise ValueError(f"{evidence.get('id')}: invalid freshness policy {policy}")

    if policy == "TIME_BOUND" and not freshness.get("expiresAt"):
        raise ValueError(f"{evidence.get('id')}: TIME_BOUND requires expiresAt")

    if evidence_type in STRONG_BOUND_EVIDENCE_TYPES:
        binding = evidence.get("binding") or {}
        missing = [
            key
            for key in ("capabilityRef", "releaseRef", "exactHead")
            if not binding.get(key)
        ]
        if missing:
            raise ValueError(
                f"{evidence.get('id')}: {evidence_type} requires binding fields {missing}"
            )


def evidence_is_current(evidence: dict, now: datetime | None = None) -> bool:
    validate_evidence_record(evidence)
    if evidence.get("status") != "PASS":
        return False

    now = now or datetime.now(timezone.utc)
    freshness = evidence["freshness"]
    policy = freshness["policy"]

    if policy == "TIME_BOUND":
        return parse_time(freshness["expiresAt"]) > now

    if policy == "RUNTIME_BOUND":
        binding = evidence.get("binding") or {}
        return bool(binding.get("releaseRef") and binding.get("exactHead"))

    if policy == "EVENT_BOUND":
        binding = evidence.get("binding") or {}
        return bool(binding.get("exactHead") or binding.get("eventRef"))

    if policy == "MANUAL_REVIEW":
        return bool(freshness.get("reviewedAt"))

    if policy == "UNTIL_CHANGE":
        source = evidence.get("source") or {}
        binding = evidence.get("binding") or {}
        return bool(source.get("sha256") or source.get("ref") or binding.get("exactHead"))

    return False


def evaluate_area(area_def: dict, evidence: list[dict], now: datetime | None = None) -> dict:
    area_id = area_def["id"]
    area_evidence = [
        item
        for item in evidence
        if item.get("area") == area_id and evidence_is_current(item, now=now)
    ]
    available = {item.get("type") for item in area_evidence}

    confirmed = 0
    for level in range(1, 6):
        required = set(area_def["levels"][str(level)]["requiredEvidenceTypes"])
        if required.issubset(available):
            confirmed = level
        else:
            break

    return {
        "id": area_id,
        "name": area_def["name"],
        "ownerDomain": area_def["ownerDomain"],
        "confirmedLevel": confirmed,
        "availableEvidenceTypes": sorted(x for x in available if x),
        "dependencies": list(area_def.get("dependencies", [])),
        "currentEvidenceRefs": [item["id"] for item in area_evidence],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--definitions", default="config/maturity-area-definitions.json")
    parser.add_argument("--evidence", required=True)
    parser.add_argument("--expect")
    parser.add_argument("--now", help="Override evaluation time with an ISO-8601 timestamp.")
    args = parser.parse_args()

    definitions = load_json(ROOT / args.definitions)
    evidence = load_json(ROOT / args.evidence)
    validate_definitions(definitions)

    for item in evidence:
        validate_evidence_record(item)

    now = parse_time(args.now) if args.now else None
    results = [evaluate_area(area, evidence, now=now) for area in definitions["areas"]]

    if args.expect:
        expected = load_json(ROOT / args.expect)
        actual = {result["id"]: result["confirmedLevel"] for result in results}
        if actual != expected:
            raise SystemExit(
                f"MATURITY_EVALUATION_MISMATCH actual={actual} expected={expected}"
            )

    print(json.dumps(results, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
