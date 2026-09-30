#!/usr/bin/env python3
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_module(name, rel):
    spec = importlib.util.spec_from_file_location(name, ROOT / rel)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


projection = load_module("component_maturity", "scripts/project_component_maturity.py")
registry = json.loads(
    (ROOT / "governance/ui-development/trama-component-evidence-registry-v1.json").read_text(
        encoding="utf-8"
    )
)

components = projection.project_components(registry)
projection.validate_projection(components)
by_id = {item["componentId"]: item for item in components}

assert set(by_id) == {item["componentId"] for item in registry["entries"]}

governed_dialog = by_id["ARENA.DIALOG_CONFIRM.GOVERNED"]
assert governed_dialog["lifecycle"] == "TRIAL"
assert governed_dialog["maturity"]["confirmedStage"] == "ACCESSIBILITY"
assert governed_dialog["maturity"]["candidateStage"] == "ACCESSIBILITY"
assert governed_dialog["maturity"]["qualificationStatus"] == "QUALIFIED"
assert governed_dialog["maturity"]["remainingEvidenceTypes"] == []
assert governed_dialog["evidenceStatus"]["RESPONSIVE_VISUAL"]["status"] == "PRESENT"
assert governed_dialog["evidenceStatus"]["ACCESSIBILITY"]["status"] == "PRESENT"

governed_tabs = by_id["ARENA.TABS.GOVERNED"]
assert governed_tabs["lifecycle"] == "TRIAL"
assert governed_tabs["maturity"]["confirmedStage"] == "ACCESSIBILITY"
assert governed_tabs["maturity"]["candidateStage"] == "ACCESSIBILITY"
assert governed_tabs["maturity"]["qualificationStatus"] == "QUALIFIED"
assert governed_tabs["maturity"]["remainingEvidenceTypes"] == []
assert governed_tabs["evidenceStatus"]["RESPONSIVE_VISUAL"]["status"] == "PRESENT"
assert governed_tabs["evidenceStatus"]["ACCESSIBILITY"]["status"] == "PRESENT"

legacy_dialog = by_id["ARENA.DIALOG_CONFIRM.LEGACY"]
assert legacy_dialog["lifecycle"] == "LEGACY"
assert legacy_dialog["maturity"]["confirmedStage"] == "REGISTERED"
assert legacy_dialog["maturity"]["candidateStage"] == "BEHAVIOURAL"

tooltip = by_id["ARENA.TOOLTIP.LEGACY"]
assert tooltip["maturity"]["confirmedStage"] == "REGISTERED"
assert tooltip["maturity"]["candidateStage"] == "REGISTERED"

relation = by_id["ATLAS.RELATION_EXPLORER.FAMILY"]
assert relation["maturity"]["confirmedStage"] == "REGISTERED"
assert relation["maturity"]["candidateStage"] == "ACCESSIBILITY"
assert relation["evidenceStatus"]["ISOLATED"]["status"] == "DOCUMENTED_ONLY"
assert relation["evidenceStatus"]["BEHAVIOURAL"]["status"] == "PRESENT"
assert relation["evidenceStatus"]["RESPONSIVE_VISUAL"]["status"] == "PRESENT"

tree = by_id["ATLAS.CURRICULUM_TREE.DISCLOSURE"]
assert tree["sourceClass"] == "NATIVE_PLATFORM"
assert tree["maturity"]["confirmedStage"] == "REGISTERED"
assert tree["maturity"]["candidateStage"] == "ACCESSIBILITY"

appshell = by_id["DOCENTE_OS.APPSHELL.FAMILY"]
assert appshell["maturity"]["confirmedStage"] == "REGISTERED"
assert appshell["maturity"]["candidateStage"] == "ACCESSIBILITY"
assert appshell["evidenceStatus"]["BEHAVIOURAL"]["status"] == "PRESENT"
assert appshell["evidenceStatus"]["RESPONSIVE_VISUAL"]["status"] == "PRESENT"
assert appshell["evidenceStatus"]["ACCESSIBILITY"]["status"] == "PRESENT"

alert = by_id["DOCENTE_OS.ALERT.STATUS"]
assert alert["maturity"]["confirmedStage"] == "REGISTERED"
assert alert["maturity"]["candidateStage"] == "BEHAVIOURAL"
assert alert["evidenceStatus"]["RESPONSIVE_VISUAL"]["status"] == "NOT_OBSERVED"

timetable = by_id["DOCENTE_OS.TIMETABLE.INTERACTIVE_CELLS"]
assert timetable["maturity"]["confirmedStage"] == "REGISTERED"
assert timetable["maturity"]["candidateStage"] == "ACCESSIBILITY"
assert timetable["evidenceStatus"]["BEHAVIOURAL"]["status"] == "PARTIAL"
assert timetable["evidenceStatus"]["RESPONSIVE_VISUAL"]["status"] == "PRESENT"
assert timetable["evidenceStatus"]["ACCESSIBILITY"]["status"] == "PRESENT"

context_help = by_id["CONTROL_CENTER.CONTEXT_HELP.FAMILY"]
assert context_help["maturity"]["confirmedStage"] == "REGISTERED"
assert context_help["maturity"]["candidateStage"] == "REGISTERED"
assert context_help["evidenceStatus"]["RESPONSIVE_VISUAL"]["status"] == "PARTIAL"

assert len(by_id) == 11
assert {item["product"] for item in components} == {"ARENA","ATLAS","DOCENTE_OS","TRAMA_CONTROL_CENTER"}

synthetic = {
    "componentId": "TEST.STABLE.WITHOUT.EVIDENCE",
    "product": "TEST",
    "target": "test",
    "lifecycle": "STABLE",
    "sourceClass": "PRODUCT_OWNED",
    "evidence": [
        {
            "type": "LIFECYCLE",
            "status": "PRESENT",
            "ref": "governance/ui-development/trama-component-evidence-registry-v1.json",
        }
    ],
}
synthetic_projection = projection.project_component(
    synthetic,
    "governance/ui-development/trama-component-evidence-registry-v1.json",
)
assert synthetic_projection["maturity"]["confirmedStage"] == "REGISTERED"
assert synthetic_projection["maturity"]["candidateStage"] == "REGISTERED"

leap = {
    "componentId": "TEST.LEAP",
    "product": "TEST",
    "target": "test",
    "lifecycle": "TRIAL",
    "sourceClass": "PRODUCT_OWNED",
    "evidence": [
        {"type": "ISOLATED", "status": "PRESENT", "ref": "run:1", "runId": "1"},
        {"type": "ACCESSIBILITY", "status": "PRESENT", "ref": "run:2", "runId": "2"},
    ],
}
leap_projection = projection.project_component(leap, "registry")
assert leap_projection["maturity"]["confirmedStage"] == "ISOLATED"

print("TRAMA_CC_MAT_COMP_01_PROJECTION_PASS")
