#!/usr/bin/env python3
from __future__ import annotations
import json, os
from datetime import datetime, timezone
import httpx

URL="https://integrate.api.nvidia.com/v1/chat/completions"

def receipt(outcome,status_code=None,failure_class=None):
    return {
        "schemaVersion":"trama.qe01-credential-probe-receipt/v1",
        "executionId":"QE-01",
        "probeType":"CREDENTIAL_ACCESS_ONLY",
        "endpointClass":"NVIDIA_CHAT_COMPLETIONS_VALIDATION_BOUNDARY",
        "host":"integrate.api.nvidia.com",
        "modelInvoked":False,
        "validGenerationRequestSent":False,
        "teachingContentSent":False,
        "personalStudentDataSent":False,
        "secretMaterialStored":False,
        "statusCode":status_code,
        "outcome":outcome,
        "failureClass":failure_class,
        "observedAt":datetime.now(timezone.utc).isoformat(),
    }

def main():
    key=os.environ.get("NVIDIA_API_KEY")
    if not key:
        print(json.dumps(receipt("FAIL",failure_class="CREDENTIAL_MISSING"),sort_keys=True)); return 2
    try:
        with httpx.Client(timeout=10.0,follow_redirects=False) as c:
            r=c.post(URL,headers={
                "Authorization":f"Bearer {key}",
                "Accept":"application/json",
                "Content-Type":"application/json",
            },json={})
    except httpx.TimeoutException:
        print(json.dumps(receipt("FAIL",failure_class="TIMEOUT"),sort_keys=True)); return 3
    except httpx.HTTPError:
        print(json.dumps(receipt("FAIL",failure_class="PROVIDER_UNAVAILABLE"),sort_keys=True)); return 4
    if r.status_code in (401,403):
        print(json.dumps(receipt("FAIL",r.status_code,"CREDENTIAL_REJECTED"),sort_keys=True)); return 5
    if 400 <= r.status_code < 500:
        print(json.dumps(receipt("PASS",r.status_code,None),sort_keys=True)); return 0
    print(json.dumps(receipt("FAIL",r.status_code,"UNEXPECTED_PROVIDER_RESPONSE"),sort_keys=True)); return 6

if __name__=="__main__": raise SystemExit(main())
