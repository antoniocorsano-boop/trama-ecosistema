#!/usr/bin/env python3
from __future__ import annotations
import hashlib,json,sys
from pathlib import Path

def canonical_json_bytes(value)->bytes:
    return json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(",",":"),allow_nan=False).encode("utf-8")

def sha256_canonical(value)->str:
    return hashlib.sha256(canonical_json_bytes(value)).hexdigest()

def proposal_id(observation_digest:str)->str:
    if len(observation_digest)!=64 or any(c not in "0123456789abcdef" for c in observation_digest):
        raise ValueError("OBSERVATION_DIGEST_INVALID")
    return "rop-"+observation_digest

def promotion_event_id(observation_digest:str,policy_digest:str)->str:
    if any(len(x)!=64 or any(c not in "0123456789abcdef" for c in x) for x in (observation_digest,policy_digest)):
        raise ValueError("DIGEST_INVALID")
    return "rope-"+hashlib.sha256((observation_digest+":"+policy_digest).encode("ascii")).hexdigest()

def main():
    p=Path(sys.argv[1])
    data=json.loads(p.read_text(encoding="utf-8"))
    print(sha256_canonical(data))
if __name__=="__main__": main()
