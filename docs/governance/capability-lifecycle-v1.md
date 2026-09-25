# TRAMA Capability Lifecycle v1

**Status:** PROPOSED  
**Scope:** TRAMA, Arena, Atlas, Docente OS  
**Runtime impact:** NONE  
**Human decision required:** YES

## Purpose

This protocol governs how a new capability moves from an idea to an adopted, documented and verifiable part of the TRAMA ecosystem. It prevents direct idea-to-code transitions, undocumented decisions, forgotten cross-product impacts and divergence between implementation and canonical knowledge.

## Governing rule

No new ecosystem capability moves directly from idea to implementation. Every capability is identified, researched, governed, specified, designed, implemented, verified, adopted and evolved through a common lifecycle. Code, decisions, evidence and documentation form one verifiable change unit.

A proposal does not authorize runtime, publication, persistence, cross-product writes or DOS-A1.

## Unit of governance: Capability

A capability is a durable product or ecosystem ability. Pull requests, issues and implementation slices are delivery mechanisms and never replace the capability record.

Each capability receives a stable identifier, for example `CAP-ATLAS-PERCORSI`.

## Lifecycle gates

| Gate | Name | Required outcome |
| --- | --- | --- |
| G0 | Intake | problem, intent, users and initial scope recorded |
| G1 | Discovery | evidence, research, alternatives, assumptions and open questions recorded |
| G2 | Governance | ownership, authority, boundaries, privacy, runtime and ecosystem impacts resolved |
| G3 | Specification | requirements, contracts, data model, states, errors, accessibility and edge cases specified |
| G4 | Design | interaction model and human experience validated before implementation where applicable |
| G5 | Implementation | governed slices implemented without exceeding authorized scope |
| G6 | Verification | automated, functional, accessibility, security and independent evidence complete |
| G7 | Human validation | required human review performed on an exact identifiable version |
| G8 | Adoption | merge/integration complete and canonical documentation/status synchronized |
| G9 | Evolution | feedback, evidence, defects and new needs feed a new governed iteration |

A gate cannot be PASS because work was discussed. Its Definition of Done must be satisfied or an item must be explicitly marked `NOT_APPLICABLE` with rationale.

## Mandatory capability record

Every capability must expose at least:

- capability ID and name;
- lifecycle state and current gate;
- problem and intended value;
- users/actors;
- product owner and authoritative domain;
- impacted products and contracts;
- research/evidence references;
- accepted decisions;
- rejected/deferred alternatives (negative knowledge);
- open questions and assumptions;
- privacy/data classification;
- runtime authorization state;
- accessibility and human-control impact;
- implementation slices and related PRs;
- verification evidence;
- exact version/head for human validation when required;
- last update and next governed action.

## Standard documentation facets

A capability record must cover these facets. They may be separate files or structured sections according to repository scale, but none may silently disappear:

1. vision/problem;
2. research/evidence;
3. requirements;
4. governance/architecture;
5. domain or pedagogical model where applicable;
6. UX/interaction model where applicable;
7. data/privacy/security;
8. validation/evidence;
9. decisions and negative knowledge.

Missing facets are `NOT_APPLICABLE` with an explicit rationale.

## Decision levels

### Product/domain decision (D)
A bounded choice that does not change ecosystem authority or cross-product architecture.

### Specification (SPEC)
A normative description of behaviour, schema, states, contracts or acceptance criteria.

### Architecture Decision Record (ADR)
Required when a change affects one or more of: product boundaries, authority, cross-product contracts, persistence, security/privacy architecture, runtime authorization, ecosystem invariants or deferred capabilities.

## Definitions of Done

### G0 — Intake

- [ ] stable capability ID assigned;
- [ ] problem/opportunity stated without prescribing implementation;
- [ ] intended users/actors identified;
- [ ] expected value stated;
- [ ] initial scope and explicit non-goals recorded;
- [ ] known product/ecosystem touchpoints listed;
- [ ] initial runtime state declared `NOT_AUTHORIZED` unless already governed elsewhere;
- [ ] next discovery action identified.

### G1 — Discovery

- [ ] relevant evidence and research recorded with retrievable sources;
- [ ] applicable normative/domain frameworks identified;
- [ ] user/context assumptions recorded;
- [ ] candidate models or alternatives compared;
- [ ] risks and uncertainties recorded;
- [ ] open questions made explicit;
- [ ] candidate negative knowledge recorded without prematurely marking it final;
- [ ] age, accessibility, inclusion or domain-specific progression considered where relevant;
- [ ] discovery conclusions clearly separated from approved decisions;
- [ ] reviewable G1 evidence package available.

### G2 — Governance

- [ ] owning product/domain identified;
- [ ] authoritative source identified;
- [ ] Arena impact assessed;
- [ ] Atlas impact assessed;
- [ ] Docente OS impact assessed;
- [ ] TRAMA impact assessed;
- [ ] data handled identified and minimized;
- [ ] privacy/security impact classified;
- [ ] human-control impact classified;
- [ ] accessibility implications identified;
- [ ] runtime impact declared;
- [ ] affected contracts identified;
- [ ] ADR need decided;
- [ ] DOS-A1 non-activation explicitly verified when relevant.

### G3 — Specification

- [ ] functional requirements are testable;
- [ ] non-functional requirements are testable;
- [ ] states and state transitions are defined;
- [ ] data model and ownership are defined where applicable;
- [ ] contracts/interfaces are versioned where applicable;
- [ ] failure, empty, loading and recovery states are specified;
- [ ] perceptible feedback for user-initiated writes is specified where applicable;
- [ ] privacy/data minimization requirements are represented in acceptance criteria;
- [ ] accessibility requirements are represented in acceptance criteria;
- [ ] acceptance criteria trace back to approved decisions and evidence;
- [ ] unresolved questions that block implementation are zero.

### G4 — Design

- [ ] user journey/task flow covers the intended capability;
- [ ] information architecture and interaction states are defined;
- [ ] desktop/mobile/responsive behaviour is addressed where applicable;
- [ ] accessibility is considered in interaction and visual design;
- [ ] success, error, waiting and recovery feedback is visible where applicable;
- [ ] design preserves human control and existing authority boundaries;
- [ ] prototype/mockup evidence is available when UI is material;
- [ ] design review findings are resolved or explicitly deferred with rationale;
- [ ] implementation handoff is traceable to G3 requirements.

### G5 — Implementation

- [ ] implementation is divided into bounded governed slices;
- [ ] each slice maps to specification/acceptance criteria;
- [ ] code does not exceed authorized runtime or authority scope;
- [ ] relevant automated tests are added or updated;
- [ ] capability documentation is updated in the same change unit when semantics change;
- [ ] migrations/contracts are backward-safe or explicitly governed;
- [ ] no hidden activation of deferred capabilities occurs;
- [ ] implementation version/head is identifiable.

### G6 — Verification

- [ ] required CI/gates pass on the exact implementation head;
- [ ] functional acceptance criteria are evidenced;
- [ ] accessibility verification is evidenced where applicable;
- [ ] security/privacy verification is evidenced where applicable;
- [ ] cross-product contract verification is evidenced where applicable;
- [ ] perceptible-write behaviour is verified where applicable;
- [ ] regression risks are assessed;
- [ ] independent/third-party review findings are resolved or explicitly recorded;
- [ ] open blocking review threads are zero;
- [ ] verification evidence is linked from the capability record.

### G7 — Human validation

- [ ] exact head/version under review is frozen and recorded;
- [ ] human test/review scope is explicit;
- [ ] required human scenarios are executed;
- [ ] observed behaviour matches intended user experience and governance constraints;
- [ ] findings are recorded with evidence;
- [ ] blocking findings are zero;
- [ ] explicit human decision is recorded as PASS, CHANGES_REQUIRED or REJECTED;
- [ ] a changed head invalidates the previous exact-head PASS unless the change is formally classified as non-impacting by the governing process.

### G8 — Adoption

- [ ] approved change is integrated into the intended canonical branch/product;
- [ ] merge/integration identifier is recorded;
- [ ] canonical capability state is updated;
- [ ] STATUS/ROADMAP/decision registers are synchronized where applicable;
- [ ] contracts and schemas are synchronized where applicable;
- [ ] Knowledge Foundation/Control Center projection can resolve the adopted state from canonical sources;
- [ ] obsolete proposals are marked superseded/closed rather than silently abandoned;
- [ ] next operational/evolution state is explicit.

### G9 — Evolution

- [ ] feedback/evidence source is identified and privacy-compatible;
- [ ] defects, usability findings and new needs are distinguished;
- [ ] new proposals reference the capability and adopted baseline they evolve;
- [ ] negative knowledge is consulted before reopening previously rejected approaches;
- [ ] material changes restart at the earliest affected gate rather than bypassing lifecycle controls;
- [ ] capability history remains reconstructable;
- [ ] next iteration has an explicit governed entry point.

## Gate transition and freshness rule

A capability MUST NOT advance to the next gate while a mandatory item for the current gate is missing, unresolved or stale. `NOT_APPLICABLE` is allowed only with an explicit rationale and is itself reviewable.

A previous PASS is not sufficient when its supporting evidence has become stale because the capability, an affected contract, an authority boundary, a normative dependency or an exact implementation head has materially changed. The capability returns to the earliest gate affected by that change.

Discussion, chat history, an issue label, a pull request state or the existence of code is never by itself evidence that a gate has passed.

## Minimum artifact matrix

| Gate | Minimum durable artifact/evidence |
| --- | --- |
| G0 | capability record with ID, problem, actors, scope, non-goals and next action |
| G1 | research/evidence register, alternatives, assumptions, risks, open questions |
| G2 | governance impact record; D/SPEC/ADR classification; authority/privacy/runtime resolution |
| G3 | versioned specification and acceptance criteria; contracts/schema when applicable |
| G4 | UX/interaction specification and review evidence when applicable |
| G5 | implementation slice references, PR/head, tests and synchronized documentation |
| G6 | verification report linked to exact head and required automated/independent evidence |
| G7 | human validation record with exact head and explicit decision |
| G8 | merge/integration receipt plus synchronized canonical status/decisions/contracts |
| G9 | evolution record linking feedback/evidence to the adopted baseline and next entry gate |

The artifact may be a dedicated file, a governed structured section or a machine-readable record. What matters is durability, source binding, version binding where applicable, and retrievability. Chat-only evidence is insufficient.

## Documentation consistency rule

A system change is incomplete when it changes behaviour, contracts, authority, data, states or user-visible semantics without updating the corresponding canonical capability documentation.

Automated checks SHOULD detect, where mechanically possible, capability changes without corresponding documentation/status changes. Such checks are evidence gates; they do not autonomously approve a capability.

A documentation-consistency check SHOULD fail when a material implementation change advances while the capability record, specification, affected decision/contract or gate state required by the matrix is absent or stale. False-positive escape mechanisms must require an explicit rationale rather than silent bypass.

## Knowledge Foundation / Control Center projection

The Control Center may project this lifecycle read-only. A capability context should expose:

- current state and gate;
- canonical sources;
- decisions;
- negative knowledge;
- open questions;
- constraints;
- evidence and freshness;
- current implementation slice;
- next governed action.

The projection is source-bound and version-bound where applicable. It does not become a new authority and cannot promote states or authorize runtime.

## Negative knowledge

Rejected, superseded, deferred and failed approaches remain retrievable with rationale and evidence. They are not deleted merely because they are no longer active. This prevents repeated investigation and accidental reintroduction of previously rejected solutions.

## First pilot

`CAP-ATLAS-PERCORSI` is the first candidate capability governed with this protocol. It begins at G0/G1. The pedagogical analysis already performed is discovery evidence, not an approved product or architectural decision.

No Atlas Percorsi runtime implementation is authorized by this document.

## Adoption condition

This protocol becomes canonical only after review and explicit human approval through the existing TRAMA governance process. Until then its status is `PROPOSED`.
