# TRAMA Component & Interaction Pattern Catalog v1

**Contract ID:** TRAMA-COMPONENT-PATTERN-01  
**Status:** PROPOSED / GOVERNANCE-ONLY  
**Baseline:** `96082ad25a7c37a7c8cd1796af740e32f340f27c`  
**Parents:** `TRAMA-UIUX-01` · `TRAMA-UI-EVIDENCE-01` · `TRAMA-DESIGN-TOKENS-01`  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

Define a governed catalog of reusable UI components and user-task patterns for Arena, Atlas, Docente OS and TRAMA Control Center. Shared behavior, semantics, accessibility and evidence are standardized; visual expression remains governed by each product PVIP.

The catalog follows a mature separation used by established design systems: **foundations/tokens → components → patterns/tasks → product composition**. A component solves a bounded interface problem; a pattern combines components to help a user accomplish a recognizable goal.

## 2. Reference principles adopted

The catalog SHALL adopt these principles:

1. **WAI-ARIA/APG-aligned behavior:** keyboard, focus and assistive-technology behavior must follow conventional platform patterns where an applicable pattern exists.
2. **Progressive enhancement:** semantic HTML and resilient content first; JavaScript enhances rather than silently defining basic meaning where a resilient alternative exists.
3. **Component + pattern distinction:** components are reusable building blocks; patterns describe goal-oriented combinations/flows.
4. **Accessibility is contextual:** an accessible component does not by itself make a composed journey accessible; rendered compositions require evidence.
5. **Controlled extension:** products may extend components for real product needs, but must not overwrite shared semantics or silently fork behavior.
6. **Lifecycle maturity:** catalog entries have explicit maturity states and evidence, rather than becoming canonical immediately after implementation.
7. **Identity preservation:** common semantics do not require pixel similarity. PVIPs govern visual expression.

## 3. Catalog object model

Every catalog entry MUST have:

- stable `id` and `version`;
- `kind`: `COMPONENT | PATTERN | TEMPLATE`;
- `owner` / governing authority;
- lifecycle `status`;
- user problem / intent;
- applicable products and PVIP binding;
- semantic contract;
- required/optional states and variants;
- keyboard/focus contract where interactive;
- accessibility acceptance criteria;
- responsive S/M/L/LIM behavior;
- content guidance where wording affects comprehension/action;
- feedback/perceptible-write behavior where actions mutate state;
- privacy/data classification when data is displayed or collected;
- dependencies and composed components;
- evidence requirements;
- extension points and forbidden overrides;
- deprecation/replacement metadata where applicable.

## 4. Lifecycle

Statuses are:

`PROPOSED → TRIAL → STABLE → DEPRECATED → RETIRED`

- **PROPOSED:** contract/design only; not recommended for general reuse.
- **TRIAL:** implemented and testable, with bounded use and evidence gathering.
- **STABLE:** behavior, accessibility, responsive evidence and product-use evidence satisfy governed acceptance criteria.
- **DEPRECATED:** supported temporarily with named replacement or removal rationale.
- **RETIRED:** no longer authorized for new use.

Promotion MUST be evidence-based and versioned. A component MUST NOT reach STABLE solely because its code builds or because it visually matches a mockup.

## 5. Core component families

The first catalog SHALL cover, without requiring immediate implementation of every item:

### Actions
- Button / button group
- Link / action link
- Menu button where justified

### Input and choice
- Text field / text area
- Select / combobox only where semantically justified
- Checkbox / radio group
- Search input
- Date/time input where required
- File/material attachment control where product contracts permit it

### Navigation
- Global/product navigation shell
- Breadcrumb/context trail
- Tabs only for peer views of the same context
- Pagination
- Step/progress navigation for genuine multi-step tasks

### Feedback and system state
- Inline validation
- Error summary
- Status/notification message
- Loading/pending/progress
- Empty state
- Offline/degraded state
- Confirmation/perceptible outcome

### Disclosure and overlays
- Details/disclosure
- Accordion only for repeated independent sections
- Tooltip/toggletip distinction
- Popover/menu
- Dialog/modal only when interruption is justified

### Content and data
- Card/tile
- Structured list
- Table/data table
- Tag/status marker
- Metadata/provenance block
- Evidence/status panel

## 6. Initial ecosystem patterns

Patterns are user-goal contracts, not decorative templates. Initial governed pattern families SHALL include:

- **Find and resume work** — stable entry point, context restoration and next action.
- **Review → decide → confirm** — teacher/human agency with perceptible result.
- **Create/edit with validation** — field errors plus summary/recovery.
- **Publish/share material** — explicit scope, destination, status and confirmation.
- **Authority/provenance inspection** — source, version, state and governing authority visible without ambiguity.
- **Explore curriculum** — progressive disclosure/navigation without requiring account personalization.
- **Filter/search results** — query/filter state visible, reversible and responsive.
- **Empty/degraded/offline recovery** — explain state, preserve work where applicable and expose a safe next action.
- **Long-task progress** — distinguish pending, progress, completion and failure; never imply completion before evidence exists.
- **Responsive navigation** — equivalent task access across S/M/L/LIM without horizontal overflow or hidden essential actions.

## 7. Product identity and controlled extension

A catalog component has one semantic/behavioral contract but MAY render differently under Arena, Atlas, Docente OS and Control Center PVIPs.

Products MAY provide profile variants for density, typography, surface treatment, shape, composition and iconography. They MUST NOT alter:

- semantic role;
- keyboard/focus behavior;
- state meaning;
- accessibility invariants;
- perceptible-write requirements;
- authority/privacy semantics;
- responsive evidence obligations.

Small visual extensions SHOULD use governed variant/alias mechanisms. A materially different behavior requires a new component/pattern ID or a governed major version; silent forks are invalid.

## 8. Accessibility and interaction evidence

Interactive entries MUST define applicable keyboard and focus behavior and MUST use native semantic elements where they satisfy the need. ARIA MUST NOT replace native semantics without a documented reason.

Evidence for promotion to STABLE SHALL include, as applicable:

- keyboard-only operation;
- visible focus and logical focus order;
- accessible name/role/state/value;
- screen-reader/assistive-technology checks for high-risk interactions;
- zoom/reflow and S/M/L/LIM evidence;
- forced-colors/high-contrast resilience;
- reduced-motion behavior;
- error identification/recovery;
- target sizing;
- no meaning conveyed only by color/iconography;
- composed-journey evidence, not only isolated component evidence.

## 9. Content and cognitive-load rules

Component APIs SHOULD prefer semantic labels/slots over arbitrary HTML injection. Where rich content is allowed, sanitization/security obligations MUST be explicit.

Actions MUST use clear task-oriented labels. Destructive, irreversible or authority-changing actions require explicit semantics and appropriate confirmation/recovery patterns. Repeated status and helper content SHOULD be concise and progressively disclosed when detail is secondary.

## 10. Machine-readable Stage A authorized after approval

Approval authorizes a separate non-blocking implementation slice containing:

1. component/pattern catalog schema;
2. governed owner registry binding;
3. initial component records for Button, Link, Text Field, Checkbox/Radio, Search, Tabs, Disclosure, Dialog, Notification, Error Summary, Loading/Progress, Card, Table and Status Tag;
4. initial pattern records for Review-Decide-Confirm, Validation-Recovery, Publish-Confirm, Offline-Recovery and Responsive-Navigation;
5. validator for identity/version/status, required contracts, dependency references, PVIP bindings and forbidden overrides;
6. negative fixtures for missing keyboard contract, invalid lifecycle transition, silent semantic override, unresolved dependency, missing responsive evidence contract, missing perceptible outcome and cross-product behavior fork;
7. Stage A report integrated with UI Evidence.

No product runtime adoption is authorized by this contract alone.

## 11. Acceptance criteria

- **CP-E1:** components, patterns and templates are distinct governed kinds.
- **CP-E2:** every entry has owner, lifecycle, semantic contract, evidence and responsive obligations.
- **CP-E3:** lifecycle promotion is evidence-based; build success or visual similarity alone is insufficient.
- **CP-E4:** conventional keyboard/focus/native-semantic behavior is required where applicable.
- **CP-E5:** accessibility is tested both in isolation and in composed journeys.
- **CP-E6:** product PVIPs may change expression but not shared behavior/meaning.
- **CP-E7:** extensions are governed; silent behavioral forks and cross-product overrides are invalid.
- **CP-E8:** perceptible outcomes and validation/recovery are first-class pattern requirements.
- **CP-E9:** S/M/L/LIM behavior is part of every applicable component/pattern contract.
- **CP-E10:** machine-readable Stage A includes schema, validator, fixtures and evidence before enforcement.
- **CP-E11:** no runtime migration, persistence, student account/tracking or DOS-A1 activation is introduced.
