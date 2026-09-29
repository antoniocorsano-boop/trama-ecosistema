#!/usr/bin/env python3
from __future__ import annotations
import argparse, json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def load(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

def text_of(value):
    return json.dumps(value,ensure_ascii=False).lower()

def select(items,subject):
    q=subject.lower()
    return [item for item in items if q in text_of(item)]

def source_refs(items):
    out=[]
    seen=set()
    for item in items:
        if not isinstance(item,dict):
            continue
        for ref in item.get("sourceRefs",[]):
            key=json.dumps(ref,sort_keys=True,ensure_ascii=False)
            if key not in seen:
                seen.add(key)
                out.append(ref)
    return out

def _effective_envelope(effective_context):
    if effective_context is None:
        return None
    if effective_context.get("schemaVersion")!="trama.effective-project-context/v1":
        raise RuntimeError("EFFECTIVE_CONTEXT_IDENTITY_INVALID")
    return {
      "governedAsOf":effective_context["governedAsOf"],
      "liveObservedAt":effective_context.get("liveObservedAt"),
      "governedKnowledgeStatus":effective_context["governedKnowledgeStatus"],
      "liveObservationStatus":effective_context["liveObservationStatus"],
      "semanticDriftStatus":effective_context["semanticDriftStatus"],
      "effectiveContextStatus":effective_context["effectiveContextStatus"],
      "promotionRequired":bool(effective_context["promotionRequired"]),
      "liveFacts":[x for x in effective_context.get("facts",[]) if x.get("class") in {"VOLATILE","BOUNDARY_SIGNAL"}],
      "sourceRefs":list(effective_context.get("sourceRefs",[]))
    }

def build(subject,snapshot,effective_context=None):
    events=select(snapshot.get("knowledgeEvents",[]),subject)
    caps=select(snapshot.get("activeCapabilities",[]),subject)
    completed=select(snapshot.get("recentlyCompleted",[]),subject)
    decisions=select(snapshot.get("canonicalDecisions",[]),subject)
    invariants=select(snapshot.get("activeInvariants",[]),subject)
    heads=select(snapshot.get("activeExactHeads",[]),subject)
    gates=select(snapshot.get("blockingGates",[]),subject)
    deps=select(snapshot.get("dependencies",[]),subject)
    rejected=select(snapshot.get("knownRejectedApproaches",[]),subject)
    conflicts=select(snapshot.get("knownConflicts",[]),subject)
    actions=select(snapshot.get("nextCandidateActions",[]),subject)
    refs=source_refs(events+decisions+invariants+rejected)
    refs += [{"snapshotSource":x["path"],"sha256":x["sha256"]} for x in snapshot.get("knowledgeSources",[])]
    effective=_effective_envelope(effective_context)
    status=snapshot["status"]
    if effective is not None and effective["effectiveContextStatus"]!="USABLE":
        status="PARTIAL"
    result={
      "schemaVersion":"1.0.0",
      "subject":subject,
      "asOf":snapshot["generatedAt"],
      "status":status,
      "facts":caps+completed+events,
      "decisions":decisions,
      "activeInvariants":invariants,
      "evidence":events,
      "exactHeads":heads,
      "blockingGates":gates,
      "dependencies":deps,
      "knownConflicts":conflicts,
      "knownRejectedApproaches":rejected,
      "nextCandidateActions":actions,
      "sourceRefs":refs
    }
    if effective is not None:
        result["effectiveContext"]=effective
    return result

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("subject")
    ap.add_argument("--snapshot",default="control-center/data/project-context-snapshot.json")
    ap.add_argument("--output")
    ap.add_argument("--effective-context")
    args=ap.parse_args()
    snapshot=load(Path(args.snapshot))
    effective=load(Path(args.effective_context)) if args.effective_context else None
    pack=build(args.subject,snapshot,effective)
    body=json.dumps(pack,ensure_ascii=False,indent=2)+"\n"
    if args.output:
        out=ROOT/args.output
        out.parent.mkdir(parents=True,exist_ok=True)
        out.write_text(body,encoding="utf-8")
        print(out)
    else:
        print(body,end="")

if __name__=="__main__":
    main()
