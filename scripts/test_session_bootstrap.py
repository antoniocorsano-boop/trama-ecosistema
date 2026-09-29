#!/usr/bin/env python3
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_module(name, rel):
    spec = importlib.util.spec_from_file_location(name, ROOT / rel)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def load(rel):
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))


bootstrap = load_module("session_bootstrap", "scripts/build_session_bootstrap.py")
snapshot = load("control-center/data/project-context-snapshot.json")
registry = load("docs/knowledge/governed-document-registry.json")
resolver = load("config/session-bootstrap-subjects.json")

query = "rappresentazione grafica della maturità dei componenti nel Control Center"
receipt = bootstrap.build_receipt(query, snapshot, registry, resolver)
bootstrap.validate_receipt(receipt)

assert receipt["bootstrapStatus"] == "READY_LIVE_CHECK_REQUIRED"
assert receipt["subjectResolution"]["status"] == "RESOLVED"
subjects = set(receipt["subjectResolution"]["contextSubjects"])
assert "control-center-ui" in subjects
assert "component-evidence" in subjects
assert "project-knowledge" in subjects

doc_ids = {x["id"] for x in receipt["governedContext"]["governedDocuments"]}
assert "DOC-TRAMA-COMPONENT-EVIDENCE-REGISTRY" in doc_ids
assert "DOC-CONTROL-CENTER-HUMAN-READABLE-IA" in doc_ids
assert receipt["governedContext"]["negativeKnowledgeChecked"] is True
assert receipt["liveVerification"]["required"] is True
assert receipt["authority"]["authorizesWrite"] is False

effective = load("control-center/fixtures/project-knowledge/effective-context-head-drift.json")
ready = bootstrap.build_receipt(query, snapshot, registry, resolver, effective_context=effective)
bootstrap.validate_receipt(ready)
assert ready["bootstrapStatus"] == "READY"
assert ready["liveVerification"]["effectiveContextStatus"] == "USABLE"
assert ready["liveVerification"]["required"] is False

unknown = bootstrap.build_receipt("tema completamente nuovo senza lessico registrato", snapshot, registry, resolver)
bootstrap.validate_receipt(unknown)
assert unknown["subjectResolution"]["status"] == "PARTIAL"
assert unknown["bootstrapStatus"] == "PARTIAL_CONTEXT"
assert "project-knowledge" in unknown["subjectResolution"]["contextSubjects"]

explicit = bootstrap.build_receipt(
    "riprendiamo il lavoro",
    snapshot,
    registry,
    resolver,
    explicit_subject="atlas-percorsi",
)
bootstrap.validate_receipt(explicit)
assert explicit["subjectResolution"]["status"] == "RESOLVED"
assert explicit["subjectResolution"]["contextSubjects"][0] == "atlas-percorsi"
assert any("PR #96" in x.get("statement", "") for x in explicit["governedContext"]["evidence"])

print("TRAMA_SESSION_BOOTSTRAP_01_PASS")
