#!/usr/bin/env python3
import importlib.util
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]

spec=importlib.util.spec_from_file_location("collector_test_target",ROOT/"scripts/run_live_component_evidence_overlay.py")
collector=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=collector
spec.loader.exec_module(collector)

main_head="0105d4f497bea6e476d1b0c40bd472585068f269"
exact_head="fe43bb037ae0bd5bc13aba40e17875d1673667c2"

responses={
 "repo.read":{"private":False,"full_name":"antoniocorsano-boop/Curriculum-Atlas","default_branch":"main"},
 "ref.read":{"object":{"sha":main_head}},
 "workflow.list":{"workflows":[{"id":123,"name":"TRAMA Atlas Component Isolation R1"}]},
 "workflow.runs.read":{"workflow_runs":[{"id":36671130676,"event":"pull_request","conclusion":"success","head_sha":exact_head}]},
 "compare.read":{"merge_base_commit":{"sha":exact_head},"status":"ahead"},
 "workflow.artifacts.read":{"artifacts":[{
    "id":11078325536,
    "name":"atlas-component-isolation-"+exact_head,
    "expired":False,
    "digest":"sha256:3a664cea8d53ea87eed192afefc756a1d67eaf6ad3fd43b9d9a01d85405ec2a5",
    "expires_at":"2026-10-30T04:57:28Z"
 }]}
}

original_get=collector.t.anonymous_get
original_build=collector.t.build_url

def fake_build(repository,operation,**kwargs):
    return operation

def fake_get(url,budget,resources,**kwargs):
    budget.consume(allow_reserve=kwargs.get("allow_reserve",False))
    return json.loads(json.dumps(responses[url]))

collector.t.build_url=fake_build
collector.t.anonymous_get=fake_get
try:
    overlay=collector.collect_live_component_evidence()
finally:
    collector.t.build_url=original_build
    collector.t.anonymous_get=original_get

assert overlay["status"]=="COMPLETE"
assert len(overlay["evidence"])==2
assert {x["componentId"] for x in overlay["evidence"]}=={
 "ATLAS.RELATION_EXPLORER.FAMILY","ATLAS.CURRICULUM_TREE.DISCLOSURE"
}
assert all(x["exactHead"]==exact_head for x in overlay["evidence"])
assert all(x["integrationStatus"]=="INTEGRATED_IN_DEFAULT_BRANCH" for x in overlay["evidence"])
assert all(x["artifactId"]==11078325536 for x in overlay["evidence"])

print("TRAMA_LIVE_COMPONENT_EVIDENCE_LANE_V2_COLLECTOR_PASS")
