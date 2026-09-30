# TRAMA UI Development Model v1

**Model ID:** TRAMA-UI-DEVELOPMENT-01  
**Status:** PROPOSED / GOVERNANCE-ONLY  
**Date:** 2026-09-29  
**Scope:** Arena · Atlas · Docente OS · TRAMA Control Center · prototypes that may graduate  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

TRAMA needs a reusable way to design and implement interfaces that are:
- understandable before they are visually impressive;
- modern without becoming visually generic;
- accessible by construction;
- compatible with each product's visual identity;
- able to reuse mature external primitives without inheriting an external product identity;
- testable, governable and replaceable.

This model operationalizes existing contracts rather than replacing them:
- `TRAMA-UIUX-01` governs ecosystem UI/UX quality;
- `TRAMA-DESIGN-TOKENS-01` governs semantic tokens and PVIPs;
- `TRAMA-COMPONENT-PATTERN-01` governs reusable components/patterns and lifecycle;
- `TRAMA-UI-EVIDENCE-01` governs evidence;
- `TRAMA-PW-01` governs perceptible outcomes.

## 2. Core model

Every material UI change SHALL follow this sequence:

`USER NEED → INFORMATION MODEL → ORIENTATION → BENCHMARK → BUILD/BORROW DECISION → COMPONENT MAPPING → VISUAL COMPOSITION → PROTOTYPE → EVIDENCE → HUMAN VALIDATION → PROMOTION`

No stage is satisfied merely because a mockup looks polished or code builds.

## 3. Layer model

### Layer A — User need and task
Define:
- who needs the surface;
- what question/task they must complete;
- what must remain understandable without specialist vocabulary;
- what consequence an incorrect interpretation could have.

Deliverable:
- user/task statement;
- critical misunderstanding list.

### Layer B — Information architecture and orientation
Define:
- current location;
- primary task/decision context;
- persistent product identity;
- information hierarchy;
- progressive navigation;
- progressive disclosure;
- mobile composition independently from desktop stacking.

Rule:
A page MUST NOT begin from a component inventory. It begins from the information model.

### Layer C — Mature-pattern benchmark
Before inventing a significant interaction or navigation pattern:
- inspect at least one mature relevant implementation/design system;
- record the observed pattern;
- state what is adopted, adapted or rejected;
- prefer established behavior over local reinvention.

Benchmarks are evidence sources, not visual templates.

### Layer D — Build / Borrow / Adapt decision
Each needed UI element SHALL be classified:

1. **NATIVE** — semantic HTML/platform capability is sufficient.
2. **BORROW_PRIMITIVE** — use a mature external behavioral primitive.
3. **ADAPT_PATTERN** — adopt a mature interaction/layout pattern without importing its visual identity.
4. **TRAMA_DISTINCTIVE** — design an ecosystem/product-specific visual component because it carries meaning or identity not available generically.
5. **PRODUCT_SPECIFIC** — local product composition or workflow component not suitable for ecosystem reuse.

The default decision order is:
`NATIVE → BORROW_PRIMITIVE → ADAPT_PATTERN → TRAMA_DISTINCTIVE → PRODUCT_SPECIFIC`.

Custom reimplementation of generic interaction behavior requires a documented reason.

## 4. External component principle: borrow behavior, own expression

A third-party UI dependency MAY provide:
- keyboard/focus behavior;
- ARIA/state wiring;
- collision/positioning behavior;
- disclosure/dialog/menu mechanics;
- form interaction mechanics;
- resilient cross-browser behavior.

A third-party dependency SHOULD NOT automatically determine:
- TRAMA information hierarchy;
- product layout;
- ecosystem visual language;
- color semantics;
- typography voice;
- density;
- shape/elevation character;
- navigation model;
- distinctive ecosystem visualizations.

TRAMA therefore adopts **behavioral primitives before visual kits**.

## 5. Visual identity model

Shared semantics do not imply shared appearance.

Each product consumes:
- ecosystem semantic tokens;
- its governed PVIP;
- shared component semantics;
- product-specific composition.

### Arena
Authority, provenance, review clarity, structured information.

### Atlas
Exploration, public readability, orientation, visual discovery.

### Docente OS
Teacher focus, continuity, speed, agency, low noise.

### TRAMA Control Center
Orientation, ecosystem relationships, state, evidence and traceability.

A third-party component MUST be visually adapted through tokens/parts/styles so it belongs to the relevant PVIP. If this cannot be done without fragile overrides, the dependency is unsuitable.

## 6. Anti-generic UI rule

TRAMA SHALL NOT use “card-first composition” as a default design method.

A card is justified only when it represents:
- a bounded object;
- a navigable destination;
- a decision/action context;
- a distinct state/evidence unit.

Prefer, where semantically stronger:
- typography and whitespace;
- connected relationships;
- rails;
- timelines;
- structured lists;
- bands;
- tables;
- maps/graphs;
- inline disclosure;
- navigation tiles;
- semantic grouping without boxed containers.

A UI that can be described mainly as “sidebar + grid of cards + badges” requires explicit design review before promotion.

## 7. Distinctive component rule

TRAMA SHOULD create proprietary components when the component expresses ecosystem-specific meaning.

Examples:
- `EcosystemRail` — Arena → Atlas → Docente OS relationship;
- `SystemStateBand` — current state + consequence + freshness;
- `EvidenceTrail` — human claim → evidence → exact version;
- `AuthorityPath` — authority/publication/decision relationship;
- `ChangeLine` — semantic history rather than commit history;
- `AttentionEntry` — contextual issue + ownership + consequence.

These components MAY reuse external primitives internally but SHALL own their semantics and visual composition.

## 8. Component source policy

A reusable component must declare one source class:

- `NATIVE_PLATFORM`
- `TRAMA_SHARED`
- `PRODUCT_LOCAL`
- `THIRD_PARTY_PRIMITIVE`
- `THIRD_PARTY_PATTERN_REFERENCE`

For a third-party dependency, record:
- project/package;
- version/range;
- license;
- maintenance state;
- framework/runtime requirement;
- accessibility model;
- customization mechanism;
- bundle/runtime cost;
- owner;
- update policy;
- exit/replacement path.

No dependency is adopted because of popularity or star count alone.

## 9. Composition before styling

The design workflow SHALL separate:

### Structure
- shell;
- position/orientation;
- hierarchy;
- relationships;
- destinations;
- primary actions.

### Expression
- type scale;
- spacing;
- color;
- borders;
- radius;
- elevation;
- motion;
- iconography.

A visually refined expression SHALL NOT be used to conceal unresolved structural problems.

## 10. Prototype ladder

### P0 — Structural
Low-fidelity, validates hierarchy and orientation.

### P1 — Realistic
Uses real tokens/PVIP/component constraints; validates feasibility without runtime replacement.

### P2 — Interactive
Uses the intended primitives and representative interaction behavior.

### P3 — Release candidate
Integrated with real data/state contracts and subject to Stage B evidence.

Promotion cannot skip directly from generated mockup to P3.

## 11. Mobile rule

Mobile is a separate composition of the same semantics.

For every material surface define:
- first-screen priority;
- persistent navigation/orientation;
- content removed from inline flow and moved to destinations/disclosures;
- touch target behavior;
- safe-area behavior;
- keyboard/focus where applicable;
- zoom/reflow;
- long-content handling.

Desktop stacking is not a mobile design.

## 12. Accessibility rule

Accessibility is split between primitive and composition:

### Primitive responsibility
- role/state semantics;
- keyboard model;
- focus management;
- pointer/touch mechanics;
- component-level ARIA behavior.

### Composition responsibility
- heading hierarchy;
- reading order;
- cognitive load;
- focus not obscured;
- target placement;
- error recovery;
- status meaning;
- responsive equivalence;
- user-task completion.

Using an accessible library does not make the composed interface accessible.

## 13. Validation model

A material UI proposal requires:

1. automated structural/component checks;
2. responsive evidence;
3. keyboard/focus evidence;
4. accessibility checks appropriate to risk;
5. content/cognitive review;
6. product-profile visual review;
7. human-use validation for material new journeys or communication models.

Human validation SHALL test user understanding/task completion, not preference alone.

## 14. Design-to-code traceability

For every reusable component or pattern intended to graduate:
- canonical ID;
- design reference;
- code implementation;
- token/PVIP bindings;
- source class;
- external dependency record if applicable;
- responsive contract;
- accessibility contract;
- evidence;
- lifecycle status.

Penpot or another design tool governs design representation; repository contracts govern semantics and implementation authority.

## 15. Exception rule

A local custom component that duplicates mature generic interaction behavior MUST document:
- why native/approved primitives are insufficient;
- what risk is introduced;
- owner;
- test obligations;
- replacement/review trigger.

A third-party component that requires inaccessible or brittle overrides SHALL be rejected.

## 16. Definition of Ready for implementation

A UI slice is ready to implement when:
- user/task is defined;
- orientation model is clear;
- mobile and desktop composition are specified;
- mature-pattern benchmark is recorded;
- each component has Build/Borrow/Adapt classification;
- token/PVIP mapping exists;
- critical states are known;
- authority/privacy implications are known.

## 17. Definition of Done

A UI slice is complete only when:
- intended task works;
- hierarchy/orientation are preserved;
- component sources are registered;
- no unjustified duplicate primitive exists;
- Stage B evidence is satisfied for materially changed release-capable scope;
- responsive/mobile checks pass;
- accessibility checks pass;
- human-use validation is complete where required;
- no prototype-only assumptions remain;
- documentation/catalogue entries are updated;
- reusable architecture/design/process findings are consolidated into the existing canonical document or a new governed reference;
- the Governed Document Registry is updated when the result is foundational, normative or continuity-critical;
- roadmap/decision records are updated when execution order or authority boundaries changed;
- documentation closure is not BLOCKED.

## 18. Reuse across products

The reusable unit is **semantic behavior**, not pixel appearance.

An ecosystem pattern may be shared when:
- user intent is equivalent;
- semantic state model is equivalent;
- keyboard/focus model is equivalent;
- accessibility contract is equivalent.

A product SHOULD compose or skin that pattern through its PVIP rather than fork behavior.

## 19. Governance sequence for component adoption

`DISCOVER → EVALUATE → TRIAL → EVIDENCE → QUALIFY → STABLE → MONITOR → REPLACE/DEPRECATE`

No external library/component becomes ecosystem STABLE merely because it was used successfully once.

## 20. Immediate application

The first application of this model is **TRAMA Component Strategy v1**.

That strategy will:
- map which behaviors should remain native;
- shortlist third-party primitives by architecture;
- identify distinctive TRAMA components;
- define “reference only” design systems;
- prevent generic visual-kit lock-in;
- define bounded technical spikes before adoption.

## 21. Non-authorizations

This model does not:
- select one mandatory UI library;
- authorize runtime migration;
- authorize a framework rewrite;
- weaken existing product authority/privacy contracts;
- activate Live Overlay;
- activate GitHub App;
- activate DOS-A1.
