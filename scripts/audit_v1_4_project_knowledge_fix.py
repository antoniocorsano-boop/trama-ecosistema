import json
from pathlib import Path

path = Path("status/project-knowledge-events.json")
data = json.loads(path.read_text(encoding="utf-8"))
TARGET = "TRAMA-EVT-AUDIT-V1.4-VISUAL-FACTORY-LIVE-PROOF-2026-10-05"
found = False
for event in data["events"]:
    if event.get("eventId") == TARGET:
        found = True
        event["rationale"] = (
            "project-knowledge projection of Audit v1.4: reconciles the governed completion audit with evidence integrated after Audit v1.3 while preserving the distinction between technical execution, human visual acceptance, maturity promotion and runtime authority."
        )
        break
if not found:
    raise SystemExit("AUDIT_V1_4_EVENT_NOT_FOUND")
path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("AUDIT_V1_4_PROJECT_KNOWLEDGE_SELECTOR_FIXED")
