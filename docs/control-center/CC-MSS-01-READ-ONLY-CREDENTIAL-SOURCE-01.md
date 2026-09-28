# CC-MSS-01 — PUBLIC_ANONYMOUS_READ_ONLY SOURCE

Status: CANDIDATE / NO SECRET / NO TOKEN / NO LIVE AUTHORIZATION

## Decision

GitHub App and personal/access tokens are excluded for this collector path.

The enrolled ecosystem repositories are public. The governed source model is therefore:

PUBLIC_ANONYMOUS_READ_ONLY

No credential material is required or permitted.

## Boundary

A valid anonymous observation requires:

- repository is explicitly ENROLLED;
- repository is verified public immediately before observation;
- provider identity is fixed to github-public-anonymous;
- principalRef is PUBLIC_ANONYMOUS;
- authority is api.github.com over HTTPS;
- method is GET only;
- operation is one of repo.read, ref.read, commit.read;
- path is predetermined and bound to the enrolled repository;
- redirects are DENY;
- Authorization header is absent;
- Cookie header is absent;
- environment proxy inheritance is disabled;
- no token, secret, Git credential helper, .env, shell or subprocess is used.

## Fail-closed conditions

Observation is denied on:

- non-public or unverifiable repository state;
- repository not enrolled;
- operation outside the read-only allowlist;
- arbitrary URL/path injection;
- any Authorization/cookie/proxy capability;
- redirect;
- mutation/write operation;
- source ambiguity.

## Relation to M1-A / M1-B

This source reuses the already qualified M1-A transport constraints and the Stage C repository enrollment allowlist.

M1-B receipt, exact-head binding, request budget, resource limits, anchor open/close and evidence lifecycle remain mandatory for a LIVE_ONE_SHOT.

This tranche does not execute network traffic and does not authorize live operation.
