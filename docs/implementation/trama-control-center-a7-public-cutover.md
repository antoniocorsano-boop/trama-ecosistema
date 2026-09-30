# TRAMA Control Center — A7 Public Cutover Preflight

**Document ID:** TRAMA-CC-APP-A7-CUTOVER-01  
**Status:** PREFLIGHT / NO_CUTOVER / READ_ONLY  
**Parent:** TRAMA-CC-APP-ARCH-01 · TRAMA-CC-APP-MIGRATION-01 · TRAMA-CC-APP-A6-PWA-PARITY-01  
**Production impact:** NONE  
**Public cutover:** NOT_AUTHORIZED  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

A7 prepares the public cutover of the modular Control Center without changing the public entrypoint before an explicit Public Cutover Human Review.

The preflight must prove that the production switch is reversible, observable and exact-head bound.

## 2. Entry criteria

A7 preflight may start only when:

- A6 is QUALIFIED;
- A6 Product Parity Human Review is PASS;
- A6 is integrated on main;
- the canonical roadmap records A6 as integrated;
- the canonical ecosystem snapshot is synchronized.

Current A6 baseline:

`fffefc16f287bd1e63b0e3dde2e117e24be3ac8a`

## 3. Required cutover package

Before Public Cutover Human Review, A7 SHALL materialize:

1. current Render production service identity and configuration;
2. current public entrypoint/build command/publish path;
3. target modular build command/publish path;
4. explicit legacy fallback path retained for rollback;
5. deploy rollback procedure;
6. exact-head binding for the candidate;
7. pre-cutover smoke plan;
8. post-cutover smoke plan;
9. deploy receipt schema/record;
10. rollback receipt schema/record;
11. evidence that the Control Center remains READ_ONLY;
12. evidence that browser GitHub authority remains false;
13. PWA/offline/CSP/accessibility parity evidence inherited from A6 and rechecked on public deployment.

## 4. Cutover sequence

The only authorized sequence is:

1. qualify this preflight package;
2. inspect the real Render service and record its current configuration;
3. prepare the target configuration without applying it;
4. run repository and build gates;
5. present exact candidate state for **Public Cutover Human Review**;
6. only after explicit PASS, switch the public entrypoint;
7. smoke-test the public deployment;
8. record deploy receipt;
9. if any blocking smoke fails, execute rollback to the preserved legacy path and record rollback receipt.

No step may skip the Human Review gate.

## 5. Rollback invariant

The legacy Control Center SHALL remain reachable through an explicit fallback path during the A7 stability window.

A rollback must not require rebuilding historical source. It must use a known, recorded production-capable legacy target.

Legacy removal is not part of A7 cutover and requires a later reversible cleanup decision.

## 6. Public smoke contract

Post-cutover smoke SHALL cover at minimum:

- public home loads;
- Overview route;
- Maturity route;
- Ecosystem route;
- Evidence route;
- Operations route;
- Assurance route;
- manifest availability;
- service-worker registration;
- offline shell behavior;
- governed-data stale marker behavior;
- strict CSP;
- zero unexpected external runtime requests;
- keyboard navigation;
- 320 CSS px reflow;
- no write authority exposed.

## 7. Fail-closed conditions

Public cutover SHALL NOT occur if any of these are unresolved:

- Render service identity unknown;
- target branch/head not exact-bound;
- legacy fallback unavailable;
- build/publish path unverified;
- A6 evidence invalidated;
- public smoke plan incomplete;
- rollback procedure incomplete;
- browser write authority introduced;
- DOS-A1 state changed;
- Human Review missing.

## 8. Human gate

Current state:

**PREFLIGHT / AWAITING_RENDER_ENVIRONMENT_BINDING**

The Public Cutover Human Review is a separate decision from the authorization to prepare A7.

Until that decision is explicitly recorded:

- Render production configuration SHALL NOT be changed;
- public entrypoint SHALL remain unchanged;
- no public cutover is authorized.


## 9. Exact candidate binding

The current A7 cutover candidate is bound to:

`178f38f8dd71f18a3ae81b5547c5bb1c2c10ff38`

This exact head is the only candidate eligible for the forthcoming Public Cutover Human Review. Any content change after this head invalidates the review binding and requires requalification.

## 10. Rollback procedure

Current production baseline:
- Render service: `trama-control-center`;
- service ID: `srv-dape3shsrm7s73f5krpg`;
- live deploy: `dep-daugbrbrjlhs73crlbsg`;
- live commit: `fffefc16f287bd1e63b0e3dde2e117e24be3ac8a`;
- current build command: `bash scripts/build_control_center_render.sh`;
- publish path: `public`.

Rollback trigger:
- any blocking public smoke failure after cutover;
- missing primary route;
- broken manifest/service-worker behavior;
- governed-data failure;
- unexpected runtime network dependency;
- accessibility blocker;
- write authority exposure.

Rollback action:
1. restore the legacy production build command `bash scripts/build_control_center_render.sh`;
2. keep publish path `public`;
3. deploy the last known-good legacy-capable baseline;
4. verify legacy Home, Maturity and governed data;
5. record a rollback receipt.

The A7 candidate itself also preserves the legacy surface under `/legacy/` during the stability window.

## 11. Receipt contract

A successful cutover receipt SHALL record:
- exact candidate head;
- Render service ID;
- deploy ID;
- deployed commit;
- public URL;
- build command;
- publish path;
- smoke results;
- Human Review decision reference;
- timestamp.

A rollback receipt SHALL additionally record:
- failed smoke condition;
- rollback target deploy/commit;
- rollback completion state.

## 12. Review readiness

Once all repository gates pass on the bound exact head, A7 reaches:

**TECHNICALLY_QUALIFIED / AWAITING_PUBLIC_CUTOVER_HUMAN_REVIEW**

That state still does not authorize a Render mutation.
