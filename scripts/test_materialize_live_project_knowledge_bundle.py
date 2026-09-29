#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_module(name: str, path: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / path)
    if spec is None or spec.loader is None:
        raise RuntimeError(path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


module = load_module(
    "materialize_live_project_knowledge_bundle",
    "scripts/materialize_live_project_knowledge_bundle.py",
)

with tempfile.TemporaryDirectory(prefix="trama-live-pack-") as tmp:
    output = Path(tmp) / "project-knowledge.json"
    pack = module.materialize(
        ROOT / "control-center/data/project-context-snapshot.json",
        ROOT / "control-center/fixtures/project-knowledge/live-overlay-head-drift.json",
        output,
    )
    assert output.exists()
    persisted = json.loads(output.read_text(encoding="utf-8"))
    assert persisted == pack

effective = pack["effectiveContext"]
assert effective["governedKnowledgeStatus"] == "CURRENT"
assert effective["liveObservationStatus"] == "FRESH"
assert effective["semanticDriftStatus"] == "NONE"
assert effective["effectiveContextStatus"] == "USABLE"
assert effective["promotionRequired"] is False
assert pack["status"] == "CURRENT"
assert pack["subject"] == "project-knowledge"

print("TRAMA live Project Knowledge bundle materialization: PASS")
