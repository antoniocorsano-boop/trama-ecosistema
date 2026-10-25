# CAP-DIDACTIC-COMPOSER — DC-01 Offline Qualification Receipt

**Date:** 2026-10-25  
**Scope:** DC-00 governed product identities + DC-01 Didactic Composer Core  
**Qualified implementation candidate:** `782c8f9107ce68cfbe77b3a7680b2111bfcfd678`  
**PR:** #287  
**Qualification state:** `G4_IMPLEMENTED · G5_QUALIFIED_OFFLINE`  
**runtimeAuthorized:** `false`  
**DOS-A1:** `RUNTIME_DEFERRED`

## 1. Qualification result

The bounded implementation authorized by the Human Design Approval is qualified **offline** on the exact candidate SHA above.

The qualification does not authorize product adapters, live providers, external writes, Atlas publication, lesson execution, automatic recording, automatic assessment, merge or deploy.

## 2. Exact-SHA gates

- Governance #2609 / run `40236572694`: **SUCCESS** on `782c8f9107ce68cfbe77b3a7680b2111bfcfd678`.
- Build TRAMA Control Center Bundle #1080 / run `40236572519`: **SUCCESS** on the same exact SHA.
- The Governance run includes the dedicated DC-00 and DC-01 validators/tests and the repository-wide test suite.

## 3. DC-00 evidence

Governed product identity artifacts:

- `governance/runtime/governed-product-identities-v1.json`;
- `scripts/validate_governed_product_identities.py`;
- `tests/test_governed_product_identities.py`;
- `docs/contracts/trama-governed-product-identities-v1.md`.

Qualified identity set:

```text
ARENA
ATLAS
DOCENTE_OS
REGISTRO_DOCENTE
STUDIO_ATLAS
CONTROL_CENTER
```

`REGISTRO_DOCENTE` and `STUDIO_ATLAS` are first-class identities, not aliases. `OTHER_GOVERNED` and unknown products fail closed. Control Center remains `READ_ONLY`.

OR-07 is bound to the registry through `SC-11` for unregistered callers. OR-10 preserves its historical product evidence while verifying that every represented product is registered.

## 4. DC-01 evidence

Core qualification artifacts:

- `docs/contracts/trama-didactic-composer-contract-v1.md`;
- `governance/runtime/didactic-composer-v1-fixtures.json`;
- `scripts/validate_didactic_composer_v1.py`;
- `tests/test_didactic_composer_v1.py`.

The valid fixture uses two distinct fake provider/adapter provenances with identical semantic composition and identical SHA-256 content digest. The digest excludes provider/adapter identity, timestamps, receipt metadata and composition identity/version.

The valid request preserves an Arena context with:

```text
authorityState = APPROVED
vigencyStatus = VIGENTE
applicabilityStatus = TRANSITIONAL
```

The valid proposal remains `PROPOSAL`, preserves `TRANSITIONAL`, keeps `driveExport = DEFERRED_WRITE_SLICE`, and has `compositionVersion >= 1`.

The local adoption receipt requires `decidedBy = HUMAN` and accepts only `ADOPTED | REJECTED | SUPERSEDED`.

## 5. Fail-closed matrix

| Code | Invalid condition | Qualification behavior |
|---|---|---|
| `DC-01` | unknown caller | reject |
| `DC-02` | registered but unsupported caller | reject |
| `DC-03` | personal student data, including nested fields | reject |
| `DC-04` | Arena authority/context invalid | reject |
| `DC-05` | Arena context not `VIGENTE` | reject |
| `DC-06` | applicability outside `APPLICABLE | TRANSITIONAL` | reject |
| `DC-07` | missing `regimeRef` | reject |
| `DC-08` | Arena binding / `TRANSITIONAL` not preserved | reject |
| `DC-09` | state promoted beyond `PROPOSAL` | reject |
| `DC-10` | implicit write escalation / Drive write in Core | reject |
| `DC-11` | provider semantic drift | reject |
| `DC-12` | content digest mismatch | reject |
| `DC-13` | non-human or global adoption semantics | reject |
| `DC-14` | composition/provenance identity mismatch or non-positive version | reject |

Recursive privacy cases explicitly cover student name, id, email, grade, diagnosis and health data.

## 6. TDD evidence

The implementation was produced through causal RED → GREEN cycles:

1. ADR/document ratification RED on the governed document registry, then GREEN after `TRAMA-ADR-022` registration.
2. DC-00 identity tests RED because the registry validator did not exist, then GREEN after the minimal registry implementation.
3. OR-07 binding RED for unregistered callers, then GREEN after `SC-11` binding; a direct-script import defect was isolated and corrected without changing semantics.
4. DC-01 tests RED because the Core validator did not exist, then GREEN after the offline Core implementation.
5. Final contract self-review produced a micro-RED for `compositionVersion >= 1` and `SUPERSEDED`; both were corrected and the exact candidate returned GREEN.

## 7. Boundary after qualification

Qualified means **offline contract/core qualification only**.

The following remain outside this qualification and require a separate governed slice and, where applicable, Human Review:

- Docente OS product adapter;
- Registro Docente product adapter;
- Studio Atlas product adapter;
- live provider binding;
- Drive `WRITE_EXTERNAL`;
- Atlas publication;
- automatic lesson execution/consuntivo/assessment;
- DOS-A1 activation.

**Canonical state:** `DC-00 QUALIFIED · DC-01 QUALIFIED_OFFLINE · RUNTIME_NOT_AUTHORIZED`.
