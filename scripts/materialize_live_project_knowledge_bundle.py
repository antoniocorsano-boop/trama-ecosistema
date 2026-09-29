#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_module(name: str, path: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"MODULE_LOAD_FAILED: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def materialize(snapshot_path: Path, overlay_path: Path, output_path: Path):
    composer = load_module("trama_effective_context", "scripts/compose_effective_project_context.py")
    pack_builder = load_module("trama_context_pack", "scripts/build_trama_context_pack.py")

    governed = load_json(snapshot_path)
    overlay = load_json(overlay_path)
    effective = composer.compose_effective_project_context(governed, overlay)
    pack = pack_builder.build("project-knowledge", governed, effective)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(pack, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return pack


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--snapshot",
        default="control-center/data/project-context-snapshot.json",
    )
    parser.add_argument("--overlay", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    pack = materialize(ROOT / args.snapshot, Path(args.overlay), Path(args.output))
    effective = pack["effectiveContext"]
    print(
        "TRAMA_LIVE_PROJECT_KNOWLEDGE_BUNDLE "
        f"{effective['effectiveContextStatus']} "
        f"{effective['liveObservationStatus']} "
        f"{effective['semanticDriftStatus']}"
    )


if __name__ == "__main__":
    main()
