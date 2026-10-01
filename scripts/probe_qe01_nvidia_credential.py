#!/usr/bin/env python3
from __future__ import annotations
import json, os, sys
from datetime import datetime, timezone
import httpx

BASE="https://integrate.api.nvidia.com/v1"
MODELS_URL=BASE+"/models"
EXPECTED_MODEL="nvidia/nemotron-3-ultra-550b-a55b"

def receipt(outcome:str, status_code:int|None=None, model_visible:bool|None=None, failure_class:str|None=None):
    return {
        "schemaVersion":"trama.qe01-credential-probe-receipt/v1",
        "executionId":"QE-01",
        "probeType":"CREDENTIAL_ACCESS_ONLY",
        "endpointClass":"NVIDIA_MODELS",
        "host":"integrate.api.nvidia.com",
        "modelInvoked":False,
        "chatCompletionsUsed":False,
        "teachingContentSent":False,
        "personalStudentDataSent":False,
        "secretMaterialStored":False,
        "statusCode":status_code,
        "expectedModel":EXPECTED_MODEL,
        "expectedModelVisible":model_visible,
        "outcome":outcome,
        "failureClass":failure_class,
        "observedAt":datetime.now(timezone.utc).isoformat(),
    }

def main()->int:
    key=os.environ.get("NVIDIA_API_KEY")
    if not key:
        print(json.dumps(receipt("FAIL",failure_class="CREDENTIAL_MISSING"),sort_keys=True))
        return 2
    try:
        with httpx.Client(timeout=10.0, follow_redirects=False) as client:
            r=client.get(MODELS_URL,headers={"Authorization":f"Bearer {key}","Accept":"application/json"})
    except httpx.TimeoutException:
        print(json.dumps(receipt("FAIL",failure_class="TIMEOUT"),sort_keys=True)); return 3
    except httpx.HTTPError:
        print(json.dumps(receipt("FAIL",failure_class="PROVIDER_UNAVAILABLE"),sort_keys=True)); return 4
    if r.status_code in (401,403):
        print(json.dumps(receipt("FAIL",r.status_code,False,"CREDENTIAL_REJECTED"),sort_keys=True)); return 5
    if r.status_code!=200:
        print(json.dumps(receipt("FAIL",r.status_code,None,"PROVIDER_UNAVAILABLE"),sort_keys=True)); return 6
    try:
        data=r.json()
        ids={x.get("id") for x in data.get("data",[]) if isinstance(x,dict)}
    except Exception:
        print(json.dumps(receipt("FAIL",200,None,"RESPONSE_INVALID"),sort_keys=True)); return 7
    visible=EXPECTED_MODEL in ids
    print(json.dumps(receipt("PASS" if visible else "FAIL",200,visible,None if visible else "MODEL_UNAVAILABLE"),sort_keys=True))
    return 0 if visible else 8

if __name__=="__main__":
    raise SystemExit(main())
