#!/usr/bin/env python3
import copy
import importlib.util
import json
import sys
import tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

spec=importlib.util.spec_from_file_location("adapter",ROOT/"scripts/run_live_repository_overlay.py")
adapter=importlib.util.module_from_spec(spec);sys.modules[spec.name]=adapter;spec.loader.exec_module(adapter)

composer_spec=importlib.util.spec_from_file_location("composer",ROOT/"scripts/compose_effective_project_context.py")
composer=importlib.util.module_from_spec(composer_spec);composer_spec.loader.exec_module(composer)

def load(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

observation=load("control-center/fixtures/project-knowledge/repository-observation-complete.json")
governed=load("control-center/data/project-context-snapshot.json")

overlay=adapter.observation_to_live_overlay(observation)
assert overlay["schemaVersion"]=="trama.live-repository-overlay/v1"
assert overlay["status"]=="COMPLETE"
assert overlay["semanticAnchors"]==[]
assert overlay["workflows"]==[]
assert overlay["repositories"]
assert adapter.validate_overlay(overlay) is True

# Absence of enrolled semantic anchors must be fail-closed/unknown, never interpreted as no drift.
effective=composer.compose_effective_project_context(governed,overlay)
assert effective["semanticDriftStatus"]=="DETECTED"
assert effective["promotionRequired"] is False
assert effective["effectiveContextStatus"]=="DEGRADED"

# Adapter must preserve repository/PR source provenance.
for row in overlay["repositories"]:
    assert row["sourceRefs"]
for row in overlay["pullRequests"]:
    assert row["sourceRefs"]

# Invalid observation identity fails closed.
bad=copy.deepcopy(observation)
bad["schemaVersion"]="other"
try:
    adapter.observation_to_live_overlay(bad)
    raise AssertionError("invalid observation identity accepted")
except RuntimeError as e:
    assert str(e)=="REPOSITORY_OBSERVATION_IDENTITY_INVALID"

# UNKNOWN observation is degraded to PARTIAL rather than promoted to COMPLETE.
unknown=copy.deepcopy(observation)
unknown["status"]="UNKNOWN"
unknown_overlay=adapter.observation_to_live_overlay(unknown)
assert unknown_overlay["status"]=="PARTIAL"

# Verify ephemeral collection path cleanup without network by replacing the already-qualified collector.
original_collect=adapter.collector.collect
captured={}

def fake_collect(output):
    p=Path(output)
    captured["path"]=p
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(observation),encoding="utf-8")
    return p,copy.deepcopy(observation)

adapter.collector.collect=fake_collect
try:
    collected=adapter.collect_live_overlay()
finally:
    adapter.collector.collect=original_collect

assert collected["schemaVersion"]=="trama.live-repository-overlay/v1"
assert "path" in captured
assert not captured["path"].exists()
assert not captured["path"].parent.exists()

print("TRAMA_PROJECT_KNOWLEDGE_DUAL_SPEED_STAGE_C_EPHEMERAL_ADAPTER_PASS")
