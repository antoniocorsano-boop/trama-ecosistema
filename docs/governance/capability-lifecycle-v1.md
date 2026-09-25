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

## Definition of Done: G2 Governance

G2 requires explicit resolution of:

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

## Documentation consistency rule

A system change is incomplete when it changes behaviour, contracts, authority, data, states or user-visible semantics without updating the corresponding canonical capability documentation.

Automated checks SHOULD detect, where mechanically possible, capability changes without corresponding documentation/status changes. Such checks are evidence gates; they do not autonomously approve a capability.

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