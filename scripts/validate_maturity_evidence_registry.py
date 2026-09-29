#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from evaluate_maturity_definitions import validate_evidence_record

REGISTRY_PATH = ROOT / "governance/maturity/trama-maturity-evidence-registry-v1.json"
SCHEMA_PATH = ROOT / "schemas/maturity-evidence-registry.schema.json"
DEFINITIONS_PATH = ROOT / "config/maturity-area-definitions.json"
CAPABILITIES_PATH = ROOT / "status/ecosystem-status.json"
DECISIONS_PATH = ROOT / "docs/decisions/decision-register.json"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def validate_schema(registry: dict) -> None:
    from jsonschema import Draft202012Validator, FormatChecker

    schema = load(SCHEMA_PATH)
    Draft202012Validator.check_schema(schema)
    errors = sorted(
        Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(registry),
        key=lambda e: list(e.absolute_path),
    )
    if errors:
        path = ".".join(str(p) for p in errors[0].absolute_path) or "<root>"
        raise ValueError(f"registry schema invalid at {path}: {errors[0].message}")


def validate_registry(registry: dict) -> None:
    if registry.get("schemaVersion") != "trama.maturity-evidence-registry/v1":
        raise ValueError("invalid maturity evidence registry schemaVersion")
    if not isinstance(registry.get("evidence"), list) or not registry["evidence"]:
        raise ValueError("maturity evidence registry requires evidence")

    evidence = registry["evidence"]
    ids = [item["id"] for item in evidence]
    if len(ids) != len(set(ids)):
        raise ValueError("duplicate maturity evidence id")

    definitions = load(DEFINITIONS_PATH)
    area_ids = {item["id"] for item in definitions["areas"]}
    capabilities = load(CAPABILITIES_PATH)
    capability_ids = {item["id"] for item in capabilities["capabilities"]}
    decisions = load(DECISIONS_PATH)
    decision_by_id = {item["id"]: item for item in decisions["decisions"]}
    accepted_statuses = set(registry["policy"]["acceptedDecisionStatuses"])

    for item in evidence:
        validate_evidence_record(item)
        if item["area"] not in area_ids:
            raise ValueError(f"{item['id']}: unknown maturity area {item['area']}")

        source = item["source"]
        local_path = source.get("path")
        if local_path and not (ROOT / local_path).is_file():
            raise ValueError(f"{item['id']}: source path does not exist: {local_path}")

        if item["type"] == "CONTRACT_APPROVED":
            decision_ref = source.get("decisionRef")
            if not decision_ref or decision_ref not in decision_by_id:
                raise ValueError(f"{item['id']}: CONTRACT_APPROVED requires known decisionRef")
            actual = decision_by_id[decision_ref]["status"]
            claimed = source.get("decisionStatus")
            if claimed != actual:
                raise ValueError(
                    f"{item['id']}: decision status mismatch claimed={claimed} actual={actual}"
                )
            if actual not in accepted_statuses:
                raise ValueError(
                    f"{item['id']}: decision {decision_ref} status {actual} is not accepted"
                )

        binding = item.get("binding") or {}
        capability_ref = binding.get("capabilityRef")
        area_ref = binding.get("areaRef")
        if capability_ref and capability_ref not in capability_ids:
            raise ValueError(f"{item['id']}: unknown capabilityRef {capability_ref}")
        if area_ref and area_ref not in area_ids:
            raise ValueError(f"{item['id']}: unknown areaRef {area_ref}")
        if area_ref and area_ref != item["area"]:
            raise ValueError(f"{item['id']}: areaRef does not match evidence area")

    if registry["policy"]["projectionReadOnly"] is not True:
        raise ValueError("registry projectionReadOnly must be true")
    if registry["policy"]["automaticPromotion"] is not False:
        raise ValueError("registry automaticPromotion must be false")


def main() -> int:
    registry = load(REGISTRY_PATH)
    validate_schema(registry)
    validate_registry(registry)
    print("TRAMA_MATURITY_EVIDENCE_REGISTRY_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
