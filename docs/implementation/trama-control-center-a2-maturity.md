# TRAMA Control Center — A2 Maturity Feature

**Document ID:** TRAMA-CC-APP-A2-MATURITY-01  
**Status:** QUALIFIED / PREVIEW_ONLY / READ_ONLY  
**Parent:** TRAMA-CC-APP-ARCH-01 · TRAMA-CC-APP-MIGRATION-01 · TRAMA-CC-APP-A1-FOUNDATION-01  
**Production impact:** NONE  
**Public cutover:** NOT_AUTHORIZED  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

A2 is the first vertical feature migration from the legacy Control Center into the modular React application.

The feature migrates the semantic task of the legacy `maturity.html` surface without modifying that production surface.

## 2. Parity contract

A2 parity is **semantic and interaction parity**, not pixel parity.

Required:

- maturity-area summary;
- confirmed and candidate area levels;
- evidence binding status;
- component count and source state;
- product filtering;
- component confirmed stage;
- component candidate stage;
- lifecycle shown independently from maturity;
- source class;
- evidence status;
- explicit `LIVE_VERIFIED` presentation;
- component detail;
- accessible equivalent structured representation;
- keyboard-native operation;
- desktop / phone / LIM evidence;
- automated accessibility scan;
- no external runtime network requests;
- READ_ONLY boundary.

Not required in A2:

- visual duplication of the legacy SVG map;
- legacy localStorage offline fallback;
- legacy service-worker behavior;
- public Render integration;
- PWA parity;
- clean-route hosting.

PWA/offline parity remains owned by A6.

## 3. Rendering decision

A2 does **not** adopt React Flow.

The maturity domain is a five-stage ordered progression, not a general graph. A2 therefore uses:

- semantic HTML buttons;
- CSS stage rails;
- structured list/detail layout;
- native focus and keyboard behavior.

This keeps the bundle smaller and avoids a specialist dependency whose main value belongs to A4 Ecosystem.

## 4. Domain boundary

The React feature does not reuse the legacy DOM renderer `component-maturity.js`.

A2 extracts a typed consumer model under:

`apps/control-center/src/domain/maturity/`

The adapter consumes the already validated ecosystem snapshot.

The domain model preserves, as separate fields:

- `lifecycle`;
- `maturity.confirmedStage`;
- `maturity.candidateStage`;
- `evidenceStatus[*].status`;
- `evidenceStatus[*].sourcePlane`.

No UI computation is allowed to promote one from another.

## 5. LIVE_VERIFIED semantics

The canonical repository snapshot remains governed-only.

A2 therefore supports both:

- governed snapshot evidence;
- effective snapshot evidence where `sourcePlane = LIVE_VERIFIED`.

The browser qualification test injects a controlled effective snapshot derived from the governed snapshot and verifies:

- evidence displays `Presente · live verificata`;
- lifecycle remains `PROPOSED` / “Proposto”;
- confirmed stage remains `REGISTERED` / “Registrato”;
- candidate stage may remain `ACCESSIBILITY`.

The test does not mutate the canonical snapshot.

## 6. Accessibility

A2 uses native button/filter semantics.

Qualification targets:

- keyboard operability by construction;
- visible focus inherited from AppShell tokens;
- no information conveyed only by color;
- stage rail has an accessible text label;
- component list is the accessible primary representation;
- detail updates use `aria-live="polite"`;
- axe WCAG 2 A/AA + 2.1 AA + 2.2 AA scan;
- no horizontal overflow on canonical viewports.

## 7. Canonical browser evidence

A2 adds/uses Playwright projects:

- desktop: 1440×900;
- phone: Pixel 7 class;
- LIM: 1920×1080.

The Maturity test captures a full-page screenshot per project and runs the same semantic/accessibility assertions on each.

## 8. Dependency admission — @axe-core/playwright

Package: `@axe-core/playwright`  
Version: `4.13.0`  
Class: development / qualification only  
License: MPL-2.0  
Purpose: automated browser accessibility analysis  
Runtime bundle impact: none  
Network runtime impact: none  
Owner: A2 qualification / future modular-app accessibility gates  
Exit path: replaceable by another test-only accessibility analyzer without changing domain or product contracts.

This dependency does not establish accessibility compliance by itself. Human/manual evidence remains required at the later parity/assurance stages.

## 9. Files owned by A2

Primary feature:

- `src/features/maturity/MaturityPage.tsx`;
- `src/features/maturity/maturity.css`;
- `src/domain/maturity/model.ts`;
- `src/domain/maturity/adapter.ts`.

Qualification:

- domain/component tests;
- `e2e/maturity.spec.ts`;
- desktop / phone / LIM Playwright projects;
- axe test dependency.

## 10. Legacy protection

A2 must not modify:

- `control-center/maturity.html`;
- `control-center/component-maturity.js`;
- `control-center/sw.js`;
- legacy navigation/runtime.

The old surface remains the production fallback until A7.

## 11. Exit condition

A2 is **QUALIFIED**. Receipt: `governance/control-center/trama-control-center-a2-maturity-qualification.json`.

Qualified evidence:

- exact head: `40729ee87af01ebd1ac3fda71324c28582f5674e`;
- A2 workflow run: `36691092829` — SUCCESS;
- artifact: `11085593330`;
- artifact digest: `sha256:d2f3b79238fe1ba8892b0e14585f78f8acfafca8e1ecc2b8b544169081c1354c`;
- 8/8 unit/component tests PASS;
- 6/6 browser tests PASS;
- axe PASS on desktop, phone and LIM;
- `LIVE_VERIFIED` scenario PASS on desktop, phone and LIM;
- initial JS: `125577` bytes gzip ≤ `184320` bytes;
- A1 regression: PASS (`36691092762`);
- Governance: PASS (`36691092784`);
- Project Knowledge Runtime: PASS (`36691092801`).

The qualification covered:

- A1 regression foundation;
- TypeScript strict typecheck;
- unit/component maturity semantics;
- production build;
- bundle report;
- governed data security guard;
- Maturity E2E on desktop, phone and LIM;
- axe scan;
- `LIVE_VERIFIED` controlled effective-snapshot scenario;
- Governance;
- Project Knowledge;
- ecosystem snapshot consistency.

A2 qualification authorizes progression to A3 only. It does not authorize public cutover, legacy retirement or any product-runtime change.
