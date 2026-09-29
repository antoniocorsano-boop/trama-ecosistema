#!/usr/bin/env python3
import copy
import importlib.util
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
FIX=ROOT/"control-center/fixtures/project-knowledge"

spec=importlib.util.spec_from_file_location("composer",ROOT/"scripts/compose_effective_project_context.py")
composer=importlib.util.module_from_spec(spec);spec.loader.exec_module(composer)

def load(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

def fixture(name):
    return json.loads((FIX/name).read_text(encoding="utf-8"))

governed=load("control-center/data/project-context-snapshot.json")

cases=[
    ("live-overlay-head-drift.json","effective-context-head-drift.json"),
    ("live-overlay-semantic-drift.json","effective-context-semantic-drift.json"),
    ("live-overlay-partial.json","effective-context-partial.json")
]

for overlay_name,expected_name in cases:
    overlay=fixture(overlay_name)
    actual=composer.compose_effective_project_context(governed,overlay,"control-center/data/project-context-snapshot.json@checkpoint")
    expected=fixture(expected_name)

    for key in (
        "schemaVersion","governedSnapshotRef","liveObservedAt",
        "governedKnowledgeStatus","liveObservationStatus",
        "semanticDriftStatus","effectiveContextStatus","promotionRequired"
    ):
        assert actual[key]==expected[key],(overlay_name,key,actual[key],expected[key])

    assert actual["promotionRequired"] is False
    assert actual["sourceRefs"]
    assert actual["facts"]

# Head-only drift must stay usable and never request promotion.
head=composer.compose_effective_project_context(
    governed,fixture("live-overlay-head-drift.json"),"control-center/data/project-context-snapshot.json@checkpoint"
)
assert head["semanticDriftStatus"]=="NONE"
assert head["effectiveContextStatus"]=="USABLE"
assert head["promotionRequired"] is False

# Semantic drift must request re-verification, not promotion.
semantic=composer.compose_effective_project_context(
    governed,fixture("live-overlay-semantic-drift.json"),"control-center/data/project-context-snapshot.json@checkpoint"
)
assert semantic["semanticDriftStatus"]=="REVIEW_REQUIRED"
assert semantic["promotionRequired"] is False

# Partial live state must preserve governed context and degrade, not overwrite it.
partial=composer.compose_effective_project_context(
    governed,fixture("live-overlay-partial.json"),"control-center/data/project-context-snapshot.json@checkpoint"
)
assert partial["governedKnowledgeStatus"]=="CURRENT"
assert partial["effectiveContextStatus"]=="DEGRADED"
assert partial["promotionRequired"] is False

# Active development head is a distinct volatile fact and never replaces the default head.
active_overlay=fixture("live-overlay-head-drift.json")
active_overlay["repositories"][0]["activeDevelopmentRef"]="develop"
active_overlay["repositories"][0]["observedActiveDevelopmentHead"]="cccccccccccccccccccccccccccccccccccccccc"
active_context=composer.compose_effective_project_context(governed,active_overlay)
assert any(
    fact.get("subject")=="repository-head"
    and fact.get("repository")==active_overlay["repositories"][0]["repository"]
    and fact.get("observedHead")==active_overlay["repositories"][0]["observedHead"]
    for fact in active_context["facts"]
)
assert any(
    fact.get("subject")=="active-development-head"
    and fact.get("repository")==active_overlay["repositories"][0]["repository"]
    and fact.get("ref")=="develop"
    and fact.get("observedHead")=="cccccccccccccccccccccccccccccccccccccccc"
    for fact in active_context["facts"]
)

# Duplicate repository identity with contradictory active development head fails closed.
bad_active=copy.deepcopy(active_overlay)
bad_active["repositories"].append(copy.deepcopy(active_overlay["repositories"][0]))
bad_active["repositories"][-1]["observedActiveDevelopmentHead"]="dddddddddddddddddddddddddddddddddddddddd"
try:
    composer.compose_effective_project_context(governed,bad_active)
    raise AssertionError("contradictory active development identity accepted")
except composer.EffectiveContextError as e:
    assert str(e)=="CONTRADICTORY_ACTIVE_DEVELOPMENT_IDENTITY"

# Duplicate repository identity with contradictory head fails closed.
bad_repo=fixture("live-overlay-head-drift.json")
bad_repo["repositories"].append(copy.deepcopy(bad_repo["repositories"][0]))
bad_repo["repositories"][-1]["observedHead"]="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
try:
    composer.compose_effective_project_context(governed,bad_repo)
    raise AssertionError("contradictory repository identity accepted")
except composer.EffectiveContextError as e:
    assert str(e)=="CONTRADICTORY_REPOSITORY_IDENTITY"

# Duplicate semantic anchor identity with contradictory fingerprint fails closed.
bad_anchor=fixture("live-overlay-head-drift.json")
bad_anchor["semanticAnchors"].append(copy.deepcopy(bad_anchor["semanticAnchors"][0]))
bad_anchor["semanticAnchors"][-1]["fingerprintStatus"]="CHANGED"
bad_anchor["semanticAnchors"][-1]["observedFingerprint"]="bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
try:
    composer.compose_effective_project_context(governed,bad_anchor)
    raise AssertionError("contradictory semantic anchor accepted")
except composer.EffectiveContextError as e:
    assert str(e)=="CONTRADICTORY_SEMANTIC_ANCHOR_IDENTITY"

# Anchor for a repository absent from the live repository set fails closed.
orphan=fixture("live-overlay-head-drift.json")
orphan["semanticAnchors"][0]["repository"]="antoniocorsano-boop/unknown"
try:
    composer.compose_effective_project_context(governed,orphan)
    raise AssertionError("orphan semantic anchor accepted")
except composer.EffectiveContextError as e:
    assert str(e)=="SEMANTIC_ANCHOR_REPOSITORY_NOT_OBSERVED"

# Invalid governed snapshot identity fails closed.
bad_governed=copy.deepcopy(governed);bad_governed["project"]="OTHER"
try:
    composer.compose_effective_project_context(bad_governed,fixture("live-overlay-head-drift.json"))
    raise AssertionError("invalid governed snapshot accepted")
except composer.EffectiveContextError as e:
    assert str(e)=="GOVERNED_SNAPSHOT_IDENTITY_INVALID"

# Pure-function determinism.
overlay=fixture("live-overlay-head-drift.json")
a=composer.compose_effective_project_context(governed,overlay)
b=composer.compose_effective_project_context(governed,overlay)
assert a==b

print("TRAMA_PROJECT_KNOWLEDGE_DUAL_SPEED_STAGE_B_COMPOSER_PASS")
