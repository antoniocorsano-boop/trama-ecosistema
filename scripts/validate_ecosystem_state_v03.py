#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "schemas/trama-ecosystem-state-v0.3.schema.json"
DEFAULT_GRAPH_PATH = ROOT / "governance/access/trama-ecosystem-state-v0.3.json"
MATURITY_PATH = Path("governance/maturity/trama-maturity-reconciliation-v1.json")


class EcosystemStateValidationError(ValueError):
    pass


def _load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _fail(message: str) -> None:
    raise EcosystemStateValidationError(message)


def _ids(items: Iterable[dict], label: str) -> set[str]:
    seen: set[str] = set()
    for item in items:
        item_id = item.get("id")
        if item_id in seen:
            _fail(f"duplicate {label} id: {item_id}")
        seen.add(item_id)
    return seen


def _resolve_path_ref(ref: str, root: Path) -> None:
    if not ref.startswith("path:"):
        return
    relative = ref.removeprefix("path:")
    candidate = (root / relative).resolve()
    try:
        candidate.relative_to(root.resolve())
    except ValueError:
        _fail(f"path reference escapes repository root: {ref}")
    if not candidate.exists():
        _fail(f"unresolved path reference: {relative}")


def _maturity_ids(root: Path) -> set[str]:
    path = root / MATURITY_PATH
    if not path.exists():
        _fail(f"maturity authority missing: {MATURITY_PATH.as_posix()}")
    document = _load_json(path)
    result: set[str] = set()
    for area in document.get("areas", []):
        value = area.get("area") or area.get("id")
        if value:
            result.add(str(value))
    return result


def _validate_schema(document: dict) -> None:
    schema = _load_json(SCHEMA_PATH)
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    errors = sorted(validator.iter_errors(document), key=lambda e: list(e.absolute_path))
    if not errors:
        return
    first = errors[0]
    path = ".".join(str(part) for part in first.absolute_path) or "<root>"
    _fail(f"schema {path}: {first.message}")


def _validate_subject(subject: dict, root: Path, maturity_ids: set[str]) -> None:
    if subject.get("state") == "DEFERRED" and not subject.get("decisionRefs"):
        _fail(f"DEFERRED requires decisionRefs: {subject.get('id')}")

    if subject.get("authorityOwner") is None and not subject.get("authorityRefs"):
        _fail(f"authorityRefs required when authorityOwner is null: {subject.get('id')}")

    maturity_ref = subject.get("maturityRef")
    if maturity_ref is not None and maturity_ref not in maturity_ids:
        _fail(f"unknown maturityRef {maturity_ref}: {subject.get('id')}")

    for field in ("authorityRefs", "evidenceRefs", "sourceRefs", "decisionRefs", "blockerRefs"):
        for ref in subject.get(field, []):
            _resolve_path_ref(ref, root)

    if subject.get("state") != subject.get("targetState"):
        gap = subject.get("gap") or {}
        summary = str(gap.get("summary") or "").strip()
        missing = gap.get("missing") or []
        if summary.lower() in {"", "none", "n/a", "na", "todo", "tbd"} or not missing:
            _fail(f"gap must be explicit for non-terminal target: {subject.get('id')}")

    if subject.get("id") == "DOS-A1" and subject.get("state") != "DEFERRED":
        _fail("DOS-A1 must remain DEFERRED")


def validate_graph(document: dict, root: Path = ROOT) -> None:
    _validate_schema(document)

    actors = document.get("externalActors", [])
    nodes = document.get("nodes", [])
    flows = document.get("flows", [])

    actor_ids = _ids(actors, "external actor")
    node_ids = _ids(nodes, "node")
    flow_ids = _ids(flows, "flow")
    del flow_ids

    overlap = actor_ids & node_ids
    if overlap:
        _fail(f"actor/node id collision: {sorted(overlap)}")

    endpoints = actor_ids | node_ids
    maturity_ids = _maturity_ids(root)

    for subject in nodes:
        _validate_subject(subject, root, maturity_ids)

    for flow in flows:
        _validate_subject(flow, root, maturity_ids)
        if flow.get("from") not in endpoints or flow.get("to") not in endpoints:
            _fail(
                f"unresolved flow endpoint {flow.get('id')}: "
                f"{flow.get('from')} -> {flow.get('to')}"
            )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "path",
        nargs="?",
        default=str(DEFAULT_GRAPH_PATH),
        help="Path to the canonical ecosystem state v0.3 JSON document.",
    )
    args = parser.parse_args()
    path = Path(args.path)
    if not path.is_absolute():
        path = ROOT / path
    if not path.exists():
        raise SystemExit(f"TRAMA_ECOSYSTEM_STATE_V03_MISSING: {path}")
    validate_graph(_load_json(path), ROOT)
    print("TRAMA_ECOSYSTEM_STATE_V03_VALIDATION_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
