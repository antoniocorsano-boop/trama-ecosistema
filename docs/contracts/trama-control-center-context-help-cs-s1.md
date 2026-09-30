# TRAMA Control Center Context Help — CS-S1 qualification

**Contract ID:** TRAMA-CC-CONTEXT-HELP-CS-S1  
**Date:** 2026-09-30  
**Status:** IMPLEMENTATION / EXACT-HEAD BROWSER QUALIFICATION REQUIRED / HUMAN REVIEW REQUIRED  
**Component:** `CONTROL_CENTER.CONTEXT_HELP.FAMILY`  
**Runtime authority:** Control Center presentation only  
**Product runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Problem

The original Context Help implementation was page-local:
- global mouse/focus/click listeners embedded in `index.html`;
- custom `role="dialog"` surface;
- close button;
- no isolated evidence producer;
- incomplete focus/return semantics;
- mobile behaviour observed only at page level.

INV-03 therefore correctly kept the component at confirmed `REGISTERED`.

## 2. CS-S1 candidate comparison

### A. Current custom dialog baseline

Strengths:
- zero dependency;
- already integrated.

Weaknesses:
- page-local;
- custom open/close logic;
- dialog semantics stronger than the actual information-only use case;
- no isolated primitive evidence;
- close button creates an unnecessary interactive sub-flow.

Decision: **reject as final candidate**.

### B. Web Awesome Core

Strengths:
- mature external primitives;
- explicit popover/overlay abstractions;
- reusable component packaging.

Weaknesses for this bounded use case:
- introduces an external runtime dependency for a small information-only primitive;
- adds lifecycle/supply-chain work that native platform semantics can avoid;
- would widen the spike beyond the current requirement.

Decision: **do not adopt for Context Help CS-S1**. This does not reject Web Awesome for other bounded future use cases.

### C. Native Popover + tooltip semantics + progressive fallback

Strengths:
- native-first, consistent with TRAMA component strategy;
- no runtime dependency;
- top-layer rendering where Popover API is available;
- progressive fallback to the existing CSS surface when it is not;
- information-only semantics fit `role="tooltip"` better than a custom dialog;
- trigger focus is retained;
- Escape dismisses without a focus trap;
- pointer and keyboard paths can be tested in isolation.

Decision: **selected CS-S1 candidate**.

## 3. Implementation boundary

The selected implementation lives in:

`control-center/context-help.js`

The Home consumes the same primitive. The isolated evidence surface is:

`control-center/fixtures/context-help.html`

The primitive:
- uses native `showPopover()/hidePopover()` when supported;
- falls back to the governed `.open` CSS state;
- does not fetch network data;
- does not add a package/runtime dependency;
- does not mutate snapshot or Project Knowledge state.

## 4. Interaction contract

For a `.helpable` trigger:

### Keyboard/focus
- focus exposes the contextual help;
- the active trigger receives `aria-describedby="helpPopover"`;
- Escape dismisses help and leaves/restores focus on the trigger;
- moving focus away dismisses the help;
- no focus trap is introduced.

### Pointer
- pointer hover exposes contextual help;
- leaving the trigger dismisses pointer-opened help unless the trigger also owns keyboard focus;
- outside pointer interaction dismisses active help.

### Accessibility
- the surface is `role="tooltip"`;
- it contains no interactive descendants;
- content is announced through `aria-live="polite"`;
- no essential action exists only inside the tooltip.

### Responsive
- the tooltip must remain within the viewport at 390×844 and 1024×768;
- it must not cause page-level horizontal overflow.

## 5. Exact-head evidence

The dedicated workflow:

`.github/workflows/control-center-context-help.yml`

must execute on the exact PR head and produce:
- static contract test;
- Chromium isolated fixture evidence;
- native Popover path exercised;
- keyboard focus/Escape evidence;
- pointer evidence;
- responsive evidence at 390×844 and 1024×768;
- axe-core WCAG automated evidence;
- Home integration evidence;
- uploaded `evidence.json` and screenshots.

Pinned CI-only evidence dependencies:
- Playwright `1.61.1`;
- axe-core `4.12.1`.

They are **not** Control Center runtime dependencies.

## 6. Maturity implication

This implementation PR does not directly rewrite the Component Evidence Registry because the final workflow run ID and immutable exact head are only known after the qualification head exists.

After integration, a separate evidence-binding update may promote:
- ISOLATED → PRESENT;
- BEHAVIOURAL → PRESENT;
- RESPONSIVE_VISUAL → PRESENT;
- ACCESSIBILITY → PRESENT;

only if the exact-head workflow is PASS.

Lifecycle remains independent and is not automatically promoted.

## 7. Non-authorizations

This slice does not:
- introduce Web Awesome;
- authorize a broader component-library migration;
- modify product runtimes;
- change maturity calculation rules;
- auto-promote lifecycle;
- authorize DOS-A1 or Docente OS → Atlas publication.
