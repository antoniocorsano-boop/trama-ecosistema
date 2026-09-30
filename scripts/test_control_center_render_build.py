#!/usr/bin/env python3
from pathlib import Path
import os
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/build_control_center_render.sh"
A7 = ROOT / "scripts/build_control_center_a7_candidate.sh"
LEGACY = ROOT / "scripts/build_control_center_render_legacy.sh"

wrapper = SCRIPT.read_text(encoding="utf-8")
a7 = A7.read_text(encoding="utf-8")
legacy = LEGACY.read_text(encoding="utf-8")
combined = "\n".join([wrapper, a7, legacy])

assert 'exec bash "$ROOT/scripts/build_control_center_a7_candidate.sh"' in wrapper
assert "TRAMA_A7_PUBLIC_DIR" in wrapper

required = [
    "run_live_repository_overlay.py",
    "materialize_live_project_knowledge_bundle.py",
    "collect_atlas_live_component_evidence_r1.py",
    "--live-component-overlay",
    "TRAMA_RENDER_SKIP_LIVE",
]
for token in required:
    assert token in combined, token

assert "python3 -m pip install --disable-pip-version-check --quiet jsonschema" in combined
assert "--user" not in combined

for forbidden in [
    "gh auth",
    "GITHUB_TOKEN",
    "github_pat_",
    "ghp_",
    "Authorization:",
    "git push",
    "gh pr",
    "contents: write",
    "pull-requests: write",
    "curl ",
    "wget ",
]:
    assert forbidden not in combined, forbidden

with tempfile.TemporaryDirectory(prefix="trama-render-build-") as tmp:
    out = Path(tmp) / "public"
    env = os.environ.copy()
    env["TRAMA_RENDER_PUBLIC_DIR"] = str(out)
    env["TRAMA_RENDER_SKIP_LIVE"] = "1"
    subprocess.run(["bash", str(SCRIPT)], cwd=ROOT, env=env, check=True)

    # Modular public root.
    assert (out / "index.html").is_file()
    assert (out / "manifest.json").is_file()
    assert (out / "sw.js").is_file()
    assert (out / "data/ecosystem-snapshot.json").is_file()
    assert (out / "data/context-packs/project-knowledge.json").is_file()

    # Explicit legacy fallback retained for rollback.
    assert (out / "legacy/index.html").is_file()
    assert (out / "legacy/maturity.html").is_file()
    assert (out / "legacy/component-maturity.js").is_file()
    assert (out / "legacy/data/ecosystem-snapshot.json").is_file()
    assert (out / "legacy/data/context-packs/project-knowledge.json").is_file()

    snapshot = (out / "data/ecosystem-snapshot.json").read_text(encoding="utf-8")
    assert "ATLAS.RELATION_EXPLORER.FAMILY" in snapshot
    assert "ATLAS.CURRICULUM_TREE.DISCLOSURE" in snapshot

print("TRAMA_CONTROL_CENTER_RENDER_BUILD_CONTRACT_PASS")
