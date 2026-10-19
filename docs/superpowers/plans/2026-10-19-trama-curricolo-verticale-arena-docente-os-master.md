# TRAMA Curricolo Verticale Arena → Docente OS — Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendere il curricolo verticale di istituto governato da Arena una singola baseline adottabile e risolvibile operativamente in Docente OS per infanzia, primaria 1ª–5ª e secondaria di primo grado 1ª–3ª, senza copie per classe e senza bypass dell'autorità curricolare.

**Architecture:** TRAMA pubblica il contratto di scambio verticale; Arena emette una versione completa con manifest, segmenti, nodi e relazioni; Docente OS conserva una sola adozione corrente per workspace/anno e risolve dinamicamente il segmento pertinente dal ProfessionalContext del docente. Arena possiede anche il giudizio di completezza/planning-usability; Docente OS verifica il pacchetto e l'assegnazione ma non reinterpreta la completezza. Le superfici legacy ECO-01/ECO-02 e `annual_plan_curriculum_adoptions` restano compatibilità/storico, non fonte canonica del nuovo flusso.

**Tech Stack:** JSON Schema Draft 2020-12 + Python/jsonschema (TRAMA); TypeScript/Vitest/Dexie (Arena); Next.js 16/TypeScript/Supabase/PostgreSQL/Node test runner/Playwright (Docente OS).

**Spec:** `docs/superpowers/specs/2026-10-19-trama-curricolo-verticale-arena-docente-os-design.md`

## Global Constraints

- Arena resta l'unica autorità curricolare.
- Docente OS conserva una sola baseline verticale corrente per workspace/istituto e anno scolastico.
- Nessuna copia del curricolo per singola classe.
- Infanzia non richiede né riceve una classe numerica artificiale.
- L'intero curricolo è consultabile; l'operatività è limitata alle assegnazioni reali del docente.
- Una baseline `PROVISIONAL_COMPLETE` può essere usata per la programmazione ma non può essere promossa da Docente OS ad approvata.
- `APPROVED` in Docente OS richiede evidenza Arena verificata lato server sull'esatta versione/impronta; un file locale non basta.
- ECO-01 v1 resta immutabile; ECO-02/P1 viene mantenuto solo come compatibilità/migrazione.
- Nessuna scrittura cross-product automatica; l'adozione richiede conferma umana autenticata.
- Nessun dato studente, nessun tracking studente.
- Nessun merge automatico e nessun deploy di produzione.
- Ogni tranche usa TDD RED → GREEN → suite; nessun GREEN dichiarato senza il test specifico che prima fallisce.
- La promozione Beta, quando tecnicamente qualificata, richiede autorizzazione separata.
- Preparazioni ed esecuzioni storiche restano vincolate alla versione/segmento Arena effettivamente usati.

## Review Focus

- **Manifest incompleto o segmento non utilizzabile:** Arena non deve poter emettere `SATISFIED`; coperto nella Tranche A.
- **Infanzia:** nessun resolver o schema deve richiedere `yearLevel`; coperto nelle Tranche A, C e D.
- **Mismatch professionale:** un segmento valido ma non assegnato al docente deve restare consultabile e non operativo; coperto nella Tranche C.
- **Aggiornamento Arena:** una nuova versione non deve sovrascrivere silenziosamente quella adottata né riscrivere ricevute/lezioni storiche; coperto nelle Tranche B e D.
- **Autorità:** payload locali/provvisori non possono attestare `APPROVED_INSTITUTIONAL`; `APPROVED` richiede ricevuta privata verificata; coperto nelle Tranche A e B.

---

## Baseline congelate per l'avvio

- TRAMA: `main@f666239cfdb359ecf52342ed3502f4a60233ea45`; spec branch `spec/curricolo-verticale-istituto-arena-docente-os`.
- Arena: `main@189ebe9da05c737c37654a450adf46910888e25e`.
- Docente OS: `develop@4e769f2999404752abfc1e095aca83f705820099`.

Se una baseline cambia prima dell'esecuzione, fermarsi, confrontare il delta e riqualificare il piano prima di modificare codice.

## Dependency Graph

```text
T0 TRAMA contract
  ↓
A1 Arena release model + manifest
  ↓
A2 Arena productive exporter + golden fixtures
  ↓
B1 Docente OS intake validator + institute adoption persistence
  ↓
C1 Universal ProfessionalContext + schema migration
  ↓
D1 Resolver baseline → segment → assignment
  ↓
D2 Lesson/annual-plan integration + immutable receipt binding
  ↓
E1 ECO-02 migration + real Arena package
  ↓
E2 Product CI + DB replay + browser qualification
  ↓
E3 Beta authenticated Human Review, resumed at CONDUCI
```

No downstream task may begin from a merely proposed upstream interface: it must consume the committed exact-head artifact from the preceding tranche.

### Task 1: Freeze the ecosystem contract first

**Files:**
- Execute: `docs/superpowers/plans/2026-10-19-trama-curricolo-verticale-governance.md`

**Interfaces:**
- Produces: `TRAMA_CURRICOLO_VERTICALE_RELEASE_V1` JSON Schema, canonical valid/adversarial fixtures, authority and completeness rules.
- Consumes: approved design spec only.

- [ ] **Step 1: Run the governance plan through its contract tests**

Expected: schema test RED before the schema exists, then GREEN with valid full vertical fixture and fail-closed adversarial fixtures.

- [ ] **Step 2: Record the exact TRAMA contract commit SHA**

Expected: one reviewable contract tranche; no product/runtime mutation.

- [ ] **Step 3: Do not merge the contract until its Human Review is explicitly accepted**

### Task 2: Make Arena the productive sender of the full vertical version

**Files:**
- Execute: `docs/superpowers/plans/2026-10-19-trama-curricolo-verticale-arena.md`

**Interfaces:**
- Consumes: `TRAMA_CURRICOLO_VERTICALE_RELEASE_V1` exact contract.
- Produces: deterministic Arena release package containing version identity, manifest, segments, nodes, vertical links, provenance, authority state, downstream policy and structural fingerprint.

- [ ] **Step 1: Implement pure release construction and validation with TDD**

Expected: complete infanzia/primaria/secondaria fixture passes; missing expected segment, required segment not planning-usable and invalid authority fail.

- [ ] **Step 2: Bind the release builder to Arena's productive version/segment/node/link repositories**

Expected: no second legacy curricolo store and no reconstruction from UI labels.

- [ ] **Step 3: Prove deterministic output and legacy CML compatibility**

Expected: existing `CML_LOCAL_HANDOFF_V2` tests stay green; the vertical release is additive, not a rewrite of ECO-01/CML v1/v2.

- [ ] **Step 4: Record exact Arena head and artifact fingerprint**

### Task 3: Replace the Docente OS pilot intake with institute-level adoption

**Files:**
- Execute Tasks 1–3 of `docs/superpowers/plans/2026-10-19-trama-curricolo-verticale-docente-os.md`

**Interfaces:**
- Consumes: Arena full vertical release.
- Produces: one adopted institute baseline per workspace/year, append-only adoption receipt/history, candidate validation, no class copies.

- [ ] **Step 1: Add contract parser/validator before persistence**

Expected RED: valid full vertical package cannot yet be parsed/adopted.

- [ ] **Step 2: Add institute-level adoption schema/RPC with DB-enforced invariants**

Expected: wrong workspace/year/fingerprint/authority fails in SQL; exact replay is idempotent. `APPROVED` fails without an exact private verified Arena authority receipt; complete `PROVISIONAL_COMPLETE` remains usable without pretending approval.

- [ ] **Step 3: Keep `annual_plan_curriculum_adoptions` as legacy compatibility only**

Expected: no bulk fan-out of institute release into one row per class/discipline.

### Task 4: Generalize Docente OS ProfessionalContext without breaking the secondary-school product

**Files:**
- Execute Tasks 4–5 of `docs/superpowers/plans/2026-10-19-trama-curricolo-verticale-docente-os.md`

**Interfaces:**
- Produces: universal `schoolOrder + yearLevel? + section/cohort + teachingDomain + assignment` context and compatibility projection to current `AnnualPlanGrade` where valid.

- [ ] **Step 1: Migrate existing sections to explicit school order/year level**

Expected: every existing PRIMA/SECONDA/TERZA row maps losslessly to SECONDARIA_I_GRADO 1/2/3.

- [ ] **Step 2: Add primary and infancy cases with no fake legacy grade**

Expected: primary accepts 1–5; secondary 1–3; infancy requires `yearLevel = null`.

- [ ] **Step 3: Generalize teaching domains while preserving current discipline assignments**

Expected: existing Technology timetable and assignments remain unchanged; fields of experience can be represented without claiming they are disciplines in the new domain API.

### Task 5: Resolve one adopted vertical baseline into the operational slice and immutable lesson history

**Files:**
- Execute Tasks 6–7 of the Docente OS plan.

**Interfaces:**
- Consumes: institute adoption + universal ProfessionalContext.
- Produces: `resolveCurricoloOperativo(...)`, preparation receipt schema v2 with exact adoption/version/segment identity, and TeachingSession link to the immutable preparation receipt.

- [ ] **Step 1: RED on the real structural gap**

The 3ª E/B01 ProfessionalContext with a valid adopted Arena third-year Technology segment must currently return `NOT_PRESENT`; preserve this as the first RED.

- [ ] **Step 2: Implement resolver matching order, scope, domain, year/cohort and assignment**

Expected: correct segment resolves; adjacent grade/order/domain mismatches fail closed.

- [ ] **Step 3: Wire lesson-preparation approval to the new resolver**

Expected: `Curricolo da rivalidare` disappears only when the adopted segment and manifest are valid under the existing fail-closed lifecycle.

- [ ] **Step 4: Persist exact historical identity**

Expected: preparation receipt v2 stores adoption/version/fingerprint/segment; task-centric TeachingSession points to that append-only receipt. A later Arena adoption cannot change the version/segment referenced by an already registered lesson.

### Task 6: Migrate ECO-02 and materialize the real institute release

**Files:**
- Docente OS compatibility task from repo plan.
- Arena export fixture/artifact from repo plan.

**Interfaces:**
- Consumes: old 2C adoption receipt and new institute release.
- Produces: compatibility evidence; no lost receipts.

- [ ] **Step 1: Prove old 2C receipt remains readable before migration**

- [ ] **Step 2: Adopt the institute package through the new human-controlled path**

- [ ] **Step 3: Mark old ECO-02 scope as deprecated compatibility, not delete it**

- [ ] **Step 4: Verify 2C and 3ª E resolve from the same institute baseline**

### Task 7: Exact-head qualification and Beta Human Review

**Files:**
- Existing CI/CV2/browser workflows in each repo; no new runtime feature unless a proven gate defect requires it.

**Interfaces:**
- Produces: engineering qualification and separate Human Review verdict.

- [ ] **Step 1: Arena full suite**

Run: `npm test`
Expected: PASS, plus focused vertical-release tests.

- [ ] **Step 2: Docente OS focused tests, typecheck, product suite and build**

Run from `product/`:
`npx tsx --test <new focused test files>`
`npm run typecheck`
`npm test`
`npm run build`
Expected: PASS.

- [ ] **Step 3: Supabase migration replay from clean baseline**

Expected: all migrations through `0106` (or revalidated replacement numbers) replay successfully; idempotent operations stay idempotent.

- [ ] **Step 4: Browser qualification across the three school orders**

Required cases:
- infancy context without numeric year;
- primary year 1 and year 5 boundary;
- secondary year 1 and year 3 boundary;
- wrong assignment fail-closed;
- new Arena version surfaces `UPDATE_AVAILABLE` instead of silent replacement.

- [ ] **Step 5: Promote to Beta only with separate explicit authorization**

No production deploy.

- [ ] **Step 6: Resume the existing authenticated Human Review directly at 3ª E/B01 `CONDUCI`**

Required journey: `CONDUCI → OSSERVA → REGISTRA → CONTINUA`.
Do not repeat OGGI→VISUALIZZA unless regression evidence requires it.

- [ ] **Step 7: Record separate verdicts**

`ENGINEERING QUALIFIED` and `HUMAN REVIEW PASS/REWORK` remain distinct.

## Completion Rule

The program is complete only when:

1. one Arena institute version is adopted once in Docente OS;
2. its manifest covers infanzia, primary 1–5 and lower-secondary 1–3 according to Arena's own declared institutional perimeter and planning-usability rules;
3. no class-level copy of the full baseline is generated;
4. the same resolver serves all orders;
5. current secondary workflows remain regression-green;
6. historical preparation/execution receipts remain pinned to the Arena adoption/version/segment actually used;
7. the 3ª E/B01 Beta Human Review completes through CONTINUA without bypass;
8. no production deployment has occurred without a separate authorization.
