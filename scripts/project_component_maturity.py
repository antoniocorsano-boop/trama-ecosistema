#!/usr/bin/env python3
from __future__ import annotations

from copy import deepcopy

STAGES = [
    ("REGISTERED", None),
    ("ISOLATED", "ISOLATED"),
    ("BEHAVIOURAL", "BEHAVIOURAL"),
    ("RESPONSIVE_VISUAL", "RESPONSIVE_VISUAL"),
    ("ACCESSIBILITY", "ACCESSIBILITY"),
]

EVIDENCE_TYPES = {"ISOLATED", "BEHAVIOURAL", "RESPONSIVE_VISUAL", "ACCESSIBILITY"}
CONFIRMED_STATUSES = {"PRESENT"}
CANDIDATE_STATUSES = {"PRESENT", "PARTIAL", "DOCUMENTED_ONLY"}

VALID_LIFECYCLE = {
    "PROPOSED",
    "TRIAL",
    "STABLE",
    "LEGACY",
    "DEPRECATED",
    "RETIRED",
    "SPECIALIST",
    "NATIVE",
}

VALID_SOURCE_CLASS = {
    "NATIVE_PLATFORM",
    "PRODUCT_OWNED",
    "TRAMA_SHARED_SEMANTIC",
    "EXTERNAL_PRIMITIVE",
    "SPECIALIST_LIBRARY",
}


class ComponentMaturityProjectionError(ValueError):
    pass


def invalid(message: str):
    raise ComponentMaturityProjectionError(message)


def evidence_index(entry: dict) -> dict[str, dict]:
    out = {}
    for item in entry.get("evidence", []):
        evidence_type = item.get("type")
        if evidence_type not in EVIDENCE_TYPES:
            continue
        if evidence_type in out:
            invalid(f"{entry.get('componentId')}: duplicate evidence type {evidence_type}")
        out[evidence_type] = item
    return out


def _highest_contiguous_stage(index: dict[str, dict], accepted_statuses: set[str]) -> str:
    stage = "REGISTERED"
    for stage_name, evidence_type in STAGES[1:]:
        item = index.get(evidence_type)
        if item is None or item.get("status") not in accepted_statuses:
            break
        stage = stage_name
    return stage


def _stage_rank(stage: str) -> int:
    return [name for name, _ in STAGES].index(stage)


def project_component(entry: dict, source_ref: str) -> dict:
    component_id = entry.get("componentId")
    if not component_id:
        invalid("missing componentId")
    if entry.get("lifecycle") not in VALID_LIFECYCLE:
        invalid(f"{component_id}: invalid lifecycle")
    if entry.get("sourceClass") not in VALID_SOURCE_CLASS:
        invalid(f"{component_id}: invalid sourceClass")

    index = evidence_index(entry)
    confirmed = _highest_contiguous_stage(index, CONFIRMED_STATUSES)
    candidate = _highest_contiguous_stage(index, CANDIDATE_STATUSES)

    if _stage_rank(candidate) < _stage_rank(confirmed):
        invalid(f"{component_id}: candidate stage below confirmed stage")

    evidence_status = {
        evidence_type: deepcopy(index.get(evidence_type, {"type": evidence_type, "status": "NOT_OBSERVED"}))
        for evidence_type in ("ISOLATED", "BEHAVIOURAL", "RESPONSIVE_VISUAL", "ACCESSIBILITY")
    }

    remaining = [
        evidence_type
        for stage_name, evidence_type in STAGES[1:]
        if evidence_type is not None and _stage_rank(stage_name) > _stage_rank(confirmed)
    ]

    if confirmed == "ACCESSIBILITY":
        qualification_status = "QUALIFIED"
    elif candidate == "REGISTERED":
        qualification_status = "REGISTERED_ONLY"
    else:
        qualification_status = "PARTIAL"

    return {
        "componentId": component_id,
        "product": entry.get("product"),
        "target": entry.get("target"),
        "semanticPattern": entry.get("semanticPattern"),
        "lifecycle": entry["lifecycle"],
        "sourceClass": entry["sourceClass"],
        "relatedFindings": list(entry.get("relatedFindings", [])),
        "maturity": {
            "model": "TRAMA_COMPONENT_MATURITY_V1",
            "confirmedStage": confirmed,
            "candidateStage": candidate,
            "qualificationStatus": qualification_status,
            "remainingEvidenceTypes": remaining,
        },
        "evidenceStatus": evidence_status,
        "sourceRef": source_ref,
    }


def project_components(registry: dict, source_ref: str = "governance/ui-development/trama-component-evidence-registry-v1.json") -> list[dict]:
    if registry.get("schemaVersion") != "trama.component-evidence-registry/v1":
        invalid("registry schemaVersion")
    if registry.get("contractId") != "TRAMA-COMPONENT-EVIDENCE-REGISTRY-01":
        invalid("registry contractId")

    projected = [project_component(entry, source_ref) for entry in registry.get("entries", [])]
    ids = [item["componentId"] for item in projected]
    if len(ids) != len(set(ids)):
        invalid("duplicate projected componentId")
    return projected


def validate_projection(components: list[dict]) -> None:
    ids = set()
    valid_stages = {name for name, _ in STAGES}
    for component in components:
        component_id = component.get("componentId")
        if not component_id or component_id in ids:
            invalid("invalid or duplicate componentId")
        ids.add(component_id)

        maturity = component.get("maturity") or {}
        confirmed = maturity.get("confirmedStage")
        candidate = maturity.get("candidateStage")
        if confirmed not in valid_stages or candidate not in valid_stages:
            invalid(f"{component_id}: invalid maturity stage")
        if _stage_rank(candidate) < _stage_rank(confirmed):
            invalid(f"{component_id}: candidate stage below confirmed stage")
        if component.get("lifecycle") not in VALID_LIFECYCLE:
            invalid(f"{component_id}: invalid lifecycle")
        if component.get("sourceClass") not in VALID_SOURCE_CLASS:
            invalid(f"{component_id}: invalid sourceClass")
        if maturity.get("qualificationStatus") not in {"REGISTERED_ONLY", "PARTIAL", "QUALIFIED"}:
            invalid(f"{component_id}: invalid qualificationStatus")

        evidence_status = component.get("evidenceStatus") or {}
        if set(evidence_status) != EVIDENCE_TYPES:
            invalid(f"{component_id}: incomplete evidenceStatus")
        if not component.get("sourceRef"):
            invalid(f"{component_id}: missing sourceRef")
