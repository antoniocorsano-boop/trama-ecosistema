#!/usr/bin/env python3
from __future__ import annotations
import copy,json
from pathlib import Path
from typing import Any

ROOT=Path(__file__).resolve().parents[1]
FIXTURES=ROOT/"governance/runtime/or08-p1-fixtures.json"
ALLOWED_STATUS={"SUCCEEDED","FAILED","UNAVAILABLE","UNAUTHORIZED","STALE"}
FORBIDDEN_REQUEST_KEYS={"providerCommand","providerApi","model","endpoint","apiKey","token","secret"}

def deep_merge(base:Any,patch:Any)->Any:
    if isinstance(base,dict) and isinstance(patch,dict):
        out=copy.deepcopy(base)
        for k,v in patch.items():
            if k=="adapters" and isinstance(v,list) and isinstance(out.get(k),list):
                by={x.get("adapterId"):copy.deepcopy(x) for x in out[k]}
                for item in v:
                    aid=item.get("adapterId")
                    if aid in by: by[aid]=deep_merge(by[aid],item)
                    else: by[aid]=copy.deepcopy(item)
                out[k]=list(by.values())
            else:
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

def semantic_digest(adapter:dict[str,Any])->str:
    return json.dumps(adapter.get("result",{}).get("semantic"),ensure_ascii=False,sort_keys=True,separators=(",",":"))

def validate_case(case:dict[str,Any])->list[str]:
    e=[]
    cid=case.get("capabilityId")
    req=case.get("canonicalRequest",{})
    adapters=case.get("adapters",[])
    if len(adapters)<2: e.append("RP-01")
    for a in adapters:
        if a.get("capabilityId") not in (None,cid): e.append("RP-01")
    if FORBIDDEN_REQUEST_KEYS.intersection(set(walk_keys(req))): e.append("RP-02")
    if len({semantic_digest(a) for a in adapters})!=1: e.append("RP-03")
    if any(not a.get("providerType") or not a.get("providerId") or not a.get("adapterId") for a in adapters): e.append("RP-04")
    if any(a.get("result",{}).get("status") not in ALLOWED_STATUS for a in adapters): e.append("RP-05")
    if any(a.get("result",{}).get("semantic",{}).get("teacherDecisionOwner")!="DOCENTE_OS" or
           a.get("result",{}).get("semantic",{}).get("authorityPreserved") is not True or
           a.get("result",{}).get("semantic",{}).get("mutation") is not False for a in adapters):
        e.append("RP-06")
    caller=req.get("caller",{})
    if any(k in caller for k in ("providerApi","providerCommand","endpoint","model")): e.append("RP-07")
    if any(a.get("runtimeLive") is True for a in adapters): e.extend(["RP-08","RP-10"])
    if {"apiKey","token","secret"}.intersection(set(walk_keys(req))): e.append("RP-09")
    return sorted(set(e))

def load_matrix(path:Path=FIXTURES)->dict[str,Any]:
    return json.loads(path.read_text(encoding="utf-8"))

def base_case(matrix:dict[str,Any])->dict[str,Any]:
    return {k:copy.deepcopy(v) for k,v in matrix.items() if k!="invalid"}

def materialize_invalid(base:dict[str,Any],item:dict[str,Any])->dict[str,Any]:
    return deep_merge(base,item["patch"])

def qualify_matrix(matrix:dict[str,Any])->dict[str,Any]:
    if matrix.get("schemaVersion")!="trama.or08-p1-fixtures/v1": raise ValueError("schemaVersion")
    base=base_case(matrix)
    valid_errors=validate_case(base)
    results=[]
    for item in matrix.get("invalid",[]):
        errors=validate_case(materialize_invalid(base,item))
        expected=sorted(set(item.get("expect",[])))
        results.append({"id":item["id"],"errors":errors,"expected":expected,"pass":bool(errors) and all(x in errors for x in expected)})
    providers={a.get("providerType") for a in base.get("adapters",[])}
    return {
        "validPass":not valid_errors,
        "validErrors":valid_errors,
        "providerCount":len(providers),
        "invalidResults":results,
        "pass":not valid_errors and len(providers)>=2 and len(results)>=9 and all(x["pass"] for x in results),
        "portabilityClass":"PORTABLE_CONTRACT" if not valid_errors and len(providers)>=2 else "NOT_QUALIFIED"
    }

def main()->int:
    r=qualify_matrix(load_matrix())
    print(json.dumps(r,ensure_ascii=False,sort_keys=True,indent=2))
    return 0 if r["pass"] else 1

if __name__=="__main__": raise SystemExit(main())
