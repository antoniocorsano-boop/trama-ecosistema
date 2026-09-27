# CC-MSS-01 — Control Center Minimum Serious Set v1

Status: PROPOSED
Scope: governance/data contract only
Runtime authorization: NONE
UI authorization: NONE
Decision authority: Human Review

## 1. Purpose

Define the minimum information contract that makes TRAMA Control Center a reliable control plane for both humans and agents without turning it into a second source of authority or a metrics-heavy dashboard.

The Control Center aggregates and explains governed state. Authority remains with canonical ecosystem sources, governance decisions, human gates and the CC3 transition contract.

## 2. Benchmark-derived principles

The contract adopts only mature patterns that solve a demonstrated TRAMA need:

1. Canonical catalog of governed entities.
2. Typed relations and dependency graph.
3. Explicit ownership and decision authority.
4. Current-work representation distinct from lifecycle state.
5. Gates distinct from execution.
6. Evidence provenance and freshness.
7. Governed next transitions distinct from recommendations.
8. Progressive disclosure: machine contract first; human presentation derives from it.

Deferred from v1: DORA metrics, arbitrary maturity scoring, customizable dashboards, generalized notifications, a second transition engine.

## 3. Canonical objects

### Entity
A governed ecosystem object such as TRAMA, Arena, Atlas, Docente OS or a capability.

Minimum fields:
- `id`
- `kind`
- `name`
- `lifecycleState`
- `ownerDomain`
- `decisionAuthority`
- `sourceRefs[]`

### Workstream
A unit of current work. It MUST NOT be inferred solely from capability lifecycle state.

Minimum fields:
- `id`
- `title`
- `state`: `ACTIVE | DRAFT | WAITING_HUMAN | BLOCKED | CLOSED`
- `entityRefs[]`
- `repository`
- `changeRef` (PR/branch/commit when applicable)
- `exactHead`
- `lastActivityAt`
- `decisionAuthority`
- `runtimeAuthorization`: `AUTHORIZED | NOT_AUTHORIZED | DEFERRED | NOT_APPLICABLE`
- `blockedByRefs[]`
- `nextTransitionRefs[]`
- `evidenceRefs[]`

### Relation
A typed, directional relation.

Initial vocabulary:
- `depends_on`
- `publishes_to`
- `governed_by`
- `implements`
- `blocks`
- `supersedes`
- `evidenced_by`
- `works_on`

Minimum fields:
- `id`
- `type`
- `fromRef`
- `toRef`
- `sourceRefs[]`

### Gate
A condition controlling a transition. Existing gate semantics remain authoritative and are extended only where necessary for references to workstreams and transitions.

### Evidence
A verifiable basis for a Control Center assertion. Existing evidence semantics remain authoritative.

### Decision
A governed decision, distinct from state observation.

Minimum fields:
- `id`
- `state`: `PROPOSED | PENDING_HUMAN | APPROVED | REJECTED | SUPERSEDED`
- `authority`
- `subjectRefs[]`
- `rationaleRef`
- `evidenceRefs[]`
- `decidedAt`

### Transition
A governed state transition. CC3-F1 remains the transition authority; the Control Center MUST expose its result and MUST NOT create an independent recommendation engine.

Minimum fields:
- `id`
- `subjectRef`
- `fromState`
- `toState`
- `status`: `ALLOWED | BLOCKED | REQUIRES_HUMAN | DEFERRED`
- `gateRefs[]`
- `blockedByRefs[]`
- `decisionAuthority`
- `evidenceRefs[]`

## 4. Machine-facing minimum view

An agent cold-start view MUST be able to resolve, without reading chat history:

- `current_state`
- `active_workstreams`
- `attention_required`
- `relations`
- `blocked_by`
- `allowed_next_transitions`
- `decision_authority`
- `evidence`
- `freshness`

The machine view and human view MUST derive from the same canonical snapshot.

## 5. Human home information contract

The eventual human home MUST answer only four first-level questions:

1. How is the ecosystem now?
2. What requires attention?
3. What work is currently in progress?
4. What governed transition can occur next?

Relations, evidence and timeline are drill-down information, not additional first-level dashboards.

## 6. Invariants

- Arena remains curriculum authority.
- Atlas remains publication/navigation/learning-object surface.
- Docente OS remains teacher-first operational surface.
- `DOS-A1` remains `DEFERRED` until an explicit human authorization changes it.
- A Control Center observation never grants runtime authorization.
- A PR being open, green or mergeable never implies human approval.
- Human decision and execution remain separate operations.
- A workstream may be ACTIVE while its runtime authorization is NOT_AUTHORIZED.
- Missing data MUST be represented as unknown/incomplete, never inferred as PASS.
- Stale evidence MUST NOT be silently treated as fresh.
- Control Center MUST NOT become an authority competing with canonical sources.

## 7. Negative cases

The implementation MUST reject or visibly flag at least these cases:

1. Open PR omitted from `active_workstreams` when it matches a governed ecosystem workstream.
2. `DOS-A1` represented as authorized without an explicit authoritative decision.
3. Transition shown as ALLOWED when a blocking gate is not PASS.
4. Workstream exact head differs from the observed PR head without a stale marker.
5. Human approval inferred from CI success.
6. Missing evidence represented as confidence HIGH.
7. Relation inferred from display text without a source reference.
8. Same semantic state generating repeated canonical commits because only observation timestamps changed.
9. UI and machine view deriving from different state sources.
10. Control Center inventing a next transition independently of CC3-F1.

## 8. Cold-start qualification

Before UI work is authorized, an independent agent receiving only repository + Control Center data MUST be able to answer with source references:

- What is active now?
- What is waiting for a human?
- What is blocked and by what?
- Which workstreams may collide?
- What runtime actions are explicitly not authorized?
- What is the next governed transition for each active workstream?
- Which assertions are stale or unsupported?

Qualification fails if chat history or undocumented project knowledge is required for these answers.

## 9. Delivery sequence

Stage A — contract (this document): no runtime/UI changes.

Stage B — schema and negative fixtures: additive evolution from ecosystem snapshot schema 1.3.0; fail-closed validation.

Stage C — read-only collectors/generator: current work and relations from authoritative sources; no execution authority.

Stage D — cold-start qualification and independent review.

Stage E — human presentation, only after Stage D PASS.

No stage authorizes DOS-A1 or any application runtime change.
