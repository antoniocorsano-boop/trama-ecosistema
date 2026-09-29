# TRAMA Maturity Evidence Binding v1

**Contract ID:** TRAMA-MATURITY-EVIDENCE-BINDING-01  
**Date:** 2026-09-29  
**Status:** IMPLEMENTATION SLICE / READ_ONLY PROJECTION / HUMAN REVIEW REQUIRED  
**Parent:** TRAMA-MATURITY-RECONCILIATION-01 · TRAMA-ADR-014  
**Runtime authority:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

Bind already-existing, version-bound evidence to the product maturity model without manufacturing maturity and without changing product authority.

The authoritative structured input for this slice is:

`governance/maturity/trama-maturity-evidence-registry-v1.json`

The registry is governed evidence metadata. It does not approve, merge, deploy, promote lifecycle, or authorize runtime.

## 2. Evidence source hierarchy

Evidence may come from:

1. canonical TRAMA documents and source registry;
2. approved or implemented TRAMA decisions;
3. exact repository heads and workflow runs;
4. explicit human-review receipts;
5. governed semantic timeline events.

External repository observations used by this first binding pass are durably summarized in:

`docs/evidence/trama-maturity-evidence-binding-2026-09-29.md`

## 3. Strong evidence binding

Strong evidence types require:

- exactly one target:
  - `capabilityRef`, or
  - `areaRef`;
- `releaseRef`;
- 40-hex `exactHead`.

Strong evidence types are:

- PR_EXACT_HEAD;
- AUTOMATED_TEST;
- SECURITY_GATE;
- ACCESSIBILITY_GATE;
- RUNTIME_CANARY;
- HUMAN_REVIEW.

An `areaRef` is used when the proof qualifies the product area but no canonical capability should be invented merely to satisfy the evidence schema.

An `areaRef` MUST equal the evidence `area`.

## 4. Contract evidence

`CONTRACT_APPROVED` may be bound only to a decision in the canonical decision register whose current status is one of:

- APPROVED;
- IMPLEMENTED.

The registry must record both the decision reference and the observed decision status. The validator rejects disagreement with the canonical register.

## 5. Product evidence bound in v1

### Governance

Bound:
- canonical governance document;
- TRAMA-ADR-001;
- CC3-F1 reviewed exact head;
- CC3-F1 Human Review PASS.

Expected confirmed maturity: **L4**.

### Arena

Bound:
- canonical curriculum authority in Source Registry;
- TRAMA-ADR-002;
- Arena ECO-01/S3 PR #312 exact head;
- Product CI run 35512448131;
- HUMAN CROSS-REVIEW PASS bound to the same exact head.

Arena PR #341 remains component evidence and is not used as the product-area Human Review.

Expected confirmed maturity: **L4**.

### Atlas

Bound:
- canonical Atlas resource/publication authority;
- TRAMA-ADR-007;
- Atlas PR #32 exact head;
- F5 Exit workflow run 36093494130.

The existing governed R3-F0 closeout projection continues to supply:
- ACCESSIBILITY_GATE;
- HUMAN_REVIEW.

Expected confirmed maturity: **L4**.

### Docente OS

Bound:
- canonical teacher-context authority;
- TRAMA-ADR-006, status IMPLEMENTED;
- PR #579 Runtime Release lineage exact head;
- Product CI run 35760485652;
- final ECO-02/P1 Human Review bound to PR #600 exact head.

No RUNTIME_CANARY is added by this slice because the historical P6/HVA/Runtime Health signals could not be reconstructed with a sufficiently certain exact-head binding during this verification pass.

Expected confirmed maturity: **L3**.

The next missing evidence for L4 must therefore include `RUNTIME_CANARY`.

## 6. Default branch versus active development branch

Repository identity and active development are separate facts.

For Docente OS:

- default/canonical GitHub branch remains `main`;
- active development branch is `develop`.

The repository enrollment may declare an optional `activeDevelopmentRef`. The anonymous read-only collector may observe this additional ref, but it MUST NOT replace or falsify the repository default branch.

The collector must anchor both refs before and after collection and fail closed if either changes.

## 7. Maturity computation

The registry is appended to the evidence projection before maturity evaluation.

The existing cumulative level definitions remain unchanged.

No evidence type can leapfrog a missing prerequisite.

No overall score or percentage is introduced.

## 8. Freshness and history

Historical exact-head evidence remains valid for the event/head it proves.

Current repository heads are live development context and do not automatically supersede historical maturity evidence.

L5 remains intentionally unavailable until regression history and, where required, adoption evidence are present.

## 9. Integrity

Validation rejects:

- duplicate evidence IDs;
- unknown maturity areas;
- unknown capability refs;
- invalid or mismatched area refs;
- missing local source paths;
- unsupported decision states;
- decision status disagreement;
- weakly bound strong evidence;
- malformed exact heads;
- any policy enabling automatic promotion.

## 10. Non-authorizations

This slice does not authorize:

- DOS-A1;
- Docente OS → Atlas runtime publication;
- new product runtime capability;
- automatic maturity promotion;
- component lifecycle promotion;
- adoption evidence;
- regression-history evidence;
- product merge or publication.


## 11. Materialized checkpoint

The deterministic snapshot regeneration for this slice materializes schema `1.6.0` with the following confirmed evidence-bound levels:

- Governance: **L4**; next target L5; missing `REGRESSION_HISTORY`;
- Arena: **L4**; next target L5; missing `REGRESSION_HISTORY`;
- Atlas: **L4**; next target L5; missing `REGRESSION_HISTORY` and `ADOPTION_EVIDENCE`;
- Docente OS: **L3**; next target L4; missing only `RUNTIME_CANARY`.

The maturity-evidence registry is projected as a declared FRESH source.

At this checkpoint:
- no Docente OS `RUNTIME_CANARY` record exists;
- all snapshot integrity checks are PASS;
- product maturity remains cumulative and evidence-bound;
- component maturity remains a separate model;
- default branch and active development branch remain separate facts.


## 12. Final synchronized qualification checkpoint

After adversarial evidence-scope review and event-time normalization, the canonical snapshot was regenerated on 2026-09-29.

The synchronized projection is:

- Governance: **L4** → next L5, missing `REGRESSION_HISTORY`;
- Arena: **L4** → next L5, missing `REGRESSION_HISTORY`;
- Atlas: **L4** → next L5, missing `REGRESSION_HISTORY` and `ADOPTION_EVIDENCE`;
- Docente OS: **L3** → next L4, missing `RUNTIME_CANARY`.

Arena product-area evidence is bound to ECO-01/S3 PR #312; PR #341 remains component evidence only.

The version-bound event timestamps in the canonical snapshot match the verified GitHub merge/workflow/review events.

Docente OS has no synthetic runtime-canary record.

All canonical snapshot integrity checks are PASS at this synchronization checkpoint.

This section is a qualification checkpoint only. It creates no new evidence and does not alter the snapshot evidence registry.
