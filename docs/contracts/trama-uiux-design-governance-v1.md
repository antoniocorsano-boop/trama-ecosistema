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

A shared component MUST behave consistently across products; product profiles MAY alter composition and emphasis, not semantic meaning or accessibility behavior.

## 3. Normative requirements

### UIUX-01 — Design tokens
All production-capable surfaces MUST consume named semantic tokens for at least color, typography, spacing, radius, elevation, borders, motion and responsive layout. Raw visual constants MAY exist only inside the token implementation layer.

Tokens SHOULD be representable in a tool-independent format aligned with the Design Tokens Community Group stable format. Product-specific tokens MUST alias ecosystem semantic tokens unless a documented exception is approved.

### UIUX-02 — Component primitives and supply chain
Common interactive patterns MUST NOT be reimplemented ad hoc when a mature, accessible primitive already exists and is compatible with the product architecture.

Adoption evaluation MUST include: accessibility behavior, keyboard/focus model, maintenance activity, license, bundle/runtime impact, framework compatibility, customization without inaccessible overrides, exit/migration cost, known vulnerability posture and material transitive dependencies.

Every adopted third-party UI dependency MUST have a repository-specific lifecycle record covering: approved version or version range; update strategy; security/deprecation monitoring; license compatibility; owner; migration/exit path; and replacement trigger when maintenance, security or compatibility falls below the accepted threshold.

The contract does not mandate one library globally. Radix Primitives / Base UI are reference-class primitive approaches; shadcn/ui is a reference-class open-code composition approach. Adoption remains repository-specific and governed.

### UIUX-03 — Component states
Every interactive component MUST define all applicable states: default, hover where meaningful, focus-visible, active/pressed, selected, disabled, pending/loading, success, warning and error. Destructive or consequential actions MUST expose their consequence before execution when the functional contract requires confirmation.

### UIUX-04 — Perceptible outcomes
`TRAMA-PW-01` remains mandatory. Every meaningful user action MUST yield a perceivable outcome. Success, error and pending feedback MUST be understandable without relying only on color, animation or transient position.

### UIUX-05 — Responsive-by-design
Responsive verification MUST cover, at minimum, four named conditions: **S / smartphone**, **M / tablet or medium viewport**, **L / desktop**, and **LIM / presentation or large-display context when the product journey is intended for LIM use**. Exact dimensions and breakpoint/container-query values SHALL be defined by the governed design-token/product-profile artifacts, not ad hoc inside individual views.

Each applicable condition MUST preserve task completion, hierarchy, readable content and primary actions without horizontal page overflow. Mobile layouts MAY reorder or progressively disclose secondary information, but MUST NOT remove required authority, provenance, confirmation, error recovery or accessibility information.

A PR evidence manifest MUST state which conditions are applicable and provide evidence for each. Omitting an otherwise applicable condition requires a governed exception.

### UIUX-06 — Accessibility baseline
For **new or materially changed release-capable surfaces under Stage B**, applicable WCAG 2.2 Level A and AA success criteria MUST be satisfied before graduation, except where a governed, time-bounded exception is recorded. Components MUST support keyboard operation, visible focus, semantic names/roles/states, zoom/reflow, target sizing where applicable, contrast, reduced-motion preferences and assistive-technology semantics.

**Prototype and Stage A legacy surfaces** MAY collect gaps without claiming conformance. They MUST NOT be described as WCAG-conformant without evidence. Once a legacy surface is materially changed, the changed surface falls under Stage B for the touched scope.

Automated checks are necessary but NOT sufficient: release-capable surfaces require human checks for keyboard/focus, zoom/reflow and representative responsive behavior; assistive-technology checks are required when the interaction pattern or risk warrants them.

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
4. responsive breakpoint/container-query policy and S/M/L/LIM verification matrix;
5. icon policy;
6. component inventory and ownership;
7. interaction/state vocabulary;
8. feedback/status vocabulary;
9. accessibility patterns;
10. product profile overrides and documented exceptions;
11. UI dependency lifecycle registry.

A product MAY extend the foundation. It MUST NOT fork shared semantics without an explicit governance decision.

## 5. Machine-readable UI evidence contract

A PR that materially changes a user-facing surface MUST declare its UI impact in a machine-readable evidence manifest. The canonical schema SHALL be introduced as a separate governed artifact before Stage B becomes blocking.

At minimum the manifest MUST carry:

- `contractId` and `contractVersion`;
- product and product-profile identifier;
- `uiImpact`: `NONE | NEW | CHANGED | LEGACY_TOUCHED`;
- affected surfaces and user journeys;
- reused/new token and component references;
- applicable responsive conditions `S/M/L/LIM` and evidence references;
- automated accessibility result and human-check evidence;
- keyboard/focus and zoom/reflow evidence where applicable;
- `TRAMA-PW-01` evidence for mutative actions;
- no-horizontal-overflow evidence;
- material before/after visual evidence when relevant;
- authority/privacy impact declaration;
- exception IDs, if any.

Text in the PR MAY summarize the evidence but MUST NOT be the sole source consumed by the future gate. A documentation-only change with no rendered UI impact MAY declare `UI_IMPACT=NONE`.

## 6. Gate model and legacy containment

The target governance chain is:

`Functional contract` → `TRAMA UI/UX Design` → `TRAMA Perceptible Write` → `Accessibility` → `Responsive/Visual` → `Human interaction review`

Initial adoption is staged:

- **Stage A — OBSERVE:** inventory and evidence collection for untouched legacy surfaces; no new blocking gate.
- **Stage B — ENFORCE-NEW:** blocking for all new views/components and for the materially changed scope of legacy surfaces.
- **Stage C — ENFORCE-BASELINE:** blocking ecosystem-wide after legacy baselines and exceptions are registered.

New work started after approval of this contract MUST target Stage B requirements. `Stage A`, `legacy`, or `prototype` labels MUST NOT be used to bypass Stage B for a surface that a PR materially changes or proposes to graduate.

### 6.1 Governed exceptions
An exception MUST be explicit, scoped and reviewable. It MUST record at least:

- stable exception ID;
- affected contract requirement(s) and surface(s);
- rationale and risk;
- accountable owner;
- approving authority according to the repository/ecosystem governance in force;
- compensating controls, when applicable;
- creation date;
- expiry date or mandatory review date;
- closure condition.

An exception MUST NOT silently expand to other products or surfaces. Expired exceptions MUST block Stage B/C graduation until renewed through governance or closed.

## 7. Reference baseline (non-binding implementations)

Reference technologies are evidence sources, not automatic dependencies:

- WCAG 2.2 for accessibility conformance;
- WAI-ARIA patterns and native HTML semantics for interaction behavior;
- Design Tokens Community Group format for interoperable token representation;
- Radix Primitives or Base UI as examples of accessible low-level primitives;
- shadcn/ui as an example of open-code component composition;
- Storybook as an example of isolated component documentation/testing.

A dependency decision requires a separate repository-specific technical assessment and lifecycle record. Star count alone is NEVER an adoption criterion.

## 8. Acceptance criteria for TRAMA-UIUX-01 itself

- **UIUX-E1:** existing `TRAMA-PW-01` is referenced, not duplicated or weakened.
- **UIUX-E2:** Arena, Atlas, Docente OS and Control Center have explicit profiles.
- **UIUX-E3:** semantic design-token requirement is defined.
- **UIUX-E4:** component reuse and dependency lifecycle criteria are defined without hard-locking one library.
- **UIUX-E5:** S/M/L/LIM responsive verification is explicit and values are delegated to governed tokens/profiles.
- **UIUX-E6:** WCAG 2.2 A/AA requirements, legacy/prototype distinction and human checks are explicit.
- **UIUX-E7:** perceptible feedback remains mandatory.
- **UIUX-E8:** teacher agency and privacy boundaries cannot be weakened by UI patterns.
- **UIUX-E9:** machine-readable UI-changing PR evidence contract is defined.
- **UIUX-E10:** staged enforcement contains legacy debt and prevents bypass on touched surfaces.
- **UIUX-E11:** prototypes cannot graduate by visual appearance alone.
- **UIUX-E12:** governed, time-bounded exception requirements are defined.
- **UIUX-E13:** this contract introduces no runtime, no student account/tracking and no DOS-A1 activation.

## 9. Next governed artifacts

Approval of this contract authorizes design work only, not runtime integration. Follow-up artifacts SHALL be separate and ordered to minimize rework:

1. `TRAMA-UI-EVIDENCE-01` — machine-readable evidence schema and exception registry shape;
2. `TRAMA-DESIGN-TOKENS-01` — token taxonomy, responsive policy and machine-readable seed;
3. `TRAMA-COMPONENT-INVENTORY-01` — current components, duplicates, gaps, owners and third-party dependency lifecycle;
4. product profiles for Arena / Atlas / Docente OS / Control Center;
5. CI design-policy classifier/gate consuming the evidence manifest;
6. reference component catalogue/prototype;
7. migration plan based on touched surfaces, not a big-bang rewrite.

P3 and later functional increments SHALL consume this contract once approved; they SHALL NOT be used to retrofit unrelated legacy UI opportunistically.
