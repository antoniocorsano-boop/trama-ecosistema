#!/usr/bin/env python3
import json
from pathlib import Path

root = Path(".")
data = json.loads((root / "governance/control-center/trama-control-center-a7-public-switch.json").read_text(encoding="utf-8"))

assert data["schemaVersion"] == "trama.control-center-a7-public-switch/v1"
assert data["status"] == "CANDIDATE"
assert data["publicCutoverHumanReview"] == "PASS"
assert data["preflightMerge"] == "b6d8b250278f064fefed3a6a286d80bc9728a4fe"

render = data["render"]
assert render["serviceId"] == "srv-dape3shsrm7s73f5krpg"
assert render["serviceName"] == "trama-control-center"
assert render["branch"] == "main"
assert render["autoDeploy"] is True
assert render["configuredBuildCommand"] == "bash scripts/build_control_center_render.sh"
assert render["publishPath"] == "public"

switch = data["switch"]
assert switch["wrapper"] == "scripts/build_control_center_render.sh"
assert switch["target"] == "scripts/build_control_center_a7_candidate.sh"
assert switch["output"] == "public"
assert switch["legacyFallbackPath"] == "/legacy/"
assert switch["legacyBuilder"] == "scripts/build_control_center_render_legacy.sh"

wrapper = (root / switch["wrapper"]).read_text(encoding="utf-8")
assert 'TRAMA_A7_PUBLIC_DIR="${TRAMA_RENDER_PUBLIC_DIR:-$ROOT/public}"' in wrapper
assert 'exec bash "$ROOT/scripts/build_control_center_a7_candidate.sh"' in wrapper

legacy = (root / switch["legacyBuilder"]).read_text(encoding="utf-8")
assert 'cp -R "$ROOT/control-center/." "$OUT/"' in legacy
assert 'test -s "$OUT/index.html"' in legacy

rollback = data["rollback"]
assert rollback["primary"] == "REVERT_PUBLIC_SWITCH_MERGE_ON_MAIN"
assert rollback["secondary"] == "SERVE_LEGACY_FALLBACK_PATH"
assert rollback["knownGoodPreSwitchMain"] == "b6d8b250278f064fefed3a6a286d80bc9728a4fe"

inv = data["invariants"]
assert inv["controlCenterReadOnly"] is True
assert inv["browserGithubAuthority"] is False
assert inv["automaticMaturityPromotion"] is False
assert inv["dosA1"] == "RUNTIME_DEFERRED"

print("A7 public switch contract: PASS")
