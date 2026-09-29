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
    tmp = Path(tmp)
    output = tmp / "project-knowledge.json"
    overlay_path = tmp / "live-overlay.json"
    overlay = json.loads(
        (ROOT / "control-center/fixtures/project-knowledge/live-overlay-head-drift.json").read_text(encoding="utf-8")
    )
    overlay["pullRequests"] = [{
        "repository": "antoniocorsano-boop/Curriculum-Atlas",
        "number": 57,
        "state": "open",
        "draft": False,
        "merged": False,
        "observedHead": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "observedAt": overlay["observedAt"],
        "sourceRefs": ["fixture:pull-request-57"]
    }]
    overlay_path.write_text(json.dumps(overlay), encoding="utf-8")

    pack = module.materialize(
        ROOT / "control-center/data/project-context-snapshot.json",
        overlay_path,
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
pull_request_facts = [
    fact for fact in effective["liveFacts"]
    if fact.get("subject") == "pull-request"
]
assert pull_request_facts == [{
    "class": "VOLATILE",
    "subject": "pull-request",
    "repository": "antoniocorsano-boop/Curriculum-Atlas",
    "number": 57,
    "state": "open",
    "draft": False,
    "merged": False,
    "observedHead": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "observedAt": "2026-09-29T06:30:00Z"
}]

print("TRAMA live Project Knowledge bundle materialization: PASS")
