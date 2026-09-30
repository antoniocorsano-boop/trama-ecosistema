# TRAMA Control Center — A3 Overview + Navigation

**Document ID:** TRAMA-CC-APP-A3-OVERVIEW-01  
**Status:** QUALIFIED / PREVIEW_ONLY / READ_ONLY  
**Parent:** TRAMA-CC-APP-ARCH-01 · TRAMA-CC-APP-MIGRATION-01 · TRAMA-CC-APP-A2-MATURITY-01  
**Production impact:** NONE  
**Public cutover:** NOT_AUTHORIZED  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

A3 migrates the Control Center Home as an orientation and launch surface.

The modular Home must answer:

- where are we;
- what requires attention now;
- what is the next planned front;
- what governed information is available;
- where should the user go for specialist detail.

It must not become an omnivorous dashboard.

## 2. Home parity contract

A3 parity is semantic and orientation parity.

Migrated:

- primary AppShell navigation;
- human-readable Overview;
- R1–R5 orientation;
- blocking decision/gate launch state;
- governed source freshness summary;
- Project Knowledge state;
- current/next focus;
- launch point to Maturity;
- mobile persistent navigation;
- read-only identity.

Intentionally not migrated in A3:

- Ecosystem map;
- Evidence Explorer;
- Operations/timeline;
- Assurance detail;
- public PWA/offline behavior;
- public Render integration.

Those remain owned by A4–A6.

## 3. No false urgency

The Overview domain model derives open decisions only from gates that are both:

- blocking;
- not PASS.

If no such gate exists, the UI explicitly states:

`Nessun gate bloccante aperto.`

The Home must not infer urgency from planned work, deferred capability or partial evidence alone.

## 4. Current orientation semantics

When no phase is ACTIVE or IN_PROGRESS, the Overview identifies the first PLANNED/READY phase as the next planned front.

This is orientation only.

It does not authorize phase activation or runtime work.

## 5. Project Knowledge semantics

The modular Home consumes the emitted Project Knowledge context pack.

A3 treats:

- `PARTIAL`, `DEGRADED`, `STALE` as contextual attention;
- `BLOCKED` / conflict as blocked;
- current/complete states as quiet.

`PARTIAL` is not presented as an error.

The UI reminds the user that Project Knowledge is a governed operational memory layer, not a substitute authority.

## 6. Progressive navigation

Available routes:

- Overview;
- Maturity.

Upcoming specialist destinations remain visible but disabled and stage-labelled:

- Ecosystem — A4;
- Evidence — A4;
- Operations — A5.

No dead links are exposed.

The technical A1 Foundation remains reachable at `/foundation` for regression evidence but is not primary navigation.

## 7. Mobile orientation

At phone width the primary navigation becomes a persistent bottom navigation.

Requirements:

- 48px minimum action height;
- migrated destinations remain actionable;
- non-migrated destinations remain disabled;
- no horizontal page overflow;
- page content reserves bottom space for the persistent navigation.

## 8. Accessibility and browser evidence

A3 qualification runs on:

- desktop 1440×900;
- Pixel 7 class phone;
- LIM 1920×1080.

Qualification covers:

- axe WCAG 2 A/AA + 2.1 AA + 2.2 AA;
- no horizontal overflow;
- zero external runtime requests;
- semantic navigation states;
- Project Knowledge partial-state presentation;
- no false blocking-decision presentation;
- screenshots per viewport.

## 9. Supply-chain boundary

A3 introduces no new dependency.

It reuses the A2-qualified:

- Playwright;
- @axe-core/playwright;
- Vitest;
- Testing Library;
- React Router;
- AJV.

The npm lockfile is unchanged.

## 10. Legacy protection

A3 must not modify:

- `control-center/index.html`;
- legacy service worker;
- legacy mobile navigation;
- legacy Project Knowledge presenter.

The legacy Home remains public production until A7.

## 11. Exit condition

A3 is **QUALIFIED**. Receipt: `governance/control-center/trama-control-center-a3-overview-qualification.json`.

Qualified evidence:

- exact head: `9f8d7e3062ac1990e7a505e04b8253a94283ba58`;
- A3 workflow run: `36693184969` — SUCCESS;
- artifact: `11086642804`;
- artifact digest: `sha256:17f4af77a20e0718ff5d3d02de21805fc7190db17efa46cda01d6cae79acb348`;
- 14/14 unit/component tests PASS;
- 6/6 browser tests PASS;
- axe PASS on desktop, phone and LIM;
- zero external runtime requests PASS;
- initial JS: `127825` bytes gzip ≤ `184320` bytes;
- A1 regression PASS;
- A2 regression PASS;
- Governance PASS;
- Project Knowledge Runtime PASS.

The qualification covered:

- A1 regression;
- A2 regression;
- TypeScript strict typecheck;
- Overview/domain tests;
- production build;
- JS bundle guardrail;
- governed-artifact/security boundary;
- Overview browser qualification on desktop, phone and LIM;
- axe;
- Governance;
- Project Knowledge Runtime;
- ecosystem snapshot consistency.

A3 qualification authorizes progression to A4 only. It does not authorize public cutover.
