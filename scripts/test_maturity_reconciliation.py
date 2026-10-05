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
assert snapshot["schemaVersion"]=="1.6.0"

areas={a["id"]:a for a in snapshot["areas"]}
assert set(areas)=={"governance","arena","atlas","docente-os","studio-atlas"}

for area in areas.values():
    assert area["interpretation"]=="BOUND_EVIDENCE_ONLY"
    assert area["evidenceBindingStatus"] in {"NONE","PARTIAL","COMPLETE"}
    assert area["candidateLevel"]==area["confirmedLevel"]
    assert isinstance(area["nextRequiredEvidenceTypes"],list)

assert areas["governance"]["confirmedLevel"]==4
assert areas["governance"]["evidenceBindingStatus"]=="PARTIAL"
assert areas["governance"]["nextTargetLevel"]==5
assert areas["governance"]["nextRequiredEvidenceTypes"]==["REGRESSION_HISTORY"]

assert areas["arena"]["confirmedLevel"]==4
assert areas["arena"]["evidenceBindingStatus"]=="PARTIAL"
assert areas["arena"]["nextTargetLevel"]==5
assert areas["arena"]["nextRequiredEvidenceTypes"]==["REGRESSION_HISTORY"]

assert areas["atlas"]["confirmedLevel"]==4
assert areas["atlas"]["evidenceBindingStatus"]=="PARTIAL"
assert areas["atlas"]["nextTargetLevel"]==5
assert set(areas["atlas"]["nextRequiredEvidenceTypes"])=={"REGRESSION_HISTORY","ADOPTION_EVIDENCE"}

assert areas["docente-os"]["confirmedLevel"]==3
assert areas["docente-os"]["evidenceBindingStatus"]=="PARTIAL"
assert areas["docente-os"]["nextTargetLevel"]==4
assert areas["docente-os"]["nextRequiredEvidenceTypes"]==["RUNTIME_CANARY"]
assert not any(
    item.get("area")=="docente-os" and item.get("type")=="RUNTIME_CANARY"
    for item in snapshot["evidence"]
)

assert areas["studio-atlas"]["ownerDomain"]=="Studio Atlas"
assert areas["studio-atlas"]["confirmedLevel"]==1
assert areas["studio-atlas"]["candidateLevel"]==1
assert areas["studio-atlas"]["evidenceBindingStatus"]=="PARTIAL"
assert areas["studio-atlas"]["nextTargetLevel"]==2
assert areas["studio-atlas"]["nextRequiredEvidenceTypes"]==["CONTRACT_APPROVED"]

assert backlog["policy"]["evidenceBoundOnly"] is True
assert {x["area"]:x["observedLevel"] for x in backlog["areas"]}=={
    "governance":4,"arena":4,"atlas":4,"docente-os":3,"studio-atlas":1
}
assert backlog["components"]["currentRegistryCount"]==11
assert backlog["components"]["missingProductCoverage"]==["Studio Atlas"]
assert backlog["components"]["coverageState"]=="PARTIAL_PRODUCT_COVERAGE"
assert backlog["components"]["qualificationState"]=="PARTIAL"
assert not any(target.startswith("ARENA.DIALOG_CONFIRM.GOVERNED:") for target in backlog["components"]["nextTargets"])
assert not any(target.startswith("ARENA.TABS.GOVERNED:") for target in backlog["components"]["nextTargets"])
assert backlog["functionalSequence"]==["AUDIT_V1_3_BASELINE_RECONCILIATION","STUDIO_ATLAS_PR_CONSOLIDATION","VF_ORCH_01_BOUNDED_CLOSEOUT","VISUAL_FACTORY_FIRST_GOVERNED_RUN","MUSEO_ZERO_V0_2_SECOND_HUMAN_REVIEW","STUDIO_ATLAS_S5","STUDIO_ATLAS_S6"]

timeline={item["id"] for item in snapshot["timelineEvents"]}
assert "EVT-ECO02-P1-FINAL-HUMAN-PASS" in timeline
assert "EVT-CC3-F1-HUMAN-PASS" in timeline

ui=(ROOT/"control-center/maturity.html").read_text(encoding="utf-8")
assert "Un livello basso può indicare prove non ancora bound" in ui
assert "Prove bound" in ui
assert "nextRequiredEvidenceTypes" in ui
assert "confidenceLabel" not in ui

print("TRAMA_MATURITY_RECONCILIATION_01_PASS")
