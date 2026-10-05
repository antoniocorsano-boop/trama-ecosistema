# VF-ORCH-01 — Visual Factory zero-cost multi-provider orchestrator

**Status:** PROPOSED DESIGN / HUMAN REVIEW REQUIRED  
**Date:** 2026-10-05  
**Applies to:** Studio Atlas · Visual Factory v0.2  
**Repository slice:** PR #233 / `feat/visual-factory-generation-v0.2`  
**Runtime/publication authority:** NOT GRANTED

## 1. Purpose

VF-ORCH-01 extends the existing Visual Factory executor boundary without creating a second generation system.

The existing flow remains:

`Studio Atlas → compiled VisualGenerationPlan → same-origin /api/visual-factory/execute → provider executor → VisualExecutionReceipt → Human Visual Review`

The change replaces the current single configured executor with a bounded provider chain that preserves the existing invariants:

- `costClass = FREE_ONLY`;
- `paidComputeAuthorized = false`;
- `allowQualityDowngrade = false`;
- no automatic publication/runtime authority;
- no provider credential in the browser;
- no production shot before human-locked character/environment references;
- no unbounded retry loop.

## 2. Shared understanding and success criteria

The immediate product goal is to produce real visual references for Lia, Omar, Teo, Sala Zero and Cabina regia, then F1–F6, without spending money and without making the system depend on one opportunistic GPU provider.

VF-ORCH-01 is successful when:

1. Hugging Face ZeroGPU remains available for high-priority reference generation while its free quota is protected.
2. Cloudflare Workers AI can execute the same canonical `FLUX.2 [klein] 4B` workload when it is independently proven FREE_ONLY.
3. Provider exhaustion, 429, timeout, capacity failures or malformed responses cause a bounded transition to the next eligible provider.
4. If no provider remains eligible, the result is `GENERATION_DEFERRED` / existing product state `WAITING_FOR_COMPUTE`, not a pipeline crash and never a paid fallback.
5. Every provider attempt is recorded for Human Visual Review.
6. GitHub Actions can run the same orchestration logic through an explicit manual execution path using repository secrets.

## 3. Approaches considered

### A. Extend the existing Studio Atlas gateway — selected

Add a provider-neutral orchestrator behind the existing same-origin route. The route and a GitHub Actions runner script reuse the same TypeScript orchestration module.

**Advantages:** minimal architectural drift; one contract; existing UI/store unchanged; provider secrets remain server-side; GitHub Actions and Studio Atlas share provider-selection logic.

**Cost:** the current executor module must be split into orchestration policy plus provider adapters.

### B. New standalone orchestration microservice — rejected for v0.1

A separate service would centralise provider routing but adds deployment, authentication and availability concerns before the first five canonical references exist.

### C. GitHub-Actions-only orchestration — rejected

This would satisfy batch execution but duplicate logic outside Studio Atlas and break the current author workflow `generate → review → lock → generate scenes`.

## 4. Canonical provider chain

### 4.1 CANONICAL_REFERENCE

Applies to `CHARACTER_REFERENCE` and `ENVIRONMENT_REFERENCE` jobs for Lia, Omar, Teo, Sala Zero and Cabina regia.

Order:

1. **Hugging Face ZeroGPU / FLUX.2 [klein] 4B**, only when the ZeroGPU quota guard admits the run.
2. **Cloudflare Workers AI / `@cf/black-forest-labs/flux-2-klein-4b`**, only when the account is explicitly admitted as Workers Free and current free allocation is considered sufficient by policy.
3. `GENERATION_DEFERRED` / `WAITING_FOR_COMPUTE`.

No third provider enters VF-ORCH-01. AI Horde remains a later qualification candidate; Pollinations and Gemini image generation remain outside the automatic zero-cost chain until separately qualified.

### 4.2 SCENE_FRAME

F1–F6 retain the same canonical model family and locked image references.

During the initial five-reference qualification, ZeroGPU quota is reserved for missing canonical references. Therefore scene generation prefers Cloudflare first whenever Cloudflare is eligible. After all five reference locks exist, the policy may admit ZeroGPU for scenes if sufficient free quota remains.

### 4.3 DRAFT_BULK

Non-canonical drafts, experiments and preview assets prefer Cloudflare. They may consume ZeroGPU only when the quota remaining is above the protected reserve for unfinished canonical references.

VF-ORCH-01 does not create new learner/publication authority for draft assets.

## 5. Model continuity

The v0.2 Visual Factory currently fixes `workflowFamily = flux2-klein-4b/v0.2` and forbids silent model-family changes.

Cloudflare Workers AI now exposes `@cf/black-forest-labs/flux-2-klein-4b`, including text-to-image and image-input support. Therefore the HF→Cloudflare fallback can preserve the canonical model family instead of degrading to FLUX.1 or SDXL.

The model allowlist is explicit:

- HF executor: `black-forest-labs/FLUX.2-klein-4B`;
- Cloudflare executor: `@cf/black-forest-labs/flux-2-klein-4b`.

Any other model is `MODEL_NOT_ALLOWLISTED` and cannot run automatically.

## 6. Zero-cost guard

Provider eligibility is evaluated before any inference call.

### Hugging Face

Required:

- `HF_TOKEN` present only as server/GitHub secret;
- configured private ZeroGPU Space;
- authenticated account quota readable;
- base included quota remaining is sufficient for the bounded attempt;
- over-quota/credit-backed execution is not admitted;
- one automatic HF inference attempt per orchestration cycle.

The guard uses remaining ZeroGPU quota expressed in GPU-seconds. It must not assume a midnight reset.

### Cloudflare

Required:

- `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` only as server/GitHub secrets;
- explicit repository/server configuration that the target account is admitted as **Workers Free** for this workflow;
- exact model on the allowlist;
- no AI Gateway unified-billing/prepaid-credit path;
- no paid-plan overage path authorised by VF-ORCH-01.

If plan/free-allocation status cannot be established strongly enough, Cloudflare is `PROVIDER_INELIGIBLE`; the orchestrator does not infer that a token means free usage.

### General rule

`unknown cost state → provider ineligible`

There is no `try and see whether it bills` behaviour.

## 7. Hugging Face quota reserve

The initial reserve protects the five unfinished canonical references.

For each completed real generation, store measured GPU-seconds. Compute a conservative duration estimate:

`estimated_reference_seconds = max(configured_floor, p95(measured_reference_gpu_seconds))`

Then:

`protected_reserve = unfinished_reference_count × estimated_reference_seconds + safety_margin_seconds`

Rules:

- canonical reference may use HF if `remaining >= estimated_attempt + reserve_for_other_unfinished_references`;
- scene/draft may use HF only if `remaining - estimated_attempt >= protected_reserve`;
- one HF attempt per orchestration cycle;
- a quota/queue/capacity failure immediately yields the next provider candidate;
- no automatic HF retry consumes the reserve.

Until enough measurements exist, use a conservative configured floor rather than inventing a p95.

## 8. Fallback state machine

Each provider attempt returns one of:

- `SUCCEEDED`;
- `RETRYABLE_PROVIDER_FAILURE`;
- `PROVIDER_EXHAUSTED`;
- `PROVIDER_INELIGIBLE`;
- `LICENSE_BLOCKED`;
- `PERMANENT_FAILURE`.

Fallback-eligible conditions include:

- HTTP 429;
- provider quota exhausted;
- timeout;
- transient 5xx;
- capacity/queue exhaustion;
- provider unavailable;
- malformed provider response.

Cost/authority/license failures are not retried on the same provider.

The orchestrator iterates over a precomputed bounded candidate list exactly once. No recursion and no provider loop are allowed.

When all candidates are exhausted:

`GENERATION_DEFERRED → VisualExecutionReceipt.status = WAITING_FOR_COMPUTE`

The authoring state is preserved.

## 9. Components

### `visual-factory-orchestrator.ts`

Pure orchestration policy:

- classify workload;
- compute provider order;
- run zero-cost guard;
- enforce model allowlist;
- enforce attempt bounds;
- collect attempt evidence;
- return one normalised VisualExecutionReceipt.

All network/provider functions are injected for deterministic tests.

### `visual-factory-provider-hf.ts`

Adapter around the existing Gradio ZeroGPU path plus quota preflight. It never owns fallback policy.

### `visual-factory-provider-cloudflare.ts`

Adapter for Workers AI `FLUX.2 [klein] 4B`.

Responsibilities:

- multipart request generation;
- reference-image inputs for scene jobs;
- bounded timeout;
- provider error classification;
- base64 image normalisation;
- SHA-256 calculation;
- provider/model/workflow provenance.

### Existing `/api/visual-factory/execute`

Becomes a thin server boundary:

1. validate VisualGenerationPlan;
2. build provider configuration from environment;
3. call orchestrator;
4. return normalised receipt.

### GitHub Actions runner

A small TypeScript command invokes the same orchestrator for `workflow_dispatch`.

It accepts only compiled plans and writes receipts/assets/manifests into an artifact directory. Pull-request CI remains deterministic and never performs live inference.

## 10. Evidence and Human Visual Review

VF-ORCH-01 adds orchestration evidence without weakening the existing execution receipt.

Each run records:

- orchestration ID;
- pathway/package digest;
- plan type;
- job IDs;
- workload class;
- provider candidates considered;
- provider/model selected;
- quota snapshot before/after when available;
- attempt start/end/duration;
- HTTP/provider outcome category;
- model/workflow ref;
- seed and dimensions where supplied;
- output SHA-256;
- fallback reasons;
- final status;
- authority flags, all false.

Successful assets remain candidates only. Human selection/locking is still required for Lia/Omar/Teo/Sala Zero/Cabina regia, and scene assets remain pending visual review.

## 11. GitHub Secrets and variables

Secrets:

- `HF_TOKEN`;
- existing configured HF Space identity/URL as repository variable where non-secret;
- `CLOUDFLARE_API_TOKEN`;
- `CLOUDFLARE_ACCOUNT_ID` if treated as secret by repository policy.

Non-secret policy variables may include:

- explicit Cloudflare Workers Free admission flag;
- HF quota floor/safety margin;
- provider timeouts;
- feature gate enabling live orchestration.

No credential is written into artifacts, logs, workflow summaries or browser payloads.

## 12. GitHub Actions modes

### Pull request

Deterministic only:

- unit tests;
- provider adapter contract tests with fixtures;
- zero-cost guard tests;
- model allowlist tests;
- fallback-state tests;
- workflow syntax/static secret checks.

### `workflow_dispatch`

Explicit live mode:

- `dry-run`: compile provider eligibility and evidence; no inference;
- `references`: compile remaining canonical references and execute bounded orchestration;
- `shots`: allowed only after reference-lock input is supplied and validates.

Live execution uploads evidence as GitHub artifact and never commits generated media automatically.

## 13. Failure and publication semantics

Technical execution is fail-soft; publication is fail-closed.

- No free provider → `WAITING_FOR_COMPUTE`.
- Generated asset → candidate only.
- Human lock/review → author decision only.
- No generated asset or receipt grants learner/runtime/publication authority.
- No automatic merge, deployment to learner runtime or product-review PASS.

## 14. Testing strategy

Tests must prove at least:

1. HF is first for unfinished canonical references when quota is safe.
2. HF is skipped when using it would invade protected reserve.
3. Cloudflare becomes the next eligible provider without changing `flux2-klein-4b/v0.2`.
4. 429/timeout/5xx/capacity errors fall through exactly once.
5. paid/unknown cost state excludes a provider.
6. malformed output cannot become a candidate asset.
7. all-provider failure returns `WAITING_FOR_COMPUTE` while preserving false authority flags.
8. scene generation keeps locked reference inputs.
9. secrets cannot appear in receipts/log evidence.
10. deterministic PR CI performs no live inference.

## 15. Out of scope for VF-ORCH-01

- AI Horde execution;
- Pollinations execution;
- Gemini image generation;
- Colab/Kaggle as synchronous providers;
- paid Cloudflare Workers AI overage;
- HF paid/prepaid over-quota execution;
- automatic visual acceptance;
- durable publication storage;
- runtime/student authorization.

These require independent qualification or later increments.

## 16. Implementation boundary

The implementation must modify the existing PR #233 rather than introduce a new Visual Factory.

Expected code surface:

- `products/studio-atlas/lib/visual-factory-executor.ts`;
- new provider/orchestrator modules under `products/studio-atlas/lib/`;
- `products/studio-atlas/app/api/visual-factory/execute/route.ts`;
- focused tests under `products/studio-atlas/lib/`;
- a manual GitHub Actions execution path;
- documentation/evidence updates.

The existing Visual Bible, reference-lock logic, F1–F6 compiler and Human Review boundary remain authoritative and unchanged unless a test exposes a contract mismatch.
