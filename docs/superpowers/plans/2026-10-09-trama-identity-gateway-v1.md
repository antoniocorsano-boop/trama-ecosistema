# TRAMA-IDENTITY-01 Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved TRAMA parent identity as a real, accessible cinematic public gateway and register the minimum governed identity artifacts needed for future ecosystem propagation without restyling Arena, Atlas, Docente OS, Studio Atlas, or Control Center in this increment.

**Architecture:** Create an independent `apps/gateway` React/Vite application rather than coupling the public threshold to TRAMA Control Center. Authoritative identity semantics remain in `trama-ecosistema` under governed machine-readable policy; the gateway consumes a local implementation adapter, uses a native video/poster media layer with reduced-motion fallback, and owns only the small TRAMA-specific components justified by the approved design. CI produces exact-head responsive/accessibility evidence; publication, authentication, and cross-repository propagation remain separate decisions.

**Tech Stack:** Node >=22, React 19.3.0, React DOM 19.3.0, Vite 8.3.1, TypeScript 7.0.2, Tailwind CSS 4.3.3, `@tailwindcss/vite` 4.3.3, shadcn/ui open-code composition, `@radix-ui/react-slot` 1.4.0, `class-variance-authority` 0.7.1, `clsx` 2.1.1, `tailwind-merge` 3.7.0, Vitest 5.0.2, Testing Library 16.3.3, Playwright 1.63.0, `@axe-core/playwright` 4.13.0.

**Spec:** `docs/superpowers/specs/2026-10-09-trama-identity-gateway-v1-design.md`

## Global Constraints

- Baseline is `main@9a6d546733ae2503a0f17f342850964bb8c8da75`; implementation remains on the feature branch/PR and MUST NOT modify `main` directly.
- The gateway is a new public threshold under `apps/gateway`; it is NOT a restyle, route, or feature of `apps/control-center`.
- `DOS-A1` remains `RUNTIME_DEFERRED`.
- No new authentication/account system, persistence, student account/tracking, telemetry, analytics, publication authority, or cross-product state authority is introduced.
- The CTA delegates to an explicitly configured destination; it MUST NOT create or imply authentication authority.
- The provided CloudFront MP4 may be used only as a temporary prototype media source. It is not canonical TRAMA media until ownership/licensing/reliability are separately verified.
- A local static poster/fallback must make the hero complete when video is unavailable or motion is reduced.
- Parent palette reference values remain: background `hsl(201 100% 13%)`, foreground `hsl(0 0% 100%)`, muted foreground `hsl(240 4% 66%)`, dark secondary/muted/accent `hsl(0 0% 10%)`, border/input `hsl(0 0% 18%)`, primary `hsl(0 0% 100%)`, primary foreground `hsl(0 0% 4%)`.
- Preferred display family is `Instrument Serif`; preferred body/interface family is `Inter` weights 400/500. Fallback stacks and readable font-loading failure behavior are mandatory.
- The gateway may use the approved liquid-glass treatment only for gateway shell/actions. Glass is not propagated into ordinary product workspaces by this increment.
- No decorative blobs, radial gradients, fake data graphics, particle systems, holographic/neural-network motifs, or CSS parallax.
- Entrance motion targets 800 ms ease-out with 200 ms stagger; CTA hover scale MUST NOT exceed 1.03; `prefers-reduced-motion: reduce` removes nonessential motion and prevents background autoplay.
- The new surface targets Stage B quality: keyboard, visible focus, WCAG 2.2 applicable A/AA checks, 200% zoom/reflow, no horizontal page overflow, and governed S/M/L/LIM evidence.
- Responsive policy remains governed by `TRAMA-RESPONSIVE@1.0.0`: S `320–599`, M `600–1023`, L `>=1024`, LIM reflow target `320` CSS px at zoom `4`.
- This increment MAY register Studio Atlas as a distinct PVIP; it MUST NOT apply visual changes to Studio Atlas runtime.
- No deployment/merge is automatic. Promotion requires exact-head CI plus Human Visual Review.

## Review Focus

- **Reduced motion:** with `prefers-reduced-motion: reduce`, the poster/static composition must render and the autoplaying `<video>` must not be present or started.
- **External media/font failure:** blocking the CloudFront video and external font endpoints must still leave readable copy, usable navigation/CTA, stable layout, and a complete local poster experience.
- **320 px reflow:** no navigation, heading, CTA, focus ring, or glass border may create horizontal overflow at the governed LIM/reflow width.
- **Media contrast variability:** focus indicators and hero text must remain perceptible over both bright and dark frames without adding a decorative page-wide overlay prohibited by the design.
- **Authority boundary:** header `Accedi` and hero `Entra in TRAMA` must delegate to one configured href and must never create a local login form, token flow, or account state.

---

### Task 1: Canonical parent identity seed and Studio Atlas PVIP registration

**Files:**
- Create: `policies/design-system/trama-parent-identity.v1.json`
- Create: `scripts/validate-trama-parent-identity.mjs`
- Create: `scripts/test-trama-parent-identity-validator.mjs`
- Modify: `policies/design-system/authority-registry.v1.json`
- Modify: `policies/design-system/trama-design-system.v1.json`
- Modify: `scripts/validate-design-system.mjs`
- Modify: `scripts/test-design-system-validator.mjs`

**Interfaces:**
- Consumes: `TRAMA-DESIGN-AUTHORITY-REGISTRY@1.0.0`, `TRAMA-DESIGN-SYSTEM@1.0.0`, the approved identity values from the design spec.
- Produces:
  - machine-readable parent policy `TRAMA-PARENT-IDENTITY@1.0.0`;
  - governed `STUDIO_ATLAS` authority/PVIP registration;
  - `validate-trama-parent-identity.mjs <policy-file>` returning exit `0` only for a complete, boundary-safe identity policy;
  - updated design-system validator requiring all five product profiles: `ARENA | ATLAS | STUDIO_ATLAS | DOCENTE_OS | TRAMA_CONTROL_CENTER`.

- [ ] **Step 1: Write failing validator tests**

Add test cases that prove:
- the current design system fails when `STUDIO_ATLAS` is required but missing;
- the parent identity fails when the wordmark is not exactly `TRAMA`;
- display/body font roles must resolve to `Instrument Serif` and `Inter` respectively;
- the exact parent HSL reference values are present;
- `reducedMotion` must require a static/poster path;
- `runtimeImpact`, `persistence`, and `studentAccountTracking` remain `NONE`, and `dosA1` remains `RUNTIME_DEFERRED`.

- [ ] **Step 2: Run RED verification**

Run from repository root:

`node scripts/test-design-system-validator.mjs && node scripts/test-trama-parent-identity-validator.mjs`

Expected: FAIL because the new parent validator/policy and `STUDIO_ATLAS` PVIP do not yet exist.

- [ ] **Step 3: Implement the governed identity seed**

Create `trama-parent-identity.v1.json` with these stable top-level concerns: identity/version/owner, wordmark, typography roles, parent reference palette, motion roles, media constraints, glass scope, accessibility/responsive bindings, and boundaries. Add `STUDIO_ATLAS` to the authority registry and design-system PVIPs with a differentiated creative-authoring identity; do not alias it to `ATLAS`.

- [ ] **Step 4: Run GREEN verification**

`node scripts/test-design-system-validator.mjs && node scripts/test-trama-parent-identity-validator.mjs`

Expected: PASS for valid fixtures and expected FAIL reasons for invalid fixtures.

- [ ] **Step 5: Commit**

`git add policies/design-system scripts/validate-design-system.mjs scripts/test-design-system-validator.mjs && git commit -m "feat: govern TRAMA parent identity and Studio Atlas PVIP"`

---

### Task 2: Independent gateway package foundation and dependency admission

**Files:**
- Create: `apps/gateway/package.json`
- Create: `apps/gateway/package-lock.json`
- Create: `apps/gateway/index.html`
- Create: `apps/gateway/tsconfig.json`
- Create: `apps/gateway/vite.config.ts`
- Create: `apps/gateway/components.json`
- Create: `apps/gateway/src/vite-env.d.ts`
- Create: `apps/gateway/src/main.tsx`
- Create: `apps/gateway/src/app/App.tsx`
- Create: `apps/gateway/src/config/gateway.ts`
- Create: `apps/gateway/src/lib/identity.ts`
- Create: `apps/gateway/src/lib/utils.ts`
- Create: `apps/gateway/src/test/setup.ts`
- Create: `apps/gateway/src/app/App.test.tsx`
- Create: `docs/implementation/trama-gateway-dependency-admission-v1.md`

**Interfaces:**
- Consumes: `TRAMA-PARENT-IDENTITY@1.0.0` values from Task 1.
- Produces:
  - standalone package `@trama/gateway`;
  - `gatewayConfig` containing `entryHref` plus the temporary prototype video URL;
  - `gatewayIdentity` local adapter exposing semantic CSS-variable values and font roles;
  - `cn(...inputs: ClassValue[]): string` for locally owned shadcn compositions.

- [ ] **Step 1: Write the failing app/config test**

`App.test.tsx` must initially assert that the rendered app has a `main` landmark, a visible `TRAMA` parent identity, and a non-empty configured `entryHref`. Add a focused identity test asserting the exact HSL reference values and font-family role names.

- [ ] **Step 2: Run RED verification**

From `apps/gateway`:

`npm test`

Expected: FAIL because the package/app/config/identity adapter do not exist.

- [ ] **Step 3: Add the minimal package and toolchain**

Reuse the existing repository frontend versions for React/Vite/TypeScript/testing. Add only Tailwind/shadcn supporting dependencies listed in the plan header. The dependency-admission document records package, purpose, source class, license, version policy, accessibility role, runtime impact, update policy, owner, and exit path. No root-level package is introduced.

`gatewayConfig.entryHref` must be resolved from `VITE_TRAMA_ENTRY_HREF`; in development/test it may use an explicit preview-safe fallback, but production build validation must reject an empty value rather than invent authentication behavior.

- [ ] **Step 4: Run GREEN verification**

`npm run typecheck && npm test && npm run build`

Expected: PASS with a minimal semantic app shell.

- [ ] **Step 5: Commit**

`git add apps/gateway docs/implementation/trama-gateway-dependency-admission-v1.md && git commit -m "feat: establish standalone TRAMA gateway app"`

---

### Task 3: Media backdrop, poster fallback, and reduced-motion behavior

**Files:**
- Create: `apps/gateway/src/hooks/use-prefers-reduced-motion.ts`
- Create: `apps/gateway/src/hooks/use-prefers-reduced-motion.test.tsx`
- Create: `apps/gateway/src/components/trama/TramaMediaBackdrop.tsx`
- Create: `apps/gateway/src/components/trama/TramaMediaBackdrop.test.tsx`
- Create: `apps/gateway/public/media/trama-gateway-poster.webp`
- Modify: `apps/gateway/src/config/gateway.ts`

**Interfaces:**
- Consumes: temporary prototype MP4 URL and local poster URL from `gatewayConfig`.
- Produces:
  - `usePrefersReducedMotion(): boolean`;
  - `<TramaMediaBackdrop videoSrc: string posterSrc: string />`;
  - static media fallback that is complete without a network video.

- [ ] **Step 1: Write failing behavior tests**

Prove that:
- normal-motion mode renders `<video autoPlay loop muted playsInline>` with absolute full-bleed object-cover semantics;
- reduced-motion mode does not render/start the autoplay video and renders the local poster path;
- a video `error` state preserves the poster/static visual instead of blanking the hero;
- the component contains no user data, analytics callback, or credential-bearing request logic.

- [ ] **Step 2: Run RED verification**

`npm test -- TramaMediaBackdrop use-prefers-reduced-motion`

Expected: FAIL because the hook/component do not exist.

- [ ] **Step 3: Implement media behavior**

Use `window.matchMedia('(prefers-reduced-motion: reduce)')` with listener cleanup. Use the supplied CloudFront MP4 only through configuration. Create the poster by deriving/selecting a representative non-identifying material frame for this prototype; do not treat that poster/video pair as final canonical media provenance.

- [ ] **Step 4: Run GREEN verification**

`npm run typecheck && npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

`git add apps/gateway/src/hooks apps/gateway/src/components/trama/TramaMediaBackdrop* apps/gateway/public/media apps/gateway/src/config/gateway.ts && git commit -m "feat: add resilient TRAMA gateway media backdrop"`

---

### Task 4: Cinematic gateway composition and accessible navigation

**Files:**
- Create: `apps/gateway/src/components/ui/button.tsx`
- Create: `apps/gateway/src/components/trama/TramaWordmark.tsx`
- Create: `apps/gateway/src/components/trama/TramaGlassAction.tsx`
- Create: `apps/gateway/src/components/trama/GatewayNav.tsx`
- Create: `apps/gateway/src/components/trama/GatewayHero.tsx`
- Create: `apps/gateway/src/components/trama/GatewayHero.test.tsx`
- Create: `apps/gateway/src/styles/globals.css`
- Modify: `apps/gateway/src/app/App.tsx`
- Modify: `apps/gateway/src/main.tsx`
- Modify: `apps/gateway/src/config/gateway.ts`

**Interfaces:**
- Consumes: `TramaMediaBackdrop`, `gatewayConfig.entryHref`, `gatewayIdentity`, shadcn open-code button primitive.
- Produces:
  - `TramaWordmark` accessible typographic parent signature;
  - `TramaGlassAction` for gateway-only CTA expression;
  - `GatewayNav` with desktop and mobile-accessible disclosure behavior;
  - `GatewayHero` with the approved copy and one primary journey.

- [ ] **Step 1: Write failing composition tests**

Assert exact visible copy:
- `TRAMA`;
- `Dove curricolo, conoscenza e progettazione diventano esperienza.`;
- `Un ecosistema per progettare, organizzare e trasformare il lavoro didattico, mantenendo unite intenzione educativa, materiali, evidenze e documentazione.`;
- `Entra in TRAMA`.

Also prove:
- hero CTA and header `Accedi` resolve to the same configured `entryHref`;
- secondary nav items are emitted only when they have real configured destinations, never as dead `#` controls;
- mobile navigation is keyboard operable and exposes an accessible name/state;
- heading/wordmark semantics are not duplicated into conflicting `h1` roles.

- [ ] **Step 2: Run RED verification**

`npm test -- GatewayHero`

Expected: FAIL because the cinematic composition/components do not exist.

- [ ] **Step 3: Implement the visual language**

Use semantic CSS variables and Tailwind utilities. Implement the approved `.liquid-glass` perimeter treatment, explicit visible `:focus-visible`, and a non-`backdrop-filter` fallback. Apply Instrument Serif only to identity/display roles and Inter to body/control roles. Implement `fade-rise` at 800 ms and 200 ms stagger; reduced-motion media query makes all entrance states immediate. Do not add decorative overlay layers, radial gradients, blobs, or CSS parallax.

Google-hosted fonts, if used for the prototype, must be declared as an external presentation dependency with local/system fallback; font acquisition failure must not block text. CSP must explicitly allow only the required font/style origins plus the temporary CloudFront media origin.

- [ ] **Step 4: Run GREEN verification**

`npm run typecheck && npm test && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

`git add apps/gateway/src apps/gateway/vite.config.ts && git commit -m "feat: build TRAMA cinematic gateway composition"`

---

### Task 5: Responsive, accessibility, failure-mode, and visual evidence tests

**Files:**
- Create: `apps/gateway/playwright.config.ts`
- Create: `apps/gateway/e2e/gateway.spec.ts`
- Create: `apps/gateway/e2e/gateway-accessibility.spec.ts`
- Create: `apps/gateway/e2e/gateway-media-fallback.spec.ts`
- Modify: `apps/gateway/package.json`

**Interfaces:**
- Consumes: completed gateway from Tasks 2–4.
- Produces deterministic Playwright evidence for S/M/L/LIM, keyboard/focus, axe, reduced-motion, media failure, and overflow behavior.

- [ ] **Step 1: Add failing E2E expectations**

Configure representative projects:
- S: `390x844`;
- M: `768x1024`;
- L: `1440x900`;
- LIM/reflow: `320x900` plus browser zoom/reflow check consistent with governed policy intent.

Tests must assert:
- `document.documentElement.scrollWidth <= document.documentElement.clientWidth`;
- primary CTA is visible/reachable in every condition;
- keyboard Tab reaches navigation/CTA with a visible focus indicator;
- no serious/critical axe violations on the gateway surface;
- reduced-motion emulation renders static media and suppresses entrance animation/video autoplay;
- aborting the CloudFront request still leaves poster, title, copy, and CTA usable;
- blocking Google font requests still leaves readable fallback typography;
- screenshots are captured for S/M/L/LIM for Human Visual Review, without personal/browser account data.

- [ ] **Step 2: Run RED verification**

`npm run test:e2e`

Expected: at least the newly introduced E2E checks fail until responsive/focus/fallback details are complete.

- [ ] **Step 3: Fix only the evidence-exposed gateway defects**

Adjust gateway composition/tokens/components as needed. Do not use E2E failures as justification to restyle unrelated TRAMA products.

- [ ] **Step 4: Run GREEN verification**

`npm run typecheck && npm test && npm run build && npm run test:e2e`

Expected: PASS across all configured gateway projects.

- [ ] **Step 5: Commit**

`git add apps/gateway && git commit -m "test: certify TRAMA gateway responsive accessibility"`

---

### Task 6: Exact-head CI and governed UI evidence materialization

**Files:**
- Create: `.github/workflows/trama-gateway.yml`
- Create: `apps/gateway/ui-evidence.manifest.template.json`
- Create: `scripts/materialize-trama-gateway-ui-evidence.mjs`
- Create: `scripts/test-materialize-trama-gateway-ui-evidence.mjs`
- Modify: `policies/ui-evidence-producers.v1.json` only if a new producer class is genuinely necessary; otherwise reuse existing `github-actions`, `playwright`, `axe`, and `human-governance-review` producers.
- Modify: PR #266 description/evidence section after CI results exist.

**Interfaces:**
- Consumes: existing `schemas/ui-evidence.manifest.schema.json`, `scripts/validate-ui-evidence.mjs`, `TRAMA-RESPONSIVE@1.0.0`, and Playwright/axe outputs.
- Produces:
  - exact-head materialized `ui-evidence.manifest.json` as a CI artifact;
  - workflow artifact containing responsive screenshots, machine results, traces only on failure, and manifest;
  - no deployment and no automatic merge.

- [ ] **Step 1: Write failing evidence-materializer tests**

Prove that the materializer:
- requires a 40-character exact head SHA;
- emits surface `trama-public-gateway` with aggregate `NEW`;
- declares S/M/L/LIM applicable and binds every responsive evidence record to `TRAMA-RESPONSIVE@1.0.0` plus concrete dimensions;
- classifies the journey as `NON_MUTATIVE` for `TRAMA-PW-01`;
- records the governed/new components and parent identity policy;
- keeps `runtimeImpact = NONE` and `dosA1 = RUNTIME_DEFERRED`;
- fails instead of manufacturing PASS if a required Playwright/axe artifact is missing.

- [ ] **Step 2: Run RED verification**

From repository root:

`node scripts/test-materialize-trama-gateway-ui-evidence.mjs`

Expected: FAIL because materializer/template do not exist.

- [ ] **Step 3: Implement CI workflow and evidence materialization**

Workflow responsibilities:
1. install only `apps/gateway` locked dependencies;
2. run parent/design-system validator suites;
3. run gateway typecheck/unit/build/E2E;
4. retain Playwright/axe evidence;
5. materialize manifest with `${GITHUB_SHA}` only after producer artifacts exist;
6. run `node scripts/validate-ui-evidence.mjs <materialized-manifest> ${GITHUB_SHA}`;
7. upload evidence artifact.

The committed template must not pretend to contain exact-head evidence. The generated manifest is the canonical run artifact for review.

- [ ] **Step 4: Run local GREEN verification and then exact-head CI**

Local:

`node scripts/test-design-system-validator.mjs && node scripts/test-trama-parent-identity-validator.mjs && node scripts/test-materialize-trama-gateway-ui-evidence.mjs`

Gateway:

`cd apps/gateway && npm run typecheck && npm test && npm run build && npm run test:e2e`

Expected: PASS locally. After push, the `TRAMA Gateway` workflow must PASS on the exact head before Human Visual Review is requested.

- [ ] **Step 5: Human Visual Review gate**

Review the exact-head S/M/L/LIM screenshots and the live/local rendered gateway against the approved `Segno vivo` design. Human review must explicitly assess:
- identity recognisability;
- typography and hierarchy;
- video/poster crop and readability;
- glass restraint;
- mobile composition;
- focus visibility;
- absence of generic/technical visual drift.

Result is one of `PASS | REWORK | REJECT`. Automation MUST NOT infer `PASS` from screenshots.

- [ ] **Step 6: Commit**

`git add .github/workflows/trama-gateway.yml apps/gateway/ui-evidence.manifest.template.json scripts/materialize-trama-gateway-ui-evidence.mjs scripts/test-materialize-trama-gateway-ui-evidence.mjs policies/ui-evidence-producers.v1.json && git commit -m "ci: certify TRAMA gateway exact-head evidence"`

---

## Plan self-review

- **Spec coverage:** parent identity, Studio Atlas PVIP registration, gateway information architecture, media/poster fallback, glass/motion, typography/palette, responsive S/M/L/LIM, WCAG/accessibility, evidence and Human Visual Review all map to explicit tasks.
- **Scope containment:** no task propagates CSS/runtime changes into Arena, Atlas, Studio Atlas, Docente OS, or Control Center. Propagation remains a later evidence-informed increment.
- **Authority containment:** CTA is delegation only; no authentication, persistence, tracking, publication, or DOS-A1 activation is introduced.
- **Media provenance:** the supplied CloudFront asset remains prototype-only; the plan does not canonize it by implementation.
- **Exact-head evidence:** committed metadata is a template; CI materializes exact-head evidence only after producer artifacts exist, avoiding stale/self-certified PASS.
- **Test coverage of Review Focus:** reduced motion is Task 3/5; external media/font failure is Task 5; 320 px reflow is Task 5; contrast/focus over media is Task 5 + Human Review; authority boundary is Task 2/4/6.
- **No premature deployment:** the plan ends at exact-head certification and Human Visual Review. Deployment/publication is a separate authorized decision.
