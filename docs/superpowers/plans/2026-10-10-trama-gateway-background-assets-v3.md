# TRAMA Gateway Background Assets v3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy S/M/L poster path with a four-role L/M/S/LIM high-resolution, UI-free background family and produce deterministic background-only evidence for Human Visual Review.

**Architecture:** Keep the public gateway structure unchanged while moving media selection to a dedicated `background` contract. Native `<picture>` art direction selects L/M/S/LIM without JavaScript. Background-only review is implemented only in the Playwright/evidence harness: reduced motion disables video and test-time CSS hides navigation, hero content and `Segno vivo`; no public review route is introduced. The media validator is the hard gate for four valid WebP assets, provenance v3, dimensions and aspect ratios.

**Tech Stack:** React 19, TypeScript 7, Vitest 5, Playwright 1.63, Node.js 22, Vite 8, WebP.

**Spec:** `docs/superpowers/specs/2026-10-10-trama-gateway-background-assets-v3-execution-spec.md`

## Global Constraints

- Scope remains PR #266 on `design/trama-identity-gateway-v1`; no merge or deploy is authorized.
- Canonical roles are exactly `lim`, `s`, `m`, `l` with files `trama-gateway-bg-{role}.webp`.
- Minimum production sizes: L 2560×1440, M 1536×2048, S 1170×2532, LIM 960×2700.
- Each role must be independently art-directed at its native target aspect ratio; no upscaling, screenshot-derived assets or mechanical master-image cropping.
- Runtime format is valid RIFF/WEBP; recommended photographic quality is approximately 88–92, fidelity before byte size.
- Background files contain scene only: no wordmark, navigation, hero copy, CTA, glass UI, breakpoint labels, `Segno vivo` or other interface simulation.
- During background review exactly one static scene image is visually active; video and duplicate media are forbidden.
- Background evidence only: navbar, hero copy, CTA and `Segno vivo` are hidden by test/evidence harness behavior, not a production review route.
- Provenance is version 3; each role records canonical path, role, pixel dimensions, source/generation method, art-direction note, encoding, date, pending Human Review approval, `identifiablePersons: false`, `studentData: false`, and UI/`Segno vivo` exclusion.
- Approval remains `IMPLEMENTATION_CANDIDATE_PENDING_HUMAN_REVIEW` until the four background screenshots receive Human PASS.
- No new authentication, persistence, analytics/tracking, student data, ecosystem runtime coupling, authority changes or DOS-A1 activation.

## Review Focus

- A 359 px viewport must resolve LIM, while 360 px must resolve S; add explicit unit/e2e assertions at the boundary.
- A valid WebP with correct minimum dimensions but a ratio outside ±2% must fail validator v3.
- Provenance with four entries but a legacy poster path, missing UI-free flag or non-false privacy flags must fail.
- Background-only evidence must contain exactly one rendered `img.trama-media-visual`, zero `video` elements and no visible navigation/hero/Segno vivo.
- Legacy poster files may remain temporarily in the repository, but neither configuration, evidence manifest nor runtime selection may reference them.

---

### Task 1: Four-role runtime media contract

**Files:**
- Modify: `apps/gateway/src/config/gateway.test.ts`
- Modify: `apps/gateway/src/components/trama/TramaMediaBackdrop.test.tsx`
- Modify: `apps/gateway/src/config/gateway.ts`
- Modify: `apps/gateway/src/components/trama/TramaMediaBackdrop.tsx`
- Modify: `apps/gateway/src/components/trama/TramaGatewayShell.tsx`

**Interfaces:**
- Produces: `gatewayConfig.background: { lim: string; s: string; m: string; l: string }`.
- Produces: `TramaBackgroundSources` and `TramaMediaBackdropProps.background`.
- Consumes: existing optional prototype video behavior for the full gateway; background-only suppression remains the responsibility of the evidence harness in Task 3.

- [ ] **Step 1: Write failing configuration test**

Assert that `gatewayConfig.background` has exactly `lim/s/m/l`, every path ends in `trama-gateway-bg-{role}.webp`, and serialized configuration contains no `trama-gateway-poster-` reference.

- [ ] **Step 2: Write failing media-component test**

Assert `<picture>` has sources in this contract: L `(min-width: 1024px)`, M `(min-width: 600px)`, LIM `(max-width: 359px)`, with S as `<img src>`. Assert one `<img>` exists and all paths use the `bg-` family.

- [ ] **Step 3: Verify RED**

Run via PR CI: `cd apps/gateway && npm test -- src/config/gateway.test.ts src/components/trama/TramaMediaBackdrop.test.tsx`

Expected: FAIL because `background`/LIM do not exist and the component still consumes `poster`.

- [ ] **Step 4: Implement minimal four-role contract**

Rename the canonical runtime media contract from `poster` to `background`, add `lim`, and update `TramaGatewayShell` to pass `background={gatewayConfig.background}`. Preserve current video behavior outside background-only evidence.

- [ ] **Step 5: Verify GREEN for Task 1**

Run: `cd apps/gateway && npm test -- src/config/gateway.test.ts src/components/trama/TramaMediaBackdrop.test.tsx && npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat(gateway): add four-role background media contract`

---

### Task 2: Validator v3 and provenance contract

**Files:**
- Modify: `scripts/test-trama-gateway-media-validator.mjs`
- Modify: `scripts/validate-trama-gateway-media.mjs`
- Modify: `apps/gateway/public/media/trama-gateway-media-provenance.json`

**Interfaces:**
- Consumes: Task 1 canonical `bg-` path names.
- Produces: `validateTramaGatewayMedia()` result with four paths/dimensions and provenance v3.

- [ ] **Step 1: Write failing validator fixtures**

Create fixtures for roles `lim/s/m/l` and assert failures for: missing LIM; corrupt/non-WebP file; provenance version not 3; canonical path mismatch/legacy poster path; each role below its minimum dimensions; each role outside ±2% target ratio; `identifiablePersons !== false`; `studentData !== false`; missing `uiEmbedded: false`; missing `segnoVivoEmbedded: false`.

- [ ] **Step 2: Verify RED**

Run: `node scripts/test-trama-gateway-media-validator.mjs`

Expected: FAIL because validator v2 only knows S/M/L poster files and only enforces L 1920×1080.

- [ ] **Step 3: Implement validator v3**

Use roles `['lim','s','m','l']`; resolve `trama-gateway-bg-{role}.webp`; enforce valid RIFF/WEBP dimensions, minimum sizes and ±2% ratios; require provenance `version === 3`, canonical paths, dimension metadata matching actual files, pending Human Review approval, privacy flags false, and explicit UI/`Segno vivo` exclusion. Diagnostic output reports dimensions and byte sizes for all four roles.

- [ ] **Step 4: Update provenance schema instance**

Create four v3 entries with canonical paths and all required fields. Do not claim final generated dimensions until the real assets from Task 4 are present; values must match those files before Task 2 can be marked complete on the branch.

- [ ] **Step 5: Verify GREEN for validator fixtures**

Run: `node scripts/test-trama-gateway-media-validator.mjs`

Expected: PASS for negative fixtures (each rejected for the intended reason) plus a positive four-role fixture.

- [ ] **Step 6: Commit**

Commit message: `test(gateway): enforce background media provenance v3`

---

### Task 3: Background-only browser evidence and manifest binding

**Files:**
- Modify: `apps/gateway/e2e/gateway.spec.ts`
- Modify: `scripts/materialize-trama-gateway-ui-evidence.mjs`
- Modify: `scripts/test-materialize-trama-gateway-ui-evidence.mjs`
- Modify: `.github/workflows/trama-gateway.yml` only if required to bind the new evidence files/validator script path.

**Interfaces:**
- Consumes: Task 1 four-role `<picture>` contract and Task 2 validator result.
- Produces: `background-L.png`, `background-M.png`, `background-S.png`, `background-LIM.png` plus manifest evidence entries bound to the exact head and four canonical background assets.

- [ ] **Step 1: Write failing e2e assertions**

Add a background-only evidence test that calls `page.emulateMedia({ reducedMotion: 'reduce' })` before navigation, hides only navigation/main/`[data-testid="trama-segno-vivo"]` with injected test CSS, then asserts: exactly one `img.trama-media-visual`, zero `video`, hidden UI layers, no horizontal overflow, and `currentSrc` resolves to L/M/S/LIM according to project viewport including the 359/360 boundary contract.

- [ ] **Step 2: Write failing evidence-materialization test**

Require the four `background-{condition}.png` files and manifest bindings for four canonical `bg-` assets; assert legacy `poster-` references are absent.

- [ ] **Step 3: Verify RED**

Run via PR CI: `cd apps/gateway && npm run test:e2e` and `node scripts/test-materialize-trama-gateway-ui-evidence.mjs`.

Expected: FAIL because background-only screenshots/bindings do not exist and LIM still resolves S on the current implementation.

- [ ] **Step 4: Implement evidence harness only**

Generate `background-{S,M,L,LIM}.png` from the existing `/` route with reduced motion and injected hiding CSS. Keep the existing full-gateway responsive/accessibility evidence unless its manifest binding must be renamed; do not add a public review route. Update the materializer to require/bind four background screenshots and four `bg-` repository files.

- [ ] **Step 5: Verify GREEN for Task 3**

Run: `node scripts/test-materialize-trama-gateway-ui-evidence.mjs`; then PR Browser Certification.

Expected: materializer fixture PASS; browser evidence assertions PASS once Task 4 assets exist.

- [ ] **Step 6: Commit**

Commit message: `test(gateway): add background-only visual evidence gate`

---

### Task 4: Native L/M/S/LIM assets and exact-head certification

**Files:**
- Create: `apps/gateway/public/media/trama-gateway-bg-l.webp`
- Create: `apps/gateway/public/media/trama-gateway-bg-m.webp`
- Create: `apps/gateway/public/media/trama-gateway-bg-s.webp`
- Create: `apps/gateway/public/media/trama-gateway-bg-lim.webp`
- Finalize: `apps/gateway/public/media/trama-gateway-media-provenance.json`
- Optional after verification only: remove legacy `trama-gateway-poster-{s,m,l}.webp` files from the canonical family; removal is not required if they are unreferenced.

**Interfaces:**
- Consumes: exact filenames and validation contract from Tasks 1–3.
- Produces: the only four canonical runtime backgrounds and the Human Review evidence package.

- [ ] **Step 1: Author four independent scene compositions**

Create UI-free photographic/material TRAMA atelier scenes natively for 16:9, 3:4, 390:844 and 320:900. Do not derive any output by enlarging existing S/M/L posters, screenshotting mockups or mechanically cropping one master panorama.

- [ ] **Step 2: Encode without upscaling**

Encode high-quality WebP near quality 88–92 (raise if texture degrades). Final dimensions must be at least L 2560×1440, M 1536×2048, S 1170×2532, LIM 960×2700.

- [ ] **Step 3: Finalize provenance v3 with measured values**

Record actual dimensions, source/generation method, role-specific art direction, WebP encoding setting, date, approval `IMPLEMENTATION_CANDIDATE_PENDING_HUMAN_REVIEW`, privacy false flags, `uiEmbedded: false` and `segnoVivoEmbedded: false`.

- [ ] **Step 4: Run validator and full gateway suite**

Run:
`node scripts/test-trama-gateway-media-validator.mjs`
`node scripts/validate-trama-gateway-media.mjs`
`cd apps/gateway && npm run typecheck && npm test && npm run build && npm run test:e2e`

Expected: all PASS, four background screenshots materialized, no duplicate media.

- [ ] **Step 5: Exact-head CI certification**

Require both `Governance` and `TRAMA Gateway` workflow runs PASS on the exact head. Record workflow run IDs and the uploaded evidence artifact.

- [ ] **Step 6: Human Visual Review gate**

Review only `background-L.png`, `background-M.png`, `background-S.png`, `background-LIM.png` against the ten criteria in the v3 spec. Decision is exactly PASS, REWORK or REJECT. Do not resume full gateway UI integration unless Human decision is PASS.

- [ ] **Step 7: Commit**

Commit message: `feat(gateway): add v3 art-directed background family`
