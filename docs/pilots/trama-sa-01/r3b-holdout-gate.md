# TRAMA-SA-01/R3B — HOLDOUT one-shot gate

Gate state: **DEFINED / CONTENT PINNED / NOT EFFECTIVE UNTIL EXACT-HEAD HUMAN APPROVAL + MERGE**

## Purpose

Prepare one independent provider attempt on the 16 preregistered R3B HOLDOUT cases without changing corpus, prompt, boundary or semantic labels.

## Immutable experiment content

The gate does not depend on a feature-branch commit becoming an ancestor of main.

Instead it verifies the exact Git blob identities of the experimental inputs before any provider call:

- r3b-cases.json: d161cc03f50d1777eaa58010419f3cc64aaa02a4
- run_trama_sa01_typesafe_r3b.py: 086fac2415238478d25311b2e74b444aafca21e6
- run_trama_sa01_typesafe_r2.py: 1c2f3ef60752f22ff1be5e346bdf62aaa945486a
- run_trama_sa01.py: f564092d3670dd39aac2d1db8e754b91afcffc34
- requirements/trama-sa01-typesafe.txt: 47d4db62b5f9d139f57b2b79b9a1ab665c749a27

A mismatch blocks the run before TypeSafe is called.

This content pin survives merge-commit, squash or rebase integration strategies.

## Stable one-shot anchor

Consumption is recorded on the immutable main-history commit:

72aa1a9919229120f69f9de41f877bb428d46897

using the unique commit-status context:

trama-sa01/r3b-holdout-consumed

The workflow verifies that this anchor is an ancestor of the dispatched main revision.

## Concurrency

All HOLDOUT runs share one GitHub Actions concurrency group:

trama-sa01-r3b-holdout-one-shot

with cancel-in-progress disabled.

Therefore overlapping dispatches cannot both pass the check-before-claim window. A later run waits for the active run and then observes the durable consumption marker.

## Claim semantics

The provider attempt is claimed only after:

- main-only dispatch verification;
- anchor verification;
- exact content verification;
- TypeSafe key presence;
- dependency installation;
- corpus validation.

Immediately before provider execution, the durable status marker is written.

From that moment the HOLDOUT is consumed even if the provider later errors or the workflow is interrupted.

A new attempt after claim requires a new explicit human decision and a new gate identity; it is never an automatic rerun.

## Evidence preservation

The provider step is continue-on-error only so that evidence can be preserved.

The raw artifact upload uses an unconditional status guard. If the harness writes partial results and providerErrors, those data are retained before the workflow enforces a final failure.

## Effect of approval

Exact-head approval and merge authorize the **availability of this one-shot gate**, not automatic execution.

A separate explicit operator action is required to dispatch the HOLDOUT workflow.

The gate does not authorize:

- tuning on HOLDOUT;
- a second provider attempt;
- promotion of TRAMA-ADR-009;
- TypeSafe runtime in Arena, Atlas or Docente OS;
- DOS-A1.

## Invariants

- TRAMA-ADR-009 = PROPOSED;
- TypeSafe output = advisory-only;
- TypeSafe runtime = NOT_AUTHORIZED;
- DOS-A1 = RUNTIME_DEFERRED.
