#!/usr/bin/env python3
from __future__ import annotations
import copy, json
from pathlib import Path
from typing import Any

ROOT=Path(__file__).resolve().parents[1]
FIXTURES=ROOT/"governance/runtime/or07-p1-fixtures.json"
PROVIDER_TOKENS={"dsh","codex","openai","anthropic","gemini"}
FORBIDDEN_KEYS={"openaiModel","providerCommand","runtimeCommand","studentName","studentId","studentEmail"}

def deep_merge(base:Any,patch:Any)->Any:
    if isinstance(base,dict) and isinstance(patch,dict):
        out=copy.deepcopy(base)
        for k,v in patch.items():
            out[k]=deep_merge(out.get(k),v) if k in out else copy.deepcopy(v)
        return out
    return copy.deepcopy(patch)

def walk_keys(v:Any):
    if isinstance(v,dict):
        for k,c in v.items():
            yield k
            yield from walk_keys(c)
    elif isinstance(v,list):
        for c in v: yield from walk_keys(c)

def semantic_result(adapter:dict[str,Any])->str:
    return json.dumps(adapter.get("result",{}).get("output"),ensure_ascii=False,sort_keys=True,separators=(",",":"))

def validate_case(case:dict[str,Any])->list[str]:
    e=[]
    cap=case.get("capability",{})
    req=case.get("request",{})
    adapters=case.get("adapters",[])
    cid=str(cap.get("capabilityId","")).lower()

    if req.get("input",{}).get("personalStudentData") is not False or FORBIDDEN_KEYS.intersection(set(walk_keys(req.get("input",{})))):
        e.append("SC-01")
    if any(tok in cid.split(".") for tok in PROVIDER_TOKENS):
        e.append("SC-02")
    caller=req.get("caller")
    owner=req.get("authorityContext",{}).get("decisionOwner")
    if not isinstance(caller,dict) or not caller.get("product") or not owner:
        e.append("SC-03")
    if cap.get("mode") not in {"READ_ONLY","PROPOSE_ONLY"}:
        e.extend(["SC-04","SC-10"])
    if any(not a.get("result",{}).get("evidenceRefs") for a in adapters):
        e.append("SC-05")
    if any(FORBIDDEN_KEYS.intersection(set(walk_keys(a.get("result",{}).get("output",{})))) for a in adapters):
        e.append("SC-06")
    if len(adapters)>=2 and len({semantic_result(a) for a in adapters})!=1:
        e.append("SC-06")
    if any(a.get("result",{}).get("stale") is True and a.get("result",{}).get("status")=="SUCCEEDED" for a in adapters):
        e.append("SC-08")
    if isinstance(caller,dict) and caller.get("product")=="CONTROL_CENTER" and owner=="CONTROL_CENTER":
        e.append("SC-09")
    canonical=json.dumps(case,ensure_ascii=False,sort_keys=True,separators=(",",":"))
    if canonical!=json.dumps(copy.deepcopy(case),ensure_ascii=False,sort_keys=True,separators=(",",":")):
        e.append("SC-07")
    return sorted(set(e))

def load_matrix(path:Path=FIXTURES)->dict[str,Any]:
    return json.loads(path.read_text(encoding="utf-8"))

def materialize_invalid(base:dict[str,Any],item:dict[str,Any])->dict[str,Any]:
    c=deep_merge(base,item["patch"]); c.pop("invalid",None); return c

def qualify_matrix(matrix:dict[str,Any])->dict[str,Any]:
    if matrix.get("schemaVersion")!="trama.or07-p1-fixtures/v1": raise ValueError("schemaVersion")
    base={k:copy.deepcopy(v) for k,v in matrix.items() if k!="invalid"}
    valid_errors=validate_case(base)
    results=[]
    for item in matrix.get("invalid",[]):
        errors=validate_case(materialize_invalid(base,item))
        expected=sorted(set(item.get("expect",[])))
        results.append({"id":item["id"],"errors":errors,"expected":expected,"pass":bool(errors) and all(x in errors for x in expected)})
    return {"validPass":not valid_errors,"validErrors":valid_errors,"invalidResults":results,"pass":not valid_errors and len(results)>=8 and all(x["pass"] for x in results)}

def main()->int:
    r=qualify_matrix(load_matrix()); print(json.dumps(r,ensure_ascii=False,sort_keys=True,indent=2)); return 0 if r["pass"] else 1
if __name__=="__main__": raise SystemExit(main())
