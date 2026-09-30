#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
PATH=ROOT/"governance/runtime/or10-x-evidence-alignment.json"

def main():
    data=json.loads(PATH.read_text(encoding="utf-8"))
    errors=[]
    if data.get("schemaVersion")!="trama.or10-x-evidence-alignment/v1": errors.append("schemaVersion")
    products={p.get("product"):p for p in data.get("products",[])}
    if set(products)!={"ARENA","DOCENTE_OS","ATLAS"}: errors.append("products")
    if products.get("ARENA",{}).get("authority")!="ARENA": errors.append("arenaAuthority")
    if products.get("DOCENTE_OS",{}).get("authority")!="TEACHER": errors.append("teacherAuthority")
    if products.get("ATLAS",{}).get("authority")!="NONE_FOR_CURRICULUM": errors.append("atlasAuthority")
    inv=data.get("invariants",{})
    required={
      "arenaAuthorityPreserved":True,
      "atlasOptional":True,
      "docenteOsTeacherFirst":True,
      "controlCenterReadOnly":True,
      "runtimeLive":False,
      "writeAuthorityAdded":False,
      "dosA1":"RUNTIME_DEFERRED",
    }
    for k,v in required.items():
        if inv.get(k)!=v: errors.append(k)
    if any(p.get("mode") not in {"READ_ONLY","PROPOSE_ONLY"} for p in data.get("products",[])):
        errors.append("mode")
    print(json.dumps({"pass":not errors,"errors":errors},sort_keys=True,indent=2))
    return 0 if not errors else 1

if __name__=="__main__":
    raise SystemExit(main())
