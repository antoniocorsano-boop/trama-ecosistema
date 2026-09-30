# TRAMA Component Maturity Visualization v1

**Contract ID:** CC-MAT-VIZ-01  
**Date:** 2026-09-29  
**Status:** IMPLEMENTATION SLICE / READ_ONLY / HUMAN REVIEW REQUIRED  
**Parent:** CC-MAT-COMP-01 · TRAMA-ADR-014 · Control Center v2 UI specification  
**Runtime authority:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

Render the governed component maturity projection already present in `ecosystem-snapshot.json#components` as an interactive Control Center surface without introducing a second maturity model or a parallel data store.

The view exists to help developers, project owners and stakeholders understand:

- which components are registered;
- which evidence stage is confirmed;
- whether a later candidate stage is supported only partially;
- which lifecycle state is declared separately from maturity;
- which evidence classes are still missing.

## 2. Data authority

The visualization consumes only `components[]` from the existing ecosystem snapshot.

It MUST NOT:

- recompute maturity;
- infer lifecycle;
- invent evidence;
- query GitHub directly;
- create an aggregate score;
- convert stages into percentages.

The component maturity projector remains the authority for the derived maturity stage.

## 3. Current rendering strategy

The current Control Center runtime is a static snapshot-first application.

For this slice the visualization uses a small TRAMA-owned SVG renderer in:

`control-center/component-maturity.js`

This avoids adding a charting dependency solely to the current monolithic/static shell.

Apache ECharts remains the planned charting technology in the Control Center v2 architecture when the modular React/Vite runtime is materialized. The data contract is intentionally renderer-independent so the SVG implementation can later be replaced without changing snapshot semantics.

## 4. Visual semantics

Horizontal position represents the discrete evidence stage:

`REGISTERED → ISOLATED → BEHAVIOURAL → RESPONSIVE_VISUAL → ACCESSIBILITY`

Product lanes group components by owning product.

A node marks the confirmed stage.

A dashed connector toward the right represents a candidate stage beyond the confirmed stage.

Lifecycle is encoded separately through node border treatment; legacy/deprecated/retired states use a dashed border.

Source class is encoded by marker shape.

Product color is supplemental only and MUST NOT be the sole carrier of meaning.

## 5. Interaction

The surface supports:

- pointer hover;
- keyboard focus;
- click/tap;
- Enter/Space activation;
- product filtering.

Selection updates a persistent detail panel containing confirmed stage, candidate stage, lifecycle, source class, evidence states, remaining evidence gaps and source provenance.

## 6. Accessibility

The graphical surface is supplemental.

The same filtered component set MUST always be available as a visible equivalent list.

Each graphical node:

- is keyboard focusable;
- exposes a readable accessible name;
- supports Enter and Space;
- does not require pointer hover to obtain essential information.

The page preserves reduced-motion behavior and no essential distinction relies only on color.

## 7. Responsive and PWA behavior

On narrow screens the graphical surface remains horizontally scrollable rather than being compressed into unreadable geometry.

The detail panel stacks below the map.

The equivalent list becomes single-column.

The renderer is included in the PWA shell cache so component maturity remains available with the locally cached snapshot.

## 8. Dependency decision

CC-MAT-VIZ-01 introduces no third-party runtime dependency.

This is deliberate rather than a rejection of ECharts. The existing architecture already identifies Apache ECharts for the future modular charting layer; adoption is deferred until the Control Center build/runtime transition makes tree-shaken package ownership and bundle qualification appropriate.

No CDN dependency is permitted by this slice.

## 9. Acceptance criteria

The slice is qualified when:

1. all snapshot components appear in the unfiltered model;
2. product filtering does not leak components from other products;
3. confirmed and candidate coordinates preserve stage ordering;
4. governed Arena dialog/tabs render at confirmed ACCESSIBILITY with qualificationStatus QUALIFIED;
5. legacy Arena dialog renders confirmed REGISTERED with candidate BEHAVIOURAL;
6. no score or percentage appears in component maturity semantics;
7. an equivalent accessible list is present;
8. the renderer has no direct GitHub/network capability;
9. the renderer is cached by the PWA;
10. Control Center static, JavaScript and bundle validation pass.

## 10. Boundaries

This slice does not authorize:

- component lifecycle promotion;
- evidence promotion;
- ECharts adoption;
- React migration;
- runtime write capability;
- publication authority;
- product changes outside the Control Center;
- DOS-A1.
