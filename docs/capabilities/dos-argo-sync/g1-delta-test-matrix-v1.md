# CAP-DOS-ARGO-SYNC — G1 Delta Test Matrix v1

**Gate:** G1 — Discovery  
**Status:** REVIEWABLE_TEST_DESIGN / NOT_RUNTIME  
**Runtime:** NOT_AUTHORIZED  
**Depends on:** `canonical-didactic-model-candidate-v1.md`, `delta-contract-candidate-v1.md`, `research-evidence-register.md`

## Purpose

Provide a deterministic, implementation-independent test matrix for the candidate delta contract before any runtime or persistence work.

The matrix is designed to answer:

> Given baseline A and current canonical state B, what is the expected delta, what must remain untouched, and when must the system fail closed?

## Test conventions

- Identity is based on stable internal IDs, never spreadsheet row positions.
- Structural hashes exclude execution-state fields.
- Baseline promotion occurs only after explicit human confirmation.
- Any ambiguity that can affect external state resolves to `CONFLICT`.
- External delete is never inferred from a local `REMOVED` state alone.
- XLS compatibility is out of scope for these tests until a real didUP export is inspected.

## Fixture vocabulary

### Base program

```text
Program P-TEC-2C-2026
  Module M-01: "Tecnica, tecnologia e sistemi"
    A-001: "Tecnica"
    A-002: "Tecnologia"
    A-003: "Sistema tecnologico"
  Module M-02: "Agricoltura come sistema tecnologico"
    A-004: "Elementi del sistema agricolo"
```

Unless stated otherwise:
- all entities are `ACTIVE`;
- all arguments are `NOT_PERFORMED`;
- deletion eligibility is `ELIGIBLE`;
- baseline is `BASELINE_A`.

## Matrix

| ID | Scenario | Baseline → Current | Expected result | Actionable? | Baseline promoted automatically? |
| --- | --- | --- | --- | --- | --- |
| T01 | Identical state | no differences | `NO_OP` / all `UNCHANGED` | No | No |
| T02 | One argument text edit | A-002 description changes | A-002 `MODIFIED` only | Yes | No |
| T03 | One module text edit | M-02 description changes | M-02 `MODIFIED` only | Yes | No |
| T04 | New argument | add A-005 under M-02 | A-005 `NEW` | Yes | No |
| T05 | New module | add M-03 | M-03 `NEW` | Yes | No |
| T06 | Reorder within module | A-003 moves before A-002 | A-003 `MOVED` | Yes | No |
| T07 | Move to another module | A-004 changes parent | A-004 `MOVED` | Yes | No |
| T08 | Performed status only | A-003 becomes `PERFORMED` | `PERFORMANCE_STATUS_CHANGED` only | Usually reviewable, not structural | No |
| T09 | Performed date only | performedAt changes | `PERFORMANCE_STATUS_CHANGED` only | Usually reviewable, not structural | No |
| T10 | Structural + performance change | text + performed state change | `MODIFIED` plus execution dimension retained | Yes | No |
| T11 | Safe local removal | A-001 removed, eligibility `ELIGIBLE` | local `REMOVED`; external delete candidate only | Yes | No |
| T12 | Blocked local removal | A-001 removed, `BLOCKED_BY_USAGE` | `CONFLICT` | Yes, human resolution | No |
| T13 | Unknown delete eligibility | A-001 removed, eligibility `UNKNOWN` | `CONFLICT` | Yes, human resolution | No |
| T14 | Exact duplicate candidate | imported module semantically exact | `EXACT_MATCH → NO_OP` | No | No |
| T15 | Possible duplicate | similar description, no stable identity | `POSSIBLE_MATCH → CONFLICT` | Yes | No |
| T16 | New unmatched import candidate | no plausible match | `NO_MATCH → NEW/import candidate` | Yes | No |
| T17 | Same ID, contradictory parents | same argument ID appears under two modules | `CONFLICT` | Yes | No |
| T18 | Same ID, contradictory content in one snapshot | duplicate entity records disagree | `CONFLICT` | Yes | No |
| T19 | Row reorder only in XLSX source | row changes, canonical order unchanged | `NO_OP` | No | No |
| T20 | Cosmetic whitespace edit | normalized text unchanged | `NO_OP` | No | No |
| T21 | Punctuation/content-significant edit | normalized semantic content changes | `MODIFIED` | Yes | No |
| T22 | 500 unchanged items | identical large fixture | zero actionable deltas | No | No |
| T23 | 499 unchanged + 1 edit | one changed entity | exactly one actionable delta | Yes | No |
| T24 | Re-run before confirmation | same prepared delta | same deterministic delta digest | No new action | No |
| T25 | Re-run after confirmed baseline | current == new baseline | `NO_OP` | No | No |
| T26 | Canonical state changes while package pending | B becomes C before confirmation | old package `SUPERSEDED`; recompute | Yes | No |
| T27 | External result partially known | import outcome partial | result `UNKNOWN`; baseline stays A | Yes | No |
| T28 | External import rejected | failure evidence | `FAILED`; baseline stays A | Yes | No |
| T29 | Human confirms successful import | exact prepared package confirmed | receipt `CONFIRMED`; baseline advances | Yes | Yes, but only after confirmation event |
| T30 | Human rejects proposed change | delta excluded | no external transfer for entity | Yes | No |
| T31 | Copy from previous year | new local entity with lineage | `NEW` + lineage retained | Yes | No |
| T32 | Copy from parallel class | new local entity with lineage | `NEW` + lineage retained | Yes | No |
| T33 | Local override of inherited entity | stable derived entity edited | `MODIFIED`, origin retained | Yes | No |
| T34 | Unknown identity from imported file | text plausible, no reliable ID | `CONFLICT` or `POSSIBLE_MATCH` | Yes | No |
| T35 | Delete previously evaluated argument | Argo rule applies | `CONFLICT / BLOCKED_BY_USAGE` | Yes | No |

## Detailed assertions

### T01 / T22 — unchanged data

Assertions:
- actionable delta count = 0;
- no export/import package required;
- no receipt requiring human action;
- structural digest unchanged.

### T02 — one text edit

Assertions:
- exactly one entity is `MODIFIED`;
- parent module remains unchanged;
- unrelated entities remain `UNCHANGED`;
- no new ID is allocated for the edited argument.

### T06 / T07 — movement

Assertions:
- identity is preserved;
- movement is not represented as delete + create;
- lineage remains unchanged;
- content hash remains unchanged if text is unchanged.

### T08 / T09 — execution state

Assertions:
- structural hash remains unchanged;
- structural export is not required by default;
- execution-state provenance is updated separately.

### T12 / T13 / T35 — unsafe deletion

Assertions:
- no external delete instruction is generated;
- baseline does not advance;
- human review is required;
- conflict reason identifies `BLOCKED_BY_USAGE` or `UNKNOWN`.

### T14 / T15 / T16 — duplicate protection

Assertions:
- exact match never creates a second entity;
- possible match never silently merges;
- no-match may proceed only as a candidate new import.

### T24 / T25 — idempotence

Assertions:
- same inputs produce same delta digest;
- no duplicate sync receipt for the same confirmed semantic state;
- confirmed current state reprocessed produces `NO_OP`.

### T26 — stale prepared package

Assertions:
- previous package is marked `SUPERSEDED`;
- confirmation cannot apply to a stale canonical state without explicit revalidation;
- new delta is calculated from the last confirmed baseline.

## Property-based invariants

A future prototype SHOULD verify these properties across generated fixtures:

1. **Determinism**  
   `diff(A,B) == diff(A,B)`

2. **Identity preservation**  
   reorder does not allocate a new ID.

3. **No-op symmetry for equality**  
   if `A == B`, actionable delta count is zero.

4. **No silent ambiguity**  
   contradictory identity evidence always yields `CONFLICT`.

5. **Fail-closed deletion**  
   external delete requires `deletionEligibility == ELIGIBLE`.

6. **Baseline monotonicity by confirmation**  
   no prepared/failed/unknown sync can advance the confirmed baseline.

7. **Lineage preservation**  
   copying or deriving entities never erases source provenance.

8. **Execution/structure separation**  
   a performed-state-only change cannot become a structural `MODIFIED`.

## Manual-evidence-bound cases

The following cases are directly motivated by the Argo manual:

- T31/T32: reuse from another class or previous year;
- T35: evaluated argument cannot be deleted;
- T08/T09: performed state/date are distinct operational data;
- T14–T16: native import adds selected modules, therefore duplicate protection is required.

The manual does **not** establish exact duplicate semantics, XLS schema, or round-trip behavior. Those remain discovery gaps.

## Exit criteria for this matrix

This matrix can be considered a complete G1 test design when:

- every candidate delta state is exercised;
- every conflict path has a fail-closed test;
- baseline advancement is tested positively and negatively;
- native reuse cases are covered;
- no test assumes undocumented XLS behavior.

It does not close G1 by itself. Real XLS inspection and format evidence remain required.
