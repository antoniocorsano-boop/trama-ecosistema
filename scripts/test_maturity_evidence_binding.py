#!/usr/bin/env python3
from pathlib import Path
import importlib.util
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from evaluate_maturity_definitions import evaluate_area, validate_definitions, validate_evidence_record
from validate_maturity_evidence_registry import validate_registry

registry = json.loads(
    (ROOT / "governance/maturity/trama-maturity-evidence-registry-v1.json").read_text(
        encoding="utf-8"
    )
)
definitions = json.loads(
    (ROOT / "config/maturity-area-definitions.json").read_text(encoding="utf-8")
)

validate_registry(registry)
validate_definitions(definitions)

# Strong product evidence can bind to an area without inventing a capability.
arena_head = next(x for x in registry["evidence"] if x["id"] == "EV-MAT-ARENA-PR312-HEAD")
validate_evidence_record(arena_head)
assert arena_head["binding"]["areaRef"] == "arena"
assert "capabilityRef" not in arena_head["binding"]

# A strong record with neither target is invalid.
bad = json.loads(json.dumps(arena_head))
bad["id"] = "EV-MAT-TEST-UNBOUND"
bad["binding"].pop("areaRef")
try:
    validate_evidence_record(bad)
except ValueError:
    pass
else:
    raise AssertionError("strong evidence without areaRef/capabilityRef must fail")

# Dual target is also invalid.
bad = json.loads(json.dumps(arena_head))
bad["id"] = "EV-MAT-TEST-DUAL"
bad["binding"]["capabilityRef"] = "EC-01-F4"
try:
    validate_evidence_record(bad)
except ValueError:
    pass
else:
    raise AssertionError("strong evidence with both areaRef and capabilityRef must fail")

# Registry-only expectations are conservative. Atlas still needs the existing
# governed exit accessibility/human projection; Docente OS intentionally lacks
# a version-bound runtime canary.
results = {
    area["id"]: evaluate_area(area, registry["evidence"])
    for area in definitions["areas"]
}
assert results["governance"]["confirmedLevel"] == 4, results["governance"]
assert results["arena"]["confirmedLevel"] == 4, results["arena"]
assert results["atlas"]["confirmedLevel"] == 3, results["atlas"]
assert results["docente-os"]["confirmedLevel"] == 3, results["docente-os"]

dos_types = set(results["docente-os"]["availableEvidenceTypes"])
assert "AUTOMATED_TEST" in dos_types
assert "HUMAN_REVIEW" in dos_types
assert "RUNTIME_CANARY" not in dos_types

receipt = (ROOT / "docs/evidence/trama-maturity-evidence-binding-2026-09-29.md").read_text(
    encoding="utf-8"
)
assert "no `RUNTIME_CANARY` evidence is promoted by this slice" in receipt
assert "65a7f5b820b344ec61f8e09d7559012aae521bbc" in receipt
assert "bc11577eeeeeed9c43ad62ac43fb7561e1197246" in receipt
assert "06410a7360ccd7eb55e049154c0c3657e6a24714" in receipt

print("TRAMA_MATURITY_EVIDENCE_BINDING_REGISTRY_PASS")
