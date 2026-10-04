# MUSEO ZERO — Studio Atlas Pilot Receipt v0.1

**Status:** CANONICAL_PILOT_MATERIALIZED / CROSS_PRODUCT_E2E_PASS / HUMAN_WORLD_REVIEW_REQUIRED  
**Date:** 2026-10-04

## Qualified exact heads

### Studio Atlas / TRAMA

Qualified exact head:

`675ab6696571664ff5487b3b0a71de0cf97f3d19`

Relevant runs:

- Governance — `37218287225` — PASS
- Studio Atlas — S1 Standalone — `37218287202` — PASS
- Studio Atlas ↔ Atlas Preview E2E — `37218287169` — PASS

### Atlas preview runtime

Exact Atlas candidate pinned by the E2E:

`073650b20943415df9a466da92174a33ccf2928b`

This candidate includes Studio Atlas `SUMMARY/CHOICE` scene mapping and fail-closed preview validation.

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

The Studio does not invent a new story approval.

### World

`worldReview.decision = READY`

The world remains **HUMAN_PRODUCT_REVIEW_REQUIRED**.

No automatic PASS is granted.

### Storyboard

`storyboardReady = false`

The materialized scenes are complete enough to review, but are not silently promoted to production-ready.

### Transfer

Transfer is kept **inside the approved story arc**, not appended as a didactic epilogue.

The scene:

`MZ5_COMPARE_RECOVERY`

is marked as the transfer scene because the learner must move from the causal question:

> why is the room late?

to a different decision question:

> which recovery option is the strongest under the current constraints?

The competence therefore transfers by changing the representation according to the problem: causal/dependency view → comparison/constraint view.

The earlier second-installation epilogue candidate was removed because it weakened the approved quiet ending.

## Materialized authoring content

The pilot contains:

1. failed rehearsal;
2. reconstruction of the day's changes;
3. explicit inadequacy of chronology for causal explanation;
4. simulated trigger-mapping test;
5. recovery-option comparison;
6. final rehearsal;
7. quiet close.

Transfer occurs within the recovery-comparison phase rather than as an extra post-story scene.

Meaningful-choice scenes preserve alternative actions and distinct consequences.

The pilot therefore no longer collapses into a linear `summary → Continua` sequence.

## E2E proof

The browser qualification proves the following sequence across two real origins:

1. Studio Atlas opens MUSEO ZERO from the pilot entry;
2. **Vedi come studente** is initially disabled;
3. World Review must be explicitly passed in the UI;
4. the storyboard must be explicitly marked ready;
5. only then is learner preview enabled;
6. Studio builds an exact preview snapshot;
7. Atlas receives it through the origin-bound ACK bridge;
8. Atlas mounts the existing `PathwayRuntimeSurface / ExperienceRuntime`;
9. the learner reaches the MUSEO ZERO choice scene;
10. a selected option exposes its own consequence feedback;
11. snapshot remains `studentAuthorized=false`;
12. runtime remains `runtimeAuthorized=false`.

The E2E test's review clicks are **test actions only**.

They prove gate behaviour; they do not constitute the real Human Product Review of MUSEO ZERO.

## Visual Factory state

Visual production remains independent.

The canonical pilot may be structurally previewed while visual production remains:

**Produzione in attesa**

under the `FREE_ONLY` policy until an eligible SkyPilot provider is bound.

No visual Q3/Q4 quality claim is made by this receipt.

## Product interpretation

This tranche proves that Studio Atlas can now carry a real governed Percorso from canonical authoring material into the actual Atlas learner runtime without:

- GitHub in the creator journey;
- student identity;
- learner telemetry;
- public publication;
- GPU availability;
- a second runtime/player.

## Remaining product gates

Before MUSEO ZERO can be treated as a publishable-candidate experience:

1. real Human World Review;
2. real storyboard review, including confirmation that the in-story recovery phase is an adequate transfer demonstration;
3. Human Use Review of the learner experience;
4. Visual Factory asset production and Visual Quality Bar review;
5. accessibility/rights/provenance review as applicable;
6. publication-candidate Human Review.

No runtime/publication authorization is granted by this receipt.
