#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

MANIFEST = Path("governance/runtime/argo-g5c-local-proof-package-v1.json")
LOCAL_GATES = (
    "REFERENCE_XLS_GENERATED_FROM_PR647",
    "LIBREOFFICE_OPENING_ATTESTED",
    "DIDUP_MANUAL_IMPORT_ATTESTED",
    "HUMAN_LOCAL_EVIDENCE_REVIEW",
)
STATIC_GATES = (
    "TRAMA_STATE_RECONSTRUCTED",
    "DOCENTE_OS_PR647_RECONSTRUCTED",
    "AUTOMATED_BIFF8_PROOF_RECORDED",
    "LOCAL_PROCEDURE_DEFINED",
)


def validate(data: dict) -> list[str]:
    errors: list[str] = []

    if data.get("schemaVersion") != "trama.argo-g5c-local-proof-package/v1":
        errors.append("ARGOG5C-SCHEMA")
    if data.get("packageId") != "P4":
        errors.append("ARGOG5C-PACKAGE-ID")
    if data.get("capabilityId") != "ARGO_G5C_BIFF8_DIDUP_INTEROP":
        errors.append("ARGOG5C-CAPABILITY")
    if data.get("status") != "ARGO_G5C_LOCAL_PROOF_PACKAGE_PREPARED":
        errors.append("ARGOG5C-STATUS")
    if data.get("executable") is not False:
        errors.append("ARGOG5C-EXECUTABLE-FORBIDDEN")
    if data.get("runtimeAuthorized") is not False:
        errors.append("ARGOG5C-RUNTIME-AUTHORITY-FORBIDDEN")
    if data.get("finalGate") != "LOCAL_EVIDENCE_REQUIRED":
        errors.append("ARGOG5C-FINAL-GATE")

    baseline = data.get("baseline", {})
    if baseline.get("repository") != "antoniocorsano-boop/trama-ecosistema":
        errors.append("ARGOG5C-BASELINE")
    if baseline.get("canonicalMainSha") != "c0ab9f65d42ee88a640afd57ddfac9bef9df6606":
        errors.append("ARGOG5C-BASELINE")

    source = data.get("sourcePackage", {})
    if source.get("repository") != "antoniocorsano-boop/docente-os-2026-27":
        errors.append("ARGOG5C-SOURCE")
    if source.get("pullRequest") != 647:
        errors.append("ARGOG5C-SOURCE")
    if source.get("exactHead") != "e5dd179f074421f08b2c7952238fa0764d643ce6":
        errors.append("ARGOG5C-SOURCE-HEAD")
    if source.get("pullRequestState") != "DRAFT":
        errors.append("ARGOG5C-SOURCE-STATE")
    if source.get("productCiRun") != 36815526706 or source.get("productCiConclusion") != "success":
        errors.append("ARGOG5C-SOURCE-CI")
    if source.get("qualifiedState") != "PRONTA_PER_PROVA_REALE":
        errors.append("ARGOG5C-SOURCE-QUALIFIED-STATE")

    automated = data.get("automatedEvidence", {})
    expected_true = (
        "biff8Writer",
        "sixColumnDatiSheet",
        "semanticRoundTrip",
        "oleCfbSignature",
        "noFormulas",
        "noHyperlinks",
        "noVbaPayload",
        "profileValidatorBlocksGeneration",
    )
    if any(automated.get(key) is not True for key in expected_true):
        errors.append("ARGOG5C-AUTOMATED-EVIDENCE")
    if automated.get("libreOfficeOpened") is not False or automated.get("didupImported") is not False:
        errors.append("ARGOG5C-LOCAL-EVIDENCE-NOT-OBSERVED")

    prohibitions = data.get("prohibitions", {})
    if prohibitions.get("argoCredentials") is not False:
        errors.append("ARGOG5C-CREDENTIALS-FORBIDDEN")
    if prohibitions.get("browserAutomation") is not False:
        errors.append("ARGOG5C-BROWSER-AUTOMATION-FORBIDDEN")
    if prohibitions.get("externalWrite") is not False:
        errors.append("ARGOG5C-EXTERNAL-WRITE-FORBIDDEN")
    if prohibitions.get("productionPromotion") is not False:
        errors.append("ARGOG5C-PRODUCTION-FORBIDDEN")
    if prohibitions.get("dosA1Activation") is not False:
        errors.append("ARGOG5C-DOSA1-FORBIDDEN")
    if prohibitions.get("personalStudentData") is not False:
        errors.append("ARGOG5C-STUDENT-DATA-FORBIDDEN")

    gates = data.get("gates", {})
    evidence = data.get("evidenceRefs", {})
    for gate in STATIC_GATES:
        if gates.get(gate) != "PASS" or not evidence.get(gate):
            errors.append("ARGOG5C-STATIC-GATE")
    for gate in LOCAL_GATES:
        value = gates.get(gate)
        if value not in ("BLOCKED", "PASS"):
            errors.append("ARGOG5C-GATE-STATE")
        if value == "PASS" and not evidence.get(gate):
            errors.append("ARGOG5C-UNBACKED-LOCAL-GATE")
    if gates.get("DIDUP_MANUAL_IMPORT_ATTESTED") == "PASS" and gates.get("LIBREOFFICE_OPENING_ATTESTED") != "PASS":
        errors.append("ARGOG5C-DIDUP-WITHOUT-LIBREOFFICE")

    if set(data.get("blockingGates", [])) != set(LOCAL_GATES):
        errors.append("ARGOG5C-BLOCKING-GATES")

    procedure = data.get("futureLocalProcedure", [])
    if [step.get("step") for step in procedure] != list(range(1, 8)):
        errors.append("ARGOG5C-PROCEDURE-STEPS")
    procedure_text = "\n".join(step.get("action", "") for step in procedure)
    for token in ("non-personal", "BIFF8", "LibreOffice", "didUP", "attestation"):
        if token not in procedure_text:
            errors.append("ARGOG5C-PROCEDURE-COVERAGE")

    if data.get("dosA1") != "RUNTIME_DEFERRED":
        errors.append("ARGOG5C-DOSA1")
    if data.get("nextAction") != "LOCAL_LIBREOFFICE_DIDUP_PROOF_REQUIRED":
        errors.append("ARGOG5C-NEXT-ACTION")

    return sorted(set(errors))


def main() -> int:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    errors = validate(data)
    print(json.dumps({"pass": not errors, "errors": errors, "status": data.get("status"), "finalGate": data.get("finalGate")}, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
