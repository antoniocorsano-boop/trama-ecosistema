# TRAMA-SA-01/R3B — HOLDOUT one-shot gate

Gate state: **DEFINED / SOURCE PINNED / NOT EFFECTIVE UNTIL EXACT-HEAD HUMAN APPROVAL + MERGE**

## Purpose

Prepare one independent provider attempt on the 16 preregistered R3B HOLDOUT cases without changing corpus, prompt, boundary or semantic labels.

## Required guarantees

Before the gate can become effective:

1. dispatch must be accepted only from main;
2. harness and corpus must be checked out from an exact authorized source SHA;
3. the source SHA must be an ancestor of the dispatch revision;
4. a durable commit-status marker must block reruns after provider-attempt claim;
5. the model request must remain fixed;
6. raw output must be uploaded with an unconditional status guard;
7. provider failure must not erase partial/error evidence;
8. exact-head human approval is required after the source SHA is pinned.

## One-shot semantics

The provider attempt is claimed only after:
- source verification;
- TypeSafe key presence;
- dependency installation;
- corpus validation.

At claim time the workflow writes the durable context:

trama-sa01/r3b-holdout-consumed

Any later dispatch or rerun finding that context is rejected before provider calls.

This deliberately protects HOLDOUT independence. A failure after claim requires a new explicit human decision; it is not auto-retried.

## Current state

The authorized source revision is:

c2595b7354f68ffdd383c71fc253014b01cbcb71

It is an ancestor of the final gate branch and contains the frozen harness/corpus plus the fail-closed HOLDOUT guard.

The HOLDOUT remains procedurally blocked until exact-head human approval and merge of the final PR.

## Invariants

- TRAMA-ADR-009 = PROPOSED;
- TypeSafe output = advisory-only;
- TypeSafe runtime = NOT_AUTHORIZED;
- DOS-A1 = RUNTIME_DEFERRED.
