# Visual Factory — SkyPilot Orchestrator v0.1

**Status:** ORCHESTRATOR_SELECTED / EXECUTION_NOT_YET_AUTHORIZED  
**Date:** 2026-10-04  
**Selected orchestrator:** SkyPilot

## Role

SkyPilot is the provisioning/failover layer beneath TRAMA Compute Policy.

It is not:

- an authoring product;
- a quality authority;
- a publication authority;
- a budget authority.

## Verified upstream capabilities

Current SkyPilot documentation/repository establishes:

- automatic provisioning failover on out-of-capacity and out-of-quota conditions;
- cross-region retry;
- cross-cloud retry to the next candidate;
- multiple candidate accelerators;
- `resources.ordered` and `resources.any_of`;
- explicit `resources.infra`;
- autostop/autodown;
- workdir pinned to a Git ref/commit.

These capabilities match the Visual Factory's provider portability requirement.

## TRAMA orchestration sequence

`VisualProductionRequest`
→ `entitlement adapters`
→ `ComputeEntitlementSnapshot`
→ `TRAMA Compute Policy compiler`
→ `ComputePlan`
→ `SkyPilot resource YAML`
→ `SkyPilot launch`
→ `provider provisioning/failover`
→ `execution receipt/assets`

## Failover boundary

SkyPilot receives **only candidates already approved by Compute Policy**.

It may fail over because of:

- capacity;
- quota;
- region failure;
- provider provisioning failure.

It may not discover an unapproved paid provider outside the compiled plan.

## Workload reproducibility

A production execution must eventually pin:

- exact Studio/Factory request digest;
- exact workload code ref;
- model/artifact hashes;
- quality profile;
- resource plan;
- provider selected;
- SkyPilot version;
- output hashes.

## Cluster lifecycle

Visual Factory jobs are bounded batch jobs.

Default direction:

- one node;
- no inbound ports;
- minimal disk profile required by the workload;
- autodown after completion/short idle;
- no persistent general-purpose creator VM.

## Secrets

Provider credentials remain in CI/orchestration secret storage.

They are never:

- added to the Pathway Authoring Package;
- exposed to Studio Atlas;
- committed to Git;
- passed into learner assets.

## Current implementation boundary

v0.1 implements deterministic policy compilation and SkyPilot resource-plan generation.

It does **not yet launch a real SkyPilot provider**, because no production provider credential/entitlement set has been qualified for this branch.

This is intentional: provider onboarding follows the policy rather than preceding it.

## Next qualification

1. qualify at least two programmable SkyPilot-supported providers or one provider plus owned/Kubernetes capacity;
2. add read-only entitlement adapters;
3. compile a live `FREE_ONLY` plan;
4. Human Review exact plan;
5. execute one bounded Q4 smoke run;
6. verify failover using a controlled unavailable first candidate;
7. store receipt.

No paid run is implied by qualification.
