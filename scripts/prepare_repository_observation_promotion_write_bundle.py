#!/usr/bin/env python3
from __future__ import annotations
import argparse,importlib.util,json,sys
from datetime import datetime,timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def load_module(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    module=importlib.util.module_from_spec(spec)
    sys.modules[name]=module
    spec.loader.exec_module(module)
    return module

planner=load_module("promotion_planner_runtime","scripts/repository_observation_promotion_planner.py")
actor=load_module("promotion_actor_runtime","scripts/repository_observation_promotion_write_actor.py")
canon=load_module("promotion_canon_runtime","scripts/repository_observation_promotion_canonical.py")

def load(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

def now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00","Z")

def current_state():
    observation_path=ROOT/"control-center/data/repository-observation.json"
    if not observation_path.exists():
        return None,None
    observation=json.loads(observation_path.read_text(encoding="utf-8"))
    digest=canon.sha256_canonical(observation)
    events=load(Path("status/project-knowledge-events.json"))
    matches=[]
    for item in events.get("events",[]):
        pe=item.get("promotionEvent")
        if item.get("type")=="PROMOTION" and isinstance(pe,dict) and pe.get("observationDigest")==digest:
            matches.append(pe)
    if len(matches)!=1:
        raise RuntimeError("CURRENT_OBSERVATION_PROVENANCE_MISSING")
    return observation,{"sourceRunId":matches[0]["sourceRunId"],"promotionEventId":matches[0]["eventId"]}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--observation",required=True)
    ap.add_argument("--collector-summary",required=True)
    ap.add_argument("--base-exact-sha",required=True)
    ap.add_argument("--actor-exact-sha",required=True)
    ap.add_argument("--output",required=True)
    args=ap.parse_args()

    observation=load(Path(args.observation))
    summary=load(Path(args.collector_summary))
    if summary.get("result")!="CONSUMED" or summary.get("receiptState")!="CONSUMED":
        raise RuntimeError("COLLECTOR_RECEIPT_NOT_CONSUMED")
    if summary.get("exactSha")!=args.actor_exact_sha:
        raise RuntimeError("COLLECTOR_ACTOR_REVISION_MISMATCH")
    if args.base_exact_sha!=args.actor_exact_sha:
        raise RuntimeError("BASE_ACTOR_REVISION_MISMATCH")

    evidence={
        "receiptState":"CONSUMED",
        "sourceRunId":str(summary["runId"]),
        "sourceReceiptRef":summary["receiptRef"],
        "collectorExactSha":summary["exactSha"],
        "collectorIntegrated":summary.get("collectorIntegrated") is True,
    }
    enrollment=load(Path("config/repository-enrollment.json"))
    current,current_meta=current_state()
    result=planner.plan(observation,enrollment,evidence,current=current,current_meta=current_meta)
    proposal=result["proposal"]

    if proposal["state"]!="READY_FOR_HUMAN_REVIEW":
        print(json.dumps({
            "result":"NO_WRITE",
            "proposalId":proposal["proposalId"],
            "supersessionVerdict":proposal["supersessionVerdict"]
        },sort_keys=True))
        return

    recorded_at=now()
    bundle={
        "schemaVersion":"trama.repository-observation-promotion-write-bundle/v1",
        "targetRepository":actor.TARGET_REPOSITORY,
        "baseBranch":"main",
        "baseExactSha":args.base_exact_sha,
        "proposal":proposal,
        "candidateObservation":observation,
        "candidateSnapshot":result["candidateSnapshot"],
        "recordedAt":recorded_at,
        "recordedBy":"gha-dispatch-"+str(summary["runId"]),
        "sourceRefs":[
            "github-actions:workflow-run/"+str(summary["runId"]),
            "receipt:"+summary["receiptRef"]
        ]
    }
    event=actor.promotion_event(bundle,args.actor_exact_sha)
    wrapper=actor.knowledge_event_from_promotion(event,bundle)
    final_snapshot=actor.finalize_snapshot(bundle["candidateSnapshot"],wrapper,recorded_at)
    proposal["proposedChanges"]=[
        item if item["path"]!="control-center/data/project-context-snapshot.json"
        else {**item,"sha256":canon.sha256_canonical(final_snapshot)}
        for item in proposal["proposedChanges"]
    ]
    bundle["candidateSnapshot"]=final_snapshot
    actor.validate_bundle(bundle,args.actor_exact_sha)

    out=ROOT/args.output
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(bundle,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({
        "result":"READY_FOR_WRITE",
        "proposalId":proposal["proposalId"],
        "observationDigest":proposal["observationDigest"],
        "eventId":event["eventId"],
        "bundlePath":args.output
    },sort_keys=True))

if __name__=="__main__":
    main()
