# Didactic Composer v1 — Cross-contract validation evidence

**Date:** 2026-10-25  
**Capability:** `CAP-DIDACTIC-COMPOSER`  
**TRAMA baseline inspected:** `d11112434bb45364e7bddbee6d4df1a86f9b351a`  
**Arena baseline inspected:** `d8b1bf43388cb5c4cdcc940b0c558bb128976c4c`  
**Registro Docente baseline inspected:** `38b7f0dd874806aaf56dd0ecef7e93d01ce34039`  
**Docente OS develop baseline inspected:** `1c50c1bc620cdd0b7bafcff0dc5c613367df3298`  
**Atlas baseline inspected:** `c322b07a68d4508ec437941f8688012765e88848`  
**Result:** DESIGN_CANDIDATE_VALIDATED / HUMAN_REVIEW_REQUIRED / RUNTIME_NOT_AUTHORIZED

## Purpose

Validate the proposed Didactic Composer architecture against current ecosystem contracts and product boundaries before any implementation planning or code.

This evidence record is intentionally design-only. It does not authorize merge, deployment, persistence, cross-product write, public publication or DOS-A1.

## Sources inspected

### TRAMA

- `docs/contracts/trama-shared-capability-layer-contract-v0.md`
- `docs/contracts/trama-product-integrations-contract-v0.md`
- `docs/governance/capability-lifecycle-v1.md`
- `docs/decisions/decision-register.json`
- `docs/superpowers/specs/2026-10-25-contextual-copilot-intent-discovery-design.md`
- `docs/capabilities/atlas-percorsi/product/STUDIO-ATLAS-PRODUCT-FOUNDATION-v0.1.md`

### Arena

- `docs/contracts/ARENA_REGISTRO_PLANNING_CONTEXT_V1.schema.json`
- `docs/architecture/ARENA_REGISTRO_PLANNING_HANDOFF_V1.md`
- associated validator/tests on exact observed main.

### Registro Docente

- `src/types.ts`
- `src/planning/types.ts`
- `src/planning/arenaPlanningContext.ts`
- `docs/superpowers/specs/2026-10-25-lib-03a-planning-context-bridge-design.md`

### Docente OS

- Human Task projection recipe contracts and source implementation;
- UDA-only projection contract;
- Class Workspace contract / focused Progetta semantics;
- current `develop` identity inspected separately.

### Atlas / Studio Atlas

- Studio Atlas Product Foundation;
- existing TRAMA Atlas publication/authority decisions;
- current Atlas main identity inspected separately.

## Validation matrix

| Question | Evidence result | Design consequence | Status |
| --- | --- | --- | --- |
| Can Composer become a central product/store? | OR-07/OR-10 say shared layer is not product, database, write authority or orchestrator | Composer must be stateless `PROPOSE_ONLY`; persistence remains product-local | PASS |
| Can one adopted UDA be a shared mutable record? | Product-local ownership forbids central domain state | Use immutable/content-addressed composition version + local receipts | PASS |
| Does Composer own curriculum authority? | Arena remains unique curriculum authority | Composer consumes accepted Arena refs and preserves authority/provenance | PASS |
| Can Arena transition applicability be flattened? | Arena contract supports `APPLICABLE | TRANSITIONAL` | Preserve applicability + regime in request/proposal/provenance | PASS after correction |
| Are Registro/Studio Atlas already OR-07 callers? | v0 caller/product enums do not enumerate them | Add DC-00 contract evolution before real wiring; no aliases | PASS after correction |
| Can Drive export be part of first Core? | OR-07 v0 only `READ_ONLY/PROPOSE_ONLY`; Drive is external write | Defer Drive to separate `WRITE_EXTERNAL` slice | PASS after correction |
| Can Contextual Copilot authorize Composer from intent discovery? | Discovery is not authority; dispatch/policy remain separate | Reuse Core; no second chatbot; intent match never authorizes write | PASS |
| Can Composer directly create Docente OS runtime lesson? | Existing Human Task pipeline binds candidate/plan/provenance and requires human approval | Split unbound planning proposal from bound Human Task candidate | PASS after correction |
| Can a new UDA bypass Docente OS plan binding? | Class/Progetta and Human Task contracts derive execution from canonical plan | No; unbound proposals remain planning-only | PASS |
| Can Composer force Registro migration to `MasterProgram`? | Registro explicitly keeps operational UDA and annual planning domains separate | First adapter targets preview over current operational domain only | PASS |
| Can planning create taught lessons? | No contract supports implicit plan→execution | `PLANNED != TAUGHT`; execution observation is separately teacher-confirmed | PASS |
| Can evidence plan create grades? | Registro grades are student-specific domain records | Explicitly forbidden; assessment plan is only design intent | PASS |
| Can Composer publish directly to public Atlas? | Studio Atlas owns professional authoring; public publication is separate | Composition → Studio Atlas seed → publication candidate → Atlas gate | PASS |
| Can lesson/class state be transferred into Studio Atlas seed? | Studio Atlas is reusable/class-independent and does not own TeachingSession | Seed is minimized/class-independent | PASS |
| Can Drive become source of truth? | ADR-003 federated knowledge rule says Drive stores human docs/copies | Drive copy has no authority; re-import becomes a new source/version | PASS |
| Can student personal data enter Composer? | OR-07 baseline excludes student personal data; architecture is privacy-first | Composer v1 restricted to `PROFESSIONAL_NON_PERSONAL` | PASS |
| Can protected evidence refs be dereferenced by Composer? | Would cross privacy/domain boundaries | Only non-personal refs or opaque target-local refs; no dereference | PASS after correction |
| Does the proposal activate DOS-A1? | DOS-A1 remains explicitly deferred | `RUNTIME_DEFERRED` unchanged | PASS |

## Conflicts found and resolved

### C1 — Product identity gap

Initial concept assumed Registro Docente and Studio Atlas could call the shared envelope as first-class products immediately.

Validation showed OR-07/OR-10 v0 still enumerate the older product set. Treating Registro as Docente OS or Studio Atlas as Atlas would erase real domain boundaries.

**Resolution:** introduce design prerequisite `DC-00` for additive governed product identities. No runtime wiring before that prerequisite is approved and qualified.

### C2 — Drive write classification

Initial concept placed Drive beside other projections from the adopted composition.

Validation showed Core v1 is a `PROPOSE_ONLY` capability and OR-07 v0 does not authorize mutative capability. Current Contextual Copilot Intent Discovery also conservatively excludes `WRITE_EXTERNAL`.

**Resolution:** Drive remains in the user journey but is deferred to a separate explicit external-write contract/slice.

### C3 — Arena transitional regime

Initial request shape was too restrictive because it treated only one applicability state as useful.

Arena's qualified planning context explicitly distinguishes `APPLICABLE` and `TRANSITIONAL`.

**Resolution:** accept and preserve both when authority is `APPROVED`, vigency is `VIGENTE`, and caller acceptance is valid. No silent normalization.

### C4 — Docente OS binding level

Initial wording could be misread as though every adopted composition could be projected directly into the lesson runtime.

Existing Docente OS contracts require exact candidate/source generations, canonical block coherence, `planBinding` and human approval.

**Resolution:** explicitly distinguish `UNBOUND_PLANNING_PROPOSAL` from `BOUND_HUMAN_TASK_CANDIDATE`.

## Selected architecture

```text
accepted Arena context + professional intent/sources
                │
                ▼
    didactic.composition.propose@1
           PROPOSE_ONLY
                │
                ▼
    immutable composition proposal
                │
          human local adoption
                │
     ┌──────────┼──────────────┐
     ▼          ▼              ▼
 Docente OS   Registro      Studio Atlas
 projection  preview        seed/handoff
     │          │              │
 product     product        authoring/review
 gates       gates              │
     │          │              ▼
 execution   consuntivo      Atlas gate
 observation preview

Drive export: separate future WRITE_EXTERNAL slice.
```

## Non-negotiable invariants

1. `PLANNED != PREPARED != PUBLISHED != TAUGHT != RECORDED != ASSESSED`.
2. Human adoption in one product is not global approval.
3. Composer has no canonical domain store.
4. Arena authority is preserved and not rewritten.
5. Product-local writes remain target-owned.
6. Student-personal data do not enter Composer v1.
7. New composition versions do not silently overwrite prior projections.
8. Atlas publication remains explicitly governed.
9. Docente OS runtime requires existing product gates.
10. DOS-A1 remains `RUNTIME_DEFERRED`.

## Builder check

After applying C1–C4 to the design, no remaining question was found that would force an implementer to guess about authority, product ownership, privacy, execution semantics, publication boundary, Drive write classification, or Docente OS plan binding.

The following are implementation-local and intentionally deferred until an implementation plan exists:

- exact digest algorithm qualification;
- concrete local snapshot persistence per consumer;
- transport mechanism;
- UI details;
- later Registro `MasterProgram` mapping;
- manual revision/sync UX.

**Builder-check result: nothing important left for architecture planning.**

## Validation decision

**PASS AS DESIGN CANDIDATE.**

Meaning:

- G0/G1 evidence is sufficient for Human Design Review;
- G2 governance boundary is materially resolved and represented by proposed ADR-022;
- G3 design candidate is coherent enough to plan after approval;
- no product code, schema migration, runtime, deploy, publication or cross-product write is authorized.

## Required next action

Human Design Review of:

1. `docs/superpowers/specs/2026-10-25-trama-didactic-composer-v1-design.md`;
2. `docs/decisions/trama-adr-022-didactic-composition-projection-boundary.md`;
3. this validation record.

Only after explicit approval should the implementation-planning workflow begin.
