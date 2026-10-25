#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "governance/runtime/governed-product-identities-v1.json"

EXPECTED_IDS = {
    "ARENA",
    "ATLAS",
    "DOCENTE_OS",
    "REGISTRO_DOCENTE",
    "STUDIO_ATLAS",
    "CONTROL_CENTER",
}
EXPECTED_ROLES = {
    "ARENA": "CURRICOLO_AUTHORITY",
    "ATLAS": "PUBLIC_LEARNER_SURFACE",
    "DOCENTE_OS": "TEACHER_OPERATIONAL",
    "REGISTRO_DOCENTE": "TEACHER_RECORD",
    "STUDIO_ATLAS": "PROFESSIONAL_AUTHORING",
    "CONTROL_CENTER": "READ_ONLY_OBSERVER",
}
EXPECTED_FIELDS = {"id", "domainRole", "sharedCapabilityCaller", "controlClass", "aliasOf"}


def load_product_registry(path: Path = REGISTRY) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def registered_product_ids(data: dict[str, Any]) -> set[str]:
    products = data.get("products", [])
    if not isinstance(products, list):
        return set()
    return {p.get("id") for p in products if isinstance(p, dict) and isinstance(p.get("id"), str)}


def is_registered_product(product_id: str, data: dict[str, Any]) -> bool:
    return product_id in registered_product_ids(data)


def validate_product_registry(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if data.get("schemaVersion") != "trama.governed-product-identities/v1":
        errors.append("schemaVersion")

    products = data.get("products")
    if not isinstance(products, list):
        return sorted(set(errors + ["products"]))

    ids: list[str] = []
    roles: list[str] = []
    for product in products:
        if not isinstance(product, dict):
            errors.append("products")
            continue
        if set(product) != EXPECTED_FIELDS:
            errors.append("productFields")
        product_id = product.get("id")
        role = product.get("domainRole")
        if isinstance(product_id, str):
            ids.append(product_id)
        if not isinstance(role, str) or not role:
            errors.append("domainRole")
        else:
            roles.append(role)
        if product.get("sharedCapabilityCaller") is not True:
            errors.append("sharedCapabilityCaller")
        if product.get("aliasOf") is not None:
            errors.append("aliasOf")
        control_class = product.get("controlClass")
        if product_id == "CONTROL_CENTER":
            if control_class != "READ_ONLY":
                errors.append("controlCenterReadOnly")
        elif control_class != "DOMAIN_BOUND":
            errors.append("controlClass")
        if isinstance(product_id, str) and product_id in EXPECTED_ROLES and role != EXPECTED_ROLES[product_id]:
            errors.append("domainRole")

    if len(ids) != len(set(ids)):
        errors.append("duplicateProductId")
    if set(ids) != EXPECTED_IDS:
        errors.append("productIds")
    if len(roles) != len(set(roles)):
        errors.append("domainRole")
    return sorted(set(errors))


def main() -> int:
    registry = load_product_registry()
    errors = validate_product_registry(registry)
    result = {"pass": not errors, "errors": errors, "productIds": sorted(registered_product_ids(registry))}
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
