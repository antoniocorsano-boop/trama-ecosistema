# TRAMA Interaction Duplication Inventory — INV-02

**Inventory slice:** INV-02  
**Status:** PROPOSED / OBSERVE  
**Date:** 2026-09-29  
**Parent:** TRAMA-COMPONENT-INVENTORY-01 · INV-01  
**Baseline TRAMA:** `83c6fe9388bf283267a3931b012e40d1aadab925`  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

Identify repeated interaction behavior across Arena, Atlas, Docente OS and TRAMA Control Center and distinguish:
- legitimate product-specific differences;
- duplicated generic behavior;
- accessibility/maintenance risk;
- candidate canonical primitive/pattern;
- where a bounded external primitive trial is justified.

This slice does not authorize migrations.

## 2. Decision vocabulary

Each interaction family is classified as one of:

- **KEEP_PRODUCT_LOCAL** — behavior and semantics are appropriate and product-specific;
- **KEEP_NATIVE** — native platform behavior is sufficient;
- **CONSOLIDATE_LOCAL** — multiple implementations inside one product should converge before adding a new dependency;
- **MAP_TO_TRAMA_SHARED** — implementation should be traced to an existing/future shared TRAMA semantic contract;
- **TRIAL_EXTERNAL_PRIMITIVE** — a bounded comparison with an approved mature primitive is justified;
- **SPECIALIST_KEEP** — specialist dependency remains justified for its bounded use case.

## 3. Arena

### 3.1 Dialog / confirmation

Observed parallel implementations:
- `src/components/ui/ConfirmDialog.tsx`
- `src/ui/components/UiConfirmDialog.tsx`
- additional feature-local modal compositions in documents/session/workspace/progettazione/copilot.

Legacy `ConfirmDialog`:
- custom overlay;
- no native dialog semantics;
- no labelled/described dialog role;
- no deterministic focus capture/return visible in the component.

Token-governed `UiConfirmDialog`:
- native `<dialog>`;
- `aria-labelledby` / `aria-describedby`;
- explicit focus target;
- focus return;
- shared `UiButton`;
- semantic UI tokens.

**INV02-F01 — DUPLICATED CONFIRMATION BEHAVIOR — HIGH**

Decision:
**CONSOLIDATE_LOCAL + MAP_TO_TRAMA_SHARED**

Target:
- measure usages first;
- converge product behavior toward the governed/native-dialog implementation where semantics match;
- trace confirmation semantics to `TRAMA.REVIEW_DECIDE_CONFIRM`;
- do not introduce Radix/Base UI merely to fix an internal duplication already addressed by the newer Arena component.

### 3.2 Tabs

Observed:
- `src/components/ui/Tabs.tsx`
- `src/ui/components/UiTabs.tsx`

Legacy tabs:
- buttons styled as tabs;
- no tablist/tab/tabpanel roles.

Governed tabs:
- `role="tablist"`;
- `role="tab"`;
- `aria-selected`;
- `role="tabpanel"`.

Remaining limitation:
- no explicit roving tabindex / arrow-key model visible in the component.

**INV02-F02 — DUPLICATED TABS WITH PARTIAL ACCESSIBILITY GAP — HIGH**

Decision:
**CONSOLIDATE_LOCAL**, then qualify keyboard behavior.

External primitive trial is not automatically required; first verify whether a small compliant local implementation is sufficient.

### 3.3 Tooltip

Observed:
- `src/components/ui/Tooltip.tsx`

Behavior:
- pointer hover only;
- no focus trigger;
- no tooltip role;
- no Escape behavior;
- required information could become inaccessible to keyboard/touch users if misused.

**INV02-F03 — POINTER-ONLY TOOLTIP — HIGH**

Decision:
**TRIAL_EXTERNAL_PRIMITIVE OR NATIVE/PATTERN REPLACEMENT**

This is a good candidate for a mature tooltip/toggletip primitive if the information is genuinely supplemental.

Rule:
essential task information must not depend on tooltip.

### 3.4 Accordion/disclosure

Observed:
- custom `Accordion.tsx` driven by a button;
- no `aria-expanded` / `aria-controls` visible.

**INV02-F04 — CUSTOM DISCLOSURE SEMANTICS INCOMPLETE — MEDIUM**

Decision:
**KEEP_NATIVE / CONSOLIDATE_LOCAL**

Preferred comparison:
- native `details/summary` when semantics fit;
- otherwise add complete disclosure semantics before considering a dependency.

### 3.5 Loading/status/progress

Observed multiple surfaces:
- legacy Button loading;
- UiButton loading;
- UiStatusMessage loading;
- Progress;
- Spinner;
- workflow-specific progress.

Interpretation:
not all are duplicates; some represent different semantic layers.

**INV02-F05 — LOADING/STATUS FAMILY NEEDS SEMANTIC PARTITION — MEDIUM**

Decision:
**MAP_TO_TRAMA_SHARED**

Partition by meaning:
- indeterminate control-local loading;
- page/route loading;
- operation progress;
- status/feedback.

Avoid one universal spinner/status component.

## 4. Atlas

### 4.1 General finding

No systemic duplicate primitive layer was observed.

Current patterns favor:
- native `select`;
- native `details/summary`;
- buttons with `aria-pressed` for peer view switching;
- product-owned shell/navigation;
- React Flow for graph interaction.

**INV02-F06 — LOW GENERIC DUPLICATION / NATIVE-FIRST FIT — LOW**

Decision:
**KEEP_NATIVE + KEEP_PRODUCT_LOCAL**

Do not expand Radix/Base UI until a real complex interaction requires it.

### 4.2 Relation explorer

`RelationExplorer` uses:
- native selects;
- aria-pressed view switch;
- React Flow only for node graph behavior;
- equivalent list/outline fallback.

Decision:
**SPECIALIST_KEEP**

React Flow remains bounded to graph exploration.

### 4.3 Disclosure

`CurriculumTree` uses native `details/summary`.

Decision:
**KEEP_NATIVE**

This is a positive reference for the ecosystem where disclosure semantics fit.

### 4.4 Modal/dialog references

Documentation mentions modal patterns, but no current general runtime dialog primitive was identified in the component inventory.

Decision:
No dependency adoption based on documentation alone.

## 5. Docente OS

### 5.1 Dialog and command palette

AppShell uses:
- Radix Dialog;
- cmdk;
- product-owned shell and styling.

This is an example of the desired component strategy:
mature behavior is borrowed while product expression remains local.

**INV02-F07 — COMPLEX INTERACTION ALREADY PROPERLY SOURCED — LOW**

Decision:
**KEEP_PRODUCT_LOCAL / EXISTING_RUNTIME_PRIMITIVE**

Do not introduce Base UI or another dialog/menu family for equivalent behavior without a concrete unmet need.

### 5.2 Status/alert

Observed:
- reusable `Alert` with `role="status"`;
- experience feedback success uses `role="status"`;
- experience feedback error uses `role="alert"`.

Interpretation:
these are not harmful duplicates; they represent distinct urgency semantics.

Decision:
**KEEP_PRODUCT_LOCAL + MAP_TO_TRAMA_SHARED**

Future work should map tones/semantics to `TRAMA.STATUS_MESSAGE`, not replace the visual implementation.

### 5.3 Disclosure

Experience feedback uses native `details/summary`.

Decision:
**KEEP_NATIVE**

### 5.4 Loading

Observed:
- route-level loading surface with `aria-live="polite"` and `aria-busy="true"`;
- reusable visual Skeleton with `aria-hidden`.

These are correctly separate semantic layers.

Decision:
**KEEP_PRODUCT_LOCAL**

No consolidation into a single loading primitive is recommended.

## 6. TRAMA Control Center

### 6.1 Contextual help popover

Current `control-center/index.html` contains:
- custom fixed-position `.help-popover`;
- `role="dialog"`;
- close button;
- page-local open/close behavior.

Risk:
a dialog-like pattern implemented page-locally must independently solve:
- initial focus;
- focus return;
- keyboard dismissal;
- focus containment where appropriate;
- collision/viewport positioning;
- mobile placement;
- interaction with scroll and bottom navigation.

This is the strongest current candidate for the already-planned CS-S1 primitive spike.

**INV02-F08 — CUSTOM PAGE-LOCAL DIALOG/POPOVER BEHAVIOR — HIGH**

Decision:
**TRIAL_EXTERNAL_PRIMITIVE**

Compare:
1. native Popover/Dialog APIs where adequate;
2. Web Awesome Core bounded primitive.

Do not adopt the Web Awesome visual theme.

### 6.2 Disclosure

Control Center already uses native `details/summary` for project-knowledge technical details.

Decision:
**KEEP_NATIVE**

### 6.3 Status/notice family

Observed multiple page-local visual patterns:
- validation banner;
- alert;
- project-knowledge summary;
- project-knowledge notice;
- health indicator.

These may encode different semantics, but are not yet represented through a reusable semantic layer.

**INV02-F09 — STATUS PRESENTATIONS ARE PAGE-LOCAL — MEDIUM**

Decision:
**MAP_TO_TRAMA_SHARED + EXTRACT DISTINCTIVE**

First extraction candidates:
- SystemStateBand;
- AttentionEntry;
- existing TRAMA.STATUS_MESSAGE semantics where applicable.

### 6.4 Navigation

Desktop sidebar and mobile bottom navigation are product-owned compositions.

Decision:
**KEEP_PRODUCT_LOCAL**

The problem is information architecture/orientation, not lack of a navigation library.

## 7. Cross-product duplication matrix

### Confirmation/dialog
- Arena: duplicated local implementations — consolidate.
- Atlas: no general runtime primitive identified.
- Docente OS: Radix Dialog already established — keep.
- Control Center: custom page-local dialog/popover — external/native trial justified.

### Tabs/view switching
- Arena: duplicate tabs, partial keyboard gap.
- Atlas: simple view switch uses aria-pressed, semantically not necessarily tabs.
- Docente OS: no duplicate generic tabs observed.
- Control Center: navigation should remain navigation, not tabs.

### Disclosure
- Arena: custom accordion with incomplete semantics.
- Atlas: native details/summary.
- Docente OS: native details/summary.
- Control Center: native details/summary.

Ecosystem direction:
**native disclosure should be the default where content semantics fit.**

### Tooltip/help
- Arena: pointer-only custom tooltip — high-risk.
- Atlas: no general tooltip primitive observed.
- Docente OS: no general runtime tooltip dependency observed.
- Control Center: dialog-like contextual help popover — high-risk/complex.

Ecosystem direction:
supplemental tooltip/toggletip behavior should use a mature accessible pattern; essential content must remain inline.

### Status/loading
- Arena: multiple overlapping families; semantic partition needed.
- Atlas: status mostly embedded in domain components.
- Docente OS: alert/status/loading separation is comparatively clear.
- Control Center: status patterns are page-local and should be extracted semantically.

## 8. INV-02 findings register

- **INV02-F01 HIGH** — Arena duplicated confirmation behavior.
- **INV02-F02 HIGH** — Arena duplicated tabs with keyboard-model gap.
- **INV02-F03 HIGH** — Arena pointer-only tooltip.
- **INV02-F04 MEDIUM** — Arena custom disclosure semantics incomplete.
- **INV02-F05 MEDIUM** — Arena loading/status family needs semantic partition.
- **INV02-F06 LOW** — Atlas native-first model shows low generic duplication.
- **INV02-F07 LOW** — Docente OS complex interaction sourcing is already aligned with strategy.
- **INV02-F08 HIGH** — Control Center custom page-local dialog/popover behavior.
- **INV02-F09 MEDIUM** — Control Center status presentations remain page-local.

## 9. Recommended next actions

### A. No big-bang standardization
Do not choose one interaction library for the ecosystem.

### B. Arena remediation order
1. usage map for old vs new confirmation/tabs;
2. keyboard/accessibility qualification of UiTabs;
3. retire pointer-only tooltip pattern from new work;
4. prefer native disclosure where possible;
5. map status semantics to TRAMA contracts.

### C. Control Center CS-S1
Run the bounded primitive spike specifically on contextual help:
- native Popover/Dialog;
- Web Awesome Core;
- current custom behavior as baseline.

Measure:
- keyboard;
- focus;
- mobile placement;
- bundle/runtime cost;
- visual adaptation;
- exit path.

### D. Atlas
Keep current native-first approach until a real complex interaction appears.

### E. Docente OS
Preserve Radix/cmdk/open-code strategy; focus next on evidence mapping, not replacement.

## 10. Next slice — INV-03

INV-03 will map evidence coverage for reusable components:
- isolated stories/component lab;
- keyboard/focus evidence;
- responsive evidence;
- visual regression;
- accessibility evidence;
- lifecycle status.

No migration or dependency adoption is authorized by INV-02.
