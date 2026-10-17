#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GRAPH_PATH = ROOT / "governance/access/trama-ecosystem-state-v0.3.json"


def main() -> int:
    graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    flows = {item["id"]: item for item in graph["flows"]}

    studio_authoring = flows["docente_os_to_studio_atlas"]["nextAllowedIntervention"]
    assert studio_authoring["preconditions"], (
        "docente_os_to_studio_atlas missing structured Studio Atlas contract preconditions"
    )
    assert studio_authoring["forbiddenUntil"], (
        "docente_os_to_studio_atlas missing structured Studio Atlas contract blocker"
    )
    guardrails = " ".join(
        studio_authoring["preconditions"] + studio_authoring["forbiddenUntil"]
    ).lower()
    assert "contratto" in guardrails and "studio atlas" in guardrails, (
        "docente_os_to_studio_atlas guardrails do not bind the Studio Atlas contract"
    )

    print("TRAMA_ECOSYSTEM_STATE_V03_WORK_ADMISSION_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
