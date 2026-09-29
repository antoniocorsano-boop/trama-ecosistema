#!/usr/bin/env python3
from __future__ import annotations
import importlib.util,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("canon",ROOT/"scripts/repository_observation_promotion_canonical.py")
c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)

def load(path): return json.loads((ROOT/path).read_text(encoding="utf-8"))

def validate_proposal(p):
    if p["proposalId"] != c.proposal_id(p["observationDigest"]):
        raise RuntimeError("PROPOSAL_ID_BINDING_MISMATCH")
    if p["validationVerdict"]=="FAIL" and p["state"]=="READY_FOR_HUMAN_REVIEW":
        raise RuntimeError("FAILED_PROPOSAL_READY_FOR_REVIEW")
    if p["supersessionVerdict"] in {"NO_OP_ALREADY_PROMOTED","NO_OP_SEMANTIC_EQUIVALENT","OLDER_THAN_CURRENT","CONFLICT"} and p["state"]=="READY_FOR_HUMAN_REVIEW":
        raise RuntimeError("NON_PROMOTABLE_PROPOSAL_READY_FOR_REVIEW")
    return True

def validate_event(e):
    expected=c.promotion_event_id(e["observationDigest"],e["promotionPolicyDigest"])
    if e["eventId"] != expected:
        raise RuntimeError("EVENT_ID_BINDING_MISMATCH")
    if e["proposalId"] != c.proposal_id(e["observationDigest"]):
        raise RuntimeError("EVENT_PROPOSAL_BINDING_MISMATCH")
    if e["result"]!="PROMOTED":
        raise RuntimeError("EVENT_RESULT_INVALID")
    return True

p=load("control-center/fixtures/project-knowledge/repository-observation-promotion-proposal-valid.json")
e=load("control-center/fixtures/project-knowledge/repository-observation-promotion-event-valid.json")
assert validate_proposal(p)
assert validate_event(e)

bad=dict(p);bad["proposalId"]="rop-"+"0"*64
try: validate_proposal(bad); raise AssertionError("bad proposal binding accepted")
except RuntimeError as x: assert str(x)=="PROPOSAL_ID_BINDING_MISMATCH"

bad=dict(p);bad["state"]="READY_FOR_HUMAN_REVIEW";bad["validationVerdict"]="FAIL"
try: validate_proposal(bad); raise AssertionError("failed proposal accepted")
except RuntimeError as x: assert str(x)=="FAILED_PROPOSAL_READY_FOR_REVIEW"

bad=dict(e);bad["eventId"]="rope-"+"0"*64
try: validate_event(bad); raise AssertionError("bad event binding accepted")
except RuntimeError as x: assert str(x)=="EVENT_ID_BINDING_MISMATCH"

print("TRAMA_REPOSITORY_OBSERVATION_PROMOTION_SEMANTIC_BINDING_PASS")
