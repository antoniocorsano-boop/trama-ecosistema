# TRAMA Control Center — A1 Application Foundation

**Document ID:** TRAMA-CC-APP-A1-FOUNDATION-01  
**Status:** QUALIFIED / PREVIEW_ONLY / READ_ONLY  
**Parent:** TRAMA-CC-APP-ARCH-01 · TRAMA-CC-APP-MIGRATION-01 · TRAMA-CC-APP-A0-LOCK-01  
**Production impact:** NONE  
**Public cutover:** NOT_AUTHORIZED  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

A1 establishes the modular Control Center application foundation without replacing or modifying the public legacy Control Center.

The slice proves that TRAMA can build a deterministic static React application under the locked A0 boundaries while continuing to consume governed artifacts rather than creating a second source of truth.

## 2. Package boundary

The frontend supply chain is isolated under:

`apps/control-center/`

No root-level JavaScript dependency is introduced.

Package manager: npm.

The committed `package-lock.json` is the deterministic installation authority for A1.

CI installation:

`npm ci --ignore-scripts`

No global installation is required.

## 3. Foundation stack

### Production dependencies

| Package | Version | License | A1 purpose |
|---|---:|---|---|
| React | 19.3.0 | MIT | application composition |
| React DOM | 19.3.0 | MIT | browser rendering |
| React Router | 8.4.0 | MIT | static-safe candidate routing |
| AJV | 8.20.0 | MIT | runtime validation against governed JSON Schema |

### Development / qualification dependencies

| Package | Version | License | Purpose |
|---|---:|---|---|
| TypeScript | 7.0.2 | Apache-2.0 | strict type checking |
| Vite | 8.3.1 | MIT | static build / preview |
| @vitejs/plugin-react | 6.1.1 | MIT | React Vite integration |
| Vitest | 5.0.2 | MIT | domain/component tests |
| @testing-library/react | 16.3.3 | MIT | semantic component tests |
| @testing-library/jest-dom | 7.0.1 | MIT | DOM assertions |
| Playwright Test | 1.63.0 | Apache-2.0 | browser smoke / network guard |
| jsdom | 30.1.1 | MIT | DOM test environment |
| @types/node | 26.6.3 | MIT | build/tooling types |
| @types/react | 19.3.0 | MIT | React types |
| @types/react-dom | 19.3.0 | MIT | React DOM types |

No Tailwind, Radix, shadcn source, TanStack Table, React Flow, ECharts, state manager, PWA plugin or analytics dependency is adopted in A1.

## 4. Routing decision

A1 uses `HashRouter`.

Reason:

- preview works on static hosting without rewrite rules;
- no Render/server configuration is required;
- route semantics can be exercised before any production cutover decision.

This is not a permanent commitment to hash URLs. Clean-route promotion requires static-host evidence and a later explicit migration decision.

## 5. Governed data boundary

A1 does not duplicate snapshot content into source files.

A Vite build plugin emits the current repository-governed artifacts into the candidate bundle:

- `control-center/data/ecosystem-snapshot.json` → `dist/data/ecosystem-snapshot.json`;
- `control-center/data/context-packs/project-knowledge.json` → `dist/data/context-packs/project-knowledge.json`.

The browser reads the emitted artifact only.

It does not:

- call GitHub APIs;
- infer current repository state;
- mutate registries;
- authorize runtime;
- promote maturity or lifecycle.

## 6. Schema validation

The browser imports the existing governed ecosystem snapshot JSON Schema and validates data using AJV 2020.

State model:

- `LOADING`;
- `READY`;
- `INVALID`;
- `UNAVAILABLE`.

Invalid data fails closed. The candidate does not attempt heuristic recovery or state reconstruction.

JSON Schema remains the contract authority. TypeScript types are intentionally a narrow consumer projection, not a parallel schema authority.

## 7. App shell

A1 provides only the application foundation:

- React bootstrap;
- AppShell;
- read-only identity;
- static candidate navigation;
- Foundation route;
- disabled placeholders for future migrated features;
- explicit declaration that legacy production remains active.

A1 does not migrate Maturity, Ecosystem, Evidence or Operations.

## 8. Styling

A1 introduces a minimal token layer and responsive shell CSS.

This is not the final design system.

It establishes:

- product-owned CSS variables;
- 44px minimum navigation target height;
- visible focus;
- 320px-safe composition;
- mobile layout;
- reduced-motion handling;
- system fonts only.

No external font/network dependency exists.

## 9. Test architecture materialized

A1 qualifies four layers:

1. TypeScript strict typecheck;
2. Vitest + Testing Library semantic tests;
3. Vite production build and governed-artifact emission;
4. Playwright Chromium browser smoke.

The browser smoke also records all browser requests and fails if any request targets a host other than the local preview origin.

This is the first product-local browser harness for the modular app; it does not replace existing legacy runtime evidence.

## 10. Security boundary

Final A1 workflow permissions:

`contents: read`

The temporary lockfile-bootstrap write capability was removed after the deterministic lockfile had been materialized.

Final workflow contains:

- no `git push`;
- no write permission;
- no GitHub token use by application code;
- no browser GitHub request;
- no third-party runtime request.

## 11. Bundle baseline

Measured from the first complete successful A1 build before final lockfile hardening:

| Asset | Raw bytes | Gzip bytes |
|---|---:|---:|
| application JS | 406,958 | 122,971 |
| application CSS | 2,888 | 1,135 |
| ecosystem snapshot | 74,829 | 10,223 |
| Project Knowledge context | 7,028 | 899 |
| index.html | 550 | 339 |

The source map is a development artifact and is not part of runtime transfer budgeting.

Initial shell JS is below the A0 engineering target of 180 KB gzip. The target remains a guardrail, not a maturity score.

## 12. Known deferrals

A1 deliberately does not solve:

- final AppShell information architecture;
- Maturity migration;
- semantic TRAMA component library;
- Radix/shadcn adoption;
- PWA/Workbox;
- accessibility qualification beyond foundation semantics/browser smoke;
- visual regression;
- phone/LIM browser evidence;
- public preview hosting;
- Render production integration;
- clean-route hosting;
- A6 parity.

These remain owned by later migration stages.

## 13. Legacy protection

No file under legacy `control-center/` is modified by A1.

The A0 legacy-baseline validator remains active and would fail on unacknowledged drift.

## 14. Exit condition

A1 is QUALIFIED. Qualification receipt: `governance/control-center/trama-control-center-a1-foundation-qualification.json`.

Qualified evidence:

- exact head: `3b4124720ab53246cca67fd7f0977ffef31c7fb7`;
- workflow run: `36687481080` — SUCCESS;
- artifact: `11084008131`;
- artifact digest: `sha256:5f471fc6fceddd36ee3e223e0298eb574ea92c6ad5ddd1af273fcff9a0b2156c`;
- Governance: PASS;
- Project Knowledge Runtime: PASS.

The qualification covered:

- Governance;
- Control Center A1 Foundation:
  - npm ci;
  - Typecheck;
  - Unit/component tests;
  - Build;
  - Bundle report;
  - governed artifact emission/security check;
  - Chromium install;
  - browser smoke with zero external runtime requests.

Qualification does not authorize public deployment. It authorizes progression to the planned A2 Maturity feature within the already locked migration architecture.
