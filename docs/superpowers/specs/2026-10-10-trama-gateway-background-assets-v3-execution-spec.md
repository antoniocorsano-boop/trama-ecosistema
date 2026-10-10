# TRAMA Gateway — Background Asset v3 Execution Specification

**Status:** PROPOSED / REQUIRES HUMAN REVIEW BEFORE IMPLEMENTATION  
**Date:** 2026-10-10  
**Scope:** PR #266 — `design/trama-identity-gateway-v1`  
**Visual authority:** Human-approved TRAMA v2 mockups  
**Runtime authority:** NOT GRANTED  
**Merge/deploy:** NOT AUTHORIZED

## 1. Purpose

Define the repository-level production contract for the TRAMA Gateway background family before any further UI tuning.

The next implementation phase MUST create and validate **four independent, high-quality, UI-free background assets** for:

- **L** — desktop
- **M** — tablet
- **S** — mobile
- **LIM** — 320 px limited-reflow condition

The four backgrounds are reviewed on their own first. Navigation, hero copy, CTA, `Segno vivo`, overlays and video are out of scope until the background family itself passes Human Visual Review.

This specification supersedes only the previous media-family rule that treated LIM as an S reuse. All other architectural, accessibility and governance constraints in the existing Gateway implementation specification remain in force.

## 2. Problem being corrected

The current implementation is technically certified but not visually acceptable as a final background system.

Observed defects:

- S and M production images are too small for their rendered surfaces and can appear soft or pixelated;
- the current runtime exposes only S/M/L background roles;
- LIM is not an independent art-directed asset;
- repeated derivation/cropping has reduced material detail;
- visual inspection is being contaminated by UI layers, making it harder to judge the background itself;
- the media stack still includes optional video, which is not needed while the static background contract is being established;
- background quality has been assessed too late, after composition/UI integration.

The corrective principle is:

> **approve the background family first; integrate UI second.**

## 3. Alternatives considered

### A. One master background + CSS cropping

Rejected.

Advantages: simplest implementation and smallest authoring effort.  
Failure mode: important objects, light sources and the reading zone move unpredictably under `object-cover`; portrait surfaces become mechanical crops of a landscape composition.

### B. S/M/L backgrounds with LIM reusing S

This is the previous contract and is now superseded for this rework.

Advantages: technically conventional and fewer assets.  
Failure mode: does not satisfy the requested independent LIM treatment and makes it harder to guarantee a high-quality 320×900 composition.

### C. Four art-directed backgrounds: L/M/S/LIM

**Selected.**

Each asset shares the same TRAMA scene language but is composed independently for its target aspect ratio. This is the only approach authorized by this specification.

## 4. Canonical runtime files

The production family MUST use background-specific names to avoid confusing a complete mockup with a UI-free media asset:

- `apps/gateway/public/media/trama-gateway-bg-l.webp`
- `apps/gateway/public/media/trama-gateway-bg-m.webp`
- `apps/gateway/public/media/trama-gateway-bg-s.webp`
- `apps/gateway/public/media/trama-gateway-bg-lim.webp`

After migration, the current `trama-gateway-poster-{s,m,l}.webp` files MUST NOT remain in the canonical selection path.

They may be removed after the new family is verified. They must not be used as silent fallbacks.

## 5. Required source dimensions and aspect ratios

These are **minimum production dimensions**, not optional recommendations.

| Role | Canonical review viewport | Required production size | Target ratio |
| --- | --- | --- | --- |
| L | 1440×900 | **2560×1440** minimum | 16:9 |
| M | 768×1024 | **1536×2048** minimum | 3:4 |
| S | 390×844 | **1170×2532** minimum | 390:844 |
| LIM | 320×900 | **960×2700** minimum | 320:900 |

Rules:

- no production asset may be upscaled to satisfy these dimensions;
- the source composition must be created or rendered natively at the required aspect ratio;
- resizing a lower-resolution file upward is forbidden;
- no asset may be produced by screenshotting the existing webpage or approved mockup;
- no asset may contain visible compression blocks, ringing, banding or smeared fine detail at 100% inspection.

## 6. Image-quality contract

### 6.1 Visual character

All four backgrounds must read as one coherent TRAMA environment:

- cinematic educational design atelier / study;
- deep ink/navy shadows;
- warm directional light;
- tactile books, paper, notes, drawings and writing tools;
- convincing photographic depth;
- controlled bokeh rather than whole-frame blur;
- contemporary cultured atmosphere, not antique décor for its own sake;
- no generic SaaS, dashboard, computer-screen or stock-office look.

### 6.2 Detail standard

At the intended review viewport:

- paper fibres/edges remain perceptible where in focus;
- pen, book edges and table detail are crisp where compositionally important;
- book spines do not collapse into muddy blocks;
- the scene may use depth-of-field selectively, but it must not look globally blurred;
- local light gradients remain smooth;
- no artificial sharpening halos.

### 6.3 Reading-zone composition

The central/upper-middle area must provide quiet negative space by **composition and focus**, not by a dark patch added later.

Forbidden:

- central black rectangle;
- broad corrective black gradient;
- vignette that visibly erases the scene under the future hero copy;
- obvious blur mask under the future text;
- exposure discontinuity that reads as an overlay.

Allowed:

- naturally darker shelves/wall/depth in the reading area;
- lower local detail frequency;
- deliberate object placement outside the reading zone;
- natural depth-of-field transitions.

## 7. Strict UI-free rule

The four background files MUST contain **only the photographic/material scene**.

They MUST NOT contain:

- `TRAMA` wordmark;
- hero title;
- body copy;
- CTA;
- navigation;
- hamburger icon;
- glass panels;
- buttons;
- labels such as S/M/L/LIM;
- breakpoint annotations;
- copper `Segno vivo` curves;
- borders or card frames;
- any other UI simulation.

Copper curves remain a separate UI identity layer and are intentionally excluded from background production.

## 8. No duplicate-media rule

During background review, exactly **one static background image** may be visually active.

The review state MUST NOT render:

- video over the background;
- a second copy of the same background;
- an additional CSS background image behind the `<picture>` image;
- pseudo-element scene duplicates;
- multiple `<img>` elements for breakpoint variants at the same time.

The `<picture>` element may contain multiple `<source>` declarations, but the browser must resolve to a single image resource for the active viewport.

## 9. Responsive selection contract

The media-selection contract becomes:

- **L:** `min-width: 1024px`
- **M:** `600px–1023px`
- **S:** `360px–599px`
- **LIM:** `max-width: 359px`

The functional S accessibility contract still covers 320–599 px; the separate LIM background is an art-direction specialization for the smallest surface, not a new product layout.

Conceptual configuration target:

```ts
background: {
  lim: '/media/trama-gateway-bg-lim.webp',
  s: '/media/trama-gateway-bg-s.webp',
  m: '/media/trama-gateway-bg-m.webp',
  l: '/media/trama-gateway-bg-l.webp',
}
```

Conceptual `<picture>` order:

```html
<picture>
  <source media="(min-width: 1024px)" srcset="...bg-l.webp" />
  <source media="(min-width: 600px)" srcset="...bg-m.webp" />
  <source media="(max-width: 359px)" srcset="...bg-lim.webp" />
  <img src="...bg-s.webp" alt="" />
</picture>
```

No JavaScript breakpoint-selection library is authorized.

## 10. Object fitting and composition

`object-fit: cover` remains acceptable only because each source is already art-directed for its target ratio.

For each role, the preferred composition should fit with either:

- `object-position: 50% 50%`, or
- one documented, stable role-specific `object-position`.

A large corrective `object-position` shift is evidence that the asset itself is poorly composed and should be re-authored instead of patched in CSS.

## 11. Encoding contract

Canonical runtime format: **WebP**.

Requirements:

- valid RIFF/WEBP binary;
- high-quality photographic encoding;
- no aggressive compression merely to hit a small byte target;
- metadata not required by runtime should be stripped;
- alpha channel should not be used unless genuinely required;
- encoded result must pass 100% visual inspection at native pixel size.

Initial encoding target:

- lossy WebP quality approximately **88–92** for photographic sources;
- quality may be raised when fine paper/textural detail visibly degrades;
- byte size is a secondary constraint after visual fidelity.

CI should report file sizes, but this specification does not impose a hard maximum byte budget before real assets are measured.

## 12. Provenance v3

`apps/gateway/public/media/trama-gateway-media-provenance.json` must move to **version 3** and contain four roles: `lim`, `s`, `m`, `l`.

Each entry must record at minimum:

- canonical path;
- role;
- pixel dimensions;
- source/generation method;
- art-direction note for that role;
- encoding format and quality setting where known;
- date;
- approval state;
- `identifiablePersons: false`;
- `studentData: false`;
- confirmation that UI and `Segno vivo` are not embedded.

Until Human Visual Review passes, approval MUST remain:

`IMPLEMENTATION_CANDIDATE_PENDING_HUMAN_REVIEW`

## 13. Validator v3

`scripts/validate-trama-gateway-media.mjs` must be upgraded from three roles to four:

```js
const roles = ['lim', 's', 'm', 'l'];
```

The validator MUST fail when:

- any role is missing;
- any file is not a valid WebP;
- provenance lacks a role;
- provenance path does not match the configured canonical file;
- a legacy poster is selected by production configuration;
- dimensions fall below the required minimum;
- the role aspect ratio is outside the allowed tolerance;
- identifiable persons or student data are not explicitly false.

Minimum dimensions enforced by CI:

- L ≥ 2560×1440
- M ≥ 1536×2048
- S ≥ 1170×2532
- LIM ≥ 960×2700

Recommended aspect-ratio tolerance: ±2% from the role target.

## 14. Test-first implementation contract

Implementation must follow RED → GREEN.

### RED 1 — configuration

Tests fail until `gatewayConfig` contains four canonical background roles and no canonical runtime reference to the old poster family.

### RED 2 — media component

Tests fail until `TramaMediaBackdrop` selects L/M/S/LIM according to the contract and exposes one static image for each active viewport.

### RED 3 — validator

Tests fail until all four high-resolution assets and provenance v3 are present.

### RED 4 — no duplication

Browser test proves that background-only review state has exactly one rendered media visual and no active video.

### GREEN

Only after the REDs are verified should production files/config/component/validator be changed.

## 15. Background-only evidence gate

Before reintegrating or judging the full hero, CI must materialize four **background-only** screenshots:

- `background-L.png` — 1440×900
- `background-M.png` — 768×1024
- `background-S.png` — 390×844
- `background-LIM.png` — 320×900

For this evidence only:

- video is disabled;
- `Segno vivo` is hidden;
- navbar is hidden;
- hero copy is hidden;
- CTA is hidden;
- no tonal UI overlays are applied.

This must be achieved by test/evidence harness behavior, not by introducing a public production route solely for review.

## 16. Human background review

The background family receives one of:

- **PASS**
- **REWORK**
- **REJECT**

Criteria:

1. sharp enough at target viewport;
2. no pixelation or obvious compression damage;
3. no duplicate scene/media;
4. coherent family across L/M/S/LIM;
5. each ratio is independently composed, not mechanically cropped;
6. central reading zone exists naturally;
7. scene retains photographic depth and materiality;
8. no embedded UI or copper curves;
9. no generic or synthetic-looking filler details that undermine the scene;
10. recognisably aligned with the approved TRAMA mockups.

**Full gateway UI review is forbidden until this gate passes.**

## 17. Integration after background PASS

Only after the four backgrounds receive Human PASS may the next phase:

1. re-enable the real navbar;
2. re-enable hero copy and CTA;
3. re-enable `Segno vivo` as a separate UI layer;
4. tune contrast with composition-first rules;
5. decide separately whether optional video remains justified;
6. regenerate full S/M/L/LIM gateway evidence;
7. perform final Human Visual Review of the complete interface.

No background re-generation should occur during UI integration unless a concrete integration blocker is demonstrated.

## 18. Files expected to change during implementation

Canonical expected scope:

- `apps/gateway/public/media/trama-gateway-bg-l.webp`
- `apps/gateway/public/media/trama-gateway-bg-m.webp`
- `apps/gateway/public/media/trama-gateway-bg-s.webp`
- `apps/gateway/public/media/trama-gateway-bg-lim.webp`
- `apps/gateway/public/media/trama-gateway-media-provenance.json`
- `apps/gateway/src/config/gateway.ts`
- `apps/gateway/src/config/gateway.test.ts`
- `apps/gateway/src/components/trama/TramaMediaBackdrop.tsx`
- `apps/gateway/src/components/trama/TramaMediaBackdrop.test.tsx`
- `apps/gateway/e2e/gateway.spec.ts` and/or dedicated background evidence spec
- `scripts/validate-trama-gateway-media.mjs`
- `scripts/test-trama-gateway-media-validator.mjs`
- `scripts/materialize-trama-gateway-ui-evidence.mjs`

Old `trama-gateway-poster-{s,m,l}.webp` files should be removed from the canonical path only after the new family is verified.

No unrelated ecosystem component is in scope.

## 19. Governance boundaries

This asset rework does not authorize:

- merge to `main`;
- deploy;
- new authentication;
- persistence;
- student data;
- analytics/tracking;
- runtime coupling to Arena, Atlas, Studio Atlas or Docente OS;
- authority changes;
- DOS-A1 activation.

## 20. Completion condition for this phase

The background phase is complete only when one exact head contains:

- four valid high-resolution WebP backgrounds;
- provenance v3;
- validator v3 PASS;
- unit/type/build PASS;
- deterministic background-only S/M/L/LIM evidence;
- no duplicate active media;
- Human Visual Review **PASS on the four backgrounds themselves**.

Only then may complete Gateway UI integration resume.
