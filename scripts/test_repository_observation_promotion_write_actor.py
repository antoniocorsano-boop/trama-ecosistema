#!/usr/bin/env python3
import copy,importlib.util,json,sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def load(name,path):
 spec=importlib.util.spec_from_file_location(name,ROOT/path)
 module=importlib.util.module_from_spec(spec)
 sys.modules[name]=module
 spec.loader.exec_module(module)
 return module

actor=load("promotion_actor","scripts/repository_observation_promotion_write_actor.py")
canon=load("promotion_canon_test","scripts/repository_observation_promotion_canonical.py")

actor_sha="1"*40
observation={
 "schemaVersion":"trama.repository-observation/v1",
 "collectionId":"fixture-write-actor",
 "observedAt":"2026-09-29T03:30:00Z",
 "status":"COMPLETE",
 "repositories":[],
 "pullRequests":[],
 "sourceRefs":["fixture:observation"]
}
snapshot={
 "schemaVersion":"1.0.0","generatedAt":"2026-09-29T03:30:00Z","project":"TRAMA","status":"CURRENT",
 "currentPhase":None,"activeCapabilities":[],"canonicalDecisions":[],"activeInvariants":[],
 "repositories":[],"openPullRequests":[],"activeExactHeads":[],"blockingGates":[],
 "pendingHumanReviews":[],"dependencies":[],"knownConflicts":[],"recentlyCompleted":[],
 "knownRejectedApproaches":[],"nextCandidateActions":[],"knowledgeEvents":[],"knowledgeSources":[{"id":"fixture"}]
}
od=canon.sha256_canonical(observation)
sd=canon.sha256_canonical(snapshot)
policy=canon.sha256_canonical({"policy":"fixture"})
proposal={
 "schemaVersion":"trama.repository-observation-promotion-proposal/v1",
 "proposalId":canon.proposal_id(od),
 "state":"READY_FOR_HUMAN_REVIEW",
 "observationDigest":od,
 "sourceRunId":"36482487361",
 "sourceReceiptRef":"gha-dispatch-36482487361--gha-36482487361",
 "collectorExactSha":"2"*40,
 "promotionPolicyVersion":"1.0.0",
 "promotionPolicyDigest":policy,
 "repositoryEnrollmentDigest":"3"*64,
 "previousObservationDigest":None,
 "candidateObservedAt":"2026-09-29T03:30:00Z",
 "candidateRepositories":[],
 "candidateOpenPullRequests":[],
 "validationVerdict":"PASS",
 "supersessionVerdict":"NEW_STATE",
 "proposedChanges":[
  {"path":actor.ALLOWED_PATHS[0],"action":"CREATE","sha256":od},
  {"path":actor.ALLOWED_PATHS[1],"action":"UPDATE","sha256":sd},
  {"path":actor.ALLOWED_PATHS[2],"action":"UPDATE","sha256":None}
 ],
 "sourceRefs":["github-actions:workflow-run/36482487361"]
}
bundle={
 "schemaVersion":"trama.repository-observation-promotion-write-bundle/v1",
 "targetRepository":actor.TARGET_REPOSITORY,
 "baseBranch":"main",
 "baseExactSha":"4"*40,
 "proposal":proposal,
 "candidateObservation":observation,
 "candidateSnapshot":snapshot,
 "recordedAt":"2026-09-29T03:31:00Z",
 "recordedBy":"human-review:test",
 "sourceRefs":["review:test"]
}
events={"schemaVersion":"trama.project-knowledge-events/v1","updatedAt":"2026-09-29T03:00:00Z","events":[]}
event0=actor.promotion_event(bundle,actor_sha)
wrapper0=actor.knowledge_event_from_promotion(event0,bundle)
bundle["candidateSnapshot"]=actor.finalize_snapshot(bundle["candidateSnapshot"],wrapper0,bundle["recordedAt"])
for item in bundle["proposal"]["proposedChanges"]:
 if item["path"]==actor.ALLOWED_PATHS[1]:
  item["sha256"]=canon.sha256_canonical(bundle["candidateSnapshot"])

assert actor.validate_bundle(bundle,actor_sha)
files,event=actor.materialize(bundle,events,actor_sha)
assert set(files)==set(actor.ALLOWED_PATHS)
assert event["promotionActorExactSha"]==actor_sha
wrapper=files[actor.ALLOWED_PATHS[2]]["events"][-1]
assert wrapper["type"]=="PROMOTION"
assert wrapper["promotionEvent"]["eventId"]==event["eventId"]
files2,event2=actor.materialize(bundle,files[actor.ALLOWED_PATHS[2]],actor_sha)
assert files2[actor.ALLOWED_PATHS[2]]==files[actor.ALLOWED_PATHS[2]]
assert event2==event

bad=copy.deepcopy(bundle);bad["targetRepository"]="antoniocorsano-boop/Curriculum-Atlas"
try: actor.validate_bundle(bad,actor_sha);raise AssertionError("foreign repo accepted")
except actor.ActorError as e: assert str(e)=="TARGET_DENIED"

bad=copy.deepcopy(bundle);bad["proposal"]["state"]="PROPOSED"
try: actor.validate_bundle(bad,actor_sha);raise AssertionError("unreviewed proposal accepted")
except actor.ActorError as e: assert str(e)=="PROPOSAL_NOT_PROMOTABLE"

bad=copy.deepcopy(bundle);bad["proposal"]["proposedChanges"].append({"path":"README.md","action":"UPDATE","sha256":"a"*64})
try: actor.validate_bundle(bad,actor_sha);raise AssertionError("unexpected path accepted")
except actor.ActorError as e: assert str(e)=="PATH_ALLOWLIST_MISMATCH"

bad=copy.deepcopy(bundle);bad["candidateObservation"]["collectionId"]="tampered"
try: actor.validate_bundle(bad,actor_sha);raise AssertionError("tampered observation accepted")
except actor.ActorError as e: assert str(e)=="OBSERVATION_BINDING_MISMATCH"

source=(ROOT/"scripts/repository_observation_promotion_write_actor.py").read_text()
for forbidden in ["/merges","/merge","DELETE","PATCH","git push","subprocess","os.system","requests.","httpx."]:
 assert forbidden not in source, forbidden
assert actor.branch_name(proposal["proposalId"],bundle["baseExactSha"]).endswith("-"+bundle["baseExactSha"][:12])
for required in ["BRANCH_CONTAINS_UNEXPECTED_PATHS","BRANCH_BASE_MISMATCH","BRANCH_HISTORY_INVALID","BASE_HEAD_MISMATCH","BASE_MOVED_DURING_WRITE","MULTIPLE_PROMOTION_PRS","PATH_ALLOWLIST_MISMATCH"]:
 assert required in source, required

print("TRAMA_REPOSITORY_OBSERVATION_PROMOTION_WRITE_ACTOR_PASS")
