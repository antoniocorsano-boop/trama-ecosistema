# CAP-DOS-ARGO-SYNC — Canonical Didactic Model candidate v1

**Gate:** G1 — Discovery  
**Status:** CANDIDATE_MODEL / NOT_APPROVED  
**Runtime:** NOT_AUTHORIZED  
**Purpose:** provide a stable semantic model for program data independently of Argo file layout.

## 1. Governing principle

The canonical model represents didactic meaning, not spreadsheet rows.

External formats such as XLS/XLSX/CSV are adapters. They do not define entity identity, authority or lifecycle.

## 2. Scope

This candidate model covers the first qualified domain:

```text
school year
→ class
→ subject
→ program
→ module
→ argument
```

It also represents execution state for arguments used in lesson activity.

Student-level data are outside the current scope.

## 3. Entity model

### DidacticProgram

```text
programId
schoolYear
classRef
subjectRef
sourceAuthority
version
status
createdAt
updatedAt
```

### DidacticModule

```text
moduleId
programId
description
order?
originRef?
lineageRef?
version
contentHash
createdAt
updatedAt
```

### DidacticArgument

```text
argumentId
moduleId
description
order?
plannedStatus
performedStatus
performedAt?
deletionEligibility
originRef?
lineageRef?
version
contentHash
createdAt
updatedAt
```

## 4. Required vs optional fields

Derived from the Argo manual evidence:

### Module

Required:
- stable internal ID;
- program reference;
- description.

Optional:
- order.

### Argument

Required:
- stable internal ID;
- module reference;
- description.

Optional:
- order;
- performed date;
- performed state in the external system.

The manual only establishes Argo's required/optional user-facing fields. Internal IDs, lineage, hashes and timestamps are TRAMA model requirements and are not claimed to be Argo fields.

## 5. Planned state vs performed state

The model MUST distinguish:

```text
planned structure
≠
lesson execution state
```

A change from not-performed to performed does not modify the didactic identity of the argument.

Candidate states:

### plannedStatus

```text
ACTIVE
DEFERRED
REMOVED
```

### performedStatus

```text
NOT_PERFORMED
PERFORMED
UNKNOWN
```

`UNKNOWN` is used when the external state cannot be proven.

## 6. Identity rules

1. Spreadsheet row number MUST NOT be used as identity.
2. Description text alone MUST NOT be used as identity.
3. Stable internal IDs survive reorder and text edits.
4. A copied/imported item receives lineage back to its source.
5. A class-local override remains distinguishable from its source/master.

## 7. Lineage

Candidate lineage fields:

```text
originType:
  NATIVE
  COPIED_FROM_CLASS
  COPIED_FROM_PREVIOUS_YEAR
  IMPORTED_FROM_FILE
  DERIVED_FROM_MASTER

originEntityId?
originProgramId?
originClassRef?
originSchoolYear?
```

Lineage records provenance; it does not create authority.

## 8. Deletion eligibility

Because Argo documents that an argument already used in evaluation cannot be deleted, the model must not equate local removal with external deletion.

Candidate field:

```text
deletionEligibility:
  ELIGIBLE
  BLOCKED_BY_USAGE
  UNKNOWN
```

`UNKNOWN` fails closed for external delete proposals.

## 9. Content hash

A deterministic semantic hash may be computed from normalized content fields, excluding volatile execution fields.

Candidate:

```text
moduleHash = hash(description + normalizedOrder)

argumentHash = hash(description + normalizedOrder)
```

Execution state is compared separately so that marking an argument as performed does not create a false structural modification.

## 10. Authority boundaries

- Arena remains authoritative for curriculum.
- Atlas remains authoritative for its publication/material domain.
- Docente OS is the operational teacher-facing model.
- Argo is the institutional destination system for the scoped transfer.
- The canonical model does not become a new curriculum authority.

## 11. Format adapters

Candidate adapters:

```text
XLSX teacher input
CSV exchange
Argo XLS import/export
Argo native class/year reuse
```

Adapters map to/from the canonical model but MUST NOT mutate identity or authority silently.

## 12. Invariants

- import is never equivalent to adoption without validation;
- duplicate candidates are surfaced, not silently merged;
- execution-state changes are separated from structural changes;
- external deletion requires positive eligibility evidence;
- identical semantic content is idempotent;
- lineage is retained across reuse.

## 13. Open questions

- whether Argo XLS carries any stable IDs;
- whether module/argument order is preserved deterministically;
- exact duplicate semantics in native Argo import;
- whether performed state can be safely reconstructed after external edits;
- retention requirements for historical baselines.

## 14. Gate status

This is a G1 candidate model. It becomes a G3 specification only after G2 governance resolves persistence, authority, adapter boundaries and ADR requirements.
