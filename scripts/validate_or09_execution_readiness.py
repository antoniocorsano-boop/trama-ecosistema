#!/usr/bin/env python3
from __future__ import annotations
import copy,json
from pathlib import Path
from typing import Any

ROOT=Path(__file__).resolve().parents[1]
FIXTURES=ROOT/"governance/runtime/or09-p1-fixtures.json"
REQUIRED_GATES={
    "CAPABILITY_CONTRACT_QUALIFIED",
    "PORTABILITY_QUALIFIED",
    "EXACT_EXECUTION_PROFILE",
    "ZERO_IMPLICIT_MUTATION",
    "NO_SECRET_LEAKAGE",
    "NO_PERSONAL_STUDENT_DATA",
    "DETERMINISTIC_EVIDENCE",
    "CANCELLATION_TIMEOUT_SEMANTICS",
    "RESOURCE_CLEANUP_QUALIFIED",
    "PROVIDER_PROVENANCE",
    "STALE_FAILURE_NORMALIZATION",
    "CONTROL_CENTER_READ_ONLY",
    "HUMAN_EXACT_HEAD_REVIEW",
}

def deep_merge(base:Any,patch:Any)->Any:
    if isinstance(base,dict) and isinstance(patch,dict):
        out=copy.deepcopy(base)
        for k,v in patch.items():
            out[k]=deep_merge(out.get(k),v) if k in out else copy.deepcopy(v)
        return out
    return copy.deepcopy(patch)

def validate_case(case:dict[str,Any])->list[str]:
    e=[]
    state=case.get("readinessState")
    profile=case.get("executionProfile",{})
    gates=case.get("gates",{})
    if state=="AUTHORIZED_FOR_QUALIFIED_EXECUTION":
        e.extend(["QE-01","QE-10"])
    required_profile=["executionProfileId","capabilityId","capabilityVersion","adapterId","adapterVersion","providerType","providerId","runtimeProfileRef","evidencePolicyRef"]
    if any(not profile.get(k) for k in required_profile):
        e.append("QE-02")
    if profile.get("authorityDecisionRef") and not gates.get("HUMAN_EXACT_HEAD_REVIEW"):
        e.append("QE-03")
    if case.get("networkEnabled") is not False or profile.get("networkPolicy")!="DENY":
        e.extend(["QE-04","QE-10"])
    if case.get("mutationAuthorized") is not False or profile.get("mode")=="MUTATIVE":
        e.extend(["QE-05","QE-10"])
    if not case.get("evidenceRefs"):
        e.append("QE-06")
    if not gates.get("CANCELLATION_TIMEOUT_SEMANTICS") or not gates.get("RESOURCE_CLEANUP_QUALIFIED"):
        e.append("QE-07")
    if not profile.get("providerType") or not profile.get("providerId") or not profile.get("adapterId"):
        e.append("QE-08")
    if gates.get("CONTROL_CENTER_READ_ONLY") is not True:
        e.append("QE-09")
    if case.get("liveRuntime") is not False or case.get("secretsPresent") is not False or case.get("personalStudentData") is not False:
        e.append("QE-10")
    if profile.get("retryPolicy",{}).get("maxRetries")!=0:
        e.append("QE-10")
    if not REQUIRED_GATES.issubset(set(gates)):
        e.append("QE-06")
    return sorted(set(e))

def load_matrix(path:Path=FIXTURES)->dict[str,Any]:
    return json.loads(path.read_text(encoding="utf-8"))

def base_case(matrix:dict[str,Any])->dict[str,Any]:
    return {k:copy.deepcopy(v) for k,v in matrix.items() if k!="invalid"}

def materialize_invalid(base:dict[str,Any],item:dict[str,Any])->dict[str,Any]:
    return deep_merge(base,item["patch"])

def qualify_matrix(matrix:dict[str,Any])->dict[str,Any]:
    if matrix.get("schemaVersion")!="trama.or09-p1-fixtures/v1":
        raise ValueError("schemaVersion")
    base=base_case(matrix)
    valid_errors=validate_case(base)
    results=[]
    for item in matrix.get("invalid",[]):
        errors=validate_case(materialize_invalid(base,item))
        expected=sorted(set(item.get("expect",[])))
        results.append({"id":item["id"],"errors":errors,"expected":expected,"pass":bool(errors) and all(x in errors for x in expected)})
    return {
        "validPass":not valid_errors,
        "validErrors":valid_errors,
        "invalidResults":results,
        "maxReachableState":"AWAITING_HUMAN_AUTHORIZATION",
        "runtimeAuthorized":False,
        "pass":not valid_errors and len(results)>=10 and all(x["pass"] for x in results)
    }

def main()->int:
    result=qualify_matrix(load_matrix())
    print(json.dumps(result,ensure_ascii=False,sort_keys=True,indent=2))
    return 0 if result["pass"] else 1

if __name__=="__main__":
    raise SystemExit(main())
