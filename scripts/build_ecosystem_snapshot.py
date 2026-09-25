#!/usr/bin/env python3
"""Build the TRAMA Control Center v2 governed ecosystem snapshot.

Current responsibilities:
- read declared canonical local sources;
- evaluate maturity conservatively from bound evidence;
- project declared capabilities without inventing missing operational facts;
- derive explicit integrity checks without producing an aggregate score;
- derive the operational path from governed current state;
- project semantic timeline events only from the explicit governed event registry;
- emit a schema-compatible snapshot for the read-only Control Center;
- avoid external API calls and writes to source systems.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from evaluate_maturity_definitions import evaluate_area, validate_definitions
from validate_stakeholder_assurance import assurance_readiness, validate_registry

ROOT = Path(__file__).resolve().parents[1]


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def capability_map(status_doc: dict) -> dict:
    return {item["id"]: item for item in status_doc.get("capabilities", [])}


def normalize_gate_status(value: str | None) -> str:
    mapping = {
        "PENDING": "OPEN",
        "PASS": "PASS",
        "FAIL": "FAIL",
        "NOT_REQUIRED": "NOT_APPLICABLE",
    }
    return mapping.get(value or "", "OPEN")


def phase_status(capabilities: dict) -> list[dict]:
    eco01 = capabilities.get("ECO-01", {})
    eco02 = capabilities.get("ECO-02-P1", {})
    r3f0 = capabilities.get("R3-F0", {})
    r4p1 = capabilities.get("R4-P1", {})
    brand = capabilities.get("TRAMA-BRAND", {})

    return [
        {
            "id": "R1",
            "name": "Fondazione del governo",
            "status": "COMPLETE" if eco01.get("state") == "CLOSED" else "ACTIVE",
            "gateRefs": [],
        },
        {
            "id": "R2",
            "name": "Pilota ECO-02/P1",
            "status": eco02.get("state", "UNVERIFIED"),
            "gateRefs": ["GATE-ECO02-HUMAN-FINAL"] if eco02.get("state") != "CLOSED" else [],
        },
        {
            "id": "R3",
            "name": "Consolidamento Atlas",
            "status": r3f0.get("state", "UNVERIFIED"),
            "gateRefs": ["GATE-R3-F0-EXIT"] if r3f0.get("reviewGates", {}).get("exit") != "PASS" else [],
        },
        {
            "id": "R4",
            "name": "Esperienza professionale guidata",
            "status": r4p1.get("state", "PLANNED"),
            "gateRefs": [],
        },
        {
            "id": "R5",
            "name": "Preparazione all'adozione",
            "status": brand.get("state", "PLANNED"),
            "gateRefs": [],
        },
    ]


def capability_projection(eco_status: dict, maturity_areas: list[dict]) -> list[dict]:
    """Project declared capabilities without inventing missing operational facts."""
    maturity_by_owner = {
        "TRAMA": "governance",
        "Arena": "arena",
        "Atlas": "atlas",
        "Docente OS": "docente-os",
    }
    known_areas = {area["id"] for area in maturity_areas}
    gate_refs = {
        "ECO-02-P1": ["GATE-ECO02-HUMAN-FINAL"],
        "R3-F0": ["GATE-R3-F0-EXIT"],
        "CC3-F0": ["GATE-CC3-F0-HUMAN"],
        "CC3-F1": ["GATE-CC3-F1-HUMAN"],
    }
    projected = []
    for item in eco_status.get("capabilities", []):
        area_ref = maturity_by_owner.get(item.get("authority"))
        if area_ref not in known_areas:
            area_ref = None
        projected.append(
            {
                "id": item["id"],
                "label": item["label"],
                "ownerDomain": item["authority"],
                "state": item["state"],
                "humanReview": item.get("humanReview"),
                "runtimeState": "DEFERRED" if item.get("state") == "DEFERRED" else None,
                "maturityAreaRef": area_ref,
                "dependencyRefs": [],
                "gateRefs": gate_refs.get(item["id"], []),
                "evidenceRefs": ["EV-SOURCE-ECOSYSTEM-STATUS"],
                "lastSignificantChange": None,
                "sourceRef": "status/ecosystem-status.json",
                "sourceUpdatedAt": eco_status.get("updatedAt"),
            }
        )
    return projected


def parse_timestamp(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def evidence_freshness_state(item: dict, now: datetime) -> str:
    freshness = item.get("freshness") or {}
    policy = freshness.get("policy")
    if policy == "TIME_BOUND":
        expires_at = parse_timestamp(freshness.get("expiresAt"))
        if expires_at is None:
            return "UNKNOWN"
        return "EXPIRED" if expires_at < now else "CURRENT"
    if policy in {"EVENT_BOUND", "UNTIL_CHANGE", "RUNTIME_BOUND", "MANUAL_REVIEW"}:
        return "POLICY_BOUND"
    return "UNKNOWN"


def support_mentions_gate(item: dict, gate_id: str) -> bool:
    for support in item.get("supports", []):
        if not isinstance(support, dict):
            continue
        if support.get("gateRef") == gate_id:
            return True
        if gate_id in {str(value) for value in support.values() if value is not None}:
            return True
    return False


def build_integrity_checks(snapshot: dict, now: datetime) -> list[dict]:
    source_state = snapshot.get("sourceState", {})
    evidence = snapshot.get("evidence", [])
    gates = snapshot.get("gates", [])
    areas = snapshot.get("areas", [])
    capabilities = snapshot.get("capabilities", [])
    dependencies = snapshot.get("dependencies", [])
    expansions = snapshot.get("expansionCandidates", [])

    evidence_ids = {item["id"] for item in evidence}
    gate_ids = {item["id"] for item in gates}
    area_ids = {item["id"] for item in areas}
    capability_ids = {item["id"] for item in capabilities}
    dependency_ids = {item["id"] for item in dependencies}

    checks = []

    unavailable_sources = sorted(
        source_id
        for source_id, state in source_state.items()
        if state.get("status") != "FRESH"
    )
    blocked_sources = sorted(
        source_id
        for source_id, state in source_state.items()
        if state.get("status") == "BLOCKED"
    )
    checks.append(
        {
            "id": "INT-SOURCE-AVAILABILITY",
            "type": "SOURCE_AVAILABILITY",
            "status": "ISSUE" if unavailable_sources else "PASS",
            "severity": "ERROR" if blocked_sources else ("WARNING" if unavailable_sources else "INFO"),
            "summary": (
                "Fonti canoniche non pienamente disponibili."
                if unavailable_sources
                else "Tutte le fonti dichiarate sono disponibili nello snapshot."
            ),
            "affectedRefs": unavailable_sources,
            "details": [
                f"{source_id}: {source_state[source_id].get('status', 'UNKNOWN')}"
                for source_id in unavailable_sources
            ],
        }
    )

    unresolved = []
    for phase in snapshot.get("phases", []):
        for ref in phase.get("gateRefs", []):
            if ref not in gate_ids:
                unresolved.append(f"{phase['id']} → gate:{ref}")
    for area in areas:
        for ref in area.get("evidenceRefs", []):
            if ref not in evidence_ids:
                unresolved.append(f"{area['id']} → evidence:{ref}")
        for ref in area.get("blockingGateRefs", []):
            if ref not in gate_ids:
                unresolved.append(f"{area['id']} → gate:{ref}")
        for ref in area.get("dependencies", []):
            if ref not in area_ids:
                unresolved.append(f"{area['id']} → area:{ref}")
    for capability in capabilities:
        area_ref = capability.get("maturityAreaRef")
        if area_ref is not None and area_ref not in area_ids:
            unresolved.append(f"{capability['id']} → area:{area_ref}")
        for ref in capability.get("dependencyRefs", []):
            if ref not in capability_ids:
                unresolved.append(f"{capability['id']} → capability:{ref}")
        for ref in capability.get("gateRefs", []):
            if ref not in gate_ids:
                unresolved.append(f"{capability['id']} → gate:{ref}")
        for ref in capability.get("evidenceRefs", []):
            if ref not in evidence_ids:
                unresolved.append(f"{capability['id']} → evidence:{ref}")
    for dependency in dependencies:
        for ref in dependency.get("gateRefs", []):
            if ref not in gate_ids:
                unresolved.append(f"{dependency['id']} → gate:{ref}")
        for ref in dependency.get("evidenceRefs", []):
            if ref not in evidence_ids:
                unresolved.append(f"{dependency['id']} → evidence:{ref}")
    known_dependency_refs = gate_ids | capability_ids | dependency_ids
    for expansion in expansions:
        for ref in expansion.get("dependencyRefs", []):
            if ref not in known_dependency_refs:
                unresolved.append(f"{expansion['id']} → dependency:{ref}")
    for item in evidence:
        binding = item.get("binding") or {}
        ref = binding.get("capabilityRef")
        if ref is not None and ref not in capability_ids:
            unresolved.append(f"{item['id']} → capability:{ref}")

    unresolved = sorted(set(unresolved))
    checks.append(
        {
            "id": "INT-REFERENCE-RESOLUTION",
            "type": "REFERENCE_RESOLUTION",
            "status": "ISSUE" if unresolved else "PASS",
            "severity": "ERROR" if unresolved else "INFO",
            "summary": (
                "Sono presenti riferimenti interni non risolvibili."
                if unresolved
                else "I riferimenti interni verificati risultano risolvibili."
            ),
            "affectedRefs": unresolved,
            "details": unresolved,
        }
    )

    expired = sorted(
        item["id"]
        for item in evidence
        if evidence_freshness_state(item, now) == "EXPIRED"
    )
    unknown_time_bound = sorted(
        item["id"]
        for item in evidence
        if (item.get("freshness") or {}).get("policy") == "TIME_BOUND"
        and evidence_freshness_state(item, now) == "UNKNOWN"
    )
    freshness_status = "ISSUE" if expired else ("NOT_EVALUABLE" if unknown_time_bound else "PASS")
    freshness_refs = expired + [ref for ref in unknown_time_bound if ref not in expired]
    checks.append(
        {
            "id": "INT-EVIDENCE-FRESHNESS",
            "type": "EVIDENCE_FRESHNESS",
            "status": freshness_status,
            "severity": "WARNING" if freshness_status != "PASS" else "INFO",
            "summary": (
                "Sono presenti evidenze temporali scadute."
                if expired
                else (
                    "Alcune evidenze TIME_BOUND non dichiarano una scadenza valutabile."
                    if unknown_time_bound
                    else "Nessuna evidenza TIME_BOUND risulta scaduta."
                )
            ),
            "affectedRefs": freshness_refs,
            "details": (
                [f"Scaduta: {ref}" for ref in expired]
                + [f"Scadenza non valutabile: {ref}" for ref in unknown_time_bound]
            ),
        }
    )

    pass_gates = [
        gate
        for gate in gates
        if gate.get("status") == "PASS" and gate.get("requiredEvidenceTypes")
    ]
    missing_gate_evidence = []
    for gate in pass_gates:
        required_types = set(gate.get("requiredEvidenceTypes", []))
        bound_types = {
            item.get("type")
            for item in evidence
            if support_mentions_gate(item, gate["id"])
        }
        missing = sorted(required_types - bound_types)
        if missing:
            missing_gate_evidence.append(
                f"{gate['id']} → mancano binding espliciti per: {', '.join(missing)}"
            )
    gate_status = (
        "ISSUE"
        if missing_gate_evidence
        else ("PASS" if pass_gates else "NOT_EVALUABLE")
    )
    checks.append(
        {
            "id": "INT-GATE-EVIDENCE-BINDING",
            "type": "GATE_EVIDENCE_BINDING",
            "status": gate_status,
            "severity": "ERROR" if missing_gate_evidence else "INFO",
            "summary": (
                "Uno o più gate PASS non hanno tutte le evidenze richieste esplicitamente bound."
                if missing_gate_evidence
                else (
                    "I gate PASS verificati hanno binding evidenziali coerenti."
                    if pass_gates
                    else "Nessun gate PASS con evidenze richieste è disponibile per questo controllo."
                )
            ),
            "affectedRefs": sorted(gate["id"] for gate in pass_gates if any(line.startswith(gate["id"] + " ") for line in missing_gate_evidence)),
            "details": missing_gate_evidence,
        }
    )

    active_runtime = [
        cap
        for cap in capabilities
        if cap.get("runtimeState")
        and str(cap.get("runtimeState")).upper()
        not in {"DEFERRED", "RUNTIME_DEFERRED", "NOT_AUTHORIZED", "PLANNED", "NOT_APPLICABLE"}
    ]
    runtime_issues = []
    for cap in active_runtime:
        has_authorization = any(
            item.get("type") == "PROMOTION_DECISION"
            and (item.get("binding") or {}).get("capabilityRef") == cap["id"]
            and item.get("status") == "PASS"
            for item in evidence
        )
        if not has_authorization:
            runtime_issues.append(f"{cap['id']} → runtime {cap.get('runtimeState')} senza PROMOTION_DECISION bound")
    checks.append(
        {
            "id": "INT-RUNTIME-AUTHORIZATION",
            "type": "RUNTIME_AUTHORIZATION",
            "status": "ISSUE" if runtime_issues else "PASS",
            "severity": "ERROR" if runtime_issues else "INFO",
            "summary": (
                "È dichiarato runtime attivo senza evidenza di autorizzazione bound."
                if runtime_issues
                else "Nessun runtime attivo privo di autorizzazione bound è dichiarato."
            ),
            "affectedRefs": sorted(cap["id"] for cap in active_runtime if any(line.startswith(cap["id"] + " ") for line in runtime_issues)),
            "details": runtime_issues,
        }
    )

    capability_mismatches = []
    for cap in capabilities:
        refs = cap.get("evidenceRefs", [])
        if not refs:
            capability_mismatches.append(f"{cap['id']} → nessuna evidenza dichiarata")
        for evidence_ref in refs:
            item = next((ev for ev in evidence if ev.get("id") == evidence_ref), None)
            if item is None:
                continue
            bound_cap = (item.get("binding") or {}).get("capabilityRef")
            if bound_cap is not None and bound_cap != cap["id"]:
                capability_mismatches.append(
                    f"{cap['id']} → {evidence_ref} bound a {bound_cap}"
                )
    checks.append(
        {
            "id": "INT-CAPABILITY-EVIDENCE",
            "type": "CAPABILITY_EVIDENCE_ALIGNMENT",
            "status": "ISSUE" if capability_mismatches else "PASS",
            "severity": "WARNING" if capability_mismatches else "INFO",
            "summary": (
                "Sono presenti mismatch tra capability e set evidenziale dichiarato."
                if capability_mismatches
                else "Le capability hanno riferimenti evidenziali strutturalmente coerenti."
            ),
            "affectedRefs": sorted(
                {
                    line.split(" → ", 1)[0]
                    for line in capability_mismatches
                }
            ),
            "details": capability_mismatches,
        }
    )

    return checks


def build_operational_path(snapshot: dict) -> dict:
    phases = snapshot.get("phases", [])
    gates = snapshot.get("gates", [])
    capabilities = snapshot.get("capabilities", [])
    dependencies = snapshot.get("dependencies", [])
    expansions = snapshot.get("expansionCandidates", [])

    gate_by_id = {item["id"]: item for item in gates}
    capability_by_id = {item["id"]: item for item in capabilities}
    dependency_by_id = {item["id"]: item for item in dependencies}

    current_activities = [
        {
            "ref": phase["id"],
            "kind": "PHASE",
            "label": phase["name"],
            "status": phase["status"],
        }
        for phase in phases
        if str(phase.get("status", "")).upper() in {"ACTIVE", "IN_PROGRESS"}
    ]
    current_activities.extend(
        {
            "ref": capability["id"],
            "kind": "CAPABILITY",
            "label": capability["label"],
            "status": capability["state"],
        }
        for capability in capabilities
        if str(capability.get("state", "")).upper() == "ACTIVE"
    )

    next_gates = [
        {
            "ref": gate["id"],
            "area": gate["area"],
            "status": gate["status"],
            "blocking": bool(gate.get("blocking")),
            "decisionAuthority": gate.get("decisionAuthority"),
        }
        for gate in gates
        if gate.get("blocking") and gate.get("status") != "PASS"
    ]

    next_increments = [
        {
            "ref": item["id"],
            "label": item["name"],
            "status": item["status"],
            "dependencyRefs": list(item.get("dependencyRefs", [])),
        }
        for item in expansions
        if item.get("status") in {"PLANNED", "ELIGIBLE_FOR_DESIGN", "BLOCKED"}
    ]

    explicit_defers = [
        {
            "ref": capability["id"],
            "label": capability["label"],
            "state": capability["state"],
            "runtimeState": capability.get("runtimeState"),
        }
        for capability in capabilities
        if str(capability.get("state", "")).upper() == "DEFERRED"
        or str(capability.get("runtimeState", "")).upper() in {"DEFERRED", "RUNTIME_DEFERRED"}
    ]

    unmet_dependencies = []
    for item in expansions:
        for ref in item.get("dependencyRefs", []):
            if ref in gate_by_id:
                gate = gate_by_id[ref]
                if gate.get("status") != "PASS":
                    unmet_dependencies.append(
                        {
                            "subjectRef": item["id"],
                            "dependencyRef": ref,
                            "dependencyKind": "GATE",
                            "dependencyStatus": str(gate.get("status") or "UNKNOWN"),
                        }
                    )
            elif ref in capability_by_id:
                capability = capability_by_id[ref]
                if capability.get("state") != "CLOSED":
                    unmet_dependencies.append(
                        {
                            "subjectRef": item["id"],
                            "dependencyRef": ref,
                            "dependencyKind": "CAPABILITY",
                            "dependencyStatus": str(capability.get("state") or "UNKNOWN"),
                        }
                    )
            elif ref in dependency_by_id:
                dependency = dependency_by_id[ref]
                if dependency.get("status") not in {"ACTIVE", "GOVERNED", "PASS"}:
                    unmet_dependencies.append(
                        {
                            "subjectRef": item["id"],
                            "dependencyRef": ref,
                            "dependencyKind": "DEPENDENCY",
                            "dependencyStatus": str(dependency.get("status") or "UNKNOWN"),
                        }
                    )
            else:
                unmet_dependencies.append(
                    {
                        "subjectRef": item["id"],
                        "dependencyRef": ref,
                        "dependencyKind": "UNKNOWN",
                        "dependencyStatus": "UNRESOLVED",
                    }
                )

    return {
        "currentActivities": current_activities,
        "nextGates": next_gates,
        "nextIncrements": next_increments,
        "explicitDefers": explicit_defers,
        "unmetDependencies": unmet_dependencies,
    }


def timeline_projection(governed_events: dict) -> list[dict]:
    """Project only explicit semantic events; never reconstruct history from current state."""
    return sorted(
        [
            {
                "id": item["id"],
                "eventType": item["eventType"],
                "occurredAt": item["occurredAt"],
                "label": item["label"],
                "subjectRef": item["subjectRef"],
                "sourceRef": item["sourceRef"],
                "authority": item["authority"],
                "versionRef": item.get("versionRef"),
                "details": list(item.get("details", [])),
            }
            for item in governed_events.get("events", [])
        ],
        key=lambda item: item["occurredAt"],
    )


def build_snapshot(root: Path) -> dict:
    observed_at = datetime.now(timezone.utc).isoformat()
    config = load_json(root / "config/control-center-snapshot-sources.json")
    eco_status = load_json(root / "status/ecosystem-status.json")
    decisions = load_json(root / "docs/decisions/decision-register.json")
    maturity_definitions = load_json(root / "config/maturity-area-definitions.json")
    assurance_registry = load_json(root / "config/stakeholder-assurance-registry.json")
    governed_events = load_json(root / "status/governed-events.json")
    validate_definitions(maturity_definitions)
    validate_registry(assurance_registry)
    caps = capability_map(eco_status)

    source_state = {}
    evidence = []

    for source in config["sources"]:
        path = root / source["path"]
        exists = path.exists()
        source_state[source["id"]] = {
            "status": "FRESH" if exists else "BLOCKED",
            "observedAt": observed_at if exists else None,
            "ref": source["path"],
            "sha256": sha256_file(path) if exists else None,
        }
        if exists:
            evidence.append(
                {
                    "id": f"EV-SOURCE-{source['id'].upper()}",
                    "type": "DOCUMENT_CANONICAL",
                    "area": "governance",
                    "subject": source["role"],
                    "status": "PASS",
                    "source": {
                        "path": source["path"],
                        "sha256": sha256_file(path),
                    },
                    "observedAt": observed_at,
                    "freshness": {"policy": source["freshnessPolicy"], "expiresAt": None},
                    "confidence": "HIGH",
                    "supports": [],
                }
            )

    gates = [
        {
            "id": "GATE-ECO02-HUMAN-FINAL",
            "area": "interoperability",
            "type": "HUMAN",
            "status": "PASS" if caps.get("ECO-02-P1", {}).get("humanReview") == "PASS" else "OPEN",
            "blocking": True,
            "requiredEvidenceTypes": ["REAL_CASE_VALIDATION", "HUMAN_REVIEW"],
            "decisionAuthority": "Human Review",
        },
        {
            "id": "GATE-R3-F0-EXIT",
            "area": "atlas",
            "type": "HUMAN",
            "status": normalize_gate_status(caps.get("R3-F0", {}).get("reviewGates", {}).get("exit")),
            "blocking": True,
            "requiredEvidenceTypes": ["ACCESSIBILITY_GATE", "HUMAN_REVIEW"],
            "decisionAuthority": "TRAMA/Human Review",
        },
        {
            "id": "GATE-CC3-F0-HUMAN",
            "area": "governance",
            "type": "HUMAN",
            "status": "PASS" if caps.get("CC3-F0", {}).get("humanReview") == "PASS" else "OPEN",
            "blocking": True,
            "requiredEvidenceTypes": [],
            "decisionAuthority": "TRAMA/Human Review",
        },
        {
            "id": "GATE-CC3-F1-HUMAN",
            "area": "governance",
            "type": "HUMAN",
            "status": "PASS" if caps.get("CC3-F1", {}).get("humanReview") == "PASS" else "OPEN",
            "blocking": True,
            "requiredEvidenceTypes": ["HUMAN_REVIEW"],
            "decisionAuthority": "TRAMA/Human Review",
        },
    ]

    adr014 = next((d for d in decisions.get("decisions", []) if d.get("id") == "TRAMA-ADR-014"), None)
    if adr014:
        evidence.append(
            {
                "id": "EV-TRAMA-ADR-014",
                "type": "CONTRACT_APPROVED" if adr014.get("status") == "APPROVED" else "DOCUMENT_CANONICAL",
                "area": "governance",
                "subject": "TRAMA-ADR-014",
                "status": "PASS",
                "source": {"path": "docs/decisions/decision-register.json", "ref": "TRAMA-ADR-014"},
                "observedAt": observed_at,
                "freshness": {"policy": "UNTIL_CHANGE", "expiresAt": None},
                "confidence": "HIGH",
                "supports": [],
            }
        )

    maturity_results = [
        evaluate_area(area_def, evidence)
        for area_def in maturity_definitions["areas"]
    ]
    maturity_areas = [
        {
            "id": result["id"],
            "name": result["name"],
            "ownerDomain": result["ownerDomain"],
            "confirmedLevel": result["confirmedLevel"],
            "candidateLevel": result["confirmedLevel"],
            "confidence": "LOW",
            "status": "PARTIAL",
            "evidenceRefs": result["currentEvidenceRefs"],
            "blockingGateRefs": [
                gate["id"]
                for gate in gates
                if gate.get("area") == result["id"] and gate.get("blocking") and gate.get("status") != "PASS"
            ],
            "dependencies": result["dependencies"],
            "lastEvaluatedAt": observed_at,
        }
        for result in maturity_results
    ]

    capabilities = capability_projection(eco_status, maturity_areas)
    dependencies = [
            {
                "id": "DEP-ARENA-DOS-AUTHORITY",
                "from": "Arena",
                "to": "Docente OS",
                "kind": "AUTHORITY",
                "status": "ACTIVE",
                "governanceRefs": ["TRAMA-ADR-002", "TRAMA-ADR-006"],
                "gateRefs": [],
                "evidenceRefs": ["EV-SOURCE-DECISION-REGISTER"],
            },
            {
                "id": "DEP-ARENA-ATLAS-DATA",
                "from": "Arena",
                "to": "Atlas",
                "kind": "DATA_FLOW",
                "status": "GOVERNED",
                "governanceRefs": ["TRAMA-ADR-002", "TRAMA-ADR-007"],
                "gateRefs": [],
                "evidenceRefs": ["EV-SOURCE-DECISION-REGISTER"],
            },
            {
                "id": "DEP-DOS-ATLAS-FUTURE",
                "from": "Docente OS",
                "to": "Atlas",
                "kind": "FUTURE_NOT_AUTHORIZED",
                "status": "NOT_AUTHORIZED",
                "governanceRefs": ["TRAMA-ADR-008"],
                "gateRefs": [],
                "evidenceRefs": ["EV-SOURCE-DECISION-REGISTER"],
            },
    ]
    expansion_candidates = [
        {"id": "R3-P2", "name": "Curriculum pubblico", "status": "PLANNED", "dependencyRefs": ["GATE-R3-F0-EXIT"]},
        {"id": "R3-P5", "name": "Smart Navigation", "status": "PLANNED", "dependencyRefs": ["GATE-R3-F0-EXIT"]},
    ]
    snapshot = {
        "$schema": "../../schemas/ecosystem-snapshot.schema.json",
        "schemaVersion": "1.3.0",
        "generatedAt": observed_at,
        "sourceState": source_state,
        "phases": phase_status(caps),
        "areas": maturity_areas,
        "capabilities": capabilities,
        "gates": gates,
        "evidence": evidence,
        "dependencies": dependencies,
        "assuranceClaims": [
            {**claim, "readiness": assurance_readiness(claim)}
            for claim in assurance_registry["claims"]
        ],
        "expansionCandidates": expansion_candidates,
        "integrityChecks": [],
        "operationalPath": {},
        "timelineEvents": timeline_projection(governed_events),
        "timelineCoverage": {
            "mode": governed_events["coverage"]["mode"],
            "from": governed_events["coverage"]["from"],
            "note": governed_events["coverage"].get("note", ""),
            "sourceRef": "status/governed-events.json",
        },
    }
    snapshot["operationalPath"] = build_operational_path(snapshot)
    snapshot["integrityChecks"] = build_integrity_checks(
        snapshot,
        parse_timestamp(observed_at) or datetime.now(timezone.utc),
    )
    return snapshot


def validate(snapshot: dict) -> None:
    required = {
        "schemaVersion",
        "generatedAt",
        "sourceState",
        "phases",
        "areas",
        "capabilities",
        "gates",
        "evidence",
        "dependencies",
        "assuranceClaims",
        "expansionCandidates",
        "integrityChecks",
        "operationalPath",
        "timelineEvents",
        "timelineCoverage",
    }
    missing = sorted(required - snapshot.keys())
    if missing:
        raise ValueError(f"Missing snapshot keys: {missing}")

    phase_ids = {p["id"] for p in snapshot["phases"]}
    if phase_ids != {"R1", "R2", "R3", "R4", "R5"}:
        raise ValueError(f"Unexpected phase set: {sorted(phase_ids)}")

    gate_ids = {g["id"] for g in snapshot["gates"]}
    valid_gate_statuses = {"OPEN", "IN_PROGRESS", "PASS", "FAIL", "WAIVED", "NOT_APPLICABLE"}
    for gate in snapshot["gates"]:
        if gate["status"] not in valid_gate_statuses:
            raise ValueError(f"Invalid gate status {gate['status']} for {gate['id']}")

    for phase in snapshot["phases"]:
        for gate_ref in phase.get("gateRefs", []):
            if gate_ref not in gate_ids:
                raise ValueError(f"Unresolved gate reference: {gate_ref}")

    source_statuses = {"FRESH", "STALE", "PARTIAL", "UNVERIFIED", "BLOCKED"}
    for source_id, source in snapshot["sourceState"].items():
        if source["status"] not in source_statuses:
            raise ValueError(f"Invalid source status {source['status']} for {source_id}")

    evidence_ids = {item["id"] for item in snapshot["evidence"]}
    if len(evidence_ids) != len(snapshot["evidence"]):
        raise ValueError("Duplicate evidence id detected")

    area_ids = {area["id"] for area in snapshot["areas"]}
    capability_ids = {item["id"] for item in snapshot["capabilities"]}
    if len(capability_ids) != len(snapshot["capabilities"]):
        raise ValueError("Duplicate capability id detected")

    for capability in snapshot["capabilities"]:
        area_ref = capability.get("maturityAreaRef")
        if area_ref is not None and area_ref not in area_ids:
            raise ValueError(f"Unresolved maturity area reference: {area_ref}")
        for gate_ref in capability.get("gateRefs", []):
            if gate_ref not in gate_ids:
                raise ValueError(f"Unresolved capability gate reference: {gate_ref}")
        for evidence_ref in capability.get("evidenceRefs", []):
            if evidence_ref not in evidence_ids:
                raise ValueError(f"Unresolved capability evidence reference: {evidence_ref}")

    integrity_ids = {item["id"] for item in snapshot["integrityChecks"]}
    if len(integrity_ids) != len(snapshot["integrityChecks"]):
        raise ValueError("Duplicate integrity check id detected")
    valid_integrity_statuses = {"PASS", "ISSUE", "NOT_EVALUABLE"}
    for check in snapshot["integrityChecks"]:
        if check["status"] not in valid_integrity_statuses:
            raise ValueError(f"Invalid integrity status {check['status']} for {check['id']}")

    timeline_ids = {item["id"] for item in snapshot["timelineEvents"]}
    if len(timeline_ids) != len(snapshot["timelineEvents"]):
        raise ValueError("Duplicate timeline event id detected")
    if any(not item.get("sourceRef") for item in snapshot["timelineEvents"]):
        raise ValueError("Timeline event without sourceRef detected")

    operational_path = snapshot["operationalPath"]
    if not isinstance(operational_path, dict):
        raise ValueError("operationalPath must be an object")
    for key in {
        "currentActivities",
        "nextGates",
        "nextIncrements",
        "explicitDefers",
        "unmetDependencies",
    }:
        if key not in operational_path:
            raise ValueError(f"Missing operationalPath key: {key}")

    dependency_ids = {item["id"] for item in snapshot["dependencies"]}
    if len(dependency_ids) != len(snapshot["dependencies"]):
        raise ValueError("Duplicate dependency id detected")
    for dependency in snapshot["dependencies"]:
        for gate_ref in dependency.get("gateRefs", []):
            if gate_ref not in gate_ids:
                raise ValueError(f"Unresolved dependency gate reference: {gate_ref}")
        for evidence_ref in dependency.get("evidenceRefs", []):
            if evidence_ref not in evidence_ids:
                raise ValueError(f"Unresolved dependency evidence reference: {evidence_ref}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        default="control-center/data/ecosystem-snapshot.json",
        help="Output path relative to repository root.",
    )
    parser.add_argument("--check", action="store_true", help="Build and validate without writing.")
    args = parser.parse_args()

    snapshot = build_snapshot(ROOT)
    validate(snapshot)

    if args.check:
        print("TRAMA_ECOSYSTEM_SNAPSHOT_CHECK_PASS")
        return 0

    output = ROOT / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
