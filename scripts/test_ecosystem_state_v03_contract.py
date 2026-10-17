#!/usr/bin/env python3
from __future__ import annotations

import copy
import json
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VALIDATOR = ROOT / "scripts/validate_ecosystem_state_v03.py"
SCHEMA = ROOT / "schemas/trama-ecosystem-state-v0.3.schema.json"

assert VALIDATOR.exists(), "RED_EXPECTED: scripts/validate_ecosystem_state_v03.py is missing"
assert SCHEMA.exists(), "RED_EXPECTED: schemas/trama-ecosystem-state-v0.3.schema.json is missing"

sys.path.insert(0, str(ROOT / "scripts"))
from validate_ecosystem_state_v03 import EcosystemStateValidationError, validate_graph  # noqa: E402


def base_document() -> dict:
    return {
        "schemaVersion": "trama.ecosystem.state/v0.3",
        "asOf": "2026-10-17",
        "authorityPolicy": {"graphState": "this-document"},
        "legend": {"states": ["REAL", "PARTIAL", "DESIGNED", "DEFERRED"]},
        "externalActors": [
            {"id": "public", "label": "Pubblico", "kind": "HUMAN_ACTOR"}
        ],
        "nodes": [
            {
                "id": "gateway",
                "label": "TRAMA Gateway",
                "plane": "PUBLIC",
                "state": "REAL",
                "targetState": "REAL",
                "boundary": "Ingresso pubblico governato",
                "authorityOwner": "trama",
                "authorityRefs": ["path:docs/superpowers/specs/2026-10-17-trama-ecosystem-state-v0.3-design.md"],
                "implementationOwners": ["trama"],
                "maturityRef": None,
                "evidenceRefs": ["path:docs/superpowers/specs/2026-10-17-trama-ecosystem-state-v0.3-design.md"],
                "blockerRefs": [],
                "gap": {"summary": "none", "missing": []},
                "target": {"boundary": "Ingresso pubblico governato", "value": "Accesso pubblico"},
                "nextAllowedIntervention": {"action": "NONE", "preconditions": [], "forbiddenUntil": []},
                "sourceRefs": ["path:docs/superpowers/specs/2026-10-17-trama-ecosystem-state-v0.3-design.md"],
                "lastSignificantChange": None,
                "decisionRefs": [],
            },
            {
                "id": "atlas",
                "label": "Curricolo Atlas",
                "plane": "PUBLIC",
                "state": "PARTIAL",
                "targetState": "REAL",
                "boundary": "Pubblicazione curricolare parziale",
                "authorityOwner": "atlas",
                "authorityRefs": ["path:docs/superpowers/specs/2026-10-17-trama-ecosystem-state-v0.3-design.md"],
                "implementationOwners": ["atlas"],
                "maturityRef": "atlas",
                "evidenceRefs": ["path:docs/superpowers/specs/2026-10-17-trama-ecosystem-state-v0.3-design.md"],
                "blockerRefs": [],
                "gap": {"summary": "Manca la prova completa del confine", "missing": ["prova end-to-end"]},
                "target": {"boundary": "Pubblicazione curricolare governata", "value": "Navigazione curricolare"},
                "nextAllowedIntervention": {"action": "Qualificare il confine", "preconditions": [], "forbiddenUntil": []},
                "sourceRefs": ["path:docs/superpowers/specs/2026-10-17-trama-ecosystem-state-v0.3-design.md"],
                "lastSignificantChange": None,
                "decisionRefs": [],
            },
        ],
        "flows": [
            {
                "id": "public_to_gateway",
                "from": "public",
                "to": "gateway",
                "kind": "NAVIGATION",
                "state": "REAL",
                "targetState": "REAL",
                "boundary": "Ingresso pubblico",
                "authorityOwner": "trama",
                "authorityRefs": ["path:docs/superpowers/specs/2026-10-17-trama-ecosystem-state-v0.3-design.md"],
                "implementationOwners": ["trama"],
                "maturityRef": None,
                "evidenceRefs": ["path:docs/superpowers/specs/2026-10-17-trama-ecosystem-state-v0.3-design.md"],
                "blockerRefs": [],
                "gap": {"summary": "none", "missing": []},
                "target": {"boundary": "Ingresso pubblico", "value": "Accesso pubblico"},
                "nextAllowedIntervention": {"action": "NONE", "preconditions": [], "forbiddenUntil": []},
                "sourceRefs": ["path:docs/superpowers/specs/2026-10-17-trama-ecosystem-state-v0.3-design.md"],
                "lastSignificantChange": None,
                "decisionRefs": [],
            }
        ],
        "views": {"gapDefault": "state-diff-or-missing"},
        "transitionPolicy": {"autoPromotion": False},
    }


def prepare_root(path: Path) -> None:
    maturity = path / "governance/maturity"
    maturity.mkdir(parents=True)
    (maturity / "trama-maturity-reconciliation-v1.json").write_text(
        json.dumps({"areas": [{"area": "atlas", "observedLevel": 4}]}),
        encoding="utf-8",
    )
    target = path / "docs/superpowers/specs"
    target.mkdir(parents=True)
    (target / "2026-10-17-trama-ecosystem-state-v0.3-design.md").write_text("spec", encoding="utf-8")


def expect_invalid(document: dict, root: Path, needle: str) -> None:
    try:
        validate_graph(document, root)
    except EcosystemStateValidationError as exc:
        assert needle.lower() in str(exc).lower(), (needle, str(exc))
    else:
        raise AssertionError(f"Expected invalid graph containing: {needle}")


def main() -> int:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        prepare_root(root)

        validate_graph(base_document(), root)

        doc = base_document()
        doc["nodes"][0]["state"] = "IMPLEMENTED"
        expect_invalid(doc, root, "state")

        doc = base_document()
        doc["nodes"].append(copy.deepcopy(doc["nodes"][0]))
        expect_invalid(doc, root, "duplicate node")

        doc = base_document()
        doc["flows"].append(copy.deepcopy(doc["flows"][0]))
        expect_invalid(doc, root, "duplicate flow")

        doc = base_document()
        doc["flows"][0]["from"] = "undeclared_actor"
        expect_invalid(doc, root, "endpoint")

        doc = base_document()
        doc["nodes"][1]["state"] = "DEFERRED"
        doc["nodes"][1]["decisionRefs"] = []
        expect_invalid(doc, root, "deferred")

        doc = base_document()
        doc["flows"][0]["authorityOwner"] = None
        doc["flows"][0]["authorityRefs"] = []
        expect_invalid(doc, root, "authorityrefs")

        doc = base_document()
        doc["nodes"][1]["maturityRef"] = "unknown-area"
        expect_invalid(doc, root, "maturity")

        doc = base_document()
        doc["nodes"][0]["evidenceRefs"] = ["path:docs/evidence/does-not-exist.md"]
        expect_invalid(doc, root, "does-not-exist")

        doc = base_document()
        doc["nodes"][1]["gap"] = {"summary": "", "missing": []}
        expect_invalid(doc, root, "gap")

        doc = base_document()
        doc["flows"][0]["authorityOwner"] = None
        doc["flows"][0]["authorityRefs"] = ["path:docs/superpowers/specs/2026-10-17-trama-ecosystem-state-v0.3-design.md"]
        validate_graph(doc, root)

    print("TRAMA_ECOSYSTEM_STATE_V03_CONTRACT_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
