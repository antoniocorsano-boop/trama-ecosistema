#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/"docs/inventory/trama-component-directories-inv01.md"
DATA=ROOT/"governance/ui-development/trama-component-directory-inventory-inv01.json"

def fail(msg):
    raise SystemExit("TRAMA_COMPONENT_INV01_INVALID: "+msg)

def main():
    if not DOC.is_file(): fail("missing document")
    if not DATA.is_file(): fail("missing data")
    x=json.loads(DATA.read_text(encoding="utf-8"))
    if x.get("schemaVersion")!="trama.component-directory-inventory/v1": fail("schemaVersion")
    if x.get("sliceId")!="INV-01": fail("slice")
    if x.get("runtimeImpact")!="NONE": fail("runtime impact")
    if x.get("migrationAuthorized") is not False: fail("migration boundary")
    if x.get("dependencyAdoptionAuthorized") is not False: fail("dependency boundary")

    products={p["id"]:p for p in x.get("products",[])}
    if set(products)!={"ARENA","ATLAS","DOCENTE_OS","TRAMA_CONTROL_CENTER"}: fail("product set")

    arena=products["ARENA"]
    if arena.get("genericComponentDirs")!=["src/components/ui","src/ui/components"]: fail("Arena dirs")
    if arena.get("genericTsxCount")!=24 or arena.get("domainTsxCount")!=73: fail("Arena counts")

    atlas=products["ATLAS"]
    if atlas.get("genericTsxCount")!=1 or atlas.get("domainTsxCount")!=7: fail("Atlas counts")

    dos=products["DOCENTE_OS"]
    if dos.get("genericTsxCount")!=6 or dos.get("domainTsxCount")!=4: fail("Docente OS counts")

    cc=products["TRAMA_CONTROL_CENTER"]
    if cc.get("genericComponentDirs")!=[]: fail("Control Center component-dir assumption")
    if cc.get("classification")!="MONOLITHIC_STATIC_UI_COMPOSITION": fail("Control Center classification")

    findings={f["id"]:f for f in x.get("findings",[])}
    if findings["INV01-F01"]["severity"]!="HIGH": fail("F01 severity")
    if findings["INV01-F04"]["severity"]!="HIGH": fail("F04 severity")

    doc=DOC.read_text(encoding="utf-8").lower()
    for token in [
      "inv01-f01 — parallel ui foundations",
      "inv01-f04 — monolithic static ui composition",
      "declare the first family obsolete",
      "no migration is authorized until inv-02 evidence exists"
    ]:
        if token not in doc: fail("doc invariant "+token)

    print("TRAMA Component Directory Inventory INV-01: PASS")

if __name__=="__main__":
    main()
