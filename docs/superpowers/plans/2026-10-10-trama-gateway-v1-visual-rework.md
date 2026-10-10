# TRAMA Gateway v1 Visual Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the rejected flat/vector gateway background with an art-directed photographic/material poster system faithful to the approved TRAMA visual baseline while preserving the already-qualified gateway behavior, accessibility and authority boundaries.

**Architecture:** Keep the existing standalone `apps/gateway` React/Vite application and its current identity components. Introduce a poster-first S/M/L media contract, wire it through `gatewayConfig` and `TramaMediaBackdrop`, preserve optional video as a non-canonical enhancement, and certify the revised exact head with deterministic static-poster evidence before Human Visual Review.

**Tech Stack:** React 19 · Vite 8 · TypeScript 7 · Tailwind CSS 4 · Vitest · Testing Library · Playwright · axe · native `<picture>`/`<video>`/CSS media queries where appropriate.

**Spec:** `docs/superpowers/specs/2026-10-10-trama-gateway-v1-implementation-spec.md`

## Global Constraints

- Approved visual reference: `docs/superpowers/specs/assets/trama-identity-gateway-v1-approved-baseline.jpg`.
- Approved reference is a design contract, **not** a production poster with baked-in UI.
- Production poster assets contain no wordmark, navigation, hero copy or CTA text.
- Static poster is first-class; video is optional enhancement.
- S = 320–599 px; M = 600–1023 px; L = ≥1024 px.
- LIM = `LIMITED_REFLOW`, max inline size 320 px, zoom 4×, reflow required; LIM is not a fourth decorative breakpoint.
- The rejected vector poster must not appear in production/certification paths.
- Preserve current gateway information architecture and canonical copy.
- No new authentication, persistence, tracking, product authority or cross-repository runtime package.
- DOS-A1 remains `RUNTIME_DEFERRED`.
- No automatic merge or deploy.
- Human Visual Review is the final authority for PASS / REWORK / REJECT.

## Review Focus

1. **Static-first identity:** with external video blocked or reduced motion enabled, the gateway must still look materially/cinematically TRAMA rather than like a generic dark landing page.
2. **Responsive art direction:** S/M/L must use deliberate media selection/crop rather than blindly scaling the desktop image; LIM must reflow using the S-compatible composition.
3. **Reading-zone stability:** bright paper, annotations, hard edges and copper traces must not compete with hero copy at any governed viewport.
4. **Failure resilience:** video failure, font failure and unsupported backdrop filtering must preserve readable navigation, hero and CTA without layout shift.
5. **Authority boundary:** `Entra in TRAMA` remains a configured navigation action and must not introduce local account/token/auth state.

---

### Task 1: Lock the poster-first contract in RED

**Files:**
- Modify: `apps/gateway/src/config/gateway.ts`
- Modify: `apps/gateway/src/app/App.test.tsx`
- Modify: `apps/gateway/src/components/trama/TramaMediaBackdrop.test.tsx`
- Create: `apps/gateway/src/config/gateway.test.ts`

**Interfaces:**
- Produces target config shape: `gatewayConfig.poster.{s,m,l}: string`.
- Preserves: `gatewayConfig.entryHref` and optional prototype video source.

- [ ] **Step 1: Write failing config tests**

Assert that:

```ts
expect(gatewayConfig.poster.s).toMatch(/poster-s\.webp$/)
expect(gatewayConfig.poster.m).toMatch(/poster-m\.webp$/)
expect(gatewayConfig.poster.l).toMatch(/poster-l\.webp$/)
expect(Object.values(gatewayConfig.poster).every((src) => !src.endsWith('.svg'))).toBe(true)
```

- [ ] **Step 2: Write failing backdrop tests**

Add assertions that the media backdrop exposes S/M/L static sources and keeps the static media present when video is unavailable or reduced motion is enabled.

- [ ] **Step 3: Run RED**

Run from `apps/gateway`:

```bash
npm test -- src/config/gateway.test.ts src/components/trama/TramaMediaBackdrop.test.tsx src/app/App.test.tsx
```

Expected: FAIL because the current configuration has one generic SVG poster and the backdrop has no S/M/L poster contract.

- [ ] **Step 4: Commit RED**

```bash
git add apps/gateway/src/config/gateway.test.ts apps/gateway/src/components/trama/TramaMediaBackdrop.test.tsx apps/gateway/src/app/App.test.tsx
git commit -m "test: define TRAMA photographic poster contract"
```

---

### Task 2: Create and govern the UI-free production poster family

**Files:**
- Create: `apps/gateway/public/media/trama-gateway-poster-s.webp`
- Create: `apps/gateway/public/media/trama-gateway-poster-m.webp`
- Create: `apps/gateway/public/media/trama-gateway-poster-l.webp`
- Create: `apps/gateway/public/media/trama-gateway-media-provenance.json`
- Create: `scripts/validate-trama-gateway-media.mjs`
- Create: `scripts/test-trama-gateway-media-validator.mjs`

**Interfaces:**
- Produces runtime media paths used by Task 3.
- Consumes approved visual semantics from the design reference; does not copy embedded UI from that reference.

- [ ] **Step 1: Write RED media-validator tests**

Tests must fail when:

- any of S/M/L is missing;
- an asset extension is not approved (`.webp` or explicitly accepted future format);
- L effective dimensions are below 1920×1080;
- provenance is missing a role/source/approval/date entry;
- a canonical production path points to `trama-gateway-poster.svg`.

- [ ] **Step 2: Run RED validator**

```bash
node scripts/test-trama-gateway-media-validator.mjs
```

Expected: FAIL because the production poster family does not exist yet.

- [ ] **Step 3: Produce UI-free S/M/L assets from the approved art direction**

Requirements shared by all three:

- photographic/material scene;
- ink/navy atmosphere;
- warm directional light;
- books/paper/annotations/technical traces;
- quiet copy zone;
- no embedded TRAMA wordmark, hero copy, navigation or CTA;
- restrained copper traces only;
- no generic digital/AI motifs.

Art-direct S/M/L separately rather than generating one crop and assuming all viewports work.

- [ ] **Step 4: Create provenance record**

For each asset record:

- path;
- responsive role;
- source/generation method;
- approval state;
- date;
- identifiable-person/data state;
- provenance/usage notes without unsupported licence claims.

- [ ] **Step 5: Run validator GREEN**

```bash
node scripts/test-trama-gateway-media-validator.mjs
node scripts/validate-trama-gateway-media.mjs
```

Expected: PASS with S/M/L present and provenance complete.

- [ ] **Step 6: Commit assets and governance**

```bash
git add apps/gateway/public/media scripts/validate-trama-gateway-media.mjs scripts/test-trama-gateway-media-validator.mjs
git commit -m "feat: add governed TRAMA photographic poster family"
```

---

### Task 3: Wire responsive posters and preserve optional video

**Files:**
- Modify: `apps/gateway/src/config/gateway.ts`
- Modify: `apps/gateway/src/components/trama/TramaMediaBackdrop.tsx`
- Modify: `apps/gateway/src/components/trama/TramaMediaBackdrop.test.tsx`
- Modify: `apps/gateway/src/config/gateway.test.ts`

**Interfaces:**
- Consumes: `gatewayConfig.poster.{s,m,l}`.
- Produces: deterministic poster-first DOM/media composition for browser certification.

- [ ] **Step 1: Implement minimal poster config GREEN**

Expose:

```ts
poster: {
  s: '/media/trama-gateway-poster-s.webp',
  m: '/media/trama-gateway-poster-m.webp',
  l: '/media/trama-gateway-poster-l.webp',
}
```

Preserve explicit production validation for `entryHref`.

- [ ] **Step 2: Implement responsive static media in `TramaMediaBackdrop`**

Use native browser responsive media selection (`<picture>`/`<source media>` or equivalent native CSS mechanism). Do not add a media-selection dependency.

Required behavior:

- L source for ≥1024 px;
- M source for 600–1023 px;
- S source otherwise and for LIM reflow;
- poster/static layer remains mounted beneath optional video;
- reduced motion does not mount/autoplay video;
- video error leaves static layer visible.

- [ ] **Step 3: Run focused GREEN tests**

```bash
npm test -- src/config/gateway.test.ts src/components/trama/TramaMediaBackdrop.test.tsx src/app/App.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/gateway/src/config/gateway.ts apps/gateway/src/components/trama/TramaMediaBackdrop.tsx apps/gateway/src/components/trama/TramaMediaBackdrop.test.tsx apps/gateway/src/config/gateway.test.ts
git commit -m "feat: make TRAMA gateway poster-first and responsive"
```

---

### Task 4: Tune composition without increasing UI decoration

**Files:**
- Modify: `apps/gateway/src/app/App.tsx` only if required
- Modify: `apps/gateway/src/styles/globals.css`
- Modify: `apps/gateway/tests/gateway.spec.ts`
- Modify: `apps/gateway/tests/media-fallback.spec.ts`

**Interfaces:**
- Consumes Task 3 poster-first media layer.
- Produces stable reading-zone composition across S/M/L/LIM.

- [ ] **Step 1: Add browser assertions before visual tuning**

Assert in static-media mode:

- hero title visible;
- CTA visible and operable;
- no horizontal overflow;
- rejected SVG source absent;
- S/M/L selects the intended poster role;
- LIM uses S-compatible media and reflows at max inline 320 / zoom 4×.

- [ ] **Step 2: Run browser tests to establish current failure/delta**

```bash
npm run test:e2e
```

Expected: structural tests for the old media contract fail until the new responsive selection is visible to the browser suite.

- [ ] **Step 3: Tune only media/copy relationship**

Permitted changes:

- responsive `object-position`/source placement;
- subtle text shadow;
- local low-opacity tonal support close to copy if still required;
- spacing adjustments needed to protect the reading zone.

Do not add:

- global dark overlay;
- large hero glass card;
- heavy glow;
- new copy;
- extra CTA/navigation density;
- parallax.

- [ ] **Step 4: Run unit/type/build/browser suite**

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/gateway/src/app/App.tsx apps/gateway/src/styles/globals.css apps/gateway/tests
git commit -m "fix: align TRAMA hero composition with approved baseline"
```

---

### Task 5: Add media governance to exact-head certification

**Files:**
- Modify: `.github/workflows/trama-gateway.yml`
- Modify: `scripts/materialize-trama-gateway-ui-evidence.mjs` if evidence schema can record media roles without contract expansion
- Modify: `scripts/test-materialize-trama-gateway-ui-evidence.mjs` if materializer changes
- Modify: `apps/gateway/ui-evidence.manifest.template.json` if the existing schema has a compatible field

**Interfaces:**
- Consumes media validator and exact-head gateway evidence.
- Produces CI proof that certified screenshots cannot silently fall back to the rejected vector poster.

- [ ] **Step 1: Add failing workflow/materializer test where applicable**

Require gateway certification to run:

```bash
node scripts/test-trama-gateway-media-validator.mjs
node scripts/validate-trama-gateway-media.mjs
```

before browser evidence.

If the current UI-evidence schema has a compatible component/media trace field, bind S/M/L poster roles there. Do not expand the schema only for cosmetic metadata unless needed for traceability.

- [ ] **Step 2: Run local/script RED then GREEN**

```bash
node scripts/test-trama-gateway-media-validator.mjs
node scripts/validate-trama-gateway-media.mjs
node scripts/test-materialize-trama-gateway-ui-evidence.mjs
```

Expected: PASS after workflow/materializer integration.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/trama-gateway.yml scripts apps/gateway/ui-evidence.manifest.template.json
git commit -m "test: certify TRAMA gateway media provenance and poster roles"
```

---

### Task 6: Exact-head recertification and Human Visual Review

**Files:**
- No runtime changes unless a test or Human Review finding requires REWORK.
- Update PR body/evidence references only after fresh exact-head results exist.

**Interfaces:**
- Consumes all preceding tasks.
- Produces final PASS / REWORK / REJECT decision; automation cannot produce visual PASS.

- [ ] **Step 1: Verify exact PR head**

Record the 40-character SHA and confirm PR #266 remains open, Draft and unmerged.

- [ ] **Step 2: Verify Governance workflow on exact head**

Expected: PASS.

- [ ] **Step 3: Verify TRAMA Gateway workflow on exact head**

Expected all steps PASS:

- governed identity;
- media validator/provenance;
- install;
- typecheck/unit/build;
- Browser Certification;
- exact-head evidence materialization;
- evidence upload.

- [ ] **Step 4: Inspect exact-head evidence manually**

Review S/M/L/LIM plus reduced-motion/media-failure states against:

`docs/superpowers/specs/assets/trama-identity-gateway-v1-approved-baseline.jpg`

Human criteria:

- recognisable TRAMA identity;
- photographic/material depth;
- static state strong without video;
- quiet reading zone;
- restrained copper/glass;
- responsive art direction;
- no generic SaaS/technical drift.

- [ ] **Step 5: Record Human Review outcome**

Allowed outcomes only:

- `PASS`
- `REWORK`
- `REJECT`

Do not infer PASS from CI.

- [ ] **Step 6: Update PR #266 status**

If PASS, record exact head and evidence but do **not** auto-merge or deploy.

If REWORK, record concrete visual finding(s) and return to the smallest owning task.

---

## Self-review

### Spec coverage

- Poster-first rule: Tasks 1–3.
- UI-free S/M/L photographic assets: Task 2.
- Approved reference separated from production media: Tasks 2 and 6.
- Optional video/failure/reduced motion: Tasks 1 and 3.
- Reading-zone/art direction: Task 4 + Human Review.
- Correct S/M/L/LIM semantics: Tasks 1, 3, 4 and 6.
- Accessibility/resilience: Tasks 3–4 and existing browser suite.
- Media provenance: Tasks 2 and 5.
- Exact-head evidence: Tasks 5–6.
- Authority/no-auth/no-tracking boundaries: Global Constraints and existing tests remain preserved.
- Human Visual Review: Task 6.

No uncovered design requirement was found.

### Type/interface consistency

`gatewayConfig.poster.{s,m,l}` is the only new runtime configuration interface introduced by the plan and is consumed consistently by Tasks 1–4.

### Proportion/YAGNI

The plan reuses the existing gateway and test infrastructure. It does not introduce a media library, shared runtime package, new router/auth surface, parallax system or new visual-regression framework.
