#!/usr/bin/env python3
import json
from pathlib import Path

p = Path("governance/control-center/trama-control-center-a7-cutover-preflight.json")
data = json.loads(p.read_text(encoding="utf-8"))

assert data["schemaVersion"] == "trama.control-center-a7-cutover-preflight/v1"
assert data["status"] == "TECHNICALLY_READY_FOR_REQUALIFICATION"
assert data["publicCutoverAuthorized"] is False
assert data["renderEnvironmentBound"] is True
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
    assert required[k] in {"PENDING", "IN_PROGRESS", "DEFINED", "BOUND"}

assert required["preCutoverSmokePlan"] == "DEFINED"
assert required["targetModularBuild"] == "DEFINED"
assert required["legacyFallback"] == "DEFINED"
assert required["rollbackProcedure"] == "DEFINED"
assert required["exactHeadBinding"] == "BOUND"
assert required["deployReceipt"] == "SCHEMA_DEFINED"
assert required["rollbackReceipt"] == "SCHEMA_DEFINED"
assert required["postCutoverSmokePlan"] == "DEFINED"

print("A7 preflight contract: PASS")

render = data["render"]
assert render["serviceName"] == "trama-control-center"
assert render["serviceType"] == "static_site"
assert render["branch"] == "main"
assert render["currentBuildCommand"] == "bash scripts/build_control_center_render.sh"
assert render["currentPublishPath"] == "public"
assert render["currentLiveCommit"] == data["sourceBaseline"]["main"]
assert required["renderServiceIdentity"] == "BOUND"
assert required["currentProductionEntrypoint"] == "BOUND"
print("A7 Render environment binding: PASS")

assert data["candidateHead"] == "178f38f8dd71f18a3ae81b5547c5bb1c2c10ff38"
assert data["rollback"]["legacyBuildCommand"] == "bash scripts/build_control_center_render.sh"
assert data["rollback"]["publishPath"] == "public"
assert data["rollback"]["legacyFallbackPath"] == "/legacy/"
assert data["rollback"]["lastKnownGoodDeployId"] == "dep-daugbrbrjlhs73crlbsg"
assert data["rollback"]["lastKnownGoodCommit"] == "fffefc16f287bd1e63b0e3dde2e117e24be3ac8a"
assert "deploy" in data["receiptContract"]
assert "rollback" in data["receiptContract"]
print("A7 cutover evidence package: PASS")
