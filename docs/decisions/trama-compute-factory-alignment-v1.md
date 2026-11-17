# TRAMA — Compute Factory / CF-06B ALIGN

Date: 2026-11-17. Status: proposed for review; offline implementation slice. Runtime, cost and publication authority: NONE.

## Architectural decision
One production system, not three factories. This decision extends ADR-021 and does not supersede its FREE_ONLY gates or select a new provisioner. References: ADR-021; TRAMA-COMPUTE-POLICY-v0.1; VISUAL-PRODUCTION-CONTRACT-v0.1; TRAMA PR #338 (open at baseline); Atlas PR #105 (parallel work).

- Arena: authority over the curricolo; unchanged.
- Studio Atlas: educational intent, art direction, references, required quality and human acceptance.
- Atlas Smart Production: candidate lineage, dependency planning, cache/reuse and incremental production; its existing cache is the source of truth, not copied to Compute Factory.
- Visual Factory / Audio Factory and specialized engines: method, model, pipeline, quality requirements, licenses and engine qualification. The existing VF-3D registry and compiler retain selection authority. No silent substitution of model or quality.
- Compute Factory: shared capability for resource policy, bounded execution, admission, quota accounting, recovery and evidence. Extend the existing compiler and entitlement contract, do not introduce a competing registry or provider router.
- SkyPilot: existing selected provisioner for compatible, admitted infrastructure only; no automatic provisioning. Other execution adapters remain separate. Prefect is an unqualified optional workflow engine, not a second authority.
- Control Center: observe and review evidence; no implicit permission to execute.
- Atlas: consumes separately approved assets; no production receipt grants publication.

## Interface
Existing VisualProductionRequest / 3D child request -> existing specialized plan -> existing compute policy -> bounded execution (future, separately authorized) -> existing receipt -> quality review -> candidate -> separate publication gate.

Smart Production can first resolve a verified reusable candidate, otherwise request only the missing work. Its cache and quality decisions remain authoritative. Compute Factory does not assign artistic merit. CPU procedural production is a method option owned by the specialist; the compute layer cannot trade away quality to save GPU. Reuse requires exact lineage, rights and validation, not simply a matching name.

CF-06B.1 adds a pure offline handoff envelope over existing plan outputs. A 3D plan must bind its own digest, request digest, request ID and quality to the exact supplied request. A v0.1 compute plan does not contain a request digest: its association is explicitly POLICY_ONLY_UNBOUND; it can never be presented as a request-bound receipt. Both are review references only, not evidence of trusted origin, fresh entitlement, license or execution. No network, subprocess, provisioning or publishing. No changes to PR #338 or Atlas.

## Invariants
FREE_ONLY; paid fallback forbidden; unknown eligibility fails closed; no quality downgrade; no student personal data; no implicit account or service activation; bounded attempts; atomic reservations before any future execution; unknown outcome retains reservation and blocks retry until reconciliation; review separate from production; no publication authority; hashes identify bytes/objects but do not authenticate origin.

## Sequence
1. CF-06B.1: this decision, offline handoff and tests.
2. CF-06B.2: after #338 and Atlas candidate interfaces stabilize, bind real fixture outputs from both branches, reuse exact Smart Production cache metadata (no duplicate cache); reconcile compute entitlement units and atomic accounting; independent review.
3. CF-06B.3: connect one local procedural motor via the existing specialized registry, with isolated synthetic inputs; preserve CF-06A as lab evidence, not a second production core. First common pilot: Storie / Il libro vivente, respecting reference lock.
4. CF-07: independent qualification of security, authentication, provenance, concurrency, isolation and recovery. CF-05B remains blocked; no external execution.
5. CF-08: integration after explicit review; no automatic publication.

The CF-02–06A laboratory reports local tests only; those counts do not establish repository integration. No claim of external GPU capacity, actual admission or zero cost entitlement is made by this change.
