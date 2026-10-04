# Atlas Percorsi — First-Cycle Learner Experience Specification v1

**Status:** PROPOSED_CANONICAL_PRODUCT_SPEC / HUMAN_REVIEW_REQUIRED  
**Runtime:** NOT_AUTHORIZED  
**Applies to:** first-cycle learner-facing Atlas Percorsi  
**Evidence basis:** `research/common/first-cycle-digital-learning-experience-screening-v1.md`

## 1. Product objective

A Percorso for first-cycle learners is not a digital worksheet, slideshow, questionnaire or sequence of explanatory cards.

It is a **small learning environment** in which the learner can understand a situation, act on a meaningful representation, observe a consequence, revise and later use what was learned in a changed situation.

Canonical learner-experience chain:

`SITUATION → VISIBLE MATERIAL → CLEAR CHALLENGE → DIRECT ACTION → VISIBLE CONSEQUENCE → REVISION → CHANGED CONTEXT → QUIET TRACE`

Internal educational constructs may be more sophisticated. They must be translated before reaching the learner surface.

## 2. First 10 seconds rule

Before the first meaningful action, the learner surface must make these four things understandable without teacher explanation:

1. **What is happening?**
2. **What do I have in front of me?**
3. **What will happen next?**
4. **What do I need to do?**

The exact number of seconds is not an automated pass threshold. “First 10 seconds” is a Human Review lens: the opening must not require prolonged decoding of pedagogical language, navigation chrome or decorative narrative before the task becomes intelligible.

If the reviewer must explain the interface verbally, the opening has failed.

## 3. Learner language

### 3.1 Write for action

Prefer concrete verbs:

- osserva;
- trova;
- rimetti;
- collega;
- confronta;
- scegli;
- sposta;
- prova;
- controlla;
- cambia;
- costruisci.

Avoid requiring the learner to decode professional terms such as:

- metacognizione;
- strategia di apprendimento;
- goal–strategy fit;
- trasferimento;
- competenza;
- evidenza di crescita;
- trade-off;
- revisione del processo.

These may appear only when:
- they are themselves curriculum content; or
- the learner has already experienced the concrete phenomenon and naming it adds value.

### 3.2 Experience before naming

Preferred:
`DO → NOTICE → NAME IF USEFUL`

Avoid:
`NAME THEORY → EXPLAIN THEORY → ASK LEARNER TO SIMULATE IT`

## 4. Representation policy

### 4.1 Representation before explanation

When structure can be seen and manipulated, prefer a visual/interactive representation to prose.

| Cognitive action | Preferred representation |
|---|---|
| sequence / chronology | timeline, ordered lane, spatial sequence |
| cause/effect | causal chain, network, before/after mechanism |
| compare | aligned table, split view, common-scale comparison |
| missing information | evidence board, gaps, source set |
| constraints / trade-offs | design workspace, constraint rail, alternative models |
| system behaviour | microworld, manipulable model, state-change simulation |
| perspective | scene/viewpoint switch, annotated environment |
| classification | spatial grouping only when classification itself is the task |

Text should support the representation, not duplicate everything visible in it.

### 4.2 No card-stack product

Cards are permitted as implementation primitives or as meaningful objects such as:
- an evidence fragment;
- a source;
- a tool;
- an alternative;
- a clue;
- a compact data object.

A pathway fails if the visible experience is primarily:

`CARD → NEXT CARD → NEXT CARD → QUIZ CARD → RESULT CARD`

Removing card borders must still leave a coherent situation and action model.

## 5. Interaction policy

Interaction must perform cognitive work.

Strong interactions:
- reorder events;
- connect causes and effects;
- move evidence into a hypothesis;
- compare alternatives on shared criteria;
- reveal information by inspecting the right object;
- manipulate a variable whose effect matters;
- construct a solution;
- revise after visible consequence;
- switch viewpoint when viewpoint is the learning action.

Weak interactions:
- tap “next” repeatedly;
- drag for decoration;
- select a card when the real task is analysis/construction;
- answer a multiple-choice question about a relation that could instead be directly built;
- interaction that changes animation but not meaning.

### 5.1 Direct manipulation rule

When feasible and accessible, the learner should act on the same representation that carries the concept.

Examples:
- to learn sequence, move sequence objects;
- to learn comparison, manipulate the comparison;
- to learn causal structure, construct causal links.

A separate detached quiz is secondary, not the default.

## 6. Feedback policy

Feedback should first alter or clarify the **state of the learner's work**.

Prefer:
- a link visibly fails to explain the evidence;
- a missing piece remains unresolved;
- two constraints visibly conflict;
- the model changes after a learner action;
- an ordered sequence can be compared with the source;
- a new consequence appears.

Then, if useful, add a brief explanation.

Avoid:
- generic “Corretto!” / “Sbagliato!” as the only consequence;
- motivational praise unrelated to the task;
- opaque scores;
- reward effects that compete with understanding.

## 7. Visual quality

Visual design is part of the educational representation.

Required qualities:
- clear focal point;
- strong information hierarchy;
- one dominant learner-visible stage;
- stable spatial anchors;
- perceptible state change;
- age-appropriate dignity;
- no infantilising mascot/iconography by default;
- no sterile institutional worksheet appearance;
- no decorative motion without information value;
- typography sized for mobile reading without forcing the task into excessive vertical scroll.

### 7.1 One dominant stage

The learner should perceive **one place in which the work is happening**.

Navigation, progress and help are secondary chrome.

The stage may transform across the pathway, but continuity anchors should remain so that the learner feels “the same situation is evolving” rather than “a new webpage appeared”.

## 8. Mobile-first composition

For common phone widths, aim to keep:
- current mission/question;
- manipulated material;
- immediate action

perceptually connected.

Do not require the learner to remember instructions that have scrolled far off-screen while manipulating material.

Mobile chrome requirements:
- mission compact and non-overlaying;
- progress quiet;
- no persistent controls covering task content;
- no horizontal overflow;
- touch targets remain accessible;
- dense comparison views recompose rather than shrink into unreadable tables.

## 9. Rhythm

A Percorso should not maintain one constant prompt-response cadence.

Recommended rhythm:

`ORIENT → ACT → SEE CONSEQUENCE → SHORT PAUSE → CHANGE QUESTION → RECONFIGURE → ACT AGAIN → TRANSFER`

Use variation because the cognitive action changed, not to create novelty.

The learner should periodically experience:
- anticipation;
- manipulation;
- discovery;
- reconsideration;
- mastery.

## 10. Motivation and gamefulness

Allowed motivational sources:
- curiosity;
- competence/mastery;
- autonomy;
- meaningful choice;
- visible consequence;
- discovery;
- aesthetic quality;
- narrative continuity;
- solving a real-looking problem.

Not allowed as the primary engine:
- streak pressure;
- loot/reward harvesting;
- artificial countdowns;
- public ranking;
- empty XP;
- compulsive retention loops.

Badges/traces may record a bounded accomplishment locally, but must not substitute for an intrinsically meaningful task.

## 11. Narrative/context

Narrative is not a universal visual skin, but **narrative presence is mandatory whenever the learning task depends on consequence, uncertainty, perspective, decision, social meaning or causality**.

For those pathways, context alone is insufficient. The experience must define and visibly carry:

1. **someone** — one or more actors with bounded roles;
2. **somewhere** — a world, place or situation that remains perceptible;
3. **something wanted** — a goal meaningful inside that situation;
4. **something changed** — an event/problem that creates the learner's task;
5. **learner role** — why the learner is being asked to act;
6. **information carriers** — characters, artefacts or environmental cues that provide partial information;
7. **consequence** — what changes because of the learner's action;
8. **continuity** — the world and actors persist across scenes unless transfer deliberately changes context.

A pathway fails this requirement if its “story” can be removed without changing the learner's reason for acting.

**Thin narrative skin is not sufficient.** A paragraph of setup followed by generic cards/buttons is still a worksheet-like experience.


A pathway may use:
- realistic situation;
- fictional situation;
- investigation;
- workshop/design studio;
- map/exploration;
- simulation/microworld;
- viewpoint scene.

Narrative must create meaning for the action, not add prose before the real exercise.

Where characters are used, they must be **cognitive/narrative actors**: they carry viewpoint, partial knowledge, uncertainty, goals or consequences. Decorative mascots do not satisfy narrative presence.

The learner should be able to answer “why am I doing this here?” from the situation itself.

## 12. Canonical visual-interaction patterns

These patterns are **selection grammars**, not reusable page templates.

### Pattern A — OPERATIVE WORKBENCH

Use when the learner must:
- organise;
- compare;
- construct;
- revise;
- choose among procedures/tools.

Composition:
- central persistent workspace;
- visible source/material;
- small tool rail or tool drawer;
- work product remains on stage;
- consequences alter the same stage;
- progress is peripheral.

Good fit:
- strategy selection;
- design;
- planning;
- trade-offs;
- revision.

Avoid:
- turning every tool into a large explanatory card;
- replacing construction with multiple choice.

Current recommended use:
- `PW-STRATEGY-SELECTION-01`;
- workbench/design-studio variant for `PW-CONSTRAINTS-TRADEOFFS-01`.

### Pattern B — EVIDENCE BOARD / CASEFILE

Use when the learner must:
- notice missing information;
- inspect sources;
- distinguish evidence from claim;
- form/revise a hypothesis;
- connect clues.

Composition:
- persistent evidence field;
- source objects/clues;
- unresolved gaps visibly remain;
- hypothesis or question area;
- source provenance visible where relevant;
- learner moves/links evidence rather than only answering questions.

Good fit:
- critical information literacy;
- source reliability;
- missing-information reasoning;
- inquiry/mystery.

Current recommended use:
- `PW-MISSING-INFORMATION-01`;
- source-evaluation Percorsi.

Avoid:
- detective-themed decoration that overwhelms evidence;
- fake suspense unrelated to reasoning.

### Pattern C — MICROWORLD / SPATIAL SCENE

Use when the learner must:
- understand a system;
- see consequences unfold;
- manipulate variables;
- navigate spatial alternatives;
- take another viewpoint.

Composition:
- simple coherent scene/model/map;
- manipulable objects/variables embedded in it;
- state changes visible in-place;
- annotation/details appear on demand;
- learner remains oriented spatially.

Good fit:
- sustainability/system consequences;
- technology/system behaviour;
- route/resource decisions;
- perspective-taking.

Avoid:
- 3D/animation merely for spectacle;
- high asset cost when a 2D model conveys the same relation;
- hidden rules that make outcomes feel arbitrary.

## 13. Pattern selection rule

Choose a pattern from the **dominant cognitive action**, not from visual preference.

Decision prompt:

1. What must the learner physically/cognitively do?
2. What representation makes that action visible?
3. What changes after the action?
4. Which pattern makes the change understandable with the least explanatory prose?

Hybrid patterns are allowed, but one must remain dominant.

## 14. Human-use review protocol

Automated accessibility/CI does not certify comprehension.

Before product promotion of a first-cycle pathway:

### H1 — Adult plain-language review
A reviewer who has not authored the pathway explains:
- what is happening;
- what the learner must do next.

If this requires reading governance documentation, fail.

### H2 — Target-age formative observation
Where feasible, observe a small set of learners in the intended age band.

Ask task-bound prompts such as:
- “Che cosa pensi di dover fare adesso?”
- “Che cosa puoi toccare/spostare/cambiare?”
- “Che cosa è successo quando hai fatto quella scelta?”

Observe:
- first interpretation;
- first action;
- hesitation;
- unnecessary rereading;
- navigation searching;
- whether visual representation is understood;
- recovery after error;
- whether the learner can explain what changed.

Do not solicit sensitive personal information.

PhET's practice of 4–6 individual think-aloud interviews per simulation is a useful mature-product reference. Atlas does not treat that number as a statistical validity threshold.

### H3 — Mobile human review
Review the real learner surface on a phone-sized viewport/device.

Fail if:
- key instructions are separated from the material they govern;
- chrome covers the task;
- the representation is unreadable;
- the learner must scroll repeatedly merely to remember what to do;
- controls are technically accessible but perceptually unclear.

## 15. Product gate questions

A first-cycle Percorso cannot pass Experience Quality Review unless Human Review can answer YES to all:

1. Can a learner understand the concrete task without educational jargon?
2. Is the main cognitive relationship represented, not merely described?
3. Does the learner perform the cognitive action directly?
4. Does feedback reveal something about the learner's work?
5. Does the experience have one coherent stage/world?
6. Are cards secondary objects rather than the visible product structure?
7. Is the interaction meaningful on mobile?
8. Does visual quality help comprehension and orientation?
9. Is motivation based primarily on curiosity/agency/mastery rather than rewards?
10. Does a changed-context task require actual use, not recognition of a label?
11. Where consequence/perspective/causality is central, are world, actors, learner role and narrative engine visibly present rather than merely described?
12. Could the story/characters be removed without changing why the learner acts? If yes, narrative presence has failed.

A NO returns the pathway to design/remediation.

## 16. Existing pathway remediation

No grandfathering.

Before future product closure/Q9:
- `PW-STRATEGY-SELECTION-01` must be re-reviewed using Pattern A and this spec;
- `PW-MISSING-INFORMATION-01` must be reviewed against Pattern B or an explicitly justified alternative;
- `PW-CONSTRAINTS-TRADEOFFS-01` must be reviewed against a workbench/design-studio representation or an explicitly justified alternative.

Prior CI, technical qualification or earlier Human Review does not substitute for this spec.

## 17. Authority boundary

This document defines a product-design and Human Review standard.

It does not:
- authorize runtime;
- approve any territory taxonomy;
- authorize learner tracking;
- approve a specific pathway;
- replace accessibility/privacy/child-safety gates.

Q9 remains separate.
