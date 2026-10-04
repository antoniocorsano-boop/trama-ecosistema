# Studio Atlas ↔ Atlas Preview Bridge — Implementation Receipt v0.1

**Status:** CROSS_PRODUCT_BUILD_PASS / EXPERIENCE_ENGINE_PASS / NOT_STUDENT_AUTHORIZED  
**Date:** 2026-10-04

## Exact heads

### TRAMA / Studio Atlas

PR: `#229`  
Exact head: `675ab6696571664ff5487b3b0a71de0cf97f3d19`

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

Use **MUSEO ZERO** as the first real governed Studio Atlas pathway, but preserve the existing human authority boundary.

Current authority is asymmetric:

- the MUSEO ZERO story is `STORY_APPROVED_FOR_WORLD_DESIGN`;
- the world package remains `HUMAN_PRODUCT_REVIEW_REQUIRED`;
- `ATLAS_IMPLEMENTATION = HOLD`;
- runtime remains `NOT_RUNTIME_AUTHORIZED`.

The next tranche therefore must:

1. materialise the approved MUSEO ZERO story in Studio Atlas with its Human Story Review evidence;
2. materialise the existing world design as **reviewable**, never as already approved;
3. stop fail-closed at Human World/Product Review while that decision is pending;
4. only after an explicit Human Review PASS, continue with experience, scenes, explicit transfer, storyboard and the real Atlas learner preview;
5. keep Visual Factory production independently queued under the orchestrator and evaluate learner experience before any publication step.

Studio Atlas must not manufacture a World Review PASS merely to unlock preview or production.


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


## Meaningful-choice and MUSEO ZERO browser proof

Cross-product workflow:

`Studio Atlas ↔ Atlas Preview E2E`

Run:

`37218287169`

Exact TRAMA / Studio Atlas head:

`675ab6696571664ff5487b3b0a71de0cf97f3d19`

Pinned exact Atlas preview candidate:

`073650b20943415df9a466da92174a33ccf2928b`

Result: **PASS**

The browser qualification proves:

1. Studio Atlas and Atlas run on distinct origins;
2. Studio Atlas sends only an opaque 192-bit channel in the URL;
3. the exact immutable snapshot travels in memory;
4. Atlas validates it and returns the origin-bound ACK;
5. a `CHOICE` Studio scene becomes a real choice in `ExperienceRuntime`;
6. the selected option exposes its authored consequence/feedback before continuing;
7. the runtime continues into an explicit `TRANSFER` scene;
8. MUSEO ZERO is available from the real Studio Atlas Home;
9. its preview is blocked before world/storyboard review state is satisfied;
10. once the **test harness** simulates those human gates, the MUSEO ZERO snapshot opens in the real Atlas learner runtime and exposes its authored meaningful choice.

### Authority caveat

The Playwright harness clicking **Approva mondo** and **Storyboard pronto** is test setup only.

It is **not Human Product Review evidence** and MUST NOT mutate the canonical MUSEO ZERO governance state to PASS.

The real pilot therefore remains:

- Story Review: PASS (previously approved);
- World Product Review: READY / human decision required;
- Storyboard: NOT YET HUMAN-APPROVED;
- MZ7 transfer: CANDIDATE / human decision required;
- learner runtime: NOT STUDENT AUTHORIZED;
- public publication: NOT AUTHORIZED.

The next gate is the single consolidated `PRODUCT-REVIEW-PACK-v0.1.md` decision.
