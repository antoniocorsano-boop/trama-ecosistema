# TRAMA Control Center — A7 Public Certification Baseline

**Document ID:** TRAMA-CC-A7-PUBLIC-CERTIFICATION-2026-09-30  
**Status:** PUBLIC_BROWSER_CERTIFICATION_INCOMPLETE  
**Scope:** public A7 deployment verification, read-only  
**Public URL:** https://trama-control-center.onrender.com  
**Repository baseline:** `41bc34c37ecdda577aab6c9b2d226ff44b3d16b0`  
**Render deploy:** `dep-daui5gjbc2fs73cn5ug0`  
**DOS-A1:** `RUNTIME_DEFERRED`

## 1. Purpose

This document consolidates the evidence collected after the A7 public cutover and separates verified product behavior from checks that remain unavailable only because the verification environment cannot perform a live DevTools replay against the Render domain.

Absence of a live replay is recorded as `NOT_VERIFIABLE`, not as a product failure.

## 2. Consolidated status

- `PUBLIC_FUNCTIONAL_SMOKE = PASS`
- `PUBLIC_DEPLOY_INTEGRITY = PASS`
- `PUBLIC_PWA_BUILD = PASS`
- `A6_BROWSER_QUALIFICATION = PASS`
- `PUBLIC_LIVE_DEVTOOLS_REPLAY = NOT_VERIFIABLE`
- Overall: `PUBLIC_BROWSER_CERTIFICATION_INCOMPLETE`

No blocking defect was reproduced.

## 3. Public deployment integrity

Render confirms:

- service: `trama-control-center`;
- service ID: `srv-dape3shsrm7s73f5krpg`;
- branch: `main`;
- build command: `bash scripts/build_control_center_render.sh`;
- publish path: `public`;
- deploy: `dep-daui5gjbc2fs73cn5ug0`;
- deployed commit: `41bc34c37ecdda577aab6c9b2d226ff44b3d16b0`;
- deploy status: `live`.

The Render build log confirms checkout of the exact commit and successful completion with:

- `TRAMA_A7_CANDIDATE_BUILD_PASS`;
- final Render publication state: site live.

## 4. PWA evidence from the real public build

The production Render build generated:

- `dist/manifest.webmanifest`;
- `dist/sw.js`;
- Workbox / `vite-plugin-pwa 1.3.0`;
- `injectManifest` mode;
- IIFE service-worker output;
- 11 precached entries;
- 668.38 KiB precache payload.

Therefore manifest and service-worker generation are proven on the actual deployed build, not only on a local candidate.

## 5. Governed data

The production build confirms successful materialization of:

- `data/ecosystem-snapshot.json`;
- `data/context-packs/project-knowledge.json`.

Observed build evidence:

- `TRAMA_A7_LIVE_COMPONENT_EVIDENCE_MATERIALIZED`;
- `TRAMA_A7_LIVE_PROJECT_KNOWLEDGE_MATERIALIZED`;
- `TRAMA_LIVE_PROJECT_KNOWLEDGE_BUNDLE DEGRADED FRESH DETECTED`.

The Project Knowledge state is therefore a governed degraded/partial state with fresh observation and detected semantic drift. It is not evidence of an application loading failure.

## 6. Invariants preserved

The A7 public-switch contract keeps:

- Control Center read-only;
- no browser GitHub authority;
- no automatic maturity promotion;
- DOS-A1 at `RUNTIME_DEFERRED`;
- legacy fallback retained under `/legacy/`.

The A7 builder publishes the modular application at the root and copies the legacy surface under `/legacy/`.

## 7. Browser qualification inherited from A6

A6 provides browser-level Playwright evidence for:

- manifest availability and PWA installability prerequisites;
- service-worker registration and control;
- offline reload;
- governed-data cache fallback with explicit stale markers;
- 320 CSS px reflow across primary routes;
- canonical visual regression baselines;
- axe accessibility checks;
- route focus behavior;
- zero external runtime requests;
- strict CSP compatibility.

A6 also records that the previously discovered Operations overflow at 320 CSS px was corrected before qualification.

## 8. Residual verification

Exactly one residual verification remains:

`LIVE_BROWSER_REPLAY`

It shall repeat against the public Render domain:

- DevTools console inspection;
- network trace;
- mixed-content and external-domain verification;
- service-worker/offline replay;
- exact viewport replay at 320, 390, 768 and 1440 CSS px.

Current state: `NOT_VERIFIABLE`.

Reason: the browser/runtime available during this verification session could not resolve the Render public domain. This is an environment limitation and does not constitute a reproduced product defect.

## 9. Defects

### Blocking

None reproduced.

### Non-blocking / governed state

`PROJECT_KNOWLEDGE_DEGRADED`

Classification: governed data state, not runtime failure.

The bundle was successfully materialized, but its effective semantic state was reported as degraded/fresh/detected.

## 10. Decision

No A7 product or Render configuration change is justified by the current evidence.

The implementation remains stable on the deployed exact head. The next admissible action is only:

**Run LIVE_BROWSER_REPLAY from an Internet-capable Chromium/Playwright environment.**

A7 implementation shall be reopened only if that replay reproduces a concrete defect.

Machine-readable receipt:

`governance/control-center/trama-control-center-a7-public-browser-certification.json`
