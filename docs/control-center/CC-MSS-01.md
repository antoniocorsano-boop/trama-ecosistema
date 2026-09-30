# CC-MSS-01 — Control Center Minimum Serious Set v1

Status: PROPOSED — REVIEW REMEDIATED
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

## 3. Compatibility with snapshot 1.3.0

CC-MSS-01 is an additive evolution of the current `ecosystem-snapshot` contract. Existing `sourceState`, `phases`, `areas`, `capabilities`, `gates`, `evidence`, integrity checks, operational paths and governed timeline remain valid unless a later schema migration explicitly supersedes them.

Stage B MUST NOT duplicate existing gate/evidence semantics. New objects reference existing objects by stable IDs. Migration MUST be backward-readable for existing Control Center consumers during the governed transition.

## 4. Canonical objects

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
- `state`: `ACTIVE | DRAFT | WAITING_HUMAN | BLOCKED | CLOSED | UNKNOWN`
- `entityRefs[]`
- `repository`
- `changeRef` (PR/branch/commit when applicable)
- `exactHead`
- `observedHead`
- `lastActivityAt`
- `observedAt`
- `freshnessStatus`: `FRESH | STALE | UNKNOWN`
- `decisionAuthority`
- `runtimeAuthorization`: `AUTHORIZED | NOT_AUTHORIZED | DEFERRED | NOT_APPLICABLE | UNKNOWN`
- `blockedByRefs[]`
- `nextTransitionRefs[]`
- `evidenceRefs[]`
- `sourceRefs[]`

`exactHead` is the head qualified by governance when one exists; `observedHead` is the current head seen at collection time. A mismatch MUST produce stale/attention state and MUST NOT be silently reconciled.

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
- `state`: `PROPOSED | PENDING_HUMAN | APPROVED | REJECTED | SUPERSEDED | UNKNOWN`
- `authority`
- `subjectRefs[]`
- `rationaleRef`
- `evidenceRefs[]`
- `sourceRefs[]`
- `decidedAt` (nullable unless a decision has actually been made)

### Transition
A governed state transition. CC3-F1 remains the transition authority; the Control Center MUST expose its result and MUST NOT create an independent recommendation engine.

Minimum fields:
- `id`
- `subjectRef`
- `fromState`
- `toState`
- `status`: `ALLOWED | BLOCKED | REQUIRES_HUMAN | DEFERRED | UNKNOWN`
- `gateRefs[]`
- `blockedByRefs[]`
- `decisionAuthority`
- `evidenceRefs[]`
- `sourceRefs[]`

## 5. Authoritative-source and discovery policy

A workstream is included only when supported by an authoritative source or an explicit governed discovery rule. Stage B MUST define those rules before collectors are implemented.

Initial source classes to specify:
- canonical TRAMA status/roadmap/decision/event records;
- governed capability records;
- GitHub pull requests and exact heads for repositories explicitly enrolled in the ecosystem inventory;
- workflow/gate evidence linked to those governed subjects.

Repository enrollment MUST be explicit. The collector MUST NOT crawl arbitrary repositories or infer ecosystem membership from names, prose or conversational context.

If a source cannot be reached, the resulting state is `UNKNOWN`/`STALE` as appropriate; absence of observation is never evidence of closure or PASS.

## 6. Collision semantics

`mayCollide` is an evidence-backed condition, not a heuristic label. Stage B MUST define deterministic collision rules using typed relations and overlapping governed subjects/surfaces.

At minimum, a collision candidate requires source-backed overlap such as:
- two non-closed workstreams changing the same governed entity or contract surface;
- one workstream changing a subject on which another active workstream declares `depends_on`;
- incompatible runtime/authority transitions targeting the same subject.

Text similarity, branch names or shared keywords alone MUST NOT establish a collision.

## 7. Machine-facing minimum view

An agent cold-start view MUST be able to resolve, without reading chat history:

- `current_state`
- `active_workstreams`
- `attention_required`
- `relations`
- `blocked_by`
- `collision_candidates`
- `allowed_next_transitions`
- `decision_authority`
- `runtime_authorization`
- `evidence`
- `freshness`

Every material machine-facing assertion MUST carry or resolve to `sourceRefs`/`evidenceRefs`; unsupported assertions are represented as unknown, not synthesized.

The machine view and human view MUST derive from the same canonical snapshot.

## 8. Human home information contract

The eventual human home MUST answer only four first-level questions:

1. How is the ecosystem now?
2. What requires attention?
3. What work is currently in progress?
4. What governed transition can occur next?

Relations, evidence and timeline are drill-down information, not additional first-level dashboards.

## 9. Invariants

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
- Repository discovery is allowlisted/governed, never open-ended.
- Machine assertions MUST be traceable to source/evidence references.

## 10. Negative cases

The implementation MUST reject or visibly flag at least these cases:

1. Open PR omitted from `active_workstreams` when it matches an enrolled governed workstream discovery rule.
2. `DOS-A1` represented as authorized without an explicit authoritative decision.
3. Transition shown as ALLOWED when a blocking gate is not PASS.
4. Workstream `exactHead` differs from `observedHead` without stale/attention state.
5. Human approval inferred from CI success.
6. Missing evidence represented as confidence HIGH.
7. Relation inferred from display text without a source reference.
8. Same semantic state generating repeated canonical commits because only observation timestamps changed.
9. UI and machine view deriving from different state sources.
10. Control Center inventing a next transition independently of CC3-F1.
11. Unreachable source causing a workstream to be marked CLOSED or PASS.
12. Repository included because its name resembles an ecosystem component without governed enrollment.
13. Collision asserted from textual similarity alone.
14. Decision with `APPROVED` state but no authority/evidence provenance.
15. Material machine assertion emitted without resolvable source/evidence provenance.

## 11. Cold-start qualification

Before UI work is authorized, an independent agent receiving only repository + Control Center data MUST be able to answer with source references:

- What is active now?
- What is waiting for a human?
- What is blocked and by what?
- Which workstreams may collide, and on which deterministic rule/evidence?
- What runtime actions are explicitly not authorized?
- What is the next governed transition for each active workstream?
- Which assertions are stale, unknown or unsupported?

### Mandatory real fixture: Atlas Percorsi G1

The qualification suite MUST include the real governed case represented by TRAMA PR #96 (`Atlas Percorsi G1: CHILD-SAFE, evidence and narrative foundations`). At the observation used for this contract review it is an open Draft PR with runtime `NOT_AUTHORIZED`, no student account/authentication, no server-side personal profile/tracking, and no DOS-A1 activation. The fixture MUST be refreshed from authoritative sources at test time rather than treating this observation as permanently current.

A conforming cold-start result MUST distinguish at least:
- workstream state from capability lifecycle state;
- Draft/open status from human approval;
- runtime `NOT_AUTHORIZED` from implementation activity;
- observed PR head from any previously qualified exact head;
- constraints/evidence from recommendations.

Qualification fails if chat history or undocumented project knowledge is required for these answers.

## 12. Delivery sequence

Stage A — contract (this document): no runtime/UI changes.

Stage B — schema, governed repository enrollment/discovery policy, collision rules and negative fixtures: additive evolution from ecosystem snapshot schema 1.3.0; fail-closed validation.

Stage C — read-only collectors/generator: current work and relations from authoritative sources; no execution authority.

Stage D — cold-start qualification and independent review.

Stage E — human presentation, only after Stage D PASS.

No stage authorizes DOS-A1 or any application runtime change.

## 13. Independent review record

Review target: initial Stage A head `218ee392ad3b241eb13054c610a3b689cb19b115`.

Findings remediated in this revision:
- define compatibility boundary with snapshot schema 1.3.0;
- add explicit governed discovery/enrollment policy;
- distinguish qualified `exactHead` from current `observedHead`;
- add UNKNOWN/STALE fail-closed semantics;
- define evidence-backed collision semantics;
- require provenance for machine assertions;
- make Atlas Percorsi G1 / PR #96 a mandatory real cold-start fixture;
- extend negative cases for source outage, accidental repository discovery, unsupported collision and unproven approval.

Review disposition after remediation: READY FOR RE-CHECK; Stage B remains NOT AUTHORIZED until the remediated exact head passes review.


## 14. OR-07 → OR-10 integrated capability state

Post-merge canonical state as of 2026-09-30:

- OR-07 Shared Capability Layer: `CLOSED / INTEGRATED`;
- OR-08 Runtime Portability: `CLOSED / INTEGRATED / PORTABLE_CONTRACT`;
- OR-09 Qualified Execution Readiness: `CLOSED / PRE_AUTHORIZATION_ONLY`;
- OR-10 Product Integrations: `CLOSED / INTEGRATED / NO_RUNTIME`;
- Human Review seal: TRAMA #210 → merge `6c61e001992c2696496cddee00d668abf2da7fe3`;
- Arena #345, Docente OS #645 and Atlas #66 are integrated product-local boundaries;
- `DOS-A1 = RUNTIME_DEFERRED`;
- live runtime authorization: `NOT_AUTHORIZED`.

Control Center presentation MUST distinguish:
1. capability contract/portability readiness;
2. product integration readiness;
3. human runtime authorization.

A CLOSED/INTEGRATED OR workstream MUST NOT be displayed as runtime-authorized merely because its technical gates are PASS.
