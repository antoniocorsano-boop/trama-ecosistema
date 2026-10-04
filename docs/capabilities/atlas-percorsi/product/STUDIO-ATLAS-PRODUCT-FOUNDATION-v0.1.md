# Studio Atlas — Product Foundation v0.1

**Status:** PRODUCT_FOUNDATION_CANDIDATE / HUMAN_DIRECTION_APPROVED  
**Runtime:** NOT_AUTHORIZED  
**Date:** 2026-10-04

## Purpose

Single product-level entry point for the professional Atlas Percorsi authoring domain.

Studio Atlas is defined as a **standalone professional product domain** with its own deployment/runtime boundary. Docente OS remains a privileged professional entry point through federated/shared identity and deep links, but Studio Atlas does not live inside the Docente OS class/lesson domain.

## Product sentence

> Studio Atlas turns a professional creator's educational idea into a governed, previewable and publishable-candidate Atlas Percorso without requiring the creator to understand repositories, prompts, AI models or compute providers.

## Product boundaries

### Studio Atlas owns the authoring experience

It owns:

- pathway seeds;
- story authoring;
- world/agency design;
- scene/storyboard authoring;
- production requests;
- review workflow presentation;
- learner-preview orchestration;
- publication-candidate submission;
- authoring package lifecycle.

### Studio Atlas does not own

- Arena curriculum authority;
- public Atlas publication state;
- Docente OS class/timetable truth;
- TRAMA governance authority;
- GPU/provider authority;
- student identity.

## Deployment modes

### Mode A — Standalone Studio Atlas

**Selected application direction**

Studio Atlas is deployed as its own web/PWA application with its own authoring domain, release cadence and draft store.

Docente OS reaches it through:
- shared/federated professional identity;
- deep links;
- minimised handoff objects when a lesson/material becomes a seed.

No second creator registration should be required for an already authenticated professional.

### Mode B — Docente OS privileged entry

**Required ecosystem integration**

`Docente OS → Crea → Studio Atlas`

and contextual actions such as:

`Lezione/Materiale → Trasforma in Percorso → Studio Atlas`

This is an integration path, not embedded domain ownership.

### Mode C — Atlas public admin/editor

**Rejected as default**

Public Atlas remains learner/public facing and does not gain a professional account/editor merely to support authoring.

## Canonical foundation set

1. `CREATOR-STUDIO-PRODUCT-VISION-v0.1.md`
2. `CREATOR-JOURNEY-v0.1.md`
3. `PATHWAY-AUTHORING-PACKAGE-v0.1.md`
4. `CREATOR-ROLES-AUTHORITY-v0.1.md`
5. `schemas/atlas-pathway-authoring-package.v0.1.schema.json`
6. `TRAMA-ADR-020`
7. Storytelling-first authoring contract
8. Visual Factory + Visual Quality Bar

## Main product surfaces

### Home

- In lavorazione
- Da rivedere
- Pronti per revisione
- Pubblicati
- Semi / idee
- **Nuovo Percorso**

### Percorso workspace

Progression:

`Idea → Storia → Mondo → Esperienza → Scene → Produzione → Prova → Revisione`

Header:

- title;
- human-readable state;
- save state;
- **Vedi come studente**;
- next meaningful action.

Technical evidence remains progressive disclosure.

## Internal architecture

`Professional Identity Adapter`
→ `Studio Atlas Authoring Service`
→ `Pathway Authoring Package`
→ `TRAMA gates/reviews`
→ `Visual Factory / Compute Policy`
→ `Learner Preview`
→ `Atlas handoff`

The repository is a materialisation/audit substrate, not the author UI.

## Product APIs/contracts to design next

- Professional Identity Adapter
- Authoring Draft Store
- Pathway Authoring Package service
- Review Receipt interface
- Visual Production Request/Receipt
- Learner Preview Request/Receipt
- Atlas Handoff contract

These interfaces should remain provider-independent.

## Data classes

### Professional-private

- account identity;
- workspace refs;
- draft metadata;
- unpublished creator notes.

### Governed reusable authoring

- pathway package;
- story/world/scenes;
- review evidence;
- asset provenance.

### Public Atlas

Only material explicitly accepted for Atlas handoff/publication.

Professional identity is not public by default.

## Minimal viable product

The MVP is deliberately smaller than the complete factory.

It includes:

1. authenticated professional entry;
2. Studio Atlas project list;
3. new pathway seed;
4. story-first editor;
5. simple world/agency model;
6. scene strip;
7. persistent draft;
8. non-public learner preview;
9. review state;
10. export/materialisation of a valid Pathway Authoring Package.

Visual generation MAY initially be asynchronous/manual behind the production interface.

The MVP does not require a fully qualified multi-provider GPU orchestrator.

## Non-goals for MVP

- student accounts;
- marketplace/community publishing;
- social creator features;
- public creator profiles;
- automatic curriculum approval;
- one-click public release;
- general-purpose LMS/CMS;
- full video-generation suite;
- autonomous quality approval.

## Product maturity sequence

### S0 — Foundation
Contracts, journey, package, roles, boundary.

### S1 — Thin shell
Identity adapter + project list + seed + draft.

### S2 — Story/world
Story-first editing + Human Story Review.

### S3 — Scenes/preview
Storyboard + learner preview.

### S4 — Production integration
Visual Factory requests/receipts.

### S5 — Review/handoff
Quality review + immutable publication candidate + Atlas handoff.

### S6 — Standalone readiness
Identity abstraction, independent deployment, creator-role expansion.

## Decision threshold for extracting a standalone app

Do not extract merely for architectural purity.

Standalone deployment becomes justified when one or more are true:

- non-Docente-OS creators are a real user group;
- authoring release cadence materially diverges from Docente OS;
- Studio Atlas needs independent scaling/storage/security policy;
- the authoring UI becomes large enough to harm Docente OS cognitive scope;
- institutional SSO/creator collaboration requires an independent boundary.

Until then, embedded distribution is cheaper while the product domain remains independent.

## Immediate next implementation tranche

Build **S1 Thin Shell specification**, not the full UI:

- route/navigation entry;
- identity adapter contract;
- creator project record;
- draft storage decision;
- create/open/rename/archive seed;
- state translation;
- package materialisation boundary.

No Visual Factory integration is required to validate S1.


## Lesson continuity invariant

Studio Atlas must not weaken the centrality of the lesson in Docente OS.

Every reusable Atlas object produced through Studio Atlas must remain attachable back to professional lesson preparation through stable references.

Required direction:

`Studio Atlas/Atlas pathway or material → stable reusable resource reference → Docente OS lesson/material slot`

This means:

- a published/qualified Percorso can be selected from Docente OS while preparing a lesson;
- a published/qualified Atlas material can be selected from Docente OS while preparing a lesson;
- Docente OS decides whether/how the resource is used in the lesson;
- Studio Atlas does not own TeachingSession, timetable, class or lesson state;
- using a Percorso in a lesson does not copy curriculum authority into Docente OS;
- a lesson may seed a new Percorso, but the new Percorso becomes reusable and class-independent.

The detailed runtime binding is intentionally deferred while Studio Atlas/Visual Factory are completed.

This invariant MUST be preserved in later Atlas ↔ Docente OS integration contracts and must not be reopened accidentally as a consequence of standalone deployment.
