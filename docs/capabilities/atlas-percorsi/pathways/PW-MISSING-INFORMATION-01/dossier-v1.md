# PW-MISSING-INFORMATION-01 — Prima di decidere, cosa manca?

**Gate:** G1 — constitutional prototype review  
**Status:** REVIEW_CANDIDATE_V2 / NOT_RUNTIME_AUTHORIZED  
**Developmental band:** LATER_PRIMARY  
**Source prototype:** `prototypes/journey-multiscene-prototype-v1.md`  
**Prior review:** `constitutional-review-g1-v1.md` — CHANGES_REQUIRED  
**Runtime:** NOT_AUTHORIZED

## 1. Pathway brief
### Competence target
Reason about consequential choices by identifying relevant missing information before deciding, inspecting consequences, and revising when warranted.

Observable performances: notice missing relevant information; compare decision processes rather than people; inspect/predict consequence; keep/revise a choice for task reasons; recognise the strategy in a changed context; attempt application beyond the original social surface.

### Claim ceiling
Completion means completion only. One-scene success supports local task-performance claims only. Transfer requires changed-context evidence and is never inferred from completion, route choice or character liking.

### Prohibited inferences
No inference about empathy, kindness, maturity, personality, social worth, anxiety, shyness, leadership, emotional type or psychological state.

## 2. Educational need and reasoning chain
Shared decisions can require noticing relevant information not yet gathered. The pathway externalises this reasoning through ordinary fictional situations without asking the learner to disclose personal conflict or biography.

`missing information → bounded fictional choice → inspect consequence → reconsider → name strategy → changed context → transfer probe`

Evidence does not establish Journey/Crossroads as an optimal metaphor, a universally correct route, or a stable transversal trait from successful performance.

## 3. Evidence/governance references
- `research/evidence-records-v1.yaml`
- `research/evidence/transfer-claim-calibration-records-v1.yaml`
- `research/evidence/error-agent-emotion-records-v1.yaml`
- `research/common/cognitive-load-attention-multimedia-screening-v1.md`
- `research/common/development-executive-metacognition-emotion-screening-v1.md`
- `governance/CHILD-SAFE-LEARNING-EXPERIENCE-CONSTITUTION-v1.md`
- `governance/PATHWAY-CONSTITUTION-REVIEW-CONTRACT-v1.yaml`

## 4. Narrative and character boundary
Journey/Crossroads is a controlled candidate for continuity, never essential meaning. A complete literal/non-metaphorical baseline exists. Atmosphere is calm, exploratory, non-competitive and non-judgmental: no urgency, reward economy, spectacle or emotional escalation.

Characters are fictional task participants, not companions/confidants. They do not claim privileged understanding, request biography or persist across pathways to build a relationship. No autonomous conversational agent is required; dialogue is fixed/scripted and task-bound.

## 5. Safeguard/data-flow profile
No account, real name, sensitive disclosure, behavioural profile, hidden score, server telemetry, automatic persistent trace, free text or learner-response network call is required. Bounded choices exist in local session state only. Optional strategy trace is fixed/generated text saved locally only if the learner explicitly chooses; keep and discard must have equal salience and effort.

| Interaction | Input | Processing | Server | Retention |
|---|---|---|---|---|
| Observe | none | client | no | none |
| A/B/C choice | enum | local | no | session |
| Keep/revise | enum | local | no | session |
| Strategy match | bounded | local | no | session |
| Changed-context choice | bounded | local | no | session |
| Transfer probe | bounded | local | no | session |
| Strategy trace | fixed text | local device | no | learner-controlled |

Any analytics, synchronisation, cloud persistence, individual-choice dashboard, free text, adaptive profiling or generative agent is a material governance change and reopens review.

## 6. Final-candidate prompt/developmental matrix — R1
Wording remains subject to human developmental review; this matrix fixes the intended language envelope and prevents later silent complexity growth.

| ID | Learner-facing candidate wording | Demand / concepts | Prior knowledge | Support / alternative | LATER_PRIMARY review |
|---|---|---|---|---|---|
| Q01 | “Osserva la situazione. Che cosa sta succedendo?” | one situation; orientation | ordinary group decision | scene summary in plain text | PENDING_HUMAN |
| Q02 | “Prima di decidere, quale informazione manca?” | identify one relevant absence | meaning of information | highlight facts already known, not answer | PENDING_HUMAN |
| Q03 | “Quale modo di decidere vuoi provare?” | compare max 3 processes | none beyond scene | each option one short sentence | PENDING_HUMAN |
| Q04 | “Che cosa cambia dopo questa scelta?” | cause/consequence | scene state | before/after literal summary | PENDING_HUMAN |
| Q05 | “Vuoi tenere questa scelta o provarne un’altra?” | revision | none | both actions equal prominence | PENDING_HUMAN |
| Q06 | “Quale strategia aiuta a controllare ciò che mancava?” | strategy/consequence link | prior scenes | one strategy at a time | PENDING_HUMAN |
| Q07 | “La stessa strategia può servire anche qui?” | changed-context comparison | strategy just named | literal restatement available | PENDING_HUMAN |
| Q08 | “Prima di decidere, che cosa conviene controllare?” | abstract relation in new surface | no domain-specialist knowledge | bounded evidence choices | PENDING_HUMAN |
| Q09 | “Vuoi conservare questa traccia sul tuo dispositivo o eliminarla?” | local-file control | basic device action | explain: nothing is sent to Atlas | PENDING_HUMAN |

Language constraints: one instructional action per prompt; avoid idioms, moral labels, personality adjectives and unnecessary subordinate clauses; essential instructions must not rely on metaphor. Final wording requires developmental review before implementation.

## 7. Question-function inventory
Q01 TASK_ORIENTATION; Q02/Q08 EVIDENCE_INSPECTION; Q03 STRATEGY_SELECTION; Q04 CONSEQUENCE_PREDICTION; Q05/Q09 REVISION; Q06 TASK_BOUND_REFLECTION; Q07 COMPARISON. All responses are bounded; personal/sensitive data are neither needed nor requested. Abstract-function review: PASS. Final-literal wording review: PENDING_HUMAN.

## 8. Scene-level cognitive-demand matrix — R3

| Scene | Task demand | Representation | Navigation | Narrative | Externalised memory / stable anchor | Single meaningful change |
|---|---|---|---|---|---|---|
| 1 | understand shared decision | group + known facts | continue | low | persistent fact panel | situation introduced |
| 2 | detect missing information | known/missing contrast | one bounded choice | low | known-facts panel persists | missing-information relation foregrounded |
| 3 | compare decision processes | max 3 equal options | select one | moderate | option labels remain visible | process selected |
| 4 | inspect consequence | before/after | continue | moderate | previous choice visible | consequence appears |
| 5 | keep/revise | binary | two equal controls | low | consequence remains visible | revision opportunity |
| 6 | name strategy | match/selection | one task | low | concise strategy card | abstraction named |
| 7 | recognise relation in changed context | new surface, same structure | bounded choice | moderate | strategy card available on request | surface context changes |
| 8 | probe beyond social surface | information/source scenario | bounded evidence choice | low | literal question + known facts | domain surface changes |
| 9 | control local trace | fixed strategy summary | keep/discard | none | explicit local-only notice | persistence choice only |

No scene should add simultaneous decorative novelty. If a visual change is not needed for orientation, causal understanding, safe affect or accessibility, it is removable by default.

## 9. Accessibility verification matrix — R2
This is a specification-level matrix, not a conformance claim.

| Requirement | Specification | Current state |
|---|---|---|
| Keyboard | all actions operable sequentially without pointer | SPECIFIED / TEST_PENDING |
| Visible focus | persistent high-visibility focus indicator | SPECIFIED / TEST_PENDING |
| Semantic names | controls expose action/purpose, not route colour/position | SPECIFIED / TEST_PENDING |
| Screen-reader order | heading → scene facts → question → options → feedback/navigation | SPECIFIED / TEST_PENDING |
| Colour independence | no essential distinction by colour alone | SPECIFIED / TEST_PENDING |
| Contrast | text/controls/assets to be measured against governing accessibility baseline | MEASUREMENT_PENDING |
| Text zoom/reflow | no horizontal task loss at supported zoom/reflow | TEST_PENDING |
| Touch targets | target sizing/spacing checked on mobile implementation | TEST_PENDING |
| Reduced motion | no essential motion; reduced/no-motion changes no construct | SPECIFIED / TEST_PENDING |
| Literal equivalent | all nine functions available without Journey metaphor | SPECIFIED / CONTENT_TEST_PENDING |
| Cognitive-language clarity | one action/prompt; short options; stable labels; no hidden instructions | SPECIFIED / HUMAN_TEST_PENDING |

No WCAG/AgID conformance claim is authorised until an implementation is tested.

## 10. Cognitive/media and emotional controls
Stable composition is preserved through the first decision cycle. Visual change is local and pedagogically meaningful. No automatic transition, decorative animation, reward symbol, moral colour coding or novelty solely for attention capture. Route geometry, contrast and character expression must not reveal a preferred answer.

The fictional situation uses ordinary uncertainty rather than intense interpersonal conflict. No sadness/shyness motive, shame, fear, punitive exit or moral-worth feedback. Reconsideration is legitimate. Final scripts must keep consequence feedback informational rather than moralising.

## 11. Transfer/claim calibration
Scene 7 changes surface context while preserving the relation “relevant information is missing before decision”. Scene 8 moves beyond social participation to information/source evaluation. These are transfer probes, not proof of durable transfer. Scene 8 must not reuse answer position, colour or route cues from earlier scenes. Multi-context performance still requires governed validation.

## 12. Teacher/use-context note — R4
Before use, the teacher/adult-facing layer must state:
- **target:** noticing relevant missing information before consequential choice and reconsidering on evidence;
- **evidence available:** bounded task performance in the presented contexts;
- **not evidenced:** empathy, maturity, personality, emotional state or durable general competence;
- **transfer ceiling:** changed-context success is a probe; durable transfer requires further evidence;
- **mediation:** optional clarification/orientation is permitted but must not reveal a preferred moral route;
- **data:** v1 sends no learner response to a server and creates no individual profile;
- **interpretation:** route choice is never a learner trait or grade by itself.

Teacher-facing provenance and limits must remain visible wherever the pathway is assigned or reviewed.

## 13. Consequence review
Plausible risks and controls: route-following rather than reasoning → equal weighting/literal baseline/transfer probe; consultation mistaken for moral correctness → trade-offs/no praise or punishment; images replacing memory → stable anchors/retrieval checks; disclosure → no free text/personal prompt; profiling → no persistence/profile; metaphor dependence → literal comparison and rejection if clarity/transfer worsens.

## 14. Sustainability/resource proportionality
Reuse stable composition where feasible; motion unnecessary; learner interaction can operate without network calls; visual assets require orientation/causal/narrative/accessibility justification. No environmental quantity is claimed without measurement.

## 15. Material-change/review trigger — R5
The relevant constitutional dimensions MUST be reopened if any of these changes:
- learner-facing wording or number/complexity of options;
- route geometry, salience, colour, character expression or motion;
- metaphor becomes necessary for essential meaning;
- free text, microphone/camera or personal prompt is introduced;
- local/session data become persistent, synchronised, transmitted or visible in an individual dashboard;
- analytics, profiling, adaptation or scoring is introduced;
- conversational/generative agent behaviour is introduced;
- teacher interpretation/claim ceiling changes;
- developmental band changes.

A change that introduces personal/sensitive disclosure, relational retention, hidden profiling or pseudo-therapeutic behaviour triggers the corresponding constitutional stop rather than ordinary review.

## 16. Review state after R1–R5 remediation
- R1 developmental-language matrix: **IMPLEMENTED IN SPEC / HUMAN REVIEW PENDING**;
- R2 accessibility matrix: **IMPLEMENTED IN SPEC / IMPLEMENTATION TEST PENDING**;
- R3 cognitive-demand table: **IMPLEMENTED**;
- R4 teacher/use-context note: **IMPLEMENTED**;
- R5 material-change trigger: **IMPLEMENTED**;
- question inventory abstract functions: **PASS**;
- privacy/data-flow document design: **PASS conditional on implementation fidelity**;
- developmental human review: **PENDING**;
- accessibility implementation review: **PENDING**;
- pedagogical human review: **PENDING**;
- child-safety/privacy human review: **PENDING**;
- exact-head human review: **PENDING**.

## 17. Decision
This remains a review candidate, not a production specification. R1–R5 from the first constitutional review are now instantiated at specification/document level. A second constitutional document review is required on this exact revision. Runtime remains NOT_AUTHORIZED.