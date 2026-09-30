#!/usr/bin/env python3
import copy
import importlib.util
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]

def module(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    value=importlib.util.module_from_spec(spec)
    sys.modules[spec.name]=value
    spec.loader.exec_module(value)
    return value

composer=module("live_component_composer_test","scripts/compose_effective_component_evidence.py")

registry=json.loads((ROOT/"governance/ui-development/trama-component-evidence-registry-v1.json").read_text(encoding="utf-8"))
overlay=json.loads((ROOT/"control-center/fixtures/component-evidence/live-atlas-isolation-r1.json").read_text(encoding="utf-8"))

result=composer.compose_effective_component_evidence(registry,overlay)
by_id={x["componentId"]:x for x in result["components"]}

assert result["schemaVersion"]=="trama.effective-component-evidence/v1"
assert result["promotionRequired"] is False
assert result["humanReviewRequired"] is False
assert result["liveObservationStatus"]=="FRESH"
assert len(result["liveBindings"])==2

relation=by_id["ATLAS.RELATION_EXPLORER.FAMILY"]
assert relation["maturity"]["confirmedStage"]=="REGISTERED"
assert relation["observedMaturity"]["confirmedStage"]=="RESPONSIVE_VISUAL"
assert relation["observedMaturity"]["candidateStage"]=="ACCESSIBILITY"
assert relation["evidenceStatus"]["ISOLATED"]["status"]=="PRESENT"
assert relation["governedEvidenceStatus"]["ISOLATED"]["status"]=="DOCUMENTED_ONLY"
assert relation["lifecycle"]=="PROPOSED"

tree=by_id["ATLAS.CURRICULUM_TREE.DISCLOSURE"]
assert tree["maturity"]["confirmedStage"]=="REGISTERED"
assert tree["observedMaturity"]["confirmedStage"]=="ISOLATED"
assert tree["observedMaturity"]["candidateStage"]=="ACCESSIBILITY"
assert tree["evidenceStatus"]["ISOLATED"]["status"]=="PRESENT"
assert tree["governedEvidenceStatus"]["ISOLATED"]["status"]=="DOCUMENTED_ONLY"
assert tree["lifecycle"]=="PROPOSED"

# Non-enrolled governed semantics remain unchanged.
context=by_id["CONTROL_CENTER.CONTEXT_HELP.FAMILY"]
assert context["maturity"]["confirmedStage"]=="ACCESSIBILITY"
assert context["observedMaturity"]["confirmedStage"]=="ACCESSIBILITY"
assert context["lifecycle"]=="TRIAL"
assert context["liveEvidenceRefs"]==[]

# Governed-only fallback does not manufacture live evidence.
fallback=composer.compose_effective_component_evidence(registry,None)
fallback_relation=next(x for x in fallback["components"] if x["componentId"]=="ATLAS.RELATION_EXPLORER.FAMILY")
assert fallback["liveObservationStatus"]=="GOVERNED_ONLY"
assert fallback_relation["observedMaturity"]==fallback_relation["maturity"]
assert fallback_relation["evidenceStatus"]["ISOLATED"]["status"]=="DOCUMENTED_ONLY"

# Contradictory live identity fails closed.
bad=copy.deepcopy(overlay)
duplicate=copy.deepcopy(bad["evidence"][0])
duplicate["artifactId"]=999999
bad["evidence"].append(duplicate)
try:
    composer.compose_effective_component_evidence(registry,bad)
    raise AssertionError("contradictory live evidence accepted")
except composer.EffectiveComponentEvidenceError as e:
    assert str(e)=="CONTRADICTORY_LIVE_EVIDENCE_IDENTITY"

# Unknown component fails closed rather than creating authority.
unknown=copy.deepcopy(overlay)
unknown["evidence"][0]["componentId"]="ATLAS.UNKNOWN.COMPONENT"
try:
    composer.compose_effective_component_evidence(registry,unknown)
    raise AssertionError("unknown live component accepted")
except composer.EffectiveComponentEvidenceError as e:
    assert str(e)=="LIVE_EVIDENCE_COMPONENT_NOT_GOVERNED"

# Pure deterministic composition.
assert composer.compose_effective_component_evidence(registry,overlay)==composer.compose_effective_component_evidence(registry,overlay)

print("TRAMA_LIVE_COMPONENT_EVIDENCE_LANE_V2_COMPOSER_PASS")
