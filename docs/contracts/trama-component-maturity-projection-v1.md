# TRAMA Component Maturity Projection v1

**Contract ID:** CC-MAT-COMP-01
**Date:** 2026-09-29
**Status:** IMPLEMENTATION SLICE / READ_ONLY / NO_RUNTIME_AUTHORIZATION
**Parent:** TRAMA-COMPONENT-EVIDENCE-REGISTRY-01 · TRAMA-ADR-014 · Control Center v2 architecture
**Runtime impact:** NONE
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

Project the existing TRAMA Component Evidence Registry into the existing Control Center ecosystem snapshot so that component-level maturity can be represented without creating a parallel state model.

This contract is a projection contract only. It does not change component lifecycle, product runtime, dependency adoption, or product authority.

## 2. Separation of meanings

Three concepts remain strictly distinct:

1. **maturity** — how far a component has progressed through evidence prerequisites;
2. **lifecycle** — governance state such as TRIAL, STABLE or LEGACY;
3. **evidence** — the actual version-bound or documented proof supporting a maturity claim.

Lifecycle MUST NOT be converted into maturity.

A STABLE component without qualifying evidence remains maturity REGISTERED.

## 3. Component maturity stages

The v1 model is discrete and prerequisite-based. It is not a score or percentage.

Stages:

- REGISTERED
- ISOLATED
- BEHAVIOURAL
- RESPONSIVE_VISUAL
- ACCESSIBILITY

The prerequisite chain is ordered. A later evidence type cannot leapfrog a missing earlier stage.

### Confirmed stage

A stage is confirmed only when every prerequisite up to that stage has evidence status PRESENT.

### Candidate stage

A candidate stage may use PRESENT, PARTIAL or DOCUMENTED_ONLY, but still must satisfy the same ordered prerequisite chain.

NOT_OBSERVED and missing evidence stop the candidate chain.

NOT_APPLICABLE does not automatically satisfy a prerequisite in v1; any future exemption requires an explicit governed rule.

## 4. Qualification status

Each projected component exposes one of:

- REGISTERED_ONLY — no evidence chain beyond registration can yet be claimed;
- PARTIAL — some ordered evidence chain exists but accessibility qualification is not fully confirmed;
- QUALIFIED — the ordered chain is confirmed through ACCESSIBILITY.

QUALIFIED is not equivalent to lifecycle STABLE, product readiness, certification, or approval for adoption.

## 5. Snapshot projection

ecosystem-snapshot.json gains components[].

Each item carries:

- componentId;
- product;
- target or semantic pattern;
- lifecycle;
- source class;
- related findings;
- maturity object;
- evidence-status map;
- source reference.

The authoritative source remains governance/ui-development/trama-component-evidence-registry-v1.json.

The snapshot is a derived materialized view.

## 6. Source and freshness

The component registry is added to the declared Control Center snapshot sources.

The snapshot source state must expose its hash and freshness using the same mechanism already used for canonical Control Center sources.

No component evidence is invented by the snapshot builder.

## 7. Visualization contract

This slice does not introduce a charting dependency.

The future maturity visualization reads components[] from the existing snapshot and may encode:

- component/product grouping;
- confirmed maturity stage;
- candidate stage;
- lifecycle;
- source class;
- evidence gaps;
- freshness.

It MUST NOT encode maturity as an overall percentage or reuse lifecycle as a visual quality score.

The existing matrix/list remains the accessible equivalent when a graphical representation is introduced.

## 8. Integrity rules

Projection validation must reject:

- duplicate component IDs;
- invalid lifecycle/source classes;
- invalid maturity stages;
- candidate stage below confirmed stage;
- incomplete evidence-status map;
- missing source reference.

The Control Center integrity projection must also report whether component evidence projection is internally coherent.

## 9. Acceptance case

The current registry must produce conservative results including:

- ARENA.DIALOG_CONFIRM.GOVERNED → confirmed BEHAVIOURAL;
- ARENA.TABS.GOVERNED → confirmed BEHAVIOURAL;
- legacy dialog/tabs → confirmed REGISTERED, candidate BEHAVIOURAL;
- ARENA.TOOLTIP.LEGACY → REGISTERED;
- CONTROL_CENTER.CONTEXT_HELP.FAMILY → REGISTERED.

These results follow the evidence chain and do not infer missing responsive/accessibility evidence.

## 10. Snapshot synchronization and exact-head qualification

The canonical snapshot synchronizer may commit a regenerated snapshot to a pull-request branch.

When that commit is authored by GitHub Actions, GitHub recursion protection can prevent dependent workflows from running again from the workflow token. Therefore:

- the bot-authored synchronization commit is not by itself sufficient final qualification;
- the resulting pull-request head must receive a subsequent human/connector-authored commit or otherwise be explicitly re-triggered through an allowed mechanism;
- final technical review binds only to an exact head on which the required validation workflows actually executed;
- a prior green head must not be reused after snapshot synchronization changes the head.

This rule prevents a generated materialized view from silently invalidating the evidence chain used for final review.

## 11. Boundaries

CC-MAT-COMP-01 does not authorize:

- ECharts or any other new runtime dependency;
- component migration;
- design-system standardization;
- lifecycle promotion;
- product runtime changes;
- publication;
- merge;
- DOS-A1.
