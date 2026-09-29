#!/usr/bin/env python3
from __future__ import annotations
import importlib.util,json
from datetime import datetime,timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def load_module(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

canon=load_module("promotion_canon","scripts/repository_observation_promotion_canonical.py")
snapshot_builder=load_module("snapshot_builder","scripts/build_project_context_snapshot.py")

POLICY_VERSION="1.0.0"
POLICY={
  "requiredReceiptState":"CONSUMED",
  "requiredObservationStatus":"COMPLETE",
  "requireExactEnrollment":True,
  "allowPartialPromotion":False,
  "semanticIdentity":["repositoryHeads","openPullRequests"],
  "olderCandidate":"REJECT",
  "sameDigest":"NO_OP_ALREADY_PROMOTED",
  "sameSemanticState":"NO_OP_SEMANTIC_EQUIVALENT"
}

class PlannerError(RuntimeError): pass
def die(code): raise PlannerError(code)

def parse_time(v):
    try:d=datetime.fromisoformat(v.replace("Z","+00:00"))
    except Exception:die("OBSERVED_AT_INVALID")
    if d.tzinfo is None or d.utcoffset() is None:die("OBSERVED_AT_INVALID")
    return d.astimezone(timezone.utc)

def enrolled_repositories(enrollment):
    return tuple(x["repository"] for x in enrollment.get("repositories",[]) if x.get("state")=="ENROLLED")

def validate_admission(observation,enrollment,evidence):
    if evidence.get("receiptState")!="CONSUMED":die("RECEIPT_NOT_CONSUMED")
    if observation.get("status")!="COMPLETE":die("OBSERVATION_NOT_COMPLETE")
    repos=observation.get("repositories",[])
    names=[x.get("repository") for x in repos]
    expected=list(enrolled_repositories(enrollment))
    if len(names)!=len(set(names)):die("DUPLICATE_REPOSITORY")
    if sorted(names)!=sorted(expected):die("ENROLLMENT_MISMATCH")
    by_name={x["repository"]:x for x in repos}
    enrollment_by_repo={x["repository"]:x for x in enrollment["repositories"] if x.get("state")=="ENROLLED"}
    for name in expected:
        r=by_name[name];e=enrollment_by_repo[name]
        if r.get("enrollmentRef")!=e.get("id"):die("ENROLLMENT_REF_MISMATCH")
        if r.get("availabilityStatus")!="AVAILABLE" or r.get("freshnessStatus")!="FRESH" or r.get("completenessStatus")!="COMPLETE":die("REPOSITORY_NOT_CURRENT")
        sha=r.get("observedHead")
        if not isinstance(sha,str) or len(sha)!=40 or any(c not in "0123456789abcdef" for c in sha):die("REPOSITORY_HEAD_INVALID")
    if not str(evidence.get("sourceRunId","")).isdigit():die("SOURCE_RUN_ID_INVALID")
    if not evidence.get("sourceReceiptRef"):die("SOURCE_RECEIPT_REF_MISSING")
    sha=evidence.get("collectorExactSha")
    if not isinstance(sha,str) or len(sha)!=40 or any(c not in "0123456789abcdef" for c in sha):die("COLLECTOR_SHA_INVALID")
    if evidence.get("collectorIntegrated") is not True:die("COLLECTOR_NOT_INTEGRATED")
    return True

def semantic_state(observation):
    repos=tuple(sorted((x["repository"],x["observedHead"]) for x in observation.get("repositories",[])))
    prs=tuple(sorted((x["repository"],x["number"],x["observedHead"],bool(x["draft"])) for x in observation.get("pullRequests",[]) if x.get("state")=="OPEN" and not x.get("merged")))
    return {"repositories":repos,"openPullRequests":prs}

def determine_supersession(candidate,current,current_meta=None,evidence=None):
    if current is None:return "NEW_STATE"
    cd=canon.sha256_canonical(candidate);pd=canon.sha256_canonical(current)
    if cd==pd:return "NO_OP_ALREADY_PROMOTED"
    if current_meta and evidence and str(current_meta.get("sourceRunId"))==str(evidence.get("sourceRunId")):
        die("SAME_RUN_DIFFERENT_DIGEST")
    if parse_time(candidate["observedAt"]) < parse_time(current["observedAt"]):return "OLDER_THAN_CURRENT"
    if semantic_state(candidate)==semantic_state(current):return "NO_OP_SEMANTIC_EQUIVALENT"
    return "NEW_STATE"

def change_summary(candidate,current):
    cur_repos={x["repository"]:x["observedHead"] for x in (current or {}).get("repositories",[])}
    cand_repos={x["repository"]:x["observedHead"] for x in candidate.get("repositories",[])}
    changed_repositories=sorted(k for k,v in cand_repos.items() if cur_repos.get(k)!=v)
    def prs(obs):
        return {(x["repository"],x["number"]):(x["observedHead"],bool(x["draft"])) for x in (obs or {}).get("pullRequests",[]) if x.get("state")=="OPEN" and not x.get("merged")}
    cp,pp=prs(candidate),prs(current)
    added=sorted([{"repository":k[0],"number":k[1]} for k in cp.keys()-pp.keys()],key=lambda x:(x["repository"],x["number"]))
    removed=sorted([{"repository":k[0],"number":k[1]} for k in pp.keys()-cp.keys()],key=lambda x:(x["repository"],x["number"]))
    changed=sorted([{"repository":k[0],"number":k[1]} for k in cp.keys()&pp.keys() if cp[k]!=pp[k]],key=lambda x:(x["repository"],x["number"]))
    return {"changedRepositories":changed_repositories,"addedOpenPullRequests":added,"removedOpenPullRequests":removed,"changedOpenPullRequests":changed}

def plan(candidate,enrollment,evidence,current=None,current_meta=None):
    validate_admission(candidate,enrollment,evidence)
    observation_digest=canon.sha256_canonical(candidate)
    enrollment_digest=canon.sha256_canonical(enrollment)
    policy_digest=canon.sha256_canonical(POLICY)
    verdict=determine_supersession(candidate,current,current_meta,evidence)
    promotable=verdict=="NEW_STATE"
    snapshot=snapshot_builder.build(repository_observation_data=candidate,generated_at=candidate["observedAt"])
    snapshot_builder.validate(snapshot)
    snapshot_digest=canon.sha256_canonical(snapshot)
    previous_digest=canon.sha256_canonical(current) if current is not None else None
    action="CREATE" if current is None else ("UPDATE" if promotable else "NO_OP")
    proposal={
      "schemaVersion":"trama.repository-observation-promotion-proposal/v1",
      "proposalId":canon.proposal_id(observation_digest),
      "state":"READY_FOR_HUMAN_REVIEW" if promotable else "REJECTED",
      "observationDigest":observation_digest,
      "sourceRunId":str(evidence["sourceRunId"]),
      "sourceReceiptRef":evidence["sourceReceiptRef"],
      "collectorExactSha":evidence["collectorExactSha"],
      "promotionPolicyVersion":POLICY_VERSION,
      "promotionPolicyDigest":policy_digest,
      "repositoryEnrollmentDigest":enrollment_digest,
      "previousObservationDigest":previous_digest,
      "candidateObservedAt":candidate["observedAt"],
      "candidateRepositories":[{"repository":r["repository"],"observedHead":r["observedHead"]} for r in sorted(candidate["repositories"],key=lambda x:x["repository"])],
      "candidateOpenPullRequests":[{"repository":p["repository"],"number":p["number"],"observedHead":p["observedHead"],"draft":bool(p["draft"])} for p in sorted(candidate.get("pullRequests",[]),key=lambda x:(x["repository"],x["number"])) if p.get("state")=="OPEN" and not p.get("merged")],
      "validationVerdict":"PASS",
      "supersessionVerdict":verdict,
      "proposedChanges":[
        {"path":"control-center/data/repository-observation.json","action":action,"sha256":observation_digest if promotable else None},
        {"path":"control-center/data/project-context-snapshot.json","action":action,"sha256":snapshot_digest if promotable else None},
        {"path":"status/project-knowledge-events.json","action":"UPDATE" if promotable else "NO_OP","sha256":None}
      ],
      "sourceRefs":[f"github-actions:workflow-run/{evidence['sourceRunId']}",f"receipt:{evidence['sourceReceiptRef']}"]
    }
    return {"proposal":proposal,"candidateSnapshot":snapshot,"changeSummary":change_summary(candidate,current)}

def main():
    import argparse
    ap=argparse.ArgumentParser()
    ap.add_argument("--candidate",required=True)
    ap.add_argument("--enrollment",default="config/repository-enrollment.json")
    ap.add_argument("--evidence",required=True)
    ap.add_argument("--current")
    ap.add_argument("--current-meta")
    args=ap.parse_args()
    load=lambda p:json.loads((ROOT/p).read_text(encoding="utf-8"))
    result=plan(load(args.candidate),load(args.enrollment),load(args.evidence),load(args.current) if args.current else None,load(args.current_meta) if args.current_meta else None)
    print(json.dumps(result,ensure_ascii=False,sort_keys=True,separators=(",",":")))
if __name__=="__main__":main()
