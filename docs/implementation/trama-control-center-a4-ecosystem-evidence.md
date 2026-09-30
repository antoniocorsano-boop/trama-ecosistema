# TRAMA Control Center — A4 Ecosystem + Evidence

**Document ID:** TRAMA-CC-APP-A4-ECOSYSTEM-EVIDENCE-01  
**Status:** QUALIFIED / PREVIEW_ONLY / READ_ONLY  
**Parent:** TRAMA-CC-APP-ARCH-01 · TRAMA-CC-APP-MIGRATION-01 · TRAMA-CC-APP-A3-OVERVIEW-01  
**Production impact:** NONE  
**Public cutover:** NOT_AUTHORIZED  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

A4 migrates two specialist surfaces into the modular Control Center:

- Ecosystem: capabilities and governed relationships;
- Evidence: evidence provenance, freshness, binding and integrity findings.

The legacy `ecosystem.html` and `evidence.html` remain production surfaces until A7.

## 2. Semantic parity contract

A4 preserves the governed distinctions already present in the ecosystem snapshot.

Ecosystem must preserve:

- capability identity, owner, state and runtime state;
- authority relations;
- data-flow relations;
- `FUTURE_NOT_AUTHORIZED` as a distinct non-authorized relation;
- governance, gate and evidence references;
- an accessible list/detail representation equivalent to the graph.

Evidence must preserve:

- evidence ID, type, area, status and source;
- deterministic freshness derived only from governed policy/timestamps;
- capability binding;
- exact-head binding where present;
- confidence;
- integrity checks;
- `NOT_EVALUABLE` distinct from PASS;
- no overall score.

## 3. Graph decision

A4 admits `@xyflow/react` version `12.11.6`.

Class: specialist runtime dependency.  
License: MIT.  
Purpose: interactive read-only ecosystem graph.  
Loading: lazy dynamic chunk only on the Ecosystem route.  
Runtime authority: none.  
External runtime requests: none.  
Fallback/equivalent: always-visible semantic relation list and detail.

The graph is an enhancement, not the sole representation.

Nodes are non-draggable and non-connectable because the Control Center is read-only. Keyboard focus and edge selection remain enabled.

## 4. TanStack Table decision

A4 does **not** adopt TanStack Table.

The current Evidence Explorer needs:

- local filters;
- exact-head search;
- structured cards/details;
- integrity switching.

It does not yet need datagrid-scale grouping, aggregation, virtualization or complex column sorting.

Adoption remains deferred until a future feature demonstrates a behavioral need.

## 5. Routes and progressive navigation

A4 activates:

- `/ecosystem`;
- `/evidence`.

A3 progressive navigation is updated so Ecosystem and Evidence are actionable.

Still upcoming:

- Operations — A5;
- Assurance — A5.

## 6. Bundle architecture

A4 preserves the A0 bundle policy.

Qualified measurements:

- entry shell JS: `130532` bytes gzip ≤ `184320`;
- lazy EcosystemGraph JS: `57386` bytes gzip ≤ `256000`;
- total CSS: `6703` bytes gzip ≤ `51200`;
- graph lazy split: PASS.

A2/A3 regression budget scripts were corrected to measure the initial entry shell rather than summing future lazy chunks. Their 180 KiB limit was not increased.

## 7. Accessibility and browser evidence

A4 qualification covers desktop, phone and LIM.

The Ecosystem surface provides:

- graph keyboard/focus support;
- equivalent relation list;
- explicit labels for authority/data/future-not-authorized;
- selected relation detail;
- no horizontal page overflow.

The Evidence surface provides:

- labelled filters;
- Evidence Explorer / Integrity tab semantics;
- no overall score;
- deterministic integrity presentation.

Automated axe checks run on both routes.

## 8. Dependency and supply-chain closure

`@xyflow/react 12.11.6` is pinned in `package.json` and committed `package-lock.json`.

The temporary lockfile bootstrap:

- wrote only `apps/control-center/package-lock.json`;
- was removed before qualification;
- is absent from the final workflow set.

The final A4 workflow uses `contents: read` only.

## 9. Qualification evidence

Technical qualification head: `601e552389b7cec6c33d4963bde637557dc9baa0`.

- A4 workflow run: `36696727967` — SUCCESS;
- artifact: `11087854631`;
- artifact digest: `sha256:07de7861191be0b5ba712afd5d04c4f34d01c4c9f4bf8db7615ce1610da667dd`;
- unit/component: 17/17 PASS;
- browser: 6/6 PASS;
- axe: PASS;
- zero external runtime requests: PASS;
- canonical viewports: desktop / phone / LIM;
- A1 regression: PASS (`36696727902`);
- A2 regression: PASS (`36696727919`);
- A3 regression: PASS (`36696727904`);
- Governance: PASS (`36696727845`).

## 10. Boundaries

A4 does not:

- modify legacy `control-center/ecosystem.html`;
- modify legacy `control-center/evidence.html`;
- modify the legacy service worker;
- authorize a Render/public cutover;
- query GitHub from the browser;
- introduce write capability into the final workflow;
- introduce an overall score;
- authorize DOS-A1.

## 11. Exit

A4 is **QUALIFIED**.

It authorizes progression to A5 only after integration. It does not authorize public cutover, legacy retirement or product-runtime changes.
