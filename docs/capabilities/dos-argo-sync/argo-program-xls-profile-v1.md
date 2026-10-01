# CAP-DOS-ARGO-SYNC — ARGO_PROGRAM_XLS_PROFILE_v1 Contract

**Lifecycle:** G3 — Specification  
**Status:** VERSIONED_CONTRACT / NOT_RUNTIME  
**Profile ID:** ARGO_PROGRAM_XLS_PROFILE_v1  
**Runtime:** NOT_AUTHORIZED

## 1. Purpose

Define the minimum conformance contract for a Programma Scolastico artifact generated for manual import into Argo didUP.

This contract is intentionally narrower than the full workbook implementation.

## 2. Evidence basis

The contract is based on:

- official Argo documentation for Programma Scolastico;
- one real didUP-exported XLS specimen;
- current didUP import UI stating that only `.xls` files produced with LibreOffice can be imported;
- successful human-operated exact re-import with no duplicate visible content for the tested specimen.

The profile must therefore remain versioned and fail closed when a future Argo export diverges materially.

## 3. Required outer format

Conforming artifact:

- filename extension: `.xls`;
- workbook producer compatibility: LibreOffice;
- binary workbook family: BIFF8-compatible legacy XLS;
- no renamed OOXML `.xlsx`;
- no macros;
- no active external links.

## 4. Worksheet contract

Required worksheet name:

`Dati`

Version 1 expects exactly one semantic data worksheet named `Dati`.

Additional hidden/system worksheets are not permitted in generated output unless a later profile version explicitly authorizes them.

## 5. Header contract

The semantic table must expose, in order:

1. `ORD. MODULO`
2. `MODULO`
3. `ORD. ARGOMENTO`
4. `ARGOMENTO`
5. `STATO SVOLGIMENTO`
6. `DATA SVOLGIMENTO`

Header spelling/order is profile-significant.

## 6. Row grammar

### Module row

A module row must satisfy:

- `MODULO` non-empty;
- `ARGOMENTO` empty;
- module order optional;
- argument-related fields empty unless a later profile version explicitly allows otherwise.

### Argument row

An argument row must satisfy:

- `ARGOMENTO` non-empty;
- a current module context exists from the preceding module row;
- argument order optional;
- state/date optional according to canonical data.

### Invalid row

A row is invalid if:

- both module and argument descriptions are non-empty without a profile rule;
- argument appears before any module context;
- required description is empty;
- unsupported execution-state literal is emitted.

Invalid rows block generation.

## 7. Module field rules

### MODULO

- required on module rows;
- source: canonical `module.description`;
- maximum length: 200 characters;
- must not be silently truncated.

If length exceeds the profile limit, generation is blocked with a teacher-readable validation error.

### ORD. MODULO

- optional;
- source: canonical `module.order`;
- must preserve semantic order;
- must not be used as entity identity.

## 8. Argument field rules

### ARGOMENTO

- required on argument rows;
- source: canonical `argument.description`;
- must not be silently altered.

### ORD. ARGOMENTO

- optional;
- source: canonical `argument.order`;
- must preserve semantic order;
- must not be used as entity identity.

## 9. Execution-state literals

Allowed literals emitted by v1:

- `Non Svolto`
- `Parzialmente Svolto`
- `Svolto`
- blank only when the canonical state is legitimately unspecified and the active mapping rule allows omission.

No other state literal may be emitted by v1.

## 10. Date representation

Teacher-facing/canonical dates are typed dates.

The Argo-facing display representation is:

`DD-MM-YYYY`

A date must not be emitted if the canonical value is invalid or ambiguous.

The workbook writer may choose the BIFF cell representation required for LibreOffice compatibility, but conformance validation must verify that reopening the generated workbook preserves the intended date value.

## 11. Character handling

The generator must preserve:

- Italian accented characters;
- punctuation;
- apostrophes;
- ordinary Unicode text representable by the selected XLS encoding path.

No semantic normalization may silently rewrite teacher content.

## 12. Blank handling

Blank semantic values must be represented consistently.

Whitespace-only descriptions are invalid.

The validator must normalize leading/trailing whitespace for validation but must not rewrite meaningful internal content without an explicit rule.

## 13. Determinism

For the same:

- canonical program version;
- profile version;
- package mode;

the semantic workbook content must be deterministic.

Binary byte-for-byte identity is desirable but not mandatory if LibreOffice metadata makes it unstable.

Semantic conformance and artifact SHA-256 are both recorded.

## 14. Conformance validator

A future validator must verify at minimum:

### Container

- extension is `.xls`;
- file is a valid legacy XLS/BIFF-compatible workbook;
- workbook can be opened through the chosen LibreOffice-compatible generation path.

### Workbook

- required `Dati` sheet exists;
- no unauthorized semantic worksheets;
- headers exactly match v1 contract.

### Rows

- every row matches module/argument grammar;
- no orphan argument row;
- required descriptions present;
- module descriptions <= 200 characters;
- state literals valid;
- date values parse/round-trip correctly;
- order fields do not become identity.

### Safety

- no macros;
- no formulas unless a later version explicitly authorizes them;
- no external links;
- no student-personal data fields;
- no hidden payload outside the profile.

## 15. Validator result

The validator returns one of:

- `PASS`
- `BLOCKED`
- `UNKNOWN_PROFILE`

`BLOCKED` must include machine-readable findings.

`UNKNOWN_PROFILE` must fail closed and instruct the system not to present the artifact as ready for Argo.

## 16. Machine-readable finding shape

Candidate:

```text
findingId
severity
code
sheet?
row?
column?
entityId?
messageKey
technicalDetail?
```

Severity:

- `ERROR`
- `WARNING`
- `INFO`

Any `ERROR` blocks generation/readiness.

## 17. Teacher-facing error examples

Technical finding:

`MODULE_DESCRIPTION_TOO_LONG`

Teacher message:

`Il modulo supera i 200 caratteri previsti da Argo. Riduci la descrizione prima di generare il file.`

Technical finding:

`ORPHAN_ARGUMENT_ROW`

Teacher message:

`Un argomento non è collegato a un modulo. Controlla la programmazione prima di generare il file.`

## 18. Versioning rule

A new profile version is required if any of these change materially:

- workbook family;
- worksheet name;
- header set/order;
- row grammar;
- state literals;
- date contract;
- importer requirements;
- safety requirements.

A profile update does not mutate previous receipts/artifacts.

## 19. Compatibility rule

The system must never silently reinterpret a workbook generated under an older profile as v1 if the conformance evidence is unavailable.

## 20. G3 acceptance criteria

- AC-P01: a valid consolidated canonical program maps to the six v1 fields.
- AC-P02: module descriptions over 200 characters block readiness.
- AC-P03: unsupported state literals block readiness.
- AC-P04: orphan arguments block readiness.
- AC-P05: output is a real `.xls`, not renamed XLSX.
- AC-P06: output contains no macros/external links.
- AC-P07: validator returns PASS before UI exposes "file ready for Argo".
- AC-P08: unknown profile fails closed.
- AC-P09: reopening the generated file preserves semantic values.
- AC-P10: profile version is recorded in the Sync Receipt.

## 21. Runtime boundary

This contract authorizes no implementation.

It is the normative G3 target for later G5 implementation and G6 verification.
