# Atlas Percorsi — First-Cycle Digital Learning Experience Research Screening v1

**Status:** RESEARCH_SCREENING / DESIGN_INPUT / NOT_RUNTIME_AUTHORIZATION  
**Target:** Italian first-cycle learner-facing Percorsi, with particular attention to lower-secondary ages  
**Date:** 2026-10-04

## 1. Research question

What design characteristics should govern Atlas Percorsi for first-cycle learners so that experiences are cognitively understandable, visually meaningful, interactive, motivating without manipulation, and suitable for mobile use?

This screening does **not** claim that one interface pattern is universally optimal. It extracts bounded design consequences from evidence on interactive learning, scaffolding, inquiry/simulation, narrative learning, gamification and mature interactive-learning products.

## 2. Evidence boundary

The evidence base is heterogeneous.

- Some studies are directly relevant to middle/high school inquiry and secondary learners.
- Some meta-analyses aggregate several education levels.
- Touchscreen evidence includes younger children and is used only for the bounded claim that direct manipulation can support learning when the interaction is meaningfully tied to representation; it is **not** used to infer effect sizes for lower-secondary learners.
- Product examples such as PhET, Brilliant and Labster are design precedents, not independent proof of effectiveness.
- Gamification evidence is mixed by age, duration, discipline and design; therefore Atlas must not equate engagement with points, streaks, badges or leaderboards.

## 3. Screened evidence

### E1 — Regulated-learning scaffolding

Shao et al. (2023), *Effects of regulated learning scaffolding on regulation strategies and academic performance: A meta-analysis*, Frontiers in Psychology. DOI: 10.3389/fpsyg.2023.1110086.

Screened findings:
- overall regulated-learning scaffolding showed a moderate effect (`g = 0.587`);
- composite tools, scripts and visual/group-awareness supports can help planning, regulation and reflection;
- grade level, subject and cooperation moderate effects;
- composite tools combine question guides, visual diagrams, constructive modules/templates and visual/auditory hints.

Design consequence for Atlas:
- make goal, current state, manipulable evidence and feedback visible in the same experience;
- use small, task-bound progress/state cues rather than explanatory metacognitive prose;
- scaffolds should help the learner act, monitor and revise, then fade or recede.

### E2 — Inquiry/simulation for middle and high school

Peffer et al. (2015), *Science Classroom Inquiry (SCI) Simulations: A Novel Method to Scaffold Science Learning*, PLOS ONE. DOI: 10.1371/journal.pone.0120638.

Screened findings:
- students solved scientific problems through investigation and hypothesis testing rather than step-only instruction;
- the authors report that 67% of students said the simulation changed how they perceived authentic science practice;
- the study reports no material difference between middle- and high-school groups on the surveyed variables, while explicitly noting limited power for age comparisons;
- the authors argue for technology that supports authentic inquiry rather than merely presenting content.

Design consequence for Atlas:
- prefer **situated problems with manipulable evidence and consequences** over explanatory page sequences;
- create a space where the learner can try, inspect and revise;
- do not infer a universal effect from one study; use this as support for the authenticity/situated-action direction.

### E3 — Direct manipulation / touchscreen interaction

Xie et al. (2018), *Can Touchscreen Devices be Used to Facilitate Young Children's Learning? A Meta-Analysis of Touchscreen Learning Effect*, Frontiers in Psychology. DOI: 10.3389/fpsyg.2018.02580.

Screened findings:
- 36 studies / 79 effect sizes / 4,206 participants aged 0–5;
- pooled effect `d = 0.46`, with very high heterogeneity and strong moderation;
- the review connects touchscreen learning to physical manipulation and embodied interaction.

Design consequence for Atlas:
- the age population is younger than our target, so no quantitative transfer is permitted;
- retain only the qualitative design hypothesis: when touch interaction directly changes or organises the represented learning object, it may be more meaningful than tapping “next”;
- mobile interactions should therefore favour drag/order/connect/reveal/compare/manipulate when those actions represent the cognitive work.

### E4 — Gamification meta-analysis

Li et al. (2023), *Examining the effectiveness of gamification as a tool promoting teaching and learning in educational settings: a meta-analysis*, Frontiers in Psychology. DOI: 10.3389/fpsyg.2023.1253549.

Screened findings:
- 41 studies / 49 samples / >5,000 participants;
- overall effect was positive, but effects were strongly moderated by learner type, discipline, design principles, duration and environment;
- secondary-school subgroup effects were much weaker than primary/higher-education effects in this meta-analysis;
- the authors report that design combinations including mechanics, dynamics and aesthetics differed materially from aesthetics/dynamics without clear mechanics.

Design consequence for Atlas:
- do not “gamify” by decoration;
- if gameful elements are used, they must be structurally tied to rules, agency, consequence and learning action;
- secondary-age learners require especially careful tailoring; no assumption that badges/points automatically improve learning.

### E5 — Gamification and motivation

Ratinho & Martins (2023), *The role of gamified learning strategies in student's motivation in high school and higher education: A systematic review*, Heliyon. DOI: 10.1016/j.heliyon.2023.e19033.

Screened findings:
- review of 40 studies;
- gamification often improves motivation, but novelty and extrinsic rewards can produce short-term gains followed by decline;
- the authors call for attention to long-term exposure and individual differences in competition/cooperation preferences.

Design consequence for Atlas:
- learner pleasure should come from curiosity, agency, mastery, discovery, consequence and aesthetic quality;
- points, streaks, leaderboards, artificial urgency and reward harvesting must not become the motivational engine.

### E6 — Narrative engagement and critical inquiry

Gasser, Dammert & Murphy (2022), *How Do Children Socially Learn from Narrative Fiction: Getting the Lesson, Simulating Social Worlds, or Dialogic Inquiry?*, Educational Psychology Review. DOI: 10.1007/s10648-022-09667-4.

Screened findings:
- the review distinguishes information-extraction, expressive/lived-through and critical-analytic stances;
- expressive and critical-analytic approaches are identified as especially promising for sociomoral learning;
- intentional stance selection is more likely to support the desired developmental outcome than leaving the stance implicit.

Design consequence for Atlas:
- narrative context should not exist merely as decoration or “story skin”;
- the experience may use narrative to place the learner inside a meaningful situation and to support perspective, consequence and critical examination;
- narrative form must be chosen for the cognitive action, not as a universal style.

## 4. Mature product precedents

These examples are not treated as evidence authority. They are used to identify recurring interaction patterns already proven viable as products.

### PhET Interactive Simulations

PhET states that students learn best as active participants; its simulations are designed to invite curiosity and productive struggle. PhET also reports using 4–6 think-aloud interviews with individual students during simulation design.

Relevant precedent:
- direct manipulation of the phenomenon/model;
- high learner autonomy with carefully designed goals/questions;
- user testing with real students;
- the simulation itself remains the dominant surface rather than a stack of explanatory cards.

Atlas adaptation:
- use manipulable representations where the cognitive action benefits from them;
- adopt target-age think-aloud testing as a product-development practice, not as a psychometric test.

### Brilliant

Brilliant describes learning as interactive/visual and commonly uses direct manipulation, typed constructions, drag/drop and immediate feedback. Its core curriculum is presented as usable from roughly age 10 when prerequisites are present.

Relevant precedent:
- “learn by doing” rather than long reading;
- immediate state feedback;
- visual models and manipulable problems.

Atlas boundary:
- do not import streak/leaderboard/retention mechanics; Atlas governance explicitly rejects manipulative engagement loops.

### Labster

Labster places learners inside interactive stories and realistic lab-like tasks, primarily for high school/higher education, with some middle-school collections.

Relevant precedent:
- scenario/world provides a reason for the task;
- actions occur inside a coherent environment;
- representations and procedures are tied to disciplinary practice.

Atlas boundary:
- Atlas should remain much lighter, privacy-first and device-efficient; it does not need 3D realism to gain the benefit of situated action.

## 5. Synthesis — what should become canonical

### 5.1 Situation before pedagogy

The learner must first understand:
1. where they are / what situation is occurring;
2. what information or objects are available;
3. what will happen next;
4. what concrete action is required.

Pedagogical constructs remain internal until the learner has experienced the relevant cognitive move.

### 5.2 Representation before explanation

When a relationship can be shown and manipulated, prefer representation to prose:
- order → timeline/sequence lane;
- cause → causal chain/network;
- comparison → aligned table or split view;
- missing information → evidence board/gaps;
- constraints/trade-offs → workspace with visible constraints and alternatives;
- system behaviour → simple microworld/simulation.

Text explains only what cannot be made clear by the representation itself.

### 5.3 Interaction must perform cognitive work

Allowed examples:
- move/order;
- connect;
- compare;
- reveal;
- annotate/evidence-mark;
- construct;
- test;
- revise;
- switch viewpoint;
- manipulate a variable when causally meaningful.

Weak interaction:
- repeated “next”;
- choosing a card solely to advance;
- decorative dragging;
- quiz selection when the task is actually construction/analysis.

### 5.4 One dominant stage, not a stack of cards

A pathway should have one primary learner-visible **stage/workspace** that evolves.

Cards/panels may exist as:
- evidence fragments;
- tools;
- transient details;
- compact supporting information.

They must not be the visible organising concept of the pathway.

### 5.5 Feedback should change the world

Prefer:
- objects move/reconfigure;
- comparison exposes a conflict;
- missing evidence remains visibly unresolved;
- a causal link succeeds/fails;
- the environment changes after a learner choice.

Use explanatory text as a secondary layer.

### 5.6 Growth should be visible but quiet

Use small, local progress/traces tied to performed actions.

Do not let progress chrome compete with the task. No leaderboards, global score, streak pressure or public comparison.

## 6. Human-use validation direction

For first-cycle pathways, automated QA is not enough.

Minimum product-review practice:
- adult plain-language review;
- target-age learner observation before promotion;
- task-based think-aloud or “what do you think you need to do now?” prompts;
- observe first interpretation, first action, hesitation, unnecessary rereading, scroll/search behaviour and recovery after error;
- do not collect sensitive personal disclosures;
- do not treat the session as psychometric assessment.

Recommended reference practice: PhET commonly uses 4–6 individual think-aloud interviews per simulation during design. Atlas may adopt a similar small formative sample where feasible, but this is a product-testing practice, **not a statistical validation minimum**.

## 7. Research conclusion

The strongest cross-source design direction is not “more cards” or “more gamification”.

It is:

`SITUATED PROBLEM → VISIBLE MATERIAL → DIRECT COGNITIVE ACTION → VISIBLE CONSEQUENCE → REVISION → CHANGED CONTEXT`

Visual quality matters because it makes structure, continuity, hierarchy and consequence perceptible. Interaction matters because the learner should perform the cognitive action, not merely answer about it.

Atlas Percorsi should therefore move from **document-like interactive lessons** toward **small, coherent learning environments** whose representation is selected according to the cognitive action required.

## 8. References reviewed

- Shao J. et al. (2023). Frontiers in Psychology 14:1110086. https://doi.org/10.3389/fpsyg.2023.1110086
- Peffer M.E. et al. (2015). PLOS ONE 10(3):e0120638. https://doi.org/10.1371/journal.pone.0120638
- Xie H. et al. (2018). Frontiers in Psychology 9:2580. https://doi.org/10.3389/fpsyg.2018.02580
- Li M. et al. (2023). Frontiers in Psychology 14:1253549. https://doi.org/10.3389/fpsyg.2023.1253549
- Ratinho E., Martins C. (2023). Heliyon 9(8):e19033. https://doi.org/10.1016/j.heliyon.2023.e19033
- Gasser L., Dammert Y., Murphy P.K. (2022). Educational Psychology Review 34:1445–1475. https://doi.org/10.1007/s10648-022-09667-4
- PhET Interactive Simulations — Research / Teaching with PhET, University of Colorado Boulder.
- Brilliant — product/help documentation on interactive learning.
- Labster — high-school / simulation product documentation.
