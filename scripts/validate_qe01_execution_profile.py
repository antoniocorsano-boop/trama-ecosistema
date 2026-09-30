#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path

PROFILE=Path("governance/runtime/qe01-first-qualified-execution-profile.json")
REQUIRED_GATES=[
 "HUMAN_DECISION","PROVIDER_REAL_QUALIFIED","ADAPTER_REAL_QUALIFIED",
 "EXECUTION_PROFILE_FROZEN","NETWORK_SECRET_POLICY","PRIVACY_DATA_MINIMIZATION",
 "TIMEOUT_CANCEL_CLEANUP","NO_MUTATION","EVIDENCE_RECEIPT",
 "STALE_FAILURE_NORMALIZATION","CONTROL_CENTER_OBSERVE_ONLY",
 "MANUAL_FALLBACK","HUMAN_EXACT_HEAD_REVIEW"
]

def validate(d):
    errors=[]
    if d.get("schemaVersion")!="trama.qe01-execution-profile/v1": errors.append("QE01-SCHEMA")
    if d.get("executionId")!="QE-01": errors.append("QE01-ID")
    c=d.get("capability",{})
    if c.get("id")!="lesson.preparation.observe" or c.get("mode")!="PROPOSE_ONLY": errors.append("QE01-CAPABILITY")
    if d.get("decisionOwner")!="DOCENTE_OS": errors.append("QE01-OWNER")
    r=d.get("runtime",{})
    if r.get("maxRetries")!=0 or r.get("oneShot") is not True: errors.append("QE01-ONESHOT")
    a=d.get("authorityBoundaries",{})
    forbidden=["arenaWrite","atlasPublish","docenteOsAutoAdopt","diaryWrite"]
    if any(a.get(k) is not False for k in forbidden): errors.append("QE01-MUTATION")
    if a.get("controlCenterReadOnly") is not True or a.get("dosA1")!="RUNTIME_DEFERRED": errors.append("QE01-AUTHORITY")
    p=d.get("dataPolicy",{})
    if any(p.get(k) is not False for k in ["personalStudentData","studentProfiles","studentTracking","secretsPersisted","evidenceMayContainSecrets"]):
        errors.append("QE01-DATA")
    gates=d.get("gates",{})
    if any(k not in gates for k in REQUIRED_GATES): errors.append("QE01-GATES")
    real_bound=all(r.get(k) for k in ["providerType","providerId","adapterId","adapterVersion","runtimeProfileRef"])
    all_gates=all(gates.get(k) is True for k in REQUIRED_GATES)
    executable=d.get("executable") is True
    state=d.get("state")
    if executable:
        if state!="AUTHORIZED_FOR_QUALIFIED_EXECUTION": errors.append("QE01-EXEC-STATE")
        if not real_bound or not all_gates: errors.append("QE01-EXEC-BLOCK")
        if r.get("networkPolicy") not in ("DENY","ALLOWLIST"): errors.append("QE01-NETWORK")
        if r.get("networkPolicy")=="ALLOWLIST" and not r.get("allowedEndpoints"): errors.append("QE01-ENDPOINTS")
    else:
        if state not in ("AUTHORIZED_PENDING_PROVIDER_QUALIFICATION","AUTHORIZED_PENDING_EXACT_HEAD_QUALIFICATION"):
            errors.append("QE01-PENDING-STATE")
        if state=="AUTHORIZED_PENDING_PROVIDER_QUALIFICATION":
            if gates.get("HUMAN_DECISION") is not True: errors.append("QE01-HUMAN")
            if real_bound: errors.append("QE01-PROVIDER-STATE")
    return sorted(set(errors))

def main():
    d=json.loads(PROFILE.read_text(encoding="utf-8"))
    e=validate(d)
    print(json.dumps({"pass":not e,"errors":e,"state":d.get("state"),"executable":d.get("executable")},sort_keys=True))
    return 0 if not e else 1

if __name__=="__main__":
    raise SystemExit(main())
