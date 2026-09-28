# TRAMA-ADR-016 — Project Knowledge Observation Promotion

Status: PROPOSED

## Context

TRAMA can now produce a valid, bounded, anonymous read-only RepositoryObservation. Project Knowledge needs a durable current projection without giving the collector write authority.

## Decision

Use a separate promotion pipeline:

`evidence -> deterministic promotion proposal -> governed write actor -> PR -> human review -> merge -> materialized views`.

RepositoryObservation evidence has no authority. The merged promotion event records the governance decision that a particular normalized observation became the current Project Knowledge repository-state projection.

The current observation and ProjectContextSnapshot remain derived materialized views.

## Consequences

- collector stays read-only;
- promotion writes are narrow and reviewable;
- history and supersession are explicit;
- same observation digest is idempotent/no-op;
- rollback is a new event, not history deletion;
- automated proposal generation is allowed;
- automated approval/merge is forbidden;
- domain authority of Arena, Atlas and Docente OS is unchanged.
