#!/usr/bin/env python3
from copy import deepcopy

class EffectiveComponentEvidenceError(ValueError):
    pass

LIVE_TYPES = {"ISOLATED", "BEHAVIOURAL", "RESPONSIVE_VISUAL", "ACCESSIBILITY"}

def compose_effective_component_evidence(governed_registry, live_overlay):
    if governed_registry.get("schemaVersion") != "trama.component-evidence-registry/v1":
        raise EffectiveComponentEvidenceError("GOVERNED_REGISTRY_IDENTITY_INVALID")
    if live_overlay.get("schemaVersion") != "trama.live-component-evidence-overlay/v1":
        raise EffectiveComponentEvidenceError("LIVE_OVERLAY_IDENTITY_INVALID")

    result = deepcopy(governed_registry)
    by_id = {entry["componentId"]: entry for entry in result.get("entries", [])}
    seen = {}

    for item in live_overlay.get("items", []):
        cid = item.get("componentId")
        etype = item.get("evidenceType")
        key = (cid, etype)
        if etype not in LIVE_TYPES:
            raise EffectiveComponentEvidenceError("LIVE_EVIDENCE_TYPE_INVALID")
        if item.get("status") != "PRESENT" or item.get("runConclusion") != "SUCCESS":
            raise EffectiveComponentEvidenceError("LIVE_EVIDENCE_NOT_QUALIFIED")
        if not item.get("repository") or not item.get("exactHead") or not item.get("sourceRef") or not item.get("runId"):
            raise EffectiveComponentEvidenceError("LIVE_EVIDENCE_PROVENANCE_INCOMPLETE")
        if item.get("artifactId") and not item.get("artifactDigest"):
            raise EffectiveComponentEvidenceError("LIVE_ARTIFACT_DIGEST_MISSING")
        signature = (
            item.get("repository"), item.get("exactHead"), item.get("sourceRef"),
            item.get("runId"), item.get("artifactId"), item.get("artifactDigest")
        )
        if key in seen and seen[key] != signature:
            raise EffectiveComponentEvidenceError("LIVE_EVIDENCE_CONTRADICTION")
        seen[key] = signature

        entry = by_id.get(cid)
        if entry is None:
            raise EffectiveComponentEvidenceError("LIVE_COMPONENT_NOT_REGISTERED")

        evidence = {e["type"]: e for e in entry.get("evidence", [])}
        current = evidence.get(etype)
        if current is None:
            raise EffectiveComponentEvidenceError("LIVE_EVIDENCE_TYPE_NOT_REGISTERED")

        replacement = {
            "type": etype,
            "status": "PRESENT",
            "ref": item["sourceRef"],
            "repository": item["repository"],
            "exactHead": item["exactHead"],
            "runId": item["runId"],
            "sourcePlane": "LIVE_VERIFIED"
        }
        if item.get("artifactId"):
            replacement["artifactId"] = item["artifactId"]
            replacement["artifactDigest"] = item["artifactDigest"]

        idx = entry["evidence"].index(current)
        entry["evidence"][idx] = replacement

    return {
        "schemaVersion": "trama.effective-component-evidence/v1",
        "governedContractId": governed_registry.get("contractId"),
        "liveObservedAt": live_overlay.get("observedAt"),
        "liveStatus": live_overlay.get("status"),
        "entries": result.get("entries", []),
        "authorizesLifecycleChange": False,
        "authorizesRuntimeChange": False,
        "authorizesPromotion": False
    }
