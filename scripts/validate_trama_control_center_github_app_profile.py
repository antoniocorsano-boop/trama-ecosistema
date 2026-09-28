#!/usr/bin/env python3
"""Fail-closed offline validation for the TRAMA Control Center GitHub App profile."""
import json
import sys
from pathlib import Path

PROFILE = Path("config/trama-control-center-github-app-profile.json")
REGISTRY = Path("config/trama-control-center-system-registry.json")
ALLOWED_REPO_PERMISSIONS = {
    "metadata": "read",
    "contents": "read",
    "pullRequests": "read",
    "actions": "read",
    "checks": "read",
}
REQUIRED_PROHIBITIONS = {
    "repository-write", "contents-write", "pull-request-write", "actions-write",
    "checks-write", "issues-write", "administration", "secrets-read", "secrets-write",
    "workflow-dispatch", "remote-evidence-persistence"
}

def die(code): raise ValueError(code)

def validate(profile, registry):
    if profile.get("contract") != "TRAMA-CONTROL-CENTER-GITHUB-APP-PROFILE-v1": die("PROFILE_CONTRACT_INVALID")
    if profile.get("state") != "PROVISIONING_NOT_STARTED": die("PROFILE_STATE_INVALID")
    if profile.get("live") != "NOT_AUTHORIZED": die("LIVE_STATE_INVALID")
    if profile.get("installationScope") != "SELECTED_REPOSITORIES_ONLY": die("INSTALLATION_SCOPE_INVALID")
    if profile.get("repositoryRegistry") != str(REGISTRY): die("REGISTRY_BINDING_INVALID")
    if profile.get("repositoryPermissions") != ALLOWED_REPO_PERMISSIONS: die("REPOSITORY_PERMISSIONS_INVALID")
    if profile.get("organizationPermissions") != {} or profile.get("accountPermissions") != {}: die("NON_REPOSITORY_PERMISSION_FORBIDDEN")
    hooks = profile.get("webhooks")
    if hooks != {"enabled": False, "events": []}: die("WEBHOOKS_FORBIDDEN")
    if not REQUIRED_PROHIBITIONS <= set(profile.get("prohibitedCapabilities", [])): die("PROHIBITIONS_INCOMPLETE")
    cb = profile.get("credentialBoundary", {})
    for key in ("privateKeyInRepository", "privateKeyInDecisionPackage", "installationTokenInRepository", "installationTokenInDecisionPackage"):
        if cb.get(key) is not False: die("SECRET_BOUNDARY_INVALID")
    if cb.get("acceptedRuntimeBinding") != "OPAQUE_REFERENCE_ONLY": die("RUNTIME_BINDING_INVALID")
    pb = profile.get("probeBoundary", {})
    if pb.get("oneRepositoryPerLiveOneShot") is not True: die("PROBE_SCOPE_INVALID")
    if pb.get("operations") != ["repo.read", "ref.read", "commit.read"]: die("PROBE_OPERATIONS_INVALID")
    if pb.get("evidenceDestination") != "LOCAL_EPHEMERAL_ONLY": die("EVIDENCE_DESTINATION_INVALID")
    if pb.get("separateHumanAuthorizationRequired") is not True: die("HUMAN_AUTHORIZATION_REQUIRED")
    if registry.get("contract") != "TRAMA-CONTROL-CENTER-SYSTEM-REGISTRY-v1" or registry.get("defaultDeny") is not True: die("REGISTRY_INVALID")
    systems = registry.get("systems", [])
    if not systems or any(s.get("monitoring") != "ENABLED" for s in systems): die("REGISTRY_SYSTEM_INVALID")
    return {"result":"PASS","state":"PROVISIONING_NOT_STARTED","live":"NOT_AUTHORIZED","registeredRepositories":len(systems)}

def main():
    try:
        p=json.loads(PROFILE.read_text(encoding="utf-8")); r=json.loads(REGISTRY.read_text(encoding="utf-8")); out=validate(p,r)
    except (OSError,json.JSONDecodeError,ValueError) as exc:
        print(json.dumps({"result":"FAIL","reason":str(exc)},sort_keys=True)); return 1
    print(json.dumps(out,sort_keys=True)); return 0

if __name__ == "__main__": sys.exit(main())
