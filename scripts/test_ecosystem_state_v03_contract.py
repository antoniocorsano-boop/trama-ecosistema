#!/usr/bin/env python3
from __future__ import annotations

import copy
import json
import sys
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VALIDATOR = ROOT / "scripts/validate_ecosystem_state_v03.py"
SCHEMA = ROOT / "schemas/trama-ecosystem-state-v0.3.schema.json"

assert VALIDATOR.exists(), "RED_EXPECTED: scripts/validate_ecosystem_state_v03.py is missing"
assert SCHEMA.exists(), "RED_EXPECTED: schemas/trama-ecosystem-state-v0.3.schema.json is missing"

sys.path.insert(0, str(ROOT / "scripts"))
from validate_ecosystem_state_v03 import EcosystemStateValidationError, validate_graph  # noqa: E402


EVIDENCE_FIXTURE = "path:docs/evidence/test/ecosystem-state-fixture.md"


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
                "evidenceRefs": [EVIDENCE_FIXTURE],
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
                "evidenceRefs": [EVIDENCE_FIXTURE],
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
                "evidenceRefs": [EVIDENCE_FIXTURE],
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
    evidence = path / "docs/evidence/test"
    evidence.mkdir(parents=True)
    (evidence / "ecosystem-state-fixture.md").write_text("evidence receipt", encoding="utf-8")
    decisions = path / "docs/decisions"
    decisions.mkdir(parents=True)
    (decisions / "decision-register.json").write_text(
        json.dumps({
            "decisions": [
                {"id": "TRAMA-ADR-002", "status": "APPROVED"},
                {"id": "TRAMA-ADR-004", "status": "APPROVED"},
            ]
        }),
        encoding="utf-8",
    )


def expect_invalid(document: dict, root: Path, needle: str) -> None:
    try:
        validate_graph(document, root)
    except EcosystemStateValidationError as exc:
        assert needle.lower() in str(exc).lower(), (needle, str(exc))
    else:
        raise AssertionError(f"Expected invalid graph containing: {needle}")


def assert_builder_imports_without_jsonschema() -> None:
    code = r'''
import importlib.abc
import sys
class BlockJsonschema(importlib.abc.MetaPathFinder):
    def find_spec(self, fullname, path=None, target=None):
        if fullname == "jsonschema" or fullname.startswith("jsonschema."):
            raise ModuleNotFoundError("jsonschema intentionally blocked")
        return None
sys.meta_path.insert(0, BlockJsonschema())
sys.path.insert(0, "scripts")
import build_ecosystem_snapshot_core
print("TRAMA_BUILDER_IMPORT_WITHOUT_JSONSCHEMA_PASS")
'''
    result = subprocess.run([sys.executable, "-c", code], cwd=ROOT, text=True, capture_output=True)
    assert result.returncode == 0, result.stderr or result.stdout
    assert "TRAMA_BUILDER_IMPORT_WITHOUT_JSONSCHEMA_PASS" in result.stdout


def main() -> int:
    assert_builder_imports_without_jsonschema()
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
        doc["nodes"][1]["state"] = "DEFERRED"
        doc["nodes"][1]["decisionRefs"] = ["path:README.md"]
        (root / "README.md").write_text("not a governed decision", encoding="utf-8")
        expect_invalid(doc, root, "decision")

        doc = base_document()
        doc["nodes"][1]["state"] = "DEFERRED"
        doc["nodes"][1]["decisionRefs"] = ["decision:TRAMA-ADR-004"]
        validate_graph(doc, root)

        doc = base_document()
        doc["nodes"][1]["state"] = "DEFERRED"
        doc["nodes"][1]["decisionRefs"] = ["decision:TRAMA-ADR-999"]
        expect_invalid(doc, root, "decision")

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
        (root / "README.md").write_text("not governed evidence", encoding="utf-8")
        doc["nodes"][0]["evidenceRefs"] = ["path:README.md"]
        expect_invalid(doc, root, "evidence")

        doc = base_document()
        doc["nodes"][0]["evidenceRefs"] = ["path:docs/evidence"]
        expect_invalid(doc, root, "file")

        doc = base_document()
        doc["nodes"][0]["evidenceRefs"] = [EVIDENCE_FIXTURE]
        validate_graph(doc, root)

        doc = base_document()
        doc["nodes"][0]["evidenceRefs"] = ["EV-NONEXISTENT"]
        expect_invalid(doc, root, "reference")

        doc = base_document()
        doc["nodes"][0]["decisionRefs"] = ["DECISION-NONEXISTENT"]
        expect_invalid(doc, root, "reference")

        doc = base_document()
        doc["nodes"][1]["gap"] = {"summary": "", "missing": []}
        expect_invalid(doc, root, "gap")

        doc = base_document()
        doc["flows"][0]["authorityOwner"] = None
        doc["flows"][0]["authorityRefs"] = ["path:docs/superpowers/specs/2026-10-17-trama-ecosystem-state-v0.3-design.md"]
        validate_graph(doc, root)

    graph_path = ROOT / "governance/access/trama-ecosystem-state-v0.3.json"
    receipt_path = ROOT / "docs/evidence/access-01/trama-access-state-promotion-v0.3-2026-10-17.md"
    assert graph_path.exists(), "RED_EXPECTED: canonical trama-ecosystem-state-v0.3.json is missing"
    assert receipt_path.exists(), "RED_EXPECTED: Access v0.3 promotion receipt is missing"

    canonical = json.loads(graph_path.read_text(encoding="utf-8"))
    validate_graph(canonical, ROOT)
    nodes = {item["id"]: item for item in canonical["nodes"]}
    flows = {item["id"]: item for item in canonical["flows"]}
    actors = {item["id"] for item in canonical["externalActors"]}

    assert nodes["trama_access"]["state"] == "PARTIAL"
    assert nodes["professional_identity"]["state"] == "PARTIAL"
    assert flows["gateway_to_trama_access"]["state"] == "DESIGNED"
    assert flows["trama_access_to_docente_os"]["state"] == "DESIGNED"
    assert flows["arena_to_curricolo_atlas"]["state"] == "REAL"
    assert canonical["authorityPolicy"]["decisions"] == "docs/decisions/decision-register.json"

    approved_open_gaps = ["gateway", "arena", "curricolo_atlas", "trama_governance"]
    for node_id in approved_open_gaps:
        assert nodes[node_id]["gap"]["missing"], f"{node_id} lost its approved governed gap"
        assert nodes[node_id]["nextAllowedIntervention"]["action"] != "", node_id

    privileged = nodes["control_center_privileged"]["nextAllowedIntervention"]
    assert privileged["preconditions"], "privileged Control Center missing structured preconditions"
    assert privileged["forbiddenUntil"], "privileged Control Center missing structured blockers"
    privileged_text = " ".join(privileged["preconditions"] + privileged["forbiddenUntil"]).lower()
    for needle in ("operazione protetta", "entitlement", "mfa", "audit", "access"):
        assert needle in privileged_text, f"privileged Control Center missing {needle}"

    protected_owner_cases = [
        ("node", "arena", "trama"),
        ("flow", "arena_to_curricolo_atlas", "atlas"),
        ("flow", "docente_os_to_arena", "docente-os"),
        ("flow", "trama_access_to_arena", "trama"),
    ]
    for subject_type, subject_id, invalid_owner in protected_owner_cases:
        mutated = copy.deepcopy(canonical)
        collection = mutated["nodes"] if subject_type == "node" else mutated["flows"]
        subject = next(item for item in collection if item["id"] == subject_id)
        subject["authorityOwner"] = invalid_owner
        expect_invalid(mutated, ROOT, "arena")

    protected_arena_bindings = [
        ("node", "arena"),
        ("flow", "arena_to_curricolo_atlas"),
        ("flow", "docente_os_to_arena"),
        ("flow", "trama_access_to_arena"),
    ]
    for subject_type, subject_id in protected_arena_bindings:
        mutated = copy.deepcopy(canonical)
        collection = mutated["nodes"] if subject_type == "node" else mutated["flows"]
        subject = next(item for item in collection if item["id"] == subject_id)
        subject["authorityRefs"] = [
            ref for ref in subject["authorityRefs"] if ref != "decision:TRAMA-ADR-002"
        ]
        expect_invalid(mutated, ROOT, "TRAMA-ADR-002")

    access_federations = [
        "trama_access_to_docente_os",
        "trama_access_to_studio_atlas",
        "trama_access_to_curricolo_atlas_professional",
        "trama_access_to_arena",
        "trama_access_to_control_center_privileged",
    ]
    for flow_id in access_federations:
        intervention = flows[flow_id]["nextAllowedIntervention"]
        assert intervention["preconditions"], f"{flow_id} missing structured preconditions"
        assert intervention["forbiddenUntil"], f"{flow_id} missing structured forbiddenUntil"

    assert nodes["docente_os"]["maturityRef"] == "docente-os"
    assert nodes["studio_atlas"]["maturityRef"] == "studio-atlas"
    assert "public" in actors

    serialized = json.dumps(canonical, ensure_ascii=False).lower()
    for forbidden in ("@", "supabase.co", "service_role", "anon key", "student roster", "session token"):
        assert forbidden not in serialized, forbidden

    print("TRAMA_ECOSYSTEM_STATE_V03_CONTRACT_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
