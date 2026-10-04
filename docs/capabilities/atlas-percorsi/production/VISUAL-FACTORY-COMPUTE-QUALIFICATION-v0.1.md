# Visual Factory — Compute Qualification v0.1

**State:** POLICY_COMPILER_PASS / ORCHESTRATOR_SELECTED / LIVE_PROVIDER_SET_PENDING  
**Date:** 2026-10-04

## Completed

- SkyPilot selected as provisioning/failover orchestrator.
- TRAMA Compute Policy defined.
- FREE_ONLY semantics defined independently from cloud list price.
- entitlement snapshot schema defined.
- deterministic compiler implemented.
- no-free-provider stop implemented.
- stale-snapshot stop implemented.
- no-paid-provider filtering tested.
- provider ordering by remaining bounded runs tested.
- SkyPilot ordered resource YAML generation tested.
- CI workflow `Visual Factory — Compute Policy v0.1`: PASS.
- Kaggle negative provisioning finding preserved as negative knowledge.

## Required before a live Q4 run

1. Identify at least one programmable SkyPilot-supported provider with demonstrable zero-marginal entitlement; two candidates are preferred to prove failover.
2. Implement provider-specific read-only entitlement adapter(s).
3. Produce fresh live entitlement snapshot.
4. Compile exact FREE_ONLY plan.
5. Run `sky check -o json`.
6. Run `sky launch --dryrun exact-task.yaml`.
7. Human Review exact plan/dry-run evidence.
8. Execute one bounded Q4 workload.
9. Preserve execution receipt/output hashes.
10. Prove failover separately with a controlled unavailable first candidate.

## Explicit non-blocker

Studio Atlas story/world/scene authoring does not wait for live provider qualification.

Only Visual Factory production requests enter **Produzione in attesa** when compute is unavailable.

## Provider-selection rule

Do not select a provider simply because it advertises a free tier.

Qualification requires:

- programmatic provisioning path compatible with the orchestrator;
- read-only entitlement visibility or conservative zero-cost proof;
- hardware profile suitable for the selected quality profile;
- stable enough execution for repeatable production.

## Current blocker class

`LIVE_PROVIDER_ENTITLEMENT_NOT_YET_BOUND`

This is not an architecture blocker. It is the next infrastructure qualification step.
