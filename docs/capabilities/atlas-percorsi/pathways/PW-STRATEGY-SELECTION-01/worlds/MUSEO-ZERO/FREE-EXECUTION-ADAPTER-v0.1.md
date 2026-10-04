# MUSEO ZERO — Free Execution Adapter v0.1

**Candidate:** MZ-VF-001
**Adapter:** Google Colab Free
**State:** PROBE_READY / MODEL_EXECUTION_NOT_YET_QUALIFIED
**Cost policy:** ZERO_COST_ONLY
**Runtime:** NOT_AUTHORIZED

## Decision

The first zero-cost execution adapter for the Visual Factory v0.1 is **Google Colab Free**.

Why:
- browser-based;
- no local CUDA installation required;
- free GPU access exists;
- notebook can live in the governed repository;
- the adapter is disposable and replaceable.

Limit:
- GPU availability/type is not guaranteed;
- quotas and runtime limits vary;
- therefore Colab is an execution adapter, never a product authority.

## Phase 1 — hardware probe

Run:
`FREE-GPU-PROBE-COLAB-v0.1.ipynb`

The probe checks:
- CUDA GPU present;
- GPU model;
- VRAM;
- system RAM;
- free disk.

Initial qualification target for the Qwen-Image-Edit quantized probe:
- CUDA GPU present;
- VRAM >= 14 GiB preferred;
- system RAM >= 24 GiB preferred;
- free disk >= 35 GiB.

If the runtime does not meet the threshold:
**NOT_QUALIFIED — STOP.**

No paid upgrade is implied.

## Phase 2 — model execution

Only after Phase 1 passes:
- install ComfyUI;
- install/qualify the GGUF loader only if needed;
- download pinned model artifacts;
- run OP0/OP1 generation;
- record exact hashes and runtime receipt.

This phase is deliberately not embedded in the hardware probe so an unsuitable free runtime does not waste bandwidth/time.

## Candidate quantized route

For the zero-cost probe, the candidate is a Qwen-Image / Qwen-Image-Edit Apache-2.0 GGUF quantization sized for a 16 GiB-class GPU.

This route is:
**CANDIDATE / NOT_YET_QUALIFIED**

The full FP8 reference remains the quality baseline.

A quantized route becomes acceptable only if the same Q3-oriented visual gate is preserved.

## Fail-closed rules

Do not:
- purchase Colab compute automatically;
- switch to a paid provider automatically;
- download model packages when the hardware probe fails;
- lower the quality bar to fit the runtime;
- treat Colab availability as a production SLA.

## Next state

If probe passes:
**FREE_GPU_EXECUTION_AVAILABLE**

Then the Factory may run the first open OP0/OP1 production proof.

If probe fails:
**FREE_GPU_EXECUTION_UNAVAILABLE**

Then select another zero-cost/available adapter without reopening art direction.


## Probe receipt — run 1 — 2026-10-04

Observed from the governed Colab probe v0.2:

- adapter: `google-colab-free`
- gpuPresent: `false`
- gpuName: `null`
- vramGiB: `0.0`
- ramGiB: `12.67`
- diskFreeGiB: `87.23`
- decision: `NO_GPU`
- paidComputeAuthorized: `false`

Interpretation:
the notebook executed correctly, but the assigned runtime had no CUDA GPU.

This is **not** a model/pipeline qualification failure.

Next action:
1. request/enable a free GPU runtime once;
2. rerun the hardware probe;
3. if Colab Free still provides no GPU, stop retrying and move to the next zero-cost adapter.

No model downloads are authorised on this CPU-only runtime.


## Probe receipt — run 2 — 2026-10-04

Observed from the governed Colab probe v0.2:

- adapter: `google-colab-free`
- gpuPresent: `true`
- gpuName: `Tesla T4`
- vramGiB: `15.0`
- ramGiB: `12.67`
- diskFreeGiB: `70.21`
- decision: `T4_Q4_CANDIDATE`
- paidComputeAuthorized: `false`

Interpretation:
the free Colab adapter is **qualified for a bounded Q4 smoke test**, not yet for production.

Next action:
run `Q4-SMOKE-TEST-COLAB-v0.1.ipynb`.

Pass condition:
- ComfyUI installs;
- required GGUF/Qwen nodes are present;
- Q4 model package loads under `--lowvram`;
- one 512x512 edit completes;
- an execution receipt is produced;
- no paid compute is used.

Failure policy:
- if Q4 fails specifically for memory, permit one controlled Q3 fallback;
- otherwise stop and diagnose;
- no repeated random retries.


## Adapter decision update — 2026-10-04

### Google Colab Free

State:
**PROBE_SUCCESSFUL / EXECUTION_ADAPTER_REJECTED_FOR_REPEATABILITY**

Observed:
- one successful free T4 allocation;
- subsequent runtime replacement lost the GPU before the Q4 smoke test;
- a later corrected notebook again started without NVIDIA GPU.

Interpretation:
Colab Free is useful for opportunistic hardware probes, but its free GPU allocation is not stable enough to be the canonical execution adapter for the Visual Factory v0.1 pilot.

No paid Colab tier is authorised.

### Kaggle Notebooks

State:
**SELECTED_FREE_EXECUTION_ADAPTER_FOR_Q4_SMOKE**

Current official environment provides:
- free GPU option;
- T4 x2 as the current recommended accelerator after P100 retirement;
- approximately 29 GiB host RAM for the T4 x2 environment;
- up to 12-hour GPU notebook sessions;
- reproducible notebook version execution.

The adapter remains fail-closed:
- if no GPU is allocated, stop;
- if the free quota is unavailable, do not purchase compute automatically;
- if Q4 OOMs, allow one controlled Q3 fallback only;
- no repeated random retries.
