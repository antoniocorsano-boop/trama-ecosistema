#!/usr/bin/env python3
import json
from pathlib import Path

P=Path("governance/runtime/qe01-pre-live-gates-v1.json")

def validate(d):
    e=[]
    if d.get("schemaVersion")!="trama.qe01-pre-live-gates/v1": e.append("QE01-PL-SCHEMA")
    if d.get("executionId")!="QE-01" or d.get("capabilityId")!="lesson.preparation.observe": e.append("QE01-PL-ID")
    if d.get("mode")!="PROPOSE_ONLY" or d.get("executable") is not False: e.append("QE01-PL-MODE")
    n=d.get("network",{})
    if n.get("policy")!="ALLOWLIST" or n.get("scheme")!="https" or n.get("host")!="integrate.api.nvidia.com": e.append("QE01-PL-NETWORK")
    if n.get("apiPrefix")!="/v1" or n.get("executionPath")!="/v1/chat/completions": e.append("QE01-PL-ENDPOINT")
    if any(n.get(k) is not False for k in ("crossHostRedirects","dynamicEndpoints","fallbackProvider","fallbackModel")): e.append("QE01-PL-FALLBACK")
    s=d.get("secret",{})
    if s.get("ref")!="NVIDIA_API_KEY": e.append("QE01-PL-SECRET-REF")
    if any(s.get(k) is not False for k in ("persisted","logged","includedInEvidence","returnedToControlCenter")): e.append("QE01-PL-SECRET")
    if s.get("missingFailsClosed") is not True: e.append("QE01-PL-SECRET")
    p=d.get("credentialAccessProbe",{})
    if p.get("required") is not True or p.get("completed") is not False: e.append("QE01-PL-PROBE")
    if any(p.get(k) is not False for k in ("modelInvocationAllowed","teachingContentAllowed","personalStudentDataAllowed","validGenerationRequestAllowed","promotesExecutableState")): e.append("QE01-PL-PROBE")
    if p.get("endpoint")!="https://integrate.api.nvidia.com/v1/chat/completions" or p.get("method")!="POST" or p.get("probePayloadClass")!="INTENTIONALLY_INVALID_NON_GENERATIVE": e.append("QE01-PL-PROBE")
    x=d.get("execution",{})
    if x.get("timeoutMs")!=30000 or x.get("maxRetries")!=0 or x.get("oneShot") is not True or x.get("automaticSecondRequest") is not False: e.append("QE01-PL-EXEC")
    fp=d.get("failurePolicy",{})
    if fp.get("terminal") is not True or fp.get("retry") is not False or fp.get("providerSwitch") is not False or fp.get("modelSwitch") is not False or fp.get("mutation") is not False: e.append("QE01-PL-FAILURE")
    r=d.get("evidenceReceipt",{})
    if any(r.get(k) is not False for k in ("fullPromptStored","fullResponseStored","secretsStored")): e.append("QE01-PL-EVIDENCE")
    req=set(r.get("requiredFields",[]))
    for k in ("exactHead","evidenceDigest","secretMaterialObserved","mutationObserved"):
        if k not in req: e.append("QE01-PL-EVIDENCE")
    g=d.get("gates",{})
    for k in ("NETWORK_SECRET_POLICY","TIMEOUT_CANCEL_CLEANUP","EVIDENCE_RECEIPT","STALE_FAILURE_NORMALIZATION"):
        if g.get(k) is not True: e.append("QE01-PL-GATE")
    if g.get("CREDENTIAL_ACCESS_PROBE") is not False or g.get("HUMAN_EXACT_HEAD_REVIEW") is not False: e.append("QE01-PL-GATE")
    if d.get("dosA1")!="RUNTIME_DEFERRED": e.append("QE01-PL-DOSA1")
    return sorted(set(e))

def main():
    d=json.loads(P.read_text(encoding="utf-8"))
    e=validate(d)
    print(json.dumps({"pass":not e,"errors":e,"executable":d.get("executable")},sort_keys=True))
    return 0 if not e else 1

if __name__=="__main__": raise SystemExit(main())
