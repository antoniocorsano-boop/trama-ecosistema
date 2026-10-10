# TRAMA Gateway v1 — Implementation Specification

**Status:** READY FOR IMPLEMENTATION PLAN / HUMAN VISUAL REWORK AUTHORIZED  
**Date:** 2026-10-10  
**Design source:** `docs/superpowers/specs/2026-10-09-trama-identity-gateway-v1-design.md`  
**Approved visual reference:** `docs/superpowers/specs/assets/trama-identity-gateway-v1-approved-baseline.jpg`  
**Current implementation:** `apps/gateway` on PR #266  
**Runtime/publication authority:** NOT GRANTED  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Goal

Rework the existing standalone TRAMA gateway so that the shipped static state expresses the approved **Segno vivo** identity with photographic/material depth, cinematic light, a protected reading zone and restrained connective traces, while preserving the already-qualified accessibility, responsive and authority boundaries.

This specification does not authorise a rebuild of the gateway architecture. The current `apps/gateway` implementation remains the technical foundation; the rework is primarily a media-art-direction, responsive-composition and visual-fidelity correction.

## 2. Why rework is required

The previous exact-head implementation reached green automated certification, but Human Visual Review rejected the final visual result because it read as a clean dark landing page rather than a distinctive TRAMA identity.

The specific failed condition was not functionality or accessibility. It was **identity fidelity**:

- the flat/vector blue poster dominated the experience;
- the static state lacked real material depth;
- the gateway depended too heavily on the idea of optional moving media to feel cinematic;
- the visual result did not match the approved photographic/editorial direction strongly enough.

Therefore automated PASS is necessary but cannot independently close TRAMA-IDENTITY-01.

## 3. Approved visual reference contract

The approved reference image is a **design contract**.

It fixes the following visual qualities:

- dark ink/navy atmosphere;
- warm directional light;
- real or convincingly photographic books, paper, annotations, drawings and working surfaces;
- visible depth of field and material texture;
- a calm central reading zone;
- restrained copper/earth connective marks;
- editorial serif display typography over the material scene;
- sparse glass navigation and CTA treatment;
- strong identity even with no motion.

### 3.1 Reference image is not a production poster

The stored approved reference contains composited UI and therefore **must not be shipped directly as the gateway background**.

Production poster assets must be derived from the same approved art direction but contain **no embedded UI copy, wordmark, navigation labels or button text**.

The React layer remains the sole owner of accessible text and interactive controls.

### 3.2 Fidelity is semantic, not pixel cloning

The implementation does not have to reproduce the reference pixel-for-pixel. It must reproduce the approved hierarchy, atmosphere, materiality, reading-zone discipline and visual balance.

Human Visual Review judges these semantic qualities.

## 4. Existing implementation to preserve

The rework must preserve unless a failing test proves a change is required:

- standalone `apps/gateway` application boundary;
- React/Vite/TypeScript/Tailwind stack;
- `TramaGatewayShell` composition boundary;
- `TramaMediaBackdrop` media/fallback responsibility;
- `TramaGlassAction` accessible CTA behavior;
- existing hero copy and CTA wording;
- configured external destination boundary;
- reduced-motion behavior;
- keyboard/focus behavior;
- forced-colors behavior;
- S/M/L responsive framework;
- LIM reflow certification;
- exact-head evidence materialization;
- dedicated TRAMA Gateway CI workflow;
- no new authentication, persistence, tracking or product authority.

## 5. Media architecture

### 5.1 Poster-first rule

The poster is the canonical visual state.

The page must be complete, attractive and recognisably TRAMA when:

- JavaScript has loaded but video is disabled;
- `prefers-reduced-motion: reduce` is active;
- the video source fails;
- the video source is slow;
- external network media is blocked;
- the user sees the page before video playback begins.

### 5.2 Production poster family

Create an art-directed poster family under:

- `apps/gateway/public/media/trama-gateway-poster-s.webp`
- `apps/gateway/public/media/trama-gateway-poster-m.webp`
- `apps/gateway/public/media/trama-gateway-poster-l.webp`

The assets must share the same scene/art direction but may use different crop, object placement or negative space to protect the reading zone.

Recommended source targets:

- **S:** portrait-oriented source/crop suitable for 320–599 px viewport widths;
- **M:** tablet-oriented source/crop suitable for 600–1023 px;
- **L:** wide high-resolution source, at least 1920×1080 effective detail for large desktop rendering.

`LIM` is not a separate visual breakpoint. Under `TRAMA-RESPONSIVE@1.0.0` it is a `LIMITED_REFLOW` condition with max inline size 320 px and zoom 4×. LIM should therefore consume the S-compatible static composition and prove reflow rather than introduce a fourth decorative asset.

### 5.3 Previous vector poster

`apps/gateway/public/media/trama-gateway-poster.svg` must not be selected by any production/certification path after the photographic poster family is introduced.

It may be removed, retained only as a clearly named development fallback, or archived outside the runtime media path. It cannot appear in Human Visual Review evidence.

### 5.4 Optional video

Video remains optional enhancement.

Rules:

- poster is rendered first and remains behind the video;
- video becomes visually active only after a usable playback state;
- video failure restores/exposes the poster without layout shift;
- reduced-motion mode does not mount/autoplay the cinematic video;
- no interaction, information or navigation depends on video;
- the temporary external CloudFront source remains non-canonical until provenance/reliability is approved.

## 6. Art direction requirements

### 6.1 Quiet reading zone

Hero copy must sit over a deliberately low-frequency, darker area of the scene.

The production media must avoid placing behind the main copy:

- white pages with high local contrast;
- hard highlights;
- dense handwriting;
- sharp object edges;
- high-frequency shelf/detail patterns;
- copper traces crossing letterforms.

### 6.2 Material subjects

Preferred visual elements:

- open or stacked books;
- notebook or printed sheets;
- technical drawing / annotated page;
- writing or making tools;
- wood, paper, metal or glass surfaces;
- shelves/studio detail in bokeh;
- warm directional light.

### 6.3 Segno vivo traces

Copper/earth lines are secondary visual connectors.

They must be:

- sparse;
- fine;
- partially occluded by depth where useful;
- outside the core text zone wherever possible;
- never the primary subject.

### 6.4 Contrast support

The preferred solution to contrast is art direction and crop.

Allowed secondary support:

- subtle local text shadow;
- localised, low-opacity tonal support close to the copy;
- careful `object-position`/crop tuning.

Not allowed as the default solution:

- full-screen black overlay;
- broad dark gradient that erases photographic depth;
- heavy text glow;
- glass panel enclosing the entire hero copy.

## 7. Responsive contract

The implementation must use the canonical responsive policy from `policies/design-system/trama-design-system.v1.json`.

### S — 320–599 px

Requirements:

- dedicated S art direction/crop;
- material scene remains identifiable but simplified;
- copy zone remains dark and quiet;
- title line measure remains short;
- CTA remains fully visible/reachable;
- secondary navigation collapses accessibly;
- no horizontal overflow.

### M — 600–1023 px

Requirements:

- dedicated M crop when the L composition would move bright material under the copy;
- stable editorial hierarchy;
- comfortable touch targets;
- no mechanical desktop scaling.

### L — ≥1024 px

Requirements:

- full cinematic scene;
- background detail can expand laterally;
- important physical objects remain principally outside the hero reading zone;
- title width remains constrained;
- navigation/glass treatment remains visually subordinate.

### LIM — LIMITED_REFLOW

Canonical condition:

- max inline size: 320 px;
- zoom: 4×;
- reflow required;
- evidence dimensions required.

Requirements:

- no separate decorative layout;
- no horizontal scrolling for primary content;
- S-compatible poster/crop remains stable;
- text, focus and CTA remain operable at the constrained inline size.

## 8. Component/API changes

The implementation plan should prefer small changes to existing components.

### 8.1 Gateway media configuration

`src/config/gateway.ts` should expose explicit poster roles rather than one generic poster URL.

Target conceptual interface:

```ts
poster: {
  s: string;
  m: string;
  l: string;
}
```

Video configuration remains separate and optional.

### 8.2 `TramaMediaBackdrop`

Responsibilities:

- choose/render the art-directed static poster for S/M/L;
- preserve poster under optional video;
- suppress video for reduced motion;
- fail safely on video error;
- expose no user data or analytics;
- preserve deterministic screenshot state when external media is blocked.

The implementation may use `<picture>`, media queries, CSS custom properties or another native browser mechanism. No new media-selection dependency is justified.

### 8.3 Hero layer

`App.tsx`/hero composition should preserve current semantic structure and copy.

Only visual positioning/support required by the approved media should change. Do not move copy into the background asset.

## 9. Typography and UI treatment

Preserve:

- Instrument Serif for display identity;
- Inter for UI/body;
- existing hero copy;
- TRAMA micro-label/wordmark;
- sparse header;
- `Entra in TRAMA` CTA.

The visual rework must not compensate for weak media by increasing UI decoration.

Glass remains limited to header/CTA/selected controls.

## 10. Accessibility and resilience requirements

Must remain true after the rework:

- applicable WCAG 2.2 A/AA automated checks pass;
- keyboard order is logical;
- visible focus survives bright/dark media states;
- fallback fonts preserve readable layout;
- 200% text enlargement remains usable;
- LIM 4× reflow passes;
- reduced motion exposes a complete static hero;
- forced colors does not depend on photographic contrast;
- video/network failure does not remove the hero image or CTA;
- no semantic content is baked only into the poster.

## 11. Performance and delivery

The poster is an LCP-sensitive resource.

Implementation should:

- use WebP or AVIF where browser support and pipeline permit;
- avoid shipping the full design-reference mockup as production media;
- use responsive source selection so S does not download the L asset unnecessarily;
- avoid a new JavaScript image-selection library;
- preload only the actually critical static source where practical;
- preserve a stable background color behind the media.

Exact hard byte budgets should be based on measured visual quality rather than arbitrary compression, but CI/evidence should report produced asset dimensions and sizes.

## 12. Media provenance

Add a repository-owned provenance record for production media, for example:

`apps/gateway/public/media/trama-gateway-media-provenance.json`

It must record for each canonical asset:

- file path;
- intended responsive role;
- source/generation method;
- approval state;
- date;
- whether it contains identifiable persons/data;
- usage/provenance notes sufficient for repository review.

Do not claim a licence or ownership state that has not been documented.

## 13. Test strategy

### 13.1 Unit/component tests

Add or update tests proving:

- poster configuration contains S/M/L assets;
- reduced motion renders static poster and no autoplay video;
- video failure leaves poster visible;
- no production path resolves to the rejected vector poster;
- hero text remains DOM text, not image-only content.

### 13.2 Browser tests

For deterministic visual certification, block external video and capture the static poster state.

Required evidence:

- S screenshot;
- M screenshot;
- L screenshot;
- LIM reflow screenshot;
- reduced-motion screenshot;
- keyboard focus screenshot/state;
- media failure state.

Automated assertions must include:

- no horizontal overflow;
- CTA visible/operable;
- title visible;
- correct responsive poster source/role selected;
- vector fallback absent from certification path.

### 13.3 Human Visual Review

Automation must not infer visual PASS.

Human Review must compare the exact-head evidence to the approved visual reference and decide **PASS / REWORK / REJECT**.

Review criteria:

1. recognisable TRAMA identity;
2. real material/cinematic depth;
3. quiet reading zone;
4. restrained glass/copper treatment;
5. static state quality without video;
6. responsive art direction, not simple cropping;
7. no return to generic SaaS/technical landing-page aesthetics.

## 14. Visual reference versus production baseline

Two different artifacts must remain distinct:

1. **Approved design reference** — the stored Human Review image; it defines intended visual semantics.
2. **Certified production baseline** — screenshots captured from the implemented exact head after Human Visual Review PASS.

After the first successful production PASS, future automated visual regression should compare code screenshots to that certified production baseline, not to the generated reference image.

## 15. Files expected to change

Likely runtime files:

- `apps/gateway/src/config/gateway.ts`
- `apps/gateway/src/components/trama/TramaMediaBackdrop.tsx`
- `apps/gateway/src/components/trama/TramaMediaBackdrop.test.tsx`
- `apps/gateway/src/app/App.tsx` only if positioning/support requires it
- `apps/gateway/src/styles/globals.css`
- `apps/gateway/public/media/*`

Likely certification files:

- `apps/gateway/tests/gateway.spec.ts`
- `apps/gateway/tests/media-fallback.spec.ts`
- visual-quality tests relevant to poster selection/fidelity
- UI evidence metadata/materialization only if asset evidence needs explicit recording

No unrelated product repository or product view should change in this rework.

## 16. Implementation sequence

The implementation plan should execute in this order:

1. introduce production-poster contract tests in RED;
2. create/approve UI-free S/M/L photographic poster assets derived from the approved art direction;
3. wire responsive poster configuration and backdrop selection;
4. remove rejected vector poster from production/certification paths;
5. tune hero/media composition without changing information architecture;
6. rerun unit/type/build checks;
7. rerun S/M/L/LIM/accessibility/reduced-motion certification;
8. inspect exact-head evidence visually;
9. obtain Human Visual Review PASS/REWORK/REJECT;
10. only after PASS consider PR promotion/merge through normal governance.

## 17. Non-goals

This rework does not authorise:

- redesigning Arena, Atlas, Studio Atlas, Docente OS or Control Center;
- new authentication;
- account creation;
- tracking/analytics;
- new persistence;
- new runtime authority;
- product-selection dashboard expansion;
- new component framework;
- broad animation/parallax;
- production dependency on the temporary external video;
- automatic merge or deploy.

## 18. Completion condition

TRAMA Gateway v1 is not complete merely when CI is green.

Completion requires all of the following on one exact head:

- Governance PASS;
- gateway type/unit/build PASS;
- browser/accessibility/reflow PASS;
- exact-head UI evidence PASS;
- production static poster family active;
- rejected vector poster absent from canonical evidence;
- Human Visual Review **PASS against the approved visual reference**;
- PR remains subject to normal merge governance.
