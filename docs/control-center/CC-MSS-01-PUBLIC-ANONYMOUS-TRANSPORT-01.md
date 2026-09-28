# CC-MSS-01 — PUBLIC-ANONYMOUS-TRANSPORT-01

Status: CANDIDATE / QUALIFICATION ONLY / LIVE EXECUTION SEPARATE

Purpose: provide the concrete anonymous HTTP transport for the already approved PUBLIC_ANONYMOUS_READ_ONLY source model.

Properties:
- GitHub-hosted Actions runner;
- manual workflow_dispatch only;
- api.github.com only;
- GET only;
- no Authorization header;
- GITHUB_TOKEN/GH_TOKEN cleared for the collector step environment;
- environment proxies cleared;
- redirects rejected;
- bounded timeout and response size;
- finite request budget;
- repository enrollment allowlist;
- open/ref/commit/pr-list/close anchor sequence;
- PR observation is required before the collection can be COMPLETE/CURRENT;
- PR pagination is bounded to one page of <100 open PRs per repository; saturation fails closed as INCOMPLETE_PAGINATION;
- anchor change invalidates the run;
- output only as short-lived workflow artifact;
- no commit, PR comment, check publication, workflow mutation or remote write.

The collector emits RepositoryObservation v1. The Project Knowledge builder may derive CURRENT only when every enrolled repository is AVAILABLE/FRESH/COMPLETE.

This PR qualifies the transport. It does not itself execute workflow_dispatch and does not reuse a previous authorization receipt.
