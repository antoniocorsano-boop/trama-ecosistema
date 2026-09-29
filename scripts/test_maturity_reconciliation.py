#!/usr/bin/env python3
from pathlib import Path
import json
import sys

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))

import build_ecosystem_snapshot as snapshot_builder

status_text=(ROOT/"STATUS.md").read_text(encoding="utf-8")
roadmap_text=(ROOT/"ROADMAP.md").read_text(encoding="utf-8")
plan_text=(ROOT/"docs/strategy/atomic-operating-plan-2026-09-22.md").read_text(encoding="utf-8")
backlog=json.loads((ROOT/"governance/maturity/trama-maturity-reconciliation-v1.json").read_text(encoding="utf-8"))

for stale in [
    "ECO-02/P1 | **ACTIVE**",
    "Pilota controllato attivo",
    "CC3-F1 ACTIVE",
    "CC3-F1 ACTIVE / HUMAN REVIEW PENDING",
    "GATE-CC3-F1-HUMAN — OPEN",
    "Gate residuo per chiudere ECO-02/P1",
    "Prima della chiusura devono risultare insieme",
]:
    assert stale not in status_text, stale

assert "CLOSED_VERIFIED / HUMAN REVIEW PASS" in status_text
assert "CC3-F1 CLOSED" in status_text
assert "CC3-F1 — Next Transition Engine** — CLOSED / HUMAN EXACT-HEAD REVIEW PASS" in roadmap_text
assert "Prerequisiti già chiusi: **ECO-02/P1** e **R3-F0/S3-V2**." in roadmap_text
assert "A1 ECO-02/P1 e A2 Atlas R3-F0/S3 sono chiusi e verificati" in plan_text

snapshot=snapshot_builder.build_snapshot(ROOT)
snapshot_builder.validate(snapshot)
assert snapshot["schemaVersion"]=="1.5.0"

areas={a["id"]:a for a in snapshot["areas"]}
assert set(areas)=={"governance","arena","atlas","docente-os"}

for area in areas.values():
    assert area["interpretation"]=="BOUND_EVIDENCE_ONLY"
    assert area["evidenceBindingStatus"] in {"NONE","PARTIAL","COMPLETE"}
    assert area["candidateLevel"]==area["confirmedLevel"]
    assert isinstance(area["nextRequiredEvidenceTypes"],list)

assert areas["arena"]["confirmedLevel"]==0
assert areas["arena"]["evidenceBindingStatus"]=="NONE"
assert areas["arena"]["nextTargetLevel"]==1
assert areas["arena"]["nextRequiredEvidenceTypes"]==["DOCUMENT_CANONICAL"]

assert areas["docente-os"]["confirmedLevel"]==0
assert areas["docente-os"]["evidenceBindingStatus"]=="NONE"
assert areas["docente-os"]["nextRequiredEvidenceTypes"]==["DOCUMENT_CANONICAL"]

assert areas["atlas"]["confirmedLevel"]==0
assert areas["atlas"]["evidenceBindingStatus"]=="PARTIAL"
assert "DOCUMENT_CANONICAL" in areas["atlas"]["nextRequiredEvidenceTypes"]

assert areas["governance"]["confirmedLevel"]==1
assert areas["governance"]["evidenceBindingStatus"]=="PARTIAL"
assert "CONTRACT_APPROVED" in areas["governance"]["nextRequiredEvidenceTypes"]

assert backlog["policy"]["evidenceBoundOnly"] is True
assert backlog["components"]["currentRegistryCount"]==6
assert set(backlog["components"]["missingProductCoverage"])=={"ATLAS","DOCENTE_OS"}
assert backlog["functionalSequence"][:2]==["R3-P2","R3-P5"]

timeline={item["id"] for item in snapshot["timelineEvents"]}
assert "EVT-ECO02-P1-FINAL-HUMAN-PASS" in timeline
assert "EVT-CC3-F1-HUMAN-PASS" in timeline

ui=(ROOT/"control-center/maturity.html").read_text(encoding="utf-8")
assert "Un livello basso può indicare prove non ancora bound" in ui
assert "Prove bound" in ui
assert "nextRequiredEvidenceTypes" in ui
assert "confidenceLabel" not in ui

print("TRAMA_MATURITY_RECONCILIATION_01_PASS")
