# CC-MSS-01 — CredentialProvider / ACTIONS_EPHEMERAL_TOKEN — Offline Qualification Contract

Status: CANDIDATE / OFFLINE_ONLY / LIVE NOT AUTHORIZED

Baseline: PR #118 qualified offline boundary at `d9a1b0160f2b75c72bf09369fa43ad3c324030eb`.

## Purpose

Qualify an alternative credential-provider contract for a future `LIVE_ONE_SHOT` without provisioning a dedicated GitHub App. This stage is deliberately non-live: it MUST NOT add a `workflow_dispatch` live probe, consume `github.token`, read `GITHUB_TOKEN`, contact GitHub APIs, or materialize any credential.

## Provider abstraction

The M1-B security contract depends on provider-neutral invariants. A provider supplies only a request-scoped credential context after the separately governed one-shot receipt has been validated and atomically claimed.

Candidate providers:

- `ACTIONS_EPHEMERAL_TOKEN`: candidate for a bounded same-repository one-shot;
- `GITHUB_APP_INSTALLATION`: retained as a future provider for persistent/multi-repository Control Center observation.

Provider selection MUST NOT weaken receipt lifecycle, repository/exact-SHA binding, operation allowlist, permission attestation, principal binding, request budget, expiry, anchor-close, evidence boundary, or fail-closed behavior.

## ACTIONS_EPHEMERAL_TOKEN candidate invariants

1. Token origin is GitHub Actions' ephemeral job credential only; no PAT, App private key, installation token, repository secret or user-supplied token is accepted by this provider.
2. The eventual live job MUST declare an explicit least-privilege `permissions` block. Unneeded permissions MUST be absent/none.
3. The provider is limited to the repository in which the governed job executes. Cross-repository use is outside this candidate contract.
4. The candidate operations remain the closed set `repo.read`, `ref.read`, `commit.read` and map only to GET/read behavior.
5. The token MUST NOT be persisted to repository files, artifacts, caches, logs, outputs, comments or evidence.
6. Credential material MUST NOT enter the decision package. Only a non-secret provider/principal reference may be bound there.
7. The runtime credential context exists only after pre-network validation and atomic claim; it is invalidated on both success and failure.
8. `pull_request_target` is prohibited for the eventual live workflow.
9. Third-party actions in the credential-bearing job are prohibited unless separately reviewed and pinned by immutable commit SHA. The preferred live job uses repository code plus GitHub-maintained checkout/setup actions already governed by policy.
10. Evidence remains `LOCAL_EPHEMERAL_ONLY`; no upload/comment/check publication is authorized.
11. The provider does not itself authorize live execution. A separately complete package and explicit human `AUTHORIZE_LIVE_ONE_SHOT` receipt remain mandatory.
12. This offline qualification MUST keep `live=NOT_AUTHORIZED`.

## Offline qualification target

This stage may add only:

- provider profile/schema;
- offline validator;
- static capability audit;
- adversarial tests and simulations using synthetic opaque references;
- explicit CI gates for those offline checks.

It MUST NOT add an executable live workflow, token access, environment-secret access, network calls, workflow dispatch, remote persistence or a real authorization receipt.

## Decision criterion

The candidate is `QUALIFIED_OFFLINE` only if CI and independent adversarial review demonstrate that the provider-neutral M1-B invariants remain at least as strict as the current GitHub-App-oriented boundary. Offline qualification is not evidence that a live Actions workflow has been authorized or safely deployed.