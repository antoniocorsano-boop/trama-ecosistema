# MUSEO ZERO — Studio Atlas Pilot Receipt v0.1

**Status:** CANONICAL_PILOT_MATERIALIZED / CROSS_PRODUCT_E2E_PASS / HUMAN_PRODUCT_REVIEW_REQUIRED  
**Date:** 2026-10-04

## Qualified exact heads

### Studio Atlas / TRAMA

Qualified implementation exact head:

`9d2aa6465c435308a97b7ecc064a57638fe58a7e`

This head includes the current `main` baseline through:

`ff11d5cb123625065fd14288e4a96998d7c11053`

Relevant runs:

- Governance — `37219964538` — PASS
- Studio Atlas — S1 Standalone — `37219964545` — PASS
- Validate TRAMA Ecosystem Snapshot — `37219964491` — PASS
- Studio Atlas ↔ Atlas Preview E2E — `37219964578` — PASS

The cross-origin browser job completed every build/start/browser step with PASS.

### Atlas preview runtime

Exact Atlas candidate pinned and exercised by the E2E:

`6e9335e386e100cc97ebc4cf9b88fc8950cea79d`

Relevant Atlas runs:

- Studio Atlas → Atlas Preview v0.1 — `37219376840` — PASS
- Experience Engine — `37219376885` — PASS
- Percorsi G2 UX Collaudo — `37219376837` — PASS
- Percorsi RRT-03 Sealed Preauthorization — `37219376878` — PASS
- TRAMA Perceptible Write — `37219376882` — PASS

The Atlas candidate preserves the existing `PathwayRuntimeSurface / ExperienceRuntime`; no second learner player is introduced.

## What is now real

MUSEO ZERO is no longer only a narrative/world document.

It is materialized as a Studio Atlas project at:

`products/studio-atlas/lib/canonical/museo-zero.ts`

Stable project ID:

`pw-strategy-selection-01-museo-zero`

The Studio home exposes it as a governed pilot:

**MUSEO ZERO · La sala che non torna**

## Authority state on import

The imported project deliberately preserves the real review state.

### Story

`storyReview.decision = PASS`

Evidence:

`docs/capabilities/atlas-percorsi/storytelling/STORY-PW-STRATEGY-01-MUSEO-ZERO.md`

Studio Atlas does not invent a new story approval.

### Consolidated Product Review

`productReview.decision = READY`

Evidence:

`docs/capabilities/atlas-percorsi/pathways/PW-STRATEGY-SELECTION-01/worlds/MUSEO-ZERO/PRODUCT-REVIEW-PACK-v0.1.md`

The single Product Review governs together:

- World;
- Agency;
- Choreography;
- Storyboard;
- Transfer.

This replaces separate World/Storyboard micro-approvals for this governed pilot.

### World

`worldReview.decision = READY`

No automatic PASS is granted.

### Storyboard

`storyboardReady = false`

The materialized scenes are complete enough to review, but are not silently promoted to preview/production readiness.

A Product Review PASS atomically authorises only the pilot-state transition to:

- `productReview = PASS`;
- `worldReview = PASS`;
- `storyboardReady = true`.

It does not authorise student use, publication or public runtime.

### Transfer

Transfer remains **inside the approved story arc**, not appended as a didactic epilogue.

The explicit transfer scene is:

`MZ5_COMPARE_RECOVERY`

The learner moves from the causal question:

> why is the room late?

to a different decision question:

> which recovery option is the strongest under the current constraints?

The target competence is therefore reused because the problem changes: causal/dependency representation → comparison/constraint representation.

The earlier second-installation epilogue candidate was removed because it weakened the approved quiet ending.

## Materialized authoring content

The pilot contains:

1. failed rehearsal;
2. reconstruction of the day's changes;
3. explicit inadequacy of chronology for causal explanation;
4. simulated trigger-mapping test;
5. recovery-option comparison and in-story transfer;
6. final rehearsal;
7. quiet close.

Meaningful-choice scenes now carry explicit `targetSceneId` outcomes.

Studio Atlas fails closed when:

- a choice has no destination;
- the destination does not exist;
- a choice scene does not contain at least two divergent destinations.

Atlas validates the same boundary and uses the authored `targetSceneId` as the actual Experience Runtime transition.

Choices are therefore no longer reduced to different feedback followed by the same sequential next scene.

## E2E proof

The browser qualification proves the following sequence across two real origins:

1. Studio Atlas opens MUSEO ZERO from the governed pilot entry;
2. **Vedi come studente** is initially disabled;
3. the independent **Approva mondo** micro-gate is absent;
4. the independent **Storyboard pronto** micro-gate is absent;
5. the test enters **Human Product Review**;
6. the test-only **Approva pacchetto** action atomically resolves the governed pilot gate;
7. only then is learner preview enabled;
8. Studio builds an exact preview snapshot;
9. Atlas receives it through the exact-origin, channel-bound ACK bridge;
10. Atlas mounts the existing `PathwayRuntimeSurface / ExperienceRuntime`;
11. in MZ2 the learner selects **Collego subito percorso, sensore e regia**;
12. the authored destination is followed to **MZ4_TEST_MAPPING — Prova il collegamento**, skipping the sequential MZ3 node;
13. snapshot remains `studentAuthorized=false`;
14. runtime remains `runtimeAuthorized=false`.

This proves an actual non-linear learner transition, not only alternate feedback copy.

The E2E Product Review PASS is **test evidence only**.

It demonstrates the gate mechanics and does not constitute the real Human Product Review of MUSEO ZERO.

## Preview security boundary

The qualified learner preview remains:

- route `/percorsi/lab/studio-atlas-preview/`;
- `noindex/nofollow`;
- outside the public Percorsi catalogue;
- exact-origin `postMessage`;
- random channel nonce;
- exact opener/window binding;
- snapshot validation before mount;
- no snapshot persistence in Atlas;
- no learner identity;
- no learner telemetry;
- `studentAuthorized=false`;
- `runtimeAuthorized=false`.

No publication authority is widened by the preview bridge.

## Visual Factory state

Visual production remains independent.

The canonical pilot may be structurally reviewed while visual production remains:

**Produzione in attesa**

under the `FREE_ONLY` policy until an eligible qualified provider is bound.

No visual Q3/Q4 quality claim is made by this receipt.

No provider/GPU exploration is required to continue the authoring/review circuit.

## Product interpretation

This tranche proves that Studio Atlas can carry a real governed Percorso from canonical authoring material into the actual Atlas learner runtime without:

- GitHub in the creator journey;
- student identity;
- learner telemetry;
- public publication;
- GPU availability;
- a second runtime/player.

It also proves that authored choices can now change the actual learner path rather than only change explanatory feedback.

## Remaining product gates

Before MUSEO ZERO can be treated as a publishable-candidate experience:

1. real Human Product Review on the exact Product Review Pack;
2. Human Use Review of the resulting learner experience;
3. Visual Factory asset production and Visual Quality Bar review;
4. accessibility/rights/provenance review as applicable;
5. publication-candidate Human Review.

No runtime/publication authorization is granted by this receipt.
