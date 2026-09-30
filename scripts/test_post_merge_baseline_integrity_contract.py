#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
workflow = (ROOT / ".github/workflows/post-merge-baseline-integrity.yml").read_text(encoding="utf-8")

required = [
    "name: TRAMA Post-Merge Baseline Integrity",
    "push:",
    "branches: [main]",
    "contents: read",
    "persist-credentials: false",
    "python scripts/build_project_context_snapshot.py --check",
    "python scripts/validate_project_knowledge_schemas.py",
    "python scripts/test_component_evidence_lane_v2.py",
]

for token in required:
    if token not in workflow:
        raise SystemExit(f"POST_MERGE_REQUIRED_TOKEN_MISSING: {token}")

for forbidden in [
    "contents: write",
    "pull-requests: write",
    "issues: write",
    "actions: write",
    "git push",
    "gh pr",
    "/merge",
    "workflow_dispatch:",
    "schedule:",
]:
    if forbidden in workflow:
        raise SystemExit(f"POST_MERGE_FORBIDDEN_CAPABILITY: {forbidden}")

print("TRAMA_POST_MERGE_BASELINE_INTEGRITY_CONTRACT_PASS")
