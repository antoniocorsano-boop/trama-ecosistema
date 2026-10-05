# QE-01 Requalification v2

**Date:** 2026-10-05  
**Baseline:** `main@36e7f105070ab69c09930ad27c64f05962ec170b`  
**State:** `REQUALIFICATION_PREPARED_NOT_AUTHORIZED`  
**Next action:** `LOCAL_REOBSERVATION_REQUIRED`

> **EXECUTION NOT AUTHORIZED.** This dossier prepares P5 / QE-01 for a future exact-head requalification. It does not authorize network access, credential use, model invocation, runtime execution, publication, mutation, or any automatic decision.

## 1. Why PR #212 cannot be reused as authority

PR #212 remains historical evidence only. Its last machine-readable profile records `EXECUTION_FAILED_REQUALIFICATION_REQUIRED` with `executable=false`. The prior Human Review and authorization narrative are therefore **not reusable** for a new execution.

The failed attempt preserved these facts:

- expected provider: `nvidia`;
- expected model: `nvidia/nemotron-3-ultra-550b-a55b`;
- observed runtime route: `deepseek-official`;
- failure class: `STALE_BINDING`;
- provider error class: `MISSING_CREDENTIAL`;
- model invoked: `false`;
- valid generation request sent: `false`;
- retry count: `0`;
- mutation observed: `false`;
- personal student data observed: `false`;
- secret material observed: `false`.

This is the canonical reason for requalification: the runtime binding actually observed during the attempted execution did not match the frozen provider profile.

## 2. Current static candidate evidence

Static public evidence was rechecked on 2026-10-05.

### Provider/model

NVIDIA currently exposes the model `nvidia/nemotron-3-ultra-550b-a55b` and advertises the OpenAI-compatible base endpoint `https://integrate.api.nvidia.com/v1`. The public NVIDIA Build surface currently lists a free hosted endpoint for the model.

Sources:

- https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b
- https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b/modelcard

This proves only public availability. It does **not** prove that the user's local credential is present, valid, entitled, or bound to the runtime that will execute QE-01.

### Adapter

The adapter package `@deepseek-ai/dsh-llm-pi-ai` is publicly available and remains the provider-neutral DSH candidate. Its prerelease line is moving and does not justify carrying forward the historical `0.1.5-rc.3` adapter claim without observation from the actual local runtime.

Sources:

- https://www.npmjs.com/package/@deepseek-ai/dsh-llm-pi-ai
- https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm-pi-ai

Therefore the v2 manifest deliberately stores:

- `adapterVersion = REOBSERVE_REQUIRED`;
- `runtimeVersion = REOBSERVE_REQUIRED`;
- `providerRoute = REOBSERVE_REQUIRED`.

## 3. Frozen safety envelope

Any future QE-01 candidate remains bounded to:

- capability `lesson.preparation.observe`;
- mode `PROPOSE_ONLY`;
- `oneShot=true`;
- `maxRetries=0`;
- mutation forbidden;
- no personal student data;
- no student profile or tracking;
- no secret persistence;
- no secret material in evidence;
- Control Center `READ_ONLY`;
- Arena write forbidden;
- Atlas publication forbidden;
- Docente OS automatic adoption forbidden;
- diary write forbidden;
- `DOS-A1=RUNTIME_DEFERRED`.

The v2 package also fixes `networkExecutionAuthorized=false`. Static public availability of a provider does not switch that flag.

## 4. Gates that remain blocked without the PC

The following gates are intentionally `BLOCKED` and must be re-observed from the real local environment:

1. `LOCAL_RUNTIME_BINDING_REOBSERVED` — observe the actual DSH runtime version and active profile.
2. `LOCAL_ADAPTER_VERSION_REOBSERVED` — observe the exact installed `@deepseek-ai/dsh-llm-pi-ai` version.
3. `LOCAL_PROVIDER_ROUTE_REOBSERVED` — prove the active route is the intended `nvidia` route, not `deepseek-official` or another stale binding.
4. `LOCAL_CREDENTIAL_REFERENCE_REOBSERVED` — prove only that the expected credential reference can be resolved; never persist the credential value.
5. `EXACT_EXECUTION_TARGET_FROZEN` — choose the exact target head only after local binding is current.
6. `HUMAN_EXACT_HEAD_REVIEW` — Human Review must bind to that exact target.
7. `HUMAN_AUTHORIZATION_FOR_NEW_EXECUTION` — a new explicit decision is required after all technical gates pass.

No historical receipt may silently satisfy these gates.

## 5. What can be completed now

This PR can completely qualify the **requalification package itself**:

- preserve the failed receipt without reinterpretation;
- verify that the public provider/model candidate still exists;
- verify that the adapter package still exists while refusing a stale version pin;
- make the non-executable state machine-readable;
- add deterministic adversarial tests;
- add a permanent Governance gate.

It cannot truthfully complete the local binding, credential-reference observation, execution-target freeze, Human Review, or model invocation while the PC is unavailable.

## 6. Exit condition for this package

This package is complete when its exact head passes Governance with:

`REQUALIFICATION_PREPARED_NOT_AUTHORIZED / EXECUTION NOT AUTHORIZED`

The later local phase may advance only from fresh evidence. No merge of this package shall itself authorize QE-01 execution.
