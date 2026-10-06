"""Hugging Face ZeroGPU adapter for Studio Atlas Visual Factory v0.2.

The Space is intentionally a provider adapter. It receives a governed generation
plan, verifies a short-lived server-issued admission capability, runs bounded
inference, and returns candidate files plus a no-authority receipt.
"""

from __future__ import annotations

from io import BytesIO
import hashlib
import json
import os
from pathlib import Path
import tempfile
import time
from urllib.request import Request, urlopen

import spaces  # ZeroGPU must patch torch before diffusers imports it.
import gradio as gr
from PIL import Image
import torch
from diffusers import Flux2KleinPipeline

from contract import (
    compile_execution_jobs,
    failed_receipt,
    now_iso,
    provider_ready_prompt,
    success_receipt,
    validate_plan,
    verify_provider_admission,
)

MODEL_ID = os.environ.get("VISUAL_FACTORY_MODEL_ID", "black-forest-labs/FLUX.2-klein-4B")
WORKFLOW_REF = "hf-zerogpu.flux2-klein-4b/v0.1"
VARIANTS_PER_JOB = max(1, min(3, int(os.environ.get("VISUAL_FACTORY_VARIANTS_PER_JOB", "1"))))
REFERENCE_FETCH_TIMEOUT_SECONDS = 20

pipe = Flux2KleinPipeline.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.bfloat16,
).to("cuda")


def _seed(package_digest: str, job_id: str, variant: int) -> int:
    raw = f"{package_digest}:{job_id}:{variant}".encode("utf-8")
    return int(hashlib.sha256(raw).hexdigest()[:8], 16)


def _reference_bytes(url: str) -> bytes:
    if not url.startswith("https://"):
        raise ValueError("REFERENCE_URL_NOT_HTTPS")
    request = Request(url, headers={"User-Agent": "StudioAtlasVisualFactory/0.2"})
    with urlopen(request, timeout=REFERENCE_FETCH_TIMEOUT_SECONDS) as response:
        payload = response.read()
    if not payload:
        raise ValueError("REFERENCE_CONTENT_EMPTY")
    return payload


def _load_references(refs: tuple[str, ...], reference_input_digests: tuple[str, ...]):
    if len(refs) != len(reference_input_digests):
        raise ValueError("REFERENCE_INPUT_DIGEST_INVALID")
    images = []
    for ref, expected_digest in zip(refs, reference_input_digests, strict=True):
        payload = _reference_bytes(ref)
        actual_digest = hashlib.sha256(payload).hexdigest()
        if actual_digest != expected_digest:
            raise ValueError("REFERENCE_CONTENT_DIGEST_MISMATCH")
        images.append(Image.open(BytesIO(payload)).convert("RGB"))
    return images


@spaces.GPU(duration=120)
def _execute_admitted(plan: dict):
    jobs = compile_execution_jobs(plan)
    files: list[str] = []
    assets: list[dict] = []

    try:
        for job in jobs:
            references = _load_references(job.reference_inputs, job.reference_input_digests)
            variant_count = min(job.max_variants, VARIANTS_PER_JOB)
            for variant in range(variant_count):
                kwargs = {
                    "prompt": provider_ready_prompt(job),
                    "width": job.width,
                    "height": job.height,
                    "guidance_scale": 1.0,
                    "num_inference_steps": 4,
                    "generator": torch.Generator(device="cuda").manual_seed(
                        _seed(plan["packageDigest"], job.job_id, variant)
                    ),
                }
                if references:
                    kwargs["image"] = references

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


def execute_plan(plan_json: str, admission_json: str):
    """Verify provider admission before entering the metered GPU function."""
    try:
        plan = validate_plan(json.loads(plan_json))
        capability = json.loads(admission_json)
        secret = os.environ.get("VISUAL_FACTORY_ADMISSION_SECRET", "")
        verify_provider_admission(
            plan,
            capability,
            secret,
            now_epoch=int(time.time()),
        )
    except Exception as exc:
        raise gr.Error(f"INVALID_VISUAL_PROVIDER_ADMISSION: {exc}") from exc
    return _execute_admitted(plan)


with gr.Blocks(title="Studio Atlas Visual Factory") as demo:
    gr.Markdown(
        "# Studio Atlas · Visual Factory\n"
        "Provider adapter di produzione. Le decisioni di qualità restano in Studio Atlas."
    )
    plan_input = gr.Textbox(label="Visual generation plan", lines=10)
    admission_input = gr.Textbox(label="Provider admission", visible=False)
    run = gr.Button("Execute bounded plan", variant="primary")
    receipt_output = gr.JSON(label="Execution receipt")
    files_output = gr.Files(label="Generated candidates")
    run.click(
        execute_plan,
        inputs=[plan_input, admission_input],
        outputs=[receipt_output, files_output],
        api_name="execute",
    )


demo.queue(default_concurrency_limit=1)

if __name__ == "__main__":
    demo.launch()
