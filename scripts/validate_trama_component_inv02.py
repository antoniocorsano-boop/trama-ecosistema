#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/"docs/inventory/trama-interaction-duplication-inv02.md"
DATA=ROOT/"governance/ui-development/trama-interaction-duplication-inv02.json"

def fail(msg):
    raise SystemExit("TRAMA_COMPONENT_INV02_INVALID: "+msg)

def main():
    if not DOC.is_file(): fail("missing document")
    if not DATA.is_file(): fail("missing data")
    x=json.loads(DATA.read_text(encoding="utf-8"))
    if x.get("schemaVersion")!="trama.interaction-duplication-inventory/v1": fail("schemaVersion")
    if x.get("sliceId")!="INV-02": fail("slice")
    if x.get("runtimeImpact")!="NONE": fail("runtimeImpact")
    if x.get("migrationAuthorized") is not False: fail("migration boundary")
    if x.get("dependencyAdoptionAuthorized") is not False: fail("dependency boundary")

    findings={f["id"]:f for f in x.get("findings",[])}
    expected={"INV02-F01","INV02-F02","INV02-F03","INV02-F04","INV02-F05","INV02-F06","INV02-F07","INV02-F08","INV02-F09"}
    if set(findings)!=expected: fail("finding set")
    for key in ["INV02-F01","INV02-F02","INV02-F03","INV02-F08"]:
        if findings[key]["severity"]!="HIGH": fail(key+" severity")
    if findings["INV02-F08"]["decision"]!="TRIAL_EXTERNAL_PRIMITIVE": fail("Control Center trial decision")

    doc=DOC.read_text(encoding="utf-8").lower()
    for token in [
      "no big-bang standardization",
      "native disclosure should be the default",
      "do not choose one interaction library for the ecosystem",
      "no migration or dependency adoption is authorized by inv-02"
    ]:
        if token not in doc: fail("doc invariant "+token)

    print("TRAMA Interaction Duplication Inventory INV-02: PASS")

if __name__=="__main__":
    main()
