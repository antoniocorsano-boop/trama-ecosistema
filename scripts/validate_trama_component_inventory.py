#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/"docs/inventory/trama-component-supply-chain-inventory-v1.md"
DATA=ROOT/"governance/ui-development/trama-component-inventory-v1.json"

def fail(msg):
    raise SystemExit("TRAMA_COMPONENT_INVENTORY_INVALID: "+msg)

def main():
    if not DOC.is_file(): fail("missing inventory doc")
    if not DATA.is_file(): fail("missing inventory data")
    x=json.loads(DATA.read_text(encoding="utf-8"))
    if x.get("schemaVersion")!="trama.component-inventory/v1": fail("schemaVersion")
    if x.get("inventoryId")!="TRAMA-COMPONENT-INVENTORY-01": fail("inventoryId")
    if x.get("runtimeImpact")!="NONE": fail("runtimeImpact")
    if x.get("dosA1")!="RUNTIME_DEFERRED": fail("dosA1")
    ids=[p.get("id") for p in x.get("products",[])]
    if ids!=["ARENA","ATLAS","DOCENTE_OS","TRAMA_CONTROL_CENTER"]: fail("product set/order")
    if x.get("adoptionAuthorized") is not False: fail("inventory must not authorize adoption")
    atlas=next(p for p in x["products"] if p["id"]=="ATLAS")
    if "@radix-ui/react-slot" not in atlas["thirdPartyPrimitives"]: fail("Atlas Radix evidence")
    dos=next(p for p in x["products"] if p["id"]=="DOCENTE_OS")
    for dep in ["@radix-ui/react-dialog","cmdk"]:
        if dep not in dos["thirdPartyPrimitives"]: fail("Docente OS primitive "+dep)
    cc=next(p for p in x["products"] if p["id"]=="TRAMA_CONTROL_CENTER")
    if cc["disposition"]!="STANDARDS_FIRST": fail("Control Center strategy")
    doc=DOC.read_text(encoding="utf-8")
    for token in ["Existing diversity is legitimate","The largest current risk is not “lack of a component library”","Only after that map exists should any new runtime component dependency be trialed"]:
        if token.lower() not in doc.lower(): fail("doc invariant "+token)
    print("TRAMA Component & Supply-Chain Inventory v1: PASS")

if __name__=="__main__":
    main()
