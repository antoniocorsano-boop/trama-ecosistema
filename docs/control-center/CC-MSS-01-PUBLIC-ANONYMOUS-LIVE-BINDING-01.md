# CC-MSS-01 — PUBLIC-ANONYMOUS-LIVE-BINDING-01

Status: CANDIDATE / OFFLINE QUALIFICATION ONLY / LIVE NOT AUTHORIZED

## Purpose

Bind a future manual GitHub Actions `LIVE_ONE_SHOT` to an explicit, short-lived, single-use human authorization envelope without adding credentials to the collector.

## Envelope

The binding is closed-world and requires:

- `runtimeMode = LIVE_ONE_SHOT` by contract;
- unique `authorizationRef`;
- unique `runId`;
- exact reviewed implementation SHA;
- exactly the four ENROLLED repositories;
- exactly `repo.read/ref.read/commit.read/pr.read`;
- `principalRef = PUBLIC_ANONYMOUS`;
- `evidenceDestination = LOCAL_EPHEMERAL_ONLY`;
- UTC issue/expiry window no longer than 30 minutes.

Any mismatch is DENY.

## Anti-replay

The future job uses a job-local claim marker created with `O_CREAT|O_EXCL` and mode 0600. The claim is bound to authorizationRef + runId + exactSha and transitions only to CONSUMED or FAILED. A duplicate claim in the same execution context fails closed.

The job-local claim is not a substitute for human authorization; it only prevents reuse/concurrency after an explicit authorization envelope has been admitted.

## GitHub Actions boundary

This tranche deliberately does **not** add the executable live workflow. The future live workflow will be a separately reviewed change. Its orchestration may use authenticated `workflow_dispatch`, but the collector step must:

- run with no `GITHUB_TOKEN`/`GH_TOKEN` in its environment;
- use `persist-credentials: false` for checkout;
- perform anonymous GETs only;
- claim the envelope before any network emission;
- close the claim CONSUMED/FAILED deterministically;
- keep observation evidence local/ephemeral unless separately promoted.

No GitHub App, PAT or bearer token is introduced.
