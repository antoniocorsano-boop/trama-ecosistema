# CC-MSS-01 — Governed non-secret live binding materialization

Status: PREPARED / OFFLINE_ONLY / LIVE NOT AUTHORIZED

## Purpose

Define the only permitted bridge from the qualified offline decision-package gate to a complete package that may later be presented for a separate human `LIVE_ONE_SHOT` decision.

This procedure MUST NOT read, print, persist, hash, transform or transmit secret/token/private-key material. It accepts only non-secret metadata emitted by a separately authorized credential/permission provider.

## Input envelope

The materializer accepts a local ephemeral JSON envelope containing only:

- `credentialRef`: opaque reference beginning `ref:`; never a token or key;
- `expectedPrincipalRef`: non-secret principal/install/account reference;
- `permissionAttestationRef`: opaque provenance reference;
- `permissionAttestationDigest`: SHA-256 digest of the canonical non-secret attestation;
- `permissionAttestationExpiresAt`: UTC expiry;
- `permissionBootstrap`: `null` or the reviewed `github.permissions.read` operation;
- policy digests for request budget, retry/timeout and resource limits;
- canonicalization version;
- proposed authorization receipt reference and probe/run identifier;
- issued/expiry timestamps and clock-skew ceiling.

The materializer MUST reject values that resemble bearer tokens, GitHub tokens, PEM/private keys, multiline secrets or raw authorization headers.

## Candidate binding

`candidateExactSha` is not supplied by the external envelope. It MUST be injected from the exact repository head being qualified and validated as a 40-character lowercase Git SHA. Repository identity, authority, method, operations and evidence destination remain closed constants from the qualified package template.

## Output semantics

Successful materialization may produce only:

- `state=READY_FOR_HUMAN_DECISION`;
- `live=NOT_AUTHORIZED`;
- `humanDecision=PENDING`.

It MUST NOT emit `AUTHORIZE_LIVE_ONE_SHOT`, an executable credential context, a network request, or a consumed/claimed authorization receipt.

## Fail-closed rules

Any missing field, secret-like value, invalid digest, unsupported bootstrap, invalid/expired lifetime, principal ambiguity, non-local evidence destination, candidate mismatch or unclassified input aborts materialization. The committed template remains `NOT_READY` and `live=NOT_AUTHORIZED`.

The local input envelope itself MUST NOT be committed. Only the validated non-secret bindings may be used to prepare a candidate package for CI/review.

## Governance transition

A materialized package is only a candidate for review. Required sequence:

1. materialize non-secret bindings locally;
2. run the package validator and adversarial tests offline;
3. commit only the validated non-secret package on a dedicated exact head;
4. CI PASS on that exact head;
5. independent adversarial review PASS on that exact head;
6. present the frozen envelope to the human decision maker;
7. only an explicit decision bound to that exact envelope may create the separate one-shot authorization receipt.

Until step 7, `LIVE_ONE_SHOT=NOT_AUTHORIZED` remains normative.