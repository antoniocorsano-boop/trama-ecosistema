# TRAMA Compute Policy v0.1

**Status:** PROPOSED_CANONICAL_COMPUTE_POLICY / IMPLEMENTATION_CANDIDATE  
**Applies to:** Studio Atlas · Visual Factory  
**Runtime execution:** NOT_AUTHORIZED  
**Date:** 2026-10-04

## Decision

Visual Factory compute is split into two responsibilities:

`TRAMA Compute Policy → SkyPilot → authorised providers`

TRAMA decides **whether a provider may be tried**.

SkyPilot decides **where/how to provision among the providers TRAMA has allowed**.

## Why this split is required

SkyPilot natively provides:

- cross-region failover;
- cross-cloud failover;
- recovery from capacity/quota provisioning failures;
- ordered or unordered resource candidates;
- multiple accelerator candidates;
- price/capacity-aware resource optimisation.

However, SkyPilot's cloud price is not the same as the user's **effective marginal cost**.

For TRAMA, `FREE_ONLY` means:

> the next bounded Visual Factory run is covered by an already-authorised zero-marginal-cost entitlement, credit or owned capacity.

Therefore `FREE_ONLY` MUST be enforced before SkyPilot receives candidates.

SkyPilot's `max_hourly_cost` is not used to represent zero cost because the field requires a positive limit and because list price cannot prove that account credits/free entitlement cover the run.

## Eligibility

A provider is eligible only when all are true:

- provider is authorised;
- credentials/configuration are available;
- provider status is `AVAILABLE`;
- effective cost class is `ZERO_MARGINAL` or `CREDIT_COVERED`;
- estimated remaining entitlement can cover at least the policy minimum number of runs;
- system RAM meets the workload profile;
- disk meets the workload profile;
- at least one allowed accelerator meets minimum VRAM;
- entitlement snapshot is fresh enough;
- provider is in the allowlist when an allowlist is present.

Any missing condition excludes the provider before orchestration.

## Ordering

For v0.1, eligible providers are ordered deterministically by:

1. greatest `estimatedRunsRemaining`;
2. accelerator preference declared by policy;
3. stable provider ID tie-break.

Only the first `maxProviderAttempts` providers enter the SkyPilot resource list.

SkyPilot then handles real provisioning/capacity failover among those candidates.

## Failure semantics

If no provider is eligible:

`STOP_NO_FREE_PROVIDER`

This is a normal product state, not an error that authorises payment.

Studio Atlas should translate it as:

**Produzione in attesa**

Authoring continues.

## Quality boundary

The compute layer MUST NOT:

- downgrade Q4→Q3 automatically;
- change model family merely to fit available hardware;
- purchase credits;
- switch to a paid provider;
- exceed attempt bounds.

A quality-profile change requires a separate human decision.

## Provider snapshots

Provider adapters may collect:

- remaining free GPU hours;
- cloud credits;
- owned/on-prem capacity;
- account quota;
- credential readiness;
- supported GPU profiles.

Adapters normalise those provider-specific facts into:

`trama.compute-entitlement-snapshot/v0.1`.

The policy compiler does not scrape provider UIs.

## Consumer notebook providers

Colab Free and Kaggle Free remain diagnostic/opportunistic adapters.

They are not SkyPilot infrastructures and MUST NOT be represented as if SkyPilot could provision them.

Kaggle's empirical T4-request/CPU-runtime finding remains negative knowledge.

## Evidence

Every compiled plan records:

- policy ID;
- entitlement snapshot ID;
- eligible and excluded providers;
- exclusion reasons;
- selected ordered candidates;
- quality profile;
- cost mode;
- final decision.

The plan itself grants no runtime/publication authority.
