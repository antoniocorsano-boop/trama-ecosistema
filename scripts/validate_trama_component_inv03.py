#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/"docs/inventory/trama-component-evidence-coverage-inv03.md"
DATA=ROOT/"governance/ui-development/trama-component-evidence-coverage-inv03.json"

def fail(msg):
    raise SystemExit("TRAMA_COMPONENT_INV03_INVALID: "+msg)

def main():
    if not DOC.is_file(): fail("missing document")
    if not DATA.is_file(): fail("missing data")
    x=json.loads(DATA.read_text(encoding="utf-8"))
    if x.get("schemaVersion")!="trama.component-evidence-coverage/v1": fail("schemaVersion")
    if x.get("sliceId")!="INV-03": fail("slice")
    if x.get("runtimeImpact")!="NONE": fail("runtimeImpact")
    if x.get("migrationAuthorized") is not False: fail("migration boundary")
    if x.get("dependencyAdoptionAuthorized") is not False: fail("dependency boundary")
    if x.get("runtimeChangeAuthorized") is not False: fail("runtime boundary")

    products={p["product"]:p for p in x.get("products",[])}
    expected_products={"ARENA","ATLAS","DOCENTE_OS","TRAMA_CONTROL_CENTER"}
    if set(products)!=expected_products: fail("product set")
    if products["ARENA"]["isolated"]!="PRESENT": fail("Arena isolated evidence")
    if products["ATLAS"]["keyboardFocus"]!="PRESENT": fail("Atlas keyboard evidence")
    if products["DOCENTE_OS"]["isolated"]!="NOT_OBSERVED": fail("Docente OS isolated evidence")
    if products["TRAMA_CONTROL_CENTER"]["responsiveVisual"]!="PRESENT": fail("Control Center visual evidence")

    findings={f["id"]:f for f in x.get("findings",[])}
    expected_findings={f"INV03-F{i:02d}" for i in range(1,8)}
    if set(findings)!=expected_findings: fail("finding set")
    for key in ["INV03-F03","INV03-F04","INV03-F05","INV03-F06"]:
        if findings[key]["severity"]!="HIGH": fail(key+" severity")

    doc=DOC.read_text(encoding="utf-8").lower()
    for token in [
        "a documented intention is not counted as equivalent to executed evidence",
        "no ecosystem-wide storybook requirement",
        "evidence type must be explicit",
        "does **not** authorize"
    ]:
        if token not in doc: fail("doc invariant "+token)

    print("TRAMA Component Evidence Coverage INV-03: PASS")

if __name__=="__main__":
    main()
