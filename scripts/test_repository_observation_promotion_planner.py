#!/usr/bin/env python3
import importlib.util,json,copy,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location("planner",ROOT/"scripts/repository_observation_promotion_planner.py")
m=importlib.util.module_from_spec(s);sys.modules[s.name]=m;s.loader.exec_module(m)
enrollment=json.loads((ROOT/"config/repository-enrollment.json").read_text())
repos=[]
for i,e in enumerate([x for x in enrollment["repositories"] if x["state"]=="ENROLLED"],1):
 repos.append({"repository":e["repository"],"enrollmentRef":e["id"],"availabilityStatus":"AVAILABLE","freshnessStatus":"FRESH","completenessStatus":"COMPLETE","observedHead":format(i,"040x"),"sourceRefs":["fixture:"+e["id"]]})
candidate={"schemaVersion":"trama.repository-observation/v1","collectionId":"run-1","observedAt":"2026-09-28T20:54:45Z","status":"COMPLETE","repositories":repos,"pullRequests":[{"repository":repos[0]["repository"],"number":132,"state":"OPEN","draft":True,"merged":False,"observedHead":"a"*40,"observedAt":"2026-09-28T20:54:45Z","sourceRefs":["fixture:pr"]}],"sourceRefs":["fixture:collection"]}
evidence={"receiptState":"CONSUMED","sourceRunId":"36482487361","sourceReceiptRef":"gha-dispatch-36482487361--gha-36482487361","collectorExactSha":"895aac7c31d2e8388b22b01ac45408102ad6ff1c","collectorIntegrated":True}
r1=m.plan(candidate,enrollment,evidence)
r2=m.plan(copy.deepcopy(candidate),enrollment,copy.deepcopy(evidence))
assert r1==r2
assert r1["proposal"]["state"]=="READY_FOR_HUMAN_REVIEW"
assert r1["proposal"]["supersessionVerdict"]=="NEW_STATE"
assert r1["candidateSnapshot"]["generatedAt"]==candidate["observedAt"]
assert len(r1["candidateSnapshot"]["repositories"])>0
same=m.plan(candidate,enrollment,evidence,current=copy.deepcopy(candidate),current_meta={"sourceRunId":"other"})
assert same["proposal"]["supersessionVerdict"]=="NO_OP_ALREADY_PROMOTED" and same["proposal"]["state"]=="REJECTED"
semantic=copy.deepcopy(candidate);semantic["collectionId"]="run-2";semantic["observedAt"]="2026-09-28T21:00:00Z"
sem=m.plan(semantic,enrollment,{**evidence,"sourceRunId":"2","sourceReceiptRef":"r2"},current=candidate,current_meta={"sourceRunId":"1"})
assert sem["proposal"]["supersessionVerdict"]=="NO_OP_SEMANTIC_EQUIVALENT"
older=copy.deepcopy(candidate);older["observedAt"]="2026-09-28T19:00:00Z";older["repositories"][0]["observedHead"]="f"*40
old=m.plan(older,enrollment,{**evidence,"sourceRunId":"3","sourceReceiptRef":"r3"},current=candidate,current_meta={"sourceRunId":"1"})
assert old["proposal"]["supersessionVerdict"]=="OLDER_THAN_CURRENT"
bad=copy.deepcopy(candidate);bad["status"]="PARTIAL"
try:m.plan(bad,enrollment,evidence);raise AssertionError("partial promoted")
except m.PlannerError as e:assert str(e)=="OBSERVATION_NOT_COMPLETE"
bad=copy.deepcopy(candidate);bad["repositories"]=bad["repositories"][:-1]
try:m.plan(bad,enrollment,evidence);raise AssertionError("enrollment mismatch accepted")
except m.PlannerError as e:assert str(e)=="ENROLLMENT_MISMATCH"
try:m.plan({**candidate,"collectionId":"different"},enrollment,evidence,current=candidate,current_meta={"sourceRunId":evidence["sourceRunId"]});raise AssertionError("same run different digest accepted")
except m.PlannerError as e:assert str(e)=="SAME_RUN_DIFFERENT_DIGEST"
print("TRAMA_REPOSITORY_OBSERVATION_PROMOTION_PLANNER_PASS")
