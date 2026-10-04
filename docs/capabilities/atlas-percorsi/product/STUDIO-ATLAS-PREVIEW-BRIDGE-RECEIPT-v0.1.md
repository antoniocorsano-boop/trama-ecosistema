# Studio Atlas ↔ Atlas Preview Bridge — Implementation Receipt v0.1

**Status:** CROSS_PRODUCT_BUILD_PASS / EXPERIENCE_ENGINE_PASS / NOT_STUDENT_AUTHORIZED  
**Date:** 2026-10-04

## Exact heads

### TRAMA / Studio Atlas

PR: `#229`  
Exact head: `8e7963d0644efeb09a4050771219a5a8f452b082`

Relevant runs:

- Governance: `37212937677` — PASS
- Studio Atlas — S1 Standalone: `37212937630` — PASS
- Visual Factory — Compute Policy v0.1: `37212937619` — PASS
- Validate TRAMA Ecosystem Snapshot: `37212937643` — PASS

### Curriculum Atlas

PR: `#80`  
Exact head: `2a814c2c91bb9e11ae2ec3cbba32f1ba51e8e56e`

Relevant runs:

- Studio Atlas → Atlas Preview v0.1: `37212864434` — PASS
- Experience Engine: `37212864430` — PASS
- Percorsi G2 UX Collaudo: `37212864428` — PASS
- Percorsi RRT-03 Sealed Preauthorization: `37212864492` — PASS
- TRAMA Perceptible Write: `37212864431` — PASS
- R3-F0 visual evidence F1–F5: PASS

Both PRs are mergeable and remain Draft.

## Verified creator journey

The current implementation supports:

`Idea → Storia → Human Story Review → Mondo → World Review → Esperienza → Scene → explicit TRANSFER → Storyboard → Produzione → Prova`.

For **Prova / Vedi come studente**:

1. Studio Atlas validates authoring blockers;
2. Studio Atlas creates an exact preview snapshot and digest;
3. Studio Atlas opens the Atlas lab route;
4. Studio and Atlas perform an origin-bound nonce handshake;
5. snapshot is transferred in memory via `postMessage`;
6. Atlas validates the snapshot;
7. Atlas maps it into `ExperienceDefinition`;
8. Atlas mounts the existing `PathwayRuntimeSurface / ExperienceRuntime`.

## Security/privacy properties verified in code

- authoring content is not placed in the URL;
- random channel nonce only;
- exact target origin;
- exact sender origin;
- exact opener window;
- wildcard postMessage target origin prohibited by CI;
- snapshot is not persisted by Atlas;
- `runtimeAuthorized=false`;
- `studentAuthorized=false`;
- learner identity not required;
- telemetry disabled;
- route remains under `/percorsi/lab/`;
- no public Percorsi catalogue entry.

## Static-export compatibility

The preview bridge is browser-to-browser and therefore does not require an Atlas server API.

It remains compatible with Atlas static-export preview/public channels.

## Compute independence

The learner preview does not depend on Visual Factory GPU availability.

A pathway can therefore be structurally previewed while visual production remains:

**Produzione in attesa**

under the FREE_ONLY compute policy.

## Not yet claimed

This receipt does not claim:

- visual Q3/Q4 assets produced;
- Human Use Review PASS;
- publication candidate accepted;
- public Atlas authorization;
- professional SSO complete;
- remote authoring draft store complete;
- shared/asynchronous preview link.

## Next canonical product step

Use the now-working authoring + preview path on a real canonical pathway, beginning with **MUSEO ZERO**, instead of a technical fixture.

That tranche should:

1. materialise the approved MUSEO ZERO story/world/experience/scenes into Studio Atlas authoring data;
2. mark the explicit transfer scene;
3. prove the direct Atlas learner preview;
4. keep Visual Factory production independently queued under the orchestrator;
5. evaluate the learner experience before further UI expansion.
