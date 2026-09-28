#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def load(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

def digest(path):
    return hashlib.sha256((ROOT/path).read_bytes()).hexdigest()

def now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00","Z")

def source_ref(item):
    p=Path(item["path"])
    return {"id":item["id"],"path":item["path"],"role":item["role"],"sha256":digest(p)}

def repo_ref(authority):
    return {"TRAMA":"trama-ecosistema","Arena":"CurManLight_arena","Atlas":"Curriculum-Atlas","Docente OS":"docente-os-2026-27"}.get(authority,authority)

def build():
    cfg=load(Path("config/project-context-sources.json"))
    missing=[x["path"] for x in cfg["requiredSources"] if not (ROOT/x["path"]).exists()]
    if missing:
        raise RuntimeError("missing required source(s): "+", ".join(missing))
    eco=load(Path("control-center/data/ecosystem-snapshot.json"))
    decisions=load(Path("docs/decisions/decision-register.json"))
    knowledge=load(Path("status/project-knowledge-events.json"))
    source_registry=load(Path("docs/knowledge/source-registry.json"))
    generated=now()

    phases=eco.get("phases",[])
    current_phase=next((p for p in phases if p.get("status") not in {"COMPLETE","CLOSED","PASS"}), phases[-1] if phases else None)
    caps=eco.get("capabilities",[])
    active=[c for c in caps if c.get("state") not in {"CLOSED","COMPLETE"}]
    completed=[c for c in caps if c.get("state") in {"CLOSED","COMPLETE"}]
    canonical_decisions=[d for d in decisions.get("decisions",[]) if d.get("status") in {"APPROVED","PROPOSED"}]
    blocking=[g for g in eco.get("gates",[]) if g.get("blocking") and g.get("status")!="PASS"]
    pending_reviews=[c for c in caps if c.get("humanReview") not in {None,"PASS","NOT_REQUIRED"}]

    events=knowledge.get("events",[])
    invariants=[e for e in events if e.get("status")=="CURRENT" and e.get("type") in {"CONSTRAINT","DECISION"}]
    rejected=[e for e in events if e.get("status") in {"CURRENT","REJECTED"} and e.get("type") in {"REJECTION","FAILURE_LEARNING"}]
    exact_heads=[]
    for event in events:
        for src in event.get("sourceRefs",[]):
            if src.get("exactHead"):
                exact_heads.append({"subject":event.get("subject"),"repository":src.get("repository"),"pullRequest":src.get("pullRequest"),"exactHead":src.get("exactHead"),"sourceEvent":event.get("eventId")})

    authorities=sorted({s.get("authority") for s in source_registry.get("sources",[]) if s.get("authority")})
    repositories=[{"authority":a,"repositoryRef":repo_ref(a)} for a in authorities]

    # Remote PR/workflow collection is not yet version-bound in this slice.
    # Therefore the projection is explicitly PARTIAL rather than synthetic.
    return {
      "schemaVersion":"1.0.0",
      "generatedAt":generated,
      "project":"TRAMA",
      "status":"PARTIAL",
      "currentPhase":current_phase,
      "activeCapabilities":active,
      "canonicalDecisions":canonical_decisions,
      "activeInvariants":invariants,
      "repositories":repositories,
      "openPullRequests":[],
      "activeExactHeads":exact_heads,
      "blockingGates":blocking,
      "pendingHumanReviews":pending_reviews,
      "dependencies":eco.get("dependencies",[]),
      "knownConflicts":[],
      "recentlyCompleted":completed,
      "knownRejectedApproaches":rejected,
      "nextCandidateActions":[],
      "knowledgeEvents":events,
      "knowledgeSources":[source_ref(x) for x in cfg["requiredSources"]]
    }

def validate(snapshot):
    required={"schemaVersion","generatedAt","project","status","currentPhase","activeCapabilities","canonicalDecisions","activeInvariants","repositories","openPullRequests","activeExactHeads","blockingGates","pendingHumanReviews","dependencies","knownConflicts","recentlyCompleted","knownRejectedApproaches","nextCandidateActions","knowledgeEvents","knowledgeSources"}
    missing=required-set(snapshot)
    if missing:
        raise RuntimeError("missing snapshot fields: "+",".join(sorted(missing)))
    if snapshot["project"]!="TRAMA" or snapshot["schemaVersion"]!="1.0.0":
        raise RuntimeError("invalid snapshot identity")
    if not snapshot["knowledgeSources"]:
        raise RuntimeError("knowledgeSources empty")
    for event in snapshot["knowledgeEvents"]:
        if not event.get("sourceRefs"):
            raise RuntimeError("knowledge event without sourceRefs: "+str(event.get("eventId")))

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--output",default="control-center/data/project-context-snapshot.json")
    ap.add_argument("--check",action="store_true")
    args=ap.parse_args()
    snapshot=build()
    validate(snapshot)
    if args.check:
        print("TRAMA_PROJECT_CONTEXT_SNAPSHOT_CHECK_PASS")
        return
    out=ROOT/args.output
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(snapshot,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(out)

if __name__=="__main__":
    main()
