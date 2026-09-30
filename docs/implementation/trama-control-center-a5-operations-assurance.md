# TRAMA Control Center — A5 Operations + Assurance

**Document ID:** TRAMA-CC-APP-A5-OPERATIONS-ASSURANCE-01  
**Status:** QUALIFIED / PREVIEW_ONLY / READ_ONLY  
**Parent:** TRAMA-CC-APP-ARCH-01 · TRAMA-CC-APP-MIGRATION-01 · TRAMA-CC-APP-A4-ECOSYSTEM-EVIDENCE-01  
**Production impact:** NONE  
**Public cutover:** NOT_AUTHORIZED  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

A5 migrates the final pre-parity specialist surfaces into the modular Control Center:

- Operations: operational path + governed semantic timeline;
- Assurance: evidence-backed stakeholder assurance claims.

The legacy production surfaces remain unchanged until A7.

## 2. Operations contract

Operations consumes only the validated snapshot fields:

- `operationalPath.currentActivities`;
- `operationalPath.nextGates`;
- `operationalPath.nextIncrements`;
- `operationalPath.explicitDefers`;
- `operationalPath.unmetDependencies`;
- `timelineEvents`.

The candidate does not infer a parallel roadmap.

Timeline coverage is explicitly presented as `PARTIAL_EXPLICIT`: it is a governed semantic timeline, not a general GitHub activity log.

`DOS-A1` remains explicitly visible as `DEFERRED / RUNTIME_DEFERRED`.

## 3. Assurance contract

Assurance consumes only `assuranceClaims`.

For every requirement it preserves:

- current status;
- target status;
- review authority;
- standard/reference when present;
- assessor when present;
- present evidence kinds;
- missing evidence kinds;
- readiness prerequisite counts;
- limitations;
- external certificate reference when present.

A5 introduces no overall score or compliance percentage.

`FORMALLY_CERTIFIED` is not inferred from a target. Recorded formal-certification evidence requires both:

- `externalCertificateRef`;
- `assessor`.

## 4. Navigation

A5 activates:

- `/operations`;
- `/assurance`.

Overview and AppShell progressive navigation are updated accordingly.

A6 remains the next stage for PWA/security/accessibility/parity qualification. A7 remains the only public-cutover stage.

## 5. Dependency policy

A5 introduces no new npm dependency.

The feature uses existing React/TypeScript primitives plus semantic HTML/CSS.

No table, chart or additional specialist library is admitted because the required behavior does not justify one.

## 6. Browser and accessibility evidence

Qualification covers:

- desktop 1440×900;
- phone / Pixel 7 class;
- LIM 1920×1080.

For both routes:

- axe WCAG A/AA/2.1AA/2.2AA automated scan;
- no horizontal page overflow;
- zero external runtime requests.

## 7. Bundle evidence

Technical qualification head: `d883c924dbe587254c88496276131d00c37992f3`.

Measured:

- entry shell JS: `132125` bytes gzip ≤ `184320`;
- existing A4 graph chunk: `57387` bytes gzip ≤ `256000`;
- total CSS: `7244` bytes gzip ≤ `51200`;
- additional A5 specialist chunk: false.

A5 does not increase architecture guardrails.

## 8. Qualification evidence

- A5 run: `36698832261` — SUCCESS;
- artifact: `11089351441`;
- digest: `sha256:d0e90c3099a50a160cbf9e47c2b6b2c754297600ae72239770a4c85286accea4`;
- unit/component: 21/21 PASS;
- browser: 6/6 PASS;
- axe: PASS;
- zero external runtime requests: PASS;
- A1 regression: PASS (`36698832301`);
- A2 regression: PASS (`36698832244`);
- A3 regression: PASS (`36698832257`);
- A4 regression: PASS (`36698832522`);
- Governance: PASS (`36698832295`).

During qualification a real React hook-order defect in Assurance was found and corrected before qualification. The final evidence applies only after that correction.

## 9. Boundaries

A5 does not:

- modify legacy `control-center/operations.html`;
- modify the legacy Home assurance implementation;
- modify the legacy service worker;
- authorize Render/public cutover;
- query GitHub from the browser;
- introduce repository-write capability;
- infer formal certification;
- introduce an overall score;
- authorize DOS-A1.

## 10. Exit

A5 is **QUALIFIED**.

It authorizes progression to A6 only after integration. A6 requires Product Parity Human Review before A7 may be considered.
