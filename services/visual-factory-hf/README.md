# Studio Atlas Visual Factory — Hugging Face adapter

**Status:** PILOT_EXECUTOR / FREE_ONLY / NOT_RUNTIME_AUTHORITY

This service is the first opportunistic execution adapter for the Studio Atlas Visual Factory v0.2.

It does one bounded job:

`VisualGenerationPlan → FLUX.2 Klein 4B inference → candidate files + VisualExecutionReceipt`

It does **not** decide visual quality, lock references, approve the Product Review, publish a pathway, authorize learners, or purchase compute.

## Runtime

- SDK: Gradio
- GPU boundary: Hugging Face ZeroGPU via `@spaces.GPU`
- Model: `black-forest-labs/FLUX.2-klein-4B`
- Reference candidates: text-to-image
- Scene candidates: multi-reference image-conditioned generation
- Default variants per job: 1
- Hard maximum variants per job: 3
- Cost class represented to Studio Atlas: `FREE_ONLY`

`VISUAL_FACTORY_VARIANTS_PER_JOB` may reduce/increase the actual bounded candidate count up to 3. It never changes the authoring contract or grants authority.

## API

Gradio API name: `/execute`

Input:

- `plan_json`: serialized `atlas.visual-generation-plan/v0.1`

Outputs:

1. `atlas.visual-execution-receipt/v0.1`
2. ordered generated candidate files

The receipt contains `gradio-file://N` placeholders. The Studio Atlas server gateway replaces them with the file URLs returned by the authenticated Gradio client before accepting the receipt.

## Reference-first invariant

Studio Atlas generates and reviews these five subjects first:

- Lia
- Omar
- Teo
- Sala Zero
- Cabina regia

Only human-locked reference assets can become inputs to F1–F6. A `SCENE_FRAME` without reference inputs is rejected before inference.

## Storage boundary

ZeroGPU output files are **pilot candidate assets** and may be ephemeral across Space lifecycle changes. This adapter is sufficient to qualify generation, continuity and Human Product Review workflow. Durable canonical asset storage is a separate requirement before `PUBLISH_CANDIDATE`.

No student data is sent to this service.

## Environment

Optional:

- `VISUAL_FACTORY_MODEL_ID` — defaults to `black-forest-labs/FLUX.2-klein-4B`
- `VISUAL_FACTORY_VARIANTS_PER_JOB` — defaults to `1`, clamped to `1..3`

No billing or purchase credential is accepted by the adapter.

## Local run

A normal local environment requires a compatible CUDA GPU and is not the canonical free-compute path.

```bash
pip install -r requirements.txt
python app.py
```

## Studio Atlas connection

Studio Atlas calls the Space only from its server route. Provider details and tokens never reach the browser.

Expected Studio Atlas server configuration:

- `VISUAL_FACTORY_EXECUTOR_KIND=GRADIO`
- `VISUAL_FACTORY_EXECUTOR_URL=<owner>/<space>` or the Space URL
- `VISUAL_FACTORY_EXECUTOR_TOKEN=<optional HF token>`

If the executor is absent, unavailable, or has no free quota, Studio Atlas returns **Produzione in attesa** and preserves all authoring/reference state.
