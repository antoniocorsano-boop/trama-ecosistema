#!/usr/bin/env python3
from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "governance/runtime/or06-p1-fixtures.json"
MUTATIVE = {
    "lesson.preparation.apply",
    "lesson.preparation.publish",
    "lesson.preparation.persist",
    "lesson.preparation.approve",
}
RUNTIME_KEYS = {"runtimeType", "runtimeId", "adapterId", "adapterVersion", "generationId"}
PERSONAL_KEYS = {"studentId", "studentName", "studentEmail", "studentProfileId"}


def deep_merge(base: Any, patch: Any) -> Any:
    if isinstance(base, dict) and isinstance(patch, dict):
        out = copy.deepcopy(base)
        for key, value in patch.items():
            out[key] = deep_merge(out.get(key), value) if key in out else copy.deepcopy(value)
        return out
    return copy.deepcopy(patch)


def walk_keys(value: Any):
    if isinstance(value, dict):
        for key, child in value.items():
            yield key
            yield from walk_keys(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_keys(child)


def validate_case(case: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    inp = case.get("input", {})
    obs = case.get("observation", {})
    caps = case.get("capabilities", [])

    curriculum = inp.get("curriculum", {})
    if curriculum.get("authority") != "ARENA":
        errors.append("CE-01")

    atlas = inp.get("atlas")
    if atlas is not None and atlas.get("source") != "ATLAS":
        errors.append("CE-02")

    suggestions = obs.get("suggestions", [])
    if any(item.get("decisionState") != "PROPOSED" for item in suggestions):
        errors.append("CE-03")

    for cap in caps:
        if cap.get("key") in MUTATIVE and cap.get("authorized") is True:
            errors.append("CE-04")
            break

    if any(not item.get("sourceRefs") for item in suggestions):
        errors.append("CE-05")
    if not obs.get("evidenceRefs"):
        errors.append("CE-05")

    freshness = inp.get("freshness", {}).get("state")
    if freshness == "STALE" and obs.get("status") == "PASS":
        errors.append("CE-06")

    runtime = obs.get("runtime", {})
    if any(key not in RUNTIME_KEYS for key in runtime):
        errors.append("CE-07")

    cc = obs.get("controlCenter", {})
    if cc.get("mode") != "READ_ONLY" or cc.get("actions"):
        errors.append("CE-08")

    if inp.get("personalStudentData") is not False or PERSONAL_KEYS.intersection(set(walk_keys(inp))):
        errors.append("CE-09")

    canonical_a = json.dumps(obs, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    canonical_b = json.dumps(copy.deepcopy(obs), ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    if canonical_a != canonical_b:
        errors.append("CE-10")

    return sorted(set(errors))


def load_matrix(path: Path = FIXTURES) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def materialize_invalid(valid: dict[str, Any], item: dict[str, Any]) -> dict[str, Any]:
    case = deep_merge(valid, item["patch"])
    case["id"] = item["id"]
    return case


def qualify_matrix(matrix: dict[str, Any]) -> dict[str, Any]:
    if matrix.get("schemaVersion") != "trama.or06-p1-fixtures/v1":
        raise ValueError("schemaVersion")
    valid = matrix["valid"]
    valid_errors = validate_case(valid)
    invalid_results = []
    for item in matrix.get("invalid", []):
        case = materialize_invalid(valid, item)
        errors = validate_case(case)
        expected = sorted(set(item.get("expect", [])))
        invalid_results.append({
            "id": item["id"],
            "errors": errors,
            "expected": expected,
            "pass": bool(errors) and all(code in errors for code in expected),
        })
    return {
        "validPass": valid_errors == [],
        "validErrors": valid_errors,
        "invalidResults": invalid_results,
        "pass": valid_errors == [] and len(invalid_results) >= 7 and all(x["pass"] for x in invalid_results),
    }


def main() -> int:
    result = qualify_matrix(load_matrix())
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2))
    return 0 if result["pass"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
