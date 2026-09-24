#!/usr/bin/env python3
from __future__ import annotations
import argparse
import json
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

def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

def validate_definitions(definitions: dict) -> None:
    areas = definitions.get("areas", [])
    area_ids = [area.get("id") for area in areas]
    if len(area_ids) != len(set(area_ids)):
        raise ValueError("Duplicate maturity area id")

    expected_levels = {str(i) for i in range(6)}
    for area in areas:
        levels = area.get("levels", {})
        if set(levels) != expected_levels:
            raise ValueError(f"{area.get('id')}: levels must be exactly 0..5")

        if levels["0"].get("requiredEvidenceTypes") != []:
            raise ValueError(f"{area['id']}: L0 must not require evidence")

        previous = set()
        for level in range(1, 6):
            required = set(levels[str(level)].get("requiredEvidenceTypes", []))
            unknown = required - ALLOWED_EVIDENCE_TYPES
            if unknown:
                raise ValueError(f"{area['id']} L{level}: unknown evidence types {sorted(unknown)}")
            if not previous.issubset(required):
                missing = sorted(previous - required)
                raise ValueError(f"{area['id']} L{level}: non-cumulative requirements, missing {missing}")
            previous = required


def evaluate_area(area_def: dict, evidence: list[dict]) -> dict:
    area_id = area_def["id"]
    area_evidence = [e for e in evidence if e.get("area") == area_id and e.get("status") == "PASS"]
    available = {e.get("type") for e in area_evidence}

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
    }

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--definitions", default="config/maturity-area-definitions.json")
    parser.add_argument("--evidence", required=True)
    parser.add_argument("--expect")
    args = parser.parse_args()

    definitions = load_json(ROOT / args.definitions)
    evidence = load_json(ROOT / args.evidence)
    validate_definitions(definitions)
    results = [evaluate_area(area, evidence) for area in definitions["areas"]]

    if args.expect:
        expected = load_json(ROOT / args.expect)
        actual = {r["id"]: r["confirmedLevel"] for r in results}
        if actual != expected:
            raise SystemExit(f"MATURITY_EVALUATION_MISMATCH actual={actual} expected={expected}")

    print(json.dumps(results, indent=2, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
