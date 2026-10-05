# MUSEO ZERO — Human Product Review v0.1

**Decision:** REVISE  
**Review date:** 2026-10-04  
**Review type:** consolidated Human Product Review  
**Scope:** product experience, not technical qualification

## Frozen reviewed baseline

TRAMA / Studio Atlas exact head:

`2aa153a26151a6b1f7f4e0c36091abe2f0d80529`

Atlas exact head:

`16670e405ae1b3e098bc89c7be6f48b33bdff9a3`

Reviewed Product Review Pack:

`docs/capabilities/atlas-percorsi/pathways/PW-STRATEGY-SELECTION-01/worlds/MUSEO-ZERO/PRODUCT-REVIEW-PACK-v0.1.md`

Git blob:

`51e452df3ec1225cf03ec8420f9b2d8b0d907785`

Reviewed canonical materialisation:

`products/studio-atlas/lib/canonical/museo-zero.ts`

Git blob:

`3e5f91d06b89ec93ca21e2387d487457c07b8744`

The review is bound to these exact artefacts. Later commits do not retroactively change this decision.

## Product question

> Does a lower-secondary learner feel that they are investigating and repairing an interactive museum room, or mainly reading screens and selecting answers?

**Answer on the frozen baseline:** the learner still too often experiences the second case.

MUSEO ZERO has a credible story, a useful learner role, a coherent causal problem and a strong intended experience model. The current materialised preview, however, compresses the designed world into a sequence of textual scene summaries, semantic state cards and radio-button choices. The product therefore does not yet deliver enough of the backstage investigation, evidence handling, representation change and visible world response promised by the approved design.

## Criterion decision

| Criterion | Decision | Review finding |
|---|---|---|
| P1 — Story fidelity | PASS | The museum failure, accessibility constraint, partial crew knowledge and quiet repair ending remain coherent. |
| P2 — Meaningful agency | REVISE | Branching exists, but the learner cannot yet choose locations, inspect objects, pin evidence or construct the working model described by the Role / Agency Map. |
| P3 — Representation necessity | REVISE | Timeline, dependency view and comparison are described in copy, but are not yet materially operated as representations by the learner. |
| P4 — World consequence | REVISE | MZ4 now exposes semantic before/after state, which is a meaningful improvement, but the consequence is still primarily read as status text and signal cards rather than experienced as the room changing. |
| P5 — Age dignity | PASS | Tone is restrained and non-infantilising. |
| P6 — No technical-diagram regression | PASS WITH CAUTION | The product does not regress to the earlier technical diagram, but the current card-based state surface is still too abstract to carry the museum world by itself. |
| P7 — Mobile feasibility | PASS | The intended interaction can be implemented without joystick-scale controls. |
| P8 — Transfer legitimacy | REVISE | MZ5 changes the question from causality to constrained choice, which is conceptually valid, but the learner is given the comparison rather than building and using it. |
| P9 — Consequence visible in the world | REVISE | The selected configuration changes semantic world state before continuation, but the represented system does not yet make the causal change sufficiently perceivable without reading explanatory text. |

## Priority findings

### F1 — CRITICAL / EXPERIENCE-WORLD GAP

The approved World Brief and Choreography specify a connected museum with four places, free inspection, environmental traces, objects, partial character knowledge and evidence handling.

The canonical materialisation exposes seven scene records. Atlas renders these as title, world-state block, facts, prompt, choices, feedback and Continue.

This is the main product gap. The museum is structurally present in the data but not yet sufficiently present as a place the learner investigates.

### F2 — HIGH / AGENCY COLLAPSE

The Role / Agency Map defines navigation agency, evidence agency, representation agency, testing agency and decision agency.

Current runtime meaningfully supports testing/decision branching, but does not yet materialise the first three agency layers. As a result, MZ2 in particular behaves like a choice about how to reason rather than an investigation in which the learner actually gathers and organises evidence.

### F3 — HIGH / REPRESENTATIONS ARE NAMED, NOT USED

The target competence is choosing and changing the organisation of information according to the question.

On the current baseline:
- the timeline is represented by a scene about the timeline;
- the dependency model is represented by selecting a mapping;
- the comparison is represented by three already-formed options and constraint status cards.

The learner does not yet construct or manipulate these representations. This weakens the central competence evidence.

### F4 — HIGH / WORLD CONSEQUENCE IS STILL TOO TEXTUAL

The new `worldAfter` contract is the correct semantic foundation and proves that choices can change observable state.

For product quality, however, MZ4 must make the relation perceptible as a room/system event: visitor crosses new entry → Sensor B reacts → active trigger responds or fails to respond → projection/sound/light follow on time or late.

The current signal cards explain this accurately, but still risk functioning as an answer display.

### F5 — HIGH / TRANSFER MZ5 IS CONCEPTUALLY VALID BUT UNDER-MATERIALISED

Keeping transfer inside the same story arc is a good product decision.

MZ5 nevertheless supplies the comparison structure almost completely. The learner sees three options and already-labelled constraints, then selects one. For legitimate strategy-selection transfer, the learner should have to bring forward the relevant constraints/evidence and use a comparison representation to justify the recommendation.

### F6 — MEDIUM / PASSIVE RHYTHM

MZ1, MZ3, MZ6 and MZ7 are summary scenes. Together with the three choice scenes, this creates a visible pattern of:

`read → choose/continue → read → choose/continue`

That pattern is too close to the failure mode the Choreography explicitly rejects.

### F7 — MEDIUM / CHARACTERS DISAPPEAR FROM THE MATERIALISED EXPERIENCE

Lia, Omar and Teo have useful partial knowledge and functional motivations in the approved story/world documents. In the canonical preview, their role is mostly compressed into narrative copy. Their distributed knowledge therefore does not yet become an interactional resource.

## Consolidated revision package

The next cycle should be one bounded product revision. It should preserve the existing story, causal model, runtime boundary and preview adapter while changing the learner-facing materialisation.

### R1 — Materialise a compact explorable museum

Use the existing web stack. Do not introduce Phaser, GPU or another engine.

Provide one persistent illustrated/diagrammatic museum surface with four inspectable places:
- Ingresso / percorso;
- Sala Zero;
- Cabina regia;
- Laboratorio / deposito.

Navigation may be map/hotspot based and must work on smartphone.

### R2 — Replace MZ2 with a genuine investigation loop

The learner must be able to inspect at least a small bounded set of environmental/artefact clues in chosen order.

Minimum useful evidence set:
- route/accessibility trace;
- Sensor B physical move;
- active cue mapping;
- failed rehearsal timing trace;
- one or two plausible non-causal changes.

Evidence can be pinned to a working surface.

### R3 — Materialise the three representations as operations

The learner must be able to use, not merely read about:
- timeline / sequence;
- dependency / connection view;
- comparison / constraint view.

The interaction can remain simple: drag/select/connect/reorder is sufficient. It does not need game-engine interaction.

### R4 — Make MZ4 the experiential centre

Retain the existing semantic `world` / `worldAfter` contract, but render the consequence as a perceptible system event.

The learner should be able to distinguish the Sensor A, Sensor B and manual-cue tests by observing the represented room behaviour before explanatory prose is needed.

Text remains as an accessible equivalent, not the primary carrier of the consequence.

### R5 — Strengthen MZ5 transfer

Do not replace MZ5 with a second-context exercise.

Instead, require the learner to carry forward constraints/evidence into a comparison surface and recommend a recovery option from that representation. The recommendation should visibly affect the final rehearsal state.

### R6 — Restore characters as information carriers

Lia, Omar and Teo should expose their partial knowledge through short contextual interactions or inspectable statements tied to place/evidence.

They must not become tutors and must not state the full causal answer.

### R7 — Reduce passive scene count

MZ6 and MZ7 may remain a short quiet closure, but the route to them should not require repeated summary-only screens.

Where possible, let the final rehearsal and ready state occur on the same persistent world surface used for the investigation.

## What must not change in this revision

- approved core story;
- causal diagnosis: new route + Sensor B + stale Sensor A cue mapping;
- accessibility constraint;
- quiet non-scored ending;
- volatile/non-public preview boundary;
- no learner identity;
- no telemetry;
- no public runtime authorization;
- no Visual Factory investment as compensation for weak interaction;
- no new engine;
- no GPU dependency.

## Exit criteria for the single revision cycle

A re-review may return PASS only when the frozen candidate demonstrates all of the following together:

1. the learner can investigate at least several clues in non-fixed order;
2. the learner creates or manipulates a timeline, a dependency view and a comparison view;
3. MZ4 consequences are understandable from the represented world/system response before explanatory feedback;
4. MZ5 requires actual use of constraints/evidence, not only selection among labelled options;
5. the museum remains perceptibly one connected backstage world;
6. the dominant rhythm is no longer `read → choose → continue`;
7. the experience remains feasible on smartphone and desktop without a game engine.

## Decision effect

**REVISE**

Therefore:
- `productReview` does not move to PASS;
- `worldReview` does not move to PASS;
- `storyboardReady` remains false;
- learner preview generation remains blocked for product-review purposes;
- public runtime, student use and publication remain unauthorized;
- Visual Factory / Q4 asset production remains deferred.

No additional micro-approval is requested. The next Human Product Review should occur only after the complete consolidated revision package is implemented.
