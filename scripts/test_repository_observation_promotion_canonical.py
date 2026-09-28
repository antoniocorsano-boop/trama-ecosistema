#!/usr/bin/env python3
import importlib.util,json,math,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location("canon",ROOT/"scripts/repository_observation_promotion_canonical.py")
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
a={"b":2,"a":1,"nested":{"z":"è","a":[3,2,1]}}
b={"nested":{"a":[3,2,1],"z":"è"},"a":1,"b":2}
assert m.canonical_json_bytes(a)==m.canonical_json_bytes(b)
assert m.sha256_canonical(a)==m.sha256_canonical(b)
d=m.sha256_canonical(a)
assert m.proposal_id(d)=="rop-"+d
p="f"*64
eid=m.promotion_event_id(d,p)
assert eid.startswith("rope-") and len(eid)==69
try:m.canonical_json_bytes({"x":float("nan")});raise AssertionError("NaN accepted")
except ValueError:pass
print("TRAMA_REPOSITORY_OBSERVATION_PROMOTION_CANONICAL_PASS")
