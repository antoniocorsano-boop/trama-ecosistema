# TRAMA-COMPONENT-EVIDENCE-EXPANSION-01 — verified evidence receipt

**Date:** 2026-09-30  
**Status:** VERIFIED INPUT / READ_ONLY / HUMAN REVIEW REQUIRED FOR INTEGRATION  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

Expand the governed Component Evidence Registry beyond Arena/Control Center using only evidence already present on exact qualified product heads.

This receipt does not remediate product runtimes and does not promote lifecycle automatically.

## 2. Atlas — exact evidence baseline

Repository:

`antoniocorsano-boop/Curriculum-Atlas`

Exact head:

`bc11577eeeeeed9c43ad62ac43fb7561e1197246`

This head is the R3-F0/S3-V2 exit head already used by the product-maturity evidence chain.

Verified runs:
- F4 Mobile/LIM Evidence — run `36093494414` — PASS;
- F5 Exit — run `36093494130` — PASS.

### RelationExplorer

Target:

`src/components/atlas/relation-explorer.tsx`

Observed:
- product-owned React/XYFlow composition;
- native selects for filters;
- `aria-pressed` map/list switch;
- textual equivalent outline;
- map is not the only representation.

Executable evidence:
- F5 Exit opens `/esplora`, activates the `Elenco` control, and verifies the pressed state;
- F4 captures `/esplora` on mobile 360, mobile 430 and LIM 1920×1080 and rejects horizontal overflow.

Evidence classification:
- ISOLATED — DOCUMENTED_ONLY;
- BEHAVIOURAL — PRESENT;
- RESPONSIVE_VISUAL — PRESENT;
- ACCESSIBILITY — PARTIAL.

Reason for no confirmed promotion beyond REGISTERED:
there is no isolated component evidence surface. Journey evidence is strong, but the v1 maturity chain intentionally does not leapfrog ISOLATED.

### CurriculumTree disclosure

Target:

`src/components/atlas/curriculum-tree.tsx`

Observed:
- product composition uses native `details/summary`;
- F4 covers the `/curricolo` surface across mobile and LIM;
- no isolated component execution was found;
- no component-specific keyboard execution was found.

Evidence classification:
- ISOLATED — DOCUMENTED_ONLY;
- BEHAVIOURAL — DOCUMENTED_ONLY;
- RESPONSIVE_VISUAL — PRESENT;
- ACCESSIBILITY — PARTIAL.

The native disclosure choice is retained; no external primitive adoption is implied.

## 3. Docente OS — exact evidence baseline

Repository:

`antoniocorsano-boop/docente-os-2026-27`

Exact head:

`4138d25c9011769794903e4d898f7a34e924ca91`

Verified browser-certification run:

`35830251069` — PASS.

The selected-gates job on this exact head executed:
- Human + Visual Acceptance;
- generated/enforced HVA acceptance receipt;
- WCAG 2.2 AA automated assurance;
- P6 performance baseline.

The HVA surface set includes `/orario` and the main application surfaces.

### AppShell

Target:

`product/src/components/app-shell/app-shell.tsx`

Canonical architecture:

`docs/architecture/X2_PROFESSIONAL_APPSHELL.md`

The architecture marks X2 COMPLETE and documents:
- shared AppShell;
- responsive sidebar/bottom navigation;
- command palette;
- Radix Dialog + cmdk sourcing.

Executable evidence on the exact head:
- accessibility E2E verifies that the first Tab exposes the skip link and Enter moves focus to `#dos-main-content`;
- HVA captures principal surfaces and rejects horizontal overflow;
- WCAG 2.2 AA automated assurance runs in the same browser-certification job.

Evidence classification:
- ISOLATED — DOCUMENTED_ONLY;
- BEHAVIOURAL — PRESENT;
- RESPONSIVE_VISUAL — PRESENT;
- ACCESSIBILITY — PRESENT.

Result:
confirmed maturity remains REGISTERED; candidate reaches ACCESSIBILITY. This is intentional until an isolated component evidence surface exists.

### Alert / status

Target:

`product/src/components/ui/alert.tsx`

Observed:
- reusable component;
- `role="status"`;
- canonical accessibility rules distinguish `status` from urgent `alert`.

No isolated component execution and no component-specific responsive evidence were found.

Evidence classification:
- ISOLATED — DOCUMENTED_ONLY;
- BEHAVIOURAL — PARTIAL;
- RESPONSIVE_VISUAL — NOT_OBSERVED;
- ACCESSIBILITY — DOCUMENTED_ONLY.

### Timetable interactive cells

Target:

`product/src/app/orario/TimetableGrid.tsx`

Observed:
- semantic table roles;
- interactive cells are native buttons with accessible labels;
- Escape closes focused context/editor state;
- context/editor surfaces expose dialog semantics;
- `/orario` is included in the HVA and WCAG surface set.

Executable evidence:
- HVA/visual coverage on run `35830251069`;
- WCAG 2.2 AA automated assurance on the same run.

The existing model tests verify timetable data/row semantics but are not treated as isolated UI-component evidence.

Evidence classification:
- ISOLATED — DOCUMENTED_ONLY;
- BEHAVIOURAL — PARTIAL;
- RESPONSIVE_VISUAL — PRESENT;
- ACCESSIBILITY — PRESENT.

## 4. Arena — no synthetic upgrade

Arena governed Dialog/Tabs remain confirmed BEHAVIOURAL.

PR #341 provides:
- isolated Storybook stories;
- behavioural tests;
- Product CI.

The same exact-head Product CI does not execute a component-specific Storybook visual/accessibility gate. The presence of `@storybook/addon-a11y` is infrastructure, not executed proof.

Therefore this slice does not promote:
- `ARENA.DIALOG_CONFIRM.GOVERNED` to RESPONSIVE_VISUAL or ACCESSIBILITY;
- `ARENA.TABS.GOVERNED` to RESPONSIVE_VISUAL or ACCESSIBILITY.

Required next proof:
component-specific responsive/visual execution and accessibility execution on a single exact head.

## 5. Control Center — no synthetic upgrade

The current contextual-help implementation supports:
- hover/focus/click opening;
- close button;
- Escape dismissal;
- bounded mobile width.

However it remains page-local and lacks isolated evidence plus explicit focus-entry/return/containment qualification.

Therefore `CONTROL_CENTER.CONTEXT_HELP.FAMILY` remains confirmed REGISTERED.

Next action remains CS-S1 / bounded native-vs-primitive qualification.

## 6. Registry effect

The registry expands from 6 to 11 component/pattern targets.

New product coverage:
- Atlas: 2 targets;
- Docente OS: 3 targets.

This closes the machine-addressability gap for product presence, not the evidence-quality gap.

## 7. Non-authorizations

This receipt does not authorize:
- component migration;
- dependency adoption;
- lifecycle promotion to STABLE;
- product runtime change;
- React/Storybook standardization across products;
- DOS-A1;
- Docente OS → Atlas publication;
- automatic maturity promotion.
