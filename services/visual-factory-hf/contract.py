"""Pure contract layer for the Studio Atlas Hugging Face visual executor.

This module has no ML dependencies so CI can validate the provider boundary without
loading models or allocating GPU capacity.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
import hmac
import json
import uuid
from typing import Any

SCHEMA = "atlas.visual-generation-plan/v0.1"
RECEIPT_SCHEMA = "atlas.visual-execution-receipt/v0.1"
PROVIDER_ADMISSION_SCHEMA = "atlas.visual-provider-admission/v0.1"
ALLOWED_PURPOSES = {"CHARACTER_REFERENCE", "ENVIRONMENT_REFERENCE", "SCENE_FRAME"}
ALLOWED_ASPECTS = {
    "3:4": (768, 1024),
    "4:3": (1024, 768),
    "1:1": (896, 896),
    "16:9": (1024, 576),
    "9:16": (576, 1024),
}
MAX_JOBS = 6
MAX_VARIANTS = 1
MAX_ADMISSION_TTL_SECONDS = 300


@dataclass(frozen=True)
class ExecutionJob:
    job_id: str
    purpose: str
    subject_ref: str
    shot_id: str | None
    scene_ref: str | None
    prompt: str
    negative_constraints: tuple[str, ...]
    reference_inputs: tuple[str, ...]
    reference_input_digests: tuple[str, ...]
    width: int
    height: int
    max_variants: int
    preflight_receipt_id: str
    preflight_spec_digest: str
    compiled_prompt_digest: str
    preflight_state: str


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def _is_digest(value: Any) -> bool:
    return isinstance(value, str) and len(value) == 64 and all(c in "0123456789abcdef" for c in value)


def validate_plan(value: dict[str, Any]) -> dict[str, Any]:
    _require(isinstance(value, dict), "INVALID_PLAN")
    _require(value.get("schemaVersion") == SCHEMA, "UNSUPPORTED_SCHEMA")
    _require(isinstance(value.get("pathwayId"), str) and value["pathwayId"], "PATHWAY_REQUIRED")
    digest = value.get("packageDigest")
    _require(_is_digest(digest), "PACKAGE_DIGEST_INVALID")

    for field in (
        "paidComputeAuthorized",
        "allowQualityDowngrade",
        "runtimeAuthorized",
        "publicationAuthorityGranted",
    ):
        _require(value.get(field) is False, "AUTHORITY_VIOLATION")

    jobs = value.get("jobs")
    _require(isinstance(jobs, list) and 1 <= len(jobs) <= MAX_JOBS, "JOB_COUNT_INVALID")

    for job in jobs:
        _require(isinstance(job, dict), "JOB_INVALID")
        _require(isinstance(job.get("jobId"), str) and job["jobId"], "JOB_ID_REQUIRED")
        purpose = job.get("purpose")
        _require(purpose in ALLOWED_PURPOSES, "PURPOSE_UNSUPPORTED")
        _require(isinstance(job.get("subjectRef"), str) and job["subjectRef"], "SUBJECT_REF_REQUIRED")
        _require(isinstance(job.get("prompt"), str) and job["prompt"].strip(), "PROMPT_REQUIRED")
        _require(job.get("aspectRatio") in ALLOWED_ASPECTS, "ASPECT_RATIO_UNSUPPORTED")
        variants = job.get("maxVariants")
        _require(isinstance(variants, int) and variants == MAX_VARIANTS, "MAX_VARIANTS_MUST_BE_ONE")
        _require(
            isinstance(job.get("preflightReceiptId"), str) and bool(job["preflightReceiptId"]),
            "PREFLIGHT_RECEIPT_REQUIRED",
        )
        _require(_is_digest(job.get("preflightSpecDigest")), "PREFLIGHT_SPEC_DIGEST_INVALID")
        _require(_is_digest(job.get("compiledPromptDigest")), "COMPILED_PROMPT_DIGEST_INVALID")
        _require(job.get("preflightState") == "PREFLIGHT_PASS", "PREFLIGHT_NOT_PASSED")
        refs = job.get("referenceInputs", [])
        _require(isinstance(refs, list) and all(isinstance(ref, str) and ref for ref in refs), "REFERENCE_INPUT_INVALID")
        ref_digests = job.get("referenceInputDigests", [] if not refs else None)
        _require(
            isinstance(ref_digests, list)
            and len(ref_digests) == len(refs)
            and all(_is_digest(item) for item in ref_digests),
            "REFERENCE_INPUT_DIGEST_INVALID",
        )
        if purpose == "SCENE_FRAME":
            _require(bool(refs), "SCENE_REFERENCE_REQUIRED")
            _require(isinstance(job.get("shotId"), str) and job["shotId"], "SHOT_ID_REQUIRED")
            _require(isinstance(job.get("sceneRef"), str) and job["sceneRef"], "SCENE_REF_REQUIRED")

    return value


def compile_execution_jobs(plan: dict[str, Any]) -> list[ExecutionJob]:
    validate_plan(plan)
    compiled: list[ExecutionJob] = []
    for job in plan["jobs"]:
        width, height = ALLOWED_ASPECTS[job["aspectRatio"]]
        refs = tuple(job.get("referenceInputs", []))
        compiled.append(
            ExecutionJob(
                job_id=job["jobId"],
                purpose=job["purpose"],
                subject_ref=job["subjectRef"],
                shot_id=job.get("shotId"),
                scene_ref=job.get("sceneRef"),
                prompt=job["prompt"].strip(),
                negative_constraints=tuple(job.get("negativeConstraints", [])),
                reference_inputs=refs,
                reference_input_digests=tuple(job.get("referenceInputDigests", [])),
                width=width,
                height=height,
                max_variants=job["maxVariants"],
                preflight_receipt_id=job["preflightReceiptId"],
                preflight_spec_digest=job["preflightSpecDigest"],
                compiled_prompt_digest=job["compiledPromptDigest"],
                preflight_state=job["preflightState"],
            )
        )
    return compiled


def provider_ready_prompt(job: ExecutionJob) -> str:
    """Return the exact provider-ready prompt shared by FREE_ONLY fallback adapters."""
    if not job.negative_constraints:
        return job.prompt
    avoid = ", ".join(job.negative_constraints)
    return f"{job.prompt}\n\nAvoid: {avoid}."


def _canonical_plan_json(plan: dict[str, Any]) -> str:
    validate_plan(plan)
    return json.dumps(plan, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def provider_plan_digest(plan: dict[str, Any]) -> str:
    return hashlib.sha256(_canonical_plan_json(plan).encode("utf-8")).hexdigest()


def _admission_message(plan_digest: str, issued_at_epoch: int, expires_at_epoch: int) -> bytes:
    return (
        f"{PROVIDER_ADMISSION_SCHEMA}:{plan_digest}:{issued_at_epoch}:{expires_at_epoch}"
    ).encode("utf-8")


def create_provider_admission(
    plan: dict[str, Any],
    secret: str,
    *,
    issued_at_epoch: int,
    ttl_seconds: int = 120,
) -> dict[str, Any]:
    _require(isinstance(secret, str) and bool(secret), "PROVIDER_ADMISSION_SECRET_REQUIRED")
    _require(isinstance(issued_at_epoch, int) and issued_at_epoch >= 0, "PROVIDER_ADMISSION_TIME_INVALID")
    _require(isinstance(ttl_seconds, int) and 1 <= ttl_seconds <= MAX_ADMISSION_TTL_SECONDS, "PROVIDER_ADMISSION_TTL_INVALID")
    plan_digest = provider_plan_digest(plan)
    expires_at_epoch = issued_at_epoch + ttl_seconds
    signature = hmac.new(
        secret.encode("utf-8"),
        _admission_message(plan_digest, issued_at_epoch, expires_at_epoch),
        hashlib.sha256,
    ).hexdigest()
    return {
        "schemaVersion": PROVIDER_ADMISSION_SCHEMA,
        "planDigest": plan_digest,
        "issuedAtEpoch": issued_at_epoch,
        "expiresAtEpoch": expires_at_epoch,
        "signature": signature,
    }


def verify_provider_admission(
    plan: dict[str, Any],
    capability: dict[str, Any],
    secret: str,
    *,
    now_epoch: int,
) -> None:
    _require(isinstance(secret, str) and bool(secret), "PROVIDER_ADMISSION_SECRET_REQUIRED")
    _require(isinstance(capability, dict), "PROVIDER_ADMISSION_INVALID")
    _require(capability.get("schemaVersion") == PROVIDER_ADMISSION_SCHEMA, "PROVIDER_ADMISSION_SCHEMA_INVALID")
    issued_at = capability.get("issuedAtEpoch")
    expires_at = capability.get("expiresAtEpoch")
    _require(isinstance(issued_at, int) and isinstance(expires_at, int), "PROVIDER_ADMISSION_TIME_INVALID")
    _require(0 < expires_at - issued_at <= MAX_ADMISSION_TTL_SECONDS, "PROVIDER_ADMISSION_TTL_INVALID")
    _require(isinstance(now_epoch, int) and now_epoch >= issued_at, "PROVIDER_ADMISSION_TIME_INVALID")
    if now_epoch > expires_at:
        raise ValueError("PROVIDER_ADMISSION_EXPIRED")
    expected_plan_digest = provider_plan_digest(plan)
    if capability.get("planDigest") != expected_plan_digest:
        raise ValueError("PROVIDER_ADMISSION_PLAN_MISMATCH")
    signature = capability.get("signature")
    _require(isinstance(signature, str) and len(signature) == 64, "PROVIDER_ADMISSION_SIGNATURE_INVALID")
    expected_signature = hmac.new(
        secret.encode("utf-8"),
        _admission_message(expected_plan_digest, issued_at, expires_at),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(signature, expected_signature):
        raise ValueError("PROVIDER_ADMISSION_SIGNATURE_INVALID")


def success_receipt(plan: dict[str, Any], assets: list[dict[str, Any]]) -> dict[str, Any]:
    validate_plan(plan)
    return {
        "schemaVersion": RECEIPT_SCHEMA,
        "receiptId": f"vf-hf-{uuid.uuid4()}",
        "packageDigest": plan["packageDigest"],
        "status": "SUCCEEDED",
        "costClass": "FREE_ONLY",
        "assets": assets,
        "paidComputeAuthorized": False,
        "allowQualityDowngrade": False,
        "runtimeAuthorized": False,
        "publicationAuthorityGranted": False,
    }


def waiting_receipt(plan: dict[str, Any], detail: str) -> dict[str, Any]:
    validate_plan(plan)
    return {
        "schemaVersion": RECEIPT_SCHEMA,
        "receiptId": f"vf-hf-{uuid.uuid4()}",
        "packageDigest": plan["packageDigest"],
        "status": "WAITING_FOR_COMPUTE",
        "costClass": "FREE_ONLY",
        "assets": [],
        "failureCategory": "NO_FREE_PROVIDER",
        "failureDetail": detail,
        "paidComputeAuthorized": False,
        "allowQualityDowngrade": False,
        "runtimeAuthorized": False,
        "publicationAuthorityGranted": False,
    }


def failed_receipt(plan: dict[str, Any], detail: str) -> dict[str, Any]:
    validate_plan(plan)
    return {
        "schemaVersion": RECEIPT_SCHEMA,
        "receiptId": f"vf-hf-{uuid.uuid4()}",
        "packageDigest": plan["packageDigest"],
        "status": "FAILED",
        "costClass": "FREE_ONLY",
        "assets": [],
        "failureCategory": "EXECUTION_FAILED",
        "failureDetail": detail,
        "paidComputeAuthorized": False,
        "allowQualityDowngrade": False,
        "runtimeAuthorized": False,
        "publicationAuthorityGranted": False,
    }


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
