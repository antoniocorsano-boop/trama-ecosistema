#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CATALOG=ROOT/"governance/human-use/stage-e3-l0-use-case-catalog.json"
SCHEMA=ROOT/"governance/human-use/stage-e3-l0-human-use-receipt.schema.json"
DOC=ROOT/"docs/validation/trama-stage-e3-l0-human-use-v1.md"
CANON=ROOT/"docs/prototypes/TRAMA-CONTROL-CENTER-L0-REALISTIC.html"
PREVIEW=ROOT/"control-center/preview/l0/index.html"
MOD=ROOT/"control-center/e3/index.html"

def fail(msg):
    raise SystemExit("STAGE_E3_L0_INVALID: "+msg)

def main():
    for p in [CATALOG,SCHEMA,DOC,CANON,PREVIEW,MOD]:
        if not p.is_file(): fail("missing "+str(p.relative_to(ROOT)))

    catalog=json.loads(CATALOG.read_text(encoding="utf-8"))
    if catalog.get("schemaVersion")!="trama.stage-e3-l0-use-case-catalog/v1": fail("catalog schema")
    if catalog.get("subject")!="control-center-l0": fail("catalog subject")
    cases=catalog.get("useCases",[])
    if [x.get("id") for x in cases] != ["E3-L0-UC-01","E3-L0-UC-02","E3-L0-UC-03","E3-L0-UC-04"]:
        fail("unexpected L0 use-case set")
    if any(x.get("priority")!="CRITICAL" for x in cases): fail("all L0 cases must be CRITICAL")
    states={x.get("state") for x in cases}
    if states != {"NORMAL","ATTENTION","DECISION","OFFLINE"}: fail("state coverage")
    rules=catalog.get("closureRules",{})
    if rules.get("criticalFindingTolerance")!=0: fail("critical tolerance")
    if rules.get("mobileEvidenceRequired") is not True: fail("mobile evidence rule")
    if rules.get("participantModeMustHideScenarioControls") is not True: fail("participant mode rule")

    schema=json.loads(SCHEMA.read_text(encoding="utf-8"))
    if schema.get("$id")!="trama.stage-e3-l0-human-use-receipt/v1": fail("receipt schema id")
    props=schema.get("properties",{})
    if props.get("subject",{}).get("const")!="control-center-l0": fail("receipt subject")
    privacy=props["privacy"]["properties"]
    if privacy["containsDirectIdentifiers"].get("const") is not False: fail("privacy direct identifiers")
    if privacy["containsUngovernedRecording"].get("const") is not False: fail("privacy recording")

    canon=CANON.read_text(encoding="utf-8")
    preview=PREVIEW.read_text(encoding="utf-8")
    if canon != preview: fail("preview parity")
    for token in [
        "query.get('participant')==='1'",
        "data-participant",
        "Versione di prova",
        "['normal','attention','decision','offline']"
    ]:
        if token not in canon: fail("participant mode missing "+token)

    # Participant mode must hide scenario controls using CSS, not remove the team preview.
    if 'body[data-participant="true"] .prototype-bar{display:none}' not in canon:
        fail("scenario controls are not hidden in participant mode")

    mod=MOD.read_text(encoding="utf-8")
    for token in [
        "E3-L0 · Sintesi universale",
        "../preview/l0/?participant=1&state=",
        "trama.stage-e3-l0-human-use-receipt/v1",
        "control-center-l0"
    ]:
        if token not in mod: fail("moderator missing "+token)

    for forbidden in ["fetch(","XMLHttpRequest","WebSocket","EventSource","api.github.com","Authorization:","Bearer "]:
        if forbidden in canon or forbidden in mod:
            fail("forbidden runtime/network capability "+forbidden)

    print("TRAMA Stage E3-L0 human-use surface: PASS")

if __name__=="__main__":
    main()
