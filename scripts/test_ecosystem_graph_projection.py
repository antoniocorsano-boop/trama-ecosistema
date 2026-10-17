#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import build_ecosystem_snapshot as snapshot_builder


def main() -> int:
    snapshot = snapshot_builder.build_snapshot(ROOT)
    assert snapshot["schemaVersion"] == "1.7.0", (
        "RED_EXPECTED: snapshot schema has not moved to 1.7.0",
        snapshot.get("schemaVersion"),
    )
    assert "ecosystemGraph" in snapshot, "RED_EXPECTED: ecosystemGraph projection is missing"
    graph = snapshot["ecosystemGraph"]
    assert graph["schemaVersion"] == "trama.ecosystem.state/v0.3"
    assert graph["sourceRef"] == "governance/access/trama-ecosystem-state-v0.3.json"
    graph_source = snapshot["sourceState"]["ecosystem-state-v0.3"]
    assert graph_source["status"] == "FRESH"
    assert graph_source["ref"] == "governance/access/trama-ecosystem-state-v0.3.json"
    assert len(graph_source["sha256"]) == 64

    canonical = snapshot_builder.core.load_json(ROOT / "governance/access/trama-ecosystem-state-v0.3.json")
    assert len(graph["nodes"]) == len(canonical["nodes"])
    assert len(graph["flows"]) == len(canonical["flows"])
    assert {item["id"] for item in graph["nodes"]} == {item["id"] for item in canonical["nodes"]}
    assert {item["id"] for item in graph["flows"]} == {item["id"] for item in canonical["flows"]}

    nodes = {item["id"]: item for item in graph["nodes"]}
    flows = {item["id"]: item for item in graph["flows"]}
    assert nodes["trama_access"]["state"] == "PARTIAL"
    assert flows["trama_access_to_docente_os"]["state"] == "DESIGNED"
    assert nodes["docente_os"]["maturityRef"] == "docente-os"
    assert nodes["docente_os"]["maturityContext"]["confirmedLevel"] == 5
    assert nodes["studio_atlas"]["maturityContext"]["confirmedLevel"] == 1

    canonical_nodes = {item["id"]: item for item in canonical["nodes"]}
    assert "maturityContext" not in canonical_nodes["docente_os"]
    assert graph["externalActors"] == canonical["externalActors"]
    print("TRAMA_ECOSYSTEM_GRAPH_PROJECTION_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
