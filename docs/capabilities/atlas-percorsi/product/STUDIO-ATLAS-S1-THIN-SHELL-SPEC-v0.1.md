# Studio Atlas — S1 Thin Shell Specification v0.1

**Status:** IMPLEMENTATION_SPEC_CANDIDATE / HUMAN_REVIEW_REQUIRED  
**Runtime:** NOT_AUTHORIZED  
**Date:** 2026-10-04  
**Depends on:** Studio Atlas Product Foundation v0.1 + TRAMA-ADR-020

## 1. Goal

Prove Studio Atlas as a real professional product surface before integrating the Visual Factory or complex authoring tools.

S1 must allow an authenticated professional to:

1. enter Studio Atlas;
2. see authoring projects;
3. create a pathway seed;
4. open it;
5. rename it;
6. persist a structured draft;
7. archive/restore it;
8. leave and return without losing state.

No public Atlas publication occurs.

## 2. Initial deployment

Preferred pilot deployment:

`Docente OS authenticated shell → /studio-atlas`

This is a distribution decision only.

The route MUST NOT require:

- section ID;
- class ID;
- timetable slot;
- lesson ID;
- annual-plan block.

Studio Atlas remains valid with none of those contexts present.

## 3. Navigation

Candidate global entry:

**Crea**

Inside:

- **Studio Atlas**
- future other creator tools if needed.

Direct entry label:

**Crea un Percorso**

From a lesson/material, contextual entry may create a seed and redirect to the same Studio Atlas route.

## 4. Identity Adapter

S1 defines an interface rather than binding authoring semantics to Supabase/Docente OS tables.

Logical contract:

```ts
type ProfessionalIdentity = {
  subjectRef: string
  workspaceRef?: string
  displayName?: string
  roles: string[]
}

interface ProfessionalIdentityAdapter {
  getCurrentProfessional(): Promise<ProfessionalIdentity | null>
}
```

Initial implementation MAY adapt the existing authenticated Docente OS Supabase session.

Rules:

- no student identity;
- no class membership required;
- account email is not a public creator attribution field;
- authoring package stores governed refs, not raw auth tokens/claims.

## 5. Project record

Minimal logical model:

```ts
type StudioAtlasProject = {
  projectId: string
  ownerSubjectRef: string
  title: string
  humanState:
    | 'IDEA'
    | 'STORY_DRAFT'
    | 'STORY_REVIEW'
    | 'WORLD_DESIGN'
    | 'SCENES'
    | 'PRODUCTION'
    | 'PREVIEW'
    | 'REVIEW'
    | 'PUBLISH_CANDIDATE'
    | 'PUBLISHED'
    | 'WITHDRAWN'
  packageId: string
  packageVersion: number
  archived: boolean
  createdAt: string
  updatedAt: string
}
```

This record is the project index, not the full authoring package.

## 6. Draft Store

S1 requires a persistent **Authoring Draft Store** behind an interface.

Logical operations:

- `listProjects(subjectRef)`
- `createSeed(subjectRef, input)`
- `getProject(projectId)`
- `saveDraft(projectId, expectedRevision, packageDraft)`
- `renameProject(projectId, title)`
- `archiveProject(projectId)`
- `restoreProject(projectId)`

### Concurrency

Draft writes use optimistic revision control.

A stale editor cannot silently overwrite a newer draft.

### Physical storage

For the initial embedded deployment, the store MAY live in the same Supabase project already used by Docente OS, provided that:

- Studio Atlas tables/schema are logically separate;
- RLS is explicit;
- class/lesson tables are not dependencies;
- export of the Pathway Authoring Package is possible without Docente OS-specific joins.

This is a deployment convenience, not a domain merge.

## 7. S1 Home

Primary surface:

# Studio Atlas

Secondary sentence:

**Crea e sviluppa Percorsi da vivere in Atlas.**

Sections:

- **Continua**
- **Da rivedere**
- **Pubblicati** — may be empty/read-only in S1
- **Idee archiviate**

Dominant action:

**Nuovo Percorso**

Avoid dashboard metrics unless they help immediate work.

## 8. New pathway seed

Opening **Nuovo Percorso** should ask only what is necessary.

First screen:

**Da dove vuoi partire?**

Options:

- Da un'idea
- Da una competenza
- Da una mia attività
- Da una storia o un Percorso esistente

For S1, only **Da un'idea** must be fully implemented.

Minimal seed input:

- working title;
- plain-language idea;
- target age/grade band.

Save creates:

- project record;
- Pathway Authoring Package draft;
- state `IDEA`.

## 9. Project workspace

S1 workspace is intentionally small.

Header:

- title;
- state;
- save feedback;
- back to Studio Atlas.

Progress rail may show future stages:

- Idea
- Storia
- Mondo
- Esperienza
- Scene
- Produzione
- Prova
- Revisione

Only **Idea** is editable in S1.

Other stages display:

**Disponibile nelle prossime fasi dello Studio**

without fake functionality.

## 10. Save behaviour

Every user-initiated write follows TRAMA perceptible-write principles.

Required feedback:

- saving state for asynchronous writes;
- explicit saved state;
- clear error;
- retry action where safe;
- no ambiguous "bozza" vs "attivo" state.

Preferred copy:

- **Salvataggio…**
- **Salvato**
- **Non è stato possibile salvare. Riprova.**

Autosave may be added only if the state remains perceptible and conflict-safe.

## 11. Archive instead of destructive delete

S1 supports:

- **Archivia**
- **Ripristina**

Permanent deletion is not required.

This keeps early product behaviour reversible.

## 12. Repository materialisation

S1 MUST NOT create a Git commit for every keystroke.

Repository materialisation occurs only at explicit governed boundaries, for example:

- Human Story Review submission;
- learner-preview build;
- publication-candidate snapshot.

Draft storage and governed repository evidence are separate layers.

## 13. No Visual Factory dependency

S1 must pass acceptance even if:

- no GPU provider is configured;
- SkyPilot is absent;
- Kaggle/Colab are unavailable;
- no image model is installed.

This prevents compute research from blocking product validation.

## 14. Security/privacy

Required before runtime:

- authenticated professional only;
- explicit RLS/ownership isolation;
- no student personal data in seeds;
- contextual Docente OS seed minimisation;
- CSRF/session controls appropriate to the host;
- no secrets in authoring package;
- audit of consequential submission events.

## 15. Accessibility/product quality

S1 target:

- WCAG 2.2 AA direction;
- keyboard usable;
- mobile reflow;
- clear focus;
- no horizontal creator-canvas dependency for core seed operations;
- plain-language states;
- no generic card wall as the primary workspace.

## 16. Acceptance journey

A human tester can:

1. sign into Docente OS;
2. choose **Crea → Studio Atlas**;
3. see an empty/real project list;
4. choose **Nuovo Percorso**;
5. choose **Da un'idea**;
6. enter title + idea + age band;
7. save;
8. leave Studio Atlas;
9. return;
10. reopen the same project;
11. rename it;
12. archive it;
13. restore it.

At no point must a class be selected.

At no point must GitHub/provider/model configuration appear.

## 17. Definition of Done

S1 is complete only when:

- identity adapter is explicit;
- project/draft store is explicit;
- ownership isolation is tested;
- project operations are persistent and reversible;
- package draft validates against the v0.1 schema subset required for S1;
- mobile journey works;
- perceptible write feedback works;
- no class dependency exists;
- no Visual Factory dependency exists;
- Human Use Review confirms the creator understands where they are and what a Percorso project is.

## 18. S2 handoff

After S1 is accepted, S2 adds:

- story beat editor;
- story alternatives;
- Human Story Review;
- Arena binding/search;
- story registry integration.

Do not start S2 merely because S1 compiles.
