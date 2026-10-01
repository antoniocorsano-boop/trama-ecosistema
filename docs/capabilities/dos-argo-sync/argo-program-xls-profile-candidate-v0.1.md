# CAP-DOS-ARGO-SYNC — Argo Program XLS Profile Candidate v0.1

**Gate:** G1 — Discovery  
**Status:** SAMPLE_BOUND + OFFICIAL_DOC_CORROBORATED / NOT_APPROVED  
**Source evidence:** Real Argo XLS Sample Evidence 001  
**Runtime:** NOT_AUTHORIZED

## Profile identity

```text
profileId: ARGO_PROGRAM_XLS_CANDIDATE_0_1
container: CDFV2
workbookFormat: BIFF8
worksheet: Dati
columnCount: 6
```

## Column contract candidate

| Index | Header | Canonical target | Required by observed sample? |
| ---: | --- | --- | --- |
| 0 | ORD. MODULO | `module.order` | no |
| 1 | MODULO | `module.description` | yes for module rows |
| 2 | ORD. ARGOMENTO | `argument.order` | no |
| 3 | ARGOMENTO | `argument.description` | yes for argument rows |
| 4 | STATO SVOLGIMENTO | `argument.performedStatus` | no |
| 5 | DATA SVOLGIMENTO | `argument.performedAt` | no |

## Candidate row grammar

```text
MODULE_ROW :=
  MODULO != empty
  AND ARGOMENTO == empty

ARGUMENT_ROW :=
  ARGOMENTO != empty
  AND currentModuleContext exists

EMPTY_ROW :=
  all semantic fields empty
```

A row that violates these rules is `UNCLASSIFIED` and must fail closed during import mapping.

## State mapping candidate

Official Argo documentation corroborates the three user-facing states:

```text
"Non Svolto" → NOT_PERFORMED
"Parzialmente Svolto" → PARTIALLY_PERFORMED
"Svolto" → PERFORMED
```

Case/spacing normalization remains an adapter concern; raw source literals must be retained in provenance.

## Date mapping

Official Argo documentation shows dates in the user-facing form `DD-MM-YYYY` (for example `11-10-2019`, `05-06-2018`, `04-07-2018`).

The **binary cell storage type inside XLS remains unproven** because Sample 001 has an empty date. The adapter must distinguish display format from BIFF storage representation.

## Order fields

Official didUP documentation describes `Num Ordine` for modules and arguments and shows numeric examples. An older official ScuolaNext manual also describes numeric order with the next available number proposed automatically.

Sample 001, however, contains blank/module and literal `.`/argument order values. Therefore:
- canonical order should not be constrained to integer-only parsing at the adapter boundary;
- raw source values must be preserved;
- numeric normalization is allowed only when the source value is demonstrably numeric.

## Import safety

This profile is suitable for **read-only parsing experiments only**.

It is not yet sufficient to:
- generate an Argo-compatible XLS;
- modify the original workbook;
- claim round-trip compatibility;
- automate external import.

## Promotion criteria to v1

At least:
1. second independent export inspected **or** equivalent structural stability evidence;
2. headers and row grammar confirmed;
3. state literals corroborated — **DONE via official documentation**;
4. user-facing date format corroborated — **DONE via official documentation**;
5. order semantics corroborated — **DONE conceptually via official documentation**, binary/sample variability remains;
6. unmodified round-trip evidence available;
7. duplicate/import behavior recorded.


## Current didUP UI import constraint

Direct UI evidence from 2026-10-01 states:

```text
È possibile importare solo file con estensione .xls prodotti con LibreOffice
```

Therefore the candidate profile must now include:

```text
extension: .xls
producerCompatibility: LibreOffice
```

This supports a future LibreOffice-compatible generation strategy, subject to G2/G3 governance and controlled validation.

## Exact re-import behavior

For Sample 001, importing the same file back into didUP:
- was accepted;
- produced no duplicate visible module;
- produced no duplicate visible argument.

Candidate semantic invariant:

```text
exact identical re-import
→ no duplicate visible content
```

This does not yet define how changed existing records are reconciled.
