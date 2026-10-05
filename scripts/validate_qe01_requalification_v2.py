#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

MANIFEST = Path("governance/runtime/qe01-requalification-v2.json")
LOCAL_GATES = (
    "LOCAL_RUNTIME_BINDING_REOBSERVED",
    "LOCAL_ADAPTER_VERSION_REOBSERVED",
    "LOCAL_PROVIDER_ROUTE_REOBSERVED",
    "LOCAL_CREDENTIAL_REFERENCE_REOBSERVED",
    "EXACT_EXECUTION_TARGET_FROZEN",
    "HUMAN_EXACT_HEAD_REVIEW",
    "HUMAN_AUTHORIZATION_FOR_NEW_EXECUTION",
)


def validate(data: dict) -> list[str]:
    errors: list[str] = []

    if data.get("schemaVersion") != "trama.qe01-requalification/v2":
        errors.append("QE01V2-SCHEMA")
    if data.get("executionId") != "QE-01":
        errors.append("QE01V2-ID")
    if data.get("status") != "REQUALIFICATION_PREPARED_NOT_AUTHORIZED":
        errors.append("QE01V2-STATUS")
    if data.get("executable") is not False:
        errors.append("QE01V2-EXECUTABLE-FORBIDDEN")

    capability = data.get("capability", {})
    if capability.get("id") != "lesson.preparation.observe" or capability.get("mode") != "PROPOSE_ONLY":
        errors.append("QE01V2-CAPABILITY")
    if data.get("decisionOwner") != "DOCENTE_OS":
        errors.append("QE01V2-OWNER")

    prior = data.get("priorCandidate", {})
    if prior.get("pullRequest") != 212 or prior.get("merged") is not False:
        errors.append("QE01V2-PRIOR-CANDIDATE")
    if prior.get("authorizationReusable") is not False:
        errors.append("QE01V2-STALE-AUTHORITY")
    if prior.get("lastRecordedState") != "EXECUTION_FAILED_REQUALIFICATION_REQUIRED":
        errors.append("QE01V2-PRIOR-STATE")

    failure = data.get("priorFailure", {})
    expected_failure = {
        "providerRouteObserved": "deepseek-official",
        "expectedProviderId": "nvidia",
        "expectedModelId": "nvidia/nemotron-3-ultra-550b-a55b",
        "failureClass": "STALE_BINDING",
        "providerErrorClass": "MISSING_CREDENTIAL",
        "modelInvoked": False,
        "validGenerationRequestSent": False,
        "retryCount": 0,
        "mutationObserved": False,
        "personalStudentDataObserved": False,
        "secretMaterialObserved": False,
    }
    if any(failure.get(key) != value for key, value in expected_failure.items()):
        errors.append("QE01V2-PRIOR-FAILURE")

    candidate = data.get("candidate", {})
    if candidate.get("providerType") != "NVIDIA_NIM" or candidate.get("providerId") != "nvidia":
        errors.append("QE01V2-PROVIDER")
    if candidate.get("modelId") != "nvidia/nemotron-3-ultra-550b-a55b":
        errors.append("QE01V2-MODEL")
    if candidate.get("endpointBase") != "https://integrate.api.nvidia.com/v1":
        errors.append("QE01V2-ENDPOINT")
    if candidate.get("adapterId") != "@deepseek-ai/dsh-llm-pi-ai":
        errors.append("QE01V2-ADAPTER")
    for key in ("adapterVersion", "runtimeVersion", "providerRoute"):
        if candidate.get(key) != "REOBSERVE_REQUIRED":
            errors.append("QE01V2-STALE-BINDING")
    if candidate.get("secretRef") != "NVIDIA_API_KEY":
        errors.append("QE01V2-SECRET-REF")

    constraints = data.get("executionConstraints", {})
    if constraints.get("mode") != "PROPOSE_ONLY" or constraints.get("oneShot") is not True:
        errors.append("QE01V2-EXECUTION-MODE")
    if constraints.get("maxRetries") != 0:
        errors.append("QE01V2-RETRIES")
    if constraints.get("mutation") is not False:
        errors.append("QE01V2-MUTATION")
    if constraints.get("personalStudentData") is not False:
        errors.append("QE01V2-STUDENT-DATA")
    if any(constraints.get(key) is not False for key in ("studentProfiles", "studentTracking")):
        errors.append("QE01V2-STUDENT-DATA")
    if any(constraints.get(key) is not False for key in ("secretPersistence", "evidenceMayContainSecrets")):
        errors.append("QE01V2-SECRET-LEAKAGE")
    if constraints.get("networkExecutionAuthorized") is not False:
        errors.append("QE01V2-NETWORK-AUTHORITY")

    authority = data.get("authorityBoundaries", {})
    if any(authority.get(key) is not False for key in ("arenaWrite", "atlasPublish", "docenteOsAutoAdopt", "diaryWrite")):
        errors.append("QE01V2-AUTHORITY")
    if authority.get("controlCenterReadOnly") is not True or authority.get("dosA1") != "RUNTIME_DEFERRED":
        errors.append("QE01V2-AUTHORITY")

    gates = data.get("gates", {})
    evidence = data.get("evidenceRefs", {})
    for gate in ("PRIOR_FAILURE_PRESERVED", "PUBLIC_PROVIDER_MODEL_OBSERVED", "PUBLIC_ADAPTER_PACKAGE_OBSERVED"):
        if gates.get(gate) != "PASS" or not evidence.get(gate):
            errors.append("QE01V2-STATIC-EVIDENCE")
    for gate in LOCAL_GATES:
        value = gates.get(gate)
        if value not in ("BLOCKED", "PASS"):
            errors.append("QE01V2-GATE-STATE")
        if value == "PASS" and not evidence.get(gate):
            errors.append("QE01V2-UNBACKED-GATE")
    if gates.get("HUMAN_AUTHORIZATION_FOR_NEW_EXECUTION") == "PASS":
        errors.append("QE01V2-AUTHORITY-FORBIDDEN")

    blocking = set(data.get("blockingGates", []))
    if blocking != set(LOCAL_GATES):
        errors.append("QE01V2-BLOCKING-GATES")
    if data.get("nextAction") != "LOCAL_REOBSERVATION_REQUIRED":
        errors.append("QE01V2-NEXT-ACTION")
    if data.get("secretHandling") != "REFERENCE_ONLY_NEVER_VALUE":
        errors.append("QE01V2-SECRET-HANDLING")

    return sorted(set(errors))


def main() -> int:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    errors = validate(data)
    print(json.dumps({"pass": not errors, "errors": errors, "status": data.get("status"), "executable": data.get("executable")}, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
