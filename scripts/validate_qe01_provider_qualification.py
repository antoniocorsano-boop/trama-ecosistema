#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

PATH = Path("governance/runtime/qe01-provider-qualification-v1.json")

REQUIRED_GATES = [
    "RUNTIME_IDENTITY_OBSERVED",
    "ADAPTER_IDENTITY_OBSERVED",
    "PROVIDER_IDENTITY_OBSERVED",
    "MODEL_IDENTITY_OBSERVED",
    "PROVIDER_CONFIGURATION_VERIFIED",
    "NO_SILENT_SUBSTITUTION",
    "NO_MODEL_INVOCATION_DURING_QUALIFICATION",
]


def validate(d: dict) -> list[str]:
    errors: list[str] = []

    if d.get("schemaVersion") != "trama.qe01-provider-qualification/v1":
        errors.append("QE01-PQ-SCHEMA")
    if d.get("executionId") != "QE-01":
        errors.append("QE01-PQ-ID")
    if d.get("capabilityId") != "lesson.preparation.observe":
        errors.append("QE01-PQ-CAPABILITY")

    policy = d.get("qualificationPolicy", {})
    for key in (
        "requireObservedRuntimeIdentity",
        "requireObservedProviderIdentity",
        "requireObservedModelIdentity",
        "requireAdapterIdentity",
        "requireConfiguredProvider",
    ):
        if policy.get(key) is not True:
            errors.append("QE01-PQ-POLICY")
    for key in (
        "allowCatalogOnlyIdentity",
        "allowSilentModelSubstitution",
        "allowFallbackProvider",
        "invokeModelDuringQualification",
    ):
        if policy.get(key) is not False:
            errors.append("QE01-PQ-POLICY")

    constraints = d.get("executionConstraints", {})
    if constraints.get("mode") != "PROPOSE_ONLY":
        errors.append("QE01-PQ-MODE")
    if constraints.get("oneShot") is not True or constraints.get("maxRetries") != 0:
        errors.append("QE01-PQ-ONESHOT")
    if constraints.get("mutation") is not False:
        errors.append("QE01-PQ-MUTATION")
    if constraints.get("personalStudentData") is not False:
        errors.append("QE01-PQ-DATA")
    if constraints.get("dosA1") != "RUNTIME_DEFERRED":
        errors.append("QE01-PQ-DOSA1")

    gates = d.get("gates", {})
    if any(key not in gates for key in REQUIRED_GATES):
        errors.append("QE01-PQ-GATES")

    observed = d.get("observedBinding", {})
    observed_complete = all(
        observed.get(key)
        for key in (
            "runtimeVersion",
            "adapterId",
            "adapterVersion",
            "providerId",
            "modelId",
            "runtimeProfileRef",
            "source",
            "observedAt",
        )
    ) and observed.get("providerConfigured") is True

    all_gates = all(gates.get(key) is True for key in REQUIRED_GATES)
    qualified = d.get("qualified") is True
    status = d.get("status")

    if qualified:
        if status != "PROVIDER_REAL_QUALIFIED":
            errors.append("QE01-PQ-STATE")
        if not observed_complete or not all_gates:
            errors.append("QE01-PQ-INCOMPLETE")
    else:
        if status not in (
            "AWAITING_REAL_PROVIDER_OBSERVATION",
            "PROVIDER_OBSERVED_NOT_QUALIFIED",
        ):
            errors.append("QE01-PQ-PENDING-STATE")
        if status == "AWAITING_REAL_PROVIDER_OBSERVATION" and observed_complete:
            errors.append("QE01-PQ-STALE-STATE")

    return sorted(set(errors))


def main() -> int:
    data = json.loads(PATH.read_text(encoding="utf-8"))
    errors = validate(data)
    print(json.dumps({
        "pass": not errors,
        "errors": errors,
        "status": data.get("status"),
        "qualified": data.get("qualified"),
    }, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
