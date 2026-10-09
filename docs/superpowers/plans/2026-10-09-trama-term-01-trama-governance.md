# TRAMA-TERM-01 TRAMA Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendere il vocabolario «curricolo» una regola verificabile di governance TRAMA e impedire nuove regressioni terminologiche.

**Architecture:** Il repository TRAMA diventa la fonte normativa del vocabolario tramite un registro machine-readable e un validator Python eseguito dal workflow Governance. Il controllo valuta soltanto nuove introduzioni/diff e consente eccezioni legacy motivate, evitando una bonifica big-bang della storia.

**Tech Stack:** Python 3, pytest, Git diff, JSON, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-09-trama-term-01-curricolo-vocabulary-design.md`

## Global Constraints

- Termine canonico: `curricolo` / `curricolo di istituto`.
- Legacy v1 immutabile e ammesso solo via allowlist motivata.
- Nessuna riscrittura massiva della storia.
- Nessun auto-merge.

## Review Focus

- Matching case-insensitive: `Curriculum`, `CURRICULUM`, `curriculum_*` devono essere intercettati.
- Una riga rimossa non deve essere segnalata come nuova regressione.
- Un identificatore v1 allowlisted deve passare solo nel percorso/pattern dichiarato.
- Una nuova eccezione non motivata deve fallire la validazione del registro.
- File binari/vendor/generati non devono produrre falsi positivi se esplicitamente esclusi dal registro.

---

### Task 1: Registro machine-readable del vocabolario

**Files:**
- Create: `governance/terminology/trama-curricolo-vocabulary-v1.json`
- Test: `tests/test_curricolo_vocabulary_guardrail.py`

**Interfaces:**
- Consumes: decisione della spec.
- Produces: JSON con `canonicalTerms`, `forbiddenDomainPatterns`, `legacyAllowlist`, `excludedPaths`.

- [ ] **Step 1: Write the failing test**

Creare `test_registry_declares_curricolo_and_requires_legacy_reason()` che verifichi `canonicalTerms` contenente `curricolo` e che ogni entry `legacyAllowlist` abbia `path`, `pattern`, `reason` non vuoti.

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest -q tests/test_curricolo_vocabulary_guardrail.py`
Expected: FAIL perché il registro non esiste.

- [ ] **Step 3: Implement the registry**

Creare `governance/terminology/trama-curricolo-vocabulary-v1.json` con schema minimo deciso dalla spec e allowlist iniziale per identificatori v1, riferimenti infrastrutturali al repository `Curriculum-Atlas` e documenti storici esplicitamente elencati.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest -q tests/test_curricolo_vocabulary_guardrail.py`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add governance/terminology/trama-curricolo-vocabulary-v1.json tests/test_curricolo_vocabulary_guardrail.py && git commit -m "TRAMA-TERM-01: add canonical curricolo vocabulary registry"`

### Task 2: Validator diff-aware

**Files:**
- Create: `scripts/validate_curricolo_vocabulary.py`
- Modify: `tests/test_curricolo_vocabulary_guardrail.py`

**Interfaces:**
- Consumes: registro JSON del Task 1 e un diff Git/base ref.
- Produces: exit code 0 su diff conforme; exit code 1 con `path:line:token` per nuove occorrenze non ammesse.

- [ ] **Step 1: Write failing tests**

Aggiungere test per: nuova occorrenza vietata → FAIL; rimozione → PASS; v1 allowlisted → PASS; allowlist senza reason → FAIL; matching case-insensitive → FAIL.

- [ ] **Step 2: Run tests to verify RED**

Run: `pytest -q tests/test_curricolo_vocabulary_guardrail.py`
Expected: FAIL perché il validator non esiste.

- [ ] **Step 3: Implement validator**

Implementare funzioni `load_policy(path: Path) -> dict`, `scan_added_lines(diff_text: str, policy: dict) -> list[Violation]`, `main() -> int`. Il parser deve analizzare solo righe aggiunte `+` escluse intestazioni `+++`, applicare `excludedPaths` e allowlist percorso+pattern.

- [ ] **Step 4: Run focused tests**

Run: `pytest -q tests/test_curricolo_vocabulary_guardrail.py`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add scripts/validate_curricolo_vocabulary.py tests/test_curricolo_vocabulary_guardrail.py && git commit -m "TRAMA-TERM-01: enforce curricolo vocabulary on new changes"`

### Task 3: Integrare il guardrail nel workflow Governance

**Files:**
- Modify: `.github/workflows/governance.yml`
- Modify: `tests/test_curricolo_vocabulary_guardrail.py`

**Interfaces:**
- Consumes: validator Task 2.
- Produces: check Governance che esegue il validator su PR e push main.

- [ ] **Step 1: Add a source-level failing assertion**

Il test deve verificare che `.github/workflows/governance.yml` invochi `python scripts/validate_curricolo_vocabulary.py`.

- [ ] **Step 2: Run test to verify RED**

Run: `pytest -q tests/test_curricolo_vocabulary_guardrail.py`
Expected: FAIL sulla workflow assertion.

- [ ] **Step 3: Update workflow**

Aggiungere step `Validate canonical curricolo vocabulary` dopo checkout/setup Python e prima dei gate di stato; fornire al validator il base SHA della PR o il parent appropriato su push.

- [ ] **Step 4: Verify GREEN**

Run: `pytest -q tests/test_curricolo_vocabulary_guardrail.py`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add .github/workflows/governance.yml tests/test_curricolo_vocabulary_guardrail.py && git commit -m "TRAMA-TERM-01: gate terminology in Governance CI"`

### Task 4: Riallineare i documenti attivi TRAMA

**Files:**
- Modify: `README.md`
- Modify: `ROADMAP.md`
- Modify: `STATUS.md`
- Modify: `docs/architecture/ecosystem-overview.md`
- Modify: `docs/vision/product-strategy.md`
- Modify: `docs/product/atlas-public-curriculum-learning-hub.md`
- Modify: `products/studio-atlas/README.md`
- Modify: `governance/terminology/trama-curricolo-vocabulary-v1.json` solo se occorrono eccezioni legacy giustificate.

**Interfaces:**
- Consumes: vocabolario canonico.
- Produces: documentazione attiva che parla di Curricolo/Atlas; identificatori legacy restano letterali quando necessari.

- [ ] **Step 1: Add regression fixtures/assertions**

Estendere il test perché i documenti attivi sopra non contengano `curriculum` nel testo prose, salvo match esatti dell'allowlist.

- [ ] **Step 2: Run RED**

Run: `pytest -q tests/test_curricolo_vocabulary_guardrail.py`
Expected: FAIL sulle occorrenze attive già censite.

- [ ] **Step 3: Replace prose only**

Sostituire `Curriculum pubblico` con `Curricolo di istituto` o `Consultazione pubblica del curricolo di istituto`; `Curriculum Atlas` con `Atlas`; `Arena curriculum search` con `ricerca nel curricolo di Arena`. Non alterare URL, repo slug, contract IDs o nomi file legacy referenziati.

- [ ] **Step 4: Run full TRAMA governance tests**

Run: `pytest -q tests/test_curricolo_vocabulary_guardrail.py && python scripts/validate_curricolo_vocabulary.py`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add README.md ROADMAP.md STATUS.md docs/architecture/ecosystem-overview.md docs/vision/product-strategy.md docs/product/atlas-public-curriculum-learning-hub.md products/studio-atlas/README.md governance/terminology/trama-curricolo-vocabulary-v1.json && git commit -m "TRAMA-TERM-01: align active ecosystem terminology"`

### Task 5: Exact-head verification

**Files:** none unless a test-only correction is required.

**Interfaces:**
- Consumes: branch head after Tasks 1-4.
- Produces: evidence that the governance guardrail is live and non-destructive.

- [ ] Run `pytest -q tests/test_curricolo_vocabulary_guardrail.py`.
- [ ] Run repository Governance workflow on exact head.
- [ ] Confirm existing v1 contract files remain byte-for-byte unchanged.
- [ ] Confirm PR remains Draft/open and unmerged.
