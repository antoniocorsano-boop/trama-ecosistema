# TRAMA UI/UX & Design Governance Contract v1

**Contract ID:** TRAMA-UIUX-01  
**Status:** PROPOSED / GOVERNANCE-ONLY  
**Baseline:** `0039cc66f9ae6582f1990396ac7a9e5edcfa2ea8`  
**Scope:** Arena · Atlas · Docente OS · TRAMA Control Center · prototypes that can graduate into product surfaces  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

TRAMA-UIUX-01 makes interface quality a governed ecosystem property rather than a late visual review. A feature is not complete merely because its functional contract passes: its user-facing surface must also satisfy a stable, evidence-backed interaction and visual-quality contract.

The contract extends, and never weakens, `TRAMA-PW-01` (Perceptible Write). Existing product authority, privacy, publication and runtime contracts remain superior for their respective domains.

## 2. Core principle: coherence, not uniformity

Arena, Atlas and Docente OS share foundations, interaction grammar and quality gates, but retain product-specific profiles:

- **Arena:** authoritative curriculum/governance work; precision, provenance and review states dominate.
- **Atlas:** public/student-facing exploration; clarity, discoverability, accessibility, responsive navigation and low cognitive load dominate.
- **Docente OS:** teacher-first operational work; focus, speed, explicit control, local-first/personal-data boundaries and perceptible feedback dominate.
- **TRAMA Control Center:** ecosystem assurance; evidence density, traceability and decision support dominate.

A shared component must behave consistently across products; product profiles MAY alter composition and emphasis, not semantic meaning or accessibility behavior.

## 3. Normative requirements

### UIUX-01 — Design tokens
All production-capable surfaces MUST consume named semantic tokens for at least color, typography, spacing, radius, elevation, borders, motion and responsive layout. Raw visual constants MAY exist only inside the token implementation layer.

Tokens SHOULD be representable in a tool-independent format aligned with the Design Tokens Community Group stable format. Product-specific tokens MUST alias ecosystem semantic tokens unless a documented exception is approved.

### UIUX-02 — Component primitives
Common interactive patterns MUST NOT be reimplemented ad hoc when a mature, accessible primitive already exists and is compatible with the product architecture.

Adoption evaluation MUST include: accessibility behavior, keyboard/focus model, maintenance activity, license, bundle/runtime impact, framework compatibility, customization without inaccessible overrides, and exit/migration cost.

The contract does not mandate one library globally. Radix Primitives / Base UI are reference-class primitive approaches; shadcn/ui is a reference-class open-code composition approach. Adoption remains repository-specific and governed.

### UIUX-03 — Component states
Every interactive component MUST define all applicable states: default, hover where meaningful, focus-visible, active/pressed, selected, disabled, pending/loading, success, warning and error. Destructive or consequential actions MUST expose their consequence before execution when the functional contract requires confirmation.

### UIUX-04 — Perceptible outcomes
`TRAMA-PW-01` remains mandatory. Every meaningful user action MUST yield a perceivable outcome. Success, error and pending feedback MUST be understandable without relying only on color, animation or transient position.

### UIUX-05 — Responsive-by-design
Smartphone, tablet/medium viewport and desktop/LIM MUST be treated as intentional layout conditions, not as scaled copies of desktop. User journeys MUST preserve task completion, hierarchy and primary actions without horizontal page overflow at supported viewport sizes.

Mobile layouts MAY reorder or progressively disclose secondary information, but MUST NOT remove required authority, provenance, confirmation, error recovery or accessibility information.

### UIUX-06 — Accessibility baseline
User-facing surfaces MUST target WCAG 2.2 AA conformance for applicable success criteria. Components MUST support keyboard operation, visible focus, semantic names/roles/states, zoom/reflow, adequate target sizing where applicable, contrast, reduced-motion preferences and assistive-technology semantics.

Automated checks are necessary but NOT sufficient: release-capable surfaces require defined human checks for keyboard/focus and responsive/reflow behavior.

### UIUX-07 — Information hierarchy and cognitive load
Each view MUST expose one clear primary task or decision context. Repeated controls, duplicate affordances with the same purpose, unbounded vertical accumulation and nonessential technical detail in the primary reading path SHOULD be treated as design defects.

Technical/provenance detail required by governance MAY use progressive disclosure, provided it remains discoverable and accessible.

### UIUX-08 — Navigation and interaction grammar
Equivalent actions MUST use stable terminology, icon semantics and interaction behavior across the ecosystem. Search, profile/local preferences, back/close, save/confirm, cancel, publish/propose and status feedback MUST NOT silently change meaning between products.

### UIUX-09 — Teacher-first and user agency
No visual pattern may convert a recommendation into an apparent obligation or hide a meaningful alternative. In Docente OS, accept/modify/replace/exclude semantics MUST remain visible where the governing functional contract provides them. Automated suggestions MUST be visually distinguishable from authoritative or teacher-confirmed state.

### UIUX-10 — Privacy-aware interface
Interfaces MUST NOT imply server persistence, account identity, student tracking or synchronization where the governing product contract does not provide them. Local-only information MUST be labelled or handled consistently with the applicable privacy contract; UI convenience MUST NOT expand data authority.

### UIUX-11 — Visual regression and component evidence
Reusable production components SHOULD have an isolated, inspectable catalogue or equivalent evidence surface. Storybook is a reference-class approach, not a mandatory dependency. Critical components and representative product views SHOULD have automated visual-regression coverage once a stable baseline exists.

### UIUX-12 — No prototype graduation by appearance alone
A prototype MAY intentionally use reduced implementation complexity, but it MUST NOT be promoted as a production UI solely because it looks complete. Graduation requires component mapping, token mapping, accessibility evidence, responsive evidence and product-profile conformance.

## 4. Ecosystem foundation

The shared foundation SHALL define:

1. semantic token taxonomy;
2. typography scale and readable line-length rules;
3. spacing/layout scale;
4. responsive breakpoints or container-query policy;
5. icon policy;
6. component inventory and ownership;
7. interaction/state vocabulary;
8. feedback/status vocabulary;
9. accessibility patterns;
10. product profile overrides and documented exceptions.

A product MAY extend the foundation. It MUST NOT fork shared semantics without an explicit governance decision.

## 5. Evidence required on UI-changing pull requests

A PR that materially changes a user-facing surface MUST declare its UI impact and provide evidence proportional to risk:

- affected product/profile and user journey;
- token/component reuse or justified new component;
- smartphone and desktop evidence; medium/LIM evidence when relevant;
- keyboard/focus evidence for interactive changes;
- perceptible success/error/pending evidence for mutative actions;
- no-horizontal-overflow check;
- accessibility automated result plus required human checks;
- before/after visual evidence for material redesigns;
- confirmation that functional authority/privacy contracts remain unchanged, or links to the contracts that authorize the change.

A documentation-only change with no rendered UI impact MAY declare `UI_IMPACT=NONE`.

## 6. Gate model

The target governance chain is:

`Functional contract` → `TRAMA UI/UX Design` → `TRAMA Perceptible Write` → `Accessibility` → `Responsive/Visual` → `Human interaction review`

Initial adoption MAY be staged to avoid blocking existing products before baselines exist:

- **Stage A — OBSERVE:** inventory, evidence collection, no new blocking gate;
- **Stage B — ENFORCE-NEW:** blocking for new/changed components and views;
- **Stage C — ENFORCE-BASELINE:** blocking ecosystem-wide after legacy exceptions are registered.

New work started after approval of this contract MUST target Stage B requirements even while legacy surfaces remain in Stage A.

## 7. Reference baseline (non-binding implementations)

Reference technologies are evidence sources, not automatic dependencies:

- WCAG 2.2 for accessibility conformance;
- WAI-ARIA patterns and native HTML semantics for interaction behavior;
- Design Tokens Community Group format for interoperable token representation;
- Radix Primitives or Base UI as examples of accessible low-level primitives;
- shadcn/ui as an example of open-code component composition;
- Storybook as an example of isolated component documentation/testing.

A dependency decision requires a separate repository-specific technical assessment. Star count alone is NEVER an adoption criterion.

## 8. Acceptance criteria for TRAMA-UIUX-01 itself

- **UIUX-E1:** existing `TRAMA-PW-01` is referenced, not duplicated or weakened.
- **UIUX-E2:** Arena, Atlas, Docente OS and Control Center have explicit profiles.
- **UIUX-E3:** semantic design-token requirement is defined.
- **UIUX-E4:** component reuse/adoption criteria are defined without hard-locking one library.
- **UIUX-E5:** responsive smartphone/medium/desktop-LIM requirements are explicit.
- **UIUX-E6:** WCAG 2.2 AA target and human accessibility checks are explicit.
- **UIUX-E7:** perceptible feedback remains mandatory.
- **UIUX-E8:** teacher agency and privacy boundaries cannot be weakened by UI patterns.
- **UIUX-E9:** UI-changing PR evidence contract is defined.
- **UIUX-E10:** staged enforcement prevents an uncontrolled legacy migration.
- **UIUX-E11:** prototypes cannot graduate by visual appearance alone.
- **UIUX-E12:** this contract introduces no runtime, no student account/tracking and no DOS-A1 activation.

## 9. Next governed artifacts

Approval of this contract authorizes design work only, not runtime integration. Follow-up artifacts SHALL be separate:

1. `TRAMA-DESIGN-TOKENS-01` — token taxonomy and machine-readable seed;
2. `TRAMA-COMPONENT-INVENTORY-01` — current components, duplicates, gaps and owners;
3. product profiles for Arena / Atlas / Docente OS / Control Center;
4. CI design-policy classifier and evidence manifest;
5. reference component catalogue/prototype;
6. migration plan based on touched surfaces, not a big-bang rewrite.

P3 and later functional increments SHALL consume this contract once approved; they SHALL NOT be used to retrofit unrelated legacy UI opportunistically.
