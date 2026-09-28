#!/usr/bin/env python3
"""Offline fail-closed validator for CC-MSS-01 LIVE_ONE_SHOT decision packages.
No credential access and no network capability.
"""
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

PACKAGE = Path("config/cc-mss-01-live-one-shot-decision-package.json")
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
ALLOWED_OPS = {"repo.read", "ref.read", "commit.read"}
REQUIRED_LIVE = (
    "candidateExactSha", "credentialRef", "expectedPrincipalRef",
    "permissionAttestationRef", "permissionAttestationDigest",
    "permissionAttestationExpiresAt", "requestBudgetPolicyDigest",
    "retryTimeoutPolicyDigest", "resourceLimitPolicyDigest",
    "canonicalizationVersion", "authorizationReceiptRef", "probeRunId",
    "issuedAt", "expiresAt", "clockSkewCeilingSeconds",
    "independentReviewRef", "humanDecision"
)

def die(code):
    raise ValueError(code)

def parse_utc(value, field):
    if not isinstance(value, str) or not value.endswith("Z"):
        die(f"{field}_INVALID")
    try:
        return datetime.fromisoformat(value[:-1] + "+00:00").astimezone(timezone.utc)
    except ValueError:
        die(f"{field}_INVALID")

def validate(data, now=None):
    now = now or datetime.now(timezone.utc)
    if data.get("contract") != "CC-MSS-01-LIVE-ONE-SHOT-DECISION-PACKAGE-v1": die("CONTRACT_INVALID")
    if data.get("repository") != "antoniocorsano-boop/trama-ecosistema": die("REPOSITORY_INVALID")
    if data.get("authority") != "https://api.github.com": die("AUTHORITY_INVALID")
    if data.get("httpMethod") != "GET": die("METHOD_INVALID")
    if data.get("evidenceDestination") != "LOCAL_EPHEMERAL_ONLY": die("EVIDENCE_DESTINATION_INVALID")
    ops = data.get("operations")
    if not isinstance(ops, list) or not ops or len(ops) != len(set(ops)) or not set(ops) <= ALLOWED_OPS: die("OPERATIONS_INVALID")
    baseline = data.get("baselineGateSha")
    if not isinstance(baseline, str) or not SHA_RE.fullmatch(baseline): die("BASELINE_SHA_INVALID")

    missing = [k for k in REQUIRED_LIVE if data.get(k) in (None, "", [])]
    if missing:
        if data.get("state") != "NOT_READY" or data.get("live") != "NOT_AUTHORIZED" or data.get("humanDecision") not in (None, "DENY"):
            die("INCOMPLETE_PACKAGE_MUST_FAIL_CLOSED")
        return {"result": "PASS", "state": "NOT_READY", "live": "NOT_AUTHORIZED", "missing": missing}

    if data.get("state") != "READY_FOR_HUMAN_DECISION": die("STATE_INVALID")
    if data.get("live") != "NOT_AUTHORIZED": die("PREAUTH_LIVE_FORBIDDEN")
    sha = data.get("candidateExactSha")
    if not isinstance(sha, str) or not SHA_RE.fullmatch(sha): die("CANDIDATE_SHA_INVALID")
    if data.get("humanDecision") not in ("PENDING", "DENY"): die("HUMAN_DECISION_INVALID")
    if not isinstance(data.get("clockSkewCeilingSeconds"), int) or not (0 <= data["clockSkewCeilingSeconds"] <= 300): die("CLOCK_SKEW_INVALID")
    issued = parse_utc(data["issuedAt"], "ISSUED_AT")
    expires = parse_utc(data["expiresAt"], "EXPIRES_AT")
    att_exp = parse_utc(data["permissionAttestationExpiresAt"], "ATTESTATION_EXPIRY")
    if not issued < expires: die("LIFETIME_INVALID")
    if now >= expires: die("PACKAGE_EXPIRED")
    if now >= att_exp: die("ATTESTATION_EXPIRED")
    if att_exp < expires: die("ATTESTATION_LIFETIME_INSUFFICIENT")
    for key in ("permissionAttestationDigest", "requestBudgetPolicyDigest", "retryTimeoutPolicyDigest", "resourceLimitPolicyDigest"):
        value = data.get(key)
        if not isinstance(value, str) or not re.fullmatch(r"sha256:[0-9a-f]{64}", value): die(f"{key}_INVALID")
    if not str(data.get("credentialRef", "")).startswith("ref:"): die("CREDENTIAL_REF_NOT_OPAQUE")
    if data.get("permissionBootstrap") not in (None, "github.permissions.read"): die("PERMISSION_BOOTSTRAP_INVALID")
    return {"result": "PASS", "state": "READY_FOR_HUMAN_DECISION", "live": "NOT_AUTHORIZED", "missing": []}

def main():
    data = json.loads(PACKAGE.read_text(encoding="utf-8"))
    try:
        result = validate(data)
    except (ValueError, json.JSONDecodeError) as exc:
        print(json.dumps({"result":"FAIL","reason":str(exc)}, sort_keys=True))
        return 1
    print(json.dumps(result, sort_keys=True))
    return 0

if __name__ == "__main__":
    sys.exit(main())
