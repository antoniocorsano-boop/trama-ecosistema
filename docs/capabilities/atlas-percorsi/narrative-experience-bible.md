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

Visual attraction is also not equivalent to learning. Multimedia/cognitive-load research identifies risks from irrelevant attractive details and competing representations, while signaling research shows value in directing attention to relevant relationships. Child-specific evidence from interactive storybooks indicates that interactive multimedia can both support learning and distract, and that explicit visual cueing can be particularly helpful where attentional difficulty is present. Atlas must therefore distinguish **image as meaning-bearing representation** from **image as attentional stimulus**.

## 1. Audience bands

### Earlier primary
- concrete/literal interaction must remain primary;
- metaphor may enrich but must never be required to understand the task;
- short scenes and visible cause/effect;
- low narrative and visual density;
- one clear focal objective per state by default;
- adult/teacher mediation may be offered without being required for basic access.

### Later primary
- metaphor can become more explicit and relational;
- learner can compare strategies and consequences;
- world/map may expose more connections while preserving clear orientation;
- visual complexity may grow only when the learner has a reason to integrate the elements.

### Lower-secondary
- avoid infantilising character/tone systems;
- allow ambiguity, trade-offs and authentic choices where pedagogically appropriate;
- greater narrative sophistication must not become greater disclosure pressure or cognitive noise;
- avoid assuming greater age means adult-level attention control, working memory or resistance to distraction.

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
12. pedagogical value greater than implementation/maintenance cost;
13. **visual stability:** core symbols can persist and accumulate meaning rather than being replaced by novelty;
14. **attention economy:** the metaphor does not require constant visual stimulation to remain understandable;
15. **retrieval/transfer affordance:** imagery can be recalled and reused to reason in a later context rather than merely viewed.

A metaphor that fails literal comprehensibility, accessibility, child-safety or attention/memory discipline cannot win because it is visually attractive.

## 3. Subject / premise

To author only after metaphor comparison. It must answer:

- who is the learner in this world without requiring a personal profile?;
- what invites them to begin?;
- what changes through action?;
- why does reflection matter?;
- how does a new competence open a possibility rather than award a status?;
- how does the experience end while remaining open to future paths?;
- what small set of recurring visual anchors carries meaning across scenes?

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

Each step may be shortened or omitted for younger learners or short experiences; the arc is not a mandatory ten-screen flow. Learning-critical states should be learner-paced rather than automatically replaced by the next visually salient scene.

## 5. World bible

To define:

- places;
- recurring symbols;
- guides/characters, if any;
- objects/tools;
- transitions;
- environmental storytelling;
- rules of the world;
- deliberate absences: scores, public rankings, personal-data identity markers, streak pressure;
- **stable anchors:** limited recurring visual objects whose meaning grows through use;
- **visual budget:** what may attract attention in a scene and why.

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

W3C cognitive-accessibility evidence makes clarity, focus and reorientation explicit constraints. Multimedia evidence adds a coherence constraint: atmosphere must support meaning, not decorative spectacle.

### Visual attention discipline

1. **One focal point by default.** Multiple simultaneous focal objects require a pedagogical reason such as comparison or integration.
2. **Stable before novel.** Do not replace a meaningful image merely to refresh attention; reuse anchors so the learner can build associations.
3. **No decorative motion near a learning target.** Motion must signal change, causality, relationship or action availability.
4. **No automatic visual churn.** Learning-critical images remain until the learner acts or deliberately advances.
5. **Signal relevance.** Cue the element that matters instead of making every element equally vivid.
6. **Image-to-thinking transition.** After a salient image, create a cognitive action: retrieve, choose, explain, arrange, compare, predict, reflect or transfer.
7. **Pause is part of the design.** Empty space, stillness and silence can protect attention and should not be treated as missing engagement.
8. **Recovery is visible.** A learner who loses focus can immediately recover the current goal and prior meaningful state.
9. **Low-stimulation equivalence.** Reduced-motion/no-audio modes preserve semantic relationships and learning opportunity.
10. **Attraction is not evidence.** Dwell time, clicks or visual recall are not competence indicators.

## 7. Interaction grammar

Candidate verbs:

`observe · choose · connect · arrange · test · compare · retrieve · explain · reflect · revisit · transfer · keep/export`

Avoid interaction whose main purpose is reward harvesting, streak pressure, public comparison, compulsive return, disclosure or visual novelty. Each interaction must answer: **what thinking does this action require?**

## 8. Learner-controlled artefact

Candidate concept: locally held/downloadable journey artefact such as notebook, map, field journal or discovery record. Final form follows the selected metaphor.

Requirements:

- useful without identifying the learner;
- generated/maintained locally where feasible;
- downloadable/exportable;
- printable where pedagogically useful;
- minimal metadata;
- resettable/deletable;
- never automatically uploaded back to Atlas;
- able to preserve a small number of meaningful visual anchors without becoming a scrapbook of transient stimuli.

## 9. Scene/script template

Every narrative learning scene should eventually specify:

- scene ID;
- target age band;
- pedagogical objective;
- competence/evidence target;
- narrative purpose;
- setting/atmosphere;
- literal task meaning;
- **single focal object/question**;
- **visual elements and pedagogical role of each**;
- **what remains visually stable from the previous scene**;
- learner prompt;
- choices/interactions;
- consequence/feedback;
- **retrieval/integration action after salient imagery**;
- reflection;
- transfer prompt;
- accessibility alternatives;
- attention/cognitive-load review;
- safety/privacy review;
- disclosure-risk review;
- assets required;
- implementation constraints;
- evidence references supporting the scene pattern.

## 10. Prototype validation questions

Before a narrative direction is approved, test at least:

- Can the learner understand the task without decoding the metaphor?
- Can the learner tell where they are, what changed and what to do next?
- After an attractive image appears, can the learner state/use the **intended idea**, not merely recall the picture?
- Does a new image add information or merely replace the previous attentional target?
- Can the learner integrate two visual states when integration is required?
- Are irrelevant details drawing attention away from the focal task?
- Does signaling help the learner find the relevant relationship without prompting the answer?
- Can a learner with attentional difficulty recover after distraction?
- Does the experience invite reflection without requiring private disclosure?
- Does the metaphor still feel appropriate to lower-secondary students?
- Does reduced motion/no audio preserve meaning?
- Does keyboard/touch/assistive use preserve the same learning opportunity?
- Does atmosphere improve comprehension/meaning rather than merely time-on-task?
- Is progress represented as learning/evidence rather than identity/status?

Prototype evaluation should include comprehension, delayed retrieval/recognition of the **meaning**, transfer to a changed example, orientation/recovery and qualitative observation. Engagement/time-on-task alone is insufficient.

## 11. Child participation without data extraction

UNICEF evidence on children's best interests in digital policy/practice supports meaningful child-centred design rather than assuming adult designers know children's experience. For Atlas, participation must itself be CHILD-SAFE:

- use bounded prototype tasks rather than soliciting personal histories;
- collect the minimum evidence needed to assess comprehension/usability;
- avoid persistent child profiles;
- ensure appropriate adult/school mediation and governance when testing occurs in educational settings;
- include diverse needs and avoid treating a small group as representative of all children;
- document design changes attributable to child feedback so participation is substantive rather than symbolic.

The detailed research protocol belongs to G4/G6 and requires governance before use.

## 12. Open-source technology research — intentionally deferred

GitHub research begins only after requirements are clearer. Candidate categories, not selected libraries:

- accessible component foundations;
- vector/2D animation;
- narrative scrolling/transitions;
- graph/map visualisation;
- canvas/WebGL/WebGPU only where justified;
- audio with accessible controls;
- offline/PWA support;
- local export/document generation.

Selection criteria: maturity, maintenance, licence, runtime/bundle cost, mobile support, accessibility, offline compatibility, security posture, reduced-motion support, expressive fit **and ability to implement the visual-attention constraints without workarounds**.

## Current decision

**No metaphor, visual style, character system or library is approved.** G1 defines an evidence-based comparison method and now explicitly treats attention, working memory and visual coherence as design constraints. The next durable artefact should be a metaphor comparison dossier evaluated against these constraints, not a visual mockup chosen by taste.