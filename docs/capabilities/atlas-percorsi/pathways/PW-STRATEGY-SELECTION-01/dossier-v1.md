# PW-STRATEGY-SELECTION-01 — Stesso obiettivo, strategia diversa

**Gate:** G1 — proposal for governed pathway registration  
**Status:** PATHWAY_TARGET_PROPOSAL / PRODUCT_SCREENPLAY_CANDIDATE / NOT_RUNTIME_AUTHORIZED  
**Developmental band:** LOWER_SECONDARY_CANDIDATE / HUMAN_VALIDATION_REQUIRED  
**Candidate territory:** `learning` only; territory taxonomy remains `CANDIDATE_NOT_APPROVED`  
**Runtime:** NOT_AUTHORIZED  
**Date:** 2026-10-04

## 1. Pathway brief

### Competence target

> Scegliere una strategia coerente con lo scopo del compito, controllarne gli effetti e cambiarla quando le evidenze o lo scopo cambiano.

The pathway is deliberately task-bound. It may support evidence that the learner can:

- identify the immediate goal of a bounded learning task;
- distinguish the goal from the material itself;
- select a strategy because it serves that goal, not because it is a preferred personal style;
- inspect a visible consequence of the strategy;
- keep, adapt or replace the strategy after evidence;
- apply the same selection principle to a materially different task.

### Educational need

The canonical Atlas research supports planning, monitoring, strategy selection and evaluation as relevant metacognitive/self-regulatory actions while explicitly rejecting psychological profiling and fixed learning-style classification.

This pathway therefore exercises **strategy–task fit**, not “what kind of learner are you?”.

### Boundaries

The pathway must not infer or store:

- learning style;
- intelligence, motivation, attention trait or executive-function profile;
- diligence, impulsivity, maturity or resilience;
- stable self-regulation competence;
- school performance prediction.

No personal study history, grades, family information, diagnosis, difficulty disclosure or free-text autobiography is required.

## 2. Evidence register

| ID | Governed source | Claim used here | Limitation / claim ceiling | Design consequence |
|---|---|---|---|---|
| E-001 | `research/common/development-executive-metacognition-emotion-screening-v1.md` | planning, monitoring, strategy selection and evaluation are legitimate learning actions to support | not a psychometric model; developmental appropriateness requires validation | make goals inspectable; compare strategies; support revision; record task performance only |
| E-002 | `research/common/transfer-of-learning-screening-v1.md` | transfer requires changed-context performance, not repeated completion | one changed task cannot certify broad competence | include a new task with changed goal/representation and an actual strategy application |
| E-003 | `research/common/cognitive-load-attention-multimedia-screening-v1.md` | avoidable representation/navigation burden should not consume resources needed for the competence | no universal numeric cognitive-load threshold | stable goal card, strategy tray and evidence panel; no decorative motion requirement |
| E-004 | `governance/CHILD-SAFE-LEARNING-EXPERIENCE-CONSTITUTION-v1.md` | competence is performance in context; reflection must be task-bound; privacy and learner agency are architectural | constitution itself still requires later promotion review | no profiling, no sensitive disclosure, recoverable error, no coercive reward mechanics |
| E-005 | `architecture/pathway-specific-narrative-architecture-v1.md` | metacognition may use notebook/trace devices when they serve strategy recognition | candidate narrative mapping, not a universal template | use a quiet “strategy bench” identity rather than Journey/Crossroads or a mascot |
| E-006 | `product/STUDENT-LIBRARY-PRODUCT-CONTRACT-v1.md` | product chain and local-growth evidence are mandatory boundaries | does not authorize runtime | screenplay, claim ceiling, safeguards and exact technical qualification required before Q9 |

No evidence above establishes that a particular learner “is” self-regulated or possesses a stable learning style.

## 3. Research reasoning

### What evidence supports

`goal → choose/predict → act → inspect evidence → compare with intention → revise → articulate what helped` is a justified candidate design cycle for a bounded metacognitive pathway.

The pathway should make **why a strategy fits** visible. Strategy names alone are insufficient evidence.

### What evidence does not establish

- that one strategy is universally best;
- that a learner's first choice reveals a stable preference;
- that repeated use in this pathway predicts school achievement;
- that a single transfer probe establishes general self-regulation;
- that speed or completion indicates competence.

### Negative knowledge

Do not implement:

- a “visual / auditory / reading learner” classification;
- a quiz that assigns a study profile;
- a productivity score;
- streaks or pressure to keep studying;
- “good student / bad student” framing;
- free-text personal study confession;
- a strategy recommendation engine based on hidden behavioural inference.

## 4. Narrative concept

### Subject / premise

The learner enters a quiet **strategy laboratory**. A fictional set of information is already provided; the learner does not need outside knowledge.

The first mission is to prepare for a **sequence reconstruction**. Later, the goal changes: the learner must explain a **cause–effect relation** in the same material. The strategy that fit the first goal is therefore not automatically sufficient for the second.

A final transfer task uses a different information surface and asks the learner to build a concrete comparison representation.

### Narrative engine

`GOAL → STRATEGY CHOICE → VISIBLE RESULT → EVIDENCE → GOAL CHANGE → STRATEGY REVISION → METHOD → NEW TASK → APPLIED TRANSFER`.

The narrative tension is cognitive, not emotional: “does the current strategy still serve the task?”.

### Metaphorical devices

Use:

- **goal card** — always literal and inspectable;
- **strategy tray** — bounded alternatives;
- **evidence window** — consequence of the chosen action;
- **switch marker** — shows that revising a strategy is allowed and meaningful;
- **method card** — names the principle after it has been exercised.

Reject:

- personality avatars;
- “brain type” graphics;
- reward meters;
- universal Journey/Crossroads metaphor;
- diary aesthetics that invite autobiographical disclosure.

### Atmosphere

Calm workbench / study-lab identity. Low stimulation, high information stability. No mascot and no essential animation.

## 5. Character bible

No character is required in version 1. The task uses fictional documents/cards, not simulated classmates or relational agents.

This removes unnecessary C11 relational-agent risk.

## 6. Safeguard profile

### Child safety and emotional boundary

- no shame or moral judgement after a poor strategy match;
- a mismatch is described as information about the task;
- revision is always available;
- no urgency, countdown or loss framing;
- no personal disclosure.

### Mediation

Candidate: autonomous public use after separate authorization; optional teacher mediation. This dossier does not authorize either.

### Privacy/data

| Interaction | Data needed | Location | Server | Retention |
|---|---|---|---|---|
| inspect goal/material | none | client | no | none |
| choose strategy | bounded choice | client | no | volatile session |
| inspect consequence | none | client | no | volatile session |
| revise strategy | bounded choice | client | no | volatile session |
| optional growth evidence | bounded achievement ID only | learner device | no | opt-in local only |
| reset/export | local record only | learner device | no | learner controlled |

No account, name, class identifier, telemetry, microphone, camera, location, contacts or generative agent.

### Accessibility / low-stimulation equivalence

- native semantic controls;
- full keyboard operation;
- deterministic focus movement;
- no colour-only strategy distinctions;
- all visual cards have literal text equivalents;
- stable layout under zoom/reflow;
- no essential motion or audio;
- touch targets suitable for mobile;
- comprehension cannot depend on the “laboratory” metaphor.

## 7. Common narrative grammar mapping

- [x] Context
- [x] Orient
- [x] Notice
- [x] Act/Choose
- [x] Consequence
- [x] Reconsider
- [x] Recognise/Name strategy
- [x] Changed context
- [x] Transfer
- [x] Learner-controlled trace

## 8. Storyboard / screenplay

The learner-facing product screenplay is specified in `product-screenplay-v1.md`.

Core functional sequence:

1. **M1 GOAL** — inspect a sequence-reconstruction goal and neutral information cards.
2. **M2 CHOOSE** — select a strategy for that goal.
3. **M3 CONSEQUENCE** — inspect what the selected strategy makes easy or difficult.
4. **M4 CHECK** — decide whether to keep or adjust based on evidence.
5. **M5 GOAL CHANGE** — same material, new cause–effect goal.
6. **M6 REVISE** — select a strategy that now fits the changed goal.
7. **M7 METHOD** — name the principle: strategy follows task and evidence.
8. **M8 TRANSFER** — new material and a new comparison goal; choose a concrete working representation.
9. **M8B APPLY** — apply that representation to the supplied comparison data; growth evidence is withheld until this succeeds.
10. **M9 TRACE** — terminal summary/local-growth control.

The exact implementation may branch, but a cosmetic branch is not sufficient.

## 9. Consequence review

| Consequence | Type | Control |
|---|---|---|
| learner may read strategy choice as judgement of intelligence | adverse | feedback refers only to goal/fit/consequence |
| one strategy may appear universally superior | adverse | goal changes so different strategies become useful |
| interface may create memory burden unrelated to competence | adverse | goal and evidence remain visible |
| learner may think “my first choice defines my style” | adverse | explicit text: strategies are tools, not identities |
| successful changed-task performance may be overclaimed as broad transfer | adverse | local evidence wording + explicit claim ceiling |
| revision may be interpreted as failure | adverse | revision framed as expected response to evidence |

## 10. Sustainability/resource proportionality

Version 1 requires no generated media, animation, audio or network services. Stable text/card compositions are sufficient. Reuse shared Experience Engine and local-growth components.

## 11. Validation plan

### H1

Lower-secondary learners can understand that strategy choice should depend on the current task goal rather than on a fixed personal “best method”.

**Support:** learners can select a fitting strategy, apply it to the task, inspect the visible consequence, and revise with a second applied representation when the goal changes.

**Reject/change:** learners interpret alternatives as personality categories, cannot identify what changed, or select based on wording cues rather than task structure.

### H2

The transfer task elicits an applied strategy choice in a different information structure.

**Support:** learner selects a concrete comparison representation and then applies it correctly to the new museum-route data.

**Reject/change:** learner merely repeats the method statement from M7 or can pass without using the new task information.

### Human validation safeguards

No covert psychological profiling or persistent individual behavioural scoring. Review language for lower-secondary plausibility and non-infantilising tone.

## 12. Decision log

| Date | Decision | State | Rationale |
|---|---|---|---|
| 2026-10-04 | focus on task-fit strategy selection | PROPOSED | strongest uncovered territory with mature internal evidence |
| 2026-10-04 | territory limited to `learning` | PROPOSED | avoid premature personal taxonomy; competence is school-task bound |
| 2026-10-04 | no characters/agent in v1 | PROPOSED | no cognitive need; removes relational/disclosure surface |
| 2026-10-04 | no free text | PROPOSED | bounded evidence sufficient for first candidate |
| 2026-10-04 | every growth event requires applied task performance, not strategy-label selection | PROPOSED | prevents overclaiming from recognition/guessing and aligns C9/C12/C13 |
| 2026-10-04 | transfer must include selection plus applied comparison | PROPOSED | aligns C12 and previous PW-CONSTRAINTS review lesson |

## 13. Product/specification handoff readiness

Current state: **READY_FOR_EXACT_HEAD_PRODUCT_CANDIDATE_REVIEW**, not runtime authorization.

Before Atlas registration:

- evidence and reasoning traceable: yes;
- narrative identity competence-derived: yes;
- child-safety/privacy inventory: yes at document level;
- accessibility equivalent: specified;
- emotional safeguards: specified;
- consequence review: complete at proposal level;
- validation plan: specified;
- runtime authority: **not granted**.

`RUNTIME_AUTHORIZATION = NOT_RUNTIME_AUTHORIZED`.
