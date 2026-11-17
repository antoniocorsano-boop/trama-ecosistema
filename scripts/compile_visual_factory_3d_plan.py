#!/usr/bin/env python3
"""VF-3D-01: deterministic, non-executing model/backend planner.

No networking, process spawning, model download, or provisioning. Admission
records are evidence references, not credentials or execution authority.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import re
from pathlib import Path

AUTH = ("paidComputeAuthorized", "allowQualityDowngrade", "runtimeAuthorized",
        "publicationAuthorityGranted", "studentAuthorized")
READY_LICENSE = {"PRODUCTION_ELIGIBLE", "EVALUATION_ONLY"}
READY_ENGINE = "QUALIFIED_FOR_PLANNING"
PROFILE_FIELDS = ("role", "backendId", "recipeId", "graphDigest", "backendRevision",
                  "sourceRevision", "modelArtifactDigest", "environmentDigest", "parametersDigest",
                  "licenseEvidenceRef", "qualificationEvidenceRef", "qualityProfile",
                  "minVramMiB", "minRamMiB", "minDiskMiB", "reservedSeconds")
ROLES = {
    "QUICK_SHAPE": {"IMAGE"}, "HIGH_FIDELITY_SHAPE": {"IMAGE"},
    "PART_AWARE_SHAPE": {"IMAGE"}, "EDITABLE_POINT_CLOUD": {"IMAGE"},
    "UV_TEXTURE": {"IMAGE"}, "RELIGHTABLE_ASSET": {"IMAGE"},
    "PBR_ASSET": {"IMAGE"}, "MULTIVIEW_GENERATION": {"IMAGE"},
    "MULTIVIEW_RECONSTRUCTION": {"IMAGE"}, "SURFACE_NORMALS": {"IMAGE"},
    "INTERACTIVE_GEOMETRY_REFINEMENT": {"MESH", "IMAGE"},
    "TEXTURE_ON_MESH": {"MESH", "IMAGE"}, "PHOTOGRAMMETRY": {"PHOTO"},
    "CONTROLLED_SHAPE": {"IMAGE"}, "REPAIR": {"MESH"}, "RELIGHT": {"MESH"},
    "RENDER": {"MESH"}, "OPTIMIZE": {"MESH"}, "EXPORT": {"MESH"},
}
SCHEMA = "trama.visual-3d-planning-input/v0.1"


def require(ok, message):
    if not ok:
        raise ValueError(message)


def fields(obj, keys, label):
    require(isinstance(obj, dict) and set(obj) == set(keys), label + ": unexpected or missing fields")


def flag_false(obj):
    require(all(obj.get(k) is False for k in AUTH), "AUTHORITY_ESCALATION")


def ident(v):
    return isinstance(v, str) and bool(re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}", v))


def digest(v, n=64):
    return isinstance(v, str) and bool(re.fullmatch(r"[a-f0-9]{" + str(n) + r"}", v))


def text_ref(v):
    return isinstance(v, str) and 0 < len(v) <= 500 and not any(ord(c) < 32 for c in v)


def integer(v, lo, hi):
    return type(v) is int and lo <= v <= hi


def unique_rows(rows, key, label, max_rows=100):
    require(isinstance(rows, list) and len(rows) <= max_rows, label + ": invalid list")
    require(all(isinstance(x, dict) and ident(x.get(key)) for x in rows), label + ": invalid id")
    out = {x[key]: x for x in rows}
    require(len(out) == len(rows), label + ": duplicate id")
    return out


def timestamp(value):
    require(isinstance(value, str), "invalid timestamp")
    t = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    require(t.tzinfo is not None, "timezone required")
    return t.astimezone(dt.timezone.utc)


def sha(obj):
    return hashlib.sha256(json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False,
                                     allow_nan=False).encode()).hexdigest()


def validate_catalog(registry, recipes):
    require(registry.get("schemaVersion") == "trama.visual-3d-engine-registry/v0.1", "registry version")
    require(registry.get("costClass") == "FREE_ONLY", "registry cost")
    flag_false(registry)
    engines = unique_rows(registry.get("engines"), "id", "engines")
    backends = unique_rows(registry.get("backends"), "id", "backends")
    require(recipes.get("schemaVersion") == "trama.visual-3d-recipe-catalog/v0.1", "recipe version")
    require(all(recipes.get(k) is False for k in ("executionAuthorized", "fullPackInstallAuthorized",
            "paidComputeAuthorized", "publicationAuthorityGranted", "studentAuthorized")), "recipe authority")
    catalog = unique_rows(recipes.get("recipes"), "id", "recipes")
    for e in engines.values():
        require(isinstance(e.get("roles"), list) and e["roles"] and set(e["roles"]) <= set(ROLES), "invalid role")
        v = e.get("documentedVramGiB")
        require(v is None or (type(v) in (int, float) and 0 < v <= 256), "invalid catalog VRAM")
    for recipe in catalog.values():
        require(isinstance(recipe.get("engineIds"), list) and set(recipe["engineIds"]) <= set(engines), "recipe engine")
        require(digest(recipe.get("gitBlob"), 40), "recipe blob")
    return engines, backends, catalog


def compile_plan(bundle, registry, recipes, now):
    require(isinstance(now, dt.datetime) and now.tzinfo is not None, "timezone required")
    now = now.astimezone(dt.timezone.utc)
    engines, backends, catalog = validate_catalog(registry, recipes)
    fields(bundle, ("schemaVersion", "request", "admissions", "pools"), "bundle")
    require(bundle["schemaVersion"] == SCHEMA, "bundle version")
    req = bundle["request"]
    fields(req, ("requestId", "subjectRef", "packageDigest", "artDirectionRef", "sourceRevision",
                 "purpose", "qualityProfile", "costClass", "maxAttempts", "maxConcurrentGpuJobs",
                 "assets", "jobs", *AUTH), "request")
    flag_false(req)
    require(ident(req["requestId"]) and ident(req["subjectRef"]) and digest(req["packageDigest"])
            and digest(req["sourceRevision"], 40) and text_ref(req["artDirectionRef"]), "request identity")
    require(req["purpose"] in ("EVALUATION", "PRODUCTION_CANDIDATE")
            and req["qualityProfile"] in ("Q3", "Q4") and req["costClass"] == "FREE_ONLY", "request policy")
    require(integer(req["maxAttempts"], 1, 4) and type(req["maxConcurrentGpuJobs"]) is int
            and req["maxConcurrentGpuJobs"] == 1, "attempt/concurrency bounds")
    assets = unique_rows(req["assets"], "id", "assets", 32)
    for a in assets.values():
        fields(a, ("id", "kind", "sha256", "bytes", "rightsRef", "reviewRef", "dataClass"), "asset")
        require(a["kind"] in ("IMAGE", "PHOTO", "MESH") and digest(a["sha256"])
                and integer(a["bytes"], 1, 256 * 1024 * 1024)
                and text_ref(a["rightsRef"]) and text_ref(a["reviewRef"])
                and a["dataClass"] == "NONPERSONAL", "asset binding/privacy")
    jobs = unique_rows(req["jobs"], "id", "jobs", 4)
    require(1 <= len(jobs) <= req["maxAttempts"], "too many jobs")
    for job in jobs.values():
        fields(job, ("id", "role", "inputIds", "engineOrder"), "job")
        require(job["role"] in ROLES, "unknown role")
        order = job["engineOrder"]
        require(isinstance(order, list) and 1 <= len(order) <= 16 and all(isinstance(x, str) and x in engines for x in order)
                and len(set(order)) == len(order), "explicit engine order invalid")
        inputs = job["inputIds"]
        require(isinstance(inputs, list) and len(inputs) <= 32 and all(isinstance(x, str) and x in assets for x in inputs)
                and len(set(inputs)) == len(inputs), "input references invalid")

    pools = unique_rows(bundle["pools"], "id", "pools", 32)
    providers = set()
    for pool in pools.values():
        fields(pool, ("id", "providerId", "computePlanDigest", "evidenceRef", "observedAt", "expiresAt",
                      "costClass", "zeroMarginalVerified", "availableSeconds", "vramMiB", "ramMiB", "diskMiB"), "pool")
        require(ident(pool["providerId"]) and pool["providerId"] not in providers, "duplicate provider quota")
        providers.add(pool["providerId"])
        require(digest(pool["computePlanDigest"]) and text_ref(pool["evidenceRef"])
                and type(pool["zeroMarginalVerified"]) is bool
                and pool["costClass"] in ("ZERO_MARGINAL", "CREDIT_COVERED", "PAID", "UNKNOWN")
                and all(integer(pool[k], 0, 10**9) for k in ("availableSeconds", "vramMiB", "ramMiB", "diskMiB")), "pool binding")
        timestamp(pool["observedAt"])
        timestamp(pool["expiresAt"])
    admissions = unique_rows(bundle["admissions"], "id", "admissions")
    seen = set()
    for a in admissions.values():
        fields(a, ("id", "engineId", "role", "backendId", "recipeId", "graphDigest", "backendRevision",
                   "sourceRevision", "modelArtifactDigest", "environmentDigest", "parametersDigest",
                   "licenseEvidenceRef", "qualificationEvidenceRef", "qualityProfile", "poolId",
                   "computePlanDigest", "expiresAt", "minVramMiB", "minRamMiB", "minDiskMiB", "reservedSeconds"), "admission")
        require(a["engineId"] in engines and a["poolId"] in pools
                and a["backendId"] in ("direct-cli", "comfyui-local") and a["role"] in ROLES, "admission engine/backend/pool")
        require(all(digest(a[k]) for k in ("modelArtifactDigest", "environmentDigest", "parametersDigest", "computePlanDigest"))
                and digest(a["sourceRevision"], 40) and digest(a["backendRevision"], 40)
                and text_ref(a["licenseEvidenceRef"]) and text_ref(a["qualificationEvidenceRef"])
                and a["qualityProfile"] in ("Q3", "Q4")
                and all(integer(a[k], 0, 10**9) for k in ("minVramMiB", "minRamMiB", "minDiskMiB"))
                and integer(a["reservedSeconds"], 1, 86400), "admission evidence")
        timestamp(a["expiresAt"])
        if a["backendId"] == "direct-cli":
            require(a["recipeId"] is None and a["graphDigest"] is None, "direct adapter graph mismatch")
        else:
            require(a["recipeId"] in catalog and digest(a["graphDigest"]), "graph binding")
        key = (a["engineId"], a["role"], a["backendId"], a["recipeId"], a["poolId"], a["qualityProfile"])
        require(key not in seen, "duplicate admission")
        seen.add(key)

    remaining = {k: p["availableSeconds"] for k, p in pools.items()}
    results = []
    for job in jobs.values():
        kinds = [assets[k]["kind"] for k in job["inputIds"]]
        missing = not ROLES[job["role"]] <= set(kinds) or (job["role"] == "PHOTOGRAMMETRY" and kinds.count("PHOTO") < 2)
        examined = []
        chosen = None
        for eid in job["engineOrder"]:
            e = engines[eid]
            reasons = []
            if missing:
                reasons.append("REFERENCE_REQUIRED")
            if job["role"] not in e["roles"]:
                reasons.append("ROLE_NOT_SUPPORTED")
            if e.get("licenseGate") not in READY_LICENSE:
                reasons.append("LICENSE_NOT_ADMITTED")
            elif e["licenseGate"] == "EVALUATION_ONLY" and req["purpose"] != "EVALUATION":
                reasons.append("EVALUATION_ONLY")
            if e.get("executionGate") != READY_ENGINE:
                reasons.append("ENGINE_NOT_QUALIFIED")
            candidates = sorted((a for a in admissions.values() if a["engineId"] == eid),
                                key=lambda a: (a["backendId"] != "direct-cli", a["id"]))
            rejected = []
            if not candidates:
                reasons.append("NO_ADMISSION")
            if not reasons:
                for a in candidates:
                    p = pools[a["poolId"]]
                    why = []
                    if a["qualityProfile"] != req["qualityProfile"]:
                        why.append("QUALITY_PROFILE_MISMATCH")
                    if a["role"] != job["role"]:
                        why.append("ADMISSION_ROLE_MISMATCH")
                    # Exact immutable profile must have been separately recorded in the trusted registry.
                    if {k: a[k] for k in PROFILE_FIELDS} not in e.get("qualifiedProfiles", []):
                        why.append("QUALIFIED_PROFILE_BINDING_MISMATCH")
                    if a["computePlanDigest"] != p["computePlanDigest"]:
                        why.append("COMPUTE_BINDING_MISMATCH")
                    if timestamp(a["expiresAt"]) <= now:
                        why.append("ADMISSION_EXPIRED")
                    observed, expires = timestamp(p["observedAt"]), timestamp(p["expiresAt"])
                    if not observed <= now < expires or now - observed > dt.timedelta(minutes=15):
                        why.append("STALE_ENTITLEMENT")
                    if p["costClass"] not in ("ZERO_MARGINAL", "CREDIT_COVERED") or not p["zeroMarginalVerified"]:
                        why.append("ZERO_COST_NOT_VERIFIED")
                    if a["backendId"] == "comfyui-local":
                        b = backends.get("comfyui-local", {})
                        recipe = catalog[a["recipeId"]]
                        if b.get("executionGate") != READY_ENGINE or b.get("qualifiedRevision") != a["backendRevision"]:
                            why.append("BACKEND_NOT_QUALIFIED")
                        if (recipe.get("status") != "QUALIFIED_FOR_PLANNING" or eid not in recipe["engineIds"]
                                or recipe.get("apiGraphDigest") != a["graphDigest"]
                                or recipe.get("backendRevision") != a["backendRevision"]):
                            why.append("RECIPE_NOT_QUALIFIED")
                    # Conservative documented baseline; new measured profiles require an audited catalog change.
                    floor = int((e.get("documentedVramGiB") or 0) * 1024)
                    if (p["vramMiB"] < max(floor, a["minVramMiB"]) or p["ramMiB"] < a["minRamMiB"]
                            or p["diskMiB"] < a["minDiskMiB"]):
                        why.append("HARDWARE_INSUFFICIENT")
                    if remaining[p["id"]] < a["reservedSeconds"]:
                        why.append("QUOTA_INSUFFICIENT")
                    if why:
                        rejected.append({"admissionId": a["id"], "reasons": why})
                        continue
                    chosen = {"engineId": eid, "admissionId": a["id"], "backendId": a["backendId"],
                              "poolId": p["id"], "reservedSeconds": a["reservedSeconds"],
                              "sourceRevision": a["sourceRevision"], "backendRevision": a["backendRevision"],
                              "modelArtifactDigest": a["modelArtifactDigest"], "environmentDigest": a["environmentDigest"],
                              "parametersDigest": a["parametersDigest"], "computePlanDigest": a["computePlanDigest"],
                              "licenseEvidenceRef": a["licenseEvidenceRef"], "qualificationEvidenceRef": a["qualificationEvidenceRef"],
                              "computeEvidenceRef": p["evidenceRef"], "entitlementExpiresAt": p["expiresAt"],
                              "recipeId": a["recipeId"], "graphDigest": a["graphDigest"]}
                    remaining[p["id"]] -= a["reservedSeconds"]
                    break
            examined.append({"engineId": eid, "reasons": reasons, "rejectedAdmissions": rejected,
                             "selected": chosen is not None})
            if chosen is not None:
                break
        results.append({"jobId": job["id"], "role": job["role"], "inputIds": job["inputIds"],
                        "state": "PLANNED_FOR_REVIEW" if chosen else ("WAITING_FOR_REFERENCE" if missing else "NO_ADMISSIBLE_ENGINE"),
                        "selected": chosen, "considered": examined})
    count = sum(r["selected"] is not None for r in results)
    decision = ("PLAN_READY_FOR_REVIEW" if count == len(results) else "PARTIAL_PLAN_FOR_REVIEW" if count
                else "WAITING_FOR_REFERENCE" if any(r["state"] == "WAITING_FOR_REFERENCE" for r in results)
                else "STOP_NO_ADMISSIBLE_ENGINE")
    plan = {"schemaVersion": "trama.visual-3d-plan/v0.1", "requestId": req["requestId"],
            "decision": decision, "plannedJobs": count, "requestDigest": sha(req),
            "planningInputDigest": sha(bundle), "registryDigest": sha(registry), "recipeCatalogDigest": sha(recipes),
            "evaluatedAt": now.isoformat(), "costClass": "FREE_ONLY", "qualityProfile": req["qualityProfile"],
            "jobs": results, "quotaRemainingSeconds": remaining, "maxConcurrentGpuJobs": 1,
            "executionAuthorized": False, "humanReviewRequired": True, "referenceBytesVerified": False,
            "liveEvidenceVerified": False, **{k: False for k in AUTH}}
    return {**plan, "planDigest": sha(plan)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--request-bundle", required=True)
    parser.add_argument("--registry", required=True)
    parser.add_argument("--recipes", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--now", help="timezone-aware fixed time for deterministic tests")
    args = parser.parse_args()
    def load(path):
        def reject_duplicate(pairs):
            obj = dict(pairs)
            require(len(obj) == len(pairs), "duplicate JSON key")
            return obj
        with Path(path).open("rb") as f:
            raw = f.read(2 * 1024 * 1024 + 1)
        require(len(raw) <= 2 * 1024 * 1024, "planning input too large")
        return json.loads(raw.decode("utf-8"), object_pairs_hook=reject_duplicate)
    now = timestamp(args.now) if args.now else dt.datetime.now(dt.timezone.utc)
    result = compile_plan(load(args.request_bundle), load(args.registry), load(args.recipes), now)
    Path(args.out).write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(result["decision"] + " " + result["planDigest"])


if __name__ == "__main__":
    main()
