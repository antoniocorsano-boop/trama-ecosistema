# CC-MSS-01 — Public Anonymous Read-Only Source v1

Status: PROPOSED / OFFLINE QUALIFICATION / LIVE NOT AUTHORIZED

## Purpose

Provide a credentialless observation mode for enrolled **public** GitHub repositories.

This mode exists to avoid granting the collector a credential with write capability when the required repository state is already publicly readable.

It does not weaken the M1-B human one-shot authorization boundary.

## Preconditions

A repository is eligible only when all are true:

- exact repository identity is present in config/repository-enrollment.json;
- enrollment state is ENROLLED;
- the enrollment policy remains EXPLICIT_ALLOWLIST_ONLY;
- the repository visibility attestation is PUBLIC;
- default branch matches the governed enrollment;
- runtime mode is LIVE_ONE_SHOT;
- a single-use human receipt is bound to the exact implementation SHA after independent review.

Any UNKNOWN, PRIVATE, INTERNAL, mismatched or missing state fails closed.

## No credential surface

Anonymous mode has no credential reference, token, principal, secret context or permission bootstrap.

Outbound requests MUST contain no:
- Authorization;
- Cookie;
- Proxy-Authorization;
- caller-provided Host;
- Forwarded / X-Forwarded-*;
- arbitrary caller headers.

The absence of credentials is a structural invariant, not a caller option.

## Network boundary

Only:
- HTTPS;
- host api.github.com;
- GET;
- closed-world repository paths;
- redirects denied;
- trust_env=false;
- HTTP/2 disabled;
- TLS/hostname verification enabled.

No proxy from environment, arbitrary URL, alternate host, method, port or SNI is accepted.

## Public visibility attestation

Before material live collection, the session must establish a source-bound public visibility attestation for the exact enrolled repository.

A successful GET alone is not sufficient.

The attestation must bind:
- repository;
- visibility=public;
- default branch;
- source operation;
- observedAt;
- canonical digest.

If visibility is private/internal/unknown, collection is denied.

## Human receipt

The anonymous receipt remains single-use and binds:
- receipt ref;
- probe/run id;
- repository;
- exact implementation SHA;
- allowed operations;
- issuedAt / expiresAt;
- policy digest;
- resource digest;
- mode PUBLIC_ANONYMOUS_READ_ONLY.

Lifecycle:
ISSUED -> CLAIMED -> CONSUMED | FAILED.

Receipt claim occurs before any live DNS/socket creation.

A security-relevant implementation change invalidates previous live authorization.

## Evidence boundary

Evidence remains LOCAL_EPHEMERAL_ONLY during the one-shot collector run.

No commit, upload, comment, workflow dispatch, issue/PR mutation or remote persistence is allowed.

## Current state

This tranche may implement and qualify the anonymous source offline with injected/mock transport only.

Current normative state remains:

live=NOT_AUTHORIZED


## Minimal live operation surface

For Project Knowledge repository observation, anonymous mode is limited to:

- repo.read;
- ref.read;
- commit.read;
- pr.read.

pr.read is the only extension beyond the initial M0 minimal surface and is already a recognized Stage C1 read operation. Its live authorization must be explicit in the new exact-head receipt.

pr.read maps only to the fixed GitHub endpoint for open pull requests, with per_page=100 and bounded page numbers 1..10. Arbitrary query parameters are forbidden.

A RepositoryObservation may claim COMPLETE only when pagination is proven complete and the anchor head is unchanged at close.
