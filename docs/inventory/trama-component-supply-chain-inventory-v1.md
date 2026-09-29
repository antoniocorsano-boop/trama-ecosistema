# TRAMA Component & Supply-Chain Inventory v1

**Inventory ID:** TRAMA-COMPONENT-INVENTORY-01  
**Status:** PROPOSED / OBSERVE  
**Date:** 2026-09-29  
**Parent:** TRAMA-UI-DEVELOPMENT-01 · TRAMA-COMPONENT-STRATEGY-01  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

Establish the current UI/runtime component supply chain across Arena, Atlas, Docente OS and TRAMA Control Center before recommending any new dependency or migration.

This is an evidence inventory, not an adoption decision.

## 2. Evidence classes

- **DIRECT_RUNTIME:** read from the current package/runtime file.
- **INDEXED_RUNTIME:** read from indexed repository source when the package root is not directly fetchable.
- **ARCHITECTURE_DOC:** stated by governed/current architecture documentation.
- **OBSERVED_SURFACE:** visible in current implementation/source.

Where possible, multiple classes are used.

## 3. Arena

Repository:
`antoniocorsano-boop/CurManLight_arena`

Evidence:
- root `package.json` read directly from current `main`.

Current runtime:
- React 18.3.1;
- React DOM 18.3.1;
- Vite 6;
- React Router 7;
- Tailwind CSS 3.4;
- Zustand;
- Lucide React.

Design/development evidence:
- Storybook 10;
- Chromatic integration;
- Storybook a11y addon;
- Testing Library;
- Vitest browser / Playwright.

Current component-supply-chain interpretation:
- no general-purpose headless primitive family was identified in the direct runtime package;
- Arena already has a strong isolated-component evidence capability through Storybook;
- Tailwind and local React components remain the primary composition layer.

Strategy classification:
- native React/HTML semantics: **PREFERRED**;
- existing local components: **PRODUCT_LOCAL / INVENTORY_REQUIRED**;
- Storybook: **EXISTING_COMPONENT_EVIDENCE_SURFACE**;
- new primitive library: **NOT_AUTHORIZED_BY_INVENTORY**.

Primary follow-up:
- enumerate actual shared/local component families in `src/components`;
- identify repeated dialog/menu/disclosure/form behavior implemented locally;
- determine where a mature primitive would remove duplicated interaction logic.

## 4. Atlas

Repository:
`antoniocorsano-boop/Curriculum-Atlas`

Evidence:
- root `package.json` read directly from current `main`.

Current runtime:
- Next.js 15.5;
- React 19.1;
- React DOM 19.1;
- Tailwind CSS 4;
- `@radix-ui/react-slot`;
- class-variance-authority;
- clsx;
- tailwind-merge;
- Lucide React;
- `@xyflow/react` 12.8.

Current component-supply-chain interpretation:
- Radix package-family footprint already exists, albeit currently limited in the direct package evidence to Slot;
- Tailwind/CVA/clsx/tailwind-merge form an open-code composition stack;
- React Flow is an established specialist graph dependency and should remain specialist rather than becoming a general layout primitive.

Strategy classification:
- native semantics: **PREFERRED**;
- Radix family: **EXISTING_FOOTPRINT_EVALUATE_FIRST**;
- Base UI: **COMPARATIVE_TRIAL_ONLY**;
- React Flow: **SPECIALIST_EXISTING**;
- shadcn-style compositions: **OPEN_CODE_PATTERN / LOCAL_OWNERSHIP WHEN COPIED**.

Primary follow-up:
- enumerate actual component directory and determine whether Radix is used only as Slot or more broadly via copied/open-code components;
- identify UI patterns already stabilized for Percorsi, Esplora and Student/Public surfaces;
- map graph interaction separately from ordinary component strategy.

## 5. Docente OS

Repository:
`antoniocorsano-boop/docente-os-2026-27`

Evidence:
- indexed `product/package.json`;
- indexed runtime source;
- current architecture/product documentation.

Current runtime:
- Next.js 16.3.1;
- React 19.2.8;
- React DOM 19.2.8;
- Tailwind CSS 4;
- class-variance-authority;
- clsx;
- tailwind-merge;
- `@radix-ui/react-dialog`;
- `cmdk`;
- Lucide React;
- `@assistant-ui/react`;
- shadcn-style open-code component foundation.

Current product architecture:
- professional AppShell exists;
- command palette exists;
- responsive navigation exists;
- component foundation X1 and AppShell X2 are marked complete in current product documentation.

Current component-supply-chain interpretation:
- Docente OS already has an intentional open-code/shadcn-style product component strategy;
- Radix Dialog is an active runtime primitive;
- cmdk is an active specialist interaction dependency;
- the new ecosystem Component Strategy MUST NOT replace this stack merely for consistency;
- the correct task is to classify and evidence the existing components, not introduce another visual kit.

Strategy classification:
- shadcn-style local components: **PRODUCT_LOCAL_OPEN_CODE**;
- Radix Dialog: **EXISTING_RUNTIME_PRIMITIVE**;
- cmdk: **EXISTING_SPECIALIST_PRIMITIVE**;
- assistant-ui: **EXISTING_SPECIALIST_PRODUCT_LAYER**;
- new equivalent primitive family: **REQUIRES DUPLICATION REVIEW**.

Primary follow-up:
- enumerate `product/src/components`;
- separate copied/open-code primitives from Docente OS semantic compositions;
- check component states, keyboard/focus evidence and Storybook/equivalent coverage;
- identify which components could consume TRAMA semantic contracts without changing the teacher-first visual identity.

## 6. TRAMA Control Center

Repository:
`antoniocorsano-boop/trama-ecosistema`

Evidence:
- current `control-center/index.html`.

Current runtime:
- static HTML/CSS/JavaScript;
- no React runtime;
- no general UI component library;
- semantic/custom CSS tokens embedded in current implementation;
- local service-worker/PWA behavior.

Current component-supply-chain interpretation:
- the Control Center is the strongest candidate for standards-first/native interaction;
- introducing React solely for component availability is not justified;
- Web Components may be evaluated only for bounded interaction behavior;
- layout/orientation and distinctive ecosystem components should remain TRAMA-owned.

Strategy classification:
- native platform: **PREFERRED**;
- Web Awesome Core: **TRIAL_CANDIDATE_ONLY**;
- Spectrum WC: **REFERENCE_OR_BOUNDED_CANDIDATE**;
- Carbon/PatternFly: **PATTERN_REFERENCE_ONLY**;
- React migration: **NOT_JUSTIFIED_BY_COMPONENT_STRATEGY**.

Primary follow-up:
- run CS-S1 on one real interaction family;
- run CS-S2 for L0 v2 with ContextShell + SystemStateBand + EcosystemRail;
- remove card-first/page-long composition before any library adoption.

## 7. Cross-ecosystem findings

### Existing diversity is legitimate

The ecosystem already uses different technical stacks:
- Arena: React/Vite + Storybook;
- Atlas: Next/React + Tailwind/CVA + Radix footprint + React Flow;
- Docente OS: Next/React + Tailwind + shadcn-style open code + Radix/cmdk;
- Control Center: standards-first static HTML/CSS/JS.

A single mandatory runtime library would therefore increase migration cost and reduce product fit.

### Existing common ground

Common or compatible foundations already exist:
- semantic HTML;
- React in Arena/Atlas/Docente OS;
- Tailwind in Arena/Atlas/Docente OS;
- Lucide in Arena/Atlas/Docente OS;
- product-local CSS variables/tokens;
- explicit responsive/accessibility testing in multiple products.

### Main supply-chain risk

The largest current risk is not “lack of a component library”. It is:
- unclear component ownership across products;
- unknown duplication of generic interaction behavior;
- incomplete mapping from local components to TRAMA semantic contracts;
- inconsistent isolated-component evidence across products.

## 8. Immediate inventory work

Next inventory slices:

### INV-01 — Component directories
Enumerate reusable components and classify:
- NATIVE_PLATFORM
- TRAMA_SHARED
- PRODUCT_LOCAL
- THIRD_PARTY_PRIMITIVE
- THIRD_PARTY_PATTERN_REFERENCE

### INV-02 — Interaction duplication
Search for repeated local implementations of:
- dialog;
- menu;
- popover;
- combobox/listbox;
- accordion/disclosure;
- tabs;
- toast/status;
- loading/progress;
- error summary.

### INV-03 — Evidence coverage
For each reusable family record:
- isolated evidence surface;
- keyboard/focus evidence;
- responsive evidence;
- visual regression;
- accessibility evidence;
- lifecycle status.

### INV-04 — Distinctive-component opportunity
Map real surfaces to:
- ContextShell;
- SystemStateBand;
- EcosystemRail;
- AttentionEntry;
- EvidenceTrail;
- AuthorityPath;
- ChangeLine.

## 9. Non-decisions

This inventory does not:
- approve Web Awesome;
- approve Base UI;
- add Radix packages;
- migrate Arena/Atlas/Docente OS;
- introduce React into the Control Center;
- change any PVIP;
- change runtime authority;
- activate DOS-A1.

## 10. Current conclusion

The Component Strategy is compatible with the current ecosystem.

The immediate need is not a common visual kit. It is a **governed component map** that identifies:
- what behavior is already mature;
- what behavior is duplicated;
- what is product-local by design;
- what should become TRAMA-shared;
- what should remain distinctive.

Only after that map exists should any new runtime component dependency be trialed.
