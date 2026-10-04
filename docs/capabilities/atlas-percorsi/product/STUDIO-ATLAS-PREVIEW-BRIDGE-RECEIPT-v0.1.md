# Studio Atlas ↔ Atlas Preview Bridge — Implementation Receipt v0.1

**Status:** CROSS_PRODUCT_BUILD_PASS / EXPERIENCE_ENGINE_PASS / NOT_STUDENT_AUTHORIZED  
**Date:** 2026-10-04

## Exact heads

### TRAMA / Studio Atlas

PR: `#229`  
Exact head: `f2566eb242d933ee946aae6129c71540b69c44f6`

Relevant runs:

- Governance: `37216529818` — PASS
- Studio Atlas — S1 Standalone: `37216529838` — PASS
- **Studio Atlas ↔ Atlas Preview E2E: `37216529916` — PASS**
- Visual Factory — Compute Policy v0.1: `37216529847` — PASS
- Validate TRAMA Ecosystem Snapshot: `37216529878` — PASS

### Curriculum Atlas

PR: `#80`  
Exact head: `62d17e57a0206122e4c79596acafd141417fef71`

Relevant runs:

- Studio Atlas → Atlas Preview v0.1: `37215964248` — PASS
- Experience Engine: `37215964255` — PASS
- Percorsi G2 UX Collaudo: `37215964277` — PASS
- Percorsi RRT-03 Sealed Preauthorization: `37215964282` — PASS
- TRAMA Perceptible Write: `37215964252` — PASS
- R3-F0 visual evidence F1–F5: PASS

Both PRs are mergeable and remain Draft.

## Verified creator journey

The current implementation supports:

`Idea → Storia → Human Story Review → Mondo → World Review → Esperienza → Scene → explicit TRANSFER → Storyboard → Produzione → Prova`.

For **Prova / Vedi come studente**:

1. Studio Atlas validates authoring blockers;
2. Studio Atlas creates an exact preview snapshot and digest;
3. Studio Atlas opens the Atlas lab route;
4. Studio opens the exact Atlas lab origin with a random 192-bit channel;
5. Studio retries the same immutable snapshot for a bounded interval;
6. Atlas validates origin, channel and snapshot before mounting;
7. Atlas returns an ACK bound to the same channel + snapshot ID;
8. Atlas maps the snapshot into `ExperienceDefinition`;
9. Atlas mounts the existing `PathwayRuntimeSurface / ExperienceRuntime`.

## Security/privacy properties verified in code

- authoring content is not placed in the URL;
- random channel nonce only;
- exact target origin;
- exact sender origin;
- non-null opener relationship;
- bounded exact-snapshot retry;
- ACK bound to channel + snapshot ID;
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


## Browser E2E proof

The cross-product qualification runs both applications on **distinct origins**:

- Studio Atlas: `http://127.0.0.1:3100`
- Atlas exact preview candidate: `http://127.0.0.1:3200`

Playwright verifies:

- **Vedi come studente** is enabled only for a structurally ready project;
- the popup URL contains only the 48-hex channel nonce;
- no snapshot/title/content is serialized into the URL;
- Atlas displays the non-student-authorized notice;
- the exact pathway title and first learner scene appear in the real Atlas runtime;
- the stored Studio snapshot remains `studentAuthorized=false`;
- `runtimeAuthorized=false`;
- an explicit `TRANSFER` scene is present.

Result: **PASS**.
