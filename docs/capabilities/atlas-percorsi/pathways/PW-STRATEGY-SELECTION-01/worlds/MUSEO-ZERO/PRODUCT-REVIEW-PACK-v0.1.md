# MUSEO ZERO — Product Review Pack v0.1

**Status:** READY_FOR_HUMAN_PRODUCT_REVIEW  
**Date:** 2026-10-04  
**Pathway:** PW-STRATEGY-SELECTION-01  
**Studio Atlas project:** `pw-strategy-selection-01-museo-zero`  
**Runtime:** NOT_AUTHORIZED  
**Publication:** NOT_AUTHORIZED

## Purpose

Provide one bounded Human Product Review for the materialised MUSEO ZERO pilot before learner preview.

This package intentionally consolidates the remaining qualitative decisions so the reviewer does not need to approve World, Agency, Choreography, Storyboard and Transfer as separate micro-gates.

A single decision on this exact package may be:

- `PASS`
- `REVISE`
- `REJECT`

## Already approved and out of scope

The storytelling direction is already approved:

- `STORY-PW-STRATEGY-01-MUSEO-ZERO.md`
- state: `STORY_APPROVED_FOR_WORLD_DESIGN`

This review does **not** reopen the core story unless a material contradiction is found.

## Exact review scope

### A. World coherence

Review together:

- `world-brief-v1.md`
- `role-agency-map-v1.md`
- `information-distribution-map-v1.md`
- `consequence-model-v1.md`
- `experience-choreography-v1.md`

Question:

> Does this world make the learner genuinely useful, preserve the approved story and create visible consequences instead of turning the museum into a decorated exercise?

PASS means the world may move from `READY` to `PASS` in the Studio Atlas pilot.

### B. Materialised storyboard

Review the Studio Atlas canonical materialisation:

`products/studio-atlas/lib/canonical/museo-zero.ts`

Current sequence:

1. **MZ1_FAILED_REHEARSAL** — failed rehearsal / visible mismatch
2. **MZ2_RECONSTRUCT_DAY** — choose how to organise distributed information
3. **MZ3_TIMELINE_LIMIT** — chronology proves insufficient for causality
4. **MZ4_TEST_MAPPING** — simulated mapping choice with visible consequences
5. **MZ5_COMPARE_RECOVERY** — transfer from causal explanation to constraint-based recovery decision
6. **MZ6_FINAL_REHEARSAL** — room returns to coherent behaviour
7. **MZ7_QUIET_CLOSE** — quiet closure, no score or didactic moral

Questions:

- Do the scene choices arise from the story rather than from quiz logic?
- Does the learner change representation because the question changes?
- Do consequences explain the world rather than grade the learner?
- Does the sequence preserve curiosity and backstage privilege?
- Is the rhythm plausible for lower-secondary use?

PASS means the storyboard may be marked `storyboardReady=true`.

### C. Transfer inside the story arc

The earlier second-installation epilogue candidate has been removed.

Transfer is now materialised in:

**MZ5_COMPARE_RECOVERY — “Quale soluzione regge davvero?”**

The learner has already used chronology and dependency reasoning to explain why the room starts late. The problem then changes:

> Which recovery option is strongest under the current constraints?

The learner must therefore change representation again, from a causal/dependency view to a comparison of alternatives against accessibility, reliability and operational effort.

Choices:

- restore the old route;
- update the cue mapping to Sensor B;
- use a manual cue.

The relevant transfer is **not** a renamed repetition in a second context. It is the reuse of the target competence when the *kind of question changes inside the same believable world*: causal explanation → constrained decision.

Review question:

> Does MZ5 demonstrate legitimate transfer of strategy selection while preserving the story’s quiet ending and avoiding a didactic epilogue?

PASS accepts **MZ5_COMPARE_RECOVERY** as the explicit transfer scene for this pathway version.

## Product criteria

Human Review should judge the package against these criteria.

### P1 — Story fidelity
The experience still feels like the approved MUSEO ZERO story.

### P2 — Meaningful agency
Choices affect information, interpretation, simulated state or recommendation.

### P3 — Representation necessity
Timeline, dependency view and comparison appear because the learner's question changes.

### P4 — World consequence
The room/system response carries evidence; the interface does not merely announce correctness.

### P5 — Age dignity
Language and situations respect lower-secondary learners and avoid infantilising tutoring.

### P6 — No technical-diagram regression
The museum remains a believable world. The earlier Phaser-style technical diagram is not the product model.

### P7 — Mobile feasibility
The experience can be expressed through inspectable places, choices and stateful views without joystick-scale interaction.

### P8 — Transfer legitimacy
MZ5 requires the learner to change representation because the problem changes from causal explanation to constrained decision, without appending a second-context exercise after the story.

## Current Studio state

The governed pilot is deliberately materialised as:

- `storyReview = PASS`
- `worldReview = READY`
- `storyboardReady = false`
- production = `NOT_REQUESTED`

Therefore **Vedi come studente remains blocked** until this review is resolved.

This is intentional fail-closed behaviour.

## Effect of PASS

A Human Product Review PASS on this exact pack authorises only the following pilot-state transitions:

- `worldReview: READY → PASS`
- accept MZ5_COMPARE_RECOVERY as the explicit transfer scene;
- `storyboardReady: false → true`
- enable generation of an exact non-public learner preview snapshot.

PASS does **not**:

- authorise public Atlas runtime;
- authorise student use;
- authorise publication;
- grant Arena authority;
- authorise paid compute;
- grant Visual Quality Bar PASS;
- activate DOS-A1.

## Effect of REVISE

Record specific findings against one or more of:

- WORLD
- AGENCY
- CHOREOGRAPHY
- STORYBOARD
- TRANSFER

The authoring project remains blocked from learner preview until those findings are resolved.

## Evidence after decision

When a decision is made, record:

- exact product-review-pack digest/ref;
- human decision;
- reviewed Studio Atlas project version;
- resulting exact preview snapshot digest when applicable.

The learner preview remains a separate evidence step.
