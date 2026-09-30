#!/usr/bin/env python3
import json
from pathlib import Path

import build_ecosystem_snapshot as builder

ROOT = Path(__file__).resolve().parents[1]
OVERLAY = ROOT / "control-center/fixtures/project-knowledge/live-component-evidence-atlas-r1.json"

snapshot = builder.build_snapshot(ROOT, live_component_overlay=json.loads(OVERLAY.read_text(encoding="utf-8")))
by_id = {item["componentId"]: item for item in snapshot["components"]}

for component_id in (
    "ATLAS.RELATION_EXPLORER.FAMILY",
    "ATLAS.CURRICULUM_TREE.DISCLOSURE",
):
    component = by_id[component_id]
    isolated = component["evidenceStatus"]["ISOLATED"]
    assert isolated["status"] == "PRESENT"
    assert isolated["sourcePlane"] == "LIVE_VERIFIED"
    assert isolated["exactHead"] == "fe43bb037ae0bd5bc13aba40e17875d1673667c2"
    assert component["lifecycle"] == "PROPOSED"
    assert component["maturity"]["confirmedStage"] == "REGISTERED"
    assert component["maturity"]["candidateStage"] == "ACCESSIBILITY"

collector_source = (ROOT / "scripts/collect_atlas_live_component_evidence_r1.py").read_text(encoding="utf-8")
for forbidden in ("github.token", "GITHUB_TOKEN", "GH_TOKEN", "git push", "gh pr", "contents: write", "pull-requests: write", "/merge"):
    assert forbidden not in collector_source, f"forbidden live collector capability: {forbidden}"

assert snapshot["integrityChecks"]
assert all(item["status"] != "ISSUE" or item["id"] != "INT-COMPONENT-EVIDENCE-PROJECTION" for item in snapshot["integrityChecks"])
print("TRAMA_CONTROL_CENTER_LIVE_COMPONENT_EVIDENCE_R1_PASS")
