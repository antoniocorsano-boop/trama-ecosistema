# CC-MSS-01 — PUBLIC-ANONYMOUS-TRANSPORT-01

Status: CANDIDATE / OFFLINE QUALIFICATION ONLY / LIVE EXECUTION NOT PRESENT

Purpose: provide and qualify the concrete anonymous HTTP transport for the approved `PUBLIC_ANONYMOUS_READ_ONLY` source model.

Properties:
- GitHub-hosted Actions runner for qualification;
- optional manual `workflow_dispatch` exists **only** for `QUALIFY_OFFLINE`;
- no live collector step exists in this workflow;
- `api.github.com` only;
- GET only;
- no Authorization header, token, GitHub App or secret;
- environment proxies disabled in the transport;
- redirects rejected;
- bounded timeout and response size;
- finite request budget of exactly 6 calls per enrolled repository;
- two protected close calls per repository (`ref.read` + `pr.read`) may consume the reserved close budget;
- governed read-only operations: `repo.read`, `ref.read`, `commit.read`, `pr.read`;
- repository enrollment allowlist;
- repo identity/public check + open-ref/commit + PR-list/open + close-ref + PR-list/close;
- PR observation is required before the collection can be COMPLETE/CURRENT;
- PR pagination is bounded to one page of <100 open PRs per repository; saturation fails closed;
- default-branch anchor change or PR-set/head/draft change invalidates the run;
- candidate output is validated against `schemas/repository-observation.schema.json` before it can be written;
- output remains local/ephemeral; no upload, commit, PR comment, check publication or other remote persistence.

## Live boundary

This PR does **not** implement a live workflow path. Therefore `workflow_dispatch` cannot execute the collector and cannot substitute for a human authorization receipt.

A future live binding must be a separately reviewed exact-head change that:
1. binds a fresh single-use M1-B receipt to the reviewed exact head, enrolled repositories and operation set;
2. proves `PUBLIC_ANONYMOUS` and no credential material;
3. performs atomic claim before network emission;
4. enables exactly one collector run;
5. closes the receipt as CONSUMED or FAILED;
6. keeps evidence local/ephemeral unless separately promoted.

No previous authorization receipt may be reused.
