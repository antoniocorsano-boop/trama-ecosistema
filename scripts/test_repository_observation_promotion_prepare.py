#!/usr/bin/env python3
import importlib.util,json,sys,tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def load(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    module=importlib.util.module_from_spec(spec)
    sys.modules[name]=module
    spec.loader.exec_module(module)
    return module

prep=load("promotion_prepare_test","scripts/prepare_repository_observation_promotion_write_bundle.py")
actor=load("promotion_actor_test_activation","scripts/repository_observation_promotion_write_actor.py")
canon=load("promotion_canon_test_activation","scripts/repository_observation_promotion_canonical.py")

enrollment=json.loads((ROOT/"config/repository-enrollment.json").read_text(encoding="utf-8"))
repos=[]
for idx,item in enumerate([x for x in enrollment["repositories"] if x["state"]=="ENROLLED"],1):
    repos.append({
        "repository":item["repository"],
        "enrollmentRef":item["id"],
        "availabilityStatus":"AVAILABLE",
        "freshnessStatus":"FRESH",
        "completenessStatus":"COMPLETE",
        "observedHead":format(idx,"040x"),
        "sourceRefs":["fixture:"+item["id"]]
    })

observation={
    "schemaVersion":"trama.repository-observation/v1",
    "collectionId":"activation-fixture",
    "observedAt":"2026-09-29T04:00:00Z",
    "status":"COMPLETE",
    "repositories":repos,
    "pullRequests":[],
    "sourceRefs":["fixture:activation"]
}
exact="7"*40
summary={
    "result":"CONSUMED",
    "receiptState":"CONSUMED",
    "receiptRef":"gha-dispatch-123--gha-123",
    "runId":"123",
    "exactSha":exact,
    "repositoryCount":len(repos),
    "openPullRequestCount":0,
    "observationStatus":"COMPLETE",
    "collectorIntegrated":True
}

with tempfile.TemporaryDirectory() as td:
    td=Path(td)
    obs=td/"obs.json"; sm=td/"summary.json"; out=td/"bundle.json"
    obs.write_text(json.dumps(observation),encoding="utf-8")
    sm.write_text(json.dumps(summary),encoding="utf-8")
    prep.current_state=lambda:(None,None)
    prep.now=lambda:"2026-09-29T04:01:00Z"
    sys.argv=[
        "prepare",
        "--observation",str(obs),
        "--collector-summary",str(sm),
        "--base-exact-sha",exact,
        "--actor-exact-sha",exact,
        "--output",str(out),
    ]
    prep.main()
    bundle=json.loads(out.read_text(encoding="utf-8"))

assert bundle["recordedAt"]=="2026-09-29T04:01:00Z"
assert bundle["recordedBy"]=="gha-dispatch-123"
assert bundle["baseExactSha"]==exact
assert bundle["proposal"]["state"]=="READY_FOR_HUMAN_REVIEW"
assert actor.validate_bundle(bundle,exact)
expected_digest=canon.sha256_canonical(observation)
promotion_events=[
    x for x in bundle["candidateSnapshot"]["knowledgeEvents"]
    if x.get("type")=="PROMOTION"
    and (x.get("promotionEvent") or {}).get("observationDigest")==expected_digest
]
assert len(promotion_events)==1
assert promotion_events[0]["promotionEvent"]["observationDigest"]==expected_digest
assert bundle["candidateSnapshot"]["generatedAt"]==bundle["recordedAt"]
snapshot_change=next(x for x in bundle["proposal"]["proposedChanges"] if x["path"]=="control-center/data/project-context-snapshot.json")
assert snapshot_change["sha256"]==canon.sha256_canonical(bundle["candidateSnapshot"])

print("TRAMA_REPOSITORY_OBSERVATION_PROMOTION_PREPARE_PASS")
