# TRAMA Gateway v1 — Human-approved visual baseline v2

**Status:** HUMAN APPROVED — BINDING VISUAL CONTRACT  
**Date:** 2026-10-10  
**Applies to:** PR #266 / `design/trama-identity-gateway-v1`  
**Process:** `docs/superpowers/specs/2026-10-10-trama-ui-specific-work-protocol.md`

## 1. Approved references

The Human Review approved the following two complementary mockups as the binding v2 visual baseline:

1. **Desktop primary reference**  
   `docs/superpowers/specs/assets/trama-gateway-approved-desktop-v2.jpg`

2. **Responsive composition reference**  
   `docs/superpowers/specs/assets/trama-gateway-approved-responsive-v2.jpg`

The repository images are review renditions. The full-resolution generated originals used for the Human Review were 1672×941 px and are identified by these SHA-256 digests:

- desktop original: `b139bfd9129907b9b0013f84df50df814d6b9e4033848df02ab1d9de795f8ae3`
- responsive original: `475a792d751dd297b29844ef263bbaad12b8c11f5172a5518168844d0254419f`

Repository review renditions:

- desktop v2: 1024×576, SHA-256 `87787590bb98e7a94c9f8ff2ec7649884ec520013c2579c4e934fe5bf958fd90`
- responsive v2: 1024×576, SHA-256 `8cea7bd7f916404af6db72773d2b64d8905e4743bfbda0b1bb7ab620087d0ae5`

### 1.1 Explicit Human re-confirmation from uploaded review exports

At 2026-10-10 10:44 Europe/Rome, Human Review explicitly reconfirmed both shown mockups as **APPROVED** by uploading the two review exports in the active review thread.

The uploaded review exports are 1536×864 px JPEG payloads and are identified by:

- responsive review export: SHA-256 `575d3f8dea8b3c5b86c3ede41c57f616e7877493106ff2bacde2d795a43a188c`
- desktop review export: SHA-256 `6a4593997db0952ad8de19d1af197f610b3554b02d94f9d018774a6a7fb2eaae`

This second confirmation removes any ambiguity about which visual direction is Human-approved. These uploaded exports confirm the same v2 contract represented by the repository review renditions; they do not authorise shipping UI-baked imagery as production media.

## 2. What this approval fixes

The v2 baseline supersedes the previously rejected production evidence as the visual target. It fixes the following qualities:

- cinematic, material study/atelier environment;
- warm directional light balanced by deep ink/navy shadows;
- books, papers, technical drawings, writing tools and tactile working surfaces;
- strong depth of field and lateral material richness;
- central reading area created primarily by composition, focus and scene tonality;
- clearly visible, elegant copper relational curves as a characteristic TRAMA identity element;
- restrained translucent navigation and CTA;
- editorial serif display hierarchy with `esperienza.` treated as a copper/italic accent;
- desktop, tablet, mobile and LIM compositions that preserve the same identity without mechanical scaling.

## 3. Binding corrections from the rejected exact-head evidence

### 3.1 No artificial central blackout

The rejected implementation created readability through a perceptible broad darkened area beneath the hero copy.

That treatment is **not allowed** in the next production baseline.

Readability must come principally from:

- scene composition;
- depth of field;
- naturally quieter background frequency;
- controlled light placement;
- responsive crop/art direction.

Only subtle local text shadow or extremely low-opacity tonal support may be used as secondary support. A visible central dark patch, broad blackout, heavy vignette or large corrective gradient is a Human Review blocker.

### 3.2 Copper curves are mandatory

The copper `Segno vivo` trajectories shown in the approved v2 mockups are a binding identity element, not optional decoration.

They must:

- be visibly present in S/M/L compositions;
- use thin, refined copper/earth strokes;
- cross the scene with continuity and depth;
- remain secondary to content and material imagery;
- avoid impairing copy legibility;
- preserve their relational/connecting character rather than becoming generic ornamental swashes.

Their effective absence is a Human Review blocker.

### 3.3 Production assets remain UI-free

The approved mockups contain composited navigation, copy and CTA because they define the desired complete composition.

They must **not** be shipped directly as production backgrounds.

Production S/M/L assets must remove all embedded UI and text while preserving:

- photographic scene;
- light architecture;
- material placement;
- negative/quiet reading space;
- copper relational curves.

Accessible text and controls remain owned by the React/HTML layer.

## 4. Responsive interpretation

The responsive mockup is a composition contract, not a screenshot to crop mechanically.

- **L:** full cinematic horizontal scene, rich lateral detail and clear copper trajectories.
- **M:** preserve atmosphere and curve language while reducing competing detail around the copy.
- **S:** portrait art direction with recognisable material scene and deliberate quiet space; navigation collapses without losing identity.
- **LIM:** follows the S-compatible visual language under governed 320 px reflow; it is not a fourth decorative concept.

## 5. Next professional gate

Per the canonical UI-specific work protocol, the next artifact is a **master visual UI-free** derived from the approved desktop v2 reference.

It must be reviewed before responsive S/M/L production assets are derived.

Only after the UI-free master passes Human Review may the new asset family be integrated into `apps/gateway`, recertified on an exact head, and presented again for final Human Visual Review.

No merge or identity propagation is authorised by this approval.
