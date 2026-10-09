# TRAMA-TERM-01 Studio Atlas and Docente OS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verificare e rendere stabile l'uso del termine `curricolo` nei consumer Studio Atlas e Docente OS senza introdurre modifiche funzionali non necessarie.

**Architecture:** Studio Atlas, che vive nel repository TRAMA, viene corretto nei testi e protetto dal guardrail TRAMA. Docente OS viene prima riesaminato sull'exact head effettivamente corrente al momento dell'esecuzione; si modifica solo se emergono nuove occorrenze di dominio o adapter che richiedono isolamento legacy.

**Tech Stack:** Studio Atlas Next.js/TypeScript nel monorepo TRAMA; Docente OS secondo lo stack presente sull'exact head corrente; GitHub Actions esistenti.

**Spec:** `docs/superpowers/specs/2026-10-09-trama-term-01-curricolo-vocabulary-design.md`

## Global Constraints

- Nessuna modifica funzionale ai flussi Studio Atlas o Docente OS fuori dal lessico/boundary necessario.
- Gli identificatori legacy esterni possono essere letti solo in adapter espliciti.
- Non assumere che il `main` Docente OS rilevato durante l'audit iniziale sia ancora la baseline di lavoro: risolvere exact current head e PR attive prima di mutare.
- Nessun auto-merge.

## Review Focus

- Una stringa utente «curriculum» deve essere eliminata o motivata come citazione esterna.
- Un identificatore legacy ricevuto da Arena deve essere confinato al boundary e non propagato nel modello Docente OS.
- Il guardrail non deve bloccare riferimenti storici/URL necessari se allowlisted.
- Nessuna modifica terminologica deve cambiare forma dei dati o comportamento della UI.
- La verifica deve includere branch/PR attive rilevanti, non solo un main potenzialmente arretrato.

---

### Task 1: Studio Atlas — correggere il testo attivo

**Files:**
- Modify: `products/studio-atlas/README.md`
- Modify: eventuali file sotto `products/studio-atlas/src/` individuati dal guardrail TRAMA come nuove occorrenze non allowlisted.
- Test: `tests/test_curricolo_vocabulary_guardrail.py`

**Interfaces:**
- Consumes: guardrail TRAMA.
- Produces: Studio Atlas senza prose/label di dominio `curriculum`.

- [ ] **Step 1: Confirm RED against the active README occurrence**

Il test TRAMA deve identificare `Arena curriculum search` come occorrenza non canonica.

- [ ] **Step 2: Replace the active prose**

Usare `ricerca nel curricolo di Arena` o formulazione equivalente canonica; non toccare eventuali contract IDs legacy.

- [ ] **Step 3: Run GREEN**

Run: `pytest -q tests/test_curricolo_vocabulary_guardrail.py && python scripts/validate_curricolo_vocabulary.py`
Expected: PASS.

- [ ] **Step 4: Commit in the TRAMA branch**

Includere la modifica nello stesso ciclo governance TRAMA-TERM-01.

### Task 2: Docente OS — audit exact-head prima di qualsiasi modifica

**Files:**
- Read-only first: repository-wide code/docs/workflows on exact current target.
- Potential create only if needed: `scripts/validate-curricolo-vocabulary.*` following the repository's current runtime.
- Potential modify only if needed: current Product CI workflow/package scripts on the exact target.

**Interfaces:**
- Consumes: canonical TRAMA vocabulary.
- Produces: evidence `ZERO_NONCANONICAL_OCCURRENCES` or a bounded list of files to repair.

- [ ] **Step 1: Resolve current state**

Fetch current `main`, active product PRs relevant to the release line, exact head SHA and workflow status. Do not use the 2026-10-01 audit head as implementation baseline unless it is still current.

- [ ] **Step 2: Scan case-insensitive occurrences**

Search `curriculum`, `Curriculum`, `CURRICULUM` across code, docs, migrations, fixtures, workflow files and generated templates. Classify every hit as UI/prose, internal domain, external legacy identifier, historical evidence, or infrastructure.

- [ ] **Step 3: Choose no-op or bounded repair**

If there are no noncanonical occurrences, record no code change. If hits exist, repair only those files and add the smallest local guardrail compatible with current repo conventions.

- [ ] **Step 4: Verify existing gates**

Run the Product CI/typecheck/build/test commands defined by the exact current branch, not commands inferred from historical structure.

- [ ] **Step 5: Keep PR separate**

If mutation is required, open a dedicated Draft PR. If no mutation is required, attach audit evidence to TRAMA-TERM-01 instead of creating an empty PR.

### Task 3: Boundary compatibility verification

**Files:**
- TRAMA evidence only unless a consumer defect is discovered.
- Create later in coordinator task: `docs/evidence/trama-term-01-curricolo-vocabulary-evidence.md`.

**Interfaces:**
- Consumes: Arena v1 contract identifiers and Atlas/Docente OS consumers.
- Produces: explicit statement that legacy IDs are confined to boundaries.

- [ ] Verify Studio Atlas has no domain model that reintroduces `Curriculum*`.
- [ ] Verify Docente OS either has zero occurrences or only allowlisted boundary identifiers.
- [ ] Verify no user-visible UI/document template shows `Curriculum` for the institute curriculum concept.
- [ ] Record exact heads and scan results in the final evidence dossier.
