# TRAMA-TERM-01 Arena Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portare l'intero dominio attivo di Arena da `Curriculum*` a `Curricolo*`, mantenendo compatibilità piena con contratti e persistenza legacy v1.

**Architecture:** La migrazione parte da un inventario verificabile delle superfici legacy, introduce tipi canonici, migra store/pagine/workspace/componenti e infine isola persistenza e contratti v1 dietro adapter espliciti. Le superfici legacy restano temporaneamente come re-export, viste o wrapper; la loro rimozione non appartiene a TERM-01.

**Tech Stack:** TypeScript 5, React 18, Zustand, Vitest 4, Supabase/PostgreSQL, Vite.

**Spec:** `docs/superpowers/specs/2026-10-09-trama-term-01-curricolo-vocabulary-design.md`

## Global Constraints

- Non modificare in place `CurriculumSnapshot v1`, `CML_CURRICULUM_RELEASE_CONTRACT_V1`, `CML_CURRICULUM_CONTEXT_V1`.
- Nessuna cancellazione o rename distruttivo di tabelle/RPC/campi `curriculum_*` nella prima migrazione.
- Nuovo dominio interno usa `Curricolo*`/`curricolo*`.
- Ogni adapter legacy deve essere esplicito e testato.
- Non confondere Indicazioni nazionali/quadro nazionale con curricolo di istituto.
- Nessun auto-merge.

## Review Focus

- Le due superfici store esistenti (`src/stores/useCurriculumStore.ts` e `src/store/useCurriculumStore.ts`) devono essere classificate prima di rinominare, evitando di creare una terza fonte di stato.
- Alias canonici e legacy devono rappresentare la stessa shape, senza divergenza strutturale.
- Serializzazione verso RPC/DB legacy deve continuare a usare i field v1 esatti finché quei consumer esistono.
- Hydration di dati legacy deve produrre il nuovo modello `Curricolo*` senza perdita di dati o authority.
- Le viste/RPC canoniche additive non devono alterare RLS, ruoli, authority o idempotenza.

---

### Task 1: Inventario completo delle superfici legacy Arena

**Files:**
- Create: `docs/architecture/ARENA_TERM_01_CURRICOLO_INVENTORY.md`
- Create: `src/__tests__/curricolo-vocabulary-inventory.test.ts`

**Interfaces:**
- Consumes: repository exact head risolto all'avvio dell'esecuzione.
- Produces: inventario classificato `UI_PROSE`, `DOMAIN_TYPE`, `MODULE_PATH`, `STORE`, `CONTRACT_V1`, `DB_LEGACY`, `HISTORICAL_DOC`, `EXTERNAL_SOURCE`.

- [ ] **Step 1: Write the failing inventory test**

Il test deve leggere l'inventario e richiedere almeno le superfici note: `src/types/curriculum.ts`, `src/pages/CurriculumPage.tsx`, `src/features/curriculum/CurriculumWorkspace.tsx`, `src/features/curriculum/components/CurriculumTab.tsx`, `src/features/curriculum/index.ts`, `src/store/useCurriculumStore.ts`, `src/stores/useCurriculumStore.ts`, `src/domain/curriculum/sharedReviewCase.ts`, `docs/contracts/CURRICULUM_SNAPSHOT_V1.schema.json`, `supabase/migrations/20260907064000_shared_curriculum_review_case_discovery.sql`.

- [ ] **Step 2: Run RED**

Run: `npm run test:unit -- src/__tests__/curricolo-vocabulary-inventory.test.ts`
Expected: FAIL perché l'inventario non esiste.

- [ ] **Step 3: Build the exact-head inventory**

Eseguire ricerca case-insensitive su codice, docs, migration, fixture e workflow; registrare ogni cluster con owner, categoria, strategia (`MIGRATE`, `ADAPT`, `ALLOW_LEGACY`, `HISTORICAL_ONLY`) e test owner. Per i due store omonimi, documentare quale è canonical runtime e quale è compatibility/legacy prima di qualsiasi rename.

- [ ] **Step 4: Run GREEN**

Run: `npm run test:unit -- src/__tests__/curricolo-vocabulary-inventory.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add docs/architecture/ARENA_TERM_01_CURRICOLO_INVENTORY.md src/__tests__/curricolo-vocabulary-inventory.test.ts && git commit -m "TRAMA-TERM-01: inventory Arena curriculum legacy surfaces"`

### Task 2: Introduzione dei tipi canonici

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

Spostare la definizione canonica nel nuovo modulo; mantenere `src/types/curriculum.ts` come compatibility surface con re-export/alias `@deprecated`. Non cambiare literal string v1 che fanno parte di payload esterni.

- [ ] **Step 4: Run GREEN**

Run: `npm run test:unit -- src/__tests__/curricolo-vocabulary-compat.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add src/types/curricolo.ts src/types/curriculum.ts src/__tests__/curricolo-vocabulary-compat.test.ts && git commit -m "TRAMA-TERM-01: introduce canonical Arena curricolo types"`

### Task 3: Migrazione store e stato applicativo

**Files:**
- Create: `src/store/useCurricoloStore.ts` oppure `src/stores/useCurricoloStore.ts` ESCLUSIVAMENTE nel ramo che l'inventario Task 1 identifica come canonical runtime.
- Modify: corrispondente `useCurriculumStore.ts` legacy come re-export/adapter.
- Modify: `src/stores/index.ts` se è il barrel canonical.
- Modify: `src/hooks/useAutoSave.ts`
- Modify: `src/lib/disciplineLabels.ts`
- Modify: `src/__tests__/curricolo-vocabulary-compat.test.ts`

**Interfaces:**
- Consumes: store runtime identificato dal Task 1.
- Produces: `useCurricoloStore`, `CurricoloState`; alias `useCurriculumStore` solo compatibility.

- [ ] **Step 1: Write RED store-boundary tests**

Il test deve dimostrare che il canonical barrel esporta `useCurricoloStore`, che il legacy alias punta allo stesso store e che persistence key/state shape non cambiano.

- [ ] **Step 2: Run RED**

Run: `npm run test:unit -- src/__tests__/curricolo-vocabulary-compat.test.ts`
Expected: FAIL sul nuovo store symbol.

- [ ] **Step 3: Implement one canonical store only**

Rinominare semanticamente il solo store runtime; non duplicare Zustand state. Conservare persistence key legacy se cambiarla causerebbe perdita dei dati locali, annotandola come legacy storage identifier.

- [ ] **Step 4: Migrate direct consumers**

Aggiornare `src/hooks/useAutoSave.ts`, `src/lib/disciplineLabels.ts` e i consumer censiti nell'inventario al simbolo canonico.

- [ ] **Step 5: Run GREEN + build**

Run: `npm run test:unit -- src/__tests__/curricolo-vocabulary-compat.test.ts && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit separato con store, barrel e consumer migrati.

### Task 4: Migrazione pagina, workspace e componenti curricolari

**Files:**
- Create: `src/pages/CurricoloPage.tsx`
- Modify: `src/pages/CurriculumPage.tsx` come compatibility re-export temporaneo se ancora importato.
- Create: `src/features/curricolo/CurricoloWorkspace.tsx`
- Create: `src/features/curricolo/components/CurricoloTab.tsx`
- Create: `src/features/curricolo/index.ts`
- Create: `src/features/curricolo/components/index.ts`
- Modify: `src/features/curriculum/CurriculumWorkspace.tsx`, `src/features/curriculum/components/CurriculumTab.tsx`, `src/features/curriculum/index.ts`, `src/features/curriculum/components/index.ts` come compatibility boundary finché esistono consumer legacy.
- Modify: `src/features/session/components/AppViewsLayer.tsx`
- Create: `src/__tests__/curricolo-module-boundary.test.ts`

**Interfaces:**
- Consumes: tipi/store canonici Tasks 2-3.
- Produces: entry points `CurricoloPage`, `CurricoloWorkspace`, `CurricoloTab`; route/navigation values utente già `curricolo` restano invariati.

- [ ] **Step 1: Write RED module-boundary tests**

Verificare che gli entry point canonici esistano, che `AppViewsLayer` importi dal package `features/curricolo`, che i vecchi moduli re-esportino senza duplicare implementazione e che label UI restino «Curricolo».

- [ ] **Step 2: Run RED**

Run: `npm run test:unit -- src/__tests__/curricolo-module-boundary.test.ts`
Expected: FAIL sui nuovi entry point mancanti.

- [ ] **Step 3: Move implementation behind canonical paths**

Creare i file canonici e ridurre i file legacy a re-export/compatibility. Non cambiare comportamento, route, state machine o dati.

- [ ] **Step 4: Migrate all active imports from inventory**

Aggiornare ogni consumer `MIGRATE` censito al Task 1. Il test deve fallire se un file attivo non allowlisted importa ancora `features/curriculum` o `CurriculumTab/Page/Workspace`.

- [ ] **Step 5: Run GREEN + relevant UI tests**

Run: `npm run test:unit -- src/__tests__/curricolo-module-boundary.test.ts && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit separato per il modulo UI/workspace.

### Task 5: Migrazione del dominio shared review al lessico canonico

**Files:**
- Modify: `src/domain/curriculum/sharedReviewCase.ts` oppure creare canonical path `src/domain/curricolo/sharedReviewCase.ts` secondo inventario, lasciando re-export legacy.
- Modify: `src/features/beta/SharedReviewCaseInbox.tsx`
- Modify: `src/__tests__/shared-review-case-discovery.test.ts`
- Modify: `src/__tests__/curriculum-review-case.test.ts`
- Modify: `src/__tests__/curricolo-vocabulary-compat.test.ts`

**Interfaces:**
- Consumes: tipi canonici Task 2.
- Produces: API interne `CurricoloReviewCase` mantenendo row/payload SQL legacy invariati.

- [ ] Write RED assertions for canonical imports and unchanged legacy SQL row fields.
- [ ] Migrate internal TypeScript names; introduce explicit `fromLegacyCurriculumReviewRow(...) -> CurricoloReviewCase` / `toLegacyCurriculumReviewPayload(...)` only at the boundary.
- [ ] Run focused tests and `npm run build`.
- [ ] Commit.

### Task 6: Guardrail locale Arena

**Files:**
- Create: `config/curricolo-vocabulary-legacy.json`
- Create: `scripts/validate-curricolo-vocabulary.mjs`
- Create: `src/__tests__/curricolo-vocabulary-guardrail.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: inventory Task 1.
- Produces: `npm run validate:curricolo-vocabulary` che blocca nuove occorrenze non autorizzate.

- [ ] Write RED tests: nuovo `CurriculumFoo` in file dominio → reject; v1 contract ID → allow; `curriculum_unit_key` nel DB adapter → allow; nuova label UI «Curriculum» → reject; nuova allowlist senza reason → reject.
- [ ] Implement validator changed-file/diff-aware e package script.
- [ ] Run `npm run test:unit -- src/__tests__/curricolo-vocabulary-guardrail.test.ts && npm run validate:curricolo-vocabulary`.
- [ ] Commit.

### Task 7: Persistenza canonica additiva

**Files:**
- Create: `supabase/migrations/20261009070000_curricolo_review_case_compatibility.sql`
- Modify: canonical/legacy `sharedReviewCase` boundary dal Task 5.
- Modify: `src/__tests__/shared-review-case-discovery.test.ts`
- Create: `src/__tests__/curricolo-persistence-compat.test.ts`

**Interfaces:**
- Consumes: `public.shared_curriculum_review_cases`, `public.shared_curriculum_review_case_assignments`, `public.publish_curriculum_review_case_v1`.
- Produces: viste canoniche `public.shared_curricolo_review_cases`, `public.shared_curricolo_review_case_assignments`; wrapper `public.publish_curricolo_review_case_v1` che delega al legacy.

- [ ] Write RED migration assertions: additive only, no `DROP`, no rename distruttivo, delegation to legacy v1, no RLS/authority expansion.
- [ ] Implement views/wrapper idempotenti.
- [ ] Migrate application boundary to canonical RPC name with tested fallback only if deployment ordering requires it.
- [ ] Run persistence/shared-review tests and build.
- [ ] Commit.

### Task 8: Contratti v1 e documentazione Arena

**Files:**
- Modify: `docs/05_react_architecture/02_curriculum.md`
- Modify: `docs/architecture/ECO01_S1_CURRICULUM_SNAPSHOT_V1.md`
- Modify: `docs/architecture/ARENA_ATLAS_CURRICULUM_SYNC_V1.md`
- Modify: `README.md`
- Do not modify semantics of: `docs/contracts/CURRICULUM_SNAPSHOT_V1.schema.json`

**Interfaces:**
- Consumes: contratti legacy immutabili.
- Produces: prosa attiva canonica e identificatori legacy qualificati.

- [ ] Add assertion/hash check that v1 schema semantics/content remain unchanged relative to base.
- [ ] Replace prose terminology only; retain literal IDs, filenames and historical identifiers.
- [ ] Update inventory status for migrated vs allowlisted surfaces.
- [ ] Run guardrail, unit suite and build.
- [ ] Commit.

### Task 9: Exact-head qualification Arena

**Files:** none unless test-only corrections are needed.

- [ ] Run `npm run validate:curricolo-vocabulary`.
- [ ] Run `npm run test:unit`.
- [ ] Run `npm run build`.
- [ ] Run workflows `human-interaction-model.yml` and `shared-review-smoke.yml` on exact head.
- [ ] Re-run full inventory scan: every remaining `curriculum` occurrence must be `ALLOW_LEGACY`, `HISTORICAL_ONLY` or external citation; zero unclassified hits.
- [ ] Confirm no legacy DB table/RPC or v1 contract was removed/renamed.
- [ ] Open Draft PR(s) and keep unmerged for Human Review.
