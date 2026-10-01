# CAP-DOS-ARGO-SYNC — G1 Reference Oracle v1

**Gate:** G1 — Discovery  
**Status:** REFERENCE_ORACLE / NOT_RUNTIME  
**Runtime:** NOT_AUTHORIZED

## Purpose

Define the smallest deterministic oracle needed to validate the candidate delta contract independently of any XLS parser, database, UI or external integration.

The oracle consumes two canonical snapshots:

```text
baseline
current
```

and returns:

```text
delta[]
deltaDigest
actionableCount
conflictCount
baselineAdvanceAllowed
```

## Evaluation order

For each stable entity ID:

1. **Identity ambiguity**  
   contradictory evidence for the same ID → `CONFLICT`.

2. **Presence**  
   absent in baseline + present in current → `NEW`;  
   present in baseline + absent/removed in current → evaluate deletion eligibility.

3. **Parent/order**  
   parent or canonical order changed → `MOVED`.

4. **Structural content**  
   normalized semantic content changed → `MODIFIED`.

5. **Execution state**  
   performed status/date changed only → `PERFORMANCE_STATUS_CHANGED`.

6. **Equality**  
   otherwise → `UNCHANGED`.

## Removal rule

```text
local REMOVED
  + ELIGIBLE
  → REMOVED

local REMOVED
  + BLOCKED_BY_USAGE
  → CONFLICT

local REMOVED
  + UNKNOWN
  → CONFLICT
```

`REMOVED` means only that the canonical state no longer contains the entity. It is not an external delete instruction.

## Duplicate rule

For imported/reused candidates without a reliable stable ID:

```text
semantic exact match
→ EXACT_MATCH / NO_OP

plausible but non-exact match
→ POSSIBLE_MATCH / CONFLICT

no plausible match
→ NO_MATCH / NEW candidate
```

The exact similarity mechanism is intentionally unspecified in G1.

## Normalization boundary

Permitted G1 normalization:

- trim leading/trailing whitespace;
- normalize repeated internal whitespace;
- normalize Unicode composition.

Not permitted as silent normalization:

- punctuation removal;
- case folding when it could change didactic meaning;
- synonym substitution;
- stemming;
- semantic rewriting.

The oracle therefore avoids claiming semantic equivalence beyond deterministic textual normalization.

## Delta digest

The digest input must be a canonical, sorted representation of actionable delta records, including:

```text
entityId
entityType
state
fromParent?
toParent?
fromOrder?
toOrder?
fromContentHash?
toContentHash?
conflictReason?
```

`UNCHANGED` records may be omitted from the digest if the omission rule is stable and documented.

## Baseline advancement

`baselineAdvanceAllowed` is true only if:

- external result is `CONFIRMED`;
- confirmation refers to the exact prepared delta digest;
- current canonical state still matches the prepared state;
- conflict count is zero for the confirmed scope.

Prepared, failed, unknown, superseded or rejected states never advance the baseline.

## Reference invariants

1. Same inputs → same outputs.
2. Same semantic state after confirmation → `NO_OP`.
3. Row position changes alone → no structural delta.
4. Execution-only changes → no structural delta.
5. Ambiguity → conflict, never silent merge.
6. Unknown deletion eligibility → conflict.
7. Human confirmation binds to an exact digest, not to a vague "latest state".

## Out of scope

- parsing XLS/XLSX/CSV;
- Argo workbook structure;
- external write automation;
- database schema;
- UI;
- similarity algorithm beyond deterministic exact match;
- authorization of persistence.

## Exit use

This oracle is the expected-behavior reference for future tests. An implementation that disagrees with it must either be corrected or trigger a governed change to the candidate contract before G2/G3 promotion.
