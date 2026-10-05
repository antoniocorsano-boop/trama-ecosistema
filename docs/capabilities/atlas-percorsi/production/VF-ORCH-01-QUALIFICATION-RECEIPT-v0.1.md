# VF-ORCH-01 — Qualification Receipt v0.1

**Date:** 2026-10-05  
**Scope:** zero-cost multi-provider Visual Factory orchestration  
**Branch:** `feat/visual-factory-generation-v0.2`  
**Authority:** NO_RUNTIME / NO_PUBLICATION / NO_STUDENT_AUTHORITY / NO_PAID_COMPUTE

## Decision

`DETERMINISTIC_QUALIFICATION_PASS / LIVE_ZERO_COST_EXECUTION_NOT_YET_PROVEN`

VF-ORCH-01 now has the bounded orchestration core, provider adapters, same-origin route, evidence model, dedicated runner and manual qualification workflow required to exercise `dry-run | references | shots` without granting new authority.

This receipt does **not** claim that a real Hugging Face ZeroGPU or Cloudflare Workers AI inference has succeeded. Trusted provider credential binding was not exercised by the deterministic qualification run.

## Proven implementation surface

- pure bounded provider orchestration;
- protected Hugging Face ZeroGPU quota reserve;
- HF adapter with authenticated quota preflight and no overquota admission;
- Cloudflare Workers AI adapter using exactly `@cf/black-forest-labs/flux-2-klein-4b`;
- explicit Workers Free admission guard;
- same-origin Studio Atlas execution route;
- provider-attempt evidence on successful and deferred receipts;
- `WAITING_FOR_COMPUTE` fail-closed state when no free provider is usable;
- `npm run visual-factory:orchestrate` runner;
- manual workflow modes `dry-run`, `references`, `shots`;
- artifact-only evidence output with no automatic asset commit or publication.

## TDD evidence

### RED

GitHub Actions run: `37308190087`  
Exact head: `47f96f3d6cd99aa5ecc64eed05112a2d2db7c891`  
Result: **FAILURE**

The job failed at `Require bounded orchestrator qualification surface` because the dedicated runner/workflow/script surface did not yet exist. Later qualification steps were skipped. This is the intended RED condition for Task 6.

### GREEN

GitHub Actions run: `37308776923`  
Exact head: `83a37ea3cd2843e1aa90ada5253c320e31d61c89`  
Result: **SUCCESS**

Passing evidence on the exact head:

- bounded orchestrator qualification surface: PASS;
- Studio Atlas unit tests: PASS;
- TypeScript typecheck: PASS;
- Studio Atlas production build: PASS;
- Python generation-plan tests: PASS;
- HF contract/deploy tests: PASS;
- five unlocked canonical reference jobs compile: PASS;
- unlocked scene production fails closed: PASS;
- locked F1–F6 shot plan compiles: PASS;
- executor safety inspection: PASS;
- HF deployment without explicit configuration is inert: PASS.

Documentation was subsequently reconciled on the same branch without changing the qualified orchestration code.

## Provider qualification state

### Hugging Face ZeroGPU

Implementation: `QUALIFIED_DETERMINISTICALLY`  
Live execution: `NOT_YET_PROVEN`

Admission requires configured Space/token, valid ZeroGPU quota, no overquota use and enough remaining quota after the protected reserve for unfinished canonical references.

### Cloudflare Workers AI

Implementation: `QUALIFIED_DETERMINISTICALLY`  
Live execution: `NOT_YET_PROVEN`

Admission requires configured account/token **and** explicit Workers Free admission. Missing or unknown free-plan status is ineligible. The adapter does not substitute another model or paid route.

## Manual workflow boundary

`.github/workflows/visual-factory-orchestrator-v0.1.yml` keeps `dry-run` credential-free. The workflow binds `HF_TOKEN` from GitHub Secrets and `HF_VISUAL_FACTORY_SPACE_REPO` from GitHub Variables only for live `references` / `shots` execution. Missing trusted binding fails closed before provider invocation.

This preserves the original safety boundary: repository content contains no secret values, provider credentials are not exposed to the browser or evidence receipts, deterministic CI does not consume the live binding, and no successful live provider run may be claimed until provenance-complete execution evidence exists.

## Invariants verified

- `costClass=FREE_ONLY`;
- `paidComputeAuthorized=false`;
- `allowQualityDowngrade=false`;
- `runtimeAuthorized=false`;
- `publicationAuthorityGranted=false`;
- each provider attempted at most once per orchestration cycle;
- no automatic visual acceptance;
- Human Visual Review/reference lock remains mandatory;
- student identity/telemetry are outside this execution path.

## Remaining completion proof

VF-ORCH-01 deterministic implementation is qualified, but Visual Factory product completion still requires the real governed sequence:

`Lia/Omar/Teo/Sala Zero/Cabina regia candidate generation → Human Visual Review → reference lock → F1–F6 generation → continuity review → learner integration`

Until the first trusted zero-cost provider run produces provenance-complete candidates, the live state remains:

`LIVE_ZERO_COST_EXECUTION_NOT_YET_PROVEN`

and the broader Visual Factory state remains:

`IMPLEMENTATION_ADVANCED / AUTOMATED_QUALIFICATION_AVAILABLE / REAL_VISUAL_RUN_PENDING`.
