# Visual Factory — Provider Qualification Matrix v0.1

**Status:** ACTIVE_QUALIFICATION_MATRIX  
**Date:** 2026-10-04  
**Policy:** FREE_ONLY

| Provider class | SkyPilot support | Read-only entitlement proof | Programmatic provisioning | v0.1 decision |
|---|---|---|---|---|
| Owned Kubernetes GPU | YES | allocatable GPU + operator/admin declaration of zero-marginal capacity | YES | **ADAPTER_SELECTED** |
| Azure with existing credits | YES | Azure Consumption Credits balance API | YES | **ADAPTER_SELECTED** |
| GCP with trial/promo credits | YES | billing/cost APIs exist, but remaining promo entitlement is not yet bound to a sufficiently simple canonical balance signal for this workflow | YES | **DEFER / UNKNOWN_FREE_ENTITLEMENT** |
| AWS with promotional credits | YES | AWS billing APIs exist, but v0.1 has not qualified a read-only remaining-credit path suitable for automatic FREE_ONLY admission | YES | **DEFER / UNKNOWN_FREE_ENTITLEMENT** |
| RunPod | YES | account/billing integration requires provider-specific balance qualification | YES | **DEFER** |
| Paperspace Free / Gradient | SkyPilot supports Paperspace, but the free plan is notebook-scoped | current Free-plan GPU is M4000 (8 GiB VRAM), below Q4 minimum 14 GiB | notebook/free path not qualified as SkyPilot production path | **REJECT_FOR_Q4_PROFILE** |
| Lambda / Vast / other GPU clouds | YES where supported | provider-specific credit proof required | YES | **DEFER** |
| Kaggle Free | NO canonical SkyPilot infra | quota visible, but empirical T4 request produced CPU runtime | notebook API | **NEGATIVE KNOWLEDGE / NOT_CANONICAL** |
| Colab Free | NO canonical SkyPilot infra | GPU assignment not stable/guaranteed | notebook runtime | **NEGATIVE KNOWLEDGE / NOT_CANONICAL** |

## Selection rationale

v0.1 does not attempt to support every provider.

It qualifies provider **classes** that have a clear proof chain:

`credential readiness → zero-marginal entitlement → hardware envelope → SkyPilot dry-run → bounded launch`.

Azure and owned Kubernetes cover the two important cases:

1. **credit-covered programmable cloud**;
2. **already-owned zero-marginal GPU capacity**.

This is enough to prove the orchestrator architecture without building a provider zoo.

## Azure

Required read-only facts:

- authenticated Azure account;
- billing account/profile identifiers;
- current credit balance;
- expiration/eligibility where available;
- SkyPilot Azure credential readiness;
- SkyPilot dry-run hourly cost for the exact resource plan.

The adapter computes a conservative number of bounded runs from:

`available eligible credit / dry-run upper-bound cost per run`.

If any input is unavailable:

`estimatedRunsRemaining = 0`.

## Owned Kubernetes

Required read-only facts:

- kubeconfig/context;
- GPU node/device-plugin availability;
- allocatable accelerator profile;
- RAM/disk envelope;
- explicit operator declaration that use is zero-marginal-cost for TRAMA.

Kubernetes capacity is not considered free merely because SkyPilot prints 0.00. The TRAMA entitlement adapter must also hold the explicit zero-marginal authorisation.

## GCP

GCP remains an orchestration candidate, not a FREE_ONLY candidate, until a robust account-specific credit/entitlement source is bound.

The presence of a Google Cloud billing account or free-trial eligibility is insufficient on its own.

## Admission rule

No provider moves from DEFER/UNKNOWN to eligible without:

- read-only entitlement evidence;
- SkyPilot credential check;
- exact dry-run;
- bounded run estimate;
- Human Review of the qualification evidence.


## Live discovery — 2026-10-04

GitHub Actions run:

`37210057324`

Exact source head:

`cf049b07ff4e43de7784217a87434c7b8c65cbfb`

Artifact:

`visual-factory-provider-discovery` / `11305939644`

Observed without provisioning:

- Azure: `NOT_CONFIGURED`
  - reason: `REQUIRED_GITHUB_SECRET_OR_VARIABLE_MISSING`
- owned Kubernetes: `NOT_CONFIGURED`
  - reason: `KUBECONFIG_OR_ZERO_MARGINAL_AUTHORIZATION_MISSING`
- computeProvisioned: `false`

Interpretation:

No live SkyPilot-compatible FREE_ONLY provider is currently bound to the repository.

This is an infrastructure qualification state, not a Visual Factory architecture failure.
