# Visual Factory — Compute Entitlement Adapter Contract v0.1

**Status:** IMPLEMENTATION_CONTRACT_CANDIDATE  
**Runtime:** READ_ONLY_ONLY  
**Date:** 2026-10-04

## Purpose

Provider-specific adapters translate account/provider facts into the neutral TRAMA Compute Entitlement Snapshot consumed by Compute Policy.

Adapters observe; they do not provision.

## Required separation

Three facts MUST remain distinct:

1. **credentialsAvailable** — can the orchestrator authenticate?
2. **status / capacity signal** — is the provider presently usable?
3. **effectiveCostClass / entitlement** — can the bounded run occur with no newly authorised spend?

A valid credential never implies free compute.

A displayed quota never implies actual capacity.

A provider's list price never implies the user's effective cost after credits/owned capacity.

## Adapter output

Each adapter emits one provider record containing:

- stable `providerId`;
- SkyPilot `skyInfra`;
- authorisation state;
- credential readiness;
- effective cost class;
- estimated bounded runs remaining;
- availability status;
- system RAM/disk envelope when known;
- accelerator profiles;
- evidence reference;
- observation time via the parent snapshot.

## Read-only rule

An entitlement adapter may:

- call account/quota/billing read APIs;
- call read-only provider CLI commands;
- inspect owned Kubernetes/Slurm capacity;
- verify credentials;
- calculate a conservative run estimate.

It may not:

- create instances;
- reserve GPUs;
- purchase credits;
- change quota;
- modify billing;
- run the Visual Factory workload.

## Estimated runs remaining

Provider-specific units are normalised to:

`estimatedRunsRemaining`

for the currently requested workload profile.

The estimate MUST be conservative.

Examples:

- free GPU hours / bounded estimated job duration;
- cloud credit balance / conservative maximum run price;
- owned capacity window / bounded job duration.

If a reliable estimate cannot be made:

`estimatedRunsRemaining = 0`

under `FREE_ONLY`.

Uncertainty fails closed rather than authorising spend.

## Freshness

Snapshots expire according to Compute Policy.

A stale entitlement snapshot results in:

`STOP_STALE_ENTITLEMENT_SNAPSHOT`.

## Evidence

Every provider record should link to provider/account evidence sufficient to explain:

- why it was eligible;
- why it was excluded;
- what quota/credit state was observed;
- when it was observed.

Secrets/tokens are never evidence payloads.

## SkyPilot credential probe

When provider adapters are configured, SkyPilot may additionally run:

`sky check -o json`

to report enabled/disabled infrastructure.

This supplements but does not replace entitlement/cost checks.

## Dry-run gate

After Compute Policy emits `PLAN_READY`, the generated exact task must pass:

`sky launch --dryrun <task.yaml>`

before any real launch.

Dry-run output becomes evidence for:

- resources considered;
- availability/cost representation;
- selected candidate.

TRAMA still enforces the FREE_ONLY candidate set independently.

## Initial adapter classes

Candidate adapter classes:

- owned Kubernetes capacity;
- owned/managed Slurm capacity;
- cloud account with existing credits;
- GPU cloud account with explicit credit/balance API.

Colab/Kaggle consumer notebook UIs are not treated as normal SkyPilot entitlement adapters unless a reliable programmatic provisioning contract is demonstrated.
