#!/usr/bin/env python3
import json
from pathlib import Path
from compose_effective_component_evidence import compose_effective_component_evidence, EffectiveComponentEvidenceError

ROOT = Path(__file__).resolve().parents[1]

def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))

registry = load("governance/ui-development/trama-component-evidence-registry-v1.json")
overlay = load("control-center/fixtures/project-knowledge/live-component-evidence-atlas-r1.json")
effective = compose_effective_component_evidence(registry, overlay)

by_id = {e["componentId"]: e for e in effective["entries"]}
for cid in ("ATLAS.RELATION_EXPLORER.FAMILY", "ATLAS.CURRICULUM_TREE.DISCLOSURE"):
    entry = by_id[cid]
    assert entry["lifecycle"] == "PROPOSED"
    isolated = next(e for e in entry["evidence"] if e["type"] == "ISOLATED")
    assert isolated["status"] == "PRESENT"
    assert isolated["sourcePlane"] == "LIVE_VERIFIED"
    assert isolated["exactHead"] == "fe43bb037ae0bd5bc13aba40e17875d1673667c2"
    assert isolated["runId"] == "36671130676"
    assert isolated["artifactId"] == "11078325536"

assert effective["authorizesLifecycleChange"] is False
assert effective["authorizesRuntimeChange"] is False
assert effective["authorizesPromotion"] is False

bad = json.loads(json.dumps(overlay))
bad["items"].append(dict(bad["items"][0], exactHead="0"*40))
try:
    compose_effective_component_evidence(registry, bad)
    raise AssertionError("contradictory live evidence must fail closed")
except EffectiveComponentEvidenceError as exc:
    assert str(exc) == "LIVE_EVIDENCE_CONTRADICTION"

missing = json.loads(json.dumps(overlay))
del missing["items"][0]["artifactDigest"]
try:
    compose_effective_component_evidence(registry, missing)
    raise AssertionError("artifact without digest must fail closed")
except EffectiveComponentEvidenceError as exc:
    assert str(exc) == "LIVE_ARTIFACT_DIGEST_MISSING"

print("Component Evidence Lane v2 Atlas R1: PASS")
