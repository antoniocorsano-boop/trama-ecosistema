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
