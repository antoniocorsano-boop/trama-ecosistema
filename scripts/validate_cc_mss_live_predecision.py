#!/usr/bin/env python3
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=json.loads((ROOT/"status/cc-mss-live-one-shot-predecision.json").read_text())
assert p["schemaVersion"]=="trama.cc-mss.live-one-shot-predecision/v1"
assert p["liveAuthorized"] is False
assert p["decisionState"]=="BLOCKED_MISSING_PRINCIPAL_ATTESTATION"
assert p["candidate"]["authority"]=="https://api.github.com"
assert p["candidate"]["evidenceDestination"]=="LOCAL_EPHEMERAL_ONLY"
assert set(p["candidate"]["operations"]) <= {"repo.read","ref.read","commit.read"}
assert p["unresolved"]
assert "EXPLICIT_HUMAN_AUTHORIZE_LIVE_ONE_SHOT" in p["unresolved"]
print("CC_MSS_LIVE_ONE_SHOT_PREDECISION_PASS")
