# CC-MSS-01 — PUBLIC-ANONYMOUS-LIVE-WORKFLOW-01

Status: CANDIDATE / EXECUTABLE WORKFLOW PRESENT / LIVE NOT YET AUTHORIZED

The executable workflow composes the qualified source, transport, collector and single-use binding.

The GitHub `workflow_dispatch` event is itself the human issuance event. No caller-supplied reusable authorizationRef exists. The executable receipt reference is derived from the unique GitHub Actions `run_id`.

A rerun has `run_attempt > 1` and is denied before checkout. Every fresh dispatch is a new human decision and a new issuance event.

## Bootstrap versus collector egress

GitHub Actions orchestration necessarily performs platform/bootstrap network activity before repository code can run, including provisioning and `actions/checkout`.

Normative boundary:
- platform orchestration/bootstrap is outside collector egress;
- checkout uses `persist-credentials:false` and read-only workflow permissions;
- atomic claim completes before any collector request to `api.github.com`;
- collector receives empty `GITHUB_TOKEN` and `GH_TOKEN`;
- proxy environment variables are cleared and transport uses empty ProxyHandler;
- collector requests remain anonymous GET only.

This distinction does not authorize arbitrary pre-claim network access from repository code.

## Exact-head binding

The workflow checks out `github.sha` explicitly and verifies `git rev-parse HEAD == github.sha`. That SHA is bound into the executable receipt before collector egress.

## Lifecycle

1. reject `run_attempt != 1`;
2. checkout exact workflow revision without persisted credentials;
3. verify exact head and absence of GitHub credential extraheader;
4. require `AUTHORIZE_LIVE_ONE_SHOT`;
5. derive authorizationRef from `run_id`;
6. admit exact head/repositories/operations/PUBLIC_ANONYMOUS/NONE/LOCAL_EPHEMERAL_ONLY;
7. atomically claim locally;
8. collect bounded anonymous RepositoryObservation;
9. schema validate and close anchors;
10. mark receipt CONSUMED or FAILED;
11. delete incomplete observation on failure.

No artifact upload, commit, comment, check publication or other application-level remote persistence is performed.

## Decision boundary

Merging this workflow makes the path technically executable but does not constitute a live run. An actual run requires a fresh explicit workflow_dispatch decision after exact-head review of the merged baseline.
