#!/usr/bin/env python3
"""Deploy the Studio Atlas Visual Factory adapter to one explicitly configured HF Space.

This helper is intentionally inert without explicit repository + token configuration.
It never selects paid hardware, purchases capacity, or deploys automatically from PR CI.
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-id", default=os.environ.get("HF_VISUAL_FACTORY_SPACE_REPO", ""))
    parser.add_argument("--token", default=os.environ.get("HF_TOKEN", ""))
    parser.add_argument("--source", default="services/visual-factory-hf")
    args = parser.parse_args()

    repo_id = args.repo_id.strip()
    token = args.token.strip()
    if not repo_id or not token:
        print("NOT_CONFIGURED")
        return 0

    source = Path(args.source)
    required = ["app.py", "contract.py", "requirements.txt"]
    missing = [name for name in required if not (source / name).is_file()]
    if missing:
        raise SystemExit(f"MISSING_EXECUTOR_FILES:{','.join(missing)}")

    from huggingface_hub import HfApi

    api = HfApi(token=token)
    api.create_repo(
        repo_id=repo_id,
        repo_type="space",
        space_sdk="gradio",
        private=True,
        exist_ok=True,
    )

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

Private provider adapter for governed Studio Atlas visual production.
No learner/publication authority is granted by this Space.
"""
    api.upload_file(
        path_or_fileobj=readme.encode("utf-8"),
        path_in_repo="README.md",
        repo_id=repo_id,
        repo_type="space",
        commit_message="Visual Factory: update Space metadata",
    )
    for name in required:
        api.upload_file(
            path_or_fileobj=str(source / name),
            path_in_repo=name,
            repo_id=repo_id,
            repo_type="space",
            commit_message=f"Visual Factory: update {name}",
        )

    print(f"DEPLOYED:{repo_id}")
    print("HARDWARE_SELECTION_REQUIRED: configure ZeroGPU in Hugging Face Space settings")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
