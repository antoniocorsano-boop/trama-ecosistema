#!/usr/bin/env python3
import importlib.util
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

print("TRAMA_REPOSITORY_OBSERVATION_PROJECTION_PASS")
