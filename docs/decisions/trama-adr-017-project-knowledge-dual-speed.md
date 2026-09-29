# TRAMA-ADR-017 — Project Knowledge dual-speed: Governed Core + Live Overlay

**Stato:** PROPOSED  
**Data:** 2026-09-29  
**Perimetro:** TRAMA · Arena · Atlas · Docente OS  
**Runtime:** NO NEW WRITE AUTHORITY / NO AUTO-PROMOTION

## Contesto

ADR-015 defines the Control Center as a read-only Project Knowledge Base and Context Provider. The qualified RepositoryObservation promotion path subsequently demonstrated that live repository evidence can be collected, bound, reviewed and promoted safely.

The first complete production cycle also exposed a structural inefficiency: promoted repository heads and open-PR state become obsolete after normal repository activity. Re-promoting the whole observation after each merge would create governance work for changes that are merely operational facts.

## Decision proposed

TRAMA SHALL separate:

1. **Governed Core** — durable semantic knowledge requiring normal governance boundaries;
2. **Live Observation Plane** — ephemeral read-only volatile repository state;
3. **Effective Context View** — a derived composition of the two.

Repository heads, PR state, CI/deployment state and similar operational facts SHALL NOT require governed promotion merely because they changed.

A promoted RepositoryObservation remains valid as a governed checkpoint/historical evidence, not as the sole mechanism for representing live current state.

## Semantic drift

Head drift and semantic drift are distinct.

The source registry SHOULD evolve to declare machine-readable semantic anchors for authoritative sources. The live observation layer may compare anchor fingerprints read-only.

- head drift alone: operational;
- semantic-anchor drift: re-verification signal;
- neither condition creates authority automatically.

## Promotion boundary

Governed promotion remains required for:
- durable KnowledgeEvents;
- authority/contract/policy changes;
- semantic closures or deferments;
- intentional milestone/audit checkpoints;
- retained negative knowledge.

It is not required only to refresh volatile repository metadata.

## Human control

**STRENGTHENED.**

The design reduces approval fatigue while keeping strong review exactly where decisions, authority, contracts or irreversible semantic state change.

## Compatibility

- ADR-003 authority federation remains unchanged.
- ADR-014 observatory semantics remain unchanged.
- ADR-015 remains the foundation for Project Knowledge and Context Provider behavior.
- Existing RepositoryObservation promotion evidence is preserved.
- Existing collector/write-actor credential separation is preserved.
- GitHub App remains unnecessary.
- DOS-A1 remains `RUNTIME_DEFERRED`.

## Non-goals

This ADR does not:
- authorize runtime mutation;
- authorize automatic promotion;
- authorize automatic review or merge;
- replace domain authorities;
- introduce student data;
- require persistent polling.

## Qualification gates

Before implementation:
1. contracts for LiveRepositoryOverlay and EffectiveProjectContext;
2. semantic-anchor model and negative fixtures;
3. deterministic composer tests;
4. partial/unavailable live-source behavior;
5. proof that ordinary head drift does not require promotion;
6. proof that semantic drift does not auto-authorize or auto-promote;
7. independent technical review;
8. HUMAN EXACT-HEAD REVIEW — PASS.

## Reference

- `docs/architecture/trama-project-knowledge-dual-speed-v2.md`
- `docs/decisions/trama-adr-015-project-knowledge-context-provider.md`
- `docs/architecture/trama-repository-observation-promotion-v1.md`
