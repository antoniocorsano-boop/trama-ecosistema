#!/usr/bin/env python3
import importlib.util
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def load_module(name,rel):
    spec=importlib.util.spec_from_file_location(name,ROOT/rel)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def load(rel):
    return json.loads((ROOT/rel).read_text(encoding="utf-8"))

pack_mod=load_module("context_pack","scripts/build_trama_context_pack.py")
composer=load_module("composer","scripts/compose_effective_project_context.py")

snapshot=load("control-center/data/project-context-snapshot.json")
head_overlay=load("control-center/fixtures/project-knowledge/live-overlay-head-drift.json")
semantic_overlay=load("control-center/fixtures/project-knowledge/live-overlay-semantic-drift.json")
partial_overlay=load("control-center/fixtures/project-knowledge/live-overlay-partial.json")

# Backward compatibility: no EffectiveProjectContext means no dual-speed envelope.
legacy=pack_mod.build("project-knowledge",snapshot)
assert "effectiveContext" not in legacy
assert legacy["asOf"]==snapshot["generatedAt"]

# USABLE live overlay: preserve governed semantic sections and attach live facts separately.
head_effective=composer.compose_effective_project_context(
    snapshot,head_overlay,"control-center/data/project-context-snapshot.json@checkpoint"
)
head_pack=pack_mod.build("project-knowledge",snapshot,head_effective)
assert head_pack["effectiveContext"]["governedAsOf"]==head_effective["governedAsOf"]
assert head_pack["effectiveContext"]["liveObservedAt"]==head_effective["liveObservedAt"]
assert head_pack["effectiveContext"]["effectiveContextStatus"]=="USABLE"
assert head_pack["effectiveContext"]["semanticDriftStatus"]=="NONE"
assert head_pack["status"]==snapshot["status"]
assert head_pack["decisions"]==legacy["decisions"]
assert head_pack["activeInvariants"]==legacy["activeInvariants"]
assert head_pack["evidence"]==legacy["evidence"]
assert any(x.get("class")=="VOLATILE" for x in head_pack["effectiveContext"]["liveFacts"])
assert head_pack["effectiveContext"]["promotionRequired"] is False

# Semantic drift is surfaced without mutating governed content or requesting promotion.
semantic_effective=composer.compose_effective_project_context(
    snapshot,semantic_overlay,"control-center/data/project-context-snapshot.json@checkpoint"
)
semantic_pack=pack_mod.build("project-knowledge",snapshot,semantic_effective)
assert semantic_pack["effectiveContext"]["semanticDriftStatus"]=="REVIEW_REQUIRED"
assert semantic_pack["effectiveContext"]["promotionRequired"] is False
assert semantic_pack["decisions"]==legacy["decisions"]

# Partial/unverified live state makes the pack PARTIAL while governed content remains available.
partial_effective=composer.compose_effective_project_context(
    snapshot,partial_overlay,"control-center/data/project-context-snapshot.json@checkpoint"
)
partial_pack=pack_mod.build("project-knowledge",snapshot,partial_effective)
assert partial_pack["effectiveContext"]["effectiveContextStatus"]=="DEGRADED"
assert partial_pack["status"]=="PARTIAL"
assert partial_pack["activeInvariants"]==legacy["activeInvariants"]

# Invalid effective-context identity fails closed.
invalid=dict(head_effective)
invalid["schemaVersion"]="invalid"
try:
    pack_mod.build("project-knowledge",snapshot,invalid)
    raise AssertionError("invalid effective context accepted")
except RuntimeError as e:
    assert str(e)=="EFFECTIVE_CONTEXT_IDENTITY_INVALID"

print("TRAMA_PROJECT_KNOWLEDGE_DUAL_SPEED_STAGE_D_CONTEXT_PACK_PASS")
