#!/usr/bin/env python3
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path
from typing import Any

try:
    from scripts.validate_governed_product_identities import is_registered_product, load_product_registry
except ModuleNotFoundError:
    from validate_governed_product_identities import is_registered_product, load_product_registry

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "governance/runtime/didactic-composer-v1-fixtures.json"
SUPPORTED_CALLERS = {"DOCENTE_OS", "REGISTRO_DOCENTE", "STUDIO_ATLAS"}
FORBIDDEN_PERSONAL_KEYS = {"studentName", "studentId", "studentEmail", "grade", "diagnosis", "healthData"}
SEMANTIC_KEYS = ("requestedKind", "title", "rationale", "curricoloBinding", "design", "projectionHints", "review")


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def semantic_composition_payload(proposal: dict[str, Any]) -> dict[str, Any]:
    return {key: copy.deepcopy(proposal.get(key)) for key in SEMANTIC_KEYS}


def compute_content_digest(proposal: dict[str, Any]) -> str:
    material = canonical_json(semantic_composition_payload(proposal)).encode("utf-8")
    return "sha256:" + hashlib.sha256(material).hexdigest()


def walk_keys(value: Any):
    if isinstance(value, dict):
        for key, child in value.items():
            yield key
            yield from walk_keys(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_keys(child)


def validate_request(request: dict[str, Any], registry: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    caller = request.get("caller") if isinstance(request.get("caller"), dict) else {}
    product = caller.get("product")
    if not isinstance(product, str) or not is_registered_product(product, registry):
        errors.append("DC-01")
    elif product not in SUPPORTED_CALLERS:
        errors.append("DC-02")

    if request.get("privacyClass") != "PROFESSIONAL_NON_PERSONAL" or FORBIDDEN_PERSONAL_KEYS.intersection(set(walk_keys(request))):
        errors.append("DC-03")

    context = request.get("curricoloContext") if isinstance(request.get("curricoloContext"), dict) else {}
    if context.get("authorityProduct") != "ARENA" or context.get("authorityState") != "APPROVED":
        errors.append("DC-04")
    if not isinstance(context.get("acceptedContextRef"), str) or not context.get("acceptedContextRef"):
        errors.append("DC-04")
    if context.get("vigencyStatus") != "VIGENTE":
        errors.append("DC-05")
    if context.get("applicabilityStatus") not in {"APPLICABLE", "TRANSITIONAL"}:
        errors.append("DC-06")
    if not isinstance(context.get("regimeRef"), str) or not context.get("regimeRef"):
        errors.append("DC-07")
    if not isinstance(context.get("sourceRefs"), list) or not context.get("sourceRefs"):
        errors.append("DC-04")
    if not isinstance(context.get("curricoloItems"), list) or not context.get("curricoloItems"):
        errors.append("DC-04")
    return sorted(set(errors))


def validate_proposal(request: dict[str, Any], proposal: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if proposal.get("status") != "PROPOSAL":
        errors.append("DC-09")
    version = proposal.get("compositionVersion")
    if not isinstance(version, int) or isinstance(version, bool) or version < 1:
        errors.append("DC-14")

    request_context = request.get("curricoloContext", {})
    binding = proposal.get("curricoloBinding") if isinstance(proposal.get("curricoloBinding"), dict) else {}
    accepted_context_ref = binding.get("acceptedContextRef")
    if (
        not isinstance(accepted_context_ref, str)
        or not accepted_context_ref
        or accepted_context_ref != request_context.get("acceptedContextRef")
        or binding.get("applicabilityStatus") != request_context.get("applicabilityStatus")
        or binding.get("regimeRef") != request_context.get("regimeRef")
    ):
        errors.append("DC-08")

    hints = proposal.get("projectionHints") if isinstance(proposal.get("projectionHints"), dict) else {}
    if hints.get("driveExport") != "DEFERRED_WRITE_SLICE":
        errors.append("DC-10")

    provenance = proposal.get("provenance") if isinstance(proposal.get("provenance"), dict) else {}
    if (
        provenance.get("requestId") != request.get("requestId")
        or provenance.get("capabilityId") != "didactic.composition.propose"
        or provenance.get("capabilityVersion") != "1"
    ):
        errors.append("DC-14")

    if proposal.get("contentDigest") != compute_content_digest(proposal):
        errors.append("DC-12")
    return sorted(set(errors))


def validate_adoption_receipt(receipt: dict[str, Any], proposal: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if (
        receipt.get("contract") != "DIDACTIC_COMPOSITION_ADOPTION_RECEIPT_V1"
        or receipt.get("contractVersion") != 1
        or receipt.get("decidedBy") != "HUMAN"
        or receipt.get("decision") not in {"ADOPTED", "REJECTED", "SUPERSEDED"}
        or "globalApproval" in receipt
        or "adoptedProducts" in receipt
    ):
        errors.append("DC-13")
    if (
        receipt.get("compositionId") != proposal.get("compositionId")
        or receipt.get("compositionVersion") != proposal.get("compositionVersion")
    ):
        errors.append("DC-14")
    if receipt.get("contentDigest") != proposal.get("contentDigest"):
        errors.append("DC-12")
    return sorted(set(errors))


def deep_merge(base: Any, patch: Any) -> Any:
    if isinstance(base, dict) and isinstance(patch, dict):
        out = copy.deepcopy(base)
        for key, value in patch.items():
            out[key] = deep_merge(out.get(key), value) if key in out else copy.deepcopy(value)
        return out
    return copy.deepcopy(patch)


def load_matrix(path: Path = FIXTURES) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def validate_state(request: dict[str, Any], proposals: list[dict[str, Any]], receipt: dict[str, Any], registry: dict[str, Any]) -> list[str]:
    errors = validate_request(request, registry)
    for proposal in proposals:
        errors.extend(validate_proposal(request, proposal))
    if len(proposals) >= 2:
        semantic = [canonical_json(semantic_composition_payload(p)) for p in proposals]
        if len(set(semantic)) != 1:
            errors.append("DC-11")
        identities = {(p.get("compositionId"), p.get("compositionVersion")) for p in proposals}
        if len(identities) != 1:
            errors.append("DC-14")
    if proposals:
        errors.extend(validate_adoption_receipt(receipt, proposals[0]))
        caller = request.get("caller") if isinstance(request.get("caller"), dict) else {}
        if receipt.get("product") != caller.get("product"):
            errors.append("DC-13")
    return sorted(set(errors))


def materialize_invalid(matrix: dict[str, Any], item: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, Any]]:
    request = copy.deepcopy(matrix["request"])
    proposals = copy.deepcopy(matrix["proposals"])
    receipt = copy.deepcopy(matrix["adoptionReceipt"])
    target = item.get("target")
    patch = item.get("patch", {})
    if target == "request":
        request = deep_merge(request, patch)
    elif target == "adoptionReceipt":
        receipt = deep_merge(receipt, patch)
    elif isinstance(target, str) and target.startswith("proposal:"):
        index = int(target.split(":", 1)[1])
        proposals[index] = deep_merge(proposals[index], patch)
    else:
        raise ValueError("invalid target")
    return request, proposals, receipt


def qualify_matrix(matrix: dict[str, Any], registry: dict[str, Any]) -> dict[str, Any]:
    valid_errors: list[str] = []
    if matrix.get("schemaVersion") != "trama.didactic-composer-v1-fixtures/v1":
        valid_errors.append("schemaVersion")
    capability = matrix.get("capability", {})
    if capability != {
        "capabilityId": "didactic.composition.propose",
        "capabilityVersion": "1",
        "mode": "PROPOSE_ONLY",
        "ownerDomain": "TRAMA",
        "authorityClass": "HUMAN_REQUIRED",
    }:
        valid_errors.append("capability")
    valid_errors.extend(validate_state(matrix.get("request", {}), matrix.get("proposals", []), matrix.get("adoptionReceipt", {}), registry))
    valid_errors = sorted(set(valid_errors))

    invalid_results = []
    for item in matrix.get("invalid", []):
        request, proposals, receipt = materialize_invalid(matrix, item)
        errors = validate_state(request, proposals, receipt, registry)
        expected = sorted(set(item.get("expect", [])))
        invalid_results.append({
            "id": item.get("id"),
            "errors": errors,
            "expected": expected,
            "pass": bool(errors) and all(code in errors for code in expected),
        })
    passed = not valid_errors and len(invalid_results) >= 14 and all(item["pass"] for item in invalid_results)
    return {"validPass": not valid_errors, "validErrors": valid_errors, "invalidResults": invalid_results, "pass": passed}


def main() -> int:
    matrix = load_matrix()
    registry = load_product_registry()
    result = qualify_matrix(matrix, registry)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2))
    return 0 if result["pass"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
