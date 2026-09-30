# CAP-DOS-ARGO-SYNC — G1 Closure Assessment v1

**Gate:** G1 — Discovery  
**Status:** NEAR_COMPLETE / BLOCKERS_EXPLICIT  
**Runtime:** NOT_AUTHORIZED  
**Assessment date:** 2026-09-30

## Summary

G1 is substantially complete. The capability now has:

- authoritative manual evidence;
- one real didUP XLS sample inspected read-only;
- a candidate canonical model;
- a candidate delta contract;
- a 35-case test matrix;
- a deterministic reference oracle;
- machine-readable reference fixtures;
- a sample-bound XLS profile candidate;
- explicit negative knowledge and non-goals.

No runtime or persistence has been authorized.

## Evidence closed

- [x] capability problem and actors;
- [x] alternatives and risks;
- [x] privacy/accessibility scope;
- [x] Argo manual evidence;
- [x] real XLS sample;
- [x] initial semantic mapping;
- [x] deterministic delta semantics;
- [x] fail-closed conflict handling;
- [x] baseline-confirmation rule;
- [x] native-first reuse strategy;
- [x] sample-bound XLS profile;
- [x] reviewable G1 evidence package.

## Remaining G1 blockers

### B1 — Format variability

Official Argo documentation now corroborates:
- order fields and numeric semantics at UI level;
- all three execution-state literals;
- user-facing date format `DD-MM-YYYY`;
- selective/additive import behavior at module level.

One real XLS sample still cannot establish binary/profile stability across exports:
- workbook profile;
- sheet name;
- exact headers;
- row grammar;
- BIFF storage type for dates/order.

**Evidence required:** preferably one richer independent export, or equivalent structural evidence.

### B2 — Round-trip/import semantics

The manual documents import/export but not:
- duplicate handling;
- update vs append behavior;
- partial failure semantics;
- whether an unmodified export reimports cleanly in the target context;
- whether a minimally modified copy is accepted.

**Evidence required:** controlled human-operated import experiments.

## Recommended next evidence package

A second export is still the strongest low-risk evidence, but its purpose is now narrower: verify **binary/profile variability**, not rediscover domain semantics already documented officially.

It should ideally contain:
- at least 2 modules;
- at least 2 arguments per module;
- non-empty order values;
- at least one performed state;
- at least one non-empty `DATA SVOLGIMENTO`.

## Round-trip sequence candidate

Only after the richer sample is inspected:

1. export from didUP;
2. hash and archive evidence;
3. re-import the **unmodified** export under human control;
4. record exact UI result and any warnings;
5. verify resulting program state;
6. only if safe, test a minimally modified copy;
7. never automate credentials or browser writes during G1.

## Decision threshold for G2

G1 may advance to G2 when:

- format profile is stable enough to version;
- unknown state/date/order encodings are resolved;
- at least the unmodified round-trip semantics are known;
- duplicate/update uncertainty is either resolved or explicitly carried as a governed constraint;
- no discovery blocker remains that would materially change authority, persistence or adapter design.

## Current decision

**DO NOT ADVANCE TO G2 YET.**

Reason: format variability and external import semantics can still materially alter the adapter strategy and conflict model.

The next action is evidence acquisition, not implementation.
