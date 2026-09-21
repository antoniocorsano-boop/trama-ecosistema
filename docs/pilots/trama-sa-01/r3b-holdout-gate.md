# TRAMA-SA-01/R3B — HOLDOUT one-shot gate

Gate state: **DEFINED / NOT EFFECTIVE UNTIL EXACT-HEAD HUMAN APPROVAL + MERGE**

## Purpose

This gate enables one independent provider attempt on the 16 preregistered R3B HOLDOUT cases.

The HOLDOUT corpus, prompt, boundary and model request contract remain unchanged.

## Preconditions

- R3B DEVELOPMENT completed;
- human adjudication completed;
- SA01-R3B-003 = PARTIAL recorded post-preregistration;
- DEVELOPMENT outcome: PASS_WITH_ONE_ADJUDICATED_ERROR;
- no HOLDOUT provider attempt has been claimed or executed.

## Authorized source revision

The workflow may load the R3B harness and corpus only from:

**33ad808ab02c42d68d4f5443452a65b274dc4ae2**

This revision is part of the final reviewed PR history and contains the hardened one-shot workflow plus the preregistered R3B source material.

The workflow itself is dispatchable only from the default branch main. An operator-selected feature branch is rejected before any provider call.

## Enforcement

The R3B harness remains fail-closed for HOLDOUT unless:

TRAMA_R3B_HOLDOUT_AUTHORIZED=true

Only the dedicated HOLDOUT workflow sets this value.

The workflow enforces all of the following before provider execution:

1. GITHUB_REF must be refs/heads/main;
2. the authorized source SHA must be a valid 40-character commit and an ancestor of the dispatch revision;
3. harness and corpus are checked out from the exact authorized source SHA;
4. the model request is fixed to jev-latest by the workflow;
5. the authorized source SHA must not already carry the durable consumption status context:
   trama-sa01/r3b-holdout-consumed.

## Durable one-shot semantics

Immediately before the provider step, after key/dependency/corpus validation, the workflow writes a persistent commit status on the authorized source revision:

trama-sa01/r3b-holdout-consumed = pending

From that moment the HOLDOUT is considered **consumed for provider-attempt purposes**. Any rerun or second dispatch finds the existing context and is rejected before provider calls.

After the provider step the same context is finalized to success, independently from the scientific outcome of the run. The workflow itself still fails if the provider step did not complete successfully.

This deliberately prefers HOLDOUT independence over automatic retry after a provider attempt has been claimed.

- failure **before** the claim may be retried;
- failure **after** the claim may not be retried automatically;
- any exceptional reset requires a new explicit human decision and a new authorized source revision.

## Evidence preservation

The raw HOLDOUT artifact upload runs with an unconditional status guard.

If the harness completes its case loop and writes a payload containing partial results or providerErrors, the artifact is uploaded even though the provider step returns non-zero.

This prevents loss of the only raw record of an already consumed HOLDOUT attempt.

## Effect of approval

Human approval must refer to the exact PR head containing this gate.

Merging that exact approved head authorizes:
- one HOLDOUT provider attempt;
- exactly 16 preregistered cases from the authorized source revision;
- advisory-only output;
- no runtime writes;
- human review after the run.

It does not authorize:
- tuning on HOLDOUT;
- a second HOLDOUT provider attempt;
- changing HOLDOUT cases;
- promotion of TRAMA-ADR-009;
- TypeSafe runtime in Arena, Atlas or Docente OS;
- DOS-A1.

## Invariants

- TRAMA-ADR-009 = PROPOSED;
- TypeSafe runtime = NOT_AUTHORIZED;
- DOS-A1 = RUNTIME_DEFERRED.
