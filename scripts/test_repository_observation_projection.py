#!/usr/bin/env python3
import copy
import importlib.util
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("pcs",ROOT/"scripts/build_project_context_snapshot.py")
pcs=importlib.util.module_from_spec(spec);spec.loader.exec_module(pcs)

absent=pcs.build("control-center/fixtures/project-knowledge/no-such-observation.json")
assert absent["status"]=="PARTIAL"
assert absent["openPullRequests"]==[]

partial=pcs.build("control-center/fixtures/project-knowledge/repository-observation-partial.json")
assert partial["status"]=="PARTIAL"
assert partial["openPullRequests"]==[]

complete=pcs.build("control-center/fixtures/project-knowledge/repository-observation-complete.json")
assert complete["status"]=="CURRENT"
assert any(x["number"]==96 and x["draft"] is True for x in complete["openPullRequests"])
assert any(x.get("repository")=="antoniocorsano-boop/trama-ecosistema" and x.get("observedHead")=="aa1f8b045bb1ccc1be4cc00e8d721da09cfc028e" for x in complete["activeExactHeads"])
assert any(r.get("observation",{}).get("freshnessStatus")=="FRESH" for r in complete["repositories"])

# Active development ref is projected independently from the default repository head.
fixture=json.loads((ROOT/"control-center/fixtures/project-knowledge/repository-observation-complete.json").read_text(encoding="utf-8"))
active=copy.deepcopy(fixture)
row=active["repositories"][0]
row["activeDevelopmentRef"]="develop"
row["observedActiveDevelopmentHead"]="bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
active_projection=pcs.build(repository_observation_data=active)
assert any(
    x.get("subject")=="repository-head"
    and x.get("repository")==row["repository"]
    and x.get("observedHead")==row["observedHead"]
    for x in active_projection["activeExactHeads"]
)
assert any(
    x.get("subject")=="active-development-head"
    and x.get("repository")==row["repository"]
    and x.get("ref")=="develop"
    and x.get("observedHead")=="bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    for x in active_projection["activeExactHeads"]
)
repo_entry=next(
    x for x in active_projection["repositories"]
    if x.get("repositoryRef") in {row["repository"],row["repository"].split("/")[-1]}
)
assert repo_entry["observation"]["activeDevelopmentRef"]=="develop"
assert repo_entry["observation"]["observedActiveDevelopmentHead"]=="bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"

print("TRAMA_REPOSITORY_OBSERVATION_PROJECTION_PASS")
