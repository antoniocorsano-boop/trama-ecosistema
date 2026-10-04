# PW-STRATEGY-SELECTION-01 — Compact World Design v1

**World:** MUSEO ZERO — *La sala che non torna*  
**Status:** WORLD_DESIGN_CANDIDATE / HUMAN_REVIEW_REQUIRED  
**Runtime:** NOT_AUTHORIZED  
**Atlas implementation:** BLOCKED pending product review  
**Governing spec:** ../../product/COMPACT-LEARNING-WORLD-SPEC-v1.md

# 1. World Brief

## Premise

Tomorrow morning a small contemporary museum opens a new interactive installation called **Luce Viva**.

During the last evening rehearsal, the room behaves incorrectly: the illuminated route that should guide visitors through the installation now points toward a closed service passage instead of the final exit.

Nobody is in danger. The problem is practical and visible:

> **the room no longer guides visitors the way the crew designed it.**

The evening crew has limited time before it must decide whether the room is ready for opening.

## Why the learner is there

The learner is the newest member of the evening setup crew.

They have access to:
- the exhibition room;
- the control booth;
- the crew's shared tablet;
- recent setup notes;
- rehearsal observations;
- a test mode that lets them run the installation safely.

The learner is not an outside student answering questions about a museum.

They are part of the crew trying to **make the room work**.

## The world before the learner acts

Several changes happened during setup:

1. **Lia** moved one illuminated panel so the route would leave more turning space near an exhibit;
2. **Omar** later adjusted the control sequence while working from an older room layout;
3. **Teo** ran the final visitor rehearsal and saw the lights point toward the wrong passage.

These facts are not initially shown as one explanatory list.

They are distributed across:
- physical locations;
- character recollections;
- timestamps;
- the current room state;
- the control log;
- a test replay.

## Intrinsic unresolved question

> **Why is Luce Viva sending visitors the wrong way?**

The question matters because the learner can see the problem, investigate it, test explanations and eventually make the room behave differently.

## Desired emotional register

- curiosity;
- mild urgency;
- collaborative problem solving;
- satisfaction from making a system understandable.

Avoid:
- danger;
- panic;
- adult-pressure framing;
- artificial countdowns;
- punishment for wrong exploration.

# 2. Learner Role

**Role:** junior exhibition technician / investigation partner.

This role is functional because it gives the learner permission to:

- inspect the room;
- open the control log;
- replay the last test;
- ask each crew member about a specific change;
- build a timeline;
- switch to a causal representation;
- run a repair simulation;
- recommend the next setup action.

The learner does not merely choose among teacher-authored answers.

Their work changes:
- what the crew understands;
- what repair is attempted;
- the final state of the installation.

# 3. World Locations

The world is a compact illustrated 2-D museum with four connected locations.

## L1 — Atrio / ingresso

Purpose:
- establishes the visitor route and intended destination;
- shows the installation from a visitor's point of view.

Available information:
- floor map;
- accessibility route marker;
- opening notice;
- current “ready / not ready” status.

Possible actions:
- inspect route;
- compare intended vs current path;
- move to Sala Luce Viva.

## L2 — Sala Luce Viva

Purpose:
- primary world stage;
- learner can visibly run the installation.

Visible objects:
- illuminated panels;
- visitor route;
- final exit;
- closed service passage;
- interactive wall.

Possible actions:
- run test;
- inspect panel positions;
- compare intended and actual route after enough evidence is found.

Consequence:
- the room visibly guides the simulated visitor correctly or incorrectly.

## L3 — Cabina di controllo

Purpose:
- contains system sequence and timestamps.

Available information:
- current configuration;
- previous configuration;
- timestamped change log;
- test button;
- simple system-state diagram.

Possible actions:
- inspect changes;
- pin log entries as evidence;
- compare configuration states.

## L4 — Laboratorio / deposito

Purpose:
- stores moved components and setup notes.

Available information:
- sketch of Lia's panel move;
- physical panel label;
- old printed floor plan used by Omar;
- short rehearsal note from Teo.

Possible actions:
- inspect artefacts;
- compare old/current room layouts;
- ask characters about one artefact.

# 4. Character System

Characters are not avatars added to instructions. Each carries partial information and has a job in the world.

## Lia — allestimento spaziale

Knows:
- why one illuminated panel was moved;
- what the current visitor route should accommodate;
- where the new panel position is.

Does not know:
- which control sequence Omar loaded afterward.

Learner value:
- carries **spatial evidence**.

Natural line:
> “Ho spostato questo pannello qui. Il passaggio prima era troppo stretto.”

## Omar — controllo interattivo

Knows:
- when the sequence was changed;
- which configuration file was loaded;
- what the controller expects the room geometry to be.

Does not initially realise:
- the printed floor plan he used was outdated.

Learner value:
- carries **system/configuration evidence**.

Natural line:
> “La sequenza funzionava sullo schema che avevo. Aspetta… questo è davvero l’ultimo layout?”

## Teo — prova visitatori

Knows:
- when the final rehearsal happened;
- where the simulated visitor was sent incorrectly;
- that earlier in the evening the route looked different.

Learner value:
- carries **outcome evidence**.

Natural line:
> “Nel test delle 19:10 andava bene. In quello delle 19:42 ci ha mandato verso la porta di servizio.”

## Relationship model

They are cooperative, not caricatures.

There is no “smart one”, “messy one” or “anxious one”.

Narrative tension comes from:
- partial information;
- changes happening at different times;
- a mismatch between physical room state and control configuration.

# 5. Role / Agency Map

| Learner action | Why it matters | World response |
|---|---|---|
| choose which location to inspect | creates investigative autonomy | different evidence becomes visible |
| ask a character about an artefact | reveals contextual evidence | dialogue changes based on inspected object |
| pin an evidence item | externalises working memory | evidence tray updates |
| build a timeline | answers “what changed first?” | crew can compare sequence |
| run room test | checks current state | visitor-light route visibly succeeds/fails |
| switch to causal map | answers “what produced the failure?” | causal relations can be constructed |
| test a repair | applies interpretation | installation state changes |
| recommend opening/not-ready | creates meaningful closure | crew adopts next action |

## Agency boundary

The learner may investigate in different orders.

The final causal explanation is constrained by evidence, but the **path to it is not a fixed Next/Next/Next sequence**.

# 6. Information Distribution Map

No single source explains the whole problem.

| Information | Location/carrier | Initially visible? | Why learner needs it |
|---|---|---:|---|
| intended visitor route | Atrio map | yes | establishes expected state |
| current wrong route | Sala Luce Viva test | yes | establishes visible problem |
| panel was moved | Lia + laboratory sketch | no | identifies physical change |
| time of panel move | setup log | no | chronology |
| control sequence changed later | cabina log + Omar | no | chronology/system state |
| Omar used old plan | old print in laboratory | discoverable | causal mismatch |
| last good test | Teo rehearsal note | no | narrows failure window |
| first bad test | Teo rehearsal note | no | narrows failure window |
| new panel position | room inspection | yes after inspection | connects physical change to system |
| controller still expects old position | configuration view | no | key causal evidence |

## Design rule

Evidence appears as **world objects, logs, dialogue and state**, not generic learning cards.

# 7. Consequence Model

## Baseline state

The installation begins in a route-mismatch state.

Visible result:
- simulated visitor enters;
- light path turns toward closed service passage;
- Teo reacts: “Ecco. È questo il problema.”

## Hypothesis states

The learner may temporarily suspect:
- the panel move alone;
- the control sequence alone;
- the test procedure;
- the mismatch between layout and sequence.

The system should allow weak hypotheses to be explored without “wrong answer” punishment.

## Repair actions

### R1 — Move the panel back

Would restore compatibility with old configuration but lose the improved turning space.

Outcome:
- route may work;
- accessibility constraint regresses.

### R2 — Keep the new panel position and update control sequence

Outcome:
- route works;
- turning space remains improved.

### R3 — Change only visitor signage

Outcome:
- does not fix interactive light guidance.

## Why this matters

The learner must eventually see that a technically working fix is not automatically the best fix.

This creates a natural later bridge to constraints/trade-offs without forcing it into the current target.

# 8. Experience Choreography

## Beat 0 — Enter into a failure

The experience opens **inside Sala Luce Viva during a test**.

No explanatory title card.

The simulated route lights activate.

They visibly guide toward the wrong passage.

Teo:
> “No. Di nuovo.”

Omar:
> “Ma la sequenza è quella che ho caricato.”

Lia:
> “E la sala non era così quando l’hai preparata.”

Then the learner is addressed:

> “Ci dai una mano a capire dove si è rotto il filo?”

The question comes **after** the learner sees the failure.

## Beat 1 — Free first inspection

The learner can choose:
- sala;
- cabina;
- laboratorio;
- atrio.

There is no “Step 1”.

A subtle task anchor says only:

> **Capire che cosa è cambiato.**

The learner discovers evidence in their chosen order.

## Beat 2 — The world becomes too complex for memory

After several pieces of evidence are found, the evidence tray becomes visibly crowded.

Lia:
> “Aspetta. Stiamo mescolando cose successe in momenti diversi.”

A timeline tool becomes available because it is now useful.

The system does not say:
> “Use the chronology strategy.”

It offers:
> **Metti gli eventi sulla linea del tempo**

The learner constructs the sequence.

## Beat 3 — Chronology answers one question but not the next

The timeline establishes:

1. good rehearsal;
2. Lia moves panel;
3. Omar loads configuration from old plan;
4. bad rehearsal.

Omar:
> “Ok, adesso sappiamo quando è cambiato tutto. Ma non ancora perché il sistema punta lì.”

This is the key pedagogical pivot.

The timeline remains visible but is insufficient.

## Beat 4 — Change representation because the world demands it

The learner can open a causal work surface.

Prompt is diegetic:

> **Che cosa ha fatto succedere che cosa?**

They connect:
- panel moved;
- old geometry still loaded;
- controller targets old position;
- route points to wrong passage.

When the causal chain is coherent, the crew proposes repair options.

## Beat 5 — Test interpretation in the world

The learner chooses a repair to simulate.

The room visibly reruns.

Weak fix:
- route may remain wrong or another constraint breaks.

Strong fix:
- lights guide to correct exit;
- turning space remains clear.

The world provides the feedback.

## Beat 6 — Quiet closure

No “you learned that…” panel.

The room is lit correctly.

Teo:
> “Adesso sì.”

Omar:
> “La linea del tempo ci ha fatto trovare il momento. La mappa delle cause ci ha fatto trovare il guasto.”

Lia:
> “Salviamo questa configurazione prima che qualcuno tocchi ancora qualcosa.”

The learner has experienced why different representations serve different questions.

# 9. Visual World Concept

## Art direction

Target:
- contemporary illustrated museum;
- clean but atmospheric;
- enough detail to invite inspection;
- not cartoonish-primary-school;
- not sterile enterprise dashboard;
- warm evening setup mood.

Visual references in principle:
- editorial illustration;
- museum wayfinding;
- light-installation photography translated into 2-D;
- compact adventure-game scene composition.

## Screen model

Mobile viewport uses one dominant scene.

Top chrome:
- minimal;
- location name;
- quiet progress/state indicator only if needed.

Bottom/side layer:
- context-sensitive actions;
- evidence tray collapses;
- character dialogue overlays only when relevant.

Avoid:
- long vertical feed of cards;
- permanent instructional panel;
- five competing dashboard regions.

## State visibility

The room should visibly distinguish:
- correct route;
- wrong route;
- moved panel;
- service passage;
- visitor turning space;
- current test state.

The learner should understand major state changes **before reading explanatory text**.

# 10. Interaction Mechanics

Primary mechanics only:

1. **inspect** — tap a place/object to reveal relevant evidence;
2. **pin** — keep evidence for later;
3. **place on timeline** — chronology;
4. **connect** — causal relation;
5. **test** — run the installation;
6. **repair/revise** — apply candidate change.

No inventory for its own sake.
No avatar walking controls.
No score.
No fake collectibles.

# 11. Desire-to-Continue Gate

Human Review questions:

- Is seeing the room fail enough to create curiosity?
- Does the learner want to know why it failed?
- Is there a meaningful choice about where to investigate first?
- Does each discovery change the learner's understanding?
- Does the room's visual state make progress perceptible?
- Is the repair test satisfying enough to justify another few minutes?
- Would the experience still work with no badge at all?

Current product judgement:

**PROMISING / NOT YET VALIDATED**

The strongest hook is the **visible malfunction plus investigation freedom**.

The highest risk is that investigation could still degrade into tapping hotspots unless:
- locations have distinct information value;
- characters react contextually;
- evidence supports multiple provisional hypotheses;
- tests visibly change the world.

# 12. Mapping to competence evidence

The world must preserve the original evidence contract.

## Evidence event A — chronology tool used correctly

Learner constructs a valid timeline from distributed evidence.

Eligible stage:
BEGINNING_TO_RECOGNISE

Completion alone is insufficient.

## Evidence event B — representation change after question changes

After chronology is established, learner selects/builds a causal representation to answer why the route failed and applies it correctly.

Eligible stage:
CHOOSES_WHEN_TO_USE

Requirement:
- must actually use chronology first;
- must then change representation;
- must build a valid causal relation.

## Transfer

Not included in this first world prototype.

A later changed-context world must require actual use of a different representation under a new problem.

TRANSFERS_TO_NEW_SITUATION remains unavailable until such evidence exists.

# 13. Safety / privacy / accessibility constraints

- no account or student identity required;
- no personal disclosure;
- no hidden psychological inference;
- characters remain artificial and task-bound;
- no manipulative urgency;
- no leaderboard/streak;
- all critical information available without audio;
- colour is never the only state cue;
- world interactions keyboard/touch accessible;
- motion optional/reduced-motion compatible;
- no runtime tracking required.

# 14. Product Decision

**MUSEO ZERO is the current preferred world candidate for PW-STRATEGY-SELECTION-01.**

It is stronger than Missione Belvedere because:
- the learner investigates a **stateful world**, not a prewritten story sequence;
- information is spatially and socially distributed;
- the learner has meaningful investigation order;
- chronology emerges as a useful tool;
- chronology then demonstrably becomes insufficient;
- causal representation becomes useful because the world demands it;
- the learner tests the explanation by changing the world;
- closure is a repaired environment, not a pedagogical summary.

## Next gate

Do **not** implement in Atlas yet.

Next permitted work:
1. visual concept prototype of the **world itself**;
2. one low-fidelity playable slice:
   FAILURE → FREE INSPECTION → 2–3 EVIDENCE DISCOVERIES → FIRST WORLD REACTION;
3. Human Product Review focused on:
   - curiosity;
   - agency;
   - world legibility;
   - desire to continue.

Only after that:
- continue choreography;
- rebind to Atlas implementation.

Q9 remains untouched.
