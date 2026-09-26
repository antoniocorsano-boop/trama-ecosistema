# TRAMA Component & Interaction Pattern Catalog v1

**Contract ID:** TRAMA-COMPONENT-PATTERN-01  
**Status:** PROPOSED / GOVERNANCE-ONLY  
**Baseline:** `96082ad25a7c37a7c8cd1796af740e32f340f27c`  
**Parents:** `TRAMA-UIUX-01` · `TRAMA-UI-EVIDENCE-01` · `TRAMA-DESIGN-TOKENS-01` · `TRAMA-PW-01`  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

Define a governed catalog of reusable UI components and user-task patterns for Arena, Atlas, Docente OS and TRAMA Control Center. Shared behavior, semantics, accessibility and evidence are standardized; visual expression remains governed by each product PVIP.

The catalog follows a mature separation used by established design systems: **foundations/tokens → components → patterns/tasks → product composition**. A component solves a bounded interface problem; a pattern combines components to help a user accomplish a recognizable goal.

## 2. Reference principles adopted

The catalog SHALL adopt these principles:

1. **Native-first semantics, APG-informed complex interaction:** semantic HTML and platform behavior are the default. WAI-ARIA Authoring Practices (APG) is a reference for applicable complex interaction patterns; it is not a substitute for native HTML semantics. An interactive entry MUST declare whether a native control satisfies the need and, where an APG pattern is used, the applicable pattern/reference version and any governed deviation.
2. **Progressive enhancement:** resilient semantic content first; JavaScript enhances rather than silently defining basic meaning where a resilient alternative exists.
3. **Component + pattern distinction:** components are reusable building blocks; patterns describe goal-oriented combinations/flows.
4. **Accessibility is contextual:** an accessible component does not by itself make a composed journey accessible; rendered compositions require evidence.
5. **Controlled extension:** products may extend components for real product needs, but must not overwrite shared semantics or silently fork behavior.
6. **Lifecycle maturity:** catalog entries have explicit maturity states and evidence, rather than becoming canonical immediately after implementation.
7. **Identity preservation:** common semantics do not require pixel similarity. PVIPs govern visual expression.
8. **Explicit composition:** valid components do not imply valid arbitrary nesting. Slots, children, cardinality and parent/child responsibilities are governed.
9. **Explicit trust boundaries:** rich/user/external content is untrusted by default unless an authoritative contract establishes otherwise.

## 3. Catalog object model

Every catalog entry MUST have:

- stable `id` and `version`;
- `kind`: `COMPONENT | PATTERN | TEMPLATE`;
- `owner` / governing authority;
- lifecycle `status`;
- user problem / intent;
- applicable products and PVIP binding;
- semantic contract;
- `nativeFirst` declaration and native element/control where applicable;
- APG pattern/reference metadata where applicable, including governed deviation rationale;
- required/optional states and variants;
- explicit state model: visual, interaction and task/async states where applicable;
- keyboard/focus contract where interactive;
- accessibility acceptance criteria;
- responsive S/M/L/LIM behavior;
- content and localisation contract;
- feedback/perceptible-write behavior where actions mutate state;
- privacy/data and trust classification when data/content is displayed, collected or rendered;
- dependencies and composed components;
- composition contract (`slots`, allowed children, cardinality, nesting constraints, parent/child responsibilities);
- support/evidence profile including risk class and required test matrix;
- extension points and forbidden overrides;
- deprecation/replacement metadata where applicable.

## 4. Lifecycle

Statuses are:

`PROPOSED → TRIAL → STABLE → DEPRECATED → RETIRED`

- **PROPOSED:** contract/design only; not recommended for general reuse.
- **TRIAL:** implemented and testable, with bounded use and evidence gathering.
- **STABLE:** behavior, accessibility, responsive evidence, support-matrix evidence and product-use evidence satisfy governed acceptance criteria.
- **DEPRECATED:** supported temporarily with named replacement or removal rationale.
- **RETIRED:** no longer authorized for new use.

Promotion MUST be evidence-based and versioned. A component MUST NOT reach STABLE solely because its code builds or because it visually matches a mockup. Lifecycle transitions MUST follow the governed transition graph; exceptions require an explicit governance decision and rationale.

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
- File/material attachment control where product and security contracts permit it

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
- **Publish/share material** — explicit scope, destination, state, concurrency protection and confirmation.
- **Authority/provenance inspection** — source, version, state and governing authority visible without ambiguity.
- **Explore curriculum** — progressive disclosure/navigation without requiring account personalization.
- **Filter/search results** — query/filter state visible, reversible and responsive.
- **Empty/degraded/offline recovery** — explain state, preserve work where applicable and expose a safe next action.
- **Long-task progress** — distinguish pending, progress, completion and failure; never imply completion before evidence exists; define retry/cancel semantics where supported.
- **Responsive navigation** — equivalent task access across S/M/L/LIM without horizontal overflow or hidden essential actions.

## 7. Product identity and controlled extension

A catalog component has one semantic/behavioral contract but MAY render differently under Arena, Atlas, Docente OS and Control Center PVIPs.

Products MAY provide profile variants for density, typography, surface treatment, shape, composition and iconography. They MUST NOT alter semantic role, keyboard/focus behavior, state meaning, accessibility invariants, perceptible-write requirements, authority/privacy/trust semantics or responsive evidence obligations.

Small visual extensions SHOULD use governed variant/alias mechanisms. A materially different behavior requires a new component/pattern ID or a governed major version; silent forks are invalid.

## 8. Native semantics, accessibility and support evidence

Interactive entries MUST use native semantic elements where they satisfy the need. ARIA MUST NOT replace or redundantly override native semantics without a documented reason. Where an APG pattern is applicable, the catalog entry MUST identify the pattern/reference and declare deviations. A future validator MUST reject undocumented semantic replacement/override configurations.

Each interactive entry SHALL have a versioned **support evidence profile** with a risk class. Promotion to STABLE MUST record the tested environment rather than a generic PASS: browser/engine and version, input modality (keyboard, touch, pointer as applicable), platform/OS where material, and assistive-technology combinations for high-risk interactions. The profile SHALL distinguish mandatory and recommended combinations according to component risk and ecosystem support policy.

Evidence for promotion to STABLE SHALL include, as applicable: keyboard-only operation; visible/logical focus; accessible name/role/state/value; assistive-technology checks; zoom/reflow and S/M/L/LIM; forced-colors/high-contrast; reduced motion; error identification/recovery; target sizing; meaning independent of color/iconography; and composed-journey evidence.

## 9. Composition contract

Every composable entry MUST explicitly govern composition. The machine-readable representation SHALL support:

- named slots/regions and purpose;
- allowed child IDs/kinds;
- minimum/maximum cardinality where meaningful;
- required children/regions;
- prohibited nesting/combinations;
- ownership of accessible name/description;
- parent/child responsibility for focus movement/restoration;
- parent/child responsibility for validation/error association;
- responsive overflow/reflow responsibility;
- event/state propagation boundaries.

A composition that violates these rules is invalid even if every child component is independently STABLE. Arbitrary HTML/children injection MUST NOT bypass the composition or trust contract.

## 10. State, asynchronous work and concurrency

Catalog entries MUST distinguish, where applicable:

1. **visual state** — appearance such as emphasis/selection presentation;
2. **interaction state** — focus, hover, pressed, selected, disabled;
3. **task/async state** — idle, pending, progress, success/complete, failure, cancelled where supported.

`disabled` MUST NOT be used as an undocumented substitute for `busy/pending`. Mutating actions SHALL define protection against duplicate activation/double submission and state whether idempotency is required by the underlying product contract. Long-running actions SHALL define retry and cancellation semantics when supported, including what happens to user work. Completion/failure MUST have a perceptible outcome governed by `TRAMA-PW-01`; UI MUST NOT claim completion before authoritative evidence exists.

## 11. Content, localisation and content stress

Component APIs SHOULD prefer semantic labels/slots over arbitrary HTML injection. Actions MUST use clear task-oriented labels. Destructive, irreversible or authority-changing actions require explicit semantics and appropriate confirmation/recovery patterns.

Every applicable entry MUST define resilience to content variation, including:

- text expansion and wrapping without clipping essential content;
- long labels, headings, metadata and error messages;
- locale-aware numbers, dates and times when represented;
- plural/select forms where grammar depends on quantity/context;
- bidirectional-text resilience when applicable to supported content;
- no layout assumptions that depend on short Italian strings.

S/M/L/LIM evidence for applicable entries MUST include a governed **content-stress** case. Localisation readiness does not imply that every product is immediately multilingual; it prevents component contracts from structurally blocking future/localised content.

## 12. Security and trust boundaries

Rendered rich content, user-provided content, external content, URLs and attachments are **UNTRUSTED by default** unless a governing product/security contract establishes a stronger classification and provenance.

- Raw HTML injection is forbidden by default.
- Rich content requires an explicitly named safe rendering/sanitisation boundary appropriate to its source and allowed vocabulary.
- External links/URLs MUST define validation, safe navigation behavior and visible destination/context where needed for user comprehension.
- File/material attachment controls govern only the UI contract; upload validation, storage, scanning, MIME/content verification and download policy belong to the applicable security/product boundary and MUST NOT be silently assumed by the component.
- Trust classification MUST NOT be inferred from visual placement, product identity or client-side state.
- Unsafe content or unknown trust state MUST fail safely rather than being rendered as trusted content.

The Stage A validator/fixtures MUST cover unsafe rich content configuration and trust misclassification.

## 13. Machine-readable Stage A authorized after approval

Approval authorizes a separate non-blocking implementation slice containing:

1. component/pattern catalog schema;
2. governed owner registry binding;
3. initial component records for Button, Link, Text Field, Checkbox/Radio, Search, Tabs, Disclosure, Dialog, Notification, Error Summary, Loading/Progress, Card, Table and Status Tag;
4. initial pattern records for Review-Decide-Confirm, Validation-Recovery, Publish-Confirm, Offline-Recovery and Responsive-Navigation;
5. validator for identity/version/status, lifecycle transitions, native-first/APG metadata, state model, dependency references, PVIP bindings, composition contracts, support evidence profiles, content-stress/localisation contracts, trust classification and forbidden overrides;
6. negative fixtures for missing keyboard/native contract, undocumented ARIA/native override, invalid lifecycle transition, silent semantic override, unresolved dependency, illegal child/nesting/cardinality, missing responsive evidence, missing perceptible outcome, duplicate-submit/concurrency contract omission, cross-product behavior fork, missing content-stress contract, unsafe rich-content configuration and trust misclassification;
7. support-matrix evidence schema recording browser/engine/input/AT versions according to risk;
8. Stage A report integrated with UI Evidence.

No product runtime adoption is authorized by this contract alone.

## 14. Acceptance criteria

- **CP-E1:** components, patterns and templates are distinct governed kinds.
- **CP-E2:** every entry has owner, lifecycle, semantic contract, evidence and responsive obligations.
- **CP-E3:** lifecycle promotion is evidence-based; build success or visual similarity alone is insufficient.
- **CP-E4:** native semantics are first choice; APG references/deviations are explicit and undocumented ARIA/native overrides are invalid.
- **CP-E5:** accessibility is tested both in isolation and in composed journeys, with versioned environment/support evidence proportional to risk.
- **CP-E6:** product PVIPs may change expression but not shared behavior/meaning.
- **CP-E7:** extensions are governed; silent behavioral forks and cross-product overrides are invalid.
- **CP-E8:** perceptible outcomes and validation/recovery are first-class pattern requirements.
- **CP-E9:** S/M/L/LIM behavior and content-stress resilience are part of every applicable component/pattern contract.
- **CP-E10:** composition contracts govern slots/children/cardinality/nesting and parent-child responsibility; independently valid children do not guarantee a valid composition.
- **CP-E11:** visual, interaction and task/async states are distinct; mutating actions govern duplicate submission, busy/disabled semantics, idempotency dependency and retry/cancel where applicable.
- **CP-E12:** localisation/content variation cannot be structurally blocked by assumptions about short Italian strings.
- **CP-E13:** rich/external/user content is untrusted by default; raw HTML is forbidden by default and security responsibilities are explicitly bounded.
- **CP-E14:** machine-readable Stage A includes schema, validator, support-matrix evidence model and negative fixtures for all six hardening areas before enforcement.
- **CP-E15:** no runtime migration, persistence, student account/tracking or DOS-A1 activation is introduced.
