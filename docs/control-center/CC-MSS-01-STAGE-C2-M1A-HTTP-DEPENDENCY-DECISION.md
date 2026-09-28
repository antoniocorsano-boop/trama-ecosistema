# CC-MSS-01 — Stage C2 M1-A HTTP dependency decision

Status: DECISION PROPOSED / IMPLEMENTATION NOT YET MATERIALIZED
Contract head reviewed: `569fbb4b484f16ef7b70f9cdb9f17aa9692127b8`
Normative state: `network=GUARDED`; `live=NOT_AUTHORIZED`.

## Decision
Select **HTTPX** as the candidate HTTP client family for M1-A, subject to an exact-version pin captured and audited at implementation time. Do not yet add the dependency or a concrete transport in this decision commit.

The implementation MUST NOT use the top-level convenience API. It MUST wrap a single internally constructed synchronous `httpx.Client` (or lower-level governed transport if required by tests) behind the M1-A execution interlock and an injected offline/mock transport boundary.

## Why HTTPX fits the M1-A contract
The selection is based on properties directly relevant to the contract rather than general popularity:

1. Redirects are disabled by default and can be fixed with `follow_redirects=False`.
2. Environment-derived proxy/CA configuration can be disabled with `trust_env=False`.
3. Streaming has an explicit context-managed API and `iter_raw()` exposes raw response bytes without HTTP content decoding, which supports compressed-byte accounting before the governed M0 decompressor.
4. TLS verification can be supplied through an internally constructed `ssl.SSLContext`; M1-A will not expose a caller-controlled `verify` option.
5. Client lifetime and connection-pool cleanup are explicit through context management / `close()`.
6. The client accepts an injectable transport, which is suitable for deterministic offline qualification and zero-egress CI.
7. Timeouts and connection limits are explicit configuration objects.

## Alternatives considered
### Requests
Not selected for M1-A. It can stream and verify TLS, but redirects are enabled by default and `Session.trust_env` defaults to true. Its environment/proxy merging and session behavior create more negative configuration that M1-A would need to neutralize. Requests also delegates networking to urllib3, increasing the configuration surface that must be reasoned about across layers.

### urllib3 directly
Technically capable and lower-level, with explicit `decode_content`, redirect/retry and same-host controls. Not selected for the first M1-A implementation because the contract would need to govern more pool/retry/decompression details directly. Recent urllib3 releases have also contained security fixes specifically in streaming/decompression/proxy handling; if used later, the exact version and those semantics require dedicated review. HTTPX does not eliminate such risks, but gives M1-A a narrower application-facing wrapper for the required invariants.

## Mandatory HTTPX profile
The future M1-A wrapper MUST internally enforce all of the following and expose none as caller-overridable settings:

- synchronous client only for M1-A;
- `trust_env=False`;
- `follow_redirects=False`;
- TLS verification through an internally created verification-enabled SSL context;
- hostname verification enabled; no `verify=False` path;
- HTTP/1.1 initially; HTTP/2 disabled unless separately reviewed;
- no proxy parameter/mount supplied;
- no caller-provided mounts;
- no caller-provided cookies or persistent cookie state used for requests;
- no caller-provided auth object;
- fixed authority `https://api.github.com` derived from the validated M0 descriptor, never a runtime absolute URL;
- fixed method `GET`;
- internally generated outbound header allowlist;
- no arbitrary caller headers;
- explicit timeout object with bounded connect/read/write/pool values;
- explicit connection limits suitable for one-shot execution;
- response consumed only through the streaming path;
- raw body consumed with `iter_raw()` (or an equivalently verified raw transport path), never `iter_bytes()`, `.content`, `.text`, `.json()` or `.read()` for collector payload processing;
- content encoding validated before handing raw bytes to the M0 bounded processor;
- deterministic close on success/failure/abort.

## Offline transport rule
M1-A CI MUST instantiate HTTPX only with an injected offline/mock transport or equivalent test boundary. A network guard remains independently active. Tests MUST fail if any DNS/socket egress is attempted.

The wrapper MUST NOT silently fall back from an absent mock/injected transport to the default network transport while in qualification mode.

## Dependency governance
Before implementation is called M1-A:

1. resolve the then-current stable HTTPX release from the authoritative package/release metadata;
2. pin an exact version in the repository dependency mechanism;
3. record the resolved HTTPX version and relevant HTTPCore dependency version in the M1-A qualification evidence;
4. capability/dependency audit fails on version drift or an undeclared network dependency;
5. security-relevant dependency upgrades require regression CI and review before qualification is restored.

This decision intentionally does not guess or hard-code a version before the implementation commit resolves authoritative package metadata.

## Required HTTPX-specific adversarial tests
In addition to the M1 contract tests, M1-A MUST prove offline that:

- `trust_env` cannot become true;
- `follow_redirects` cannot become true;
- `verify=False` or an insecure SSL context cannot be injected;
- proxy/mount configuration cannot be injected;
- HTTP/2 cannot be enabled accidentally;
- caller auth/cookies/arbitrary headers cannot alter the request;
- Host/SNI/authority remain fixed;
- `iter_raw()` preserves compressed wire-body ownership for M0;
- decoded streaming helpers are not used in the collector path;
- response/session cleanup occurs after success, redirect rejection, timeout, resource-limit abort and malformed body;
- injected offline transport is mandatory in qualification mode;
- top-level `httpx.get/request/stream` calls are absent from the M1 runtime surface;
- no request can be issued until the execution interlock has passed.

## Non-authorization
This selection does not authorize dependency installation by itself, a real network transport execution, real credentials, a concrete PermissionSource, M1-B, remote persistence, mutation, workflow dispatch, background collection or Stage D.

`live=NOT_AUTHORIZED` remains normative.