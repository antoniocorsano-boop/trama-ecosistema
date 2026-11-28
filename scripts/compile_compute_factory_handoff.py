"""Offline review envelope; does not select providers, execute or authorize work."""
import hashlib
import json
import re

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"),
                                     ensure_ascii=False, allow_nan=False).encode("utf-8")).hexdigest()

def require(condition, message):
    if not condition:
        raise ValueError(message)

def handoff(request, plan):
    require(isinstance(request, dict) and isinstance(plan, dict), "object required")
    rid = request.get("requestId")
    quality = request.get("qualityProfile")
    require(isinstance(rid, str) and bool(rid.strip()) and quality in ("Q3", "Q4"), "request identity/quality")
    require(isinstance(request.get("packageDigest"), str) and
            re.fullmatch(r"[0-9a-f]{64}", request["packageDigest"]), "package digest")
    require(type(request.get("maxAttempts")) is int and 1 <= request["maxAttempts"] <= 4, "attempt bound")
    require(request.get("paidComputeAuthorized") is False, "paid authority")
    require(plan.get("qualityProfile") == quality, "quality mismatch")
    version = plan.get("schemaVersion")
    if version == "trama.visual-3d-plan/v0.1":
        require(request.get("costClass") == "FREE_ONLY" and plan.get("costClass") == "FREE_ONLY", "cost class")
        require(plan.get("executionAuthorized") is False, "execution authority")
        for key in ("runtimeAuthorized", "paidComputeAuthorized", "allowQualityDowngrade",
                    "publicationAuthorityGranted", "studentAuthorized"):
            require(plan.get(key) is False and request.get(key) is False, "authority: " + key)
        require(plan.get("humanReviewRequired") is True, "review required")
        require(plan.get("requestId") == rid and plan.get("requestDigest") == digest(request), "request binding")
        unsigned = {k: v for k, v in plan.items() if k != "planDigest"}
        require(plan.get("planDigest") == digest(unsigned), "plan digest mismatch")
        require(plan.get("decision") in ("PLAN_READY_FOR_REVIEW", "PARTIAL_PLAN_FOR_REVIEW",
                "WAITING_FOR_REFERENCE", "STOP_NO_ADMISSIBLE_ENGINE"), "unknown plan state")
        binding = "REQUEST_DIGEST_MATCH"
    elif version == "trama.compute-plan/v0.1":
        require(request.get("schemaVersion") == "atlas.visual-production-request/v0.1" and
                request.get("computePolicyRef") == "TRAMA Compute Policy v0.1" and
                request.get("allowQualityDowngrade") is False, "request policy")
        require(plan.get("runtimeAuthorized") is False and plan.get("costMode") == "FREE_ONLY", "plan authority/cost")
        require(plan.get("decision") in ("PLAN_READY", "STOP_NO_FREE_PROVIDER",
                "STOP_STALE_ENTITLEMENT_SNAPSHOT"), "unknown plan state")
        if plan["decision"] != "STOP_STALE_ENTITLEMENT_SNAPSHOT":
            require(plan.get("noPaidFallback") is True and plan.get("noQualityDowngrade") is True, "plan policy")
        binding = "POLICY_ONLY_UNBOUND"
    else:
        raise ValueError("unsupported plan")
    for key in ("runtimeAuthorized", "executionAuthorized", "paidComputeAuthorized",
                "publicationAuthorityGranted", "studentAuthorized", "allowQualityDowngrade"):
        require(key not in plan or plan[key] is False, "unexpected plan authority: " + key)
        require(key not in request or request[key] is False, "unexpected request authority: " + key)
    result = {"schemaVersion": "trama.compute-factory-handoff/v0.1", "requestId": rid,
              "requestDigest": digest(request), "packageDigest": request["packageDigest"],
              "sourcePlanDigest": digest(plan), "sourcePlanVersion": version,
              "sourceDecision": plan["decision"], "qualityProfile": quality, "binding": binding,
              "decision": "REVIEW_REFERENCE_ONLY", "humanReviewRequired": True,
              "trustedOriginVerified": False, "liveEvidenceVerified": False,
              "runtimeAuthorized": False, "executionAuthorized": False,
              "paidComputeAuthorized": False, "publicationAuthorityGranted": False,
              "studentAuthorized": False}
    return {**result, "handoffDigest": digest(result)}


def atlas_cache_review_reference(receipt, expected_key):
    """Record a dependency-cache restore claim; never authorize reuse or a candidate."""
    require(isinstance(receipt, dict) and set(receipt) == {
        "status", "mode", "dependencyKey", "verifiedFiles", "candidateReused"
    }, "unexpected cache receipt shape")
    require(isinstance(expected_key, str) and re.fullmatch(r"[0-9a-f]{64}", expected_key),
            "expected dependency key")
    require(receipt["status"] == "PASS" and receipt["mode"] == "restore", "restore not verified")
    require(receipt["dependencyKey"] == expected_key, "dependency key mismatch")
    require(type(receipt["verifiedFiles"]) is int and receipt["verifiedFiles"] == 10,
            "unexpected SP-02 dependency file count")
    require(receipt["candidateReused"] is False, "candidate reuse not supported")
    result = {"schemaVersion": "trama.compute-factory-cache-reference/v0.1",
              "dependencyKey": expected_key, "receiptDigest": digest(receipt),
              "scope": "BASE_DEPENDENCIES_ONLY", "decision": "REVIEW_REFERENCE_ONLY",
              "trustedOriginVerified": False, "artifactBytesVerified": False,
              "reuseAuthorized": False, "candidateQualified": False,
              "executionAuthorized": False, "publicationAuthorityGranted": False,
              "paidComputeAuthorized": False, "studentAuthorized": False}
    return {**result, "referenceDigest": digest(result)}
