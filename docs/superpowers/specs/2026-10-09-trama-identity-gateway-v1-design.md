# TRAMA-IDENTITY-01 — Ecosystem identity and public gateway v1

**Status:** APPROVED DESIGN / VISUAL BASELINE APPROVED / CURRENT IMPLEMENTATION REWORK REQUIRED  
**Design approval:** 2026-10-10  
**Applies to:** TRAMA ecosystem · public gateway · Arena · Atlas · Studio Atlas · Docente OS · TRAMA Control Center  
**Baseline:** `main@9a6d546733ae2503a0f17f342850964bb8c8da75`  
**Approved visual reference:** `docs/superpowers/specs/assets/trama-identity-gateway-v1-approved-baseline.jpg`  
**Runtime/publication authority:** NOT GRANTED  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

TRAMA-IDENTITY-01 establishes the recognisable parent identity of the TRAMA ecosystem and defines its first expression: the public TRAMA gateway.

The gateway is a threshold, not a dashboard and not a restyled Control Center. It must communicate what TRAMA is before exposing the complexity of the individual products.

The relationship remains:

`TRAMA parent identity → shared semantic grammar → product-specific PVIP → local product composition`

TRAMA coherence must preserve differentiation between Arena, Atlas, Studio Atlas, Docente OS and Control Center.

## 2. Approved Human Review decision

The design direction **Segno vivo** is approved.

Human Visual Review produced one binding correction to the first coded implementation:

- the flat/vector blue poster is **REJECTED as the final parent identity background**;
- a technically clean or accessible hero is not sufficient if it reads as a generic coloured landing page;
- the gateway must derive identity from **real material imagery, cinematic light, spatial depth and editorial composition**;
- the static poster must already be an excellent TRAMA surface without requiring the optional video layer.

The approved image stored at the canonical reference path is the visual baseline against which implementation fidelity is judged.

The image is a **design contract**, not merely inspiration.

## 3. Success criteria

TRAMA-IDENTITY-01 is successful when:

1. a user can recognise a TRAMA surface before reading technical product labels;
2. the identity communicates education, knowledge, design and connection without generic AI/tech imagery;
3. the gateway has one clear primary action and does not expose the ecosystem as a technical architecture diagram;
4. the hero has memorable visual depth even when motion is disabled;
5. the identity can propagate through semantic tokens and governed profile aliases rather than copied CSS;
6. product-specific identities remain distinct;
7. motion, typography and media degrade safely under reduced motion, loading, small-screen and accessibility conditions;
8. no student account, tracking, new persistence authority or DOS-A1 runtime authority is introduced;
9. the final implementation passes deterministic responsive/accessibility evidence and Human Visual Review against the approved baseline.

## 4. Existing contracts preserved

This design extends rather than replaces:

- `TRAMA-UIUX-01` — ecosystem UI/UX governance;
- `TRAMA-DESIGN-TOKENS-01` — semantic tokens, product aliases and PVIPs;
- `TRAMA-UI-DEVELOPMENT-01` — user need → information model → composition → evidence → human validation;
- `TRAMA-COMPONENT-PATTERN-01` — shared component/pattern semantics;
- `TRAMA-UI-EVIDENCE-01` — responsive, accessibility and visual evidence;
- `TRAMA-PW-01` — perceptible outcomes.

The gateway is a Stage B user-facing surface.

## 5. Identity thesis — Segno vivo

TRAMA is represented by **connection made visible through traces**: pages, margins, annotations, lines, light paths, layered material and relationships between fragments that acquire meaning together.

Conceptual keywords:

- connection;
- knowledge;
- intention;
- trace;
- materiality;
- quiet authority;
- continuity;
- discovery.

TRAMA must feel cultural and designed, not corporate-technological; cinematic without theatrical excess; editorial without nostalgia; modern without generic dashboard aesthetics.

## 6. Canonical visual composition

The approved gateway composition has three layers.

### 6.1 Material media layer

A real or convincingly photographic scene provides depth. Typical elements include:

- books, notebooks and printed pages;
- diagrams, technical drawings and annotations;
- paper, wood, metal, glass and writing tools;
- shelves or a studio/work surface in soft focus;
- warm directional light and controlled bokeh.

The media must leave a deliberate **quiet reading zone** for the hero copy. Text must never have to fight a bright object or high-frequency detail.

### 6.2 Segno vivo layer

Very restrained copper/earth lines may connect parts of the scene.

They are secondary traces, not decoration and not the main visual subject. They must never cross important copy in a way that harms reading.

### 6.3 Interface layer

The interface contains:

- TRAMA wordmark;
- sparse navigation;
- one editorial hero statement;
- concise supporting copy;
- one primary CTA;
- restrained glass surfaces.

The interface remains visually quiet enough to let the material scene establish identity.

## 7. Canonical subject language

Approved parent imagery may include:

- open books and printed pages;
- notebooks, marginalia and sketches;
- technical and educational drawings;
- maps and annotations;
- tools of writing or making;
- workshop, laboratory, architecture or study details;
- natural/material light;
- hands only when necessary and non-identifying.

Excluded parent imagery:

- glowing neural networks;
- holographic dashboards;
- generic blue digital grids;
- humanoid robots;
- stock-photo classrooms;
- literal woven-fabric metaphors used only because the name is TRAMA;
- excessive particles;
- fake data visualisations without semantic meaning;
- a plain colour field presented as the finished hero identity.

## 8. Static poster is primary-quality media

The static poster is not an emergency placeholder. It is a first-class canonical state.

Requirements:

- it must deliver the full identity without video;
- it must use photographic/material depth consistent with the approved baseline;
- it must preserve the quiet reading zone;
- it must remain sharp on desktop and large displays;
- it must have art-directed variants/crops for S/M/L where necessary;
- it must not be replaced by a flat vector abstraction as the final design.

The previous vector poster may remain only as a development fallback if useful, but it is **not approved for production identity or Human Visual Review**.

## 9. Optional video layer

Video is an enhancement, not a dependency of identity.

If introduced, the target is a silent 12–20 second seamless loop with restrained movement and material light.

Preferred narrative:

1. a material detail emerges from darkness;
2. light reveals pages, marks or a technical drawing;
3. the camera reveals a relationship between separate elements;
4. the loop closes without a visible cut.

The external CloudFront video from the initial prototype is non-canonical until provenance, ownership and reliability are verified.

Failure, loading delay or reduced-motion preference must expose the canonical static poster without degrading the composition.

## 10. Wordmark and typography

### 10.1 Wordmark

Canonical parent wordmark: **TRAMA**, uppercase, generous controlled tracking.

Permitted ecosystem signature: **TRAMA / Product** where product ownership must remain explicit.

### 10.2 Display typography

Preferred display family: **Instrument Serif**.

Use for major identity statements and selected entry moments, not dense operational UI.

### 10.3 Interface/body typography

Preferred family: **Inter**, initial weights 400 and 500.

Fallbacks must preserve readable layout before/without web-font loading.

### 10.4 Relationship

Instrument Serif expresses identity and meaning. Inter expresses operation and clarity.

## 11. Parent palette

Reference seed:

- **Ink / deep navy:** `hsl(201 100% 13%)`;
- **Paper / foreground:** `hsl(0 0% 100%)` in dark presentation contexts;
- **Muted text:** `hsl(240 4% 66%)`;
- **Dark secondary surface:** `hsl(0 0% 10%)`;
- **Border/reference line:** `hsl(0 0% 18%)`;
- **Warm material accent:** restrained copper/earth.

The recognisable identity is the relationship among deep ink, warm material light, readable light typography and real imagery. Copper is subordinate and must never become the sole carrier of state or meaning.

## 12. Gateway information architecture

The gateway is a threshold, not a dashboard.

### 12.1 Header

Desktop direction:

`TRAMA | Ecosistema · Curricolo · Guida | Accedi`

The header remains sparse. On small screens secondary navigation collapses behind an accessible disclosure.

### 12.2 Hero copy

**Wordmark:** `TRAMA`

**Primary statement:**  
`Dove curricolo, conoscenza e progettazione diventano esperienza.`

**Supporting text:**  
`Un ecosistema per progettare, organizzare e trasformare il lavoro didattico, mantenendo unite intenzione educativa, materiali, evidenze e documentazione.`

**Primary action:**  
`Entra in TRAMA`

### 12.3 CTA authority boundary

`Entra in TRAMA` does not authorise a new authentication system.

It must navigate to an explicitly configured existing destination or delegate authentication only to a product that already owns that capability.

## 13. Glass expression

Glass is supporting treatment, not the identity itself.

Appropriate uses:

- header shell;
- primary CTA;
- selected overlay controls.

Requirements:

- subtle translucency;
- restrained blur;
- thin luminous edge where appropriate;
- visible focus;
- non-backdrop-filter fallback;
- no propagation of decorative glass into ordinary operational product views.

## 14. Motion language

TRAMA uses slow reveal rather than ornamental continuous animation.

Reference roles:

- reveal ≈ 800 ms ease-out;
- stagger ≈ 200 ms;
- CTA hover scale ≤ 1.03;
- no CSS parallax in v1.

Reduced motion:

- entrance becomes immediate;
- static canonical poster is used;
- no meaning depends on motion.

## 15. Responsive composition

The gateway must follow `TRAMA-RESPONSIVE@1.0.0` and be art-directed rather than mechanically scaled.

### S — 320–599 px

- short line measure;
- mobile crop keeps material atmosphere but removes clutter behind copy;
- navigation collapses;
- CTA remains reachable;
- no horizontal overflow.

### M — 600–1023 px

- preserve editorial hierarchy;
- maintain a clear reading zone;
- use a dedicated crop/position when the desktop focal point would interfere with copy.

### L — ≥1024 px

- express the full cinematic relation between material scene, typography and glass header;
- hero remains vertically balanced;
- key material objects should sit mainly outside the core reading zone.

### LIM — LIMITED_REFLOW

LIM is **not** a large-display breakpoint. It is the governed accessibility/reflow condition:

- `maxInlineSize: 320`;
- `zoom: 4`;
- `requiresReflow: true`;
- evidence dimensions required.

LIM should use the S-compatible static composition and prove that text, focus, navigation and CTA reflow without horizontal overflow or loss of operability.

## 16. Parent identity propagation model

TRAMA identity propagates through **invariants + aliases + selective signatures**, not visual duplication.

Shared eligible invariants:

- TRAMA wordmark/signature;
- semantic palette references;
- typography roles;
- focus and interaction semantics;
- motion roles;
- spacing rhythm;
- connective motifs;
- image/illustration art direction;
- accessibility behavior.

### Arena

Editorial authority, structured/provenance-first. No default cinematic background in operational views.

### Atlas

Exploratory and public-readable; may use the broadest visual storytelling range while inheriting parent materiality and connective composition.

### Studio Atlas

Creative authoring workspace with explicit PVIP, stronger media surfaces and scene/review focus. It does not silently inherit Atlas runtime identity.

### Docente OS

Operational calm, teacher-first flows and low noise. Parent identity appears selectively at entry/high-level moments; background video is inappropriate for routine working screens.

### TRAMA Control Center

Analytical and evidence-dense. Parent identity must never reduce status or traceability legibility.

## 17. Token and implementation architecture

Authoritative identity/token artifacts live in `trama-ecosistema`.

Each product owns a local adapter/profile to its implementation technology. Validators check semantic compatibility and authority. No shared cross-repository runtime package is required in v1.

A future shared package requires demonstrated maintenance value and must not weaken product autonomy.

## 18. Distinctive shared components

Permitted initial identity components:

- `TramaWordmark`;
- `TramaGatewayShell`;
- `TramaGlassAction`;
- `EcosystemSignature`;
- `TramaMediaBackdrop`.

They express identity but do not create a generic ecosystem component library before repeated reuse is proven.

## 19. Technology direction

Gateway target stack:

- React;
- Vite;
- TypeScript;
- Tailwind CSS;
- shadcn/ui/open-code composition where useful;
- native `<video>` only for optional media enhancement;
- semantic CSS variables for identity tokens.

New dependencies remain subject to repository supply-chain/lifecycle policy.

## 20. Accessibility and resilience

The gateway must prove:

- applicable WCAG 2.2 A/AA criteria;
- full keyboard access;
- visible focus over representative media states;
- readable font fallback;
- 200% text zoom and reflow;
- no horizontal overflow in S/M/L and LIM;
- reduced-motion behavior;
- poster/media fallback;
- stable text contrast over approved crops;
- accessible mobile navigation;
- no information carried only by colour, transparency or motion.

If contrast becomes unstable, fix art direction, crop, media selection or a localised copy support treatment. A generic full-screen dark overlay is not the default solution.

## 21. Evidence and Human Visual Review

Automated success is necessary but not sufficient.

The implementation must produce:

- exact-head screenshots for S/M/L/LIM;
- deterministic static-poster evidence;
- reduced-motion evidence;
- keyboard/focus evidence;
- automated accessibility results plus human checks;
- no-overflow evidence;
- token/component traceability;
- media provenance/licence record;
- visual comparison against the approved baseline image.

Human Visual Review must explicitly answer:

1. does the gateway look like the approved TRAMA identity rather than a generic dark landing page?;
2. is there real material/cinematic depth?;
3. is the reading zone clear on every viewport?;
4. are glass and copper traces restrained?;
5. does the static state remain excellent without video?;
6. is the parent identity strong without erasing future product differentiation?

Possible outcomes remain **PASS / REWORK / REJECT**.

## 22. Rollout sequence

### Phase A — identity foundation

- parent identity/token seed;
- Studio Atlas explicit PVIP;
- validator coverage.

### Phase B — gateway implementation

- standalone public gateway;
- approved photographic/material poster family;
- optional video boundary;
- typography, glass, motion and responsive composition;
- exact-head accessibility/visual certification;
- Human Visual Review.

### Phase C — controlled propagation

Propagate only approved invariants product by product:

1. signature and token adapters;
2. local PVIP adjustments;
3. one representative surface per product;
4. visual/accessibility review;
5. wider adoption only after evidence.

No big-bang restyling is authorised.

## 23. Out of scope

This design does not authorise:

- redesign of every product screen;
- replacement of existing authentication;
- student accounts or tracking;
- unified runtime component package;
- automatic glass/video backgrounds across products;
- authority-boundary changes;
- production use of temporary external media without provenance review;
- automatic visual approval;
- merge to `main` without normal review/evidence.

## 24. Implementation decision boundary

Design direction and visual baseline are approved.

Implementation is authorised only within the bounded gateway scope and must follow:

`docs/superpowers/specs/2026-10-10-trama-gateway-v1-implementation-spec.md`

The existing coded gateway at the pre-baseline Human Review state is explicitly **REWORK REQUIRED** because its flat/vector poster does not satisfy the approved visual baseline, even though automated CI and accessibility checks passed.

No merge or production publication is authorised until the revised exact-head implementation obtains a fresh Human Visual Review PASS.
