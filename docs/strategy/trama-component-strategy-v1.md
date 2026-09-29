# TRAMA Component Strategy v1

**Strategy ID:** TRAMA-COMPONENT-STRATEGY-01  
**Status:** PROPOSED / GOVERNANCE-ONLY  
**Date:** 2026-09-29  
**Parent:** TRAMA-UI-DEVELOPMENT-01  
**Scope:** Arena · Atlas · Docente OS · TRAMA Control Center  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

Define how TRAMA chooses, composes and governs UI components without:
- rebuilding mature generic behavior;
- importing a third-party product identity;
- multiplying incompatible component stacks;
- creating a generic “AI dashboard” visual language;
- weakening accessibility, product identity or exitability.

This strategy applies the reusable UI development model and precedes any repository-specific dependency adoption.

## 2. Strategy in one sentence

**Use native controls where they are sufficient; borrow mature interaction behavior where it is not; own TRAMA semantics, composition and visual identity.**

## 3. Component layers

### L0 — Platform/native
HTML, CSS and browser capabilities:
- button, link, form controls;
- details/summary;
- dialog where platform support satisfies the target;
- popover where platform support and accessibility contract are sufficient;
- semantic lists/tables;
- CSS layout, container/media queries;
- SVG for bounded visual relations.

Native is preferred when behavior, accessibility and browser support satisfy the governed task.

### L1 — Behavioral primitives
Third-party components MAY provide:
- focus management;
- keyboard interaction;
- ARIA/state wiring;
- collision/positioning;
- complex menu/listbox/combobox behavior;
- dialog/popover mechanics;
- robust cross-browser interaction.

These primitives MUST be visually adapted to TRAMA/product tokens.

### L2 — TRAMA shared semantic components
Cross-product components with stable meaning, for example:
- `TRAMA.STATUS_MESSAGE`;
- future shared status/feedback/disclosure primitives;
- evidence/provenance components when semantics are cross-product.

Shared means semantic/behavioral reuse, not identical pixels.

### L3 — TRAMA distinctive components
Own ecosystem-specific meaning and identity:
- `EcosystemRail`;
- `SystemStateBand`;
- `EvidenceTrail`;
- `AuthorityPath`;
- `ChangeLine`;
- `AttentionEntry`;
- `ContextShell`.

These MAY internally use L0/L1 primitives but SHALL remain TRAMA-owned.

### L4 — Product-local components
Components whose intent belongs to one product:
- Arena review/provenance compositions;
- Atlas exploration/learning compositions;
- Docente OS teacher-workspace compositions;
- Control Center observability/assurance compositions.

Product-local components MAY graduate to shared only after evidence of equivalent semantics across products.

## 4. No global UI library rule

TRAMA SHALL NOT mandate one visual component library globally.

Reason:
- products use different runtime stacks;
- each product has a distinct PVIP;
- one visual kit would create identity lock-in;
- forced ecosystem-wide adoption would raise migration cost and reduce fit.

Instead, TRAMA governs **approved primitive families and sourcing rules per stack**.

## 5. Stack profiles

### 5.1 Standards-first / plain HTML surfaces

Current primary example:
- TRAMA Control Center.

Default order:
1. native HTML/CSS;
2. native browser APIs;
3. selected framework-agnostic Web Components;
4. TRAMA-owned semantic/distinctive components.

#### Web Awesome Core — TRIAL_CANDIDATE
Rationale:
- standard Web Components;
- works in plain HTML and frameworks;
- component-level imports;
- self-hostable;
- MIT Core;
- theming via tokens/custom properties/CSS parts.

Permitted trial scope:
- dialog;
- drawer;
- menu/menu button;
- popover/toggletip/tooltip where native solution is insufficient;
- selected complex form controls only after accessibility review.

Not authorized by this strategy:
- adopting Web Awesome's visual theme as TRAMA identity;
- replacing native controls without a user/task reason;
- CDN dependency in production;
- blanket import of the whole component library;
- using library card/layout components as default page composition.

Production trial SHOULD self-host a pinned dependency.

#### Spectrum Web Components — REFERENCE_OR_BOUNDED_CANDIDATE
Strength:
- framework agnostic;
- accessible web-component implementation;
- mature interaction behavior.

Constraint:
- implements Adobe Spectrum's visual system and theme model.

Default use:
- benchmark/reference;
- bounded technical spike only when Web Awesome/native options do not satisfy the need.

Not a default TRAMA visual foundation.

### 5.2 React / Next surfaces

Verified current example:
- Atlas: Next 15 / React 19;
- existing dependencies include `@radix-ui/react-slot`, Tailwind/CVA/Lucide and `@xyflow/react`.

#### Radix Primitives — EXISTING_FOOTPRINT / PRIMARY_INCREMENTAL_REFERENCE
Rationale:
- existing package-family footprint in Atlas;
- unstyled accessible primitives;
- focus/keyboard behavior;
- incremental adoption.

Rule:
Before introducing another primitive library for the same interaction family in Atlas, compare against Radix and document why a second family is justified.

#### Base UI — TRIAL_CANDIDATE_FOR_REACT
Rationale:
- unstyled/headless;
- accessible;
- complete modern React primitive family;
- styling-layer agnostic.

Rule:
Use as a bounded comparative spike for new React work where no established primitive family already owns that interaction.

Do not mix Base UI and Radix for equivalent interaction families in the same product without a documented supply-chain decision.

#### shadcn/ui — OPEN_CODE_REFERENCE_ONLY
Useful for:
- composition examples;
- open-code implementation study;
- developer ergonomics.

Not authorized as:
- ecosystem visual identity;
- default component source;
- justification for card-first/sidebar-first composition.

Any copied/open-code component becomes local owned code and must satisfy TRAMA component/evidence governance.

### 5.3 Specialist diagram/relationship components

#### React Flow / XYFlow — SPECIALIST_EXISTING_ATLAS
Verified in Atlas.

Use for:
- node-based interactive maps;
- complex pan/zoom relationship exploration;
- graph interaction where its behavior is materially needed.

Do not introduce React/React Flow into a standards-first surface solely to render a small static ecosystem relationship.

For the Control Center `EcosystemRail`, first trial:
- semantic HTML + CSS/SVG;
- no heavy graph runtime.

## 6. Design systems used as pattern references

The following MAY be benchmark sources without becoming runtime dependencies:

### Carbon
Reference for:
- shell/orientation;
- navigation hierarchy;
- enterprise information architecture;
- accessibility patterns.

### PatternFly
Reference for:
- data-dense product patterns;
- page/navigation structures;
- enterprise component lifecycle;
- HTML/CSS alternatives.

### Spectrum
Reference for:
- component rigor;
- web-component behavior;
- accessible states.

### GOV.UK
Reference for:
- service navigation;
- plain language;
- task orientation;
- content hierarchy.

A reference design system MUST NOT be copied wholesale into a product PVIP.

## 7. Default sourcing by component family

### Basic actions and content
- Buttons: native first.
- Links: native.
- Headings/lists: native.
- Tables: native semantics + TRAMA styling; specialist table library only if real interaction requires it.

### Disclosure
- Simple disclosure: native `details/summary`.
- Repeated structured disclosure: governed accordion pattern; external primitive only when behavior warrants it.

### Overlay
- Dialog: native or approved primitive depending focus/inert/compatibility requirements.
- Popover/toggletip: native where sufficient; external primitive when collision/focus behavior is material.
- Tooltip: only for supplemental information, never required task content.

### Navigation
- Product shell: TRAMA/product-owned composition.
- Menu mechanics: native/approved primitive.
- Tabs: approved primitive or native semantics implementation, only for true peer views.
- Breadcrumb/context trail: TRAMA-owned composition with native links.

### Forms
- Native controls first.
- Combobox/listbox/date complex widgets: approved mature primitive before custom implementation.
- Validation/error summary: TRAMA semantic components/patterns.

### Feedback
- Status message: consume `TRAMA.STATUS_MESSAGE` contract.
- Loading/progress/error-recovery: consume existing TRAMA component-pattern qualifications as they mature.
- Toast: not default for critical or persistent state.

### Layout and orientation
- Shell, rails, bands, relationship maps and page composition are TRAMA/product-owned.
- Do not import third-party Card/Page/Shell appearance as the default visual frame.

## 8. Card policy

`Card` remains a component family but is NOT the default layout primitive.

Before using a card ask:
1. Is this a bounded object?
2. Is this a navigable destination?
3. Does it have a distinct action/state boundary?

If all are no, prefer:
- section;
- list;
- row;
- band;
- rail;
- relationship;
- table;
- typography/spacing.

## 9. Visual adaptation contract

An adopted primitive must support:
- ecosystem semantic tokens;
- product PVIP;
- accessible focus state;
- state semantics independent of color;
- density appropriate to product;
- responsive behavior without brittle overrides.

Reject a primitive if:
- shadow/style encapsulation blocks necessary accessible adaptation;
- customization requires deep fragile selectors;
- product semantics must be distorted to fit the API;
- bundle/runtime cost is disproportionate;
- exit path is impractical.

## 10. Dependency isolation

Every third-party primitive SHOULD be wrapped behind a TRAMA/product adapter when:
- it is used in multiple surfaces;
- its API would otherwise leak broadly;
- it represents a governed semantic component.

Goal:
- library replacement does not require rewriting product semantics.

Do not wrap trivial one-off native elements without benefit.

## 11. Supply-chain rule

Every adopted runtime dependency requires a lifecycle record:
- package/project;
- pinned/approved version range;
- license;
- maintenance status;
- security/deprecation monitoring;
- product owner;
- components actually imported;
- accessibility evidence;
- bundle/runtime effect;
- update cadence;
- exit path;
- replacement trigger.

CDN-only runtime adoption is not the default for release-capable TRAMA products.

## 12. Component naming

Canonical ecosystem semantic components:
`TRAMA.<SEMANTIC_ID>`

Code/design implementation MAY map to product-specific names, but traceability must remain.

Distinctive design implementation convention:
`TRAMA/<Domain>/<Component>/<Variant>`

Examples:
- `TRAMA/Ecosystem/EcosystemRail/Default`
- `TRAMA/State/SystemStateBand/Attention`
- `TRAMA/Evidence/EvidenceTrail/Compact`

## 13. Lifecycle

For reusable components/patterns:

`PROPOSED → TRIAL → STABLE → DEPRECATED → RETIRED`

External dependency adoption does not bypass component lifecycle.

A library can be approved while an individual TRAMA wrapper/component remains TRIAL.

## 14. Initial Component Strategy matrix

### Foundation
- Native HTML/CSS — PREFERRED.
- Semantic tokens/PVIP — REQUIRED.
- TRAMA component-pattern contract — REQUIRED.

### Control Center
- Native platform — PREFERRED.
- Web Awesome Core — TRIAL_CANDIDATE for complex interaction primitives only.
- Spectrum WC — REFERENCE_OR_BOUNDED_CANDIDATE.
- Carbon — PATTERN_REFERENCE_ONLY.
- PatternFly — PATTERN_REFERENCE_ONLY.
- React migration — NOT_JUSTIFIED_BY_COMPONENT_STRATEGY.

### Atlas
- Existing Radix family footprint — PRESERVE_AND_EVALUATE_FIRST.
- Base UI — TRIAL_CANDIDATE where no equivalent family is already established.
- React Flow — SPECIALIST_EXISTING for graph experiences.
- shadcn/ui — OPEN_CODE_REFERENCE_ONLY, not visual identity.

### Arena / Docente OS
- runtime stack and existing component supply chain MUST be inventoried before any new library recommendation.
- no new global dependency is authorized by this document.

## 15. Distinctive TRAMA component backlog

Priority candidates for design/qualification:

1. `ContextShell`
2. `SystemStateBand`
3. `EcosystemRail`
4. `AttentionEntry`
5. `EvidenceTrail`
6. `AuthorityPath`
7. `ChangeLine`

These candidates exist because they encode TRAMA-specific meaning, not because a library lacks a similar-looking component.

## 16. Initial technical spikes

### CS-S1 — Control Center primitive spike
Compare:
- native browser behavior;
- Web Awesome Core.

Use cases:
- contextual help;
- mobile drawer/secondary navigation;
- non-modal disclosure/popover.

Success criteria:
- no TRAMA visual-identity regression;
- keyboard/focus behavior;
- self-hosted selective imports;
- acceptable bundle impact;
- clean removal/exit path.

### CS-S2 — Control Center distinctive composition spike
Build L0 v2 using:
- `ContextShell`;
- `SystemStateBand`;
- `EcosystemRail`;
- three navigation destinations.

Constraint:
- no default card grid;
- no React migration;
- native CSS/SVG first.

### CS-S3 — Atlas React primitive comparison
For one genuinely needed complex interaction:
- compare established Radix-family option against Base UI;
- do not ship both families for equivalent behavior;
- record accessibility, API fit, styling/PVIP, bundle and exit cost.

### CS-S4 — Component evidence surface
Create a small isolated component lab/catalogue:
- states;
- responsive conditions;
- keyboard/focus;
- product PVIP variants;
- dependency/source class;
- evidence links.

Storybook is permitted but not mandatory.

## 17. What is explicitly not selected

This strategy does NOT select:
- one mandatory component library;
- one global CSS framework;
- a global visual kit;
- a global card system;
- React as the ecosystem UI runtime;
- Web Components as the ecosystem UI runtime.

It selects a **decision system**.

## 18. Next governed work

After approval:
1. inventory actual component/dependency supply chains in Arena, Atlas, Docente OS and Control Center;
2. classify existing components using TRAMA-UI-DEVELOPMENT-01;
3. execute CS-S1 and CS-S2 first;
4. update `TRAMA-COMPONENT-PATTERN-01` with qualified components/patterns only after evidence;
5. avoid big-bang migration.

## 19. Non-authorizations

No runtime dependency is added by this strategy.
No existing UI is migrated.
No external visual theme is adopted.
No GitHub App is activated.
DOS-A1 remains RUNTIME_DEFERRED.
