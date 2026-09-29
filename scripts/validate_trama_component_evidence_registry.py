#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/"governance/ui-development/trama-component-evidence-registry-v1.json"

LIFECYCLE={"PROPOSED","TRIAL","STABLE","LEGACY","DEPRECATED","RETIRED","SPECIALIST","NATIVE"}
SOURCE={"NATIVE_PLATFORM","PRODUCT_OWNED","TRAMA_SHARED_SEMANTIC","EXTERNAL_PRIMITIVE","SPECIALIST_LIBRARY"}
ETYPE={"ISOLATED","BEHAVIOURAL","RESPONSIVE_VISUAL","ACCESSIBILITY","LIFECYCLE"}
STATUS={"PRESENT","PARTIAL","DOCUMENTED_ONLY","NOT_OBSERVED","NOT_APPLICABLE"}

def fail(msg):
    raise SystemExit("TRAMA_COMPONENT_EVIDENCE_REGISTRY_INVALID: "+msg)

def main():
    if not DATA.is_file(): fail("missing registry")
    x=json.loads(DATA.read_text(encoding="utf-8"))
    if x.get("schemaVersion")!="trama.component-evidence-registry/v1": fail("schemaVersion")
    if x.get("contractId")!="TRAMA-COMPONENT-EVIDENCE-REGISTRY-01": fail("contractId")
    if x.get("runtimeImpact")!="NONE": fail("runtimeImpact")
    for k in ["migrationAuthorized","dependencyAdoptionAuthorized","runtimeChangeAuthorized"]:
        if x.get(k) is not False: fail(k)

    ids=[]
    for entry in x.get("entries",[]):
        cid=entry.get("componentId")
        if not cid: fail("missing componentId")
        ids.append(cid)
        if entry.get("lifecycle") not in LIFECYCLE: fail(cid+" lifecycle")
        if entry.get("sourceClass") not in SOURCE: fail(cid+" sourceClass")
        for e in entry.get("evidence",[]):
            if e.get("type") not in ETYPE: fail(cid+" evidence type")
            if e.get("status") not in STATUS: fail(cid+" evidence status")
            if e.get("status") in {"PRESENT","PARTIAL","DOCUMENTED_ONLY"} and not e.get("ref"):
                fail(cid+" evidence ref")
            if e.get("status")=="PRESENT" and e.get("type")!="LIFECYCLE" and not (e.get("exactHead") or e.get("runId")):
                fail(cid+" unbound PRESENT evidence")
            if e.get("repository") is not None and not str(e.get("repository")).strip():
                fail(cid+" repository")
            if e.get("exactHead") and len(e.get("exactHead",""))!=40:
                fail(cid+" exactHead")
    if len(ids)!=len(set(ids)): fail("duplicate componentId")

    required={
      "ARENA.DIALOG_CONFIRM.LEGACY",
      "ARENA.DIALOG_CONFIRM.GOVERNED",
      "ARENA.TABS.LEGACY",
      "ARENA.TABS.GOVERNED",
      "ARENA.TOOLTIP.LEGACY",
      "CONTROL_CENTER.CONTEXT_HELP.FAMILY"
    }
    if not required.issubset(set(ids)): fail("missing initial high-priority binding")

    print("TRAMA Component Evidence Registry v1: PASS")

if __name__=="__main__":
    main()
