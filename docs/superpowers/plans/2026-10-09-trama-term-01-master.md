# TRAMA-TERM-01 Curricolo Vocabulary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendere «curricolo / curricolo di istituto» il vocabolario permanente dell'ecosistema TRAMA senza rompere contratti v1, persistenza o consumer esistenti.

**Architecture:** La migrazione è additiva e ordinata: prima governance e guardrail, poi dominio Arena, compatibilità della persistenza, dominio Atlas e infine verifica dei consumer Studio Atlas/Docente OS. Ogni repository usa una PR separata; nessun identificatore v1 pubblicato viene rinominato in place.

**Tech Stack:** Python 3 / pytest per i guardrail TRAMA; TypeScript/React/Vitest/Supabase SQL in Arena; Next.js/TypeScript/Node/Playwright in Atlas; workflow GitHub Actions esistenti.

**Spec:** `docs/superpowers/specs/2026-10-09-trama-term-01-curricolo-vocabulary-design.md`

## Global Constraints

- «curricolo di istituto» è il concetto canonico permanente.
- `curriculum` è ammesso solo come legacy compatibility surface o citazione esterna motivata.
- `CurriculumSnapshot v1`, `CML_CURRICULUM_RELEASE_CONTRACT_V1`, `CML_CURRICULUM_CONTEXT_V1` e `ARENA_ATLAS_CURRICULUM_EXPORT_V1` restano immutati.
- Nessuna rinomina distruttiva di tabelle, RPC o payload persistiti nella prima migrazione.
- Il nome prodotto canonico è `Atlas`; la rinomina fisica del repository `Curriculum-Atlas` è differita.
- Nessun auto-merge; ogni PR resta soggetta a Human Review.
- TDD RED → GREEN → suite completa per ogni task implementativo.

## Review Focus

- Un file nuovo che introduce `curriculum` fuori allowlist deve far fallire il guardrail.
- Un identificatore v1 legacy deve continuare a essere accettato e validato senza essere riscritto.
- Un consumer Arena che passa ai tipi `Curricolo*` deve produrre lo stesso payload legacy verso DB/contratti v1.
- Atlas deve usare il modello interno `Curricolo*` continuando a consumare `ARENA_ATLAS_CURRICULUM_EXPORT_V1` invariato.
- Docente OS e Studio Atlas devono restare privi di nuove occorrenze di dominio `curriculum` pur continuando a leggere eventuali payload legacy.

---

### Task 1: TRAMA governance e guardrail

**Files:**
- Implementare secondo `docs/superpowers/plans/2026-10-09-trama-term-01-trama-governance.md`.

**Interfaces:**
- Consumes: specifica TRAMA-TERM-01.
- Produces: vocabolario machine-readable, validator `scripts/validate_curricolo_vocabulary.py`, gate Governance e allowlist legacy.

- [ ] Eseguire integralmente il piano TRAMA governance con RED → GREEN → suite.
- [ ] Aprire/aggiornare la PR TRAMA-TERM-01 senza merge.
- [ ] Verificare Governance PASS sull'exact head.

### Task 2: Arena dominio applicativo

**Files:**
- Implementare la sezione dominio di `docs/superpowers/plans/2026-10-09-trama-term-01-arena.md`.

**Interfaces:**
- Consumes: vocabolario/allowlist TRAMA e contratti v1 immutati.
- Produces: tipi e API interne `Curricolo*` con compatibilità legacy.

- [ ] Creare branch Arena dedicato dall'exact `main` verificato al momento dell'esecuzione.
- [ ] Eseguire i test RED sui nomi canonici e sulla compatibilità.
- [ ] Migrare i consumer interni senza modificare i payload v1.
- [ ] Eseguire `npm run test:unit` e `npm run build`.
- [ ] Aprire PR Arena separata, senza merge.

### Task 3: Arena persistenza compatibile

**Files:**
- Implementare la sezione persistenza di `docs/superpowers/plans/2026-10-09-trama-term-01-arena.md`.

**Interfaces:**
- Consumes: modello canonico Arena del Task 2.
- Produces: adapter/view/RPC canonici additivi verso superfici SQL legacy.

- [ ] Scrivere test di compatibilità SQL/repository prima della migration.
- [ ] Introdurre superfici `curricolo_*` additive senza eliminare `curriculum_*`.
- [ ] Migrare il repository applicativo al nome canonico mantenendo round-trip equivalente.
- [ ] Verificare smoke test shared-review e suite Arena.
- [ ] Mantenere la rimozione del legacy fuori scope.

### Task 4: Atlas dominio interno e adapter

**Files:**
- Implementare `docs/superpowers/plans/2026-10-09-trama-term-01-atlas.md`.

**Interfaces:**
- Consumes: export Arena v1 legacy invariato.
- Produces: dominio interno `Curricolo*`, UI già `/curricolo`, naming prodotto `Atlas`.

- [ ] Scrivere il test RED del boundary legacy-v1 → modello canonico.
- [ ] Introdurre package interno `src/features/curricolo/` e compatibility re-export temporanei.
- [ ] Migrare pagine/componenti al nuovo dominio interno.
- [ ] Aggiornare naming prodotto attivo a `Atlas` senza rinominare repository/package infrastrutturale.
- [ ] Eseguire `pnpm typecheck`, `pnpm lint`, `pnpm build` e test di regressione curricolo.
- [ ] Aprire PR Atlas separata, senza merge.

### Task 5: Studio Atlas e Docente OS

**Files:**
- Implementare `docs/superpowers/plans/2026-10-09-trama-term-01-consumers.md`.

**Interfaces:**
- Consumes: vocabolario TRAMA e boundary Arena/Atlas compatibili.
- Produces: zero nuove occorrenze non autorizzate nei consumer operativi.

- [ ] Correggere i riferimenti attivi di Studio Atlas (`Arena curriculum search` → `ricerca nel curricolo di Arena`).
- [ ] Rieseguire la scansione Docente OS sull'exact main/branch e aggiungere guardrail locale se necessario.
- [ ] Verificare che eventuali identificatori legacy siano confinati agli adapter.
- [ ] Eseguire i gate esistenti dei due prodotti.

### Task 6: Verifica cross-ecosystem e chiusura

**Files:**
- Modify: `docs/superpowers/specs/2026-10-09-trama-term-01-curricolo-vocabulary-design.md` solo per stato/evidenze, senza cambiare la decisione.
- Create: `docs/evidence/trama-term-01-curricolo-vocabulary-evidence.md`.

**Interfaces:**
- Consumes: exact head e risultati CI delle PR TRAMA/Arena/Atlas/consumer.
- Produces: dossier finale di evidenza e lista legacy residua intenzionale.

- [ ] Registrare exact head di ogni PR e i gate PASS.
- [ ] Rieseguire una ricerca case-insensitive di `curriculum` in tutti i repository e classificare ogni residuo: contratto v1, infrastruttura legacy, citazione storica o difetto.
- [ ] Far fallire la chiusura se esiste un residuo non classificato.
- [ ] Documentare esplicitamente che `CurricoloSnapshot v2` e la rinomina del repository Atlas restano differiti.
- [ ] Richiedere Human Review finale prima di qualsiasi merge.
