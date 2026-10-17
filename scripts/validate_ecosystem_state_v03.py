#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "schemas/trama-ecosystem-state-v0.3.schema.json"
DEFAULT_GRAPH_PATH = ROOT / "governance/access/trama-ecosystem-state-v0.3.json"
MATURITY_PATH = Path("governance/maturity/trama-maturity-reconciliation-v1.json")
DECISION_REGISTER_PATH = Path("docs/decisions/decision-register.json")
ACTIVE_DECISION_STATUSES = {"APPROVED", "IMPLEMENTED"}
IMPLEMENTED_REALIZATION_STATES = {"REAL", "PARTIAL"}
GOVERNED_EVIDENCE_ROOTS = (Path("docs/evidence"),)
GOVERNED_EVIDENCE_FILES = {
    Path("governance/access/trama-ecosystem-state-v0.2.json"),
}
GOVERNED_AUTHORITY_ROOTS = (
    Path("docs/superpowers/specs"),
)
REQUIRED_ARENA_AUTHORITY_REF = "decision:TRAMA-ADR-002"


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


def _path_reference_candidate(ref: str, root: Path) -> Path:
    if not ref.startswith("path:"):
        _fail(f"unsupported unresolved reference: {ref}")
    relative = ref.removeprefix("path:")
    candidate = (root / relative).resolve()
    try:
        candidate.relative_to(root.resolve())
    except ValueError:
        _fail(f"path reference escapes repository root: {ref}")
    if not candidate.exists():
        _fail(f"unresolved path reference: {relative}")
    if not candidate.is_file():
        _fail(f"path reference must resolve to a file: {relative}")
    return candidate


def _resolve_path_reference(ref: str, root: Path) -> None:
    _path_reference_candidate(ref, root)


def _resolve_evidence_reference(ref: str, root: Path) -> None:
    candidate = _path_reference_candidate(ref, root)
    relative = candidate.relative_to(root.resolve())
    if relative in GOVERNED_EVIDENCE_FILES:
        return
    for evidence_root in GOVERNED_EVIDENCE_ROOTS:
        try:
            relative.relative_to(evidence_root)
        except ValueError:
            continue
        return
    _fail(f"evidence reference is not a governed evidence artifact: {ref}")


def _decision_registry(root: Path, document: dict) -> dict[str, dict]:
    configured = (document.get("authorityPolicy") or {}).get("decisions")
    if configured is not None and Path(configured) != DECISION_REGISTER_PATH:
        _fail(f"unsupported governed decision register: {configured}")
    path = (root / DECISION_REGISTER_PATH).resolve()
    try:
        path.relative_to(root.resolve())
    except ValueError:
        _fail("governed decision register escapes repository root")
    if not path.exists():
        _fail(f"governed decision register missing: {DECISION_REGISTER_PATH.as_posix()}")
    if not path.is_file():
        _fail(f"governed decision register must be a file: {DECISION_REGISTER_PATH.as_posix()}")
    register = _load_json(path)
    decisions: dict[str, dict] = {}
    for item in register.get("decisions", []):
        decision_id = item.get("id")
        if not decision_id:
            continue
        decision_id = str(decision_id)
        if decision_id in decisions:
            _fail(f"duplicate governed decision: {decision_id}")
        decisions[decision_id] = item
    return decisions


def _resolve_decision_reference(ref: str, decisions: dict[str, dict]) -> None:
    if not ref.startswith("decision:"):
        _fail(f"decision reference must bind a governed decision: {ref}")
    decision_id = ref.removeprefix("decision:")
    decision = decisions.get(decision_id)
    if decision is None:
        _fail(f"unresolved governed decision: {decision_id}")
    if decision.get("status") not in ACTIVE_DECISION_STATUSES:
        _fail(f"inactive governed decision {decision_id}: {decision.get('status')}")


def _resolve_authority_reference(ref: str, root: Path, decisions: dict[str, dict]) -> None:
    if ref.startswith("decision:"):
        _resolve_decision_reference(ref, decisions)
        return
    candidate = _path_reference_candidate(ref, root)
    relative = candidate.relative_to(root.resolve())
    for authority_root in GOVERNED_AUTHORITY_ROOTS:
        try:
            relative.relative_to(authority_root)
        except ValueError:
            continue
        return
    _fail(f"authority reference is not a governed authority artifact: {ref}")


def _maturity_ids(root: Path) -> set[str]:
    path = root / MATURITY_PATH
    if not path.exists():
        _fail(f"maturity authority missing: {MATURITY_PATH.as_posix()}")
    if not path.is_file():
        _fail(f"maturity authority must be a file: {MATURITY_PATH.as_posix()}")
    document = _load_json(path)
    result: set[str] = set()
    for area in document.get("areas", []):
        value = area.get("area") or area.get("id")
        if value:
            result.add(str(value))
    return result


def _validate_schema(document: dict) -> None:
    from jsonschema import Draft202012Validator, FormatChecker

    schema = _load_json(SCHEMA_PATH)
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    errors = sorted(validator.iter_errors(document), key=lambda e: list(e.absolute_path))
    if not errors:
        return
    first = errors[0]
    path = ".".join(str(part) for part in first.absolute_path) or "<root>"
    _fail(f"schema {path}: {first.message}")


def _validate_subject(subject: dict, root: Path, maturity_ids: set[str], decisions: dict[str, dict]) -> None:
    state = subject.get("state")
    if state == "DEFERRED" and not subject.get("decisionRefs"):
        _fail(f"DEFERRED requires decisionRefs: {subject.get('id')}")

    if state in IMPLEMENTED_REALIZATION_STATES and not subject.get("evidenceRefs"):
        _fail(f"evidenceRefs required for implemented realization state {state}: {subject.get('id')}")

    if subject.get("authorityOwner") is None and not subject.get("authorityRefs"):
        _fail(f"authorityRefs required when authorityOwner is null: {subject.get('id')}")

    maturity_ref = subject.get("maturityRef")
    if maturity_ref is not None and maturity_ref not in maturity_ids:
        _fail(f"unknown maturityRef {maturity_ref}: {subject.get('id')}")

    for ref in subject.get("authorityRefs", []):
        _resolve_authority_reference(ref, root, decisions)
    for ref in subject.get("evidenceRefs", []):
        _resolve_evidence_reference(ref, root)
    for field in ("sourceRefs", "blockerRefs"):
        for ref in subject.get(field, []):
            _resolve_path_reference(ref, root)
    for ref in subject.get("decisionRefs", []):
        _resolve_decision_reference(ref, decisions)

    if state != subject.get("targetState"):
        gap = subject.get("gap") or {}
        summary = str(gap.get("summary") or "").strip()
        missing = gap.get("missing") or []
        if summary.lower() in {"", "none", "n/a", "na", "todo", "tbd"} or not missing:
            _fail(f"gap must be explicit for non-terminal target: {subject.get('id')}")

    if subject.get("id") == "DOS-A1" and state != "DEFERRED":
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
    decisions = _decision_registry(root, document)

    for subject in nodes:
        _validate_subject(subject, root, maturity_ids, decisions)

    for flow in flows:
        _validate_subject(flow, root, maturity_ids, decisions)
        if flow.get("from") not in endpoints or flow.get("to") not in endpoints:
            _fail(
                f"unresolved flow endpoint {flow.get('id')}: "
                f"{flow.get('from')} -> {flow.get('to')}"
            )

    node_by_id = {item.get("id"): item for item in nodes}
    flow_by_id = {item.get("id"): item for item in flows}
    protected_arena_invariants = {
        ("node", "arena"): "arena",
        ("flow", "arena_to_curricolo_atlas"): "arena",
        ("flow", "docente_os_to_arena"): None,
        ("flow", "trama_access_to_arena"): None,
    }
    for (subject_type, subject_id), expected_owner in protected_arena_invariants.items():
        collection = node_by_id if subject_type == "node" else flow_by_id
        subject = collection.get(subject_id)
        if subject is None:
            continue
        if subject.get("authorityOwner") != expected_owner:
            _fail(
                f"arena authority invariant violated by {subject_id}: "
                f"expected {expected_owner!r}, got {subject.get('authorityOwner')!r}"
            )
        if REQUIRED_ARENA_AUTHORITY_REF not in subject.get("authorityRefs", []):
            _fail(
                f"arena authority invariant violated by {subject_id}: "
                f"missing required {REQUIRED_ARENA_AUTHORITY_REF}"
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
