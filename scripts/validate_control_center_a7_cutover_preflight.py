#!/usr/bin/env python3
import json
from pathlib import Path

p = Path("governance/control-center/trama-control-center-a7-cutover-preflight.json")
data = json.loads(p.read_text(encoding="utf-8"))

assert data["schemaVersion"] == "trama.control-center-a7-cutover-preflight/v1"
assert data["status"] == "PREFLIGHT"
assert data["publicCutoverAuthorized"] is False
assert data["renderEnvironmentBound"] is False
assert data["sourceBaseline"]["a6Integrated"] is True
assert data["sourceBaseline"]["a6HumanReview"] == "PASS"
assert data["invariants"]["controlCenterReadOnly"] is True
assert data["invariants"]["browserGithubAuthority"] is False
assert data["invariants"]["automaticMaturityPromotion"] is False
assert data["invariants"]["dosA1"] == "RUNTIME_DEFERRED"
assert data["invariants"]["legacyRemovalInScope"] is False
assert data["humanGate"]["name"] == "PUBLIC_CUTOVER_HUMAN_REVIEW"
assert data["humanGate"]["status"] == "PENDING"
assert data["humanGate"]["requiredBeforeRenderMutation"] is True

required = data["requiredEvidence"]
for k in (
    "renderServiceIdentity",
    "currentProductionEntrypoint",
    "targetModularBuild",
    "legacyFallback",
    "rollbackProcedure",
    "exactHeadBinding",
    "deployReceipt",
    "rollbackReceipt",
):
    assert required[k] == "PENDING"

assert required["preCutoverSmokePlan"] == "DEFINED"
assert required["postCutoverSmokePlan"] == "DEFINED"

print("A7 preflight contract: PASS")
