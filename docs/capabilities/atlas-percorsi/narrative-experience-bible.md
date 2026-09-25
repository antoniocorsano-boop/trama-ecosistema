# CAP-ATLAS-PERCORSI — Narrative Experience Bible

**Gate:** G1 Discovery → input to G4 Design  
**Status:** STRUCTURE_DEFINED / EVIDENCE_CRITERIA_ADDED / METAPHOR_OPEN

## Why this artefact exists

Atlas Percorsi must not become a generic card-based AI-looking interface. If narrative framing is adopted, atmosphere, metaphor and interaction must be deliberately authored and pedagogically justified before visual component selection.

The sequence is:

`PEDAGOGICAL EXPERIENCE → METAPHOR → SUBJECT → NARRATIVE ARC → INTERACTION GRAMMAR → VISUAL/AUDIO LANGUAGE → TECHNICAL REQUIREMENTS → OPEN-SOURCE TOOL SELECTION`

Technology serves the experience rather than determining it.

## Evidence boundary

Systematic reviews of educational digital storytelling report use across primary, secondary and higher education and a range of cognitive, affective, reflective and social outcomes, but also heterogeneous methods and limitations. Therefore narrative is a design hypothesis to test, not an automatic benefit.

Metaphor comprehension is developmentally sensitive. Even young children may understand metaphor under suitable conditions, but performance depends on cognitive abilities and task design. Therefore Atlas must retain a literal interaction layer and test metaphors by age band rather than assuming one abstract metaphor works identically for all students.

## 1. Audience bands

### Earlier primary
- concrete/literal interaction must remain primary;
- metaphor may enrich but must never be required to understand the task;
- short scenes and visible cause/effect;
- low narrative density;
- adult/teacher mediation may be offered without being required for basic access.

### Later primary
- metaphor can become more explicit and relational;
- learner can compare strategies and consequences;
- world/map may expose more connections while preserving clear orientation.

### Lower-secondary
- avoid infantilising character/tone systems;
- allow ambiguity, trade-offs and authentic choices where pedagogically appropriate;
- greater narrative sophistication must not become greater disclosure pressure or cognitive noise.

These are candidate design bands, not psychological norms.

## 2. Metaphor candidates

No metaphor is selected. Candidate families:

- journey/exploration;
- map/territory;
- archipelago;
- observatory;
- laboratory/workshop;
- expedition;
- growing network/ecosystem.

### Evaluation matrix for future selection

Every candidate must be assessed against:

1. pedagogical fit with self → world progression;
2. literal comprehensibility when metaphor is not understood;
3. suitability across age bands or ability to vary without fragmenting identity;
4. non-infantilising lower-secondary expression;
5. accessibility for cognitive, sensory and motor diversity;
6. orientation: learner always understands where they are and what they can do;
7. progress representation without scores, rankings or fixed labels;
8. privacy/local-artefact compatibility;
9. ability to support reflection without soliciting sensitive disclosure;
10. technical feasibility on mobile/PWA/offline constraints;
11. reduced-motion/no-audio/non-visual equivalence;
12. pedagogical value greater than implementation/maintenance cost.

A metaphor that fails literal comprehensibility, accessibility or child-safety cannot win because it is visually attractive.

## 3. Subject / premise

To author only after metaphor comparison. It must answer:

- who is the learner in this world without requiring a personal profile?;
- what invites them to begin?;
- what changes through action?;
- why does reflection matter?;
- how does a new competence open a possibility rather than award a status?;
- how does the experience end while remaining open to future paths?

## 4. Narrative arc

Candidate template:

1. invitation;
2. threshold/entry;
3. first observation of self/context;
4. meaningful choice;
5. action/consequence;
6. pause/reflection;
7. discovery/tool/insight;
8. transfer to a changed context;
9. trace left in the learner-controlled artefact;
10. new path becomes visible.

Each step may be shortened or omitted for younger learners or short experiences; the arc is not a mandatory ten-screen flow.

## 5. World bible

To define:

- places;
- recurring symbols;
- guides/characters, if any;
- objects/tools;
- transitions;
- environmental storytelling;
- rules of the world;
- deliberate absences: scores, public rankings, personal-data identity markers, streak pressure.

## 6. Atmosphere bible

To define:

- emotional register;
- visual rhythm;
- typography role;
- illustration language;
- motion language;
- sound/music role if used;
- silence/pause;
- density and focus;
- age-band variations;
- reduced-motion, no-audio and non-visual equivalents.

W3C cognitive-accessibility evidence makes clarity and focus explicit constraints. Atmosphere must support meaning, not decorative spectacle.

## 7. Interaction grammar

Candidate verbs:

`observe · choose · connect · arrange · test · compare · reflect · revisit · transfer · keep/export`

Avoid interaction whose main purpose is reward harvesting, streak pressure, public comparison, compulsive return or disclosure.

## 8. Learner-controlled artefact

Candidate concept: locally held/downloadable journey artefact such as notebook, map, field journal or discovery record. Final form follows the selected metaphor.

Requirements:

- useful without identifying the learner;
- generated/maintained locally where feasible;
- downloadable/exportable;
- printable where pedagogically useful;
- minimal metadata;
- resettable/deletable;
- never automatically uploaded back to Atlas.

## 9. Scene/script template

Every narrative learning scene should eventually specify:

- scene ID;
- target age band;
- pedagogical objective;
- competence/evidence target;
- narrative purpose;
- setting/atmosphere;
- literal task meaning;
- learner prompt;
- choices/interactions;
- consequence/feedback;
- reflection;
- transfer prompt;
- accessibility alternatives;
- safety/privacy review;
- disclosure-risk review;
- assets required;
- implementation constraints;
- evidence references supporting the scene pattern.

## 10. Prototype validation questions

Before a narrative direction is approved, test at least:

- Can the learner understand the task without decoding the metaphor?
- Can the learner tell where they are, what changed and what to do next?
- Does the experience invite reflection without requiring private disclosure?
- Does the metaphor still feel appropriate to lower-secondary students?
- Does reduced motion/no audio preserve meaning?
- Does keyboard/touch/assistive use preserve the same learning opportunity?
- Does atmosphere improve comprehension/meaning rather than merely time-on-task?
- Is progress represented as learning/evidence rather than identity/status?

## 11. Open-source technology research — intentionally deferred

GitHub research begins only after requirements are clearer. Candidate categories, not selected libraries:

- accessible component foundations;
- vector/2D animation;
- narrative scrolling/transitions;
- graph/map visualisation;
- canvas/WebGL/WebGPU only where justified;
- audio with accessible controls;
- offline/PWA support;
- local export/document generation.

Selection criteria: maturity, maintenance, licence, runtime/bundle cost, mobile support, accessibility, offline compatibility, security posture, reduced-motion support and expressive fit.

## Current decision

**No metaphor, visual style, character system or library is approved.** G1 now defines an evidence-based comparison method. The next durable artefact should be a metaphor comparison dossier, not a visual mockup chosen by taste.