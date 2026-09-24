#!/usr/bin/env python3
from __future__ import annotations
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

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
