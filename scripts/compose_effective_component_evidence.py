#!/usr/bin/env python3
from __future__ import annotations

from copy import deepcopy
import importlib.util
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]

def load_module(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    module=importlib.util.module_from_spec(spec)
    sys.modules[spec.name]=module
    spec.loader.exec_module(module)
    return module

maturity=load_module("component_maturity_for_live_evidence","scripts/project_component_maturity.py")

class EffectiveComponentEvidenceError(RuntimeError):
    pass

def _overlay_index(overlay):
    seen={}
    for row in overlay.get("evidence",[]):
        key=(row.get("componentId"),row.get("evidenceType"))
        if not all(key):
            raise EffectiveComponentEvidenceError("LIVE_EVIDENCE_IDENTITY_MISSING")
        identity=(
            row.get("exactHead"),row.get("runId"),row.get("artifactId"),
            row.get("artifactDigest"),row.get("status")
        )
        if key in seen and seen[key]!=identity:
            raise EffectiveComponentEvidenceError("CONTRADICTORY_LIVE_EVIDENCE_IDENTITY")
        seen[key]=identity
    return seen

def compose_effective_component_evidence(
    governed_registry,
    live_overlay=None,
    governed_registry_ref="governance/ui-development/trama-component-evidence-registry-v1.json"
):
    governed_components=maturity.project_components(governed_registry,governed_registry_ref)
    governed_by_id={x["componentId"]:x for x in governed_components}

    if live_overlay is None:
        return {
            "schemaVersion":"trama.effective-component-evidence/v1",
            "governedRegistryRef":governed_registry_ref,
            "liveObservedAt":None,
            "liveObservationStatus":"GOVERNED_ONLY",
            "promotionRequired":False,
            "humanReviewRequired":False,
            "components":[
                {
                    **deepcopy(item),
                    "governedEvidenceStatus":deepcopy(item["evidenceStatus"]),
                    "observedMaturity":deepcopy(item["maturity"]),
                    "liveEvidenceRefs":[]
                }
                for item in governed_components
            ],
            "liveBindings":[]
        }

    if live_overlay.get("schemaVersion")!="trama.live-component-evidence-overlay/v1":
        raise EffectiveComponentEvidenceError("LIVE_COMPONENT_OVERLAY_IDENTITY_INVALID")
    if not live_overlay.get("observedAt"):
        raise EffectiveComponentEvidenceError("LIVE_COMPONENT_OBSERVED_AT_MISSING")
    _overlay_index(live_overlay)

    effective_registry=deepcopy(governed_registry)
    entries={x["componentId"]:x for x in effective_registry.get("entries",[])}
    bindings={component_id:[] for component_id in entries}

    for row in live_overlay.get("evidence",[]):
        component_id=row["componentId"]
        evidence_type=row["evidenceType"]
        if component_id not in entries:
            raise EffectiveComponentEvidenceError("LIVE_EVIDENCE_COMPONENT_NOT_GOVERNED")
        if row.get("status")!="PRESENT":
            raise EffectiveComponentEvidenceError("LIVE_EVIDENCE_STATUS_INVALID")

        entry=entries[component_id]
        current=next((x for x in entry.get("evidence",[]) if x.get("type")==evidence_type),None)
        if current is None:
            raise EffectiveComponentEvidenceError("LIVE_EVIDENCE_TYPE_NOT_ENROLLED")
        if current.get("status")!="PRESENT":
            replacement={
                "type":evidence_type,
                "status":"PRESENT",
                "ref":"trama.live-component-evidence-overlay/v1",
                "exactHead":row["exactHead"],
                "runId":row["runId"],
                "repository":row["repository"],
                "artifactId":str(row["artifactId"]),
                "artifactDigest":row["artifactDigest"]
            }
            entry["evidence"][entry["evidence"].index(current)]=replacement
        bindings[component_id].append({
            "evidenceType":evidence_type,
            "sourceId":row["sourceId"],
            "repository":row["repository"],
            "exactHead":row["exactHead"],
            "runId":row["runId"],
            "artifactId":row["artifactId"],
            "artifactDigest":row["artifactDigest"],
            "integrationStatus":row["integrationStatus"],
            "sourceRefs":list(row.get("sourceRefs",[]))
        })

    observed_components=maturity.project_components(effective_registry,"trama.live-component-evidence-overlay/v1")
    observed_by_id={x["componentId"]:x for x in observed_components}
    components=[]
    for component_id,governed in governed_by_id.items():
        observed=observed_by_id[component_id]
        # Durable semantics remain governed. Only technical evidence/status gets the live overlay.
        result=deepcopy(governed)
        result["governedEvidenceStatus"]=deepcopy(governed["evidenceStatus"])
        result["evidenceStatus"]=deepcopy(observed["evidenceStatus"])
        result["observedMaturity"]=deepcopy(observed["maturity"])
        result["liveEvidenceRefs"]=deepcopy(bindings[component_id])
        components.append(result)

    live_status={
        "COMPLETE":"FRESH",
        "PARTIAL":"PARTIAL",
        "UNAVAILABLE":"UNAVAILABLE"
    }.get(live_overlay.get("status"),"PARTIAL")

    return {
        "schemaVersion":"trama.effective-component-evidence/v1",
        "governedRegistryRef":governed_registry_ref,
        "liveObservedAt":live_overlay["observedAt"],
        "liveObservationStatus":live_status,
        "promotionRequired":False,
        "humanReviewRequired":False,
        "components":components,
        "liveBindings":[x for values in bindings.values() for x in values]
    }
