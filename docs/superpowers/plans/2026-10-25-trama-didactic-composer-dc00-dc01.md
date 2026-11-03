# TRAMA Didactic Composer DC-00 / DC-01 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Qualify the governed product-identity prerequisite and the provider-neutral `didactic.composition.propose@1` Core contract entirely offline, without product adapters, external writes or runtime activation.

**Architecture:** DC-00 introduces one additive machine-readable product identity registry and makes existing shared-capability validation consume it without rewriting historical evidence. DC-01 then adds a stateless `PROPOSE_ONLY` Composer contract, deterministic semantic digesting, privacy/authority validation and fake-adapter qualification. Product integrations remain outside this plan.

**Tech Stack:** Python 3.12, JSON, `unittest`, SHA-256 from Python stdlib, GitHub Actions, Markdown.

**Spec:** `docs/superpowers/specs/2026-10-25-trama-didactic-composer-v1-design.md`

**Human approval:** `docs/evidence/didactic-composer-human-design-approval-2026-10-25.md`

## Global Constraints

- Runtime remains `NOT_AUTHORIZED`.
- DOS-A1 remains `RUNTIME_DEFERRED`.
- No product adapter or UI change is in scope.
- No external write, including Drive export, is in scope.
- No student-personal data may enter Composer v1.
- Arena remains authority for the curricolo.
- `APPLICABLE | TRANSITIONAL` must be preserved exactly; `TRANSITIONAL` is never silently normalized.
- `REGISTRO_DOCENTE` is not an alias of `DOCENTE_OS`.
- `STUDIO_ATLAS` is not an alias of `ATLAS`.
- `OTHER_GOVERNED` is not an authorized runtime caller id in v1.
- Shared capability mode is exactly `PROPOSE_ONLY`.
- `PLANNED != PREPARED != PUBLISHED != TAUGHT != RECORDED != ASSESSED`.
- Existing OR-07 and OR-10 evidence remains historically valid; new work may validate it against the new registry but must not fabricate downstream integration evidence.
- New text must comply with TRAMA-TERM-01 terminology and use `curricolo` domain language.

## Review Focus

1. **Unknown or placeholder caller ids:** an unregistered product, including `OTHER_GOVERNED`, must fail closed rather than inherit a nearby product's authority. Task 2 pins this with explicit negative tests.
2. **Transitional Arena context:** an `APPROVED + VIGENTE + TRANSITIONAL` request must pass and preserve `regimeRef`; `NON_VIGENTE`, provisional or missing regime data must fail. Task 3 pins all cases.
3. **Nested student-personal data:** forbidden fields must fail even when nested under sources, constraints or design metadata. Task 3 uses recursive-key adversarial fixtures.
4. **Provider portability and semantic identity:** two fake adapters returning the same semantic composition must produce the same digest while retaining distinct provenance. Task 4 pins deterministic digest semantics.
5. **Implicit write/authority escalation:** Drive write hints, system adoption, Control Center decision ownership or any non-`PROPOSE_ONLY` mode must fail. Tasks 2–4 pin these separately.

---

## File Structure

### Governance / ratification

- Modify: `docs/decisions/decision-register.json` — register ADR-022 as the approved architecture decision without changing runtime authority.
- Modify: `docs/knowledge/governed-document-registry.json` — register the approved ADR, design, capability record and human approval receipt as governed knowledge.

### DC-00 — governed product identities

- Create: `docs/contracts/trama-governed-product-identities-v1.md` — normative additive identity contract.
- Create: `governance/runtime/governed-product-identities-v1.json` — machine-readable identity registry.
- Create: `scripts/validate_governed_product_identities.py` — registry validator and reusable lookup helpers.
- Create: `tests/test_governed_product_identities.py` — positive/negative identity tests.
- Modify: `scripts/validate_or07_shared_capability_layer.py` — reject unregistered caller ids using DC-00 registry.
- Modify: `tests/test_or07_shared_capability_layer.py` — prove legacy callers still pass and new governed callers are recognized without aliases.
- Modify: `scripts/validate_or10_product_evidence_alignment.py` — require every historical OR-10 product id to exist in the registry while preserving the historical three-product evidence set.
- Modify: `.github/workflows/governance.yml` — run DC-00 validator/tests before OR-07/OR-10 checks.

### DC-01 — Didactic Composer Core

- Create: `docs/contracts/trama-didactic-composer-contract-v1.md` — normative request/proposal/adoption contract.
- Create: `governance/runtime/didactic-composer-v1-fixtures.json` — one valid case, two equivalent fake adapters, adoption receipt and adversarial cases.
- Create: `scripts/validate_didactic_composer_v1.py` — request/proposal/adoption validator and semantic digest implementation.
- Create: `tests/test_didactic_composer_v1.py` — TDD qualification suite.
- Create: `docs/evidence/didactic-composer-dc01-qualification.md` — exact-SHA offline qualification receipt, created only after GREEN.
- Modify: `.github/workflows/governance.yml` — run DC-01 validator/tests after DC-00/OR-07 prerequisites.
- Modify: `docs/capabilities/didactic-composer/CAPABILITY.md` — record DC-00/DC-01 qualification state only after the gates pass.

---

### Task 1: Ratify the approved design in governed project knowledge

**Files:**
- Modify: `docs/decisions/decision-register.json`
- Modify: `docs/knowledge/governed-document-registry.json`
- Test: existing `scripts/validate_governed_document_registry.py`

**Interfaces:**
- Consumes: Human approval receipt for exact design candidate `97056b05c9a7aa66deeffff13daf705fb91d032a`.
- Produces: registered decision id `TRAMA-ADR-022` with approved design status and governed document ids usable by later tasks.

- [ ] **Step 1: Write the failing registry expectation**

Add a focused test or validator assertion that expects `TRAMA-ADR-022` to exist in the decision register before the new governed documents may reference it.

Expected assertion set:

```python
assert "TRAMA-ADR-022" in decision_ids
assert registered_adr_022["status"] == "APPROVED"
```

- [ ] **Step 2: Run the focused validation and verify RED**

Run:

```bash
python3 scripts/validate_governed_document_registry.py
```

Expected: FAIL once the new ADR-backed registry entry is introduced without the decision-register entry, proving the dependency is real.

- [ ] **Step 3: Register `TRAMA-ADR-022`**

Add one decision-register entry with:

```text
id = TRAMA-ADR-022
status = APPROVED
date = 2026-10-25
scope = TRAMA, Arena, Atlas, Docente OS, Registro Docente, Studio Atlas
humanControlImpact = STRENGTHENED
```

Decision text must state: stateless `PROPOSE_ONLY` Composer, immutable/versioned composition artifact, product-local adoption, no central domain store, no new write authority, no DOS-A1 activation.

- [ ] **Step 4: Register approved Composer documents**

Add governed-document entries for:

```text
DOC-DIDACTIC-COMPOSER-ADR-022
DOC-DIDACTIC-COMPOSER-DESIGN-V1
DOC-DIDACTIC-COMPOSER-CAPABILITY
DOC-DIDACTIC-COMPOSER-HUMAN-APPROVAL
```

Use `decisionRef = TRAMA-ADR-022`; make the design/capability/approval entries depend on the ADR entry. Do not mark implementation/runtime as current capability.

- [ ] **Step 5: Verify governance registry GREEN**

Run:

```bash
python3 scripts/validate_governed_document_registry.py
python3 scripts/validate_curricolo_vocabulary.py --base HEAD^
```

Expected: both PASS.

- [ ] **Step 6: Commit**

```bash
git add docs/decisions/decision-register.json docs/knowledge/governed-document-registry.json
git commit -m "docs: ratify Didactic Composer ADR-022"
```

---

### Task 2: DC-00 — Add explicit governed product identities

**Files:**
- Create: `docs/contracts/trama-governed-product-identities-v1.md`
- Create: `governance/runtime/governed-product-identities-v1.json`
- Create: `scripts/validate_governed_product_identities.py`
- Create: `tests/test_governed_product_identities.py`
- Modify: `.github/workflows/governance.yml`

**Interfaces:**
- Produces:
  - `load_product_registry(path: Path = REGISTRY) -> dict[str, Any]`
  - `validate_product_registry(data: dict[str, Any]) -> list[str]`
  - `registered_product_ids(data: dict[str, Any]) -> set[str]`
  - `is_registered_product(product_id: str, data: dict[str, Any]) -> bool`
- Later tasks consume `is_registered_product` and the exact registry ids.

- [ ] **Step 1: Write the RED tests for the registry**

Create tests that require exactly these ids:

```python
{
    "ARENA",
    "ATLAS",
    "DOCENTE_OS",
    "REGISTRO_DOCENTE",
    "STUDIO_ATLAS",
    "CONTROL_CENTER",
}
```

Also assert:

```python
assert is_registered_product("REGISTRO_DOCENTE", registry)
assert is_registered_product("STUDIO_ATLAS", registry)
assert not is_registered_product("OTHER_GOVERNED", registry)
assert not is_registered_product("UNKNOWN_PRODUCT", registry)
```

Add adversarial cases for duplicate ids, missing domain role, alias fields and a writable Control Center role.

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
python3 -m unittest tests.test_governed_product_identities -v
```

Expected: FAIL because registry/validator do not yet exist.

- [ ] **Step 3: Create the machine registry**

Use schema version:

```text
trama.governed-product-identities/v1
```

Each product record has exactly:

```text
id
domainRole
sharedCapabilityCaller
controlClass
aliasOf
```

Required domain roles:

```text
ARENA            → CURRICOLO_AUTHORITY
ATLAS            → PUBLIC_LEARNER_SURFACE
DOCENTE_OS       → TEACHER_OPERATIONAL
REGISTRO_DOCENTE → TEACHER_RECORD
STUDIO_ATLAS     → PROFESSIONAL_AUTHORING
CONTROL_CENTER   → READ_ONLY_OBSERVER
```

All `aliasOf` values are `null`. `CONTROL_CENTER.controlClass` is `READ_ONLY`; no record adds write authority.

- [ ] **Step 4: Implement the registry validator helpers**

Implement the four signatures in the Interfaces block. `validate_product_registry` fails on:

- schema mismatch;
- duplicate/missing ids;
- ids outside the exact set;
- missing/duplicate domain roles;
- any non-null `aliasOf`;
- Control Center not read-only;
- false/missing `sharedCapabilityCaller` for the six governed identities.

- [ ] **Step 5: Run DC-00 tests GREEN**

Run:

```bash
python3 -m unittest tests.test_governed_product_identities -v
python3 scripts/validate_governed_product_identities.py
```

Expected: PASS.

- [ ] **Step 6: Add the normative DC-00 contract and CI steps**

The Markdown contract states that the registry adds identity only; it does not transfer authority or authorize runtime. Add Governance steps immediately before OR-07:

```bash
python3 scripts/validate_governed_product_identities.py
python3 -m unittest tests.test_governed_product_identities -v
```

- [ ] **Step 7: Commit**

```bash
git add docs/contracts/trama-governed-product-identities-v1.md governance/runtime/governed-product-identities-v1.json scripts/validate_governed_product_identities.py tests/test_governed_product_identities.py .github/workflows/governance.yml
git commit -m "feat: add governed product identity registry"
```

---

### Task 3: DC-00 — Bind OR-07/OR-10 validation to the identity registry

**Files:**
- Modify: `scripts/validate_or07_shared_capability_layer.py`
- Modify: `tests/test_or07_shared_capability_layer.py`
- Modify: `scripts/validate_or10_product_evidence_alignment.py`
- Test: `tests/test_or07_shared_capability_layer.py`
- Test: `tests/test_governed_product_identities.py`

**Interfaces:**
- Consumes: `is_registered_product(product_id, registry)` from Task 2.
- Produces: OR-07 caller validation error `SC-11` for unregistered caller ids; OR-10 historical evidence is checked as a subset of the governed registry, not rewritten to pretend new integrations exist.

- [ ] **Step 1: Add failing OR-07 caller tests**

Add tests asserting:

```python
assert "SC-11" not in validate_case(case_with("REGISTRO_DOCENTE"))
assert "SC-11" not in validate_case(case_with("STUDIO_ATLAS"))
assert "SC-11" in validate_case(case_with("OTHER_GOVERNED"))
assert "SC-11" in validate_case(case_with("UNKNOWN_PRODUCT"))
```

Keep the existing Control Center non-authority test unchanged.

- [ ] **Step 2: Run OR-07 tests and verify RED**

Run:

```bash
python3 -m unittest tests.test_or07_shared_capability_layer -v
```

Expected: FAIL because OR-07 currently checks only presence of `caller.product`.

- [ ] **Step 3: Use the registry in OR-07**

Load the DC-00 registry once and add `SC-11` when `caller.product` is not registered. Do not change `SC-01`…`SC-10` semantics.

- [ ] **Step 4: Preserve OR-10 historical evidence honestly**

Modify `validate_or10_product_evidence_alignment.py` so every product already present in `or10-x-evidence-alignment.json` must be registered by DC-00. Do **not** require `REGISTRO_DOCENTE` or `STUDIO_ATLAS` to appear in historical OR-10 evidence until real integration evidence exists.

- [ ] **Step 5: Run all DC-00/OR tests GREEN**

Run:

```bash
python3 -m unittest tests.test_governed_product_identities tests.test_or07_shared_capability_layer -v
python3 scripts/validate_or07_shared_capability_layer.py
python3 scripts/validate_or10_product_evidence_alignment.py
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/validate_or07_shared_capability_layer.py tests/test_or07_shared_capability_layer.py scripts/validate_or10_product_evidence_alignment.py
git commit -m "test: bind shared capability callers to governed product ids"
```

---

### Task 4: DC-01 — Define and qualify the Didactic Composer Core contract

**Files:**
- Create: `docs/contracts/trama-didactic-composer-contract-v1.md`
- Create: `governance/runtime/didactic-composer-v1-fixtures.json`
- Create: `scripts/validate_didactic_composer_v1.py`
- Create: `tests/test_didactic_composer_v1.py`

**Interfaces:**
- Consumes: DC-00 product registry.
- Produces:
  - `canonical_json(value: Any) -> str`
  - `semantic_composition_payload(proposal: dict[str, Any]) -> dict[str, Any]`
  - `compute_content_digest(proposal: dict[str, Any]) -> str`
  - `validate_request(request: dict[str, Any], registry: dict[str, Any]) -> list[str]`
  - `validate_proposal(request: dict[str, Any], proposal: dict[str, Any]) -> list[str]`
  - `validate_adoption_receipt(receipt: dict[str, Any], proposal: dict[str, Any]) -> list[str]`
  - `qualify_matrix(matrix: dict[str, Any], registry: dict[str, Any]) -> dict[str, Any]`

- [ ] **Step 1: Write the valid-path tests first**

The valid fixture uses caller `REGISTRO_DOCENTE`, `privacyClass = PROFESSIONAL_NON_PERSONAL`, Arena `APPROVED + VIGENTE + TRANSITIONAL`, non-empty `regimeRef`, and two fake adapters.

Assert:

```python
assert validate_request(request, registry) == []
assert validate_proposal(request, proposal_alpha) == []
assert validate_proposal(request, proposal_beta) == []
assert compute_content_digest(proposal_alpha) == compute_content_digest(proposal_beta)
assert proposal_alpha["provenance"] != proposal_beta["provenance"]
```

- [ ] **Step 2: Add adversarial tests before implementation**

Require fail-closed errors for:

```text
DC-01 UNKNOWN_CALLER
DC-02 UNSUPPORTED_CALLER
DC-03 PERSONAL_STUDENT_DATA
DC-04 ARENA_AUTHORITY_INVALID
DC-05 VIGENCY_INVALID
DC-06 APPLICABILITY_INVALID
DC-07 REGIME_REF_MISSING
DC-08 TRANSITIONAL_NOT_PRESERVED
DC-09 NON_PROPOSAL_STATUS
DC-10 DRIVE_WRITE_NOT_DEFERRED
DC-11 PROVIDER_SEMANTICS_DRIFT
DC-12 DIGEST_MISMATCH
DC-13 SYSTEM_ADOPTION_FORBIDDEN
DC-14 CONTENT_IDENTITY_MISMATCH
```

Nested student-data cases must include at least `studentName`, `studentId`, `studentEmail`, `grade`, `diagnosis` and `healthData` under different nested objects.

- [ ] **Step 3: Run DC-01 tests and verify RED**

Run:

```bash
python3 -m unittest tests.test_didactic_composer_v1 -v
```

Expected: FAIL because the validator and fixture do not exist.

- [ ] **Step 4: Implement canonical semantic digesting**

`canonical_json` uses:

```python
json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
```

`semantic_composition_payload` returns exactly these proposal members:

```text
requestedKind
title
rationale
curricoloBinding
design
projectionHints
review
```

It excludes request id, provider/adapter provenance, `producedAt`, `compositionId`, `compositionVersion`, `status` and `contentDigest`.

`compute_content_digest` returns:

```text
sha256:<64 lowercase hex characters>
```

using `hashlib.sha256(canonical_json(payload).encode("utf-8"))`.

- [ ] **Step 5: Implement request validation**

Capability-specific allowed caller ids are exactly:

```text
DOCENTE_OS
REGISTRO_DOCENTE
STUDIO_ATLAS
```

The id must also exist in the DC-00 registry. `ARENA`, `ATLAS`, `CONTROL_CENTER`, `OTHER_GOVERNED` and unknown ids fail for this capability.

Validate:

```text
privacyClass = PROFESSIONAL_NON_PERSONAL
authorityProduct = ARENA
authorityState = APPROVED
vigencyStatus = VIGENTE
applicabilityStatus ∈ {APPLICABLE, TRANSITIONAL}
regimeRef is non-empty
sourceRefs is non-empty
curricoloItems is non-empty
```

Recursively reject forbidden student-personal keys.

- [ ] **Step 6: Implement proposal validation**

Require:

```text
status = PROPOSAL
compositionVersion >= 1
contentDigest = compute_content_digest(proposal)
curricoloBinding.acceptedContextRef = request.curricoloContext.acceptedContextRef
curricoloBinding.applicabilityStatus = request.curricoloContext.applicabilityStatus
curricoloBinding.regimeRef = request.curricoloContext.regimeRef
driveExport = DEFERRED_WRITE_SLICE
capabilityId = didactic.composition.propose
capabilityVersion = 1
```

Two adapters may differ in provenance and timestamps but not in semantic payload.

- [ ] **Step 7: Implement adoption-receipt validation**

Require:

```text
contract = DIDACTIC_COMPOSITION_ADOPTION_RECEIPT_V1
decidedBy = HUMAN
decision ∈ {ADOPTED, REJECTED, SUPERSEDED}
compositionId/version/contentDigest exactly match the referenced proposal
```

No receipt may imply global approval or another product's adoption.

- [ ] **Step 8: Run DC-01 tests GREEN**

Run:

```bash
python3 -m unittest tests.test_didactic_composer_v1 -v
python3 scripts/validate_didactic_composer_v1.py
```

Expected: PASS with both fake adapters semantically equivalent and all adversarial fixtures failing for their expected codes.

- [ ] **Step 9: Write the normative Core contract**

Document the exact interfaces and error classes above. State explicitly that DC-01 is offline qualification only and does not wire providers, products, Drive, Atlas publication or lesson runtime.

- [ ] **Step 10: Commit**

```bash
git add docs/contracts/trama-didactic-composer-contract-v1.md governance/runtime/didactic-composer-v1-fixtures.json scripts/validate_didactic_composer_v1.py tests/test_didactic_composer_v1.py
git commit -m "feat: qualify Didactic Composer Core contract offline"
```

---

### Task 5: Wire qualification gates and produce the exact-SHA receipt

**Files:**
- Modify: `.github/workflows/governance.yml`
- Create: `docs/evidence/didactic-composer-dc01-qualification.md`
- Modify: `docs/capabilities/didactic-composer/CAPABILITY.md`

**Interfaces:**
- Consumes: GREEN DC-00 and DC-01 validators/tests.
- Produces: exact-SHA evidence that contract qualification is complete while runtime remains unauthorized.

- [ ] **Step 1: Add DC-01 Governance steps**

Add after the DC-00/OR-07 checks:

```bash
python3 scripts/validate_didactic_composer_v1.py
python3 -m unittest tests.test_didactic_composer_v1 -v
```

Do not add deployment, provider credentials or network access.

- [ ] **Step 2: Run the complete local governance suite**

Run at minimum:

```bash
python3 scripts/validate_curricolo_vocabulary.py --base HEAD^
python3 scripts/validate_governed_document_registry.py
python3 scripts/validate_governed_product_identities.py
python3 -m unittest tests.test_governed_product_identities -v
python3 scripts/validate_or07_shared_capability_layer.py
python3 -m unittest tests.test_or07_shared_capability_layer -v
python3 scripts/validate_or10_product_evidence_alignment.py
python3 scripts/validate_didactic_composer_v1.py
python3 -m unittest tests.test_didactic_composer_v1 -v
```

Expected: all PASS.

- [ ] **Step 3: Commit the CI wiring**

```bash
git add .github/workflows/governance.yml
git commit -m "ci: gate Didactic Composer contracts"
```

- [ ] **Step 4: Qualify the exact candidate through GitHub Actions**

Require the Governance workflow on the exact head SHA to finish `SUCCESS`. If the Control Center bundle is triggered by repository policy, require it to finish `SUCCESS` too. A failure is diagnostic evidence, not permission to weaken a guardrail.

- [ ] **Step 5: Create the qualification receipt only after GREEN**

Record:

```text
exact head SHA
Governance run id/conclusion
Control Center bundle run id/conclusion when triggered
DC-00 targeted command results
DC-01 targeted command results
runtime = NOT_AUTHORIZED
DOS-A1 = RUNTIME_DEFERRED
product adapters = NOT_STARTED
external writes = NOT_AUTHORIZED
```

- [ ] **Step 6: Update the capability record**

Allowed state after qualification:

```text
G0/G1/G2 APPROVED
G3 SPEC APPROVED
DC-00 QUALIFIED
DC-01 CORE CONTRACT QUALIFIED
RUNTIME NOT_AUTHORIZED
PRODUCT ADAPTERS NOT_STARTED
```

Do not claim product integration, provider qualification or runtime readiness.

- [ ] **Step 7: Commit evidence/status**

```bash
git add docs/evidence/didactic-composer-dc01-qualification.md docs/capabilities/didactic-composer/CAPABILITY.md
git commit -m "docs: record Didactic Composer DC-01 qualification"
```

---

## Self-Review Result

### Spec coverage

Covered in this plan:

- explicit product identities before cross-product wiring;
- no aliases between Registro/Docente OS or Studio Atlas/Atlas;
- stateless `PROPOSE_ONLY` Core;
- Arena authority and `TRANSITIONAL` preservation;
- privacy class and recursive student-data exclusion;
- provider portability with two fake adapters;
- immutable semantic digest;
- product-local Human adoption receipt;
- Drive export deferred;
- no runtime, publication, consuntivo or assessment promotion;
- DOS-A1 unchanged.

Intentionally outside this plan:

- Docente OS adapter;
- Registro adapter;
- Studio Atlas seed adapter;
- Contextual Copilot dispatch wiring;
- Drive `WRITE_EXTERNAL` slice;
- live provider selection/credentials;
- UI/UX;
- runtime/deploy.

These require separate plans after DC-01 qualification.

### Type consistency

`curricoloContext` in requests maps to `curricoloBinding` in proposals. Product ids come exclusively from the DC-00 registry. `contentDigest` is always `sha256:<hex>` over the semantic payload defined in Task 4. Adoption receipts reference the exact `compositionId`, `compositionVersion` and `contentDigest` of one proposal.

### Execution boundary

This plan ends at **offline Core contract qualification**. It does not authorize or implement any consumer adapter or live effect.
