# TRAMA-TERM-01 Arena Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portare il dominio interno di Arena da `Curriculum*` a `Curricolo*` mantenendo compatibilità piena con contratti e persistenza legacy v1.

**Architecture:** Il primo passo introduce tipi canonici e adapter senza cambiare la semantica dei payload. La persistenza viene poi esposta tramite nomi canonici additivi, mantenendo tabelle/RPC legacy operative; la rimozione del legacy non appartiene a questo piano.

**Tech Stack:** TypeScript 5, React 18, Vitest 4, Supabase/PostgreSQL, Vite.

**Spec:** `docs/superpowers/specs/2026-10-09-trama-term-01-curricolo-vocabulary-design.md`

## Global Constraints

- Non modificare in place `CurriculumSnapshot v1`, `CML_CURRICULUM_RELEASE_CONTRACT_V1`, `CML_CURRICULUM_CONTEXT_V1`.
- Nessuna cancellazione o rename distruttivo di `shared_curriculum_*`, `curriculum_unit_key` o `publish_curriculum_review_case_v1`.
- Nuovo dominio interno usa `Curricolo*`/`curricolo*`.
- Ogni adapter legacy deve essere esplicito e testato.
- Nessun auto-merge.

## Review Focus

- Alias canonici e legacy devono rappresentare la stessa shape, senza divergenza strutturale.
- Serializzazione verso la RPC legacy deve continuare a usare `curriculum_unit_key` finché il DB legacy è consumer.
- Hydration di una review case legacy deve produrre il nuovo modello `CurricoloReviewCase` senza perdere dati.
- Una migration additiva deve poter essere applicata due volte senza distruzione o collisione.
- Le viste/RPC canoniche non devono introdurre nuova authority o modificare RLS.

---

### Task 1: Introduzione dei tipi canonici

**Files:**
- Create: `src/types/curricolo.ts`
- Modify: `src/types/curriculum.ts`
- Create: `src/__tests__/curricolo-vocabulary-compat.test.ts`

**Interfaces:**
- Consumes: shape esistenti in `src/types/curriculum.ts`.
- Produces: `CurricoloUnitReference`, `CurricoloReviewCase`, `CurricoloWorkSessionStage`, `CurricoloReviewCaseReadiness` e alias legacy deprecati.

- [ ] **Step 1: Write failing type-compat tests**

Creare test/source assertions che importino i nuovi simboli da `src/types/curricolo.ts` e provino assegnabilità bidirezionale con le shape legacy per `CurriculumUnitReference` e `CurriculumReviewCase`.

- [ ] **Step 2: Run RED**

Run: `npm run test:unit -- src/__tests__/curricolo-vocabulary-compat.test.ts`
Expected: FAIL perché `src/types/curricolo.ts` non esiste.

- [ ] **Step 3: Implement canonical types and legacy aliases**

Spostare la definizione canonica nel nuovo modulo; mantenere `src/types/curriculum.ts` come compatibility surface con re-export/alias `@deprecated` verso i nomi canonici. Non cambiare literal string v1 che sono parte di payload esterni.

- [ ] **Step 4: Run GREEN**

Run: `npm run test:unit -- src/__tests__/curricolo-vocabulary-compat.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add src/types/curricolo.ts src/types/curriculum.ts src/__tests__/curricolo-vocabulary-compat.test.ts && git commit -m "TRAMA-TERM-01: introduce canonical Arena curricolo types"`

### Task 2: Migrazione del dominio shared review al lessico canonico

**Files:**
- Modify: `src/domain/curriculum/sharedReviewCase.ts`
- Modify: `src/features/beta/SharedReviewCaseInbox.tsx`
- Modify: `src/__tests__/shared-review-case-discovery.test.ts`
- Modify: `src/__tests__/curriculum-review-case.test.ts`
- Modify: `src/__tests__/curricolo-vocabulary-compat.test.ts`

**Interfaces:**
- Consumes: tipi canonici Task 1.
- Produces: API TypeScript interne che usano `CurricoloReviewCase` mantenendo row/payload SQL legacy invariati.

- [ ] **Step 1: Write RED assertions**

Aggiungere test che richiedano import canonici nel dominio applicativo e che verifichino `curriculum_unit_key` ancora presente nella row SQL legacy.

- [ ] **Step 2: Run RED**

Run: `npm run test:unit -- src/__tests__/curricolo-vocabulary-compat.test.ts src/__tests__/shared-review-case-discovery.test.ts src/__tests__/curriculum-review-case.test.ts`
Expected: FAIL sulle import legacy ancora usate internamente.

- [ ] **Step 3: Migrate internal TypeScript names**

Sostituire tipi/variabili di dominio applicativo con `Curricolo*`; lasciare intatti nomi di proprietà che rappresentano direttamente la row SQL legacy. Se serve, introdurre funzioni esplicite `fromLegacyCurriculumReviewRow(...) -> CurricoloReviewCase` e `toLegacyCurriculumReviewPayload(...)` nel file `sharedReviewCase.ts`.

- [ ] **Step 4: Run GREEN and build**

Run: `npm run test:unit -- src/__tests__/curricolo-vocabulary-compat.test.ts src/__tests__/shared-review-case-discovery.test.ts src/__tests__/curriculum-review-case.test.ts && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add src/domain/curriculum/sharedReviewCase.ts src/features/beta/SharedReviewCaseInbox.tsx src/__tests__ && git commit -m "TRAMA-TERM-01: migrate Arena review domain to curricolo names"`

### Task 3: Guardrail locale Arena

**Files:**
- Create: `scripts/validate-curricolo-vocabulary.mjs`
- Create: `src/__tests__/curricolo-vocabulary-guardrail.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: allowlist locale contenuta nello script o file dedicato `config/curricolo-vocabulary-legacy.json`.
- Produces: `npm run validate:curricolo-vocabulary` che blocca nuove occorrenze non autorizzate.

- [ ] **Step 1: Write RED tests**

Il test deve provare almeno: nuova `CurriculumFoo` in file dominio → reject; stringa `CML_CURRICULUM_RELEASE_CONTRACT_V1` in contract adapter → allow; `curriculum_unit_key` nel legacy DB adapter → allow; nuova label UI «Curriculum» → reject.

- [ ] **Step 2: Run RED**

Run: `npm run test:unit -- src/__tests__/curricolo-vocabulary-guardrail.test.ts`
Expected: FAIL perché lo script manca.

- [ ] **Step 3: Implement validator and package script**

Aggiungere `"validate:curricolo-vocabulary": "node scripts/validate-curricolo-vocabulary.mjs"` e allowlist stretta per contratti v1, migration storiche e adapter DB legacy.

- [ ] **Step 4: Run GREEN**

Run: `npm run test:unit -- src/__tests__/curricolo-vocabulary-guardrail.test.ts && npm run validate:curricolo-vocabulary`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add scripts/validate-curricolo-vocabulary.mjs src/__tests__/curricolo-vocabulary-guardrail.test.ts package.json && git commit -m "TRAMA-TERM-01: prevent new Arena curriculum terminology"`

### Task 4: Persistenza canonica additiva

**Files:**
- Create: `supabase/migrations/20261009070000_curricolo_review_case_compatibility.sql`
- Modify: `src/domain/curriculum/sharedReviewCase.ts`
- Modify: `src/__tests__/shared-review-case-discovery.test.ts`
- Create: `src/__tests__/curricolo-persistence-compat.test.ts`

**Interfaces:**
- Consumes: tabelle `public.shared_curriculum_review_cases`, `public.shared_curriculum_review_case_assignments` e RPC `public.publish_curriculum_review_case_v1`.
- Produces: viste canoniche `public.shared_curricolo_review_cases`, `public.shared_curricolo_review_case_assignments`; wrapper RPC canonica `public.publish_curricolo_review_case_v1` che delega alla legacy senza cambiare authority/RLS.

- [ ] **Step 1: Write RED migration assertions**

Il test deve leggere la migration e verificare che crei solo view/function additive, non contenga `drop table`, `drop function`, `alter table ... rename`, e che il wrapper deleghi a `publish_curriculum_review_case_v1`.

- [ ] **Step 2: Run RED**

Run: `npm run test:unit -- src/__tests__/curricolo-persistence-compat.test.ts`
Expected: FAIL perché la migration manca.

- [ ] **Step 3: Implement additive SQL compatibility**

Creare le due view e la wrapper RPC con stessa semantica, stessi controlli di sicurezza indiretti e nessuna modifica alle policy legacy. Documentare in commento SQL che la superficie legacy resta source of persistence nella fase TERM-01.

- [ ] **Step 4: Migrate repository call site to canonical RPC name**

Nel boundary applicativo usare `publish_curricolo_review_case_v1`; mantenere fallback esplicito al legacy solo se necessario per ambienti non migrati, testandolo.

- [ ] **Step 5: Run GREEN + shared review suite**

Run: `npm run test:unit -- src/__tests__/curricolo-persistence-compat.test.ts src/__tests__/shared-review-case-discovery.test.ts && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

`git add supabase/migrations/20261009070000_curricolo_review_case_compatibility.sql src/domain/curriculum/sharedReviewCase.ts src/__tests__ && git commit -m "TRAMA-TERM-01: add non-destructive curricolo persistence surface"`

### Task 5: Contratti v1 e documentazione Arena

**Files:**
- Modify: `docs/05_react_architecture/02_curriculum.md`
- Modify: `docs/architecture/ECO01_S1_CURRICULUM_SNAPSHOT_V1.md`
- Modify: `docs/architecture/ARENA_ATLAS_CURRICULUM_SYNC_V1.md`
- Modify: `README.md`
- Do not modify semantics of: `docs/contracts/CURRICULUM_SNAPSHOT_V1.schema.json`

**Interfaces:**
- Consumes: contratti legacy immutabili.
- Produces: documentazione che li qualifica esplicitamente come legacy v1 e usa «curricolo» nella prosa attiva.

- [ ] Add tests/assertions that the v1 schema hash/content is unchanged relative to base.
- [ ] Replace prose terminology only; retain literal IDs, filenames and historical identifiers.
- [ ] Run `npm run validate:curricolo-vocabulary && npm run test:unit && npm run build`.
- [ ] Commit documentation separately.

### Task 6: Exact-head qualification Arena

**Files:** none unless test-only corrections are needed.

- [ ] Run `npm run validate:curricolo-vocabulary`.
- [ ] Run `npm run test:unit`.
- [ ] Run `npm run build`.
- [ ] Run workflows `human-interaction-model.yml` and `shared-review-smoke.yml` on exact head.
- [ ] Confirm no legacy DB table/RPC was removed or renamed.
- [ ] Open PR(s) as Draft and keep unmerged for Human Review.
