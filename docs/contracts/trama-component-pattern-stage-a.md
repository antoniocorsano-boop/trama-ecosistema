# TRAMA-COMPONENT-PATTERN-01 — Stage A machine-readable materialization

**Baseline:** `a505afc53bedb8c26e3072d6866a0cdf96083de9`  
**Scope:** governance/tooling only  
**Runtime migration:** NONE  
**DOS-A1:** `RUNTIME_DEFERRED`

## Purpose

Materialize the governed Component & Interaction Pattern Catalog as machine-readable artifacts without changing Arena, Atlas, Docente OS or TRAMA Control Center runtimes.

## Stage A artifacts

- `governance/component-pattern/trama-component-pattern-01.schema.json` — normative machine-readable object schema.
- `governance/component-pattern/catalog.stage-a.json` — initial catalog seed.
- `governance/component-pattern/support-matrix.stage-a.json` — risk-based support matrix and executable negative cases.
- `scripts/validate-component-pattern-stage-a.mjs` — dependency-free governance validator.
- `policies/design-system/authority-registry.v1.json` — existing governed authority registry reused as the owner binding.

## Initial seed

Stage A intentionally starts small: one cross-ecosystem feedback component (`TRAMA.STATUS_MESSAGE`) and one high-risk human-agency pattern (`TRAMA.REVIEW_DECIDE_CONFIRM`). The seed proves the model without pretending that all families defined by the parent contract are already canonical.

All entries remain `PROPOSED`. Stage A cannot promote an entry to `STABLE` and cannot authorize a runtime migration. Product identifiers reuse the existing canonical vocabulary: `ARENA`, `ATLAS`, `DOCENTE_OS`, `TRAMA_CONTROL_CENTER`.

## Acceptance gates

A Stage A change passes only when:

1. contract/stage identity is coherent;
2. runtime migration remains false;
3. DOS-A1 remains `RUNTIME_DEFERRED`;
4. every catalog entry exposes the required semantic, accessibility, responsive, content, trust, composition, extension and support-evidence fields, including a non-empty PVIP binding;
5. owners resolve against `TRAMA-DESIGN-AUTHORITY-REGISTRY`;
6. product identifiers use the existing canonical vocabulary;
7. mutating actions declare a perceptible outcome;
8. S/M/L/LIM behavior is explicit;
9. dependencies resolve to another catalog entry;
10. support evidence satisfies the complete inherited profile for its LOW/MEDIUM/HIGH risk class;
11. all declared negative cases are executable and are rejected by the validator;
12. no Stage A entry is marked `STABLE`.

Run locally with:

```sh
node scripts/validate-component-pattern-stage-a.mjs
```

The Governance workflow invokes the same validator so the documented gate and CI gate remain aligned.

## Explicit non-goals

Stage A does not migrate existing UI, replace product PVIPs, introduce persistence, create student accounts/tracking, change publication authority, or activate DOS-A1. Runtime adoption requires a later, separately governed stage and product-specific evidence.
