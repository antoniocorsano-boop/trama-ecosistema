# QE-01 Requalification v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare a current, fail-closed QE-01 requalification package from the integrated TRAMA v1.2 baseline without authorizing or executing a model invocation.

**Architecture:** A machine-readable requalification manifest records the prior failed attempt, the currently viable public provider/model candidate, and the gates that must be re-observed locally. A deterministic validator and adversarial tests prevent stale authority, stale provider bindings, mutation, personal-student-data use, retries, or executable state from leaking into the package. A human-readable dossier explains the residual local step and the exact future Human Review boundary.

**Tech Stack:** JSON, Python 3.12 `unittest`, GitHub Actions Governance.

**Spec:** `docs/contracts/trama-qualified-execution-readiness-contract-v0.md`

## Global Constraints

- Baseline: `main@36e7f105070ab69c09930ad27c64f05962ec170b` (Audit v1.2 / 2026-10-05).
- Capability: `lesson.preparation.observe`, mode `PROPOSE_ONLY`.
- `oneShot=true`, `maxRetries=0`, mutation forbidden.
- No personal student data, profiles, tracking, or secret material in evidence.
- Control Center remains `READ_ONLY`; `DOS-A1=RUNTIME_DEFERRED`.
- PR #212 and its prior Human Review SHALL NOT be treated as current authorization.
- Prior failed execution evidence SHALL be preserved: observed route `deepseek-official`, expected provider `nvidia`, failure class `STALE_BINDING`, provider error `MISSING_CREDENTIAL`, no model invocation.
- Current package SHALL remain `executable=false` and SHALL NOT authorize network/model execution.
- Provider/model public availability is static evidence only; local runtime, adapter version, route, credential reference, exact execution target, and new Human Review must be re-observed before any future execution.
- No secret value may be stored in repository content or logs.

## Review Focus

- Stale provider route: a non-`nvidia` locally observed route must keep the package blocked.
- Adapter drift: the old `0.1.5-rc.3` claim must not be accepted without fresh local observation.
- Credential ambiguity: historical credential probes must not count as current credential readiness.
- Authority leakage: no prior #212 approval may make the new package executable.
- Exact-head drift: future execution must require a newly frozen and human-reviewed target head.

---

### Task 1: Fail-closed requalification contract

**Files:**
- Create: `governance/runtime/qe01-requalification-v2.json`
- Create: `scripts/validate_qe01_requalification_v2.py`
- Create: `tests/test_qe01_requalification_v2.py`

**Interfaces:**
- Consumes: OR-09 readiness invariants and historical evidence from PR #212.
- Produces: `validate(data) -> list[str]` and a canonical non-executable requalification manifest.

- [ ] **Step 1: Write failing adversarial tests** for missing manifest/validator, executable state, non-zero retries, mutation/student-data allowance, stale authorization, and prematurely PASS local gates.
- [ ] **Step 2: Run Governance and verify RED** is caused only by the new QE-01 tests.
- [ ] **Step 3: Implement the minimal manifest and validator** that keep all local/execution authority gates blocked.
- [ ] **Step 4: Run focused tests and Governance; expect PASS.**
- [ ] **Step 5: Commit the GREEN package.**

### Task 2: Human-readable requalification dossier and permanent gate

**Files:**
- Create: `docs/runtime/QE-01-REQUALIFICATION-v2.md`
- Modify: `.github/workflows/governance.yml`

**Interfaces:**
- Consumes: Task 1 manifest and validator.
- Produces: durable operator guidance and an explicit Governance step.

- [ ] **Step 1: Add a regression assertion** that the dossier names all current blockers and explicitly forbids execution/authorization.
- [ ] **Step 2: Verify RED.**
- [ ] **Step 3: Add the dossier** with prior failure, current public provider/model observation, adapter-version drift warning, and future local re-observation checklist.
- [ ] **Step 4: Add explicit Governance validator/test steps and verify the full suite PASS.**
- [ ] **Step 5: Commit.**

### Task 3: Reconcile the stale #212 line

**Files:**
- PR metadata only; no runtime execution.

**Interfaces:**
- Consumes: qualified Task 1–2 branch head.
- Produces: one current Draft PR and a superseded historical #212.

- [ ] **Step 1: Open a Draft PR from `runtime/qe01-requalification-v2` to `main`.**
- [ ] **Step 2: Verify exact-head CI, review threads, and changed-file scope.**
- [ ] **Step 3: Mark PR #212 SUPERSEDED and close it without merge** only after the replacement PR is green.
- [ ] **Step 4: Leave the replacement PR `REQUALIFICATION_PREPARED / EXECUTION_NOT_AUTHORIZED`; do not merge or execute without a later Human Review.**
