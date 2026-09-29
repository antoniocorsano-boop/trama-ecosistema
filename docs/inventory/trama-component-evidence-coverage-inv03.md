# TRAMA Component Evidence Coverage — INV-03

**Inventory slice:** INV-03  
**Status:** PROPOSED / OBSERVE  
**Date:** 2026-09-29  
**Parent:** TRAMA-COMPONENT-INVENTORY-01 · INV-01 · INV-02  
**Baseline TRAMA:** `eb6d3301fcb1a4dfaf6b544a6efc8f8a54701f46`  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

Map the evidence actually available for reusable UI components and interaction patterns across Arena, Atlas, Docente OS and TRAMA Control Center.

INV-03 distinguishes five evidence classes:
- **ISOLATED** — component story/lab/catalogue evidence;
- **BEHAVIOURAL** — keyboard, focus and interaction evidence;
- **RESPONSIVE_VISUAL** — viewport/reflow/screenshot evidence;
- **ACCESSIBILITY** — automated or human accessibility evidence;
- **LIFECYCLE** — explicit component maturity/deprecation/ownership state.

A documented intention is not counted as equivalent to executed evidence.

This slice does not authorize migration, dependency adoption or runtime change.

## 2. Coverage vocabulary

- **PRESENT** — concrete, current evidence producer or executable evidence exists.
- **PARTIAL** — evidence exists but only for a subset, surface or evidence class.
- **DOCUMENTED_ONLY** — requirement or plan exists, but executable evidence was not identified.
- **NOT_OBSERVED** — no qualifying evidence was identified in the inspected default branch.
- **NOT_APPLICABLE** — evidence class does not meaningfully apply.

## 3. Arena

Observed evidence:
- Storybook 10 configuration;
- Storybook accessibility addon;
- Storybook/Vitest browser integration with Playwright;
- component stories for the governed UI family;
- browser and viewport verification in execution records;
- project documentation recording successful Storybook test recovery.

Coverage:
- isolated component evidence: **PRESENT**;
- keyboard/focus evidence: **PARTIAL**;
- responsive/viewport evidence: **PRESENT**;
- visual regression/evidence: **PRESENT/PARTIAL** depending on component;
- accessibility automation: **PRESENT** at Storybook addon level, broader axe-style CI remains uneven;
- lifecycle status per reusable component: **PARTIAL**.

**INV03-F01 — ARENA HAS THE STRONGEST COMPONENT-LEVEL EVIDENCE BASELINE — MEDIUM**

Interpretation:
Arena should be the first source for a reusable evidence template, but its evidence is not yet uniformly attached to every reusable interaction primitive identified in INV-02.

Required follow-up:
- bind ConfirmDialog/UiConfirmDialog, Tabs/UiTabs, Tooltip and disclosure families to explicit evidence entries;
- distinguish legacy from governed components;
- record deprecation intent without performing migration in INV-03.

## 4. Atlas

Observed evidence:
- repeated Playwright-based viewport and screenshot producers;
- explicit mobile/desktop/LIM visual evidence;
- pathway tests with real keyboard traversal and focus assertions;
- behavioural evidence that screenshots alone are insufficient;
- accessibility contracts requiring semantic, focus, reflow and assistive-technology review.

Coverage:
- isolated component catalogue: **NOT_OBSERVED**;
- keyboard/focus evidence: **PRESENT** for qualified pathways and selected surfaces;
- responsive/viewport evidence: **PRESENT**;
- visual evidence: **PRESENT** at page/journey level;
- accessibility evidence: **PARTIAL/PRESENT** depending on surface;
- lifecycle status per reusable component: **NOT_OBSERVED**.

**INV03-F02 — ATLAS EVIDENCE IS JOURNEY-STRONG BUT COMPONENT-ISOLATION-LIGHT — MEDIUM**

Interpretation:
Atlas should not adopt Storybook merely to match Arena. The gap is evidence addressability for reusable primitives, not a mandatory tool choice.

Required follow-up:
- define an equivalent lightweight component evidence surface only where reusable primitives justify it;
- preserve the current journey-first visual and keyboard qualification.

## 5. Docente OS

Observed evidence:
- canonical design-system accessibility requirements;
- responsive AppShell architecture;
- runtime keyboard handling in timetable and app-shell interactions;
- planned/evolving Playwright coverage in architecture documentation.

Not observed on the inspected default branch:
- Storybook or equivalent isolated component catalogue;
- a screenshot/visual evidence producer comparable to Arena/Atlas;
- broad automated component-level accessibility evidence.

Coverage:
- isolated component evidence: **NOT_OBSERVED**;
- keyboard/focus evidence: **PARTIAL**;
- responsive evidence: **PARTIAL/PRESENT** at architecture/runtime level;
- visual regression/evidence: **NOT_OBSERVED**;
- accessibility evidence: **DOCUMENTED_ONLY/PARTIAL**;
- lifecycle status per reusable component: **PARTIAL** through architecture documents, not a machine-readable component register.

**INV03-F03 — DOCENTE OS HAS A COMPONENT EVIDENCE GAP DESPITE A SOUND PRIMITIVE SUPPLY CHAIN — HIGH**

Interpretation:
INV-02 showed that Radix/cmdk sourcing is appropriate. INV-03 shows that sourcing quality and evidence quality are separate questions.

Required follow-up:
- add bounded evidence for AppShell, dialog/command palette, Alert/status and timetable interactive cells;
- prefer the smallest evidence surface compatible with the existing Next.js stack;
- do not introduce a visual library merely to obtain evidence.

## 6. TRAMA Control Center

Observed evidence:
- governed UI evidence contract and validator;
- named evidence producers including GitHub Actions, Playwright, axe and human governance review;
- viewport screenshot validation for prior rendered prototypes;
- human-readable validation records.

Coverage:
- isolated component catalogue: **NOT_OBSERVED**;
- keyboard/focus evidence: **PARTIAL**;
- responsive/viewport evidence: **PRESENT**;
- visual evidence: **PRESENT** for selected prototypes/surfaces;
- accessibility evidence: **PARTIAL**;
- lifecycle status per reusable component: **NOT_OBSERVED**.

**INV03-F04 — CONTROL CENTER HAS EVIDENCE INFRASTRUCTURE WITHOUT COMPONENT-LEVEL ADDRESSABILITY — HIGH**

Interpretation:
This matters directly for CS-S1. The contextual-help spike must produce evidence that is attributable to the exact candidate primitive, not only to the page containing it.

Required follow-up:
- CS-S1 must emit keyboard/focus/mobile/accessibility evidence per candidate;
- evidence must remain product-local and bounded;
- no global component library adoption is implied.

## 7. Cross-product findings

**INV03-F05 — COMPONENT LIFECYCLE STATE IS NOT CONSISTENTLY MACHINE-ADDRESSABLE — HIGH**

Across products, reusable components are not consistently labelled with a common evidence-oriented lifecycle such as:
- CURRENT;
- LEGACY;
- EXPERIMENTAL;
- DEPRECATED;
- SPECIALIST;
- NATIVE.

INV-03 does not impose one runtime implementation. It requires an evidence registry capable of referring to the component/pattern and its lifecycle state.

**INV03-F06 — EVIDENCE TYPE MUST BE EXPLICIT — HIGH**

A screenshot, a static contract assertion, an automated keyboard test and a human assistive-technology review are not interchangeable.

Future component evidence records should state:
- producer;
- evidence type;
- exact component/pattern target;
- exact commit or build;
- viewport/input when relevant;
- result;
- whether human review is still required.

**INV03-F07 — NO ECOSYSTEM-WIDE STORYBOOK REQUIREMENT — LOW**

Storybook is effective in Arena, but Atlas, Docente OS and Control Center may use equivalent evidence surfaces. The contract is evidence quality and addressability, not tool uniformity.

## 8. Coverage summary

| Product | Isolated | Keyboard/focus | Responsive/visual | Accessibility | Lifecycle |
| --- | --- | --- | --- | --- | --- |
| Arena | PRESENT | PARTIAL | PRESENT | PARTIAL/PRESENT | PARTIAL |
| Atlas | NOT_OBSERVED | PRESENT on qualified surfaces | PRESENT | PARTIAL/PRESENT | NOT_OBSERVED |
| Docente OS | NOT_OBSERVED | PARTIAL | PARTIAL | DOCUMENTED_ONLY/PARTIAL | PARTIAL |
| Control Center | NOT_OBSERVED | PARTIAL | PRESENT on selected surfaces | PARTIAL | NOT_OBSERVED |

## 9. Governed next actions

1. Define a small machine-readable component evidence registry schema.
2. Bind INV-02 high-risk interaction families to explicit evidence targets.
3. Use Arena as the reference implementation for isolated evidence, not as a mandatory tool stack.
4. Preserve Atlas journey-first testing while adding component addressability only where useful.
5. Add bounded Docente OS evidence for existing primitives before changing dependencies.
6. Require CS-S1 to compare candidate contextual-help primitives with per-candidate evidence.
7. Keep human assistive-technology review distinct from automation.

## 10. Boundary

INV-03 authorizes:
- inventory;
- evidence modelling;
- validators;
- future bounded evidence work.

INV-03 does **not** authorize:
- component migration;
- runtime replacement;
- dependency adoption;
- visual standardization across products;
- automatic promotion to production.

Next governed slice should materialize the minimum evidence registry/contract and then apply it to the highest-risk INV-02 targets.
