# CAP-DIDACTIC-COMPOSER — Human Design Approval Receipt

**Date:** 2026-10-25  
**Decision:** APPROVE  
**Decision owner:** HUMAN  
**Scope:** architecture + ADR-022 + cross-contract validation  
**Approved candidate SHA:** `97056b05c9a7aa66deeffff13daf705fb91d032a`  
**Runtime:** NOT_AUTHORIZED  
**DOS-A1:** `RUNTIME_DEFERRED`

## Decision

The human design review approves the Didactic Composer v1 architecture materialized in PR #286 at the exact candidate SHA above.

The approved architecture is:

- shared capability `didactic.composition.propose@1`;
- stateless and provider-neutral;
- `PROPOSE_ONLY`;
- immutable/versioned composition artifact;
- product-local human adoption and persistence;
- Arena remains authority for the curricolo;
- Docente OS, Registro Docente and Studio Atlas keep their own domain gates;
- Drive export remains a separate later `WRITE_EXTERNAL` slice;
- `PLANNED != PREPARED != PUBLISHED != TAUGHT != RECORDED != ASSESSED`.

## Approved validation findings

The decision explicitly accepts the corrections found during cross-contract validation:

1. `REGISTRO_DOCENTE` and `STUDIO_ATLAS` require explicit governed product identities before cross-product wiring.
2. They must not be represented as aliases of `DOCENTE_OS` or `ATLAS`.
3. Arena `APPLICABLE | TRANSITIONAL` applicability must be preserved.
4. Docente OS must distinguish `UNBOUND_PLANNING_PROPOSAL` from `BOUND_HUMAN_TASK_CANDIDATE`.
5. Registro begins from `PREVIEW_ONLY`; no automatic write, class fan-out or forced planning-domain migration.
6. New learner experiences go through Studio Atlas authoring and the existing Atlas publication boundary.
7. The Composer does not activate DOS-A1 and creates no new write authority.

## Fail-closed implementation interpretation

The design candidate used `OTHER_GOVERNED` as a forward-looking request placeholder. Implementation v1 MUST NOT treat that placeholder as an authorized caller identity.

A caller is accepted only when its exact product id exists in the governed product identity registry introduced by DC-00. Future products must be added through an explicit governed contract evolution.

This is a restrictive interpretation of the approved design and does not add authority.

## Authorization granted

This approval authorizes **implementation planning** for the bounded sequence:

```text
DC-00 — governed product identity prerequisite
→ DC-01 — Didactic Composer Core contract + offline qualification
```

Canonical plan:

`docs/superpowers/plans/2026-10-25-trama-didactic-composer-dc00-dc01.md`

It does not authorize product adapters, live providers, external writes, merge, deploy, Atlas publication, lesson execution, automatic consuntivo, automatic assessment or DOS-A1.
