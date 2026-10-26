# ARGO-G5C Local Proof Package v1

**Date:** 2026-10-05  
**Baseline:** `main@c0ab9f65d42ee88a640afd57ddfac9bef9df6606`  
**State:** `ARGO_G5C_LOCAL_PROOF_PACKAGE_PREPARED`  
**Final gate:** `LOCAL_EVIDENCE_REQUIRED`

> **DO NOT DECLARE PASS** for LibreOffice, BIFF8 real interoperability or didUP until the local evidence listed below exists. This package prepares the proof; it does not perform it.

## 1. P4 real state

P4 / Argo G5-C remains open.

Current source package:

- **Docente OS #647** — `CAP-DOS-ARGO-SYNC G5-C: BIFF8 XLS proof`;
- exact head: `e5dd179f074421f08b2c7952238fa0764d643ce6`;
- PR state: `DRAFT`;
- Product CI: run `36815526706`, `success`;
- qualified state: `PRONTA_PER_PROVA_REALE`.

The automated proof records a BIFF8 writer, the didUP six-column `Dati` sheet, semantic round-trip, OLE/CFB signature check and the absence of formulas, hyperlinks and VBA payload. This is useful and necessary, but it is not sufficient to close P4.

## 2. What is complete in cloud/GitHub

The following work is complete without a PC:

- TRAMA state reconstructed from `STATUS.md`, the audit and Project Knowledge;
- Docente OS #647 reconstructed and pinned to exact head;
- automated BIFF8 proof recorded without reinterpreting it as real interoperability;
- fail-closed manifest added at `governance/runtime/argo-g5c-local-proof-package-v1.json`;
- deterministic validator added at `scripts/validate_argo_g5c_local_proof_package.py`;
- adversarial tests added at `tests/test_argo_g5c_local_proof_package.py`;
- explicit Governance gate added.

## 3. What really requires LibreOffice locally

The following items require a real local LibreOffice observation:

- open the generated non-personal BIFF8 `.xls` workbook;
- verify the `Dati` sheet;
- verify the six expected columns;
- verify dates, times and text characters after opening;
- record whether LibreOffice opens, warns, changes or rejects the file.

No cloud assertion can replace this observation.

## 4. What really requires didUP/manual attestation

The following items require the authorized didUP context and manual action:

- import the same non-personal BIFF8 workbook in didUP;
- verify that didUP accepts the file;
- compare imported rows with the source rows;
- record a human attestation with date, exact PR head, workbook identifier and result.

No Argo credentials, no browser automation and no external writes are authorized by this package.

## 5. Minimal future procedure

1. Open Docente OS PR #647 at exact head `e5dd179f074421f08b2c7952238fa0764d643ce6`.
2. Generate or download only the **non-personal** BIFF8 `.xls` reference workbook prepared for G5-C.
3. Open the workbook in **LibreOffice**.
4. Check the `Dati` sheet: six columns, dates, times and text characters.
5. If LibreOffice rejects or changes the file, stop and record the incompatibility.
6. If LibreOffice is acceptable, manually import the same file in **didUP** from the authorized user context.
7. Record the attestation and return it to TRAMA for Human Review.

## 6. Active blockers

The manifest deliberately keeps these gates blocked:

- `REFERENCE_XLS_GENERATED_FROM_PR647`;
- `LIBREOFFICE_OPENING_ATTESTED`;
- `DIDUP_MANUAL_IMPORT_ATTESTED`;
- `HUMAN_LOCAL_EVIDENCE_REVIEW`.

They may move to `PASS` only with evidence references. A `PASS` without evidence is rejected by the validator.

## 7. Boundaries

This package does not authorize:

- Argo credentials;
- didUP credentials in repository content or logs;
- browser automation;
- external writes;
- production promotion;
- personal student data;
- runtime activation;
- `DOS-A1`.

`DOS-A1=RUNTIME_DEFERRED` remains unchanged.

## 8. Exit condition

The current exit condition is:

`LOCAL_EVIDENCE_REQUIRED`

P4 can advance only after the real LibreOffice and didUP evidence is added and reviewed. Until then, the truthful state remains prepared, deterministic and fail-closed, not complete.
