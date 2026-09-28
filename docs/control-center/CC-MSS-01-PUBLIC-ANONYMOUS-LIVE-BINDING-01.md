# CC-MSS-01 — PUBLIC-ANONYMOUS-LIVE-BINDING-01

Status: CANDIDATE / OFFLINE QUALIFICATION ONLY / LIVE NOT AUTHORIZED

## Purpose

Bind one future manually authorized GitHub Actions `LIVE_ONE_SHOT` to a unique workflow invocation without adding credentials to the collector.

## Two-level authorization model

**Human authorization** is the decision to issue one new dispatch. It binds:
- fresh `authorizationRef`;
- exact reviewed implementation SHA;
- exactly the four ENROLLED repositories;
- exactly `repo.read/ref.read/commit.read/pr.read`;
- `principalRef=PUBLIC_ANONYMOUS`;
- `evidenceDestination=LOCAL_EPHEMERAL_ONLY`;
- UTC validity window <= 30 minutes.

**Executable receipt** exists only after that decision is admitted into a GitHub Actions invocation. It additionally binds:
- GitHub Actions `run_id`;
- `run_attempt=1`;
- receiptRef = `<authorizationRef>--gha-<run_id>`.

A workflow rerun has the same run_id but a run_attempt > 1 and is therefore DENY.

A new workflow_dispatch has a new run_id and is a **new issuance event**, not a resume/replay. Governance requires a fresh explicit human authorization and fresh authorizationRef before such a dispatch may be created.

## Anti-replay

Two mechanisms are deliberately distinct:
1. **cross-run identity:** GitHub Actions run_id + mandatory run_attempt=1 rejects reruns;
2. **intra-run atomic claim:** job-local `O_CREAT|O_EXCL` marker prevents duplicate/concurrent claims inside the one admitted run.

The local claim is not falsely presented as a cross-run persistent ledger.

## GitHub Actions boundary

This tranche deliberately does **not** add the executable live workflow. A future live workflow is a separately reviewed change. Its orchestration may use authenticated `workflow_dispatch`, while the collector must:
- use `actions/checkout` with `persist-credentials:false`;
- receive no `GITHUB_TOKEN` or `GH_TOKEN` in the collector environment;
- admit exact SHA + run_id + run_attempt before network emission;
- atomically claim the executable receipt before network emission;
- perform anonymous GETs only;
- finalize CONSUMED or FAILED deterministically;
- keep evidence local/ephemeral unless separately promoted.

No GitHub App, PAT or bearer credential is introduced.
