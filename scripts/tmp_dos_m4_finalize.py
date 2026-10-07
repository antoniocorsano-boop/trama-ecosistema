#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
workflow_path = ROOT / ".github/workflows/control-center-snapshot.yml"
workflow = workflow_path.read_text(encoding="utf-8")

replacements = [
    (
        'assert areas["docente-os"]["confirmedLevel"] == 3, areas["docente-os"]',
        'assert areas["docente-os"]["confirmedLevel"] == 4, areas["docente-os"]',
        'docente-os confirmed level',
    ),
    (
        'assert areas["docente-os"]["nextRequiredEvidenceTypes"] == ["RUNTIME_CANARY"], areas["docente-os"]',
        'assert set(areas["docente-os"]["nextRequiredEvidenceTypes"]) == {"REGRESSION_HISTORY", "ADOPTION_EVIDENCE"}, areas["docente-os"]',
        'docente-os next evidence',
    ),
    (
        '''          assert not any(\n              item.get("area") == "docente-os" and item.get("type") == "RUNTIME_CANARY"\n              for item in snapshot["evidence"]\n          )''',
        '''          assert any(\n              item.get("id") == "EV-MAT-DOS-RUNTIME-CANARY-2026-10-07"\n              and item.get("type") == "RUNTIME_CANARY"\n              and (item.get("binding") or {}).get("exactHead") == "39bce05fa2e87f3746ee3b6dcd7433065cb2d876"\n              for item in snapshot["evidence"]\n          )''',
        'runtime canary evidence',
    ),
]

for old, new, label in replacements:
    if new in workflow:
        continue
    if workflow.count(old) != 1:
        raise RuntimeError(f"{label}: expected one old form or existing new form")
    workflow = workflow.replace(old, new, 1)

workflow_path.write_text(workflow, encoding="utf-8")
print("DOS_M4_WORKFLOW_FINALIZATION_READY")
