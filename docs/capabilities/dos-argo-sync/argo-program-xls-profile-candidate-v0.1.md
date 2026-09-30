# CAP-DOS-ARGO-SYNC — Argo Program XLS Profile Candidate v0.1

**Gate:** G1 — Discovery  
**Status:** SAMPLE_BOUND / NOT_APPROVED  
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

Observed literal:

```text
"Non svolto" → NOT_PERFORMED
```

Other state literals are not yet evidenced and must not be invented.

## Date mapping

No non-empty date was present in Sample 001. Date storage type, locale and formatting remain unknown.

## Order fields

Sample 001 does not establish a reliable numeric encoding:
- module order is blank;
- argument order contains the literal `.`.

Therefore order parsing must remain tolerant and profile-bound. The system must preserve raw source values in provenance even when a canonical order cannot be derived.

## Import safety

This profile is suitable for **read-only parsing experiments only**.

It is not yet sufficient to:
- generate an Argo-compatible XLS;
- modify the original workbook;
- claim round-trip compatibility;
- automate external import.

## Promotion criteria to v1

At least:
1. second independent export inspected;
2. headers and row grammar confirmed;
3. performed-state literals observed;
4. non-empty date representation observed;
5. order representation observed with real values;
6. unmodified round-trip evidence available;
7. duplicate/import behavior recorded.
