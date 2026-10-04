"""Hugging Face ZeroGPU adapter for Studio Atlas Visual Factory v0.2.

The Space is intentionally a provider adapter. It receives a governed generation
plan, runs bounded inference, and returns candidate files plus a no-authority
receipt. It never decides visual quality, reference lock, publication, or runtime.
"""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import tempfile

import spaces  # ZeroGPU must patch torch before diffusers imports it.
import gradio as gr
import torch
from diffusers import DiffusionPipeline
from diffusers.utils import load_image

from contract import (
    compile_execution_jobs,
    failed_receipt,
    now_iso,
    success_receipt,
    validate_plan,
)

MODEL_ID = os.environ.get("VISUAL_FACTORY_MODEL_ID", "black-forest-labs/FLUX.2-klein-4B")
WORKFLOW_REF = "hf-zerogpu.flux2-klein-4b/v0.1"
VARIANTS_PER_JOB = max(1, min(3, int(os.environ.get("VISUAL_FACTORY_VARIANTS_PER_JOB", "1"))))

# HF ZeroGPU emulates CUDA during process startup. Keeping the pipeline at module
# scope lets the platform optimise transfers when a real GPU is assigned.
pipe = DiffusionPipeline.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.bfloat16,
).to("cuda")


def _prompt(job) -> str:
    if not job.negative_constraints:
        return job.prompt
    avoid = ", ".join(job.negative_constraints)
    return f"{job.prompt}\n\nKeep the authored world coherent. Avoid: {avoid}."


def _seed(package_digest: str, job_id: str, variant: int) -> int:
    raw = f"{package_digest}:{job_id}:{variant}".encode("utf-8")
    return int(hashlib.sha256(raw).hexdigest()[:8], 16)


def _load_references(refs: tuple[str, ...]):
    images = []
    for ref in refs:
        if not ref.startswith("https://"):
            raise ValueError("REFERENCE_URL_NOT_HTTPS")
        images.append(load_image(ref).convert("RGB"))
    return images


@spaces.GPU(duration=120)
def execute_plan(plan_json: str):
    """Execute one bounded Studio Atlas generation plan.

    Output 1 is the machine-readable receipt. Output 2 is an ordered file list.
    Receipt asset URLs intentionally use `gradio-file://N` placeholders; the
    Studio Atlas server adapter replaces them with the authenticated file URLs
    returned by the Gradio client before the browser sees the receipt.
    """
    try:
        plan = validate_plan(json.loads(plan_json))
        jobs = compile_execution_jobs(plan)
    except Exception as exc:
        # A malformed input has no trustworthy package digest, so surface an
        # ordinary endpoint error rather than forging a governed receipt.
        raise gr.Error(f"INVALID_VISUAL_GENERATION_PLAN: {exc}") from exc

    files: list[str] = []
    assets: list[dict] = []

    try:
        for job in jobs:
            references = _load_references(job.reference_inputs)
            variant_count = min(job.max_variants, VARIANTS_PER_JOB)
            for variant in range(variant_count):
                kwargs = {
                    "prompt": _prompt(job),
                    "width": job.width,
                    "height": job.height,
                    "num_inference_steps": 4,
                    "generator": torch.Generator(device="cpu").manual_seed(
                        _seed(plan["packageDigest"], job.job_id, variant)
                    ),
                }
                if references:
                    kwargs["image"] = references if len(references) > 1 else references[0]

                image = pipe(**kwargs).images[0]
                asset_id = f"{job.subject_ref}-{variant + 1}-{hashlib.sha256(image.tobytes()).hexdigest()[:12]}"
                output_dir = Path(tempfile.mkdtemp(prefix="studio-atlas-vf-"))
                output_path = output_dir / f"{asset_id}.webp"
                image.save(output_path, format="WEBP", quality=90, method=6)
                digest = hashlib.sha256(output_path.read_bytes()).hexdigest()
                file_index = len(files)
                files.append(str(output_path))
                assets.append(
                    {
                        "assetId": asset_id,
                        "subjectRef": job.subject_ref,
                        "purpose": job.purpose,
                        "url": f"gradio-file://{file_index}",
                        "sha256": digest,
                        "modelRef": MODEL_ID,
                        "workflowRef": WORKFLOW_REF,
                        "createdAt": now_iso(),
                        "packageDigest": plan["packageDigest"],
                        "provenanceStatus": "RECORDED",
                    }
                )

        return success_receipt(plan, assets), files
    except Exception as exc:
        return failed_receipt(plan, f"{type(exc).__name__}: {exc}"), []


with gr.Blocks(title="Studio Atlas Visual Factory") as demo:
    gr.Markdown(
        "# Studio Atlas · Visual Factory\n"
        "Provider adapter di produzione. Le decisioni di qualità restano in Studio Atlas."
    )
    plan_input = gr.Textbox(label="Visual generation plan", lines=10)
    run = gr.Button("Execute bounded plan", variant="primary")
    receipt_output = gr.JSON(label="Execution receipt")
    files_output = gr.Files(label="Generated candidates")
    run.click(
        execute_plan,
        inputs=plan_input,
        outputs=[receipt_output, files_output],
        api_name="execute",
    )


demo.queue(default_concurrency_limit=1)

if __name__ == "__main__":
    demo.launch()
