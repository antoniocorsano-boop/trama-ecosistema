#!/usr/bin/env python3
import json
import sys
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
PATH=ROOT/"docs"/"pilots"/"trama-sa-01"/"r3b-cases.json"
LABELS=("ALIGNED","PARTIAL","CONTRADICTORY","INSUFFICIENT_EVIDENCE")

def validate_corpus(c):
    errors=[]
    cases=c.get("cases",[])
    ids=[x.get("id") for x in cases]
    if len(cases)!=48: errors.append(f"expected 48 cases, got {len(cases)}")
    if len(ids)!=len(set(ids)): errors.append("case IDs must be unique")
    if c.get("preregistered") is not True: errors.append("preregistered must be true")
    if c.get("provenance",{}).get("reusesObservedR3Cases") is not False:
        errors.append("R3B must not reuse observed R3 cases")

    total=Counter(x.get("expectedSemanticLabel") for x in cases)
    for label in LABELS:
        if total[label]!=12: errors.append(f"{label}: expected 12 total, got {total[label]}")

    split=c.get("splitPolicy",{})
    dev=split.get("developmentCaseIds",[])
    hold=split.get("holdoutCaseIds",[])
    if len(dev)!=32 or len(hold)!=16: errors.append("split must be 32 development / 16 holdout")
    if set(dev)&set(hold): errors.append("development and holdout overlap")
    if set(dev)|set(hold)!=set(ids): errors.append("split does not cover corpus exactly")
    if split.get("holdoutLocked") is not True: errors.append("holdoutLocked must be true")
    if split.get("holdoutAuthorizationRequired") is not True: errors.append("holdout authorization must be required")
    if split.get("tuningOnHoldoutAllowed") is not False: errors.append("holdout tuning must be false")
    if split.get("stratified") is not True: errors.append("split must be stratified")

    by_id={x["id"]:x for x in cases}
    for label in LABELS:
        dev_n=sum(by_id[i]["expectedSemanticLabel"]==label for i in dev)
        hold_n=sum(by_id[i]["expectedSemanticLabel"]==label for i in hold)
        if dev_n!=8: errors.append(f"{label}: expected 8 development, got {dev_n}")
        if hold_n!=4: errors.append(f"{label}: expected 4 holdout, got {hold_n}")

    p=c.get("policy",{})
    for key,val in {
        "advisoryOnly":True,
        "personalDataAllowed":False,
        "providerRuntimeWritesAllowed":False,
        "humanReviewRequiredForEverySemanticCase":True,
        "thresholdsPrecalibrated":False,
    }.items():
        if p.get(key) is not val: errors.append(f"policy.{key} invalid")

    required={"manifestVersion","curriculumRef","curriculumVersionRef","authorityState","authorityReceiptRef","title","summary","rightsStatus","accessibilityStatus"}
    forbidden={"studentIdentifier","studentName","studentEmail","personId","familyName"}
    for x in cases:
        m=x.get("manifest",{}); e=x.get("evidence",{})
        missing=required-{k for k,v in m.items() if v}
        if missing: errors.append(f"{x.get('id')}: missing {sorted(missing)}")
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
    print("TRAMA-SA-01/R3B corpus validation: PASS (48 new cases; DEVELOPMENT 8/label; HOLDOUT 4/label; holdout locked)")
    return 0

if __name__=="__main__":
    sys.exit(main())
