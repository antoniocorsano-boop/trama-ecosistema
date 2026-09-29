# TRAMA Component Directory Inventory — INV-01

**Inventory slice:** INV-01  
**Status:** PROPOSED / OBSERVE  
**Date:** 2026-09-29  
**Parent:** TRAMA-COMPONENT-INVENTORY-01  
**Baseline TRAMA:** `a95468204bbdd732483bada6dd671ac74a360f24`  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

Enumerate the current reusable/component-bearing directories across Arena, Atlas, Docente OS and TRAMA Control Center and classify their ownership before any migration or new library adoption.

This slice answers:
- where reusable components actually live;
- whether multiple component foundations coexist;
- which components are generic primitives vs product/domain compositions;
- where component evidence already exists;
- where the current codebase has no modular component layer.

INV-01 does **not** decide deletions, migrations or library adoption.

## 2. Evidence baselines

### Arena
Repository: `antoniocorsano-boop/CurManLight_arena`  
Observed main head: `9da1cf65ae86ff5a3a65888636bf04f3a7312a7b`

### Atlas
Repository: `antoniocorsano-boop/Curriculum-Atlas`  
Observed main head: `1295f2817b640f3bcb9c5da9053a4f85b027cc71`

### Docente OS
Repository: `antoniocorsano-boop/docente-os-2026-27`  
Observed main head: `f0b7e5c01620d4cc87587081859cbf270cc1d033`

### TRAMA Control Center
Repository: `antoniocorsano-boop/trama-ecosistema`  
Observed main head: `a95468204bbdd732483bada6dd671ac74a360f24`

## 3. Arena

### 3.1 Generic component directories

Two parallel families exist.

#### Legacy/generic family
`src/components/ui/`

Observed TSX components:
- Accordion
- Badge
- Button
- Card
- ConfirmDialog
- EmptyState
- ErrorBoundary
- Input
- Modal
- Progress
- Select
- Spinner
- Tabs
- Toast
- ToastContainer
- Tooltip

Plus `index.ts`.

#### Token-governed UI family
`src/ui/components/`

Observed components:
- UiButton
- UiConfirmDialog
- UiEmptyState
- UiMetadataList
- UiPanel
- UiSectionHeader
- UiStatusMessage
- UiTabs

Observed stories:
- UiButton
- UiConfirmDialog
- UiEmptyState
- UiPanel
- UiStatusMessage

### 3.2 Domain component surface

Observed feature/domain component families include:
- AI
- beta / institutional review
- Copilot
- curriculum e-twin
- curriculum functional pilot
- curriculum
- documents
- guided workflow
- navigation
- progettazione
- session
- workspace

Measured on the observed tree:
- **24 generic UI TSX components** across the two UI families;
- **73 domain/feature TSX components**;
- **5 Storybook stories**.

### 3.3 Structural finding

**INV01-F01 — PARALLEL UI FOUNDATIONS — HIGH**

Arena contains overlapping generic primitive families.

Verified example:
- `src/components/ui/Button.tsx` uses literal Tailwind color classes;
- `src/ui/components/UiButton.tsx` uses semantic `ui-*` tokens and forwardRef;
- `src/components/ui/ConfirmDialog.tsx` implements a custom overlay/dialog;
- `src/ui/components/UiConfirmDialog.tsx` uses native `<dialog>`, labelled/described semantics, focus return and shared UiButton.

Interpretation:
the second family appears architecturally more aligned with current TRAMA UI governance, but INV-01 does **not** declare the first family obsolete.

Required next step:
INV-02 must measure actual usage and behavioral duplication before any deprecation proposal.

### 3.4 Evidence strength

Arena already has the strongest isolated component evidence surface in the ecosystem:
- Storybook;
- Chromatic;
- a11y addon;
- component stories.

Opportunity:
extend evidence coverage to the components that are intended to become canonical rather than creating another component lab.

## 4. Atlas

### 4.1 Generic component directory

`src/components/ui/`

Observed:
- `button.tsx`

The Button:
- uses native `button` by default;
- uses Radix Slot for `asChild`;
- uses CVA;
- uses semantic CSS variables;
- is visually product-owned.

### 4.2 Atlas-owned domain components

`src/components/atlas/`

Observed:
- activity-prototype
- app-shell
- curriculum-tree
- material-browser
- provenance-panel
- relation-explorer
- resource-catalog

Measured:
- **1 generic UI TSX component**;
- **7 Atlas-domain components**.

### 4.3 Structural finding

**INV01-F02 — MINIMAL GENERIC FOUNDATION / HIGH DOMAIN COMPOSITION — MEDIUM**

Atlas has deliberately little generic component infrastructure. Most visual behavior is composed directly in Atlas-owned components.

This is not automatically a problem.

Risk:
as the product grows, generic interaction behavior may be reimplemented inside domain components without a shared primitive layer.

Required next step:
INV-02 should inspect dialog/menu/disclosure/tabs/status/form behavior before recommending Radix/Base UI expansion.

### 4.4 AppShell finding

Atlas already has a product-owned AppShell with:
- desktop sidebar;
- mobile bottom navigation;
- native `details/summary` for “Altro”;
- explicit public/no-account context;
- Lucide iconography.

This should be treated as **PRODUCT_LOCAL / ORIENTATION COMPOSITION**, not replaced by an external shell component merely for consistency.

## 5. Docente OS

### 5.1 Generic UI directory

`product/src/components/ui/`

Observed:
- alert
- badge
- button
- card
- separator
- skeleton

Measured:
- **6 generic UI TSX components**.

These are open-code/local components rather than an opaque visual runtime kit.

### 5.2 Product/platform component directories

Observed:
- `product/src/components/app-shell/`
- `product/src/components/assistant/`
- `product/src/components/experience-feedback/`

Measured core product/platform TSX components:
- AppShell
- ContextualAssistantBoundary
- KnowledgeAssistant
- ExperienceFeedback

### 5.3 Runtime primitive usage

The AppShell directly uses:
- `@radix-ui/react-dialog`;
- `cmdk`;
- Lucide.

This is a valid example of the approved strategy:
**borrow mature behavior, own product expression**.

The visual shell remains Docente OS-owned.

### 5.4 Structural finding

**INV01-F03 — INTENTIONAL OPEN-CODE FOUNDATION — LOW**

Docente OS already has a coherent component sourcing model.

Primary risk is not lack of components; it is uncontrolled growth of copied/local primitives without lifecycle/evidence mapping.

Required next step:
INV-02 should identify duplicated generic interactions outside `components/ui`;
INV-03 should map evidence for each reusable primitive.

### 5.5 Card note

A `Card` primitive exists, but INV-01 does not classify that as a problem.

The TRAMA anti-card rule applies to **composition**, not to the mere existence of a Card primitive.

Future review must distinguish:
- legitimate bounded object/destination cards;
- card-first page layout used as a default visual grammar.

## 6. TRAMA Control Center

### 6.1 Current structure

The Control Center currently has no modular UI component directory.

Primary UI surfaces are embedded in:
- `control-center/index.html`
- `control-center/ecosystem.html`
- `control-center/evidence.html`
- `control-center/operations.html`
- `control-center/e3/index.html`
- preview/report surfaces.

CSS and interaction logic are largely page-local or embedded.

### 6.2 Structural finding

**INV01-F04 — MONOLITHIC STATIC UI COMPOSITION — HIGH**

The absence of a component framework is not a defect; the lack of an explicit reusable semantic component layer is now a maintainability and consistency risk.

Observed effects already visible in the project:
- repeated navigation/shell concepts;
- repeated panels/cards/badges;
- multiple state/notice presentations;
- page-local CSS growth;
- difficulty evolving L0 without touching a large page surface.

Required next step:
CS-S2 / L0 v2 should be the first extraction target, using standards-first components rather than a framework migration.

Priority distinctive extractions:
- ContextShell
- SystemStateBand
- EcosystemRail
- AttentionEntry

## 7. Cross-product classification

### NATIVE_PLATFORM
Strong candidates:
- links;
- buttons;
- semantic lists/tables;
- simple disclosure;
- static relationship SVG/CSS where sufficient.

### THIRD_PARTY_PRIMITIVE — existing
- Atlas: Radix Slot.
- Docente OS: Radix Dialog, cmdk.
- Arena: no general-purpose runtime primitive family observed in current package baseline.
- Control Center: none.

### PRODUCT_LOCAL
Strong examples:
- Arena feature workspaces/panels;
- Atlas AppShell, curriculum/material/relation components;
- Docente OS AppShell, assistant, feedback;
- Control Center current pages and future L0 composition.

### TRAMA_SHARED candidates
Existing:
- TRAMA.STATUS_MESSAGE contract.

Candidate mapping discovered by INV-01:
- Arena `UiStatusMessage` is a concrete implementation candidate to trace against the shared status semantics;
- confirmation/dialog semantics in Arena and Docente OS should be compared against `TRAMA.REVIEW_DECIDE_CONFIRM` in later slices.

### TRAMA_DISTINCTIVE candidates
Immediate:
- ContextShell
- SystemStateBand
- EcosystemRail
- AttentionEntry
- EvidenceTrail
- AuthorityPath
- ChangeLine

## 8. INV-01 findings register

### INV01-F01 — Arena parallel UI foundations
Severity: HIGH  
Action: inventory usage before any deprecation.

### INV01-F02 — Atlas minimal generic foundation
Severity: MEDIUM  
Action: inspect duplication before expanding primitive supply.

### INV01-F03 — Docente OS open-code foundation
Severity: LOW  
Action: preserve; improve lifecycle/evidence mapping.

### INV01-F04 — Control Center monolithic static UI composition
Severity: HIGH  
Action: extract distinctive standards-first components during L0 v2, not by framework rewrite.

## 9. What INV-01 does not conclude

INV-01 does not say:
- delete Arena legacy components;
- standardize all products on Radix;
- move Atlas to shadcn;
- replace Docente OS component strategy;
- add Web Awesome now;
- introduce React in Control Center;
- share pixels across products.

## 10. Next slice — INV-02

INV-02 will measure **interaction duplication**, focusing on:
- dialog/confirmation;
- menu/navigation;
- popover/tooltip;
- disclosure/accordion;
- tabs;
- toast/status;
- loading/progress;
- form control patterns.

The output must identify:
- repeated behavior;
- current implementation source;
- accessibility risk;
- candidate canonical primitive/pattern;
- whether reuse should be TRAMA-shared or product-local.

No migration is authorized until INV-02 evidence exists.
