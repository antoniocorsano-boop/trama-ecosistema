# TRAMA-COMPONENT-PATTERN-01 — Stage A machine-readable materialization

**Baseline:** `a505afc53bedb8c26e3072d6866a0cdf96083de9`  
**Scope:** governance/tooling only  
**Runtime migration:** NONE  
**DOS-A1:** `RUNTIME_DEFERRED`

## Purpose

Materialize the governed Component & Interaction Pattern Catalog as machine-readable artifacts without changing Arena, Atlas, Docente OS or Control Center runtimes.

## Stage A artifacts

- `governance/component-pattern/trama-component-pattern-01.schema.json` — normative machine-readable object schema.
- `governance/component-pattern/catalog.stage-a.json` — initial catalog seed.
- `governance/component-pattern/support-matrix.stage-a.json` — risk-based support matrix and negative cases.
- `scripts/validate-component-pattern-stage-a.mjs` — dependency-free governance validator.

## Initial seed

Stage A intentionally starts small: one cross-ecosystem feedback component (`TRAMA.STATUS_MESSAGE`) and one high-risk human-agency pattern (`TRAMA.REVIEW_DECIDE_CONFIRM`). The seed proves the model without pretending that all families defined by the parent contract are already canonical.

All entries remain `PROPOSED`. Stage A cannot promote an entry to `STABLE` and cannot authorize a runtime migration.

## Acceptance gates

A Stage A change passes only when:

1. contract/stage identity is coherent;
2. runtime migration remains false;
3. DOS-A1 remains `RUNTIME_DEFERRED`;
4. every catalog entry exposes the required semantic, accessibility, responsive, content, trust, composition, extension and support-evidence fields;
5. mutating actions declare a perceptible outcome;
6. S/M/L/LIM behavior is explicit;
7. support evidence is risk-classified;
8. negative cases remain declared and reviewable;
9. no Stage A entry is marked `STABLE`.

Run locally with:

```sh
node scripts/validate-component-pattern-stage-a.mjs
```

## Explicit non-goals

Stage A does not migrate existing UI, replace product PVIPs, introduce persistence, create student accounts/tracking, change publication authority, or activate DOS-A1. Runtime adoption requires a later, separately governed stage and product-specific evidence.
