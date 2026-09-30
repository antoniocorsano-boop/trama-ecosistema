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

State: **IN_QUALIFICATION**.

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

## A3 — Overview + navigation

Migrate:

- AppShell;
- primary navigation;
- human-readable Overview;
- Project Knowledge state;
- Decisions/attention launch points;
- mobile navigation and orientation.

The Home remains overview-only.

## A4 — Ecosystem + Evidence

Migrate:

- ecosystem relationships;
- accessible graph/list dual representation;
- Evidence Explorer;
- integrity findings;
- TanStack-based structured interaction where justified.

React Flow is lazy-loaded.

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
