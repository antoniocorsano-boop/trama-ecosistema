# TRAMA-TERM-01 Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allineare il dominio interno e il naming attivo di Atlas al termine `curricolo`, mantenendo compatibilità con l'export Arena v1 legacy.

**Architecture:** Atlas introduce un package canonico `src/features/curricolo/` e mantiene temporaneamente `src/features/curriculum/` come compatibility boundary. L'adapter converte il payload legacy Arena v1 in tipi interni `Curricolo*`; route e UI restano `/curricolo`, mentre il nome prodotto diventa semplicemente `Atlas`.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, Node 24, Playwright, ESLint, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-09-trama-term-01-curricolo-vocabulary-design.md`

## Global Constraints

- `ARENA_ATLAS_CURRICULUM_EXPORT_V1` resta invariato e leggibile.
- Nessuna rinomina del repository `Curriculum-Atlas` in questo piano.
- Nessuna modifica distruttiva al path esterno `/curricolo`.
- Il modello interno nuovo usa `Curricolo*` / `curricolo*`.
- Il nome prodotto attivo è `Atlas`.

## Review Focus

- Un export v1 valido deve produrre lo stesso contenuto utente prima e dopo la migrazione.
- Un export v1 invalido deve continuare a fallire con gli stessi gate di authority.
- I re-export legacy non devono diventare il punto di importazione dei nuovi file.
- Metadati e UI non devono mostrare “Curriculum Atlas” come nome prodotto.
- Il repository/package slug legacy deve restare invariato finché la rinomina infrastrutturale è differita.

---

### Task 1: Modello canonico `Curricolo*`

**Files:**
- Create: `src/features/curricolo/model.ts`
- Modify: `src/features/curriculum/model.ts`
- Create: `scripts/test-curricolo-domain-compat.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: shape `CurriculumObjective`, `CurriculumTopic`, `CurriculumBand`, `CurriculumDiscipline`, `InstituteCurriculum`.
- Produces: `CurricoloObjective`, `CurricoloTopic`, `CurricoloBand`, `CurricoloDiscipline`, `InstituteCurricolo`; compatibility re-export dal package legacy.

- [ ] **Step 1: Write RED compatibility test**

Creare `scripts/test-curricolo-domain-compat.mjs` che legga i moduli sorgente e richieda l'esistenza dei nuovi tipi e il re-export deprecato dei vecchi.

- [ ] **Step 2: Run RED**

Run: `node scripts/test-curricolo-domain-compat.mjs`
Expected: FAIL perché `src/features/curricolo/model.ts` non esiste.

- [ ] **Step 3: Implement canonical model**

Creare il nuovo modulo con shape equivalenti; trasformare `src/features/curriculum/model.ts` in compatibility re-export con commenti `@deprecated` e senza definizioni divergenti.

- [ ] **Step 4: Add package script and run GREEN**

Aggiungere `"test:curricolo:compat": "node scripts/test-curricolo-domain-compat.mjs"`.
Run: `pnpm test:curricolo:compat && pnpm typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add src/features/curricolo/model.ts src/features/curriculum/model.ts scripts/test-curricolo-domain-compat.mjs package.json && git commit -m "TRAMA-TERM-01: add canonical Atlas curricolo model"`

### Task 2: Adapter Arena v1 → Curricolo interno

**Files:**
- Create: `src/features/curricolo/arena-projected.ts`
- Modify: `src/features/curriculum/arena-projected.ts`
- Modify: `scripts/test-curricolo-domain-compat.mjs`
- Do not rename: `src/features/curriculum/arena-curriculum-export.json`
- Do not change semantic validation in: `scripts/validate-arena-curriculum-authority.mjs`

**Interfaces:**
- Consumes: legacy v1 export JSON and validator authority.
- Produces: `arenaCurricoloAuthority`, `projectArenaCurricolo(...)` and canonical typed model; legacy adapter re-exports the canonical implementation.

- [ ] **Step 1: Add RED boundary assertions**

Testare che il nuovo adapter importi il JSON v1 legacy ma esporti simboli `Curricolo*`; verificare che il literal `ARENA_ATLAS_CURRICULUM_EXPORT_V1` rimanga nel boundary legacy.

- [ ] **Step 2: Run RED**

Run: `pnpm test:curricolo:compat`
Expected: FAIL perché il nuovo adapter manca.

- [ ] **Step 3: Implement canonical adapter**

Spostare la logica di proiezione nel nuovo file senza cambiare algoritmi, authority checks o dati prodotti. Lasciare il vecchio file come re-export compatibility.

- [ ] **Step 4: Run GREEN + existing regression**

Run: `pnpm test:curricolo:compat && node scripts/validate-provisional-curriculum-regression.mjs && pnpm typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add src/features/curricolo/arena-projected.ts src/features/curriculum/arena-projected.ts scripts/test-curricolo-domain-compat.mjs && git commit -m "TRAMA-TERM-01: isolate legacy Arena curriculum export boundary"`

### Task 3: Migrare i consumer UI al package canonico

**Files:**
- Modify: `src/app/curricolo/page.tsx`
- Modify: `src/app/obiettivi/[id]/page.tsx`
- Modify: `src/app/esplora/page.tsx`
- Modify: `src/features/explore/graph.ts`
- Modify: `src/components/atlas/curriculum-tree.tsx`
- Create: `src/components/atlas/curricolo-tree.tsx`
- Modify: `scripts/test-curricolo-domain-compat.mjs`

**Interfaces:**
- Consumes: package `src/features/curricolo/` Task 1-2.
- Produces: consumer interni senza import da `@/features/curriculum` salvo compatibility file.

- [ ] **Step 1: Add RED import-boundary assertions**

Il test deve fallire se i file consumer elencati importano `@/features/curriculum/` o simboli `Curriculum*`.

- [ ] **Step 2: Run RED**

Run: `pnpm test:curricolo:compat`
Expected: FAIL sulle import correnti.

- [ ] **Step 3: Migrate imports/component name**

Creare `CurricoloTree`; mantenere `curriculum-tree.tsx` come re-export temporaneo solo per consumer legacy non migrati. Aggiornare i consumer elencati al package canonico.

- [ ] **Step 4: Run GREEN**

Run: `pnpm test:curricolo:compat && pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add src/app src/features/explore src/components/atlas scripts/test-curricolo-domain-compat.mjs && git commit -m "TRAMA-TERM-01: migrate Atlas consumers to curricolo domain"`

### Task 4: Naming prodotto Atlas

**Files:**
- Modify: `README.md`
- Modify: `src/app/layout.tsx`
- Modify: `docs/ARENA_CURRICULUM_SYNC_V1.md`
- Modify: `docs/S3-V2-F1-CURRICOLO-MATERIALI.md`
- Do not modify infrastructure slug in: `next.config.ts`
- Do not rename package name in: `package.json`

**Interfaces:**
- Consumes: decisione prodotto canonico `Atlas`.
- Produces: documentazione/metadati attivi senza “Curriculum Atlas”, conservando slug infrastrutturali legacy.

- [ ] Add RED text assertions to `scripts/test-curricolo-domain-compat.mjs` for README/layout active product naming.
- [ ] Replace prose/title product naming with `Atlas`; qualify contract IDs as legacy v1 where present.
- [ ] Confirm `repositoryName = "Curriculum-Atlas"` and package `name: "curriculum-atlas"` remain unchanged as infrastructure legacy.
- [ ] Run `pnpm test:curricolo:compat && pnpm lint && pnpm typecheck`.
- [ ] Commit separately.

### Task 5: Guardrail locale Atlas

**Files:**
- Create: `scripts/validate-curricolo-vocabulary.mjs`
- Create: `config/curricolo-vocabulary-legacy.json`
- Modify: `package.json`
- Modify: `scripts/test-curricolo-domain-compat.mjs`

**Interfaces:**
- Consumes: allowlist per export/contract v1, repository/package slug e compatibility files.
- Produces: `pnpm validate:curricolo-vocabulary`.

- [ ] Write RED tests for forbidden new internal `Curriculum*`, allowed v1 literals and allowed infrastructure slug.
- [ ] Implement validator diff-aware/changed-file-aware.
- [ ] Add `validate:curricolo-vocabulary` script.
- [ ] Run `pnpm test:curricolo:compat && pnpm validate:curricolo-vocabulary`.
- [ ] Commit.

### Task 6: Exact-head qualification Atlas

**Files:** none unless test-only fixes are necessary.

- [ ] Run `pnpm validate:curricolo-vocabulary`.
- [ ] Run `pnpm test:curricolo:compat`.
- [ ] Run `node scripts/validate-provisional-curriculum-regression.mjs`.
- [ ] Run `pnpm typecheck && pnpm lint && pnpm build`.
- [ ] Run relevant Playwright/exit checks for `/curricolo`.
- [ ] Confirm `ARENA_ATLAS_CURRICULUM_EXPORT_V1` input is byte/semantic compatible.
- [ ] Open Draft PR and keep unmerged for Human Review.
