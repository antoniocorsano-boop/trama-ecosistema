# TRAMA Control Center — Modular Application Architecture v1

**Document ID:** TRAMA-CC-APP-ARCH-01  
**Status:** PROPOSED / ARCHITECTURE LOCK CANDIDATE  
**Scope:** Control Center presentation architecture  
**Runtime authority:** NONE  
**Product authority:** NONE  
**DOS-A1:** RUNTIME_DEFERRED  
**Supersedes/refines:** `docs/architecture/trama-control-center-v2-architecture.md`

## 1. Decision

The Control Center SHALL evolve from the current set of large self-contained HTML pages into a **static, read-only, contract-driven modular frontend application**.

The migration SHALL preserve the current governed data plane, collectors, Evidence Lane, Project Knowledge, maturity engine, Render static hosting, PWA/offline semantics and authority boundaries.

This is a presentation-architecture migration, not a governance or product-authority migration.

## 2. Current-state finding

The current Control Center is functionally split across multiple pages but remains structurally monolithic:

- `control-center/index.html`: structure + inline CSS + inline JavaScript;
- `maturity.html`: structure + inline CSS + inline JavaScript;
- `ecosystem.html`: structure + inline CSS + inline JavaScript;
- `evidence.html`: structure + inline CSS + inline JavaScript;
- `operations.html`: structure + inline CSS + inline JavaScript;
- `component-maturity.js`: first extracted specialist module.

Observed consequences:

- repeated shell/navigation/responsive/PWA logic;
- duplicated CSS and interaction code;
- semantic changes can break string-based CI checks;
- component evidence is harder to isolate and reuse;
- design-system adoption is incomplete;
- mobile/desktop divergence risk grows with every feature;
- HTML grep assertions are increasingly coupled to implementation details.

No new significant feature SHOULD be added to the legacy HTML surfaces unless required for security, correctness or migration parity.

## 3. Architectural style

The target is a **modular monolith frontend**.

It is explicitly NOT:

- a microfrontend system;
- a runtime plugin platform;
- a new backend;
- an SSR application;
- a second maturity engine;
- a second authority plane.

Feature boundaries are compile-time/module boundaries inside one application and one static deployable artifact.

## 4. Target stack

Core:

- React;
- TypeScript with strict checking;
- Vite;
- React Router;
- CSS variables + Tailwind utilities;
- Radix primitives;
- shadcn/ui as owned source distribution, not visual authority;
- Lucide icons.

Specialist modules, adopted only where needed:

- TanStack Table for structured registries/evidence;
- XYFlow / React Flow for ecosystem relations;
- Apache ECharts only for genuinely quantitative views;
- AJV against governed JSON Schema;
- Vitest;
- Testing Library;
- Playwright;
- axe-core;
- vite-plugin-pwa with Workbox `injectManifest`.

Initially excluded:

- Redux;
- Zustand;
- Next.js;
- SSR;
- runtime plugin registry;
- external fonts;
- browser-side GitHub API access.

## 5. Dependency rule

A dependency MAY be introduced only when it satisfies at least one of:

1. removes a repeated high-risk interaction implementation;
2. provides mature accessibility/focus/keyboard semantics;
3. supplies specialist functionality that would be expensive or risky to reproduce;
4. materially improves deterministic testing or maintainability.

Dependencies SHALL NOT be adopted merely for visual convenience.

Heavy specialist dependencies SHALL be route-lazy and SHALL NOT enter the initial Home bundle unless required there.

## 6. Canonical data boundary

The browser SHALL consume derived governed/public artifacts only.

Primary runtime inputs:

- `ecosystem-snapshot.json`;
- `project-knowledge.json`;
- static generated reports/assets.

The browser SHALL NOT:

- query GitHub to infer current state;
- promote evidence;
- change lifecycle;
- authorize runtime;
- infer authority from workflow outcomes;
- write to any product repository.

Collectors and evidence composition remain build-side.

## 7. Schema authority

Governed JSON Schema remains the contract authority.

Target chain:

```text
Governed JSON Schema
        ↓
AJV runtime validation
        ↓
TypeScript domain model
        ↓
React feature modules
```

A parallel hand-maintained validation model MUST NOT become a second authority.

Invalid or incompatible data SHALL fail closed into an explicit degraded/unavailable UI state.

## 8. Application structure

Target layout:

```text
apps/
  control-center/
    package.json
    package-lock.json
    tsconfig.json
    vite.config.ts
    index.html

    src/
      app/
        App.tsx
        router.tsx
        AppShell.tsx
        ErrorBoundary.tsx

      features/
        overview/
        decisions/
        maturity/
        ecosystem/
        evidence/
        operations/
        assurance/

      components/
        ui/
        navigation/
        feedback/
        provenance/
        data-display/

      domain/
        snapshot/
        evidence/
        maturity/
        assurance/

      data/
        client.ts
        validation.ts
        cache.ts

      styles/
        tokens.css
        globals.css

      accessibility/
      pwa/
      test/

    public/
      icons/
```

The legacy `control-center/*.html` surfaces remain available during migration as rollback/fallback until public cutover is explicitly authorized.

## 9. Semantic component strategy

Primitive components provide mechanics; TRAMA components provide meaning.

Examples of semantic components:

- `HumanDecisionNotice`;
- `AuthorityBoundary`;
- `EvidenceState`;
- `EvidenceProvenance`;
- `FreshnessIndicator`;
- `SourceHealth`;
- `MaturityTrack`;
- `MaturityEvidenceChain`;
- `ComponentLifecycle`;
- `CapabilitySummary`;
- `DependencyPath`;
- `GovernedTimeline`;
- `AssuranceRequirement`;
- `AssuranceGap`;
- `CertificationMarker`.

Generic cards are not the design model.

## 10. Information architecture invariant

The Home SHALL remain an overview/launch point.

Primary destinations:

1. Overview;
2. Decisions;
3. Maturity;
4. Ecosystem;
5. Evidence;
6. Operations;
7. Assurance.

Progressive disclosure remains mandatory.

Technical identifiers, SHA values and raw enums SHALL be secondary detail except where the user explicitly requests them.

## 11. Accessibility

Target remains WCAG 2.2 AA.

Architectural requirements:

- complete keyboard operation;
- visible focus;
- native semantics first;
- Radix primitives for complex interactions where appropriate;
- text equivalent for every graph;
- no information by color alone;
- 320 CSS px reflow;
- reduced-motion support;
- route-change focus management;
- live-region announcements only where semantically justified;
- automated axe checks plus manual/human evidence.

React Flow graphical views SHALL always have an equivalent structured list/table.

## 12. PWA and offline semantics

The current manual service worker SHALL be replaced only after parity by a Vite/Workbox implementation using `injectManifest`.

Caching policy:

- application shell: precache;
- hashed static assets: cache-first;
- `ecosystem-snapshot.json`: network-first;
- `project-knowledge.json`: network-first;
- valid cached data MAY be used offline;
- cached data MUST be visibly marked offline/stale and retain its timestamp.

Offline data MUST NOT be presented as current data.

## 13. Security boundary

Target CSP SHOULD converge toward:

```text
default-src 'self'
script-src 'self'
style-src 'self'
connect-src 'self'
img-src 'self' data:
worker-src 'self'
manifest-src 'self'
object-src 'none'
base-uri 'none'
frame-ancestors 'none'
```

No inline executable script is part of the target architecture.

No GitHub token, GitHub App credential or write capability is permitted in the browser.

`dangerouslySetInnerHTML` SHALL NOT be used for snapshot-derived content.

## 14. State management

No global state library is authorized initially.

The application SHALL start with:

- route state;
- local component state;
- small typed data providers/hooks for governed artifacts.

A global state library requires a demonstrated cross-feature need and separate architecture justification.

## 15. Testing architecture

Required test layers:

1. schema validation — existing Python/JSON Schema;
2. domain/unit — Vitest;
3. component — Testing Library;
4. accessibility — axe-core + manual evidence;
5. end-to-end — Playwright;
6. responsive — canonical viewport projects;
7. visual regression — reviewable screenshots;
8. deploy smoke — Render/public static artifact;
9. governance — existing repository contracts.

Legacy HTML string-grep tests SHALL be retired as each migrated feature gains semantic tests.

## 16. Canonical viewports

At minimum:

- desktop professional: 1440-class;
- Android-like phone: ~390×844;
- LIM / large display: 1920×1080;
- accessibility reflow: 320 CSS px.

A feature is not parity-complete until its required canonical viewport evidence exists.

## 17. Bundle discipline

Initial engineering guardrails, subject to calibration after A1:

- initial shell JS: target ≤ 180 KB gzip;
- initial CSS: target ≤ 50 KB gzip;
- ordinary feature chunk: target ≤ 100 KB gzip;
- heavy graph/chart feature: target ≤ 250 KB gzip and lazy;
- runtime third-party network requests: 0;
- external fonts: 0.

These are engineering budgets, not maturity or quality scores.

## 18. Error isolation

Each specialist route SHALL have an error boundary.

Failure of a heavy feature such as Ecosystem Graph SHALL NOT prevent Overview, Decisions or other routes from loading.

## 19. Supply-chain isolation

The Control Center frontend SHALL have its own package boundary under `apps/control-center/`.

Initial package manager: npm, with local dependencies and deterministic lockfile.

Required baseline commands:

```text
npm ci
npm run typecheck
npm run test
npm run build
```

No global package installation is required.

## 20. External benchmark rationale

The architecture follows mature, documented patterns without copying an external product wholesale:

- Vite supports static deployment without requiring a production Node server;
- shadcn/ui distributes owned component source rather than acting as a closed visual dependency;
- Radix follows WAI-ARIA authoring practices and handles focus/keyboard semantics for complex primitives;
- TanStack Table supplies headless structured-data behavior without imposing product styling;
- React Flow provides keyboard/screen-reader support for graph interaction but does not replace the required accessible list equivalent.

External references are informative; TRAMA contracts remain authoritative.

## 21. Migration invariant

No big-bang replacement.

During migration:

```text
current legacy app → production
new modular app    → isolated preview/candidate
```

Public cutover requires explicit Human Review after parity evidence.

Rollback remains immediate until post-cutover stability is established.

## 22. Human Review boundaries

Architecture-level Human Review is meaningful at only three points:

1. **Architecture Lock** — stack, boundaries, dependency policy;
2. **Product Parity** — legacy vs modular candidate;
3. **Public Cutover** — change of production entrypoint.

Routine feature migration PRs do not require repeated Human Review unless they change authority, runtime/security boundary or an irreversible contract.

## 23. Non-goals

This architecture does not authorize:

- product runtime changes in Arena, Atlas or Docente OS;
- DOS-A1;
- new cross-product write paths;
- automatic maturity/lifecycle promotion;
- a new source of truth;
- removal of legacy fallback before parity and cutover review.
