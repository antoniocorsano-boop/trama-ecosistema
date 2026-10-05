#!/usr/bin/env python3
"""Deploy the Studio Atlas Visual Factory adapter to one FREE_ONLY HF ZeroGPU Space.

This helper is intentionally inert without explicit token configuration. It can
create/update only a private Gradio Space on the ZeroGPU flavor and refuses paid
account/quota classes, foreign namespaces, paid hardware, or silent fallbacks.
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path
from typing import Any

ZERO_GPU_FLAVOR = "zero-a10g"
FREE_ZERO_GPU_BASE_SECONDS = 300.0
DEFAULT_SPACE_NAME = "studio-atlas-visual-factory-v02"


def space_create_kwargs() -> dict[str, Any]:
    return {
        "repo_type": "space",
        "space_sdk": "gradio",
        "space_hardware": ZERO_GPU_FLAVOR,
        "private": True,
        "exist_ok": True,
    }


def validate_free_only_identity(identity: dict[str, Any], repo_id: str) -> None:
    if identity.get("type") != "user" or identity.get("isPro") is True or identity.get("is_pro") is True:
        raise ValueError("FREE_ONLY_ACCOUNT_REQUIRED")

    owner = str(identity.get("name") or "").strip()
    if not owner:
        raise ValueError("HF_IDENTITY_NAME_MISSING")
    namespace = repo_id.split("/", 1)[0] if "/" in repo_id else ""
    if namespace != owner:
        raise ValueError("HF_SPACE_NAMESPACE_MISMATCH")


def validate_free_only_quota(quota: Any) -> None:
    base = float(getattr(quota, "base", -1))
    remaining = float(getattr(quota, "remaining", -1))
    overquota_used = getattr(quota, "overquota_used", None)
    if base <= 0 or base > FREE_ZERO_GPU_BASE_SECONDS:
        raise ValueError("FREE_ONLY_QUOTA_CLASS_REQUIRED")
    if remaining < 0 or remaining > base:
        raise ValueError("ZERO_GPU_QUOTA_INVALID")
    if overquota_used not in (None, 0, 0.0):
        raise ValueError("PAID_OVERQUOTA_NOT_ALLOWED")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-id", default=os.environ.get("HF_VISUAL_FACTORY_SPACE_REPO", ""))
    parser.add_argument("--token", default=os.environ.get("HF_TOKEN", ""))
    parser.add_argument("--source", default="services/visual-factory-hf")
    args = parser.parse_args()

    token = args.token.strip()
    if not token:
        print("NOT_CONFIGURED")
        return 0

    source = Path(args.source)
    required = ["app.py", "contract.py", "requirements.txt"]
    missing = [name for name in required if not (source / name).is_file()]
    if missing:
        raise SystemExit(f"MISSING_EXECUTOR_FILES:{','.join(missing)}")

    from huggingface_hub import HfApi

    api = HfApi(token=token)
    identity = api.whoami(cache=True)
    owner = str(identity.get("name") or "").strip()
    repo_id = args.repo_id.strip() or (f"{owner}/{DEFAULT_SPACE_NAME}" if owner else "")
    if not repo_id:
        raise SystemExit("HF_SPACE_REPO_UNRESOLVED")

    try:
        validate_free_only_identity(identity, repo_id)
        quota = api.get_zero_gpu_quota()
        validate_free_only_quota(quota)
    except Exception as exc:
        raise SystemExit(f"FREE_ONLY_PRECHECK_FAILED:{exc}") from exc

    api.create_repo(repo_id=repo_id, **space_create_kwargs())

    readme = """---
title: Studio Atlas Visual Factory
emoji: 🖼️
colorFrom: indigo
colorTo: gray
sdk: gradio
sdk_version: 6.29.1
app_file: app.py
pinned: false
models:
  - black-forest-labs/FLUX.2-klein-4B
---

# Studio Atlas Visual Factory

Private FREE_ONLY ZeroGPU provider adapter for governed Studio Atlas visual production.
No learner, publication, runtime, billing, or quality authority is granted by this Space.
"""
    api.upload_file(
        path_or_fileobj=readme.encode("utf-8"),
        path_in_repo="README.md",
        repo_id=repo_id,
        repo_type="space",
        commit_message="Visual Factory: update ZeroGPU Space metadata",
    )
    for name in required:
        api.upload_file(
            path_or_fileobj=str(source / name),
            path_in_repo=name,
            repo_id=repo_id,
            repo_type="space",
            commit_message=f"Visual Factory: update {name}",
        )

    runtime = api.get_space_runtime(repo_id=repo_id)
    requested = getattr(runtime, "requested_hardware", None)
    hardware = getattr(runtime, "hardware", None)
    if requested != ZERO_GPU_FLAVOR and hardware != ZERO_GPU_FLAVOR:
        raise SystemExit(
            f"ZERO_GPU_NOT_SELECTED:hardware={hardware}:requested={requested}"
        )

    quota = api.get_zero_gpu_quota()
    validate_free_only_quota(quota)
    print(f"DEPLOYED_ZERO_GPU:{repo_id}")
    print(f"ZERO_GPU_REMAINING_SECONDS:{int(quota.remaining)}")
    print(f"ZERO_GPU_RESETS_AT:{quota.resets_at}")
    print("PAID_FALLBACK:false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
