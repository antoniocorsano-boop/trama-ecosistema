# TRAMA-SA-01/R3B — HOLDOUT one-shot gate

Gate state: **DEFINED / NOT EFFECTIVE UNTIL EXACT-HEAD HUMAN APPROVAL + MERGE**

## Purpose

This gate enables one independent provider run on the 16 preregistered R3B HOLDOUT cases.

The HOLDOUT corpus, prompt, boundary and model request contract remain unchanged.

## Preconditions

- R3B DEVELOPMENT completed;
- human adjudication completed;
- `SA01-R3B-003 = PARTIAL` recorded post-preregistration;
- DEVELOPMENT outcome: `PASS_WITH_ONE_ADJUDICATED_ERROR`;
- no HOLDOUT case has been executed.

## Enforcement

The R3B harness remains fail-closed for HOLDOUT unless:

`TRAMA_R3B_HOLDOUT_AUTHORIZED=true`

Only the dedicated HOLDOUT workflow sets this value.

The dedicated workflow also requires:

`github.run_number == 1`

A second independent workflow dispatch therefore does not execute the HOLDOUT job. A retry of the same GitHub run remains possible for infrastructure failure without creating a new experimental run.

## Effect of approval

Human approval must refer to the exact PR head containing this gate.

Merging that exact approved head authorizes:
- one HOLDOUT provider run;
- exactly 16 preregistered cases;
- advisory-only output;
- no runtime writes;
- human review after the run.

It does not authorize:
- tuning on HOLDOUT;
- a second independent HOLDOUT run;
- changing HOLDOUT cases;
- promotion of `TRAMA-ADR-009`;
- TypeSafe runtime in Arena, Atlas or Docente OS;
- `DOS-A1`.

## Invariants

- `TRAMA-ADR-009 = PROPOSED`;
- TypeSafe runtime = `NOT_AUTHORIZED`;
- `DOS-A1 = RUNTIME_DEFERRED`.
