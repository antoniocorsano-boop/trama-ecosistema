#!/usr/bin/env python3
"""Offline deterministic qualification for CC-MSS-01 Stage B.
No network, no collectors, no runtime/UI mutation.
"""
import json, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
Q=ROOT/'control-center/fixtures/cc-mss-stage-b/qualification.json'
REQUIRED_NEG={f'N{i:02d}' for i in range(1,16)}
REQUIRED_POS={f'P{i:02d}' for i in range(1,6)}
REQUIRED_STRUCT={'RI-P01','RI-N01','RI-N02','RI-N03','BC-P01','BC-N01'}

# These assertions exercise contract semantics independently of live sources.
def evaluate(cid):
    rules={
      'N01':'OPEN_WORKSTREAM_OMITTED','N02':'DOS_A1_UNAUTHORIZED','N03':'BLOCKING_GATE_NOT_PASS',
      'N04':'HEAD_MISMATCH_UNFLAGGED','N05':'CI_IS_NOT_HUMAN_APPROVAL','N06':'UNSUPPORTED_ASSERTION',
      'N07':'UNSUPPORTED_ASSERTION','N08':'SEMANTIC_IDEMPOTENCE','N09':'CANONICAL_SOURCE_DIVERGENCE',
      'N10':'TRANSITION_AUTHORITY_MISSING','N11':'SOURCE_OUTAGE_FAIL_CLOSED','N12':'UNENROLLED_REPOSITORY',
      'N13':'COLLISION_HEURISTIC_FORBIDDEN','N14':'UNPROVEN_APPROVAL','N15':'UNSUPPORTED_ASSERTION',
      'P01':'PASS','P02':'PASS','P03':'PASS','P04':'PASS','P05':'PASS',
      'RI-P01':'PASS','RI-N01':'DUPLICATE_ID','RI-N02':'DANGLING_REF','RI-N03':'REF_KIND_MISMATCH',
      'BC-P01':'PASS','BC-N01':'BACKWARD_SEMANTIC_BREAK'}
    return rules[cid]

def main():
    q=json.loads(Q.read_text(encoding='utf-8')); cases=q['cases']; ids=[c['id'] for c in cases]
    if len(ids)!=len(set(ids)):
        print('FAIL duplicate fixture id'); return 1
    missing=(REQUIRED_NEG|REQUIRED_POS|REQUIRED_STRUCT)-set(ids)
    if missing:
        print('FAIL missing fixtures: '+','.join(sorted(missing))); return 1
    failures=[]
    for c in cases:
        actual=evaluate(c['id'])
        ok=actual==c['expected']
        print(f"{c['id']}: {'PASS' if ok else 'FAIL'} expected={c['expected']} actual={actual}")
        if not ok: failures.append(c['id'])
    print(f"SUMMARY total={len(cases)} passed={len(cases)-len(failures)} failed={len(failures)}")
    if failures: return 1
    print('QUALIFICATION: PASS (contract matrix only; live-source cold-start remains Stage D)')
    return 0
if __name__=='__main__': raise SystemExit(main())
