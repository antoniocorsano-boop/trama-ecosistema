# TRAMA Control Center — A6 PWA, Security, Accessibility and Product Parity

**Document ID:** TRAMA-CC-APP-A6-PWA-PARITY-01  
**Status:** TECHNICALLY_QUALIFIED / AWAITING_PRODUCT_PARITY_HUMAN_REVIEW / PREVIEW_ONLY / READ_ONLY  
**Parent:** TRAMA-CC-APP-ARCH-01 · TRAMA-CC-APP-MIGRATION-01 · TRAMA-CC-APP-A5-OPERATIONS-ASSURANCE-01  
**Production impact:** NONE  
**Public cutover:** NOT_AUTHORIZED  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

A6 closes pre-cutover parity for the modular Control Center.

It qualifies:

- PWA installability and offline behavior;
- strict CSP compatibility;
- route error isolation;
- accessibility and 320 CSS px reflow;
- visual regression across canonical viewports;
- functional parity between legacy and modular candidate surfaces.

A6 does not authorize A7 or any public cutover.

## 2. PWA architecture

The candidate uses `vite-plugin-pwa 1.3.0` with Workbox `injectManifest`.

The candidate service worker:

- precaches the modular application shell and hashed assets;
- treats governed data separately;
- uses network-first for `ecosystem-snapshot.json`;
- uses network-first for `project-knowledge.json`;
- may use a cached valid response when the network fails;
- marks cached governed data with:
  - `X-TRAMA-Data-Source: CACHE_OFFLINE`;
  - `X-TRAMA-Cache-Policy: NETWORK_FIRST`.

The UI translates that marker into an explicit warning:

`Offline · copia cached, potenzialmente non aggiornata`.

Cached data is therefore never silently presented as current.

The legacy service worker and manifest remain unchanged.

## 3. CSP and schema-validation decision

Target CSP remains strict:

- `default-src 'self'`;
- `script-src 'self'`;
- `style-src 'self'`;
- `connect-src 'self'`;
- `img-src 'self' data:`;
- `worker-src 'self'`;
- `manifest-src 'self'`;
- `object-src 'none'`;
- `base-uri 'none'`;
- `frame-ancestors 'none'`.

During A6 qualification, runtime AJV compilation was found incompatible with the no-`unsafe-eval` CSP.

The CSP was **not weakened**.

Instead, A6 introduced a Vite build-time plugin that:

1. reads the governed ecosystem JSON Schema;
2. compiles it with AJV at build time;
3. emits an AJV standalone validator module;
4. lets the browser execute only static validation code.

The governed JSON Schema remains the sole validation authority.

The final build gate also fails closed on inline executable scripts, `eval(` and `new Function(` in built application assets.

## 4. Service-worker format

The Workbox `injectManifest` output is emitted as classic/IIFE service-worker code.

This matches the candidate registration path:

`navigator.serviceWorker.register("./sw.js", { scope: "./" })`.

No browser credential or GitHub authority is introduced.

## 5. Error isolation and focus

Every specialist route is wrapped in a route-level error boundary.

A route failure:

- does not take down the shell;
- exposes an accessible alert;
- preserves primary navigation.

The shell also provides:

- skip link;
- route-change focus to `#main-content`;
- visible focus styling.

## 6. Reflow and accessibility

Canonical A6 viewports:

- desktop 1440×900;
- phone / Pixel 7 class;
- LIM 1920×1080;
- reflow 320×900.

A real 320px overflow in the Operations governed timeline was found during qualification and corrected before final evidence.

Automated axe checks cover the candidate shell/routes.

No information is intentionally conveyed by color alone.

## 7. Visual regression

A6 adds committed Playwright visual baselines for:

- Overview;
- Maturity;
- Ecosystem;
- Evidence;
- Operations;
- Assurance.

Each route has four versioned baselines:

- desktop;
- phone;
- LIM;
- reflow-320.

Total committed baselines: **24**.

The final read-only A6 workflow compares current rendering against those baselines with animations disabled and a maximum diff pixel ratio of 0.005.

## 8. Product parity matrix

Machine-readable matrix:

`governance/control-center/trama-control-center-a6-parity-matrix.json`.

Covered mappings:

- legacy Home → modular Overview;
- legacy Maturity → modular Maturity;
- legacy Ecosystem → modular Ecosystem;
- legacy Evidence → modular Evidence;
- legacy Operations → modular Operations;
- legacy Home Assurance → modular Assurance.

Cross-cutting parity includes:

- installability;
- offline shell;
- governed-data freshness;
- CSP;
- route error isolation;
- keyboard/axe;
- 320px reflow;
- zero external runtime requests.

Where the modular candidate is stronger, the matrix records the stronger behavior rather than forcing literal implementation parity.

## 9. Dependency admission

A6 adds build/development dependencies only:

- `vite-plugin-pwa 1.3.0` — MIT — PWA/Workbox build integration;
- `workbox-precaching 7.4.1` — MIT — direct service-worker precaching import.

No new product-runtime authority or browser-side external service is introduced.

The temporary lockfile and visual-baseline write workflows were removed before final qualification.

## 10. Technical qualification

Technical qualification head:

`21e0b42d943806f1fb3a8a28acaf88985a6b4fff`

A6 workflow:

- run: `36701873581`;
- conclusion: SUCCESS;
- artifact: `11089799540`;
- digest: `sha256:699146cdc9c673fbb13a389d2d9dcc7e783348f2e92321d36b5657d3b8f16897`.

Evidence:

- unit/component: 23/23 PASS;
- PWA/parity browser: 10/10 PASS;
- visual regression: 24/24 PASS;
- A1 regression: PASS;
- A2 regression: PASS;
- A3 regression: PASS;
- A4 regression: PASS;
- A5 regression: PASS;
- Governance: PASS;
- Workbox injectManifest: PASS;
- precache: 11 entries / 668.14 KiB;
- manifest generated: PASS;
- service worker generated: PASS;
- strict CSP static/runtime compatibility: PASS;
- offline governed-data marker: PASS;
- 320px reflow: PASS;
- axe: PASS;
- zero external runtime requests: PASS.

Bundle measurements:

- entry shell JS: `106991` bytes gzip ≤ `184320`;
- Ecosystem graph JS: `57387` bytes gzip ≤ `256000`;
- CSS: `7495` bytes gzip ≤ `51200`.

## 11. Qualification defects found and resolved

A6 qualification exposed and resolved three substantive issues before this technical qualification:

1. runtime AJV compilation violated the target CSP;
2. service-worker/browser test reload handling contained a navigation race;
3. Operations timeline overflowed at 320 CSS px.

The final evidence applies only to the corrected state.

## 12. Boundaries

A6 does not:

- modify the legacy service worker;
- modify the legacy manifest;
- change the Render production entrypoint;
- retire the legacy fallback;
- query GitHub from the browser;
- add browser credentials;
- authorize product runtime writes;
- authorize DOS-A1;
- authorize A7.

## 13. Human Review gate

Technical status:

**TECHNICALLY_QUALIFIED**

Human status:

**AWAITING_PRODUCT_PARITY_HUMAN_REVIEW**

A6 exits only after an explicit Product Parity Human Review decision.

Until that decision is recorded:

- PR #190 SHALL remain unmerged;
- A7 SHALL remain blocked;
- Render/public production SHALL remain legacy.
