#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

ALLOWED_STATUS = {
    "DOCUMENTED",
    "IMPLEMENTED",
    "VERIFIED",
    "THIRD_PARTY_VERIFIED",
    "FORMALLY_CERTIFIED",
    "PARTIAL",
    "TO_VERIFY",
    "NOT_APPLICABLE",
    "BLOCKED",
}

ALLOWED_CLAIM_TYPES = {
    "EVIDENCE_BACKED_CLAIM",
    "INDEPENDENT_ASSESSMENT",
    "FORMAL_CERTIFICATION",
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def validate_claim(claim: dict) -> None:
    rid = claim.get("requirementId", "<unknown>")
    status = claim.get("status")
    claim_type = claim.get("claimType")

    if status not in ALLOWED_STATUS:
        raise ValueError(f"{rid}: invalid status {status}")
    if claim_type not in ALLOWED_CLAIM_TYPES:
        raise ValueError(f"{rid}: invalid claim type {claim_type}")

    evidence_refs = claim.get("evidenceRefs", [])
    if status in {"IMPLEMENTED", "VERIFIED", "THIRD_PARTY_VERIFIED", "FORMALLY_CERTIFIED"} and not evidence_refs:
        raise ValueError(f"{rid}: status {status} requires evidenceRefs")

    if status in {"VERIFIED", "THIRD_PARTY_VERIFIED", "FORMALLY_CERTIFIED"}:
        if not claim.get("verifiedAt"):
            raise ValueError(f"{rid}: status {status} requires verifiedAt")
        if not claim.get("versionRef"):
            raise ValueError(f"{rid}: status {status} requires versionRef")

    if status == "THIRD_PARTY_VERIFIED":
        if claim_type != "INDEPENDENT_ASSESSMENT":
            raise ValueError(f"{rid}: THIRD_PARTY_VERIFIED requires INDEPENDENT_ASSESSMENT")
        if not claim.get("assessor"):
            raise ValueError(f"{rid}: THIRD_PARTY_VERIFIED requires assessor")

    if status == "FORMALLY_CERTIFIED":
        if claim_type != "FORMAL_CERTIFICATION":
            raise ValueError(f"{rid}: FORMALLY_CERTIFIED requires FORMAL_CERTIFICATION")
        for key in ("assessor", "standardRef", "externalCertificateRef"):
            if not claim.get(key):
                raise ValueError(f"{rid}: FORMALLY_CERTIFIED requires {key}")

    if claim_type == "FORMAL_CERTIFICATION" and status not in {
        "FORMALLY_CERTIFIED",
        "TO_VERIFY",
        "NOT_APPLICABLE",
        "BLOCKED",
    }:
        raise ValueError(
            f"{rid}: FORMAL_CERTIFICATION cannot use non-certification status {status}"
        )

    text_fields = " ".join(
        str(claim.get(key) or "")
        for key in ("scope", "standardRef")
    ).lower()
    if "gdpr compliant" in text_fields and status != "FORMALLY_CERTIFIED":
        raise ValueError(f"{rid}: broad GDPR compliance claim is not allowed without formal certification")


def validate_registry(registry: dict) -> None:
    claims = registry.get("claims", [])
    ids = [claim.get("requirementId") for claim in claims]
    if not claims:
        raise ValueError("Assurance registry requires at least one claim")
    if any(not rid for rid in ids):
        raise ValueError("Every assurance claim requires requirementId")
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate assurance requirementId")
    for claim in claims:
        validate_claim(claim)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--registry",
        default="config/stakeholder-assurance-registry.json",
    )
    args = parser.parse_args()
    registry = load_json(ROOT / args.registry)
    validate_registry(registry)
    print("TRAMA_STAKEHOLDER_ASSURANCE_REGISTRY_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
