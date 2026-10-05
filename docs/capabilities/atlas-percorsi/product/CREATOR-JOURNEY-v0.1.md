# Studio Atlas — Creator Journey v0.1

**Status:** PRODUCT_FOUNDATION_CANDIDATE / HUMAN_DIRECTION_APPROVED  
**Runtime:** NOT_AUTHORIZED  
**Date:** 2026-10-04  
**Applies to:** professional creation of Atlas Percorsi

## 1. Purpose

Define the end-to-end professional journey for creating a reusable Atlas Percorso without exposing repository, model, compute-provider or governance mechanics as routine user work.

The same journey MUST remain valid whether Studio Atlas is:

1. initially surfaced inside the authenticated Docente OS shell; or
2. later deployed as a standalone professional product sharing the same identity and contracts.

Deployment topology must not redefine the authoring model.

## 2. Core product promise

A professional creator can move from:

`idea → reviewed story → learning world → scenes → produced candidate → learner preview → publication candidate`

without:

- using GitHub;
- writing AI prompts;
- choosing model files;
- managing GPU providers;
- knowing repository paths;
- creating an Atlas public-user account;
- binding the Percorso permanently to one class or lesson.

## 3. Entry

### Primary entry

Professional home:

**Crea → Studio Atlas**

The initial deployment MAY expose this inside Docente OS because Docente OS already owns a real authenticated professional workspace.

The visible transition must make clear that the user is entering a different creative context.

### Contextual seeds

Allowed entry points:

- **Trasforma questa attività in un Percorso**
- **Usa questo materiale come punto di partenza**
- **Crea un Percorso da questa competenza**
- **Riutilizza questo mondo / questa storia**

A contextual entry creates a seed. It does not carry the whole class/lesson context into Atlas authoring.

## 4. Journey overview

| Stage | Creator question | Dominant surface | System responsibility | Human gate |
|---|---|---|---|---|
| Idea | Cosa voglio far vivere/imparare? | brief / conversation / seed | preserve intent, suggest structure | creator accepts direction |
| Storia | Perché dovrebbe interessare? | story beat board | assist story anatomy | Human Story Review |
| Mondo | Dove accade e che ruolo ha lo studente? | world/agency canvas | expose role, information, consequence | world review |
| Esperienza | Cosa farà davvero lo studente? | experience map | compare experiential grammars | creator selection |
| Scene | Come si svolge momento per momento? | storyboard strip | maintain continuity and consequence | storyboard review |
| Produzione | Come diventa un prodotto credibile? | production board | Visual Factory + compute orchestration | Reference/Quality Review |
| Prova | Cosa vede davvero lo studente? | learner preview | render non-public candidate | Human Use Review |
| Revisione | Cosa va corretto prima di proporlo? | review workspace | deterministic checks + evidence | qualitative review |
| Pubblicazione | È pronto per essere proposto? | submission summary | create immutable candidate package | explicit human submission |

## 5. Stage 1 — Idea

The creator may start from:

- an Arena curriculum reference;
- a plain-language idea;
- an existing Docente OS lesson/material;
- an existing Atlas world/story/pathway;
- an identified competence need.

Required product behaviour:

- accept natural language;
- keep professional terms out of learner-facing text by default;
- distinguish authoritative Arena bindings from creator-authored learning intent;
- allow incomplete ideas to remain as seeds.

Output:
`PATHWAY_SEED`.

## 6. Stage 2 — Storia

The authoring surface must support:

- hook/opening image;
- setting;
- characters;
- character goals;
- initial state;
- disruption;
- unknown/curiosity;
- learner role;
- escalation;
- turning point;
- resolution/open ending;
- emotional register;
- age-dignity boundary.

AI may:

- propose alternatives;
- identify missing story anatomy;
- rewrite for clarity;
- compare concepts.

AI may not:

- approve the story;
- silently change the target age;
- replace Human Story Review.

Exit condition:
`STORY_APPROVED_FOR_WORLD_DESIGN`.

## 7. Stage 3 — Mondo

The creator works with understandable product concepts:

- **Il ruolo dello studente**
- **Cosa può osservare**
- **Cosa può cambiare**
- **Cosa ancora non sa**
- **Cosa succede quando agisce**
- **Perché dovrebbe voler continuare**

Internally these map to:

- World Brief;
- Role/Agency Map;
- Information Distribution;
- Consequence Model.

The user need not know the internal artefact names.

## 8. Stage 4 — Esperienza

The system presents suitable experience forms through examples/previews rather than grammar IDs.

Candidate forms may include:

- inquiry/evidence;
- branching consequence;
- workshop/construction;
- simulation/microworld;
- sequential visual narrative;
- environmental storytelling;
- viewpoint/theatre;
- map/exploration.

The creator chooses; the system records selected/rejected/deferred options and rationale.

## 9. Stage 5 — Scene

The dominant model is a scene strip/storyboard.

Each scene answers:

1. what the learner sees;
2. what the learner can do;
3. what changes;
4. what becomes known;
5. why the experience continues.

The system guards:

- continuity;
- learner-language clarity;
- relation between action and consequence;
- scene purpose;
- mobile feasibility.

No polished visual production is required before the structural storyboard is reviewable.

## 10. Stage 6 — Produzione

The creator sees product intent, not infrastructure.

Primary actions:

- **Crea una prima versione**
- **Rigenera questa scena**
- **Mantieni il personaggio, cambia l'ambiente**
- **Correggi questo dettaglio**
- **Confronta due varianti**

Hidden infrastructure may use:

- Visual Factory;
- reference locks;
- local/open models;
- external compute;
- provider orchestration.

Provider/model selection MUST NOT be a routine creator task.

### Unavailable compute

If no authorised compute is available:

**Produzione in attesa**

The creator may continue all non-production authoring.

The product MUST NOT:

- ask the creator to configure Kaggle/Colab/cloud;
- purchase compute;
- silently downgrade quality;
- loop across providers without bounded policy.

## 11. Stage 7 — Prova

Primary action:

# Vedi come studente

Requirements:

- non-public route/environment;
- same learner-facing shell intended for Atlas;
- no authoring chrome;
- mobile-first preview;
- accessibility modes;
- deterministic version binding.

The creator can return directly to the originating scene/review issue.

## 12. Stage 8 — Revisione

The review workspace separates:

### Automated evidence

- schema completeness;
- missing bindings;
- broken references;
- accessibility checks where deterministic;
- asset provenance presence;
- licensing declarations;
- continuity warnings;
- runtime contract checks.

### Human judgement

- story quality;
- age dignity;
- desire to continue;
- visual craft;
- narrative coherence;
- experiential rhythm;
- learner clarity;
- meaningful agency.

Automation cannot promote a qualitative judgement to PASS.

## 13. Stage 9 — Publication candidate

Primary action:

**Invia per pubblicazione**

This creates an immutable submission snapshot.

The creator must see:

- what is being submitted;
- what remains excluded;
- current review state;
- consequences of submission;
- next step.

The result is:

`PUBLISH_CANDIDATE`

not public release.

## 14. Return journey

A published Percorso remains connected to Studio Atlas for:

- new version;
- correction;
- replacement;
- withdrawal request;
- provenance inspection;
- review history.

Published state is not a dead end.

## 15. Human-facing state language

Preferred UI states:

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

Internal states may be more precise but are progressively disclosed.

## 16. Mobile principle

Mobile authoring is supported for:

- idea capture;
- review;
- comments;
- story beats;
- scene inspection;
- approval/revision decisions;
- learner preview.

Complex visual composition may provide a richer large-screen workspace, but mobile must never become a broken desktop canvas.

## 17. Success criterion

A competent professional user should be able to create and submit a serious first Percorso without understanding:

- TRAMA repository structure;
- workflow IDs;
- schemas;
- compute providers;
- model architectures;
- deployment systems.

The system must preserve those technical/governance artefacts without making them the user's work.
