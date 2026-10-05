# MUSEO ZERO — Visual Production Pack v0.1

**Candidate ID:** MZ-VF-001  
**Pathway:** PW-STRATEGY-SELECTION-01  
**Story:** STORY-PW-STRATEGY-01 — MUSEO ZERO / La sala che non torna  
**Story state:** STORY_APPROVED_FOR_WORLD_DESIGN  
**World:** MUSEO ZERO  
**Target age:** lower secondary / 11–14  
**Product form:** illustrated interactive micro-sequence  
**Factory:** TRAMA Visual Factory v0.1  
**Quality target:** Q3 PUBLISHABLE CRAFT  
**Production state:** PRODUCTION_PACK_READY_FOR_STYLE_SPRINT  
**Runtime:** NOT_AUTHORIZED

## 1. Product promise

The learner enters a contemporary museum after closing time, sees a rehearsal fail, discovers that the room is responding to the wrong trigger, changes one relevant control and watches the same rehearsal succeed.

The learner should experience:

`SOMETHING FEELS WRONG -> I CAN INSPECT IT -> I CHANGE ONE THING -> THE SAME WORLD RESPONDS DIFFERENTLY`

The product must feel like a small authored world, not a lesson decorated with a museum theme.

## 2. First-slice boundary

This pack authorizes visual production only for the first Factory slice:

- F1 — After-hours museum;
- F2 — Nothing happens;
- F3 — Too late;
- F4 — Backstage clue;
- F5 — Learner intervention;
- F6 — Same rehearsal, correct timing.

Out of scope for this slice:
- complete museum map;
- full timeline reconstruction;
- final three-option recovery comparison;
- badges/progression;
- general Atlas navigation;
- full character dialogue system;
- AI-generated video;
- public/student runtime.

## 3. Learner-visible narrative

### Situation

Museo Zero opens the next day.

The crew is running one of the last rehearsals. Lia walks through the newly configured entrance of Sala Zero.

Nothing happens.

A moment later the projection starts, but Lia is already too far into the room.

The crew knows the physical sensor responds. The room still reacts late.

### Learner role

The learner is a junior setup operator temporarily joining the crew.

The learner is not told the technical answer. They observe the room, inspect one believable backstage control surface and make one bounded change in simulation.

### Concrete learner action

Change the simulated cue mapping from the old entrance trigger to the sensor at the new entrance, then replay the exact same rehearsal.

### Visible consequence

The same Lia entrance now triggers the projection/light response immediately.

No separate “Correct” card is required.

## 4. Art-direction constraints

### Required

- contemporary museum, not school laboratory;
- after-hours atmosphere with readable mid-low light;
- polished 2-D illustration;
- believable architecture and spatial depth;
- simplified but credible AV/control equipment;
- character-in-world staging;
- one dominant visual stage;
- clear state change between failed and correct rehearsal;
- enough realism to support causal reasoning;
- enough stylisation to keep production maintainable;
- visual restraint suitable for 11–14-year-olds.

### Explicitly forbidden

- dashboard aesthetic;
- cyberpunk neon default;
- generic SaaS panels;
- wireframe/debug labels;
- technical diagram as the main scene;
- chibi/mascot treatment;
- fake “AI concept art” abundance of decorative detail;
- pseudo-photorealism with unstable faces/hands;
- floating avatar heads as primary dialogue;
- confetti/reward effects;
- UI chrome that becomes more salient than the museum.

## 5. Character canon — sprint brief

The sprint does not yet approve final character designs. It fixes continuity requirements.

### Lia — exhibition layout / visitor flow

Visual role:
- recognisable in full-body medium and wide shots;
- practical contemporary clothing suitable for museum setup work;
- clear silhouette;
- calm, focused physicality;
- not coded as a cartoon guide/mascot.

Continuity anchors:
- one stable hairstyle;
- one stable outerwear/top silhouette;
- one recurring accent colour;
- same apparent adult age band across frames.

Required expressions/poses later:
- entering;
- noticing delay;
- looking back toward projection;
- relaxed after successful test.

### Omar — installation

Visual role:
- practical installation posture;
- often close to physical sensor/props;
- should read as a participant with partial knowledge, not a teacher.

Continuity anchors:
- distinct silhouette from Teo;
- stable clothes;
- one small installation-related prop/gesture allowed, not required.

### Teo — regia / rehearsal

Visual role:
- associated with observation/control booth;
- should read as a crew member, not as an operator-avatar UI.

Continuity anchors:
- distinct silhouette;
- stable clothes;
- same physical presence in room/control-area shots.

## 6. Environment canon — sprint brief

### Sala Zero

Must contain:
- large projection wall;
- new entrance threshold;
- subtle floor route marking;
- sensor integrated into the world;
- exit light;
- enough floor/wall geometry to understand where Lia is moving.

Must not contain:
- giant labels “A/B” as the primary visual language;
- exposed wiring everywhere;
- giant control panels floating over the room;
- schematic arrows explaining causality.

### Cabina regia

Must feel:
- physically adjacent to/connected with the exhibition;
- tactile and believable;
- understandable at learner scale.

May include:
- simple trigger mapping;
- small cue chain;
- rehearsal preview;
- TEST/REPLAY action.

The key mapping can be visualised, but it should appear as part of a real control surface rather than as a standalone teaching diagram.

## 7. Canonical frame list

### F1 — AFTER HOURS

**Narrative beat:** final rehearsal is about to start.  
**Camera:** wide / slightly elevated, entering toward Sala Zero.  
**Learner notices:** museum closed, crew present, Lia about to cross new entrance.  
**Required focal point:** Lia + entrance threshold.  
**No technical explanation visible.**  
**Quality purpose:** world credibility.

### F2 — NOTHING HAPPENS

**Narrative beat:** Lia crosses the new entrance.  
**Camera:** same spatial grammar as F1, closer.  
**Learner notices:** projection wall still dark/idle.  
**Required focal point:** Lia has clearly crossed the threshold while the room remains quiet.  
**Quality purpose:** the problem is experienced before explanation.

### F3 — TOO LATE

**Narrative beat:** projection triggers late.  
**Camera:** same room, Lia already deeper inside.  
**Learner notices:** bright projection response arrives after the meaningful entry moment.  
**Required focal point:** spatial mismatch between Lia’s position and the delayed response.  
**Character reaction:** one short grounded crew reaction.  
**Quality purpose:** visible causality problem.

### F4 — BACKSTAGE CLUE

**Narrative beat:** learner inspects the control booth.  
**Camera:** close/medium on believable museum control surface with physical context still visible.  
**Learner notices:** active trigger still points to the old entrance logic while the new entrance sensor is physically in use.  
**Required focal point:** one readable mapping relation.  
**Quality purpose:** technical evidence becomes diegetic.

### F5 — INTERVENTION

**Narrative beat:** learner changes the mapping.  
**Camera:** same control surface, same composition as F4 where practical.  
**Learner action:** switch mapping to new entrance sensor.  
**Visible state change:** control surface updates clearly but quietly.  
**Quality purpose:** direct bounded agency.

### F6 — SAME REHEARSAL, CORRECT TIMING

**Narrative beat:** Lia enters again.  
**Camera:** deliberately echoes F2/F3.  
**Learner notices:** projection response happens immediately at threshold.  
**Character reaction:** restrained satisfaction.  
**Quality purpose:** before/after proof using the same world.

## 8. Continuity anchors

| Anchor | Meaning | Frames |
|---|---|---|
| New entrance threshold | changed visitor route | F1, F2, F3, F6 |
| Projection wall | room response | F1–F3, F6 |
| Lia silhouette/clothing | repeated identical rehearsal | F1–F3, F6 |
| Control-booth material language | backstage evidence | F4–F5 |
| One recurring museum accent colour | world identity | F1–F6 |
| Same room camera family | enables before/after comparison | F1–F3, F6 |

## 9. Information hierarchy

Every frame uses this order:

1. what is happening in the world;
2. what changed or failed;
3. what can be acted on;
4. optional text/dialogue.

Text must never become necessary to rescue an unreadable frame.

## 10. Dialogue budget

Dialogue is secondary to staging.

Maximum per key frame in first slice:
- one short line;
- approximately one sentence;
- anchored to a visible character or diegetic source.

Reference lines may be adapted:
- Teo: “Aspetta. Di nuovo in ritardo.”
- Omar: “Il sensore si accende. Quindi che cosa non torna?”
- final: “Adesso parte quando entra.”

No explanatory monologue.

## 11. Mobile composition

Reference Human Review viewport:
- 390 x 844 CSS px.

At this size:
- main world frame should dominate the initial viewport;
- current action must remain visually close to the manipulated object;
- no horizontal overflow;
- no tiny labels required to understand the causal relation;
- dialogue can collapse/expand but cannot cover the key action;
- the scene must remain credible as an image even before interaction chrome is added.

## 12. Accessibility direction

The illustrated world is primary, not exclusive.

Later composition must provide:
- semantic equivalents for interactive objects;
- visible keyboard focus;
- reduced-motion equivalent;
- non-audio comprehension;
- textual description of state change where needed;
- no information encoded only by colour.

Accessibility support should map onto the same world objects rather than create a second detached worksheet interface.

## 13. Style-frame sprint input

The sprint uses one locked comparison scene:

**F3 — TOO LATE**

Same narrative facts for every direction:
- after-hours contemporary museum;
- Lia has crossed the new entrance and is already several steps inside;
- projection has only just switched on;
- one crew member reacts from believable backstage context;
- room architecture and new entrance remain visible;
- no giant technical labels;
- no UI panel;
- no educational caption.

The sprint may also include one supporting F4 crop per direction only if needed to judge whether backstage technology can share the same art language.

## 14. Asset/provenance policy for sprint

Style-frame candidates are exploratory assets.

Each accepted/reviewed frame records:
- source/tool;
- date;
- model/workflow where applicable;
- reference inputs;
- human edits;
- usage basis;
- selected/rejected state.

No exploratory frame becomes canonical merely because it is visually impressive.

## 15. Sprint exit criteria

The Production Pack advances only if Human Review selects one art-direction family that:
- scores at least Q2 on D1 Story/world fidelity;
- scores at least Q2 on D2 Art direction/continuity;
- has a plausible path to Q3 D3 Asset finish;
- scores at least Q2 on D6 Age dignity;
- has no HS02 Generic AI Look;
- has no HS05 Technical Diagram Replacing World.

Otherwise:
**RETURN TO ART DIRECTION.**

## 16. Authority boundary

This pack authorizes only bounded visual exploration on the Visual Factory branch.

It does not authorize:
- runtime;
- publication;
- learner use;
- implementation merge;
- selection of a final engine;
- automatic acceptance of AI-generated assets.
