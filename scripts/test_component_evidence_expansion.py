#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]


def load_module(name:str, rel:str):
    spec=importlib.util.spec_from_file_location(name,ROOT/rel)
    module=importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


validator=load_module("component_registry_validator","scripts/validate_trama_component_evidence_registry.py")
projection=load_module("component_maturity_projection","scripts/project_component_maturity.py")

registry=json.loads(
    (ROOT/"governance/ui-development/trama-component-evidence-registry-v1.json").read_text(encoding="utf-8")
)
validator.validate_registry(registry)
components=projection.project_components(registry)
projection.validate_projection(components)
by_id={item["componentId"]:item for item in components}

assert len(registry["entries"])==11
assert len(by_id)==11
assert {item["product"] for item in registry["entries"]}=={
    "ARENA","ATLAS","DOCENTE_OS","TRAMA_CONTROL_CENTER"
}

expected={
    "ATLAS.RELATION_EXPLORER.FAMILY":("REGISTERED","ACCESSIBILITY"),
    "ATLAS.CURRICULUM_TREE.DISCLOSURE":("REGISTERED","ACCESSIBILITY"),
    "DOCENTE_OS.APPSHELL.FAMILY":("REGISTERED","ACCESSIBILITY"),
    "DOCENTE_OS.ALERT.STATUS":("REGISTERED","BEHAVIOURAL"),
    "DOCENTE_OS.TIMETABLE.INTERACTIVE_CELLS":("REGISTERED","ACCESSIBILITY"),
}
for component_id,(confirmed,candidate) in expected.items():
    item=by_id[component_id]
    assert item["maturity"]["confirmedStage"]==confirmed,(component_id,item["maturity"])
    assert item["maturity"]["candidateStage"]==candidate,(component_id,item["maturity"])
    assert item["maturity"]["qualificationStatus"]=="PARTIAL",(component_id,item["maturity"])

relation=next(x for x in registry["entries"] if x["componentId"]=="ATLAS.RELATION_EXPLORER.FAMILY")
relation_evidence={x["type"]:x for x in relation["evidence"]}
assert relation_evidence["BEHAVIOURAL"]["runId"]=="36093494130"
assert relation_evidence["RESPONSIVE_VISUAL"]["runId"]=="36093494414"
assert relation_evidence["BEHAVIOURAL"]["exactHead"]=="bc11577eeeeeed9c43ad62ac43fb7561e1197246"

appshell=next(x for x in registry["entries"] if x["componentId"]=="DOCENTE_OS.APPSHELL.FAMILY")
appshell_evidence={x["type"]:x for x in appshell["evidence"]}
for evidence_type in ["BEHAVIOURAL","RESPONSIVE_VISUAL","ACCESSIBILITY"]:
    assert appshell_evidence[evidence_type]["status"]=="PRESENT"
    assert appshell_evidence[evidence_type]["runId"]=="35830251069"
    assert appshell_evidence[evidence_type]["exactHead"]=="4138d25c9011769794903e4d898f7a34e924ca91"

timetable=next(x for x in registry["entries"] if x["componentId"]=="DOCENTE_OS.TIMETABLE.INTERACTIVE_CELLS")
timetable_evidence={x["type"]:x for x in timetable["evidence"]}
assert timetable_evidence["BEHAVIOURAL"]["status"]=="PARTIAL"
assert timetable_evidence["RESPONSIVE_VISUAL"]["status"]=="PRESENT"
assert timetable_evidence["ACCESSIBILITY"]["status"]=="PRESENT"

# This slice expands addressability; it deliberately does not manufacture qualification.
assert all(item["maturity"]["qualificationStatus"]!="QUALIFIED" for item in components)

arena_dialog=by_id["ARENA.DIALOG_CONFIRM.GOVERNED"]
arena_tabs=by_id["ARENA.TABS.GOVERNED"]
context_help=by_id["CONTROL_CENTER.CONTEXT_HELP.FAMILY"]
assert arena_dialog["maturity"]["confirmedStage"]=="BEHAVIOURAL"
assert arena_tabs["maturity"]["confirmedStage"]=="BEHAVIOURAL"
assert context_help["maturity"]["confirmedStage"]=="REGISTERED"

backlog=json.loads(
    (ROOT/"governance/maturity/trama-maturity-reconciliation-v1.json").read_text(encoding="utf-8")
)
assert backlog["components"]["currentRegistryCount"]==11
assert backlog["components"]["missingProductCoverage"]==[]
assert backlog["components"]["coverageState"]=="ALL_PRODUCTS_MACHINE_ADDRESSABLE"
assert backlog["components"]["qualificationState"]=="PARTIAL"

receipt=(ROOT/"docs/evidence/trama-component-evidence-expansion-2026-09-30.md").read_text(encoding="utf-8")
for token in [
    "bc11577eeeeeed9c43ad62ac43fb7561e1197246",
    "36093494414",
    "36093494130",
    "4138d25c9011769794903e4d898f7a34e924ca91",
    "35830251069",
    "no synthetic upgrade",
]:
    assert token.lower() in receipt.lower(),token

print("TRAMA_COMPONENT_EVIDENCE_EXPANSION_01_PASS")
