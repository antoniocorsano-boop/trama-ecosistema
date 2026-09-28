#!/usr/bin/env python3
"""Offline validator for the ACTIONS_EPHEMERAL_TOKEN provider profile."""
import json
import sys
from pathlib import Path

PROFILE = Path("config/cc-mss-01-credential-provider-actions-ephemeral.json")
OPS = ["repo.read", "ref.read", "commit.read"]
PROHIBITED = {
 "cross-repository-access", "token-persistence", "artifact-upload",
 "cache-secret-persistence", "remote-evidence-persistence",
 "workflow-dispatch-live-probe", "repository-write", "contents-write",
 "pull-request-write", "issues-write", "actions-write", "checks-write"
}

def fail(code): raise ValueError(code)
def validate(d):
 if d.get("contract") != "CC-MSS-01-CREDENTIAL-PROVIDER-v1": fail("CONTRACT_INVALID")
 if d.get("provider") != "ACTIONS_EPHEMERAL_TOKEN": fail("PROVIDER_INVALID")
 if d.get("state") != "OFFLINE_CANDIDATE": fail("STATE_INVALID")
 if d.get("live") != "NOT_AUTHORIZED": fail("LIVE_MUST_REMAIN_NOT_AUTHORIZED")
 if d.get("scope") != "SAME_REPOSITORY_ONLY": fail("SCOPE_INVALID")
 if d.get("tokenOrigin") != "GITHUB_ACTIONS_JOB_EPHEMERAL": fail("TOKEN_ORIGIN_INVALID")
 if d.get("acceptedSecretInputs") != []: fail("SECRET_INPUT_FORBIDDEN")
 if d.get("decisionPackageCredentialMaterial") is not False: fail("CREDENTIAL_MATERIAL_FORBIDDEN")
 if d.get("operations") != OPS: fail("OPERATIONS_INVALID")
 if d.get("httpMethod") != "GET": fail("METHOD_INVALID")
 if d.get("evidenceDestination") != "LOCAL_EPHEMERAL_ONLY": fail("EVIDENCE_INVALID")
 if d.get("requiredWorkflowPermissions") != {"contents":"read","metadata":"read"}: fail("PERMISSIONS_INVALID")
 if d.get("prohibitedTriggers") != ["pull_request_target"]: fail("TRIGGER_GUARD_INVALID")
 if not PROHIBITED <= set(d.get("prohibitedCapabilities", [])): fail("PROHIBITED_CAPABILITY_MISSING")
 life=d.get("credentialLifecycle",{})
 if life != {"materializeAfterAtomicClaim":True,"invalidateOnSuccess":True,"invalidateOnFailure":True,"reusableContext":False}: fail("LIFECYCLE_INVALID")
 if d.get("humanAuthorizationRequired") is not True: fail("HUMAN_AUTH_REQUIRED")
 return True

def main():
 try:
  d=json.loads(PROFILE.read_text(encoding="utf-8")); validate(d)
 except (ValueError,json.JSONDecodeError) as e:
  print(f"FAIL: {e}"); return 1
 print("PASS: ACTIONS_EPHEMERAL_TOKEN profile is offline/fail-closed")
 return 0
if __name__ == "__main__": sys.exit(main())
