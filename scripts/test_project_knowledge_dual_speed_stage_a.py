#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
FIX=ROOT/"control-center/fixtures/project-knowledge"

def load(name):
    return json.loads((FIX/name).read_text(encoding="utf-8"))

cases=[
    ("live-overlay-head-drift.json","effective-context-head-drift.json","HEAD_ONLY"),
    ("live-overlay-semantic-drift.json","effective-context-semantic-drift.json","SEMANTIC"),
    ("live-overlay-partial.json","effective-context-partial.json","PARTIAL")
]

for overlay_name,effective_name,kind in cases:
    overlay=load(overlay_name)
    effective=load(effective_name)
    changed=any(a["fingerprintStatus"]=="CHANGED" for a in overlay["semanticAnchors"])
    unavailable=overlay["status"] in {"PARTIAL","UNAVAILABLE"} or any(a["fingerprintStatus"] in {"UNKNOWN","UNAVAILABLE"} for a in overlay["semanticAnchors"])

    assert effective["promotionRequired"] is False

    if kind=="HEAD_ONLY":
        assert overlay["status"]=="COMPLETE"
        assert changed is False
        assert effective["liveObservationStatus"]=="FRESH"
        assert effective["semanticDriftStatus"]=="NONE"
        assert effective["effectiveContextStatus"]=="USABLE"
    elif kind=="SEMANTIC":
        assert changed is True
        assert effective["semanticDriftStatus"]=="REVIEW_REQUIRED"
        assert effective["effectiveContextStatus"]=="USABLE"
    elif kind=="PARTIAL":
        assert unavailable is True
        assert effective["liveObservationStatus"]=="PARTIAL"
        assert effective["effectiveContextStatus"]=="DEGRADED"

print("TRAMA_PROJECT_KNOWLEDGE_DUAL_SPEED_STAGE_A_CONTRACT_PASS")
