# CC-MSS-01 — Stage C2 Adapter M0: inert read-only adapter materialization gate

Status: PROPOSED — DESIGN ONLY / INERT / LIVE NOT AUTHORIZED
Parent qualification: C2 live-probe OFFLINE composition PASS on exact head `0840b2cfecd178da2296afe8bbf78e1375d297ed`
Authority: CC-MSS-01 Stage C2 live one-shot authorization gate

## 1. Purpose
M0 defines the smallest safe step from the qualified offline state machine toward a future real GitHub read-only adapter. M0 is intentionally inert: it may define types, endpoint descriptors, policies, parsers, bounded readers and transport interfaces, but it MUST NOT contain an executable network transport, credential loader, socket/HTTP client, workflow dispatch, remote persistence or mutation capability.

`live=NOT_AUTHORIZED` remains normative.

## 2. Allowed materialization
M0 MAY materialize only:
- immutable typed operation descriptors for the initial minimal surface: `repo.read`, `ref.read`, `commit.read`;
- fixed `GET` method and `api.github.com` host binding;
- deterministic path-template builders from validated owner/repository/ref/SHA values;
- request metadata type excluding authorization secrets;
- response schema validators/parsers;
- bounded byte-reader/decompression interfaces that operate on supplied offline byte streams;
- redirect policy type fixed to deny;
- timeout/retry/resource policy types;
- permission-source interface without an implementation that reads real credentials or remote permission APIs;
- transport protocol/interface with no concrete live implementation;
- local/ephemeral evidence sink interface;
- deterministic fixtures and negative tests.

## 3. Forbidden materialization
M0 MUST NOT introduce or import:
- `socket`, `requests`, `urllib`, `http.client`, `httpx`, `aiohttp`, curl/wget wrappers or equivalent network clients;
- `subprocess`, shell execution or dynamic command runners;
- environment/secret/token credential acquisition for the collector;
- generic URL fetchers;
- redirect following;
- POST/PUT/PATCH/DELETE/GraphQL mutation or GitHub write APIs;
- upload/publish/commit/comment/artifact persistence from the collector;
- scheduled/background execution;
- runtime/UI activation;
- Stage D behavior.

## 4. Endpoint descriptor contract
Every operation descriptor MUST bind:
- operation identifier;
- HTTP method exactly `GET`;
- scheme exactly `https`;
- host exactly `api.github.com`;
- fixed path template;
- expected response schema identifier;
- pagination mode (`NONE` for initial M0 unless separately defined);
- whether an anchor is required;
- resource policy identifier.

Descriptors are closed-world: unknown operation identifiers fail before any transport call. Runtime-provided absolute URLs are forbidden.

## 5. Input validation
Repository owner/name, ref and commit SHA values MUST be validated before interpolation. Path values cannot contain scheme/host delimiters, traversal, control characters or query/fragment injection. Percent-encoding rules must be deterministic and covered by negative tests. Repository identity must still be checked against governed enrollment/authorization outside the adapter descriptor layer.

## 6. Boundary policy
The adapter boundary policy is immutable for M0:
- scheme: `https`;
- host: `api.github.com`;
- redirects: `DENY`;
- cross-host credential forwarding: impossible by interface design;
- arbitrary absolute URL input: impossible by interface design.

The future live transport MUST consume a validated descriptor rather than a raw URL.

## 7. Bounded response handling
M0 MUST implement and test transport-agnostic bounded processing over offline supplied byte streams:
- compressed byte ceiling;
- decompressed byte ceiling;
- cumulative session byte ceiling;
- JSON structural/depth ceiling where applicable;
- item/page ceilings where applicable;
- abort before unbounded buffering;
- compressed-small/decompressed-large rejection;
- malformed/truncated payload fail-closed.

No test may require network access.

## 8. Permission boundary
M0 defines only a `PermissionSource` protocol returning normalized observed permissions plus provenance metadata. It MUST NOT implement real credential discovery or permission acquisition. The existing deterministic PermissionAttestation builder remains the authority for deriving `VERIFIED_READ_ONLY | WRITE_PRESENT | UNKNOWN`.

A future concrete permission source is a separate reviewed materialization step.

## 9. Credential boundary
M0 request descriptors contain only an opaque `credentialRef`; never token values. No environment variable, secret store, file token, OAuth exchange or authorization-header construction is permitted in M0.

## 10. Transport boundary
M0 defines a transport protocol such as `execute(validated_request, bounded_policy) -> byte_stream/result`, but MUST NOT provide a live implementation. Tests use only deterministic fake transports/byte streams.

The capability-surface audit MUST fail if a concrete network client or subprocess escape is added.

## 11. Negative qualification requirements
Before M0 can PASS, CI MUST prove at least:
- unknown operation rejected;
- non-GET descriptor rejected;
- non-HTTPS/non-api.github.com descriptor rejected;
- absolute/runtime URL injection rejected;
- owner/repository/ref/SHA injection/traversal/control characters rejected;
- redirect policy cannot be changed from DENY;
- response compressed/decompressed/session ceilings enforced during processing;
- malformed/truncated response rejected;
- PermissionSource remains abstract/inert;
- no token/secret acquisition or Authorization header builder exists;
- no network/subprocess imports or calls;
- no remote persistence/mutation capability;
- existing Stage B/C1/C2 and offline live-sim gates remain green.

## 12. Review gate
M0 implementation requires:
1. CI PASS on exact implementation head;
2. independent adversarial review of descriptor/path injection, resource bounding and capability surface;
3. second independent review if remediation changes security-relevant code.

M0 PASS does not authorize M1, a concrete HTTP client, a real PermissionSource, credential injection or a live probe.

## 13. Next possible phase
Only after M0 PASS may an M1 proposal define a concrete read-only transport. M1 must be separately authorized for implementation and must demonstrate TLS/hostname verification, redirect denial, streaming limits, timeout/retry/rate-limit semantics and secret-safe credential injection under offline/mocked tests before any live execution decision.