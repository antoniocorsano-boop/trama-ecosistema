#!/usr/bin/env python3
import json
import sys
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
PATH=ROOT/"docs"/"pilots"/"trama-sa-01"/"r3-cases.json"
LABELS={"ALIGNED","PARTIAL","CONTRADICTORY","INSUFFICIENT_EVIDENCE"}

def validate_corpus(c):
    errors=[]
    cases=c.get("cases",[])
    if len(cases)!=48: errors.append(f"expected 48 cases, got {len(cases)}")
    ids=[x.get("id") for x in cases]
    if len(set(ids))!=48: errors.append("case IDs must be unique")
    counts=Counter(x.get("expectedSemanticLabel") for x in cases)
    for label in LABELS:
        if counts[label]!=12: errors.append(f"{label}: expected 12, got {counts[label]}")
    split=c.get("splitPolicy",{})
    dev=split.get("developmentCaseIds",[])
    hold=split.get("holdoutCaseIds",[])
    if len(dev)!=32 or len(hold)!=16: errors.append("split must be 32 development / 16 holdout")
    if set(dev)&set(hold): errors.append("development and holdout overlap")
    if set(dev)|set(hold)!=set(ids): errors.append("split does not cover corpus exactly")
    if split.get("holdoutLocked") is not True: errors.append("holdoutLocked must be true")
    p=c.get("policy",{})
    for key,val in {"advisoryOnly":True,"personalDataAllowed":False,"providerRuntimeWritesAllowed":False,"humanReviewRequiredForEverySemanticCase":True,"thresholdsPrecalibrated":False}.items():
        if p.get(key) is not val: errors.append(f"policy.{key} invalid")
    required={"manifestVersion","curriculumRef","curriculumVersionRef","authorityState","authorityReceiptRef","title","summary","rightsStatus","accessibilityStatus"}
    forbidden={"studentIdentifier","studentName","studentEmail","personId","familyName"}
    for x in cases:
        m=x.get("manifest",{}); e=x.get("evidence",{})
        miss=required-{k for k,v in m.items() if v}
        if miss: errors.append(f"{x.get('id')}: missing {sorted(miss)}")
        if forbidden & set(m): errors.append(f"{x.get('id')}: personal context forbidden")
        if not e.get("objective"): errors.append(f"{x.get('id')}: objective required")
        if m.get("authorityState")!="APPROVED": errors.append(f"{x.get('id')}: authorityState")
        if x.get("expectedStage")!="SEMANTIC_REVIEW": errors.append(f"{x.get('id')}: semantic stage required")
    return errors

def main():
    c=json.loads(PATH.read_text(encoding="utf-8"))
    errors=validate_corpus(c)
    if errors:
        print("\n".join("ERROR: "+e for e in errors)); return 1
    print("TRAMA-SA-01/R3 corpus validation: PASS (48 semantic; 32 development; 16 locked holdout; 12/label)")
    return 0
if __name__=="__main__": sys.exit(main())
