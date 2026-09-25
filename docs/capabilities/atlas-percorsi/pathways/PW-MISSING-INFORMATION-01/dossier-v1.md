# PW-MISSING-INFORMATION-01 — Prima di decidere, cosa manca?

**Gate:** G1 — constitutional prototype review  
**Status:** REVIEW_CANDIDATE / NOT_RUNTIME_AUTHORIZED  
**Developmental band:** LATER_PRIMARY  
**Source prototype:** `prototypes/journey-multiscene-prototype-v1.md`  
**Runtime:** NOT_AUTHORIZED

## 1. Pathway brief

### Competence target
Reason about consequential choices by identifying relevant missing information before deciding, inspecting consequences, and revising when warranted.

Observable task performances:
- notices that relevant information is absent;
- compares decision processes rather than personalities;
- predicts or inspects a consequence;
- keeps or revises a choice with task-based reasoning;
- recognises the strategy in a changed context;
- attempts application beyond the original social surface.

### Claim ceiling
Completion establishes only pathway completion. Correct performance in one scene supports only local task-performance claims. Transfer requires changed-context evidence and must not be inferred from completion, route choice or character liking.

### Prohibited inferences
No inference about empathy, kindness, maturity, personality, social worth, anxiety, shyness, leadership, emotional type or psychological state.

## 2. Educational need
Shared decisions often require noticing which relevant information has not yet been gathered. The pathway externalises this reasoning through ordinary fictional situations without asking the learner to disclose personal conflict or biography.

## 3. Evidence and reasoning references
- `research/evidence-records-v1.yaml`
- `research/evidence/transfer-claim-calibration-records-v1.yaml`
- `research/evidence/error-agent-emotion-records-v1.yaml`
- `research/common/cognitive-load-attention-multimedia-screening-v1.md`
- `research/common/development-executive-metacognition-emotion-screening-v1.md`
- `governance/CHILD-SAFE-LEARNING-EXPERIENCE-CONSTITUTION-v1.md`
- `governance/PATHWAY-CONSTITUTION-REVIEW-CONTRACT-v1.yaml`

Reasoning chain:
`missing information problem → bounded fictional choice → inspect consequence → reconsider → name strategy → changed context → transfer probe`

Evidence does not establish that Journey/Crossroads is the optimal metaphor, that one route is universally correct, or that successful performance proves a stable transversal trait.

## 4. Narrative concept
The learner observes a fictional group facing a shared decision. The journey/crossroads representation is a controlled candidate for contextual continuity, never the source of essential meaning. Literal text remains complete and a non-metaphorical baseline exists.

Atmosphere: calm, exploratory, non-competitive, non-judgmental. No urgency, spectacle, reward economy or emotional escalation.

## 5. Character boundary
Characters are fictional task participants, not companions or confidants. They do not address the learner as intimate social agents, claim inner understanding of the learner, request biography, or persist across pathways as relationship-building entities.

No autonomous conversational agent is required for this version. Character dialogue, if rendered, is fixed/scripted and task-bound.

## 6. Safeguard profile
- sensitive personal disclosure required: **NO**;
- student account: **NO**;
- real name: **NO**;
- behavioural profile: **NO**;
- hidden score: **NO**;
- server telemetry: **NONE** for prototype candidate;
- persistent learner trace: **NO automatic persistence**;
- optional strategy trace: local-only keep/discard candidate;
- adult mediation: not intrinsically required for the fictional task, but human validation remains required before public runtime.

## 7. Data-flow declaration

| Interaction | Input | Processing | Server | Retention | Sensitive-data risk |
|---|---|---|---|---|---|
| Observe scenes | none | client presentation | no | none | none |
| Choose A/B/C | bounded enum | local state | no | session only | none intended |
| Keep/revise | bounded enum | local state | no | session only | none intended |
| Strategy match | bounded choice | local state | no | session only | none intended |
| Changed-context choice | bounded choice | local state | no | session only | none intended |
| Transfer probe | bounded choice in v1 | local state | no | session only | none intended |
| Strategy trace | generated fixed text | local device only if learner chooses | no | learner-controlled | none intended |

**Free text:** NONE in v1.  
**Accidental sensitive disclosure channel:** absent by design.  
**Network calls required for learner responses:** none.

## 8. Question-function inventory

| ID | Prompt/function | Class | Response | Personal data possible | Sensitive data possible | Review state |
|---|---|---|---|---|---|---|
| Q01 | Observe the fictional situation and continue | TASK_ORIENTATION | action | no | no | NOT_REVIEWED |
| Q02 | Identify what information is missing | EVIDENCE_INSPECTION | bounded selection | no | no | NOT_REVIEWED |
| Q03 | Choose one decision process A/B/C | STRATEGY_SELECTION | enum | no | no | NOT_REVIEWED |
| Q04 | Identify what changed after the choice | CONSEQUENCE_PREDICTION | bounded selection | no | no | NOT_REVIEWED |
| Q05 | Keep this way or try another? | REVISION | enum | no | no | NOT_REVIEWED |
| Q06 | Match strategy to the consequence it addresses | TASK_BOUND_REFLECTION | bounded match | no | no | NOT_REVIEWED |
| Q07 | Is the earlier strategy useful in the changed situation? | COMPARISON | bounded choice | no | no | NOT_REVIEWED |
| Q08 | What should be checked before deciding? | EVIDENCE_INSPECTION | bounded choice in v1 | no | no | NOT_REVIEWED |
| Q09 | Keep or discard the fixed strategy trace | REVISION | enum | no | no | NOT_REVIEWED |

No question asks about the learner's own exclusion, friendships, family, health, distress, secrets, identity or emotional history.

## 9. Cognitive/media controls
Stable composition is preserved across the first decision cycle. Visual change is local and pedagogically meaningful. No automatic transitions, decorative animation, reward symbol, moral colour coding or visual novelty solely for attention capture. Literal meaning remains available without the Journey layer.

## 10. Accessibility equivalence
A literal baseline reproduces all nine pedagogical functions without journey imagery. Essential meaning must not depend on colour, motion, sound or metaphor. Reduced-motion mode therefore changes no construct. Final accessibility review remains NOT_REVIEWED.

## 11. Emotional safety
The fictional situation uses ordinary uncertainty rather than intense interpersonal conflict. No sadness/shyness motive is assigned. No shame, fear, punitive exit or moral-worth feedback is used. Reconsideration is explicitly legitimate.

## 12. Transfer and claim calibration
Scene 7 changes surface context while preserving the underlying relation: relevant information is missing before a decision. Scene 8 moves beyond the social participation surface to source/information evaluation.

These are **transfer probes**, not proof of durable transfer. Multi-context performance would still require governed validation. No stable competence certification is authorised.

## 13. Consequence review

| Consequence/risk | Status | Control |
|---|---|---|
| Learner follows visual route rather than reasoning | plausible | equal route weighting + literal baseline + changed-context probe |
| Consultation is interpreted as moral correctness | plausible | trade-offs shown; no reward/punishment; no good-person language |
| Images replace rather than support memory | plausible | stable anchors + restrained change + literal retrieval checks |
| Social scenario triggers personal disclosure | low in v1 | no free text; no personal prompt; fictional distance |
| Route choice becomes profile signal | prohibited | no persistence/profile; explicit no-trait-inference rule |
| Metaphor becomes required for understanding | testable risk | literal baseline comparison; reject metaphor if clarity/transfer worsens |

## 14. Sustainability/resource proportionality
Reuse one stable composition where feasible. Motion is unnecessary. Learner interaction can operate without network calls. Generated visual assets must be justified by orientation or causal/narrative function. No environmental quantity is claimed without measurement.

## 15. Constitutional review snapshot

- structural contract mapping: **PARTIAL PASS — instantiated**;
- C1 trait inference: **PASS by design declaration**;
- C2 coercive engagement: **PASS by design declaration**;
- C3 error/emotional pressure: **PASS by design declaration**;
- C4 invasive disclosure: **PASS by design declaration**;
- C11 child-agent boundary: **PASS for v1 design because no conversational agent/free text is required; question inventory still awaits human review**;
- C14 privacy: **PASS by design declaration; no server response data**;
- C15 accessibility: **NOT_REVIEWED**;
- pedagogical human review: **NOT_REVIEWED**;
- developmental human review: **NOT_REVIEWED**;
- child-safety/privacy human review: **NOT_REVIEWED**;
- exact-head human review: **NOT_REVIEWED**.

## 16. Decision
This dossier is a **review candidate**, not a production specification. It deliberately removes unnecessary conversational-agent and free-text surfaces from the first governed pathway because the competence task does not require them. This is data minimisation and relational-risk elimination by architecture, not merely moderation after collection.

Promotion is blocked until mandatory human reviews and exact-head review pass and runtime authority is explicitly granted.