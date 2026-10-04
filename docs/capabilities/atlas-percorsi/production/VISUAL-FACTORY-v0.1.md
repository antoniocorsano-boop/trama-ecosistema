# TRAMA Visual Factory v0.1

**Status:** PROPOSED_CANONICAL_PRODUCTION_LAYER / HUMAN_REVIEW_REQUIRED  
**Runtime:** NOT_AUTHORIZED  
**Applies to:** learner-facing Atlas Percorsi after story/world approval and before publication decision  
**Date:** 2026-10-04

## 1. Purpose

TRAMA Visual Factory turns an approved story/world and controlled storyboard into a reviewable learner-facing product candidate.

It exists to solve a specific gap:

STORYTELLING AND STORYBOARD -> ? -> PRODUCT CANDIDATE -> HUMAN PUBLISH DECISION

The missing middle must not be improvised differently for every pathway. It must become a repeatable production process with:
- explicit quality targets;
- reusable visual assets;
- reproducible AI-assisted workflows;
- human art-direction control;
- provenance and licensing records;
- bounded production cost;
- deterministic evidence where possible;
- mandatory human judgement for aesthetic, narrative and age-appropriateness quality.

The Factory produces candidates. It does not publish automatically.

## 2. Position in the governed pathway workflow

The Factory is an operational layer between the existing W6 Controlled Storyboard and W6A Experience Quality Design/Review.

Canonical relationship:

COMPETENCE TARGET
-> STORYTELLING CONCEPT
-> HUMAN STORY REVIEW
-> WORLD DESIGN
-> CONTROLLED STORYBOARD
-> VISUAL FACTORY
-> EXPERIENCE QUALITY REVIEW
-> PRODUCT SPECIFICATION HANDOFF
-> SEPARATE RUNTIME/PUBLICATION AUTHORIZATION

Entry requires:
- a governed pathway ID;
- STORY_APPROVED_FOR_WORLD_DESIGN or stronger story state;
- a reviewed World Brief / world concept;
- a controlled storyboard or equivalent shot/scene plan;
- child-safety, privacy and accessibility constraints known early enough to affect production.

The Factory must not reopen curriculum authority, storytelling authority or runtime authority.

## 3. Product doctrine

### 3.1 Simple is allowed; unfinished is not

The target is not AAA game production, cinematic animation or constant spectacle.

The target is:
**simple, contemporary, coherent, intentional, age-dignified and finished enough to publish.**

A restrained illustrated scene can pass.
A polished comic can pass.
A small interactive 2D world can pass.
A technically sophisticated simulation that looks like a debug screen fails.

### 3.2 Quality is part of meaning

Visual quality is not decoration. It affects:
- whether the learner understands what matters;
- whether characters and places feel persistent;
- whether state change is legible;
- whether the learner trusts that an object belongs to the world;
- whether a lower-secondary learner feels respected rather than patronised.

### 3.3 AI is a production instrument, not an art director

Generative AI may accelerate:
- concept frames;
- character exploration;
- environment exploration;
- controlled variants;
- inpainting and repair;
- texture/background generation;
- optional micro-video experiments.

AI may not decide:
- story;
- age tone;
- final character identity;
- final scene hierarchy;
- publication readiness;
- whether a defect is acceptable because it is expensive to fix.

Human review owns the final visible surface.

## 4. Factory inputs

Every production run starts from a Visual Production Pack containing at least:
- pathway ID;
- story reference;
- target age band;
- scene/beat IDs;
- learner role;
- narrative purpose;
- competence-relevant action;
- shot list / storyboard frames;
- world anchors that must remain stable;
- art-direction constraints;
- accessibility requirements;
- target product form;
- asset inventory;
- source/provenance constraints;
- desired publication quality level.

The canonical template is:
../templates/VISUAL-PRODUCTION-PACK-TEMPLATE.md

## 5. Factory outputs

A production run may produce one of four product forms:
1. illustrated sequence / comic;
2. motion-enhanced illustrated sequence;
3. micro-animation;
4. interactive scene or compact learning world.

Each run must output:
- visual candidate;
- asset pack;
- asset/provenance register;
- reproducible workflow/recipe references;
- human refinement notes;
- quality review against VISUAL-QUALITY-BAR-v0.1;
- candidate manifest conforming to schemas/atlas-visual-candidate.v0.1.schema.json;
- publish decision state: DRAFT, REVISE, REJECT or PUBLISH_CANDIDATE.

## 6. Production stages

### VF0 — Production intake

Confirm:
- story/world authority state;
- target scene;
- dominant learner action;
- target product form;
- quality target;
- compute/time budget;
- what must not be generated or invented.

No asset generation begins until VF0 is complete.

### VF1 — Art direction and reference lock

Produce a small number of reference frames, not a large asset dump.

Lock:
- character identity;
- environment language;
- lighting/mood;
- palette family;
- camera/composition language;
- typography role;
- material/texture language;
- motion restraint;
- forbidden visual tropes.

For character-present pathways, identity continuity is more important than novelty.

Output state:
ART_DIRECTION_REVIEWABLE

### VF2 — Canonical asset pack

Produce only assets needed by the controlled storyboard.

Typical pack:
- character reference sheet;
- 3–6 canonical expressions/poses when relevant;
- environment master;
- recurring props;
- foreground/background layers;
- interaction objects;
- visual-state variants;
- typography/icon assets if diegetic.

Every generative asset must have:
- source kind;
- tool/model/workflow reference;
- date/version where material;
- licence/provenance note;
- human modification status.

Output state:
ASSET_PACK_REVIEWABLE

### VF3 — Human refinement

Generated material is not considered finished by default.

Refinement may include:
- correcting composition;
- repairing inconsistent geometry;
- removing visual noise;
- fixing text/signage;
- restoring character identity;
- harmonising light/palette;
- simplifying backgrounds;
- repainting hands/props/edges where needed;
- removing accidental pseudo-detail;
- preparing separate layers for motion/interaction.

Krita-class image editing is the reference capability for v0.1; exact software remains replaceable.

Output state:
ASSET_PACK_LOCKED_FOR_COMPOSITION

### VF4 — Product composition

Assemble the product in the least complex medium that preserves the reviewed experience.

Decision order:
1. static illustrated sequence if sufficient;
2. motion-enhanced sequence if motion carries meaning;
3. micro-animation if time/motion itself carries meaning;
4. interactive scene when learner agency and consequence require direct manipulation.

Do not escalate medium merely because a tool can.

The learner-facing product must preserve:
- story continuity;
- one dominant stage;
- concrete learner action;
- visible consequence;
- mobile legibility;
- accessibility equivalents.

### VF5 — Quality review

Run the candidate through VISUAL-QUALITY-BAR-v0.1.

The review must include:
- first-frame credibility;
- 10-second comprehension;
- character/world continuity;
- visual finish;
- age dignity;
- mobile device review;
- interaction/consequence review;
- obvious-AI-defect review;
- provenance/reproducibility review.

Technical CI may verify files, manifests, routes, overflow and references.
Technical CI may not certify visual quality.

### VF6 — Human product decision

Permitted decisions:
- REVISE — promising but below publication bar;
- REJECT — direction is not worth further production;
- PUBLISH_CANDIDATE — sufficiently finished for the separate governance/publication process.

PUBLISH_CANDIDATE is not runtime authorization.

## 7. Candidate toolchain for v0.1

Tools are candidates, not product authorities.

### Story/shot planning
- repository storyboard artefacts;
- Storyboarder where useful.

### AI workflow orchestration
- ComfyUI as primary candidate because node graphs, templates, subgraphs and API workflows support reproducibility.

### Image refinement
- Krita;
- Krita AI Diffusion as a candidate front-end to controlled generative workflows.

### Interactive assembly
- Godot as the leading candidate for compact 2D interactive scenes when web/runtime packaging is feasible and justified.

### Optional 2D animation
- Blender Grease Pencil;
- OpenToonz.

### Optional generative micro-video
- LTX-Video / LTX-2 only as an experiment after still-frame quality is already locked.

No v0.1 pathway requires AI-generated video.

## 8. Tool selection rule

A tool remains in the Factory only if it improves at least one of:
- visual quality;
- continuity;
- reproducibility;
- production speed;
- maintainability;
- accessibility;
- export/runtime fit.

A tool is removed if:
- it causes style instability;
- its compute cost dominates the product value;
- its output needs more repair than it saves;
- its licence/provenance cannot be governed;
- it forces product design around the tool;
- it cannot reproduce accepted assets or variants reliably enough.

## 9. Cost and compute discipline

Open-source software does not mean free compute.

v0.1 therefore uses:
- still-image/keyframe production as the default;
- reuse of locked assets;
- short controlled generation batches;
- low-cost variants after composition is defined;
- micro-video only when its learning/narrative value is explicit;
- no endless prompt search.

The target is a repeatable factory, not an image lottery.

## 10. Reproducibility and provenance

Every accepted visual candidate must make it possible to answer:
- where did this asset come from?;
- what tool/model/workflow produced it?;
- was it modified by a human?;
- what licence or usage basis applies?;
- which version is canonical?;
- can the asset be regenerated or deliberately replaced?;
- which scenes depend on it?

Prompt text alone is not a production record.

For node-based AI generation, store/export the workflow where practical.
For hand refinement, record the canonical editable asset where practical.
For final delivery, preserve optimized runtime derivatives separately from editable masters.

## 11. Quality authority

The Factory targets Q3 PUBLISHABLE CRAFT as defined in VISUAL-QUALITY-BAR-v0.1.

Q3 does not mean:
- photorealistic;
- cinematic;
- expensive;
- visually dense;
- constantly animated.

It means:
- the product no longer looks like a prototype;
- the art direction is coherent;
- the learner can understand and act;
- age tone is respectful;
- visible AI artefacts are absent;
- the same world and characters persist convincingly;
- the product is ready for a serious human publish/no-publish judgement.

## 12. External benchmark posture

Mature youth-facing educational/game products are benchmarks for:
- intentional craft;
- coherent worlds;
- direct action;
- visible consequence;
- cross-device clarity;
- delight without treating school content as a worksheet.

They are not templates to imitate.

Relevant current references include:
- Minecraft Education;
- Godot ecosystem examples;
- established sequential visual storytelling and animation practice;
- current open visual production tooling.

TRAMA should not imitate the retention mechanics, visual density or reward loops of social-media products.

## 13. Safety and learner dignity

The Factory inherits all existing child-safe learning constraints.

It must additionally avoid:
- infantilising visual treatment for lower-secondary learners;
- pseudo-intimate AI characters;
- manipulative emotional retention;
- misleading realism where it changes the learning claim;
- stereotyped or demeaning representations;
- unnecessary biometric/personal likenesses;
- hidden student tracking in generated media/runtime.

## 14. Automation boundary

Deterministic automation may check:
- manifest validity;
- required files;
- asset provenance fields;
- target age declaration;
- runtimeAuthorized remains false;
- quality review exists;
- hard-stop list is empty before PUBLISH_CANDIDATE;
- mobile route exists;
- basic accessibility and performance conditions.

Automation must not decide:
- aesthetic success;
- character appeal;
- age dignity;
- emotional tone;
- whether a scene feels contemporary;
- whether the art direction is publishable.

Those are Human Review judgements.

## 15. v0.1 Definition of Done

Visual Factory v0.1 is considered demonstrated, not merely documented, when:
1. the MUSEO ZERO pilot runs through VF0–VF6;
2. at least one candidate reaches or is explicitly rejected against Q3;
3. asset provenance and recipe records can be inspected without chat history;
4. the candidate can be rebuilt/revised without starting from zero;
5. the publication decision is recorded independently of implementation/runtime authority;
6. the same Factory template is then used on a second, visually different pathway.

## 16. Authority boundary

This document:
- does not approve any specific model;
- does not approve Godot or another engine for general Atlas production;
- does not authorize MUSEO ZERO implementation;
- does not authorize student runtime;
- does not authorize publication;
- does not change Arena curriculum authority.

It defines a production method and a quality target for Human Review.

## References

Internal:
- product/STORYTELLING-FIRST-AUTHORING-CONTRACT-v1.md
- product/FIRST-CYCLE-LEARNER-EXPERIENCE-SPEC-v1.md
- narrative-experience-bible.md
- architecture/productive-pathway-workflow-v1.md

External tool references reviewed for v0.1:
- https://github.com/Comfy-Org/ComfyUI
- https://github.com/Acly/krita-ai-diffusion
- https://docs.godotengine.org/en/stable/
- https://docs.blender.org/manual/en/latest/grease_pencil/
- https://opentoonz.github.io/e/
- https://wonderunit.com/storyboarder/
- https://github.com/Lightricks/LTX-Video

Benchmark:
- https://education.minecraft.net/


## Compute orchestration boundary

Visual Factory production requests do not choose providers directly.

Canonical direction:

`VisualProductionRequest → TRAMA Compute Policy → SkyPilot → authorised provider → receipt/assets`

References:

- `TRAMA-COMPUTE-POLICY-v0.1.md`
- `SKYPILOT-ORCHESTRATOR-v0.1.md`
- `TRAMA-ADR-021`

Compute is subordinate infrastructure. A missing FREE_ONLY provider produces **Produzione in attesa** and does not block non-production authoring.


## Production request/receipt boundary

Studio Atlas communicates with the Factory through:

- `atlas.visual-production-request/v0.1`;
- `atlas.visual-production-receipt/v0.1`.

Reference: `VISUAL-PRODUCTION-CONTRACT-v0.1.md`.

The request binds creator intent to an exact authoring-package digest. The receipt reports execution/output truth only; quality/publication decisions remain separate.
