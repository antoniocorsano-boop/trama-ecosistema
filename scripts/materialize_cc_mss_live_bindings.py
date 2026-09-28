#!/usr/bin/env python3
"""Materialize non-secret LIVE_ONE_SHOT decision bindings offline.
This tool has no network client and never accepts credential secret material.
"""
import argparse, json, re, sys
from pathlib import Path

TEMPLATE = Path("config/cc-mss-01-live-one-shot-decision-package.json")
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
DIGEST_RE = re.compile(r"^sha256:[0-9a-f]{64}$")
SECRET_PATTERNS = [
    re.compile(r"gh[pousr]_[A-Za-z0-9_]{20,}"),
    re.compile(r"github_pat_[A-Za-z0-9_]{20,}"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"(?i)^bearer\s+\S+"),
    re.compile(r"(?i)^authorization\s*:")
]
FIELDS = {
 "credentialRef","expectedPrincipalRef","permissionAttestationRef","permissionAttestationDigest",
 "permissionAttestationExpiresAt","permissionBootstrap","requestBudgetPolicyDigest",
 "retryTimeoutPolicyDigest","resourceLimitPolicyDigest","canonicalizationVersion",
 "authorizationReceiptRef","probeRunId","issuedAt","expiresAt","clockSkewCeilingSeconds"
}

def reject_secret(value):
    if not isinstance(value, str): return
    if "\n" in value or "\r" in value: raise ValueError("MULTILINE_VALUE_FORBIDDEN")
    if any(p.search(value) for p in SECRET_PATTERNS): raise ValueError("SECRET_LIKE_VALUE_FORBIDDEN")

def materialize(template, envelope, candidate_sha):
    if not SHA_RE.fullmatch(candidate_sha or ""): raise ValueError("CANDIDATE_SHA_INVALID")
    if set(envelope) != FIELDS: raise ValueError("ENVELOPE_FIELDS_INVALID")
    for value in envelope.values(): reject_secret(value)
    if not str(envelope["credentialRef"]).startswith("ref:"): raise ValueError("CREDENTIAL_REF_NOT_OPAQUE")
    if not str(envelope["expectedPrincipalRef"]).startswith("principal:"): raise ValueError("PRINCIPAL_REF_INVALID")
    if not str(envelope["permissionAttestationRef"]).startswith("attestation:"): raise ValueError("ATTESTATION_REF_INVALID")
    for key in ("permissionAttestationDigest","requestBudgetPolicyDigest","retryTimeoutPolicyDigest","resourceLimitPolicyDigest"):
        if not isinstance(envelope[key], str) or not DIGEST_RE.fullmatch(envelope[key]): raise ValueError(f"{key}_INVALID")
    if envelope["permissionBootstrap"] not in (None,"github.permissions.read"): raise ValueError("PERMISSION_BOOTSTRAP_INVALID")
    out=dict(template); out.update(envelope)
    out.update({"candidateExactSha":candidate_sha,"state":"READY_FOR_HUMAN_DECISION","live":"NOT_AUTHORIZED","humanDecision":"PENDING"})
    return out

def main():
    p=argparse.ArgumentParser();p.add_argument("--input",required=True);p.add_argument("--candidate-sha",required=True);p.add_argument("--output",required=True)
    a=p.parse_args()
    try:
        template=json.loads(TEMPLATE.read_text(encoding="utf-8")); envelope=json.loads(Path(a.input).read_text(encoding="utf-8"))
        out=materialize(template,envelope,a.candidate_sha)
        Path(a.output).write_text(json.dumps(out,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    except Exception as exc:
        print(json.dumps({"result":"FAIL","reason":str(exc)},sort_keys=True));return 1
    print(json.dumps({"result":"MATERIALIZED_NON_SECRET_ONLY","state":"READY_FOR_HUMAN_DECISION","live":"NOT_AUTHORIZED"},sort_keys=True));return 0
if __name__=="__main__":sys.exit(main())
