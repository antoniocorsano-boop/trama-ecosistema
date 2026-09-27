#!/usr/bin/env python3
import argparse, json, sys
from pathlib import Path

PREFIXES = {"entities":"entity:","workstreams":"workstream:","relations":"relation:","decisions":"decision:","transitions":"transition:","repositoryEnrollment":"enrollment:","attentionRequired":"attention:","collisionCandidates":"collision:"}
AUTH_FIELDS = {"AUTHORIZED","ALLOWED","APPROVED"}

class ValidationError(Exception): pass

def fail(code, detail=""):
    raise ValidationError(code + (":" + detail if detail else ""))

def objects(snapshot):
    out=[]
    for group,prefix in PREFIXES.items():
        for obj in snapshot.get(group,[]): out.append((group,obj,prefix))
    for group in ("gates","evidence"):
        for obj in snapshot.get(group,[]):
            if isinstance(obj,dict) and obj.get("id"): out.append((group,obj,None))
    return out

def validate(snapshot):
    all_objs=objects(snapshot); by_id={}
    for group,obj,prefix in all_objs:
        oid=obj.get("id")
        if not oid: fail("MISSING_ID",group)
        if oid in by_id: fail("DUPLICATE_ID",oid)
        if prefix and not oid.startswith(prefix): fail("ID_NAMESPACE",oid)
        by_id[oid]=(group,obj)

    def require_ref(ref, subject, authorization=False):
        if ref not in by_id:
            if authorization: fail("DANGLING_REF",f"{subject}->{ref}")
            return False
        return True

    # Material assertions must carry provenance.
    for group,obj,_ in all_objs:
        if group in PREFIXES and group not in ("attentionRequired",):
            if "sourceRefs" in obj and not obj.get("sourceRefs"):
                fail("UNSUPPORTED_ASSERTION",obj["id"])

    # Resolve typed references that bear governance semantics.
    for w in snapshot.get("workstreams",[]):
        for ref in w.get("entityRefs",[]):
            require_ref(ref,w["id"],w.get("runtimeAuthorization") in AUTH_FIELDS)
            if ref in by_id and by_id[ref][0] != "entities": fail("REF_KIND_MISMATCH",ref)
        for ref in w.get("nextTransitionRefs",[]):
            require_ref(ref,w["id"],True)
            if ref in by_id and by_id[ref][0] != "transitions": fail("REF_KIND_MISMATCH",ref)
        if w.get("exactHead") and w.get("observedHead") and w["exactHead"] != w["observedHead"]:
            if not has_attention(snapshot,"HEAD_MISMATCH",w["id"]): fail("HEAD_MISMATCH_UNFLAGGED",w["id"])

    for t in snapshot.get("transitions",[]):
        require_ref(t["subjectRef"],t["id"],t.get("status")=="ALLOWED")
        if t.get("status")=="ALLOWED":
            if not t.get("sourceRefs") or not t.get("evidenceRefs"): fail("TRANSITION_AUTHORITY_MISSING",t["id"])
            for ref in t.get("gateRefs",[]):
                require_ref(ref,t["id"],True)
                if ref in by_id and by_id[ref][0] != "gates": fail("REF_KIND_MISMATCH",ref)
                gate=by_id.get(ref,(None,{}))[1]
                if gate and str(gate.get("status",gate.get("state",""))).upper() not in ("PASS","PASSED","SUCCESS"):
                    fail("BLOCKING_GATE_NOT_PASS",ref)

    for d in snapshot.get("decisions",[]):
        if d.get("state")=="APPROVED" and (not d.get("authority") or not d.get("evidenceRefs") or not d.get("sourceRefs")):
            fail("UNPROVEN_APPROVAL",d["id"])

    # DOS-A1 fail-closed.
    for w in snapshot.get("workstreams",[]):
        if "DOS-A1" in json.dumps(w,sort_keys=True) and w.get("runtimeAuthorization")=="AUTHORIZED":
            approved=False
            for d in snapshot.get("decisions",[]):
                if d.get("state")=="APPROVED" and w["id"] in d.get("subjectRefs",[]) and d.get("authority") and d.get("evidenceRefs") and d.get("sourceRefs"): approved=True
            if not approved: fail("DOS_A1_UNAUTHORIZED",w["id"])

    # Attention semantic deduplication.
    seen=set()
    for a in snapshot.get("attentionRequired",[]):
        if a.get("status") in ("OPEN","UNKNOWN"):
            key=(a.get("reasonCode"),tuple(sorted(a.get("subjectRefs",[]))))
            if key in seen: fail("ATTENTION_DUPLICATE",str(key))
            seen.add(key)

    # Collision C03 must have provenance; no text heuristic.
    for c in snapshot.get("collisionCandidates",[]):
        if c.get("ruleId")=="C03_INCOMPATIBLE_TRANSITION" and (not c.get("sourceRefs") or not c.get("evidenceRefs")):
            fail("C03_AUTHORITY_MISSING",c["id"])

    return "PASS"

def has_attention(snapshot,reason,subject):
    return any(a.get("reasonCode")==reason and subject in a.get("subjectRefs",[]) and a.get("status") in ("OPEN","UNKNOWN") for a in snapshot.get("attentionRequired",[]))

def backward_projection(candidate, baseline):
    additive=set(PREFIXES)
    projected={k:v for k,v in candidate.items() if k not in additive}
    if projected != baseline: fail("BACKWARD_SEMANTIC_BREAK")

def run_fixture(path):
    fx=json.loads(Path(path).read_text(encoding="utf-8")); expected=fx["expected"]
    try:
        if fx.get("mode")=="backward": backward_projection(fx["candidate"],fx["baseline"])
        else: validate(fx["snapshot"])
        actual="PASS"
    except ValidationError as e: actual=str(e).split(":",1)[0]
    if actual != expected: fail("FIXTURE_EXPECTATION",f"expected={expected},actual={actual}")
    return actual

def main():
    p=argparse.ArgumentParser(); p.add_argument("path",nargs="?"); p.add_argument("--fixture")
    a=p.parse_args()
    try:
        if a.fixture: print(run_fixture(a.fixture))
        else:
            if not a.path: fail("INPUT_REQUIRED")
            print(validate(json.loads(Path(a.path).read_text(encoding="utf-8"))))
    except ValidationError as e:
        print(str(e),file=sys.stderr); return 1
    return 0
if __name__=="__main__": raise SystemExit(main())
