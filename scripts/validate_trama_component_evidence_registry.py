#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/"governance/ui-development/trama-component-evidence-registry-v1.json"

LIFECYCLE={"PROPOSED","TRIAL","STABLE","LEGACY","DEPRECATED","RETIRED","SPECIALIST","NATIVE"}
SOURCE={"NATIVE_PLATFORM","PRODUCT_OWNED","TRAMA_SHARED_SEMANTIC","EXTERNAL_PRIMITIVE","SPECIALIST_LIBRARY"}
ETYPE={"ISOLATED","BEHAVIOURAL","RESPONSIVE_VISUAL","ACCESSIBILITY","LIFECYCLE"}
STATUS={"PRESENT","PARTIAL","DOCUMENTED_ONLY","NOT_OBSERVED","NOT_APPLICABLE"}

class RegistryValidationError(ValueError):
    pass

def invalid(msg):
    raise RegistryValidationError(msg)

def _looks_like_repository_path(ref):
    return isinstance(ref,str) and "/" in ref and not ref.startswith(("run:","review:","urn:"))

def validate_registry(x, root=ROOT):
    if x.get("schemaVersion")!="trama.component-evidence-registry/v1": invalid("schemaVersion")
    if x.get("contractId")!="TRAMA-COMPONENT-EVIDENCE-REGISTRY-01": invalid("contractId")
    if x.get("runtimeImpact")!="NONE": invalid("runtimeImpact")
    for k in ["migrationAuthorized","dependencyAdoptionAuthorized","runtimeChangeAuthorized"]:
        if x.get(k) is not False: invalid(k)

    ids=[]
    for entry in x.get("entries",[]):
        cid=entry.get("componentId")
        if not cid: invalid("missing componentId")
        ids.append(cid)
        if entry.get("lifecycle") not in LIFECYCLE: invalid(cid+" lifecycle")
        if entry.get("sourceClass") not in SOURCE: invalid(cid+" sourceClass")
        for e in entry.get("evidence",[]):
            if e.get("type") not in ETYPE: invalid(cid+" evidence type")
            if e.get("status") not in STATUS: invalid(cid+" evidence status")
            if e.get("status") in {"PRESENT","PARTIAL","DOCUMENTED_ONLY"} and not e.get("ref"):
                invalid(cid+" evidence ref")
            if e.get("status")=="PRESENT" and e.get("type")!="LIFECYCLE" and not (e.get("exactHead") or e.get("runId")):
                invalid(cid+" unbound PRESENT evidence")

            repository=e.get("repository")
            if repository is not None and not str(repository).strip():
                invalid(cid+" repository")

            ref=e.get("ref")
            if ref and repository is None and _looks_like_repository_path(ref):
                local_ref=(root/ref).resolve()
                try:
                    local_ref.relative_to(root.resolve())
                except ValueError:
                    invalid(cid+" evidence ref outside repository")
                if not local_ref.is_file():
                    invalid(cid+" external evidence repository")

            if e.get("exactHead") and len(e.get("exactHead",""))!=40:
                invalid(cid+" exactHead")

    if len(ids)!=len(set(ids)): invalid("duplicate componentId")

    required={
      "ARENA.DIALOG_CONFIRM.LEGACY",
      "ARENA.DIALOG_CONFIRM.GOVERNED",
      "ARENA.TABS.LEGACY",
      "ARENA.TABS.GOVERNED",
      "ARENA.TOOLTIP.LEGACY",
      "CONTROL_CENTER.CONTEXT_HELP.FAMILY"
    }
    if not required.issubset(set(ids)): invalid("missing initial high-priority binding")

def fail(msg):
    raise SystemExit("TRAMA_COMPONENT_EVIDENCE_REGISTRY_INVALID: "+msg)

def main():
    if not DATA.is_file(): fail("missing registry")
    x=json.loads(DATA.read_text(encoding="utf-8"))
    try:
        validate_registry(x)
    except RegistryValidationError as exc:
        fail(str(exc))
    print("TRAMA Component Evidence Registry v1: PASS")

if __name__=="__main__":
    main()
