# ACCESS-01 Phase 0 — Safe Public Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the TRAMA Gateway fully visible and usable as a public landing when no canonical professional-entry destination exists, while keeping professional entry fail-closed and non-navigable.

**Architecture:** Replace the production-time throw with a provider-neutral entry resolver that returns `null` when production entry is unavailable. `TramaGlassAction` renders a real link only when a destination exists and otherwise renders an accessible disabled button. Browser certification must prove that the public landing still renders without an entry destination; ACCESS-01 state is updated only after exact-head evidence exists.

**Tech Stack:** React 19, TypeScript, Vite 8, Vitest, Testing Library, Playwright, existing TRAMA Gateway CI/governance workflows.

**Spec:** `docs/superpowers/specs/2026-10-10-trama-access-01-ecosystem-access-architecture.md`

## Global Constraints

- Gateway remains public and is not the identity provider.
- No temporary Docente OS, Studio Atlas, Arena, Curricolo Atlas, or other product URL may substitute for TRAMA Access.
- Missing `VITE_TRAMA_ENTRY_HREF` in production must not crash or blank the public landing.
- Professional entry remains fail-closed until canonical TRAMA Access is certified.
- Existing hero, background assets, navbar structure, visual identity, secondary landing sections, and responsive behavior remain unchanged except for the unavailable-entry state.
- Canonical name remains **Curricolo Atlas**.
- No authentication SDK, user migration, database change, student data, telemetry, or new runtime authority is introduced.
- No merge or deploy without the applicable explicit decision.

## Review Focus

1. Missing or whitespace-only production entry configuration must render the landing and must not create a navigable access link.
2. A configured production entry must remain a trimmed navigable link with no behavior regression.
3. Development/test fallback must remain explicit and preview-safe; it must not leak into production.
4. Disabled access controls must remain keyboard/assistive-technology understandable and must not expose an empty `href`.
5. Existing public navigation, hero visuals, browser evidence, and responsive certification must remain unchanged apart from access-action semantics.

---

### Task 1: Make entry configuration non-destructive and explicit

**Files:**
- Modify: `apps/gateway/src/config/gateway.test.ts`
- Modify: `apps/gateway/src/config/gateway.ts`

**Interfaces:**
- Produces: `resolveGatewayEntryHref(configuredHref: string | undefined, production: boolean): string | null`.
- Produces: `gatewayConfig.entryHref: string | null`.
- Preserves: development/test fallback `/preview` when no configured destination exists.

- [ ] **Step 1: Write failing resolver tests**

Add assertions that:
- production + `undefined` => `null`;
- production + whitespace-only => `null`;
- production + configured URL/path => trimmed configured value;
- non-production + `undefined` => `/preview`.

- [ ] **Step 2: Run RED verification**

Run: `npm test -- --run src/config/gateway.test.ts`
Expected: FAIL because `resolveGatewayEntryHref` does not yet exist and production currently throws instead of resolving unavailable entry safely.

- [ ] **Step 3: Implement minimal resolver and remove destructive production throw**

In `apps/gateway/src/config/gateway.ts`, export exactly:

`resolveGatewayEntryHref(configuredHref: string | undefined, production: boolean): string | null`

Rules:
- trim configured input;
- return the trimmed configured value when non-empty;
- return `null` in production when missing/blank;
- return `/preview` when missing/blank outside production.

Use it to populate `gatewayConfig.entryHref`. Remove the module-level production `throw`.

- [ ] **Step 4: Run GREEN verification**

Run: `npm test -- --run src/config/gateway.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `fix(gateway): keep public landing safe without access destination`

---

### Task 2: Render unavailable professional entry as an accessible disabled control

**Files:**
- Create: `apps/gateway/src/components/trama/TramaGlassAction.test.tsx`
- Modify: `apps/gateway/src/components/trama/TramaGlassAction.tsx`
- Verify unchanged callers: `apps/gateway/src/app/App.tsx`, `apps/gateway/src/components/trama/TramaNavigation.tsx`

**Interfaces:**
- Consumes: `gatewayConfig.entryHref: string | null`.
- Produces: `TramaGlassAction({ href: string | null, ... })`.
- When `href` is non-null: renders the existing anchor semantics.
- When `href` is null: renders a disabled non-navigation control with `aria-disabled="true"`, no anchor and no empty `href`.

- [ ] **Step 1: Write failing component tests**

Test both states:
- configured `href` renders a link with the exact destination;
- `href={null}` renders a disabled button/control, exposes `aria-disabled="true"`, and no matching anchor exists.

- [ ] **Step 2: Run RED verification**

Run: `npm test -- --run src/components/trama/TramaGlassAction.test.tsx`
Expected: FAIL because current component requires a string and always renders an anchor.

- [ ] **Step 3: Implement minimal disabled-state branch**

Preserve all existing visual variants/classes. Do not change CTA text, hero layout, navigation layout, or secondary links.

- [ ] **Step 4: Run GREEN verification**

Run: `npm test -- --run src/components/trama/TramaGlassAction.test.tsx src/app/App.test.tsx src/components/trama/TramaNavigation.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run full Gateway unit/type/build verification**

Run: `npm test && npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `fix(gateway): disable professional entry until Access exists`

---

### Task 3: Certify missing-entry browser behavior and update state evidence

**Files:**
- Create: `apps/gateway/playwright.no-entry.config.ts`
- Create: `apps/gateway/e2e/no-entry-public-surface.spec.ts`
- Modify: `.github/workflows/trama-gateway.yml`
- Modify: `governance/access/trama-ecosystem-state-v0.2.json`
- Create: `docs/evidence/access-01/access-01-phase-0-safe-gateway-receipt.md`

**Interfaces:**
- Consumes: production build with no `VITE_TRAMA_ENTRY_HREF`.
- Produces: browser evidence that public content renders and access controls are disabled/non-navigable.
- Produces state delta only for `public_to_gateway`: `PARTIAL` → `REAL` after exact-head PASS.
- Preserves `gateway_to_trama_access: DESIGNED`.

- [ ] **Step 1: Write failing browser test/config**

The no-entry Playwright run must assert:
- gateway heading is visible;
- `Entra in TRAMA` exists as disabled control and is not a link;
- `Accedi` exists as disabled control in the applicable viewport state and is not a link;
- public secondary anchors still resolve to real sections;
- no page error is emitted from missing entry configuration.

- [ ] **Step 2: Add a dedicated CI step that runs the no-entry browser certification without setting `VITE_TRAMA_ENTRY_HREF`**

Do not remove the existing configured-entry certification. The new step is additive and uses a separate port/config so both modes are proven.

- [ ] **Step 3: Run/observe RED on the PR exact head before implementation if the browser test lands first; otherwise treat Task 1/2 commits as the implementation under test and require the new browser job to PASS before state mutation**

Expected before state mutation: no-entry browser test proves the intended behavior.

- [ ] **Step 4: Update machine-readable state only after exact-head browser evidence is PASS**

Change only:
- `gateway.runtimeState`: `BLOCKED_ENTRY` → `PUBLIC_SAFE_ENTRY_UNAVAILABLE`;
- `public_to_gateway.state`: `PARTIAL` → `REAL`;
- notes to reference the safe fail-closed behavior.

Do not change `gateway_to_trama_access` from `DESIGNED`.

- [ ] **Step 5: Record decision receipt**

The receipt must list exact head, workflow/run references, what became `REAL`, what remains `DESIGNED`, and explicitly state that no TRAMA Access runtime or professional destination was introduced.

- [ ] **Step 6: Final exact-head verification**

Required PASS on the exact head:
- Gateway unit/type/build;
- existing Browser Certification;
- no-entry Browser Certification;
- Governance.

- [ ] **Step 7: Commit**

Commit message: `test(access): certify safe public gateway without entry runtime`

---

## Phase 0 Completion Contract

Phase 0 is complete only when:

- the public production-mode Gateway renders without `VITE_TRAMA_ENTRY_HREF`;
- `Entra in TRAMA` / `Accedi` cannot navigate while Access is unavailable;
- configured-entry behavior still works in existing certification;
- no visual/background/layout regression is introduced;
- exact-head Gateway and Governance workflows PASS;
- `public_to_gateway` is evidence-backed as `REAL`;
- `gateway_to_trama_access` remains `DESIGNED`;
- no deploy or merge is performed automatically.
