# TRAMA Curricolo Verticale — Governance & Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pubblicare il contratto governato che descrive una versione completa del curricolo verticale di istituto Arena destinata all'adozione operativa esplicita in Docente OS.

**Architecture:** Il contratto TRAMA è una nuova superficie v1, distinta e additiva rispetto a ECO-01 `CURRICULUM_SNAPSHOT_V1`. Usa terminologia canonica `curricolo`, conserva l'autorità Arena e codifica manifest di completezza, segmenti, nodi, relazioni verticali, stato di autorità e policy downstream fail-closed.

**Tech Stack:** JSON Schema Draft 2020-12, Python 3, `jsonschema`, pytest.

**Spec:** `docs/superpowers/specs/2026-10-19-trama-curricolo-verticale-arena-docente-os-design.md`

## Global Constraints

- Non modificare `docs/contracts/CURRICULUM_SNAPSHOT_V1.schema.json`.
- Nuovi identificatori di dominio usano `curricolo`, non nuovi `Curriculum*` legacy.
- `sourceProduct = ARENA`; `targetProduct = DOCENTE_OS`.
- `acceptanceRequired = true`; `automaticWriteAllowed = false`.
- Infanzia non ha `yearLevel` numerico obbligatorio.
- Il manifest è authority-owned da Arena; Docente OS non inventa il perimetro atteso.
- `PROVISIONAL_COMPLETE` e `APPROVED` restano distinti.

## Review Focus

- Payload che omette un segmento atteso deve fallire o dichiarare manifest non soddisfatto.
- `APPROVED` senza receipt/evidenza Arena deve fallire.
- Infanzia con `yearLevel` forzato deve fallire la fixture canonica.
- Primaria fuori 1–5 e secondaria fuori 1–3 devono fallire.
- `automaticWriteAllowed=true` deve fallire.

---

### Task 1: Contract schema and canonical fixtures

**Files:**
- Create: `docs/contracts/TRAMA_CURRICOLO_VERTICALE_RELEASE_V1.schema.json`
- Create: `tests/fixtures/curricolo_verticale_release_v1/valid-full.json`
- Create: `tests/fixtures/curricolo_verticale_release_v1/invalid-infanzia-year-level.json`
- Create: `tests/fixtures/curricolo_verticale_release_v1/invalid-authority.json`
- Create: `tests/fixtures/curricolo_verticale_release_v1/invalid-auto-write.json`
- Create: `tests/fixtures/curricolo_verticale_release_v1/invalid-manifest-coverage.json`
- Create: `tests/test_curricolo_verticale_release_v1.py`

**Interfaces:**
- Produces contract literal: `TRAMA_CURRICOLO_VERTICALE_RELEASE_V1`.
- Produces schema fields: `institutionRef`, `schoolYearRef`, `version`, `authority`, `manifest`, `segments`, `nodes`, `verticalLinks`, `structuralFootprint`, `issuedAt`, `downstreamPolicy`.
- `manifest.coverageStatus`: `SATISFIED | INCOMPLETE`.
- `authority.state`: `PROVISIONAL_COMPLETE | APPROVED`.
- Segment order values: `INFANZIA | PRIMARIA | SECONDARIA_I_GRADO`.

- [ ] **Step 1: Write the failing schema tests**

Tests assert:
- `valid-full.json` validates;
- all four invalid fixtures produce at least one validation error;
- valid fixture contains all three school orders;
- primary scope covers boundaries 1 and 5;
- secondary scope covers boundaries 1 and 3;
- infancy segment has no numeric `yearLevel` requirement;
- downstream policy is human-controlled.

- [ ] **Step 2: Run RED**

Run: `python -m pytest tests/test_curricolo_verticale_release_v1.py -q`
Expected: FAIL because schema/fixtures do not yet exist.

- [ ] **Step 3: Implement the JSON Schema**

Use Draft 2020-12 conditional validation:
- `INFANZIA`: `yearLevel` absent;
- `PRIMARIA`: `yearLevel` integer 1–5 when scope is grade;
- `SECONDARIA_I_GRADO`: `yearLevel` integer 1–3 when scope is grade;
- `APPROVED`: authority receipt required and `requiresRevalidationOnApproval=false`;
- `PROVISIONAL_COMPLETE`: no institutional approval receipt and `requiresRevalidationOnApproval=true`;
- `downstreamPolicy.acceptanceRequired=true`, `automaticWriteAllowed=false` constants.

- [ ] **Step 4: Run GREEN**

Run: `python -m pytest tests/test_curricolo_verticale_release_v1.py -q`
Expected: PASS.

- [ ] **Step 5: Run terminology guardrail**

Run the repository's existing TERM-01/terminology validation command used by CI.
Expected: PASS; the only legacy terminology remains in immutable/allowlisted compatibility surfaces.

- [ ] **Step 6: Commit**

Commit message: `feat(contract): define vertical institute curricolo release v1`

### Task 2: Contract semantics document and compatibility boundary

**Files:**
- Create: `docs/contracts/trama-curricolo-verticale-release-v1.md`
- Modify only if required by existing contract index: the canonical contract index file discovered in repo at execution time.
- Test: `tests/test_curricolo_verticale_release_v1.py`

**Interfaces:**
- Defines canonical interpretation of manifest completeness and authority.
- Explicitly declares ECO-01 v1 immutable and this contract additive.

- [ ] **Step 1: Extend tests to pin compatibility**

Assertions:
- ECO-01 schema file still exists and its SHA/content is not modified by this task;
- new contract does not declare automatic write authority;
- new contract does not make Docente OS a curriculum authority.

- [ ] **Step 2: Run RED for missing semantic document/index entry**

Run: `python -m pytest tests/test_curricolo_verticale_release_v1.py -q`
Expected: FAIL on the new documentation/index assertion only.

- [ ] **Step 3: Write the semantic contract document**

Document:
- package identity and versioning;
- manifest rules;
- authority rules;
- segment scoping for each order;
- fingerprint meaning (structural identity, not a cryptographic institutional signature unless separately attested);
- downstream human acceptance;
- update/supersession semantics.

- [ ] **Step 4: Run GREEN and repository governance suite**

Expected: focused tests and existing governance checks PASS.

- [ ] **Step 5: Commit**

Commit message: `docs(contract): govern vertical curricolo adoption semantics`

### Task 3: Record contract evidence without activating runtime

**Files:**
- Modify only the repository's normal evidence/status surfaces after their exact current paths are re-read.

**Interfaces:**
- Produces a governance receipt: contract `DEFINED / NOT_RUNTIME_ACTIVATED`.

- [ ] **Step 1: Add evidence that names exact contract head and focused test result**

- [ ] **Step 2: Keep capability state non-runtime until Arena and Docente OS both qualify**

- [ ] **Step 3: Run Control Center/snapshot validators if status files changed**

- [ ] **Step 4: Commit**

Commit message: `docs(governance): record vertical curricolo contract evidence`
