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

One sample cannot establish that all didUP exports use the same:
- workbook profile;
- sheet name;
- headers;
- row grammar;
- state literals;
- date representation;
- ordering representation.

**Evidence required:** at least one richer independent export.

### B2 — Round-trip/import semantics

The manual documents import/export but not:
- duplicate handling;
- update vs append behavior;
- partial failure semantics;
- whether an unmodified export reimports cleanly in the target context;
- whether a minimally modified copy is accepted.

**Evidence required:** controlled human-operated import experiments.

## Recommended next evidence package

A second export should ideally contain:

- at least 2 modules;
- at least 2 arguments per module;
- explicit module and argument order values;
- at least one `Svolto` and one `Non svolto` argument;
- at least one non-empty `DATA SVOLGIMENTO`.

This gives maximum information while remaining non-sensitive.

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
