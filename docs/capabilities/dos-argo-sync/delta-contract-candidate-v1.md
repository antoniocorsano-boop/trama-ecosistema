# CAP-DOS-ARGO-SYNC — Delta Contract candidate v1

**Gate:** G1 — Discovery  
**Status:** CANDIDATE_CONTRACT / NOT_APPROVED  
**Runtime:** NOT_AUTHORIZED

## 1. Purpose

Define how two versions of the canonical didactic model are compared without treating the whole program as changed.

```text
baseline
  +
current canonical state
  ↓
deterministic delta
```

## 2. Comparison unit

Comparison occurs by stable entity ID.

Fallback matching by text, order or spreadsheet position is heuristic only and MUST produce uncertainty when identity cannot be established.

## 3. Delta states

### Structural

- `NEW` — entity absent from baseline, present now.
- `MODIFIED` — same entity, semantic content changed.
- `UNCHANGED` — same entity, same semantic content.
- `MOVED` — same entity, order/parent placement changed.
- `REMOVED` — entity present in baseline, absent or locally removed now.
- `CONFLICT` — evidence is ambiguous, contradictory or unsafe to apply.

### Execution

- `PERFORMANCE_STATUS_CHANGED` — performed state/date changed without structural content change.

## 4. Determinism

Given the same baseline and same current canonical state, the engine MUST produce the same delta set and ordering.

Repeated processing of an already-confirmed identical state MUST produce `NO_OP`.

## 5. Precedence rules

If more than one condition applies:

1. identity conflict → `CONFLICT`;
2. removal with unsafe/unknown delete eligibility → `CONFLICT`;
3. parent change/order change → `MOVED`;
4. semantic content change → `MODIFIED`;
5. execution-only change → `PERFORMANCE_STATUS_CHANGED`;
6. otherwise → `UNCHANGED`.

A single implementation may expose multiple dimensions internally, but the user-facing state must not conceal conflicts.

## 6. Removal semantics

`REMOVED` is a local semantic state, not an instruction to delete externally.

Before any external delete proposal:

```text
REMOVED
  ↓
deletionEligibility?
  ├─ ELIGIBLE → delete candidate
  ├─ BLOCKED_BY_USAGE → CONFLICT
  └─ UNKNOWN → CONFLICT
```

The Argo manual evidence that evaluated arguments cannot be deleted is the first known blocking rule.

## 7. Native-first transfer planning

The delta contract does not require all deltas to be transferred through XLS.

Candidate routing:

```text
NEW module
  → native Argo import/reuse candidate where applicable

MODIFIED argument
  → external update path still to be qualified

UNCHANGED
  → NO_OP

PERFORMANCE_STATUS_CHANGED
  → do not re-export structural program by default

CONFLICT
  → human review required
```

## 8. Duplicate protection

Because native import adds selected modules to existing ones, duplicate risk must be explicitly managed.

Before import of a module, the system should classify:

```text
NO_MATCH
POSSIBLE_MATCH
EXACT_MATCH
```

- `EXACT_MATCH` → `NO_OP`;
- `POSSIBLE_MATCH` → `CONFLICT`;
- `NO_MATCH` → import candidate.

Exact matching criteria remain to be validated.

## 9. Baseline advancement

A produced file or import plan does not advance the baseline.

Candidate lifecycle:

```text
BASELINE_A
→ DELTA
→ PREVIEW
→ USER_ACTION
→ EXTERNAL_IMPORT
→ USER_CONFIRMS_SUCCESS
→ BASELINE_B
```

If the external result is uncertain, baseline remains unchanged.

## 10. Sync receipt

Each candidate sync should record:

```text
syncId
baselineVersion
currentVersion
deltaDigest
adapter
adapterVersion
entityIds[]
artifactDigest?
decision
confirmedByHuman
confirmedAt?
resultState
```

Candidate result states:

```text
PREPARED
AWAITING_CONFIRMATION
CONFIRMED
FAILED
UNKNOWN
SUPERSEDED
```

## 11. Failure and recovery

- partial external success → `UNKNOWN`, no baseline promotion;
- malformed or rejected file → `FAILED`;
- duplicate ambiguity → `CONFLICT`;
- changed canonical state while confirmation is pending → prior package becomes `SUPERSEDED`;
- reprocessing an unchanged confirmed state → `NO_OP`.

## 12. Human control

The review surface should allow at least:

- accept;
- keep previous;
- edit;
- exclude;
- resolve conflict.

Bulk acceptance is allowed only for non-conflicting, homogeneous changes and must remain reversible before external import.

## 13. Acceptance criteria candidate

A prototype is acceptable for G1 evidence when it can demonstrate:

1. 500 unchanged items → zero actionable changes;
2. one description edit → exactly one `MODIFIED`;
3. one reorder → exactly one `MOVED`;
4. one performed-state update → no structural modification;
5. one repeated identical input → `NO_OP`;
6. one unsafe removal → `CONFLICT`;
7. duplicate candidate → no silent import;
8. baseline unchanged until human confirmation.

## 14. Open questions

- how to classify external edits made directly in Argo;
- whether a round-trip baseline can be reconstructed from XLS;
- whether Argo exposes enough information to distinguish update from duplicate;
- how module-level native import should coexist with argument-level local deltas.

## 15. Gate status

This is a G1 candidate contract. Persistence semantics, external write boundaries and final state machine require G2 governance and G3 specification.
