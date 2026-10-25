# CAP-DIDACTIC-COMPOSER — Capability Record

**Name:** TRAMA Didactic Composer  
**Status:** G0/G1/G2 MATERIALIZED · G3 DESIGN CANDIDATE · HUMAN REVIEW REQUIRED  
**Runtime:** NOT_AUTHORIZED  
**Date:** 2026-10-25  
**Owner of shared contract:** TRAMA  
**Decision owner of didactic adoption:** HUMAN / product-local  
**Curriculum authority:** Arena  
**DOS-A1:** RUNTIME_DEFERRED

## Problem / opportunity

Il docente deve poter trasformare intenzioni, fonti professionali e contesto curricolare in UDA, attività, lezioni e materiali coerenti senza ricostruire manualmente lo stesso oggetto in Registro Docente, Docente OS, Studio Atlas/Atlas e Drive.

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
- Arena come curriculum authority;
- Docente OS come teacher-first operational domain;
- Registro Docente come planning/consuntivo/assessment professional domain;
- Studio Atlas come professional pathway authoring domain;
- Atlas come public/learner publication domain;
- Drive come human document workspace/archive;
- Contextual Copilot Core come possibile interaction/orchestration adapter senza authority.

## Scope v1

- shared capability `didactic.composition.propose@1`;
- structured proposal artifact;
- local human adoption receipt;
- product-local projection contracts;
- privacy class `PROFESSIONAL_NON_PERSONAL`;
- execution-observation concept for future Docente OS → Registro continuity.

## Non-goals v1

- central UDA database;
- student accounts;
- automatic publication;
- automatic lesson completion;
- automatic consuntivo;
- automatic grades;
- Registro domain migration;
- Atlas public authoring;
- DOS-A1 activation;
- runtime authorization.

## Governance decisions

1. Composer is a stateless shared capability, not a product.
2. Shared composition is an immutable/content-addressed artifact version, not a shared mutable store.
3. Adoption is human and product-local.
4. Product projections do not inherit one another's decision state.
5. `PLANNED != PREPARED != PUBLISHED != TAUGHT != RECORDED != ASSESSED`.
6. Arena remains curriculum authority.
7. Docente OS projection cannot bypass current plan/projection gates.
8. Registro projection starts preview-only and does not force `UdaRecord` → `MasterProgram` migration.
9. Studio Atlas is the authoring handoff for new Atlas pathways/experiences; Composer does not publish directly to public Atlas.
10. Drive stores declared human-readable copies, not technical authority.

## Privacy / data classification

Composer v1 accepts only `PROFESSIONAL_NON_PERSONAL`.

Student identity, grades, diagnoses, individual behavior notes, health data and identifiable learner submissions are excluded.

## Human control impact

**STRENGTHENED.**

The system can propose and prepare projections, but adoption and target-product writes remain explicit human/product decisions.

## Impacted products/contracts

- TRAMA OR-07 Shared Capability Layer;
- TRAMA OR-10 Product Integrations;
- Arena accepted curriculum/planning context contracts;
- Contextual Copilot Core intent/policy/dispatch separation;
- Docente OS Human Task projection recipe / planBinding;
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
- downstream observed Docente OS `HUMAN_TASK_PROJECTION_RECIPE.md` and source contract.

## Accepted approach

**Shared stateless proposal capability + versioned artifact + product-local adapters.**

## Rejected / deferred approaches

- new central Composer product/store — rejected;
- duplicated product-specific composers — rejected;
- Composer → public Atlas direct publication — rejected;
- Drive as canonical UDA store — rejected;
- immediate Registro planning-domain migration — deferred/rejected for v1;
- cross-product automatic synchronization — deferred.

## Open questions

No blocking governance question remains for design review.

Implementation-local decisions remain intentionally open: digest algorithm qualification, concrete local snapshot stores, transport, UI and later `MasterProgram` mapping.

## Current gate assessment

### G0 Intake

PASS candidate: stable capability ID, actors, problem, scope, non-goals and runtime state are explicit.

### G1 Discovery

PASS candidate: relevant product contracts and current downstream constraints have been inspected; alternatives and risks are recorded.

### G2 Governance

PASS candidate subject to human review: authority, product boundaries, privacy, runtime and DOS-A1 are explicit; ADR-022 proposed.

### G3 Specification

DESIGN CANDIDATE: request/proposal/adoption/projection semantics and acceptance criteria are materialized in the design spec, but schema/validator implementation is not authorized.

### G4+

NOT STARTED / NOT AUTHORIZED.

## Canonical design candidate

`docs/superpowers/specs/2026-10-25-trama-didactic-composer-v1-design.md`

## Associated ADR candidate

`docs/decisions/trama-adr-022-didactic-composition-projection-boundary.md`

## Next governed action

Human Design Review of the design spec + ADR. If approved, invoke implementation planning; no code before that decision.