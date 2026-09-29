#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/"docs/strategy/trama-component-strategy-v1.md"
MATRIX=ROOT/"governance/ui-development/trama-component-strategy-v1.json"

def fail(msg):
    raise SystemExit("TRAMA_COMPONENT_STRATEGY_INVALID: "+msg)

def main():
    if not DOC.is_file(): fail("missing strategy document")
    if not MATRIX.is_file(): fail("missing strategy matrix")
    x=json.loads(MATRIX.read_text(encoding="utf-8"))

    if x.get("schemaVersion")!="trama.component-strategy/v1": fail("schemaVersion")
    if x.get("strategyId")!="TRAMA-COMPONENT-STRATEGY-01": fail("strategyId")
    if x.get("parentModel")!="TRAMA-UI-DEVELOPMENT-01": fail("parentModel")
    if x.get("runtimeImpact")!="NONE": fail("runtimeImpact")
    if x.get("dosA1")!="RUNTIME_DEFERRED": fail("dosA1")

    p=x.get("principles",{})
    for key in ["nativeFirst","borrowBehaviorOwnExpression","noGlobalVisualLibrary","noCardFirstDefault","noFrameworkRewriteByStrategy","adapterForGovernedSemantics"]:
        if p.get(key) is not True: fail("principle "+key)

    candidates={c["id"]:c for c in x.get("candidates",[])}
    required={"NATIVE_WEB_PLATFORM","WEB_AWESOME_CORE","SPECTRUM_WEB_COMPONENTS","RADIX_PRIMITIVES","BASE_UI","SHADCN_UI","REACT_FLOW","CARBON","PATTERNFLY"}
    if set(candidates)!=required: fail("candidate set")

    if candidates["NATIVE_WEB_PLATFORM"]["disposition"]!="PREFERRED": fail("native disposition")
    if candidates["WEB_AWESOME_CORE"]["disposition"]!="TRIAL_CANDIDATE": fail("Web Awesome disposition")
    if candidates["SHADCN_UI"]["disposition"]!="OPEN_CODE_REFERENCE_ONLY": fail("shadcn disposition")
    if candidates["REACT_FLOW"]["disposition"]!="SPECIALIST_EXISTING_ATLAS": fail("React Flow disposition")
    if any(c.get("runtimeAdoptionAuthorized") is not False for c in candidates.values()):
        fail("strategy must not authorize runtime adoption")

    if x.get("unresolvedInventory")!=["ARENA_RUNTIME_SUPPLY_CHAIN","DOCENTE_OS_RUNTIME_SUPPLY_CHAIN"]:
        fail("inventory boundary")

    doc=DOC.read_text(encoding="utf-8")
    for token in [
        "No global UI library rule",
        "Card remains a component family but is NOT the default layout primitive",
        "Web Awesome Core — TRIAL_CANDIDATE",
        "Radix Primitives — EXISTING_FOOTPRINT",
        "Base UI — TRIAL_CANDIDATE_FOR_REACT",
        "It selects a **decision system**"
    ]:
        if token.lower() not in doc.lower(): fail("document invariant "+token)

    print("TRAMA Component Strategy v1: PASS")

if __name__=="__main__":
    main()
