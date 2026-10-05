# VF-GEN-01 — Visual generation quality gate

**Status:** IMPLEMENTED ON FEATURE BRANCH / RUNTIME VERIFICATION PENDING  
**Date:** 2026-10-05  
**Applies to:** Studio Atlas · Visual Factory v0.2  
**Baseline:** `main@0fbc7f879ab8fe8c7d2fac3eb9609ba896633683`  
**Complements:** VF-ORCH-01  
**Runtime/publication authority:** NOT GRANTED

## 1. Purpose

VF-GEN-01 prevents Studio Atlas from spending free-generation quota on a visual request that is incomplete, internally inconsistent or outside the canonical model policy.

The governing principle is:

> Prepare much; generate little.

VF-GEN-01 acts before VF-ORCH-01. It does not choose a provider and it does not grant runtime, learner or publication authority.

Canonical flow:

`Storytelling / Visual Bible → VisualGenerationPlan → VF-GEN-01 preflight → provider-neutral GenerationSpec → model-capability route → VF-ORCH-01 → free provider → candidate asset → Human Visual Review`

## 2. Boundary with VF-ORCH-01

### VF-GEN-01 owns

- semantic readiness before inference;
- prompt normalization;
- provider-neutral generation specification;
- canonical model-family enforcement;
- image-reference count and capability requirements;
- fail-closed rejection before provider calls.

### VF-ORCH-01 owns

- provider eligibility;
- zero-cost guard;
- HF ZeroGPU reserve;
- Cloudflare Workers AI admission;
- bounded fallback;
- provider attempt evidence;
- `GENERATION_DEFERRED` when no free provider is available.

VF-GEN-01 must not duplicate provider routing.

## 3. Canonical model policy

The current Visual Factory remains fixed to:

`workflowFamily = flux2-klein-4b/v0.2`

VF-GEN-01 therefore rejects any silent switch to another family with `MODEL_NOT_ALLOWLISTED`.

The model-capability router describes what the compiled job requires:

- no reference images → `TEXT_TO_IMAGE`;
- one reference image → `TEXT_TO_IMAGE + IMAGE_INPUT`;
- two to four references → `TEXT_TO_IMAGE + IMAGE_INPUT + MULTI_REFERENCE`.

This is capability routing, not provider routing.

## 4. Provider-neutral generation specification

A validated `VisualGenerationJob` is compiled into:

`atlas.provider-neutral-generation-spec/v0.1`

The specification records:

- job identity and purpose;
- subject / shot / scene identity where applicable;
- canonical workflow family;
- normalized positive prompt;
- normalized negative prompt;
- immutable copy of reference inputs;
- aspect ratio;
- bounded variant count.

Provider credentials, account state and provider-specific model identifiers do not enter this contract.

## 5. Preflight rules

A plan is `READY` only when all of the following hold:

1. `paidComputeAuthorized = false`;
2. `allowQualityDowngrade = false`;
3. `runtimeAuthorized = false`;
4. `publicationAuthorityGranted = false`;
5. plan decision matches the plan type;
6. no plan blocker exists;
7. the plan contains between one and six jobs;
8. each job satisfies the common runtime contract before any field-specific operation is attempted;
9. job identifiers are unique;
10. every job has a non-empty positive prompt;
11. every job has at least one non-empty negative constraint;
12. the workflow family is exactly `flux2-klein-4b/v0.2`;
13. aspect ratio is currently `3:4` or `4:3`;
14. variant budget is an integer between 1 and 3;
15. no job contains more than four image references;
16. canonical reference jobs contain a subject identity;
17. scene jobs contain `shotId`, `sceneRef` and at least one locked reference input.

Malformed common job fields produce `JOB_CONTRACT_INVALID` rather than an exception. Any violation produces `BLOCKED`; provider orchestration must not start.

## 6. Failure semantics

The web execution boundary returns:

- `400 INVALID_VISUAL_GENERATION_PLAN` for malformed outer contracts;
- `422 VISUAL_GENERATION_PREFLIGHT_BLOCKED` for plans that reach VF-GEN-01 but fail its semantic or job-level contract.

The manual runner fails before provider eligibility or inference with:

`VF_GEN_PREFLIGHT_BLOCKED:<ISSUE_CODES>`

No provider call is permitted after a blocked preflight.

## 7. Multi-reference constraint

The current canonical production path admits at most four reference images per job.

This matches the present MUSEO ZERO shot design, where a frame may combine up to:

- Lia;
- Omar;
- Teo;
- Sala Zero or Cabina regia.

A fifth reference is fail-closed and requires a future explicit design change rather than silent truncation.

## 8. Evidence in dry-run mode

The existing VF-ORCH dry run now exposes a credential-free summary of VF-GEN-01:

- preflight status;
- compiled job identity and purpose;
- workflow family;
- model policy;
- required capabilities;
- reference count.

Prompts, credentials and provider secrets are not added to this summary.

## 9. Tests

The focused test surface proves:

1. canonical reference plans compile;
2. scenes with multiple locked references require multi-reference capability;
3. scene generation without locked references is blocked before inference;
4. non-canonical model families are blocked;
5. more than four references are blocked;
6. duplicate jobs are blocked;
7. authority escalation is blocked;
8. prompt compilation normalizes content without mutating source reference arrays;
9. model routing cannot silently change the canonical family;
10. malformed job contracts are blocked without throwing before inference.

A local independent harness verified the same behavior RED → GREEN without depending on GitHub Actions.

Repository-wide `npm test`, `npm run typecheck` and `npm run build` remain pending while the Actions/runtime execution path is unavailable.

## 10. Non-goals

VF-GEN-01 does not:

- add FLUX.1 or another preview model;
- alter the HF → Cloudflare → deferred provider policy;
- create paid fallback;
- generate or lock canonical references automatically;
- accept generated images automatically;
- publish assets;
- grant learner/runtime authority;
- replace Human Visual Review.

## 11. State semantics

Until repository-wide verification becomes executable, the correct status is:

`IMPLEMENTED / FOCUSED_RED_GREEN_VERIFIED / REPOSITORY_WIDE_VERIFICATION_PENDING`

This status must not be promoted to runtime-qualified or product-qualified on the basis of static implementation alone.
