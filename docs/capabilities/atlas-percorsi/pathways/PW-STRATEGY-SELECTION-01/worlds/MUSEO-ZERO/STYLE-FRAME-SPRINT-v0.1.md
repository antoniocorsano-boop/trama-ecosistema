# MUSEO ZERO — Style Frame Sprint v0.1

**Candidate:** MZ-VF-001  
**Production Pack:** VISUAL-PRODUCTION-PACK-v0.1.md  
**Sprint state:** READY_TO_RENDER / HUMAN_VISUAL_SELECTION_REQUIRED  
**Runtime:** NOT_AUTHORIZED  
**Maximum directions:** 3  
**Primary comparison frame:** F3 — TOO LATE

## 1. Sprint question

Which visual direction can make MUSEO ZERO feel like a coherent, contemporary place that an 11–14-year-old can enter mentally, while remaining simple enough for a repeatable open-source production pipeline?

The sprint is not asking:
- which image is most spectacular;
- which image looks most photorealistic;
- which model can add the most detail.

It is asking:
**which direction gives the strongest route to Q3 PUBLISHABLE CRAFT?**

## 2. Controlled comparison rule

All directions must depict the same moment:

- contemporary museum after closing;
- warm/controlled evening light;
- Lia has already crossed the new entrance;
- projection turns on late;
- Lia is visibly too far into the room for the response to feel correctly timed;
- one crew member notices/reacts;
- the room, entrance and projection wall remain spatially understandable;
- no interface panel;
- no giant sensor labels;
- no explanatory arrows;
- no educational caption.

Keep narrative content constant. Change only visual language.

## 3. Direction A — Editorial Illustrated Realism

### Intent

A polished contemporary editorial illustration that feels believable without attempting photorealism.

### Visual language

- clean perspective;
- simplified but credible architecture;
- controlled shapes;
- moderate detail;
- natural adult proportions;
- subtle texture;
- selective warm/cool contrast;
- expressive but restrained faces/body language;
- exhibition colours used as accents.

### Why test it

Potential strengths:
- strong readability;
- maintainable asset style;
- easier continuity than pseudo-photorealism;
- credible for lower-secondary without looking childish;
- suitable for stills, layers and limited animation.

Risks:
- can become corporate/editorial if too clean;
- may feel static if composition lacks tension.

### Reject if

- looks like a brochure;
- characters feel like stock illustration;
- museum lacks atmosphere;
- late trigger is not readable without text.

## 4. Direction B — Cinematic Graphic Narrative

### Intent

A restrained graphic-narrative treatment: stronger light/shadow, clearer framing, more dramatic visual rhythm, but no comic-book gimmicks.

### Visual language

- confident silhouettes;
- stronger contrast;
- selective line/shape emphasis;
- cinematic framing;
- rich but bounded shadows;
- slightly more expressive staging;
- speech/dialogue can later integrate naturally.

### Why test it

Potential strengths:
- narrative energy;
- strong identity;
- good fit with storyboarding;
- potentially efficient for sequential scenes;
- less vulnerable than realism to small generative inconsistencies.

Risks:
- can become melodramatic;
- can skew too “superhero” or too dark;
- strong stylisation may reduce spatial clarity.

### Reject if

- linework/details vary strongly frame to frame;
- lighting hides the task;
- tone becomes sensational or adolescent cliché;
- looks derivative of a recognisable franchise.

## 5. Direction C — Warm Spatial Diorama / Cutaway

### Intent

A crafted 2-D/2.5-D museum world with subtle depth, clean geometry and tactile materials: closer to a designed interactive world than to a standalone illustration.

### Visual language

- clean cutaway/spatial staging;
- softly modelled depth;
- restrained stylisation;
- characters integrated at architectural scale;
- clear route and room state;
- tactile exhibition objects;
- environmental storytelling.

### Why test it

Potential strengths:
- strong spatial orientation;
- potentially ideal for interactive composition;
- asset reuse across locations;
- clearer bridge from still frames to Godot/web layers;
- the museum itself can become a persistent world anchor.

Risks:
- may become “isometric infographic”;
- characters can lose emotional presence;
- can drift back toward schematic representation.

### Reject if

- the room reads as a diagram first;
- characters become tiny tokens;
- spatial clarity replaces narrative feeling;
- control technology dominates visual identity.

## 6. Generation/refinement protocol

For each direction:

1. create no more than 4 exploratory F3 frames;
2. reject obvious failures immediately;
3. shortlist at most 2;
4. perform a minimal human cleanup pass only on shortlisted frames;
5. review at phone size;
6. record one selected representative or mark the direction rejected.

Maximum exploratory frames:
**12 total.**

This is a hard anti-lottery limit for the sprint.

## 7. Reference continuity

All directions use the same descriptive canon:
- Lia is the same adult crew member;
- same contemporary museum;
- same entrance;
- same projection wall;
- same narrative moment;
- same approximate spatial relation.

If an AI workflow cannot keep these constants even within the sprint, that weakness counts against production suitability.

## 8. Prompt/workflow discipline

Where generative tools are used, store:
- full workflow, not only prompt text;
- model/checkpoint/version;
- image/reference inputs;
- seeds where useful;
- control inputs;
- negative constraints;
- post-processing/refinement notes.

Prompt wording can evolve, but the production goal cannot silently change to fit lucky outputs.

## 9. Review sheet

Score each direction 0–3 on:

- SF1 — world credibility;
- SF2 — age dignity;
- SF3 — immediate readability;
- SF4 — character continuity potential;
- SF5 — environmental continuity potential;
- SF6 — visual distinctiveness without gimmick;
- SF7 — path to interaction/motion;
- SF8 — production repeatability/cost.

### Hard rejection

Reject direction if any apply:
- HS02 Generic AI Look;
- HS03 Character Identity Instability;
- HS04 obvious generative artefacts that appear systematic;
- HS05 Technical Diagram Replacing World;
- HS07 Infantilising Lower-Secondary Tone.

## 10. Selection rule

A direction may be selected for Reference Lock only if:
- no hard rejection is open;
- total >= 18/24;
- SF1, SF2 and SF3 each >= 2;
- Human Review judges it worth seeing across F1–F6.

If two directions remain viable:
- render one additional controlled F4 Backstage Clue frame for each;
- choose the direction that preserves the same visual language when technical evidence enters the world.

## 11. What happens after selection

Only the selected direction advances to:
- character reference lock;
- Sala Zero environment master;
- palette/light lock;
- F1–F6 polished keyframes.

Rejected frames remain evidence, not production debt.

No engine work begins before Reference Lock.

## 12. Decision record

Current:
- Direction A: PENDING
- Direction B: PENDING
- Direction C: PENDING
- Selected: NONE
- Human Review: REQUIRED

## 13. Authority boundary

Style selection:
- does not authorize runtime;
- does not authorize Atlas implementation;
- does not authorize publication;
- does not approve any generative model as canonical infrastructure.

It authorizes only the next Visual Factory production stage.
