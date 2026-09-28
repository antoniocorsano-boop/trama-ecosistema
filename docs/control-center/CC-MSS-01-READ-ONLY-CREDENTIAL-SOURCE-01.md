# CC-MSS-01 — READ-ONLY-CREDENTIAL-SOURCE-01

Status: CANDIDATE / NO SECRET / NO LIVE AUTHORIZATION

## Purpose

Provide the concrete capability boundary required by Stage C2 M1-B for a GitHub credential that is provably read-only before probe execution.

## Provider model

The production credential MUST be provider-managed and repository-scoped. Preferred binding: a dedicated GitHub App installation configured only for the enrolled TRAMA ecosystem repositories.

The repository stores only an opaque reference of the form:

github-app-installation:<stable-principal-ref>

No private key, installation token or bearer token is stored in TRAMA.

## Required permissions

The materialized principal must attest at least contents:read. Additional read-only metadata permissions may be admitted only if explicitly required by a governed operation.

Any write-capable permission fails closed. This includes admin, maintain, push and any permission ending in :write.

## Binding

A credential context is valid only when:

- repository is present and ENROLLED in config/repository-enrollment.json;
- credential reference uses the governed GitHub App installation namespace;
- provider is github;
- principalRef is non-empty and stable;
- attested repository equals requested repository;
- provenance is present;
- contents:read is present;
- no write capability is present.

## Secret lifecycle

The backend may materialize the secret only after the M1-B receipt is atomically claimed.

The secret:
- is request/session scoped;
- is never serialized into Project Knowledge, Control Center snapshots, logs or evidence;
- is never accepted from .env, shell, subprocess, Git credential helper or caller raw input;
- must be invalidated on mismatch, failure and session termination.

## Non-authorization

This tranche does not create a GitHub App, private key or installation token and does not execute network traffic.

It qualifies the boundary that a separately configured provider-managed read-only credential must satisfy.

A future live one-shot still requires:
1. an actually configured read-only provider principal;
2. authoritative permission attestation;
3. a fresh single-use LIVE_ONE_SHOT receipt;
4. all Stage C2 M1-B exact-head and budget gates.
