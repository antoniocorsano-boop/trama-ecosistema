# TRAMA Control Center — Modular App Migration Plan A0–A7

**Document ID:** TRAMA-CC-APP-MIGRATION-01  
**Status:** PROPOSED / NO_RUNTIME_CUTOVER  
**Parent:** TRAMA-CC-APP-ARCH-01  
**Runtime authority:** NONE until A7 Human Review

## Objective

Migrate the Control Center from large self-contained HTML surfaces to the modular application architecture without interrupting the public read-only service, duplicating authority or losing rollback capability.

## A0 — Architecture lock

Deliverables:

- canonical architecture document registered;
- dependency policy;
- package/supply-chain boundary;
- no-big-bang and rollback rules;
- baseline inventory of legacy routes and tests.

Exit:

- Human Review of architecture boundaries;
- no runtime/deploy change.

### A0 materialized baseline

State: **LOCKED — Human Review APPROVED 2026-09-30**.

Materialized outputs:

- `docs/inventory/trama-control-center-a0-legacy-baseline.md`;
- `governance/control-center/trama-control-center-a0-legacy-baseline.json`;
- `docs/contracts/trama-control-center-frontend-dependency-policy-v1.md`;
- `governance/control-center/trama-control-center-a0-architecture-lock.json`;
- `schemas/control-center-a0-architecture-lock.schema.json`;
- `scripts/validate_control_center_a0_architecture_lock.py`.

Governance now fails closed on unacknowledged legacy baseline drift or architecture-boundary escalation.

A0 is `LOCKED` after explicit Human Review. This authorizes entry into A1 foundation work only; it does not authorize public cutover, product runtime changes, or DOS-A1.

## A1 — Application foundation

Create isolated `apps/control-center/` with:

- React + TypeScript + Vite;
- AppShell;
- routing;
- design tokens;
- typed data client;
- AJV validation;
- loading/error/stale states;
- basic Vitest/Testing Library/Playwright harness;
- build-size reporting.

Deploy only as preview/candidate.

Legacy production remains untouched.

### A1 materialized foundation

State: **QUALIFIED — exact head `3b4124720ab53246cca67fd7f0977ffef31c7fb7` / run `36687481080` PASS**.

Reference:
- `docs/implementation/trama-control-center-a1-foundation.md`.

Materialized:
- isolated npm package boundary;
- React/TypeScript/Vite static candidate;
- HashRouter preview shell;
- governed data emission + AJV validation;
- strict typecheck;
- semantic component/unit tests;
- deterministic bundle report;
- Playwright Chromium smoke with zero-external-runtime-request guard;
- committed npm lockfile;
- final CI permissions READ_ONLY.

Legacy production remains unchanged.

## A2 — Maturity feature

First vertical migration because it already has:

- stable snapshot inputs;
- Component Evidence Lane v2;
- explicit confirmed/candidate semantics;
- existing extracted `component-maturity.js` logic that can be retired after parity.

Acceptance:

- same governed semantics;
- `LIVE_VERIFIED` presentation;
- lifecycle remains independent;
- mobile/desktop/LIM evidence;
- keyboard/axe;
- accessible structured alternative.

### A2 materialized Maturity feature

State: **QUALIFIED — exact head `40729ee87af01ebd1ac3fda71324c28582f5674e` / run `36691092829` PASS**.

Reference:
- `docs/implementation/trama-control-center-a2-maturity.md`;
- `governance/control-center/trama-control-center-a2-maturity-qualification.json`.

Materialized:
- typed maturity domain adapter/model;
- modular `/maturity` route;
- confirmed/candidate maturity separation;
- lifecycle independence;
- `LIVE_VERIFIED` presentation;
- product filters and structured component detail;
- native accessible stage rails instead of a specialist graph dependency;
- axe browser qualification;
- desktop / phone / LIM evidence;
- bundle guardrail;
- A1 regression PASS.

Legacy production remains unchanged.

## A3 — Overview + navigation

Migrate:

- AppShell;
- primary navigation;
- human-readable Overview;
- Project Knowledge state;
- Decisions/attention launch points;
- mobile navigation and orientation.

The Home remains overview-only.

### A3 materialized Overview + navigation

State: **QUALIFIED — exact head `9f8d7e3062ac1990e7a505e04b8253a94283ba58` / run `36693184969` PASS**.

Reference:
- `docs/implementation/trama-control-center-a3-overview-navigation.md`;
- `governance/control-center/trama-control-center-a3-overview-qualification.json`.

Materialized:
- human-readable Overview as candidate Home;
- R1–R5 orientation without phase activation authority;
- blocking-decision presentation without false urgency;
- Project Knowledge contextual state;
- progressive navigation with only migrated routes actionable;
- persistent phone navigation;
- desktop / phone / LIM evidence;
- axe and zero-external-request browser qualification;
- A1 and A2 regression PASS.

Legacy public Home remains unchanged.

## A4 — Ecosystem + Evidence

Migrate:

- ecosystem relationships;
- accessible graph/list dual representation;
- Evidence Explorer;
- integrity findings;
- TanStack-based structured interaction where justified.

React Flow is lazy-loaded.

### A4 materialized Ecosystem + Evidence

State: **QUALIFIED — exact head `601e552389b7cec6c33d4963bde637557dc9baa0` / run `36696727967` PASS**.

Reference:
- `docs/implementation/trama-control-center-a4-ecosystem-evidence.md`;
- `governance/control-center/trama-control-center-a4-ecosystem-evidence-qualification.json`.

Materialized:
- modular Ecosystem and Evidence routes;
- capability filters and governed relationship detail;
- accessible graph/list dual representation;
- React Flow 12.11.6 lazy-loaded only for the graph;
- explicit FUTURE_NOT_AUTHORIZED semantics;
- Evidence Explorer with deterministic freshness and exact-head binding;
- Integrity view without overall score;
- shell / lazy graph / CSS bundle budgets;
- axe + desktop / phone / LIM evidence;
- A1/A2/A3 regression PASS.

TanStack Table remains deferred because current A4 behavior does not require datagrid-scale interaction.

Legacy production remains unchanged.

## A5 — Operations + Assurance

Migrate:

- operational path;
- governed timeline;
- stakeholder assurance;
- specialist assurance detail.

No overall score is introduced.

## A6 — PWA, security, accessibility and parity

Complete:

- Workbox/`injectManifest`;
- freshness-aware offline behavior;
- CSP-compatible build;
- route error boundaries;
- visual-regression suite;
- 320px reflow;
- canonical viewports;
- browser/runtime evidence;
- legacy/candidate functional parity matrix.

Exit requires **Product Parity Human Review**.

## A7 — Public cutover

Only after A6 PASS:

- switch Render public entrypoint to modular build;
- preserve legacy under an explicit fallback path for rollback;
- smoke-test public snapshot, PWA, offline and primary routes;
- record cutover exact head and deploy receipt.

Requires **Public Cutover Human Review**.

Legacy removal is a later reversible cleanup decision after stability evidence.

## Cross-stage invariants

At every stage:

- Control Center remains READ_ONLY;
- JSON Schema remains contract authority;
- browser never queries GitHub for authority/state;
- Evidence Lane remains build-side;
- no product runtime changes;
- no DOS-A1 authorization;
- no automatic maturity/lifecycle promotion;
- no new feature work is added to legacy HTML unless needed for correctness/security/parity.

## CI migration rule

A legacy grep/string assertion may be removed only when the migrated behavior has an equivalent or stronger:

- semantic component/unit test;
- end-to-end test;
- accessibility test;
- or deploy smoke test.

Do not remove checks merely to make CI green.

## Parallel-work rule

During A0–A6:

- legacy production fixes and modular migration may coexist;
- avoid editing the same semantic feature in both surfaces unless parity requires it;
- any unavoidable dual change must name the legacy and modular targets explicitly;
- the modular app cannot become a second source of project state.

## Completion definition

The migration is complete only when:

1. all primary routes are served by the modular app;
2. public Render deploy is verified;
3. PWA/offline semantics are equivalent or stronger;
4. accessibility evidence exists;
5. legacy rollback path has been retained through the agreed stability window;
6. documentation and Governed Document Registry identify the modular architecture as the current reference.
