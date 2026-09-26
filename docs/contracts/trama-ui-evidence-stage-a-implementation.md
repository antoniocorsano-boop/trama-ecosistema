# TRAMA UI Evidence — Stage A implementation slice

**Parent:** TRAMA-UI-EVIDENCE-01  
**Mode:** OBSERVE / NON-BLOCKING  
**Baseline:** `67e26bf14a91305f562b53b5b6c6be39e4882957`  
**Runtime:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

This slice turns the approved evidence contract into inspectable implementation artifacts without enabling Stage B enforcement.

## Included

- Draft 2020-12 JSON Schema for `ui-evidence.manifest.json`.
- Valid minimal fixture.
- Invalid fixture proving that an aggregate PASS cannot hide an open blocking accessibility finding and that an untrusted producer is rejected semantically.
- Semantic Stage A validator for aggregate impact, S/M/L/LIM completeness, producer allow-list seed, immutable binding, exact-head freshness, accessibility blockers and protected runtime/DOS-A1 boundaries.

## Explicitly not included

- No production runtime or persistence.
- No student telemetry/account/tracking.
- No blocking Stage B gate.
- No claim that the producer allow-list is final.
- No activation of DOS-A1.

## Review targets

1. JSON Schema structure must faithfully represent TRAMA-UI-EVIDENCE-01.
2. Semantic validator must reject hidden blockers, untrusted self-certification and stale-head evidence.
3. Fixture SHA `000…000` is permitted only for repository fixtures; real evidence must bind to the exact head.
4. Before Stage B, schema validation must be wired to a pinned validator implementation and the exception registry must gain a versioned machine-readable schema.
5. Stage A output is diagnostic only and must not be represented as release certification.
