#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
from copy import deepcopy
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = Path(__file__).resolve().parent
SCHEMA_PATH = ROOT / "schemas/lesson-proposal.schema.json"

if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import lesson_engine_common as common


class LessonProposalError(ValueError):
    pass


def _fail(code: str, detail: str | None = None) -> None:
    message = code if not detail else f"{code}: {detail}"
    raise LessonProposalError(message)


def _load_schema() -> dict:
    try:
        schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        _fail("LESSON_SCHEMA_UNAVAILABLE", str(exc))
    if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
        _fail("LESSON_SCHEMA_IDENTITY_INVALID")
    if schema.get("$id") != "https://trama.local/schemas/lesson-proposal.schema.json":
        _fail("LESSON_SCHEMA_IDENTITY_INVALID")
    return schema


def _canonical(value) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def _validate_datetime(value: str, path: str) -> None:
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        _fail("SCHEMA_VALIDATION_FAILED", f"{path}: invalid date-time")


def _validate_schema_node(value, schema: dict, path: str = "$") -> None:
    if "const" in schema and value != schema["const"]:
        _fail("SCHEMA_VALIDATION_FAILED", f"{path}: const")

    if "enum" in schema and value not in schema["enum"]:
        _fail("SCHEMA_VALIDATION_FAILED", f"{path}: enum")

    expected_type = schema.get("type")
    if expected_type == "object":
        if not isinstance(value, dict):
            _fail("SCHEMA_VALIDATION_FAILED", f"{path}: expected object")
        required = schema.get("required", [])
        for key in required:
            if key not in value:
                _fail("SCHEMA_VALIDATION_FAILED", f"{path}: missing {key}")
        properties = schema.get("properties", {})
        if schema.get("additionalProperties") is False:
            extra = sorted(set(value) - set(properties))
            if extra:
                _fail("SCHEMA_VALIDATION_FAILED", f"{path}: additional property {extra[0]}")
        for key, item in value.items():
            if key in properties:
                _validate_schema_node(item, properties[key], f"{path}.{key}")
        return

    if expected_type == "array":
        if not isinstance(value, list):
            _fail("SCHEMA_VALIDATION_FAILED", f"{path}: expected array")
        if len(value) < schema.get("minItems", 0):
            _fail("SCHEMA_VALIDATION_FAILED", f"{path}: minItems")
        if schema.get("uniqueItems"):
            seen = set()
            for item in value:
                key = _canonical(item)
                if key in seen:
                    _fail("SCHEMA_VALIDATION_FAILED", f"{path}: uniqueItems")
                seen.add(key)
        item_schema = schema.get("items")
        if isinstance(item_schema, dict):
            for index, item in enumerate(value):
                _validate_schema_node(item, item_schema, f"{path}[{index}]")
        return

    if expected_type == "string":
        if not isinstance(value, str):
            _fail("SCHEMA_VALIDATION_FAILED", f"{path}: expected string")
        if len(value) < schema.get("minLength", 0):
            _fail("SCHEMA_VALIDATION_FAILED", f"{path}: minLength")
        pattern = schema.get("pattern")
        if pattern and re.fullmatch(pattern, value) is None:
            _fail("SCHEMA_VALIDATION_FAILED", f"{path}: pattern")
        if schema.get("format") == "date-time":
            _validate_datetime(value, path)
        return

    if expected_type == "integer":
        if isinstance(value, bool) or not isinstance(value, int):
            _fail("SCHEMA_VALIDATION_FAILED", f"{path}: expected integer")
        if "minimum" in schema and value < schema["minimum"]:
            _fail("SCHEMA_VALIDATION_FAILED", f"{path}: minimum")
        return

    if expected_type is not None:
        _fail("LESSON_SCHEMA_UNSUPPORTED_TYPE", str(expected_type))


def _reject_duplicate_source_refs(data: dict) -> None:
    seen: set[str] = set()
    for ref in data.get("sourceRefs", []):
        key = common.canonical_source_ref(ref)
        if key in seen:
            _fail("DUPLICATE_SOURCE_REF")
        seen.add(key)


def validate_proposal(data: dict) -> dict:
    schema = _load_schema()
    _validate_schema_node(data, schema)
    _reject_duplicate_source_refs(data)

    if data.get("causalStatus") == "CERTIFIED" and not common.direct_causal_evidence(data):
        _fail("CERTIFIED_CAUSAL_EVIDENCE_REQUIRED")

    result = deepcopy(data)
    result["fingerprint"] = common.lesson_fingerprint(data)
    return result


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate a governed TRAMA lesson proposal.")
    parser.add_argument("proposal", type=Path)
    args = parser.parse_args(argv)

    path = args.proposal if args.proposal.is_absolute() else ROOT / args.proposal
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        result = validate_proposal(data)
    except (OSError, json.JSONDecodeError, LessonProposalError) as exc:
        print(f"LESSON_PROPOSAL_INVALID: {exc}", file=sys.stderr)
        return 1

    print(
        "LESSON_PROPOSAL_VALID "
        f"lessonId={result['lessonId']} "
        f"fingerprint={result['fingerprint']} "
        f"causalStatus={result['causalStatus']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
