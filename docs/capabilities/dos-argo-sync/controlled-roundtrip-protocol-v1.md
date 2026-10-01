# CAP-DOS-ARGO-SYNC — Controlled Round-Trip Protocol v1

**Gate:** G1 — Discovery  
**Status:** TEST_PROTOCOL / HUMAN-OPERATED  
**Runtime:** NOT_AUTHORIZED  
**External write automation:** FORBIDDEN

## Purpose

Define the minimal, controlled experiment required to learn didUP import semantics without introducing automation, credentials, or an unsupported write path.

The experiment is performed manually by the authorized human user in Argo.

## Scope

This protocol tests only the **Programma Scolastico XLS import/export path**.

It does not test:
- browser automation;
- credential handling;
- API access;
- student data;
- automatic write-back;
- generated XLS compatibility.

## Preconditions

Before the test:

- source program state is known;
- an XLS export is obtained directly from didUP;
- SHA-256 of the exported file is recorded;
- the file is not modified;
- current class/matter/program state is documented;
- the tester knows how to restore or remove any duplicate content manually if Argo creates it.

## Test R1 — Unmodified round-trip

### Objective

Determine whether didUP accepts an XLS exported by didUP itself when re-imported unchanged and how it treats already-present content.

### Steps

1. Open **Didattica → Programma Scolastico** for the same class and subject from which the XLS was exported.
2. Record the current module/argument list.
3. Use the documented XLS import function.
4. Select the **unmodified original XLS**.
5. Do not confirm any destructive prompt without recording it.
6. Complete the import manually.
7. Record:
   - success/failure message;
   - warnings;
   - whether modules are duplicated;
   - whether existing modules are updated;
   - whether nothing changes;
   - whether import is partial;
   - whether order/state/date change.
8. Export the resulting Programma Scolastico again.
9. Preserve the post-import XLS as evidence.

## Required evidence

For R1 record:

```text
testId
timestamp
didUP version
class
subject
sourceFileSha256
preImportModuleCount
preImportArgumentCount
importMessage
postImportModuleCount
postImportArgumentCount
observedBehavior
postExportSha256
notes
```

No student data are required.

## Expected classifications

### NO_OP_REIMPORT

Same content remains exactly once and no semantic change is observed.

### APPEND_DUPLICATE

Existing modules/arguments are duplicated.

### UPDATE_EXISTING

Existing entities are updated/replaced.

### PARTIAL_IMPORT

Only part of the source is imported.

### REJECTED

didUP rejects the file.

### UNKNOWN

The observed result cannot be classified reliably.

## Pass criterion

R1 passes as discovery evidence if the result is reproducible and can be classified unambiguously.

A successful import is **not** by itself a PASS for adapter generation.

## Test R2 — Second richer export

Independent of R1, obtain a richer export containing:
- multiple modules;
- multiple arguments;
- non-empty order values;
- at least one performed state;
- at least one performed date.

R2 is read-only evidence acquisition and should occur before any modified-file experiment.

## Test R3 — Minimally modified copy

**NOT AUTHORIZED BY THIS PROTOCOL YET.**

R3 may be proposed only after:
- R1 result is known;
- R2 profile comparison is complete;
- G1 review confirms that a minimally modified copy is safe to test.

## Safety rules

- use only a class/subject context where the tester is authorized to operate;
- do not use student-personal data;
- do not automate login or import;
- do not overwrite unknown data without a recovery path;
- stop on unexpected prompts or ambiguous behavior;
- keep the original export immutable;
- never infer success from absence of an error message alone.

## Decision use

R1 + R2 results determine whether:
- native Argo reuse is sufficient;
- XLS round-trip can be treated as stable;
- duplicate protection must be mandatory;
- generated/modified XLS should remain out of scope.

## Human evidence receipt template

```text
CAP-DOS-ARGO-SYNC / R1
Date:
didUP version:
Class:
Subject:
Source SHA-256:
Pre-state:
Import message:
Observed behavior:
Post-state:
Post-export SHA-256:
Result classification:
Human notes:
```

## Gate effect

This protocol does not close G1 automatically.

G1 may only advance after the recorded evidence is reviewed against:
- the real-file profile;
- the delta contract;
- the conflict model;
- authority and safety boundaries.


## R1 observed execution status

**Execution date:** 2026-10-01  
**Operator:** authorized human user  
**Observed import message:** successful upload/import reported by didUP  
**Classification:** `EXACT_REIMPORT_NO_DUPLICATE`

The transport/import validation step succeeded and the post-state was visually verified.

Observed:
- one module `0TEST`;
- one argument `arg1`;
- no duplicated visible content;
- argument remains `Non Svolto`.

Therefore the tested identical re-import is **idempotent at visible semantic level**. The internal mechanism (dedupe vs replacement/update) remains unspecified.


## R1 final result

**Result:** `EXACT_REIMPORT_NO_DUPLICATE`  
**Evidence:** direct human observation + screenshots  
**Discovery effect:** exact identical re-import does not create duplicate visible program content for the tested specimen.

The current didUP import UI also states that only `.xls` files produced with LibreOffice can be imported. This becomes a direct interoperability constraint for future adapter design.
