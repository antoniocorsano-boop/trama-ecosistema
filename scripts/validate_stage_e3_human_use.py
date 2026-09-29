#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CATALOG=ROOT/"governance/human-use/stage-e3-use-case-catalog.json"
PROTOCOL=ROOT/"docs/validation/trama-stage-e3-human-use-validation-v1.md"
SCHEMA=ROOT/"governance/human-use/stage-e3-human-use-receipt.schema.json"

def fail(msg):
    raise SystemExit("STAGE_E3_HUMAN_USE_INVALID: "+msg)

def main():
    for p in [CATALOG,PROTOCOL,SCHEMA]:
        if not p.is_file():
            fail("missing "+str(p.relative_to(ROOT)))

    catalog=json.loads(CATALOG.read_text(encoding="utf-8"))
    if catalog.get("schemaVersion")!="trama.stage-e3-human-use-catalog/v1":
        fail("catalog schemaVersion")
    if catalog.get("stage")!="E3":
        fail("stage")
    cases=catalog.get("useCases",[])
    if len(cases)<14:
        fail("expected at least 14 typed use cases")

    ids=[x.get("id") for x in cases]
    if len(ids)!=len(set(ids)):
        fail("duplicate use-case IDs")

    required_states=set(catalog["coverageRules"]["requiredStateCoverage"])
    present_states={x.get("state") for x in cases}
    missing_states=sorted(required_states-present_states)
    if missing_states:
        fail("missing states: "+",".join(missing_states))

    required_dims=set(catalog["coverageRules"]["requiredDimensions"])
    dimension_ids={x.get("id") for x in catalog.get("dimensions",[])}
    if required_dims != dimension_ids:
        fail("requiredDimensions must exactly match declared dimensions")

    covered_dims=set()
    for case in cases:
        for field in ["type","state","priority","taskPrompt","expectedOutcome","criticalMisinterpretations","passCriteria","dimensions"]:
            if not case.get(field):
                fail(f"{case.get('id')} missing {field}")
        covered_dims.update(case["dimensions"])
        if case["priority"] not in {"CRITICAL","HIGH","MEDIUM","LOW"}:
            fail(case["id"]+" invalid priority")
    missing_dims=sorted(required_dims-covered_dims)
    if missing_dims:
        fail("uncovered dimensions: "+",".join(missing_dims))

    critical={x["id"] for x in cases if x["priority"]=="CRITICAL"}
    for expected in {"E3-UC-01","E3-UC-04","E3-UC-05","E3-UC-06","E3-UC-08","E3-UC-12","E3-UC-13","E3-UC-14"}:
        if expected not in critical:
            fail(expected+" must remain CRITICAL")

    rules=catalog["coverageRules"]
    if rules.get("maximumTasksPerParticipant")!=5:
        fail("maximumTasksPerParticipant must be 5")
    if rules.get("criticalFindingTolerance")!=0:
        fail("criticalFindingTolerance must be zero")
    if rules.get("statisticalBenchmarking") is not False:
        fail("E3 must not claim statistical benchmarking")

    protocol=PROTOCOL.read_text(encoding="utf-8")
    for token in [
        "zero finding CRITICAL aperti",
        "PARTIAL non autorizza",
        "massimo 5 compiti per partecipante",
        "non deve contenere",
        "Live Overlay",
        "RUNTIME_DEFERRED"
    ]:
        if token.lower() not in protocol.lower():
            fail("protocol missing invariant: "+token)

    schema=json.loads(SCHEMA.read_text(encoding="utf-8"))
    if schema.get("$id")!="trama.stage-e3-human-use-receipt/v1":
        fail("receipt schema identity")
    props=schema.get("properties",{})
    for field in ["testedExactHead","participantProfile","useCases","findings","result","privacy"]:
        if field not in props:
            fail("receipt schema missing "+field)

    # Privacy fail-closed: receipt schema must prohibit direct identifiers/uncontrolled recordings.
    privacy=props["privacy"]["properties"]
    if privacy["containsDirectIdentifiers"].get("const") is not False:
        fail("direct identifiers not fail-closed")
    if privacy["containsUngovernedRecording"].get("const") is not False:
        fail("ungoverned recording not fail-closed")

    print(f"TRAMA Stage E3 human-use catalog: PASS ({len(cases)} use cases, {len(required_dims)} dimensions)")

if __name__=="__main__":
    main()
