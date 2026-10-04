# Atlas Percorsi — Creator Studio Product Vision v0.1

**Status:** PRODUCT_DIRECTION_CANDIDATE / HUMAN_REVIEW_REQUIRED  
**Runtime:** NOT_AUTHORIZED  
**Applies to:** TRAMA · Arena · Atlas · Docente OS · Atlas Percorsi  
**Date:** 2026-10-04

## 1. Product question

How can a professional creator conceive, design, produce, review and publish a new Atlas Percorso without:

- editing repositories;
- learning GitHub;
- writing prompts;
- managing GPU providers;
- duplicating professional identity;
- turning Atlas into a backoffice/CMS;
- turning Docente OS into a second Atlas implementation environment?

This document defines the product direction that best fits the current ecosystem contracts and the authoring research already completed.

## 2. Current evidence from the ecosystem

### Docente OS already has the professional identity surface

The current product already provides:

- authenticated professional access;
- personal workspace bootstrap;
- a teacher-owned operational context;
- Supabase/RLS-backed identity separation;
- class, planning, timetable and professional work surfaces.

The current login explicitly represents the authenticated user's professional workspace.

### Atlas is currently a learner/public/runtime product

Atlas currently provides:

- public curriculum navigation;
- Percorsi catalog/runtime surfaces;
- learning-object/resource identity and state;
- public/static publication mechanics;
- privacy-first learner access without student authentication.

Atlas does **not** currently provide a professional authenticated authoring workspace.

### Existing TRAMA authority is already explicit

Current contracts state:

- Arena is authoritative for curriculum and applicability;
- Docente OS is authoritative for professional context and the teacher's publication decision;
- Atlas is authoritative for identity/version/state of Atlas resources and publications;
- TRAMA governs cross-product contracts and assurance.

The existing Atlas product contract also explicitly rejects creating a second competing didactic editor inside Atlas.

## 3. Product direction

### 3.1 One professional identity, two distinct modes

The recommended direction is:

**Professional authentication remains outside the public Atlas learner surface.**

For the current ecosystem, the canonical professional entry point is **Docente OS**.

After authentication, a professional creator may enter a distinct workspace mode:

# Studio Atlas

Studio Atlas is not:

- the normal lesson workspace;
- the class workspace;
- a hidden Atlas admin;
- a repository editor;
- a generic CMS.

It is a **professional authoring mode for Atlas content** using the existing professional identity boundary.

The creator should not log into Atlas separately.

### 3.2 Atlas remains the destination, not the authoring account system

Public Atlas remains:

- anonymous for learners;
- navigable without student accounts;
- authoritative for published Atlas resource identity/version/state;
- the place where final authorised Percorsi are experienced.

Professional creation and public consumption remain distinct surfaces.

## 4. Why Studio Atlas should sit behind Docente OS identity

This direction avoids four avoidable duplications:

1. **Identity duplication**  
   no second username/password/account model for Atlas creators.

2. **Workspace duplication**  
   no second professional dashboard competing with Docente OS.

3. **Publication ambiguity**  
   the creator's professional decision remains on the authenticated professional side.

4. **Privacy erosion**  
   public Atlas does not acquire professional/student identity machinery merely to support authoring.

This is consistent with mature interactive-content patterns in which the authoring environment and the learner/player surface are separate concerns.

## 5. Important boundary: Studio Atlas is not class-bound

A creator must be able to open Studio Atlas without choosing:

- a class;
- a section;
- a lesson date;
- a timetable slot.

A Percorso is a reusable educational product, not a class diary entry.

Class/lesson context may optionally provide an **authoring seed**, for example:

> “Questa attività ha funzionato: trasformala in un Percorso Atlas.”

But once the author chooses to create a Percorso, the object enters the Studio Atlas lifecycle and becomes independent from the originating class context.

## 6. Creator roles

The product must distinguish identity from authority.

Candidate professional roles:

### Creator

May:

- create a pathway seed;
- develop story/world/scenes;
- request visual/product generation;
- revise the candidate;
- submit for review.

### Curator / Reviewer

May:

- review story;
- review product quality;
- review age dignity/accessibility/licensing;
- request revision;
- recommend publication candidate state.

### Publication authority

May:

- confirm the publication decision allowed by governance;
- never alter Arena curriculum authority;
- never bypass required Human Review.

One person may hold multiple roles in a pilot, but the roles remain conceptually distinct.

## 7. Entry points in Docente OS

Recommended professional entry point:

**Crea → Studio Atlas**

Alternative human labels to validate:

- Crea per Atlas
- Studio Percorsi
- Crea un Percorso

Avoid technical labels such as:

- Pathway Factory
- Runtime Builder
- Experience Kernel
- Visual Factory

Those remain implementation concepts.

### Contextual entry points

Docente OS may also expose:

- from Progetta: **Trasforma questa idea in un Percorso**
- from a lesson/material: **Crea una versione riutilizzabile per Atlas**
- from Knowledge: **Usa come materiale di partenza**

These actions create a seed only. They do not publish anything.

## 8. Studio Atlas home

Studio Atlas should open on professional work, not on infrastructure.

Primary objects:

- **In lavorazione**
- **Da rivedere**
- **Pronti per revisione**
- **Pubblicati**
- **Semi / idee**

The dominant action is:

**Nuovo Percorso**

The creator should never see:

- GitHub branches;
- SHA hashes;
- Kaggle/Colab/SkyPilot;
- model filenames;
- CI job names;
- provider quotas;

unless opening an explicit technical evidence disclosure.

## 9. Starting a new Percorso

The product should support four starting intents:

### A. Parto da una competenza

The creator selects a curriculum target projected from Arena.

The curriculum target remains a reference to Arena authority.

### B. Ho un'idea

The creator writes/speaks a short idea in ordinary language.

The system helps identify potential curriculum bindings later.

### C. Riutilizzo un mondo / una storia / un Percorso

The creator starts from an existing reusable storytelling/world/grammar asset where governance permits reuse.

### D. Parto da una mia attività

A lesson/material from Docente OS becomes an authoring seed.

The originating professional/class context is minimised before entering the reusable pathway dossier.

## 10. The authoring experience

The user should experience a creative process, not a compliance form.

Recommended main progression:

`IDEA → STORIA → MONDO → ESPERIENZA → SCENE → PRODUZIONE → PROVA → REVISIONE → PUBBLICAZIONE`

This maps internally to the governed W0–W10 workflow without exposing governance vocabulary as the primary UX.

### Stage 1 — Idea

The creator describes:

- what learners should become able to do;
- the age/grade context;
- the rough idea/problem;
- optional source lesson/material.

AI may help clarify but must not silently invent authority.

### Stage 2 — Story

Storytelling-first authoring becomes a real product surface.

The creator develops:

- opening image/hook;
- setting;
- characters;
- goals;
- disruption;
- unknown/question;
- turning point;
- ending.

The interface should allow:

- natural-language conversation;
- structured story beats;
- visual rearrangement;
- multiple candidate concepts;
- explicit Human Story Review.

The user should not need to write prompts.

### Stage 3 — World

The creator defines:

- learner role;
- what can be acted upon;
- where information lives;
- consequences;
- what makes the learner want to continue.

The system reuses the World Brief / role-agency / information-distribution / consequence contracts internally.

### Stage 4 — Experience

The system and creator choose an experiential grammar appropriate to both:

- cognitive action;
- approved story/world.

Examples may include:

- inquiry/evidence;
- branching consequence;
- construction/workshop;
- simulation/microworld;
- sequential visual narrative;
- environmental storytelling.

The creator chooses based on understandable previews, not grammar IDs.

### Stage 5 — Scenes

The experience becomes a storyboard.

The creator sees a sequence of scenes/beats.

For every scene the product answers:

- what the learner sees;
- what they can do;
- what changes;
- what is learned/revealed;
- what carries them into the next scene.

### Stage 6 — Production

The Visual Factory turns the reviewed storyboard into product candidates.

Possible outputs:

- illustrated sequence;
- graphic narrative;
- motion-enhanced sequence;
- micro-animation;
- interactive scene/world;
- reusable visual assets.

The creator sees:

- style/reference lock;
- canonical characters/world;
- generated candidate assets;
- revision controls.

The creator does not see compute-provider mechanics.

### Stage 7 — Prova

A single action:

**Vedi come studente**

opens the candidate in learner mode.

This preview must use the same product shell and interaction model expected in Atlas, while remaining non-public.

### Stage 8 — Revision

Review surfaces combine:

- story coherence;
- learner comprehension;
- visual continuity;
- age dignity;
- accessibility;
- rights/provenance;
- experience quality;
- mobile behaviour.

Deterministic checks are automated.

Qualitative decisions remain human.

### Stage 9 — Publication candidate

The creator may submit:

**Invia per pubblicazione**

This means:

`PUBLISH_CANDIDATE`

It does **not** mean public release.

Required review/authority receipts remain separate.

## 11. Studio Atlas information architecture

Recommended authoring workspace:

### Left rail — progression

- Idea
- Storia
- Mondo
- Esperienza
- Scene
- Produzione
- Prova
- Revisione

### Centre — dominant creative stage

The centre changes with the task:

- story beat board;
- world map;
- storyboard strip;
- scene canvas;
- visual production board;
- student preview.

The product should not default to a vertical stack of generic cards.

### Context panel — only when useful

Collapsed by default on small screens.

Contains:

- curriculum binding;
- source/provenance;
- safeguards;
- technical evidence;
- version history.

### Header

Shows:

- pathway title;
- plain-language state;
- last saved;
- **Vedi come studente**;
- next meaningful action.

No technical pipeline state should dominate the header.

## 12. Product state model

Human-facing states:

- Idea
- Storia da completare
- Storia pronta per revisione
- Mondo in progettazione
- Scene in lavorazione
- In produzione
- Da provare
- Da rivedere
- Candidato alla pubblicazione
- Pubblicato
- Ritirato

Internal governed states may remain more precise.

The UI translates them rather than exposing raw governance enums.

## 13. Where data and authority live

### Docente OS / Studio Atlas

Owns:

- authenticated professional session;
- creator workspace;
- personal draft interaction;
- creator intent;
- local/professional source context before minimisation;
- explicit submission/revision decisions.

It must not become authoritative for Arena curriculum.

### TRAMA governed authoring layer

Owns:

- authoring contracts;
- schemas;
- workflow/gate definitions;
- story/grammar/research registries;
- review receipts and cross-product governance.

Creators should not interact with the repository directly.

### Atlas implementation/publication layer

Owns:

- final Atlas resource identity;
- version;
- public runtime representation;
- publication state;
- withdrawal/version history.

### Arena

Remains authoritative for:

- curriculum;
- applicability;
- approval state;
- curriculum version.

## 14. Repository automation should disappear from the user journey

The current repository-first workflow remains valuable as the durable substrate.

But the product target is:

`CREATOR ACTION → STRUCTURED AUTHORING OBJECT → GOVERNED AUTOMATION → REPOSITORY EVIDENCE`

not:

`CREATOR → GITHUB → FILES → PR → WORKFLOW`

Git remains operational memory and audit substrate, not the professional user interface.

## 15. AI role in Studio Atlas

AI is an assistant to authoring, not an authority.

Appropriate assistance:

- turn rough ideas into alternative story candidates;
- identify missing story anatomy;
- suggest suitable experiential grammars;
- draft scene alternatives;
- suggest learner-language rewrites;
- generate/modify visual candidates;
- detect continuity inconsistencies;
- help prepare accessibility descriptions;
- flag provenance/licensing gaps;
- explain review findings.

AI must not:

- approve story quality;
- approve publication;
- invent Arena authority;
- silently change age target;
- infer student traits;
- lower quality gates to fit available compute.

## 16. Compute must become invisible product infrastructure

The Visual Factory requires compute but compute is not an authoring concept.

Recommended architecture:

`Studio Atlas → Visual Production Request → TRAMA Compute Policy → Orchestrator → provider → receipt/assets → Studio Atlas`

The creator action is simply:

**Genera anteprima**

or:

**Aggiorna questa scena**

### Product behaviour while compute is unavailable

Authoring must continue.

If no authorised free GPU is currently available:

- save the production request;
- show a calm state such as **Produzione in attesa**;
- allow story/world/scene editing to continue;
- never ask the creator to configure providers;
- never auto-purchase compute;
- never silently reduce quality.

## 17. Compute orchestration direction

### Mature orchestration

SkyPilot is the leading candidate for programmable multi-provider GPU orchestration because it provides:

- one job specification across multiple infrastructures;
- availability/cost-aware provisioning;
- smart failover on capacity errors;
- support for multiple GPU clouds and clusters;
- portable workloads.

dstack remains a credible alternative/control comparison.

### TRAMA-specific policy still required

No mature orchestrator should decide ecosystem authority.

A thin TRAMA Compute Policy must constrain:

- allowed providers;
- `FREE_ONLY` / max-cost boundary;
- required GPU/VRAM profile;
- provider quota/credit state when observable;
- maximum attempts;
- no automatic paid failover;
- no quality downgrade;
- evidence/receipt requirements.

### Consumer free notebook services

Colab Free and Kaggle Free may remain:

- diagnostic adapters;
- opportunistic providers;
- research inputs.

They should not become canonical production dependencies until programmatic GPU provisioning is demonstrably reliable.

The empirical Kaggle result already shows why:
a persisted T4 request and available quota did not guarantee a GPU runtime.

## 18. Creation package

Studio Atlas should gradually produce one machine-readable **Pathway Authoring Package**.

Candidate contents:

- pathway identity;
- creator intent;
- Arena curriculum refs;
- age/grade;
- storytelling concept;
- story-review receipt;
- world brief;
- role/agency model;
- information distribution;
- consequence model;
- selected experiential grammar;
- storyboard/scenes;
- visual reference lock;
- asset provenance;
- accessibility/licensing declarations;
- human-review decisions;
- student-preview receipt;
- publication-candidate decision.

This package becomes the stable handoff between Studio Atlas, TRAMA governance and Atlas implementation.

The creator should never assemble this package manually.

## 19. Relationship with ordinary Docente OS publication

Two actions must remain distinct.

### Publish lesson/material

Existing conceptual flow:

`Docente OS lesson → LessonPublicationManifest → Atlas`

Purpose:
publish lesson/material content.

### Create Atlas Percorso

New proposed flow:

`Studio Atlas authoring → Pathway Authoring Package → governed product review → Atlas implementation/publication`

Purpose:
create a reusable learner-facing educational product.

A Percorso is not merely a published lesson.

Do not reuse the LessonPublicationManifest as the complete Percorsi authoring contract.

## 20. Product-level definition of success

A professional creator can:

1. sign in once;
2. open Studio Atlas;
3. start from an idea, curriculum need, existing world or own lesson;
4. develop a story without writing prompts;
5. create/review world and learner agency;
6. turn the story into scenes;
7. request visual/product production without knowing the provider;
8. preview exactly as a learner;
9. understand what remains to be fixed;
10. submit a publication candidate;
11. later see the published Percorso in Atlas.

At no point must they:

- use GitHub;
- manage GPUs;
- select model files;
- understand repository structure;
- manipulate governance receipts manually.

## 21. Product-level definition of failure

The direction fails if:

- Atlas gains a second independent professional login/admin;
- Studio Atlas becomes a long compliance form;
- every Percorso is produced from the same UI template;
- the teacher must understand AI prompts/provider configuration;
- the authoring process is tied to a specific class;
- publish means immediate public release;
- GPU availability blocks all creative work;
- AI becomes the final quality/publication authority;
- repository mechanics leak into routine authoring.

## 22. Implementation sequence

### P0 — Product contract

Define and Human Review:

- Studio Atlas boundary;
- creator/reviewer/publication roles;
- Pathway Authoring Package;
- professional identity reuse;
- publication separation.

No major UI implementation before this is stable.

### P1 — Thin authoring shell in Docente OS

Implement only:

- **Crea → Studio Atlas**;
- creator project list;
- create pathway seed;
- plain-language lifecycle;
- persistent draft.

No Visual Factory dependency yet.

### P2 — Story-first editor

Implement:

- story beat authoring;
- Human Story Review;
- Arena binding;
- reusable story registry access.

### P3 — World + storyboard

Implement:

- learner role/agency;
- consequence;
- world brief;
- scene strip;
- student-language checks.

### P4 — Visual Factory integration

Implement asynchronous:

- production requests;
- reference lock;
- asset candidates;
- provider-independent receipts;
- preview assets.

### P5 — Atlas preview

Implement:

- **Vedi come studente**;
- non-public preview route;
- mobile/accessibility review.

### P6 — Publication candidate

Implement:

- complete authoring package;
- quality review;
- rights/accessibility gates;
- explicit Human Review;
- Atlas publication handoff.

## 23. Open decisions

The following remain intentionally open:

1. whether Studio Atlas is physically rendered inside the Docente OS application or becomes a separately deployed professional app sharing the same identity;
2. whether non-teacher professional creators require an ecosystem-wide identity service later;
3. final name: Studio Atlas / Studio Percorsi / Crea per Atlas;
4. storage model for working drafts before repository materialisation;
5. exact Pathway Authoring Package schema;
6. orchestrator choice: SkyPilot vs dstack vs controlled comparison;
7. which zero-cost programmable GPU providers can satisfy the production profile;
8. exact publication-review role model.

## 24. Recommended product decision now

Adopt as the design direction for further work:

> **The professional creator signs in through the existing Docente OS identity boundary and enters a distinct Studio Atlas authoring mode. Atlas itself remains the public/learner destination and does not gain a competing professional account/editor. Studio Atlas hides repository, AI and compute infrastructure, guides the creator from idea/story to reviewed publication candidate, and emits governed structured artefacts for TRAMA and Atlas.**

This is a product direction, not runtime authorization.
