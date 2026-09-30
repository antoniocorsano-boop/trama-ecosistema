#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCK = ROOT / "governance/control-center/trama-control-center-a0-architecture-lock.json"


def git_blob_sha(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("utf-8")
    return hashlib.sha1(header + data).hexdigest()


def fail(message: str) -> None:
    raise SystemExit(f"CONTROL_CENTER_A0_LOCK_INVALID: {message}")


lock = json.loads(LOCK.read_text(encoding="utf-8"))
if lock.get("schemaVersion") != "trama.control-center-a0-architecture-lock/v1":
    fail("schemaVersion")
if lock.get("id") != "TRAMA-CC-APP-A0-LOCK-01":
    fail("id")
if lock.get("status") not in {"AWAITING_HUMAN_REVIEW", "LOCKED"}:
    fail("status")
if lock.get("applicationBoundary") != "apps/control-center/":
    fail("applicationBoundary")
if lock.get("architectureStyle") != "MODULAR_MONOLITH_STATIC_READ_ONLY":
    fail("architectureStyle")
if lock.get("packageManager") != "npm":
    fail("packageManager")
if lock.get("dosA1") != "RUNTIME_DEFERRED":
    fail("dosA1")

authority = lock.get("browserAuthority") or {}
if authority.get("githubRead") is not False:
    fail("browser githubRead must be false")
for key in ("repositoryWrite", "runtimeAuthorization", "maturityPromotion", "lifecyclePromotion"):
    if authority.get(key) is not False:
        fail(f"browser authority escalation: {key}")

production = lock.get("production") or {}
if production != {
    "legacyRemainsActiveThrough": "A6",
    "cutoverStage": "A7",
    "rollbackRequired": True,
}:
    fail("production boundary")

if lock.get("humanReviewGates") != [
    "A0_ARCHITECTURE_LOCK",
    "A6_PRODUCT_PARITY",
    "A7_PUBLIC_CUTOVER",
]:
    fail("human review gates")

for ref_key in ("architectureRef", "migrationRef", "legacyBaselineRef", "legacyBaselineDataRef", "dependencyPolicyRef"):
    ref = lock.get(ref_key)
    if not isinstance(ref, str) or not ref or not (ROOT / ref).is_file():
        fail(f"missing reference: {ref_key}")

baseline_path = ROOT / lock["legacyBaselineDataRef"]
baseline = json.loads(baseline_path.read_text(encoding="utf-8"))
if baseline.get("schemaVersion") != "trama.control-center-a0-legacy-baseline/v1":
    fail("legacy baseline identity")
if baseline.get("capturedFrom") != lock.get("baseline", {}).get("commit"):
    fail("baseline commit mismatch")

entries = (baseline.get("surfaces") or []) + (baseline.get("supportingAssets") or [])
if not entries:
    fail("legacy baseline empty")

seen = set()
for entry in entries:
    path = entry.get("path")
    if not path or path in seen:
        fail(f"invalid or duplicate baseline path: {path}")
    seen.add(path)
    full = ROOT / path
    if not full.is_file():
        fail(f"legacy baseline file missing: {path}")
    data = full.read_bytes()
    if len(data) != entry.get("bytes"):
        fail(f"legacy bytes drift: {path}")
    text = data.decode("utf-8")
    lines = len(text.split("\n"))
    if lines != entry.get("lines"):
        fail(f"legacy lines drift: {path}")
    if git_blob_sha(data) != entry.get("blobSha"):
        fail(f"legacy blob drift: {path}")

prohibited = set(lock.get("prohibitedInitial") or [])
required_prohibited = {
    "SSR", "NEXTJS", "MICROFRONTEND", "RUNTIME_PLUGIN_SYSTEM",
    "REDUX", "ZUSTAND", "BROWSER_GITHUB_AUTHORITY",
    "EXTERNAL_FONTS", "ANALYTICS_TRACKING",
}
if not required_prohibited.issubset(prohibited):
    fail("prohibited initial set incomplete")

print("TRAMA_CONTROL_CENTER_A0_ARCHITECTURE_LOCK_PASS")
