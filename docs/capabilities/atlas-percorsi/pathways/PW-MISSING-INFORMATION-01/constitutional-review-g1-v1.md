# PW-MISSING-INFORMATION-01 — Constitutional Review G1 v1

**Review type:** first governed constitutional review  
**Reviewed dossier blob:** `6085951273e602bff86d8b01f35475871bf1cc8f`  
**Branch:** `capability/atlas-percorsi-g1-child-safe`  
**Date:** 2026-09-25  
**Runtime:** NOT_AUTHORIZED

## Review discipline
This review distinguishes: (a) structural compliance visible in the dossier; (b) reviewer judgement on the written design; (c) empirical/human validation not yet performed. A design-document PASS never substitutes for testing with authorised human reviewers or learners.

## Result
**G1 CONSTITUTIONAL DOCUMENT REVIEW: CHANGES_REQUIRED**

No automatic constitutional stop is currently triggered by the written v1 design. Promotion is nevertheless blocked because several contract fields are implicit rather than instantiated and accessibility/developmental validation remains incomplete.

## Rule-by-rule findings

| Area | Result | Finding |
|---|---|---|
| C1 competence / trait inference | PASS | Observable task performances and prohibited trait inferences are explicit; claim ceiling is appropriately bounded. |
| C2 agency / coercive engagement | PASS | Meaningful bounded choices, revision and no reward/streak/urgency mechanics are declared. |
| C3 error / feedback | PASS WITH CONDITION | Revision is safe and non-punitive; final implementation must ensure consequence feedback is informational and does not reveal a preferred moral answer through wording or visual emphasis. |
| C4 task-bound reflection | PASS | No personal reflection or sensitive disclosure is required; reflection remains on strategy/consequence. |
| C5 developmental appropriateness | CHANGES_REQUIRED | `LATER_PRIMARY` is declared, but wording/readability, instruction length, choice complexity and comprehension assumptions have not yet been explicitly reviewed against the developmental band. |
| C6 executive/cognitive demand | PASS WITH CONDITION | Stable anchors and bounded choices reduce avoidable demand; a scene-level demand table is still needed before specification. |
| C7 attention / salience | PASS WITH CONDITION | Visual restraint is explicit; final assets must be checked so route geometry, contrast, character expression and motion do not become answer cues. |
| C8 cognitive continuity | PASS | Stable composition and local change are explicit design requirements. |
| C9 consequential interaction | PASS | Choices lead to inspectable trade-offs rather than rewards/punishments. |
| C10 functional narrative | PASS WITH CONDITION | Journey/Crossroads is explicitly optional and compared with a literal baseline; it must be rejected if it does not improve orientation/continuity without harming clarity/transfer. |
| C11 character/agent boundary | PASS | No conversational agent or free text is required. Characters are task participants, not confidants. Question inventory contains only allowed task functions. |
| C12 transfer | PASS AS PROBE DESIGN | Scenes 7–8 constitute changed-context probes, not evidence that transfer has occurred. |
| C13 claim calibration | PASS | Completion/local performance/transfer claims are explicitly separated. |
| C14 privacy/data | PASS FOR DOCUMENTED V1 | No account, identity, free text, server response data, profiling or hidden score. Local session state only; optional trace is learner-controlled. |
| C15 accessibility | CHANGES_REQUIRED | Literal baseline and sensory independence are promising, but keyboard/focus semantics, screen-reader order, target size, text scaling, contrast, reduced motion and cognitive-language checks are not instantiated. |
| C16 emotional safety | PASS WITH CONDITION | Scenario is low-intensity and non-diagnostic. Final script must avoid implied sadness/shyness, moral praise/blame and emotional pressure. |
| C17 teacher/governance sovereignty | CHANGES_REQUIRED | Provenance is linked, but teacher-facing explanation of evidence/limits and the intended mediation/use context are not yet fully specified. |

## Question-inventory review

Q01–Q09 are all task-bound and use bounded responses. None solicits personal, sensitive, relational or psychological information. No question requires a C11 stop.

**Question inventory document review:** PASS.

Before implementation, each final literal prompt must be reviewed again because wording changes can alter developmental load, moral signalling and disclosure risk even when the abstract function remains permitted.

## Data-flow review

The v1 architecture removes the principal disclosure channel by using no free text. Bounded selections remain local/session-only and are not uploaded. This is preferable to collecting responses and attempting downstream filtering.

**Privacy/data-flow document review:** PASS, conditional on implementation preserving the declared no-server-response architecture.

Any future analytics, synchronisation, cloud persistence, adaptive profiling, teacher dashboard of individual choices or generative-agent integration is a **material governance change** and invalidates this PASS until separately reviewed.

## Required changes before G1 document PASS

### R1 — Developmental-language review
Add a scene/prompt table recording:
- final learner-facing wording;
- reading/comprehension demand;
- number of simultaneous concepts/options;
- assumed prior knowledge;
- support/alternative wording;
- reviewer state for `LATER_PRIMARY`.

### R2 — Accessibility verification matrix
Instantiate at minimum:
- keyboard operation and visible focus;
- semantic control names and screen-reader reading order;
- non-colour-only meaning;
- contrast check;
- text zoom/reflow;
- touch-target adequacy;
- reduced-motion/no-motion equivalence;
- literal non-metaphorical equivalent;
- cognitive-language clarity.

No claim of WCAG conformance is permitted until implementation exists and is tested.

### R3 — Scene-level cognitive-demand table
For Scenes 1–9 record task demand, representation demand, navigation demand, narrative demand, memory externalisation, stable anchor and the single meaningful change expected at that step.

### R4 — Teacher/use-context note
Specify what a teacher/adult is told about:
- competence target;
- what the pathway can and cannot evidence;
- why route choices are not learner traits;
- transfer-claim ceiling;
- optional mediation;
- what is never recorded or sent to a server in v1.

### R5 — Final-script review trigger
Declare that any change to learner-facing wording, route salience, character emotional expression, free-text availability, persistence, analytics or agent behaviour reopens the relevant constitutional review dimensions.

## Non-blocking observations

1. The design correctly treats the Journey metaphor as a falsifiable hypothesis rather than a product identity.
2. Removing conversational-agent and free-text surfaces is a stronger child-safety control than moderation of unnecessary collection.
3. Scene 8 is especially important because it tests the abstract relation outside the original social scenario; it should not reuse answer-position or visual cues from earlier scenes.
4. The optional local strategy trace is acceptable in principle, but implementation must make discard as easy and salient as keep.

## Review state

- structural/document review: **CHANGES_REQUIRED**;
- automatic constitutional stops: **NONE OBSERVED IN DOCUMENTED V1**;
- question inventory: **PASS at abstract-function level**;
- privacy/data-flow: **PASS conditional on declared architecture**;
- accessibility: **CHANGES_REQUIRED**;
- developmental: **CHANGES_REQUIRED**;
- pedagogical: **PASS WITH CONDITIONS at document level**;
- child-safety/privacy: **PASS WITH CONDITIONS at document level**;
- exact-head human review: **NOT_PERFORMED**;
- runtime authority: **NOT_GRANTED**.

## Promotion rule
Do not promote this pathway on the basis of this review. Apply R1–R5 to the dossier/specification, then repeat the constitutional document review on the new exact head. Only after document-level PASS should implementation/prototype validation be considered, under the governing runtime gate.