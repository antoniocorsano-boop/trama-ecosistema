# TRAMA-COMPONENT-PATTERN-01 — Stage A.1 Catalog Coverage

**Baseline:** `301e16c5086b936865972f25bbe4668002ca9696`  
**Scope:** evidence inventory and catalog coverage only  
**Runtime migration:** NONE  
**DOS-A1:** `RUNTIME_DEFERRED`

## Purpose

Stage A.1 maps existing product evidence before adding catalog entries or migrating any runtime. It is an anti-rework step: shared semantics are derived from verified recurring behavior, not from guessed repository names or premature component extraction.

## Canonical repositories observed

- Arena → `antoniocorsano-boop/CurManLight_arena`
- Atlas → `antoniocorsano-boop/Curriculum-Atlas`
- Docente OS → `antoniocorsano-boop/docente-os-2026-27`
- TRAMA Control Center → `antoniocorsano-boop/trama-ecosistema`

These repository bindings describe the evidence sources used by Stage A.1; they do not change product authority.

## Coverage vocabulary

- `PRESENT` — implementation evidence directly demonstrates the family or a close reusable primitive.
- `PARTIAL` — some required semantics are evidenced, but not enough to infer catalog-level conformance.
- `ABSENT_EVIDENCE` — the current inventory has not established evidence. This MUST NOT be read as `MISSING`.
- `PRODUCT_SPECIFIC` — the family is intentionally outside the current target products or is legitimately product-specific.

The distinction between `ABSENT_EVIDENCE` and `MISSING` is normative for this stage. A search miss is not proof of absence.

## First evidence-backed findings

### Perceptible status

The ecosystem already contains multiple implementations of perceptible status semantics. Arena has a `trama-perceptible-write` detector and documented `role=status` / `aria-live` behavior; Atlas uses live regions in current components; Docente OS exposes a polite busy loading state; Control Center exposes live snapshot state. The implementation forms differ, which is exactly why `TRAMA.STATUS_MESSAGE` should remain a semantic contract rather than a forced shared visual component.

### Empty state

Arena has a reusable `EmptyState` implementation and inventory evidence. Docente OS documents compact empty-state behavior in its product design system. Evidence for Atlas and Control Center is not yet sufficient, so those cells remain `ABSENT_EVIDENCE` rather than being classified as missing.

### Error/recovery and pending/progress

Arena exposes `ErrorBoundary`, `Spinner` and `Progress` primitives. Docente OS has explicit route-loading semantics. These observations justify continued catalog analysis but not automatic promotion of new entries.

### Review / decide / confirm

Arena exports a `ConfirmDialog`, but a confirmation component is not equivalent to the full `TRAMA.REVIEW_DECIDE_CONFIRM` pattern. The Stage A.1 matrix therefore records only partial evidence. Docente OS and Control Center remain unmapped until direct implementation evidence is established.

## Candidate order for further analysis

1. `TRAMA.EMPTY_STATE`
2. `TRAMA.LOADING_PENDING_PROGRESS`
3. `TRAMA.ERROR_RECOVERY`
4. `TRAMA.OFFLINE_DEGRADED`

This order is an analysis queue, not a promotion decision. Each candidate must acquire sufficient cross-product evidence and negative cases before it can enter the governed Stage A catalog.

## Hard boundaries

Stage A.1 does not:

- modify Arena, Atlas, Docente OS or Control Center runtime code;
- create a shared runtime component library;
- infer absence from search failure;
- replace product PVIPs;
- alter curriculum/publication authority;
- activate DOS-A1;
- promote candidates to `PROPOSED`, `TRIAL` or `STABLE` merely because an implementation already exists in one product.

The machine-readable source of this inventory is `governance/component-pattern/catalog-coverage.stage-a1.json`.
