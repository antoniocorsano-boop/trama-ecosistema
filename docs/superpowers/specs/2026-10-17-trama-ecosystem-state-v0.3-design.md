# TRAMA Ecosystem State Map v0.3 — Canonical Governed Graph Design

**Data:** 2026-10-17  
**Stato:** DESIGN SPEC / HUMAN-APPROVED DIRECTION / NO RUNTIME AUTHORITY  
**Branch:** `design/trama-ecosystem-state-v0.3`  
**Supersedes as design target:** `governance/access/trama-ecosystem-state-v0.2.json`  
**Does not supersede:** capability lifecycle, maturity, evidence, decision or product authority registries

## 1. Purpose

TRAMA SHALL evolve the existing ACCESS-01 ecosystem state map from a static AS-IS/TARGET evidence model into a canonical governed graph that can simultaneously support:

1. Human Review and architectural orientation;
2. machine-readable ecosystem state;
3. gap-driven roadmap and audit;
4. deterministic Control Center projections;
5. decision support about what work is allowed, unnecessary or premature.

The v0.3 graph is not a wishlist and is not a new overall maturity score. It exists to answer, for every governed node and relationship:

- what exists now;
- what state is proven;
- which authority boundary governs it;
- which maturity evidence applies, if any;
- what evidence supports the state;
- what prevents the target boundary from being real;
- what the approved target is;
- what the next allowed intervention is.

The canonical reading becomes:

```text
AS IS → GAP → TO BE → NEXT ALLOWED INTERVENTION
```

A change that cannot identify the governed gap it closes SHOULD NOT create new ecosystem implementation work.

## 2. Existing authority hierarchy

v0.3 extends the existing v0.2 hierarchy. It does not create a competing source of truth.

Authority remains separated by concern:

| Concern | Canonical authority |
|---|---|
| Ecosystem graph topology and realization state | `governance/access/trama-ecosystem-state-v0.3.json` |
| Capability lifecycle | `status/ecosystem-status.json` |
| Product/domain maturity | `governance/maturity/trama-maturity-reconciliation-v1.json` + evidence registry |
| Evidence qualification | governed evidence registries and exact-head receipts |
| Architectural/product authority | approved contracts, ADRs and product-specific sources |
| Control Center | read-only derived projection only |
| Human visual map | derived view only |

The v0.3 graph MAY reference the other authorities but SHALL NOT manually copy their state in a way that can drift silently.

## 3. Core invariants

### 3.1 Realization state

Nodes and flows retain exactly four realization states:

- `REAL` — implemented and demonstrated within the declared boundary;
- `PARTIAL` — implementation exists but the intended boundary is incomplete or only bounded subsets are demonstrated;
- `DESIGNED` — approved/design-defined boundary exists but runtime realization is not demonstrated;
- `DEFERRED` — explicitly postponed or intentionally inactive by governed decision.

No fifth informal state SHALL be introduced for presentation convenience.

### 3.2 State promotion

A node or flow MAY move toward `REAL` only when retrievable evidence proves exactly the declared boundary.

The following do not independently authorize promotion:

- presence of source code;
- existence of both endpoint products;
- successful unrelated CI;
- a diagram arrow;
- proximity in a UI;
- a maturity score from another domain;
- an implementation plan.

### 3.3 Node state and flow state remain independent

A `REAL` node does not imply any adjacent flow is `REAL`.

Examples that remain valid:

- Docente OS can be `REAL` while Docente OS → Studio Atlas is `DESIGNED`;
- TRAMA Access can be `PARTIAL` while Access → Docente OS remains `DESIGNED`;
- Control Center public can be `REAL` while Control Center privileged remains `DESIGNED`.

### 3.4 Maturity is not realization state

`REAL/PARTIAL/DESIGNED/DEFERRED` and `L0…L5` describe different concerns.

The graph SHALL store `maturityRef`, not a manually duplicated maturity score, wherever a canonical maturity area exists.

A node's `maturityRef` links it to domain maturity context; it SHALL NOT be presented as a node-specific score unless the maturity authority explicitly defines that node as its area.

The Control Center projection MAY resolve the current confirmed level from the maturity authority at snapshot build time.

No overall ecosystem percentage or overall maturity score is authorized.

### 3.5 Authority owner is not implementation owner

Every node and flow SHALL distinguish:

- `authorityOwner` — stable domain identifier when one canonical domain owns the semantic decision boundary;
- `authorityRefs[]` — contracts/ADRs/authority sources that define or constrain the boundary;
- `implementationOwners[]` — product/domain actors permitted to implement the governed delta.

For a genuinely joint cross-product boundary, `authorityOwner` MAY be `null` only when `authorityRefs[]` is non-empty and identifies the governing contract. A free-form composite owner string is not canonical authority.

An integration SHALL NOT transfer product authority merely because another product implements a connector or UI.

### 3.6 DEFERRED requires explicit decision

`DEFERRED` SHALL mean intentionally deferred by a governed decision. It SHALL NOT be used as a synonym for "not done yet".

`DOS-A1=RUNTIME_DEFERRED` remains an invariant.

### 3.7 Control Center remains projection-only

The Control Center SHALL:

- read governed artifacts;
- validate their schema;
- resolve references;
- render views;
- expose provenance and gaps.

It SHALL NOT:

- infer new graph edges;
- promote node/flow state;
- create authority;
- mutate product lifecycle;
- turn maturity into a quality score.

## 4. v0.3 logical schema

The canonical artifact SHALL use schema version:

```text
trama.ecosystem.state/v0.3
```

Minimum top-level structure:

```json
{
  "schemaVersion": "trama.ecosystem.state/v0.3",
  "asOf": "2026-10-17",
  "authorityPolicy": {},
  "legend": {},
  "externalActors": [],
  "nodes": [],
  "flows": [],
  "views": {},
  "transitionPolicy": {}
}
```

### 4.1 External actor contract

User/system actors that participate in flows but are not ecosystem products or services SHALL be declared explicitly rather than invented by a renderer.

Example:

```json
{
  "id": "public",
  "label": "Pubblico",
  "kind": "HUMAN_ACTOR"
}
```

Initial actor vocabulary SHALL include only actors actually referenced by canonical flows, such as `public`, `professional_user`, `governance_operator` and `learner`, when needed.

### 4.2 Node contract

Each node SHALL support:

```json
{
  "id": "stable_id",
  "label": "Human label",
  "plane": "PUBLIC",
  "state": "REAL",
  "targetState": "REAL",
  "boundary": "precise current boundary",
  "authorityOwner": "trama",
  "authorityRefs": ["canonical-authority-ref"],
  "implementationOwners": ["domain"],
  "maturityRef": null,
  "evidenceRefs": ["evidence-id"],
  "blockerRefs": ["blocker-or-gate-id"],
  "gap": {
    "summary": "short governed gap",
    "missing": []
  },
  "target": {
    "boundary": "approved target boundary",
    "value": "why this target matters"
  },
  "nextAllowedIntervention": {
    "action": "NONE",
    "preconditions": [],
    "forbiddenUntil": []
  },
  "sourceRefs": ["canonical source"],
  "lastSignificantChange": null
}
```

### 4.3 Flow contract

Each flow SHALL use the same state/gap/target discipline plus:

```json
{
  "id": "stable_flow_id",
  "from": "node-or-actor-id",
  "to": "node-or-actor-id",
  "kind": "NAVIGATION",
  "state": "DESIGNED",
  "targetState": "REAL",
  "authorityOwner": null,
  "authorityRefs": ["governing-contract-ref"],
  "implementationOwners": ["domain-a", "domain-b"],
  "evidenceRefs": [],
  "gap": {
    "summary": "precise missing boundary",
    "missing": ["proof or capability"]
  },
  "target": {
    "boundary": "approved end-to-end boundary",
    "value": "user/ecosystem value"
  },
  "nextAllowedIntervention": {
    "action": "single governed action",
    "preconditions": [],
    "forbiddenUntil": []
  }
}
```

Allowed flow kinds SHALL be a governed finite vocabulary, initially including `NAVIGATION`, `AUTHENTICATION`, `AUTHORITY`, `DATA`, `AUTHORING`, `PUBLICATION`, `ASSIGNMENT`, `GOVERNANCE` and `OTHER`.

A visual edge SHALL NOT exist unless a corresponding `flows[]` record exists.

## 5. Reference semantics

### 5.1 Evidence

`evidenceRefs[]` SHALL reference evidence records or receipts by stable identifier/path/reference. The graph SHALL NOT embed a second full evidence registry.

Where existing v0.2 evidence is inline, migration MAY normalize it into stable references while retaining exact-head/run provenance.

### 5.2 Maturity

`maturityRef` SHALL point only to an existing canonical maturity area. If no canonical maturity area exists, it SHALL be `null`.

Current relevant maturity authorities as of 2026-10-17 are:

- `governance` — L4 confirmed;
- `arena` — L4 confirmed;
- `atlas` — L4 confirmed;
- `docente-os` — L5 confirmed;
- `studio-atlas` — L1 confirmed.

These values are not copied into the graph as authoritative literals.

### 5.3 Lifecycle

Capability lifecycle remains in `status/ecosystem-status.json`. The graph MAY carry `capabilityRefs[]` where a direct relationship exists.

Lifecycle and graph realization state SHALL NOT be conflated.

## 6. Canonical AS-IS baseline — nodes, 2026-10-17

This matrix defines the intended v0.3 baseline. Implementation SHALL bind every promotion from v0.2 to retrievable evidence before the machine-readable artifact becomes authoritative.

| Node | AS-IS | Target | Authority boundary | Maturity ref | Governed gap | Next allowed intervention |
|---|---|---|---|---|---|---|
| TRAMA Gateway | `REAL` | `REAL` | TRAMA | `null` | Professional destination not yet live; this does not reduce the public boundary | Preserve public safety; enable professional entry only after Access entry certification |
| TRAMA Access | `PARTIAL` | `REAL` | TRAMA | `null` | Runtime and live private store exist, but no completed live professional pilot/session/launcher proof | Complete the bounded live pilot and bind evidence; no federation before pilot qualification |
| Identità professionale TRAMA | `PARTIAL` | `REAL` | TRAMA identity contract | `null` | Provider-neutral contract and live provider infrastructure exist; no live governed identity has yet been demonstrated | Complete one authorized professional identity pilot; preserve issuer+subject authority and data minimization |
| Docente OS | `REAL` | `REAL` | Docente OS teacher-context authority | `docente-os` | No maturity gap currently required for L5 | `NONE` for maturity; product work only when tied to a separate governed gap |
| Arena | `REAL` | `REAL` | Arena curriculum authority | `arena` | L5 evidence gap exists, but product realization is already real | Collect regression-history evidence only when it serves the maturity program; no authority redesign |
| Curricolo Atlas | `REAL` | `REAL` | Atlas publication/navigation; Arena curriculum authority preserved | `atlas` | L5 stability/adoption evidence gap; professional deep-link/federation flows remain separate | Preserve public surface; qualify specific professional flows separately |
| Studio Atlas | `PARTIAL` | `REAL` | Studio Atlas authoring boundary | `studio-atlas` | Canonical cross-product authority contract and subsequent evidence chain are incomplete | Approve/bind the canonical Studio Atlas cross-product authority contract before broader ecosystem promotion |
| Atlas learner | `PARTIAL` | `REAL` | Atlas learner/runtime authority | `atlas` | Bounded learner/preview paths exist; complete governed publication/assignment boundary is not proven | Qualify only the required learner paths; retain privacy-first no-personal-account default |
| Materiali nei prodotti | `REAL` | `REAL` | Product-local authorities | `null` | No node-existence gap; cross-product semantics are a separate contract | Do not reopen product existence; close only cross-product reference/ownership gaps |
| Material Contract ecosistemico | `PARTIAL` | `REAL` | Joint contract; no centralized product ownership | `null` | Shared identity/ownership/provenance/reference semantics are not yet qualified across products | Qualify the cross-product material reference contract without centralizing product ownership |
| Classi e gruppi docente | `REAL` | `REAL` | Docente OS / teacher-context authority | `docente-os` | Teacher-side organization is real; it is not learner identity | Preserve local authority; expose only minimal governed assignment references |
| Assignment verso Atlas | `PARTIAL` | `REAL` | Joint teacher-context / Atlas boundary contract | `null` | Privacy-first end-to-end assignment contract is incomplete | Qualify bounded ticket/code/link semantics before any richer student-data flow |
| Control Center pubblico | `REAL` | `REAL` | TRAMA governance projection boundary | `null` | No authority gap for public read-only transparency | Keep read-only; add v0.3 projection without creating write authority |
| Control Center privilegiato | `DESIGNED` | `REAL` | TRAMA governance protected-operations boundary | `null` | Protected operations, entitlement, step-up/MFA and audit boundary are not runtime-real | No implementation until an explicit protected operation and authority need exists |
| TRAMA governance | `REAL` | `REAL` | TRAMA | `governance` | L5 regression-history gap only | Collect governed stability evidence; do not change authority merely to increase maturity |

### 6.1 TRAMA Access promotion rationale

The v0.2 `DESIGNED` classification is no longer sufficient as of 2026-10-17 because:

- the provider-neutral Phase 2 runtime was implemented, qualified and integrated;
- `apps/access` exists as a real runtime surface;
- a dedicated Supabase project `TRAMA Access` exists in `eu-central-1` and is healthy;
- live Access private-store migrations are applied;
- the live store remains empty of pilot users/principals/entitlements/sessions at the observed baseline.

Therefore the correct realization state is `PARTIAL`, not `REAL`: the implementation boundary exists, while the live professional user journey is not yet demonstrated end-to-end.

Before machine-readable promotion, implementation SHALL persist the current live-provider observation as governed evidence rather than relying on an ephemeral operator observation.

## 7. Canonical AS-IS baseline — flows, 2026-10-17

The human-readable authority-boundary column below MUST be encoded during implementation through `authorityOwner` plus `authorityRefs`; it is not itself a machine authority identifier.

| Flow | AS-IS | Target | Authority boundary | Governed gap | Next allowed intervention |
|---|---|---|---|---|---|
| Public → Gateway | `REAL` | `REAL` | TRAMA public-entry boundary | none within declared public-entry boundary | Preserve regression evidence |
| Gateway → Curricolo Atlas public | `DESIGNED` | `REAL` | Governed TRAMA/Atlas navigation; no curriculum-authority transfer | canonical live navigation not yet promoted by graph evidence | Certify actual navigation before promotion |
| Gateway → Control Center public | `DESIGNED` | `REAL` | TRAMA public navigation | canonical live navigation not yet promoted by graph evidence | Certify actual navigation before promotion |
| Gateway → TRAMA Access | `DESIGNED` | `REAL` | TRAMA professional-entry boundary | Access professional entry not yet qualified as public end-to-end route | Complete Access pilot, then certify Gateway entry |
| Arena → Curricolo Atlas | `REAL` | `REAL` | Arena retains curriculum authority; Atlas is publication/navigation surface | none for governed synchronization boundary | Preserve authority and regression proof |
| Docente OS → Curricolo Atlas | `PARTIAL` | `REAL` | Teacher-context and Atlas presentation boundaries remain distinct | full professional runtime/deep-link path not uniformly certified | Qualify only the explicit teacher journey required |
| Docente OS → Arena | `PARTIAL` | `REAL` | Arena curriculum authority + Docente OS teacher-context authority | governed runtime path not fully proven end-to-end | Close the specific orchestration gap without moving Arena authority |
| Docente OS → Studio Atlas | `DESIGNED` | `REAL` | Cross-product contract required; local authorities preserved | no canonical integrated teacher flow | First bind Studio Atlas authority contract; then qualify a bounded launch/authoring flow |
| Studio Atlas → Atlas learner | `PARTIAL` | `REAL` | Authoring/runtime contract; learner boundary remains Atlas | preview exists but general publication/runtime completeness is unproven | Qualify the minimal publication boundary needed by real journeys |
| Classi/Gruppi → Assignment | `PARTIAL` | `REAL` | Teacher-context targeting authority | canonical privacy-first targeting contract incomplete | Define and qualify minimal assignment reference contract |
| Assignment → Atlas learner | `PARTIAL` | `REAL` | Joint assignment/learner boundary; no learner identity authority exported | bounded ticket/code/link E2E not fully qualified | Demonstrate privacy-first E2E assignment without nominal learner registry |
| TRAMA Access → Docente OS | `DESIGNED` | `REAL` | Access coarse entitlement + Docente OS local authorization | product federation not implemented | After Access pilot, implement first bounded federation pilot; retain Docente OS fine-grained authorization |
| TRAMA Access → Studio Atlas | `DESIGNED` | `REAL` | Access coarse entitlement + Studio Atlas local authority | federation not implemented | Only after Access pilot and Studio Atlas contract qualification |
| TRAMA Access → Curricolo Atlas professional | `DESIGNED` | `REAL` | Access coarse entitlement + Atlas local authority | professional enrichment/federation not implemented | Qualify after Access core pilot; public Atlas remains independent |
| TRAMA Access → Arena | `DESIGNED` | `REAL` | Access coarse entitlement + Arena curriculum authorization | federation not implemented | Qualify after Access core pilot; Arena retains curriculum authorization |
| TRAMA Access → Control Center privileged | `DESIGNED` | `REAL` | TRAMA governance protected-operation authority | no protected runtime authority exists yet | Defer until a concrete protected operation requires entitlement + step-up/MFA |

No additional synthetic flows are authorized by this specification.

## 8. GAP model

Every governed node/flow SHALL contain a `gap` object. For terminal boundaries already equal to target, `gap.missing` MAY be empty and `nextAllowedIntervention.action` MAY be `NONE`.

A non-empty gap SHALL be:

- boundary-specific;
- evidence-testable;
- narrower than the whole product roadmap;
- free of implementation wishlists;
- independent from visual polish unless visual quality is itself the governed acceptance boundary.

A gap SHALL NOT be expressed as generic language such as:

- "improve integration";
- "finish product";
- "make more mature";
- "enhance UX".

Examples of valid gaps:

```text
Access: no live governed professional session/launcher proof
Studio Atlas: canonical cross-product authority contract not approved/bound
Assignment: privacy-first bounded learner handoff not qualified end-to-end
```

## 9. Next Allowed Intervention policy

`nextAllowedIntervention` is a governance guardrail, not a general backlog.

Rules:

1. exactly one primary intervention SHOULD be active for a non-empty gap;
2. prerequisites SHALL be explicit;
3. work blocked by unmet prerequisites SHALL be listed in `forbiddenUntil`;
4. `NONE` is a valid and important value when no ecosystem gap justifies work;
5. closing a gap SHALL trigger graph reassessment before a new intervention is admitted.

This implements the operational principle:

> Do not open work without identifying the real governed gap being closed.

## 10. Derived views

v0.3 SHALL support at least two deterministic views from the same graph.

### 10.1 Full Ecosystem State

Purpose:

- architectural orientation;
- Human Review;
- topology and authority inspection.

Displays:

- all governed nodes;
- all governed flows;
- current realization state;
- planes/authority boundaries;
- evidence and maturity drill-down.

### 10.2 AS IS → GAP → TO BE

Purpose:

- roadmap;
- audit;
- prioritization;
- work-admission decisions.

Default filter:

- show entries where `state != targetState` OR `gap.missing` is non-empty;
- optionally show terminal `REAL` nodes with `nextAllowedIntervention.action = NONE` as explicit "do not reopen" safeguards.

Each row/card SHALL expose:

```text
AS IS | GAP | TO BE | NEXT
```

No manually maintained second dataset is allowed.

## 11. Control Center projection design

The Control Center implementation SHALL consume a generated projection from governed build-side sources.

Recommended chain:

```text
canonical graph v0.3
+ maturity authority
+ capability lifecycle
+ evidence registries
+ decisions/gates
        ↓
deterministic snapshot builder
        ↓
ecosystem-snapshot.json
        ↓
Control Center read-only views
```

The snapshot MAY materialize resolved fields such as:

- current confirmed maturity level;
- evidence summaries;
- blocker/gate labels;
- freshness;
- recent significant change.

Resolved values SHALL retain source references.

The browser SHALL NOT query GitHub, Supabase or product runtimes to infer state.

## 12. Validation requirements

Implementation SHALL add deterministic validation for:

1. schemaVersion is exactly supported;
2. external actor IDs are unique;
3. node IDs are unique;
4. flow IDs are unique;
5. every flow endpoint references an existing node or declared external actor;
6. realization states use only the four canonical values;
7. `DEFERRED` entries include a governed decision reference;
8. `authorityOwner = null` requires non-empty `authorityRefs`;
9. every non-REAL entry whose target differs from current state has a non-empty governed gap;
10. every `maturityRef` resolves to an existing maturity area or is null;
11. evidence references resolve or fail validation;
12. visual/projection edges cannot exceed canonical flows;
13. no overall maturity percentage is generated;
14. `DOS-A1=RUNTIME_DEFERRED` remains enforced;
15. Arena curriculum authority is not transferred by integration metadata;
16. learner paths do not imply personal learner accounts or nominal roster export;
17. Control Center remains read-only/no-auto-promotion.

## 13. State transition protocol

Every significant ecosystem change SHALL be expressible as a graph delta.

Minimum transition record:

```text
subject → previous state → new state → evidence refs → gap closed → target impact
```

A promotion SHALL be reviewable against the exact boundary it claims.

Suggested lifecycle:

```text
implementation/evidence produced
        ↓
graph reassessment
        ↓
state delta proposed
        ↓
validator + governance checks
        ↓
Human Review when authority/security/irreversibility requires it
        ↓
canonical v0.3 update
        ↓
Control Center snapshot regenerated
```

The Control Center regeneration is a consequence of the canonical update, never the source of promotion.

## 14. Significant-change semantics

The graph SHOULD support `lastSignificantChange` only when a source-specific event proves a material change to one of:

- realization state;
- target boundary;
- authority boundary;
- approved gap;
- next allowed intervention;
- existence/removal of a governed flow.

Routine commits, refactors or CI reruns SHALL NOT count as significant ecosystem changes.

## 15. Security and privacy constraints

v0.3 introduces no new runtime authority and no personal-data collection.

The graph and public projection SHALL NOT contain:

- email addresses;
- user identifiers;
- provider secrets;
- Supabase keys;
- student rosters;
- learner identities;
- session tokens.

Live-provider evidence SHALL be reduced to non-personal operational facts needed to prove the boundary.

## 16. Non-goals

This design does NOT authorize:

- automatic graph promotion;
- product federation;
- live TRAMA Access pilot execution;
- Gateway cutover;
- Control Center write operations;
- Control Center privileged implementation;
- learner accounts;
- nominal student tracking;
- DOS-A1 runtime;
- creation of a new maturity model;
- redesign of product roadmaps unrelated to an explicit ecosystem gap.

## 17. Implementation scope after separate plan approval

Once this specification is reviewed and approved, the implementation plan SHOULD cover, in order:

1. create governed JSON Schema for v0.3;
2. materialize `governance/access/trama-ecosystem-state-v0.3.json` from the approved baseline;
3. persist evidence for v0.2→v0.3 state promotions, especially TRAMA Access;
4. add validators and regression tests;
5. extend deterministic snapshot generation without changing authority;
6. implement the Control Center `AS IS → GAP → TO BE` derived view;
7. provide accessible list/table equivalence for any graph representation;
8. generate Human Review evidence;
9. keep v0.2 immutable as historical evidence;
10. require explicit integration/cutover decisions separately.

## 18. Acceptance criteria for v0.3 implementation

The implementation is acceptable only when all of the following are true:

- v0.3 is machine-readable and schema-valid;
- v0.2 remains preserved and meaningfully immutable;
- every node and flow exposes current state, authority boundary, gap, target and next allowed intervention;
- every external actor used by a flow is explicitly declared;
- maturity is referenced, not duplicated as independent truth;
- evidence is reference-based and retrievable;
- TRAMA Access is promoted only with persisted evidence supporting `PARTIAL` and not `REAL`;
- no federation flow is promoted merely because Access runtime exists;
- the `AS IS → GAP → TO BE` view is generated from the same canonical graph;
- the Control Center remains read-only and cannot promote state;
- no synthetic edges appear;
- no overall score/percentage appears;
- privacy-first learner boundaries remain explicit;
- automated validation and required Human Review evidence are green on the exact head;
- no merge, public deploy or runtime cutover occurs without its own explicit decision.

## 19. Design decision

TRAMA Ecosystem State Map v0.3 SHALL be an **evolution of the existing v0.2 canonical graph**, not a second graph system.

Its defining addition is not visual complexity but governed delta semantics:

```text
CURRENT STATE
+ AUTHORITY BOUNDARY
+ EVIDENCE REFERENCE
+ MATURITY REFERENCE
+ GOVERNED GAP
+ TARGET BOUNDARY
+ NEXT ALLOWED INTERVENTION
```

This makes the graph usable as Control Map, audit surface, roadmap constraint and decision instrument while preserving the existing authority architecture.