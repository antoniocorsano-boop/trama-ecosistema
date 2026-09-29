#!/usr/bin/env python3
from __future__ import annotations

from copy import deepcopy

class EffectiveContextError(RuntimeError):
    pass

def _repo_index(overlay):
    seen={}
    for item in overlay.get("repositories",[]):
        name=item.get("repository")
        head=item.get("observedHead")
        if not name:
            raise EffectiveContextError("REPOSITORY_IDENTITY_MISSING")
        if name in seen and seen[name]!=head:
            raise EffectiveContextError("CONTRADICTORY_REPOSITORY_IDENTITY")
        seen[name]=head
    return seen

def _anchor_index(overlay):
    seen={}
    for item in overlay.get("semanticAnchors",[]):
        key=(item.get("repository"),item.get("domain"),item.get("path"),item.get("role"))
        if not all(key):
            raise EffectiveContextError("SEMANTIC_ANCHOR_IDENTITY_MISSING")
        state=(item.get("fingerprintStatus"),item.get("governedFingerprint"),item.get("observedFingerprint"))
        if key in seen and seen[key]!=state:
            raise EffectiveContextError("CONTRADICTORY_SEMANTIC_ANCHOR_IDENTITY")
        seen[key]=state
    return seen

def _governed_status(snapshot):
    raw=snapshot.get("status")
    if raw=="CURRENT":
        return "CURRENT"
    if raw=="PARTIAL":
        return "UNKNOWN"
    return "UNKNOWN"

def _live_status(overlay):
    raw=overlay.get("status")
    if raw=="UNAVAILABLE":
        return "UNAVAILABLE"
    if raw=="PARTIAL":
        return "PARTIAL"
    if raw!="COMPLETE":
        return "PARTIAL"

    repos=overlay.get("repositories",[])
    if any(r.get("availabilityStatus")!="AVAILABLE" or r.get("completenessStatus")!="COMPLETE" for r in repos):
        return "PARTIAL"
    if any(r.get("freshnessStatus")=="STALE" for r in repos):
        return "STALE"
    if any(r.get("freshnessStatus")!="FRESH" for r in repos):
        return "PARTIAL"
    return "FRESH"

def _semantic_drift_status(overlay):
    anchors=overlay.get("semanticAnchors",[])
    if not anchors:
        return "DETECTED"
    states=[a.get("fingerprintStatus") for a in anchors]
    if any(s=="CHANGED" for s in states):
        return "REVIEW_REQUIRED"
    if any(s in {"UNKNOWN","UNAVAILABLE"} for s in states):
        return "DETECTED"
    return "NONE"

def _effective_status(governed,live,semantic_drift):
    if governed=="UNKNOWN" and live in {"UNAVAILABLE","PARTIAL"}:
        return "BLOCKED"
    if live in {"UNAVAILABLE","PARTIAL","STALE"}:
        return "DEGRADED"
    if semantic_drift=="DETECTED":
        return "DEGRADED"
    return "USABLE"

def _collect_live_source_refs(overlay):
    refs=[]
    for section in ("repositories","pullRequests","workflows","semanticAnchors"):
        for item in overlay.get(section,[]):
            for ref in item.get("sourceRefs",[]):
                if ref not in refs:
                    refs.append(ref)
    return refs

def compose_effective_project_context(governed_snapshot,live_overlay,governed_snapshot_ref="control-center/data/project-context-snapshot.json"):
    if not isinstance(governed_snapshot,dict) or governed_snapshot.get("project")!="TRAMA":
        raise EffectiveContextError("GOVERNED_SNAPSHOT_IDENTITY_INVALID")
    if live_overlay.get("schemaVersion")!="trama.live-repository-overlay/v1":
        raise EffectiveContextError("LIVE_OVERLAY_IDENTITY_INVALID")
    if not live_overlay.get("observedAt"):
        raise EffectiveContextError("LIVE_OBSERVED_AT_MISSING")

    repos=_repo_index(live_overlay)
    anchors=_anchor_index(live_overlay)
    for repository,domain,path,role in anchors:
        if repository not in repos:
            raise EffectiveContextError("SEMANTIC_ANCHOR_REPOSITORY_NOT_OBSERVED")

    governed=_governed_status(governed_snapshot)
    live=_live_status(live_overlay)
    drift=_semantic_drift_status(live_overlay)
    effective=_effective_status(governed,live,drift)

    facts=[]
    for repository,head in sorted(repos.items()):
        facts.append({
            "class":"VOLATILE",
            "subject":"repository-head",
            "repository":repository,
            "observedHead":head
        })
    for anchor in sorted(live_overlay.get("semanticAnchors",[]),key=lambda x:(x["repository"],x["domain"],x["path"],x["role"])):
        facts.append({
            "class":"BOUNDARY_SIGNAL",
            "subject":"semantic-anchor",
            "repository":anchor["repository"],
            "domain":anchor["domain"],
            "path":anchor["path"],
            "role":anchor["role"],
            "fingerprintStatus":anchor["fingerprintStatus"]
        })

    governed_as_of=governed_snapshot.get("generatedAt")
    if not governed_as_of:
        raise EffectiveContextError("GOVERNED_AS_OF_MISSING")

    return {
        "schemaVersion":"trama.effective-project-context/v1",
        "governedSnapshotRef":governed_snapshot_ref,
        "governedAsOf":governed_as_of,
        "liveObservedAt":live_overlay["observedAt"],
        "governedKnowledgeStatus":governed,
        "liveObservationStatus":live,
        "semanticDriftStatus":drift,
        "effectiveContextStatus":effective,
        "promotionRequired":False,
        "facts":facts,
        "sourceRefs":[governed_snapshot_ref,*_collect_live_source_refs(live_overlay)]
    }
