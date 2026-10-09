# TRAMA-IDENTITY-01 — Ecosystem identity and public gateway v1

**Status:** PROPOSED DESIGN / HUMAN REVIEW REQUIRED  
**Date:** 2026-10-09  
**Applies to:** TRAMA ecosystem · public gateway · Arena · Atlas · Studio Atlas · Docente OS · TRAMA Control Center  
**Baseline:** `main@9a6d546733ae2503a0f17f342850964bb8c8da75`  
**Runtime/publication authority:** NOT GRANTED  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

TRAMA-IDENTITY-01 establishes a recognisable parent identity for the TRAMA ecosystem and defines the first surface that expresses it: a cinematic public gateway.

This work does **not** replace the existing product-specific visual identities. It operationalises the existing TRAMA design-governance principle that ecosystem coherence must preserve product differentiation.

The intended relationship is:

`TRAMA parent identity → shared semantic grammar → product-specific PVIP → local product composition`

The gateway is therefore not a generic marketing landing page and not a restyled Control Center. It is the public threshold of the ecosystem: a quiet, high-quality surface that communicates what TRAMA is before exposing the complexity of its products.

## 2. Shared understanding and success criteria

The product need is to stop treating visual identity as an incidental result of individual interfaces. TRAMA must become recognisable as a coherent ecosystem while Arena, Atlas, Studio Atlas, Docente OS and Control Center remain appropriate to their distinct roles.

TRAMA-IDENTITY-01 is successful when:

1. a user can recognise a TRAMA surface before reading technical product labels;
2. the identity communicates education, knowledge, design and connection without generic "AI/tech" imagery;
3. the public gateway has one clear primary action and does not expose architecture as a product diagram;
4. the identity can be propagated through semantic tokens and governed profile aliases rather than copied CSS;
5. Arena, Atlas, Studio Atlas, Docente OS and Control Center retain distinct visual character;
6. motion, typography and media degrade safely under reduced-motion, loading, small-screen and accessibility conditions;
7. no student account, tracking, new persistence authority or DOS-A1 runtime authority is introduced;
8. the implementation can be visually certified with deterministic responsive evidence and Human Visual Review.

## 3. Existing contracts preserved

This design extends rather than replaces:

- `TRAMA-UIUX-01` — ecosystem UI/UX governance;
- `TRAMA-DESIGN-TOKENS-01` — semantic tokens, product aliases and PVIPs;
- `TRAMA-UI-DEVELOPMENT-01` — user need → information model → composition → evidence → human validation;
- `TRAMA-COMPONENT-PATTERN-01` — shared component/pattern semantics;
- `TRAMA-UI-EVIDENCE-01` — responsive, accessibility and visual evidence;
- `TRAMA-PW-01` — perceptible outcomes.

The gateway must satisfy Stage B requirements as a new user-facing surface.

## 4. Identity thesis — "Segno vivo"

The selected identity direction is **editorial-cinematic**, with the working name **Segno vivo**.

TRAMA is not represented by a literal woven fabric, a network diagram, a glowing neural mesh or a generic digital grid. Its visual metaphor is **connection made visible through traces**: lines, margins, pages, marks, light paths, layered material and transitions between fragments that acquire meaning when seen together.

The conceptual keywords are:

- connection;
- knowledge;
- intention;
- trace;
- materiality;
- quiet authority;
- continuity;
- discovery.

The identity must feel cultural and designed, not corporate-technological. It should be cinematic without becoming theatrical, editorial without becoming nostalgic, and modern without adopting generic dashboard aesthetics.

## 5. Core visual principles

### 5.1 Quiet authority

TRAMA uses large typographic hierarchy, controlled spacing and few simultaneous actions. Visual confidence comes from proportion and restraint rather than decoration.

### 5.2 Connection before containment

The ecosystem should prefer relationships, rails, transitions, lines and spatial continuity over card-first composition. Containers are used only when they carry a semantic boundary.

### 5.3 Material before synthetic

Imagery should favour books, paper, diagrams, tools, surfaces, light, architectural or laboratory detail, hand-made traces and educational artefacts. Synthetic "future technology" motifs are excluded from the parent identity.

### 5.4 Cinematic depth from real media

The gateway derives depth from image/video, typography and glass surfaces. Decorative blobs, radial gradients and gratuitous background effects are not part of the identity.

### 5.5 Accessibility is part of the identity

Reduced motion, readable fallback typography, visible focus, contrast and reflow are not fallback styling; they are canonical modes of the system.

## 6. Wordmark and typography

### 6.1 Wordmark

The canonical parent wordmark is the text **TRAMA** in uppercase, with generous but controlled tracking. It must remain typographic rather than becoming an illustrative logo in v1.

The wordmark may appear in two forms:

- **TRAMA** — parent identity;
- **TRAMA / Product** — ecosystem signature for transitional or shared surfaces where product ownership must remain explicit.

The wordmark must not replace the actual accessible product/page heading where semantic HTML requires a distinct heading.

### 6.2 Display typography

Preferred display family: **Instrument Serif**.

Semantic use:

- gateway wordmark;
- major editorial statements;
- selected product-entry moments;
- high-level section titles where the product PVIP allows it.

The display family must not be imposed on dense operational UI, data tables or repetitive control labels.

### 6.3 Interface/body typography

Preferred body/interface family: **Inter**, weights 400 and 500 for the initial gateway profile.

Fallback policy must preserve readability before/without web-font acquisition. The implementation must use `font-display` behavior that avoids invisible text and should minimise layout shift.

### 6.4 Typography relationship

Instrument Serif expresses meaning and identity; Inter expresses operation and clarity.

The ecosystem must not turn this into a simplistic rule that every heading uses Instrument Serif. Product PVIPs decide where display typography is appropriate.

## 7. Parent palette

The parent palette is intentionally narrow. Product-facing code must consume semantic aliases, not literal colour names.

Initial reference primitives for the identity seed:

- **Ink / deep navy:** `hsl(201 100% 13%)`;
- **Paper / foreground:** `hsl(0 0% 100%)` in dark presentation contexts;
- **Muted text:** `hsl(240 4% 66%)`;
- **Dark secondary surface:** `hsl(0 0% 10%)`;
- **Border/reference line:** `hsl(0 0% 18%)`;
- **Warm material accent:** a restrained copper/earth family, used only as an identity accent and never as the sole carrier of status or interaction state.

The warm accent is intentionally subordinate. The recognisable parent identity is primarily the relationship between deep ink, light typography, material imagery and editorial composition.

Status colours remain governed by ecosystem feedback semantics and must not be repurposed as brand colours.

## 8. Imaging and video art direction

### 8.1 Canonical subject language

Parent-identity imagery may include:

- open books and printed pages;
- technical and educational drawings;
- maps, annotations and marginalia;
- paper, wood, metal, glass and laboratory/workshop material;
- architectural or classroom detail without identifiable student data;
- light moving across pages or surfaces;
- hands only when necessary and non-identifying;
- transitions between physical traces and abstract relational lines.

### 8.2 Excluded visual language

Do not use as canonical parent imagery:

- glowing neural networks;
- floating holographic dashboards;
- generic blue digital grids;
- humanoid robots;
- anonymous stock-photo classrooms;
- decorative fibre/fabric imagery used merely because the name is TRAMA;
- excessive particle systems;
- fake data visualisations without semantic meaning.

### 8.3 Gateway hero video

The target gateway video is a slow, seamless loop, approximately 12–20 seconds, silent, with restrained camera movement and natural/material light.

Preferred narrative:

1. a close material detail emerges from darkness;
2. light reveals pages, marks or a technical drawing;
3. the camera exposes a relationship between separate elements;
4. the loop closes without a visible cut.

The media itself must remain secondary to legibility. The title and primary action must remain readable throughout the loop.

The external CloudFront video used in the initial brief may be used only as a **temporary prototype asset** after licence/ownership and reliability are verified. It is not automatically the canonical TRAMA identity asset.

### 8.4 Poster and failure mode

A canonical poster image is required. If video fails, is disabled or is inappropriate for user preferences, the poster must still deliver a complete hero composition.

## 9. Gateway information architecture

The gateway is a threshold, not a dashboard.

### 9.1 Header

Desktop structure:

`TRAMA | Ecosistema · Curricolo · Guida | Accedi`

The exact secondary destinations may evolve, but the header must remain sparse. Product names should not dominate the first-level navigation unless a later user-journey study proves direct product selection is the primary need.

On small screens, secondary navigation collapses behind an accessible disclosure. The primary access action remains directly available when space permits.

### 9.2 Hero

Canonical content direction:

**Wordmark:** `TRAMA`

**Primary statement:**  
`Dove curricolo, conoscenza e progettazione diventano esperienza.`

**Supporting text:**  
`Un ecosistema per progettare, organizzare e trasformare il lavoro didattico, mantenendo unite intenzione educativa, materiali, evidenze e documentazione.`

**Primary action:**  
`Entra in TRAMA`

The statement is identity copy, not a technical product description. It must remain concise enough to coexist with moving imagery.

### 9.3 Meaning of "Entra in TRAMA"

The CTA does **not** implicitly authorise a new authentication system.

In v1 it must resolve to an explicitly designed gateway action, such as:

- opening the ecosystem destination chooser;
- navigating to the appropriate existing public entry route;
- delegating authentication only to a product that already owns that capability.

No new identity/account authority is created by visual design.

## 10. Glass expression

Glass is a supporting surface treatment, not the identity itself.

The gateway may use a shared `liquid-glass` expression for:

- the header shell;
- the primary CTA;
- selected overlay controls.

Reference treatment:

```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}
```

A pseudo-element may render the thin luminous perimeter used in the approved visual direction. The implementation must provide a non-backdrop-filter fallback and must not sacrifice focus visibility.

Glass styling must not propagate indiscriminately to product operational interfaces.

## 11. Motion language

The parent identity uses **slow reveal**, not continuous ornamental animation.

Initial motion roles:

- content reveal: approximately 800 ms, ease-out;
- stagger: approximately 200 ms;
- hover scale on primary CTA: maximum approximately 1.03;
- video movement: source media only, not CSS parallax in v1.

Reference entrance motion:

```css
@keyframes fade-rise {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Reduced-motion behavior is mandatory:

- entrance animations become immediate;
- no essential meaning depends on movement;
- autoplaying background media must have a safe reduced-motion strategy, with poster/static presentation preferred when required by the implementation policy.

## 12. Responsive composition

The gateway must be intentionally composed for the governed S/M/L/LIM conditions rather than scaled mechanically.

### S — smartphone

- wordmark remains legible but reduced;
- hero copy uses a shorter line measure;
- navigation collapses;
- CTA remains reachable without horizontal overflow;
- video cropping prioritises material detail rather than a desktop focal point;
- no text may depend on a specific video area remaining empty.

### M — tablet

- preserve editorial hierarchy;
- allow more breathing room without reproducing the full desktop header density;
- maintain comfortable tap targets.

### L — desktop

- cinematic composition may use the full spatial relationship between media, typography and glass header;
- hero should remain vertically balanced rather than simply top-padded.

### LIM — large display/presentation

- typography must not become excessively wide;
- readable measure remains constrained;
- media can expand, but text hierarchy remains stable.

## 13. Parent identity propagation model

TRAMA identity propagates through **invariants + aliases + selective signatures**, not through full visual duplication.

### 13.1 Shared parent invariants

Eligible shared identity elements:

- TRAMA wordmark/signature;
- semantic parent palette references;
- typography roles and approved font families;
- focus and interaction-state semantics;
- motion roles;
- shared spacing rhythm references;
- ecosystem transition/relationship patterns;
- iconographic principles;
- shared media/illustration art direction;
- accessibility behavior.

### 13.2 Product expression

#### Arena

TRAMA connection: editorial typography, ink/material references and ecosystem signature.

Local character: authoritative, structured, provenance-first, denser and document-oriented. Cinematic media is not a default operational background.

#### Atlas

TRAMA connection: material imagery, expressive typography and connective spatial composition.

Local character: brighter, more exploratory, public-readable and discovery-oriented. Atlas may use the broadest visual storytelling range.

#### Studio Atlas

Studio Atlas becomes a formally registered identity profile rather than inheriting Atlas implicitly.

TRAMA connection: same parent semantic grammar and image art direction.

Local character: creative authoring workspace, visual production, scene/review focus and stronger use of media surfaces than Atlas runtime.

A follow-up governance update must register Studio Atlas in the relevant PVIP/token scope; it must not silently bypass existing contracts.

#### Docente OS

TRAMA connection: typography signature at entry/high-level moments, parent navigation/signature where appropriate, semantic colours and motion grammar.

Local character: operational calm, stable actions, compact teacher-first flows, low noise. Background video and decorative glass are inappropriate for ordinary work views.

#### TRAMA Control Center

TRAMA connection: parent wordmark, ink palette, typography hierarchy and connective ecosystem motifs.

Local character: analytical, evidence-dense, state/traceability focused. Identity must never reduce status legibility.

## 14. Token and implementation architecture

The canonical identity must not initially require all products to consume a shared runtime package.

Recommended v1 architecture:

1. **authoritative machine-readable identity/token artifacts live in `trama-ecosistema`;**
2. shared ecosystem semantics and parent identity primitives are versioned there;
3. each product owns a local adapter/profile mapping to its implementation technology;
4. validators check semantic compatibility and profile ownership;
5. cross-repository runtime coupling is deferred until reuse evidence justifies a package.

This preserves ecosystem authority without making one repository a fragile runtime dependency for all products.

A future shared package is permitted only if the implementation plan demonstrates that versioned token distribution solves a real maintenance problem without weakening product autonomy.

## 15. Distinctive shared components

The first implementation may introduce a small number of TRAMA-owned identity components:

- `TramaWordmark` — canonical accessible parent signature;
- `TramaGatewayShell` — gateway-only full-screen composition;
- `TramaGlassAction` — identity CTA treatment built on an accessible button primitive;
- `EcosystemSignature` — compact TRAMA/product relationship marker;
- `TramaMediaBackdrop` — video/poster wrapper with loading and reduced-motion behavior.

These components own expression but must reuse native or mature behavioural primitives where appropriate.

They are not a licence to create a generic ecosystem component library before repeated use is proven.

## 16. Technology direction

The gateway target stack is:

- React;
- Vite;
- TypeScript;
- Tailwind CSS;
- shadcn/ui/open-code composition where an accessible primitive is useful;
- native `<video>` for background media;
- semantic CSS variables for identity tokens.

The stack is subordinate to existing repository dependency policy. Any new dependency requires the normal supply-chain/lifecycle assessment.

## 17. Accessibility and resilience

The gateway must prove at least:

- WCAG 2.2 applicable A/AA criteria for the new surface;
- keyboard access to every interactive element;
- visible focus over both bright and dark video frames;
- readable text during font loading/failure;
- 200% text zoom and responsive reflow;
- no horizontal overflow in S/M/L/LIM evidence;
- reduced-motion behavior;
- media/poster fallback;
- sufficient text/background contrast over representative video frames;
- accessible navigation disclosure on mobile;
- no information available only through colour, transparency or motion.

If moving media makes contrast unstable, the correct fix is art direction/cropping/media selection or a localised text-support treatment. A generic full-screen dark overlay is not the default solution because the selected visual direction relies on the source media providing visual depth.

## 18. Evidence and Human Visual Review

A polished mockup is not sufficient for promotion.

The gateway implementation must produce:

- exact-head screenshots for S/M/L/LIM;
- representative screenshots from multiple video frames or deterministic poster state;
- reduced-motion evidence;
- keyboard/focus evidence;
- automated accessibility result plus required human checks;
- no-overflow evidence;
- token/component traceability;
- media provenance/licence record;
- Human Visual Review against this specification.

Human review must assess not only whether the surface is attractive, but whether it communicates the intended TRAMA identity: quiet authority, knowledge, connection, materiality and coherence.

## 19. Rollout sequence

### Phase A — identity foundation

- freeze this design after Human Review;
- create machine-readable parent identity/token seed;
- register Studio Atlas as an explicit visual-identity profile;
- define the initial TRAMA parent PVIP/signature rules;
- add validator coverage for ownership/alias boundaries.

### Phase B — gateway implementation

- build the gateway as a distinct public surface;
- implement poster/video media boundary;
- implement typography, glass treatment, motion and responsive composition;
- keep destination/auth behavior explicitly bounded;
- certify S/M/L/LIM + accessibility + Human Visual Review.

### Phase C — controlled propagation

Propagate only the approved parent invariants, product by product:

1. ecosystem signatures and typography/token adapters;
2. product-specific PVIP adjustments;
3. one representative surface per product;
4. visual/accessibility review before wider adoption.

No big-bang restyling is authorised.

## 20. Out of scope

TRAMA-IDENTITY-01 does not authorise:

- redesigning all existing product screens;
- replacing existing authentication;
- student accounts or tracking;
- a unified runtime component package;
- automatic application of glass/video backgrounds across products;
- changes to Arena/Atlas/Docente OS authority boundaries;
- production use of the temporary CloudFront video without provenance review;
- automatic visual approval;
- merge to `main` without normal review and evidence.

## 21. Implementation decision boundary

The next step after Human Review of this written design is a dedicated implementation plan.

That plan must first verify the current repository/deployment structure and choose the smallest architecture that preserves separation between the public gateway and the analytical Control Center. The preferred direction is a distinct gateway surface rather than visually converting the Control Center into the ecosystem entrance.

No implementation code is authorised by this design document alone.
