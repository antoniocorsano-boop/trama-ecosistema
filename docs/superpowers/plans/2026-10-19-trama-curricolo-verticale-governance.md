# TRAMA Curricolo Verticale — Governance & Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pubblicare il contratto governato che descrive una versione completa del curricolo verticale di istituto Arena destinata all'adozione operativa esplicita in Docente OS.

**Architecture:** Il contratto TRAMA è una nuova superficie v1, distinta e additiva rispetto a ECO-01 `CURRICULUM_SNAPSHOT_V1`. Usa terminologia canonica `curricolo`, conserva l'autorità Arena e codifica manifest di completezza, segmenti, nodi, relazioni verticali, stato di autorità e policy downstream fail-closed. Il contratto struttura la dichiarazione di completezza; il giudizio semantico `SATISFIED` appartiene ad Arena e include perimetro atteso più utilizzabilità per la programmazione dei segmenti obbligatori.

**Tech Stack:** JSON Schema Draft 2020-12, Python 3, `jsonschema`, pytest.

**Spec:** `docs/superpowers/specs/2026-10-19-trama-curricolo-verticale-arena-docente-os-design.md`

## Global Constraints

- Non modificare `docs/contracts/CURRICULUM_SNAPSHOT_V1.schema.json`.
- Nuovi identificatori di dominio usano `curricolo`, non nuovi `Curriculum*` legacy.
- `sourceProduct = ARENA`; `targetProduct = DOCENTE_OS`.
- `acceptanceRequired = true`; `automaticWriteAllowed = false`.
- Infanzia non ha `yearLevel` numerico obbligatorio.
- Il manifest è authority-owned da Arena; Docente OS non inventa il perimetro atteso né ricalcola il giudizio di completezza.
- `SATISFIED` significa che Arena dichiara coperto il perimetro atteso e utilizzabili per la programmazione tutti i segmenti obbligatori.
- `PROVISIONAL_COMPLETE` e `APPROVED` restano distinti.

## Review Focus

- Payload che omette un segmento atteso deve fallire o dichiarare manifest non soddisfatto.
- Manifest `SATISFIED` con un segmento obbligatorio dichiarato non utilizzabile per la programmazione deve essere semanticamente invalido lato Arena.
- `APPROVED` senza receipt/evidenza Arena deve fallire.
- Infanzia con `yearLevel` forzato deve fallire la fixture canonica.
- Primaria fuori 1–5, secondaria fuori 1–3 e `automaticWriteAllowed=true` devono fallire.

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
- Contract literal: `TRAMA_CURRICOLO_VERTICALE_RELEASE_V1`.
- Schema fields: `institutionRef`, `schoolYearRef`, `version`, `authority`, `manifest`, `segments`, `nodes`, `verticalLinks`, `structuralFootprint`, `issuedAt`, `downstreamPolicy`.
- `manifest.coverageStatus`: `SATISFIED | INCOMPLETE`.
- Manifest includes Arena-issued planning-usability evidence/status for mandatory expected scopes so consumers can verify the declaration without recomputing Arena policy.
- `authority.state`: `PROVISIONAL_COMPLETE | APPROVED`.
- Segment orders: `INFANZIA | PRIMARIA | SECONDARIA_I_GRADO`.

- [ ] **Step 1: Write failing schema tests**

Assert valid full fixture validates; invalid fixtures fail; all three orders appear; primary boundaries 1/5 and secondary 1/3 are valid; infancy needs no numeric `yearLevel`; downstream policy is human-controlled.

- [ ] **Step 2: Run RED**

Run: `python -m pytest tests/test_curricolo_verticale_release_v1.py -q`
Expected: FAIL because schema/fixtures do not yet exist.

- [ ] **Step 3: Implement JSON Schema**

Use Draft 2020-12 conditional validation:
- `INFANZIA`: `yearLevel` absent;
- `PRIMARIA`: grade scope integer 1–5;
- `SECONDARIA_I_GRADO`: grade scope integer 1–3;
- `APPROVED`: authority receipt required and `requiresRevalidationOnApproval=false`;
- `PROVISIONAL_COMPLETE`: no institutional approval receipt and `requiresRevalidationOnApproval=true`;
- downstream policy constants.

The JSON Schema validates the presence/shape/consistency of Arena's completeness declaration; Arena's implementation tests prove the semantic truth of `SATISFIED` against its governed model.

- [ ] **Step 4: Run GREEN**

Run focused test; expected PASS.

- [ ] **Step 5: Run terminology guardrail**

Run repository TERM-01 validation; expected PASS. Exact legacy identifiers are permitted only through the path-scoped, reasoned allowlist entries added for these implementation plans.

- [ ] **Step 6: Commit**

`feat(contract): define vertical institute curricolo release v1`

### Task 2: Contract semantics document and compatibility boundary

**Files:**
- Create: `docs/contracts/trama-curricolo-verticale-release-v1.md`
- Modify only if required by existing contract index: canonical contract index discovered on execution head.
- Test: `tests/test_curricolo_verticale_release_v1.py`

**Interfaces:**
- Defines manifest completeness/authority semantics.
- Declares ECO-01 v1 immutable and the new contract additive.

- [ ] **Step 1: Extend tests to pin compatibility**

Assert ECO-01 schema remains unchanged; new contract grants no automatic write authority and does not make Docente OS a curricolo authority.

- [ ] **Step 2: RED for missing semantics document/index**

- [ ] **Step 3: Write semantics**

Document package identity/versioning, Arena-owned completeness, authority, order scoping, structural fingerprint meaning, human acceptance, updates/supersession, and the distinction between structural footprint and independently verified institutional approval evidence.

- [ ] **Step 4: GREEN + governance suite**

- [ ] **Step 5: Commit**

`docs(contract): govern vertical curricolo adoption semantics`

### Task 3: Record contract evidence without activating runtime

**Files:**
- Modify only normal evidence/status surfaces after re-reading exact current paths.

**Interfaces:**
- Governance receipt: contract `DEFINED / NOT_RUNTIME_ACTIVATED`.

- [ ] **Step 1: Record exact contract head and focused test evidence**

- [ ] **Step 2: Keep runtime capability non-active until Arena and Docente OS qualify**

- [ ] **Step 3: Run Control Center/snapshot validators if status files change**

- [ ] **Step 4: Commit**

`docs(governance): record vertical curricolo contract evidence`
