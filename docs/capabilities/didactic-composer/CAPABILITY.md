# CAP-DIDACTIC-COMPOSER — Capability Record

**Name:** TRAMA Didactic Composer  
**Status:** G0/G1/G2 APPROVED · G3 DESIGN APPROVED · G4_IMPLEMENTED · G5_QUALIFIED_OFFLINE  
**Runtime:** NOT_AUTHORIZED  
**Date:** 2026-10-26  
**Owner of shared contract:** TRAMA  
**Decision owner of didactic adoption:** HUMAN / product-local  
**Authority del curricolo:** Arena  
**DOS-A1:** RUNTIME_DEFERRED

## Problem / opportunity

Il docente deve poter trasformare intenzioni, fonti professionali e contesto del curricolo in UDA, attività, lezioni e materiali coerenti senza ricostruire manualmente lo stesso oggetto in Registro Docente, Docente OS, Studio Atlas/Atlas e nei documenti professionali.

Il problema non è soltanto generare contenuti: è mantenere distinti authority, progettazione, preparazione, pubblicazione, svolgimento, consuntivo e valutazione.

## Intended value

- riuso della stessa composizione didattica attraverso proiezioni governate;
- riduzione della duplicazione tra prodotti;
- continuità tra progettazione e lavoro reale in classe;
- provenance/versioning verificabili;
- privacy-first senza student identity nel Composer;
- mantenimento della decisione professionale del docente.

## Actors

- docente;
- Arena come autorità del curricolo;
- Docente OS come teacher-first operational domain;
- Registro Docente come planning/consuntivo/assessment professional domain;
- Studio Atlas come professional pathway authoring domain;
- Atlas come public/learner publication domain;
- Drive come human document workspace/archive;
- Contextual Copilot Core come possibile interaction adapter senza authority.

## Scope v1

- shared capability candidate `didactic.composition.propose@1`;
- structured proposal artifact;
- local human adoption receipt;
- product-local projection contracts;
- privacy class `PROFESSIONAL_NON_PERSONAL`;
- preservation of Arena `APPLICABLE | TRANSITIONAL` applicability;
- execution-observation concept for future Docente OS → Registro continuity.

## Prerequisites discovered during validation

1. **Product identity evolution — satisfied by DC-00.** The governed identity registry now includes `REGISTRO_DOCENTE` and `STUDIO_ATLAS` as distinct first-class identities, with no alias to Docente OS or Atlas.
2. **Drive deferred write slice.** OR-07 v0 permits only `READ_ONLY`/`PROPOSE_ONLY`; Drive export is `WRITE_EXTERNAL`, therefore it is outside the first Composer Core and requires separate governance/write semantics.
3. **Docente OS two-stage projection.** A composition may first be an `UNBOUND_PLANNING_PROPOSAL`; only a product-resolved valid `planBinding` can produce a `BOUND_HUMAN_TASK_CANDIDATE`.
4. **Explicit caller identity.** `OTHER_GOVERNED` is not an authorized v1 caller; a future product must first be registered through governed product-identity evolution.

## Non-goals v1

- central UDA database;
- student accounts;
- automatic publication;
- automatic lesson completion;
- automatic consuntivo;
- automatic grades;
- Registro domain migration;
- Atlas public authoring;
- Drive write inside Core v1;
- DOS-A1 activation;
- runtime authorization.

## Governance decisions

1. Composer is a stateless shared capability, not a product.
2. Shared composition is an immutable/content-addressed artifact version, not a shared mutable store.
3. Adoption is human and product-local.
4. Product projections do not inherit one another's decision state.
5. `PLANNED != PREPARED != PUBLISHED != TAUGHT != RECORDED != ASSESSED`.
6. Arena remains authority for the curricolo and `TRANSITIONAL` is preserved when APPROVED+VIGENTE.
7. Docente OS projection cannot bypass current plan/projection gates.
8. Registro projection starts preview-only and does not force `UdaRecord` → `MasterProgram` migration or fan-out to every class.
9. Studio Atlas is the authoring handoff for new Atlas pathways/experiences; Composer does not publish directly to public Atlas.
10. Drive stores declared human-readable copies only through a separately governed explicit write.
11. Runtime callers are exact governed product ids; no generic or aliased caller inherits authority.

## Privacy / data classification

Composer v1 accepts only `PROFESSIONAL_NON_PERSONAL`.

Student identity, grades, diagnoses, individual behavior notes, health data and identifiable learner submissions are excluded. Any future evidence refs containing protected target-local information remain opaque and are not dereferenced by the Composer.

## Human control impact

**STRENGTHENED.**

The system can propose and prepare projections, but adoption and target-product writes remain explicit human/product decisions.

## Impacted products/contracts

- TRAMA OR-07 Shared Capability Layer;
- TRAMA OR-10 Product Integrations;
- Arena accepted curricolo/planning context contracts;
- Contextual Copilot Core intent/policy/dispatch separation;
- Docente OS Human Task projection recipe / `planBinding`;
- Registro `UdaRecord` / `UdaLesson` and `PlanningStateV1` separation;
- Studio Atlas Product Foundation / Atlas Handoff direction;
- TRAMA Drive federated knowledge rule.

## Evidence / discovery references

- `docs/contracts/trama-shared-capability-layer-contract-v0.md`;
- `docs/contracts/trama-product-integrations-contract-v0.md`;
- `docs/governance/capability-lifecycle-v1.md`;
- `docs/capabilities/atlas-percorsi/product/STUDIO-ATLAS-PRODUCT-FOUNDATION-v0.1.md`;
- `docs/superpowers/specs/2026-10-25-contextual-copilot-intent-discovery-design.md`;
- downstream observed `ARENA_REGISTRO_PLANNING_CONTEXT_V1`;
- downstream observed Registro `2026-10-25-lib-03a-planning-context-bridge-design.md`;
- downstream observed Docente OS Human Task projection contracts.

## Accepted approach

**Shared stateless proposal capability + versioned artifact + product-local adapters.**

## Rejected / deferred approaches

- new central Composer product/store — rejected;
- duplicated product-specific composers — rejected;
- Composer → public Atlas direct publication — rejected;
- Drive as canonical UDA store — rejected;
- alias Registro as Docente OS / Studio Atlas as Atlas — rejected;
- generic `OTHER_GOVERNED` runtime caller — rejected for v1;
- immediate Registro planning-domain migration — deferred/rejected for v1;
- cross-product automatic synchronization — deferred;
- Drive external write in first Core — deferred.

## Open questions

No blocking architecture question remains for DC-00/DC-01 implementation planning.

Implementation-local decisions fixed by the approved plan include the SHA-256 semantic digest, exact governed caller registry and offline fake-adapter qualification. Product adapter transport, UI and later `MasterProgram` mapping remain outside this phase.

## Current gate assessment

### G0 Intake

**APPROVED.** Stable capability ID, actors, problem, scope, non-goals and runtime state are explicit.

### G1 Discovery

**APPROVED.** Relevant product contracts/current downstream constraints were inspected; alternatives, conflicts and negative knowledge are recorded.

### G2 Governance

**APPROVED.** Authority, product identities, privacy, Drive write boundary, runtime and DOS-A1 are explicit; ADR-022 has Human Design Approval.

### G3 Specification

**DESIGN APPROVED.** Request/proposal/adoption/projection semantics and acceptance criteria are materialized. Implementation planning for DC-00/DC-01 is authorized; runtime is not.

### G4 Implementation

**IMPLEMENTED.** DC-00 product identity registry and DC-01 Core contract/fixture/validator/tests are materialized. No product adapter or live provider is included.

### G5 Qualification

**QUALIFIED_OFFLINE.** Governance #2614 / run `40268710812` and Build TRAMA Control Center Bundle #1086 / run `40268710794` are `SUCCESS` on exact implementation candidate `587217440fc5c8bc1893820b879367866d43c76a`, after independent-review hardening. `Test Didactic Composer v1` is 19/19 PASS on that candidate. The refreshed qualification receipt is `docs/evidence/didactic-composer-dc01-qualification.md`.

### G6+ / Runtime

**NOT_AUTHORIZED.** Offline qualification does not authorize live runtime, product adapters, external writes, publication, merge or deploy.

## Canonical design

`docs/superpowers/specs/2026-10-25-trama-didactic-composer-v1-design.md`

## Associated ADR

`docs/decisions/trama-adr-022-didactic-composition-projection-boundary.md`

## Validation evidence

`docs/evidence/didactic-composer-validation-2026-10-25.md`

## DC-01 offline qualification receipt

`docs/evidence/didactic-composer-dc01-qualification.md`

## Human approval receipt

`docs/evidence/didactic-composer-human-design-approval-2026-10-25.md`

## Approved implementation plan

`docs/superpowers/plans/2026-10-25-trama-didactic-composer-dc00-dc01.md`

## Next governed action

DC-00 and DC-01 are qualified offline. The next possible work is a separately governed product-adapter planning slice, beginning from the target product authority and adoption boundary. No product adapter, live provider, external write, Atlas publication, merge or deploy is authorized by this capability record.
