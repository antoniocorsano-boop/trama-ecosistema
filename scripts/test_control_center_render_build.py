#!/usr/bin/env python3
from pathlib import Path
import os
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/build_control_center_render.sh"

text = SCRIPT.read_text(encoding="utf-8")
required = [
    "run_live_repository_overlay.py",
    "materialize_live_project_knowledge_bundle.py",
    "TRAMA_RENDER_LIVE_PROJECT_KNOWLEDGE_GOVERNED_FALLBACK",
    "TRAMA_RENDER_SKIP_LIVE",
]
for token in required:
    assert token in text, token

for forbidden in [
    "gh auth",
    "GITHUB_TOKEN",
    "github_pat_",
    "ghp_",
    "Authorization:",
    "curl ",
    "wget ",
]:
    assert forbidden not in text, forbidden

with tempfile.TemporaryDirectory(prefix="trama-render-build-") as tmp:
    out = Path(tmp) / "public"
    env = os.environ.copy()
    env["TRAMA_RENDER_PUBLIC_DIR"] = str(out)
    env["TRAMA_RENDER_SKIP_LIVE"] = "1"
    subprocess.run(["bash", str(SCRIPT)], cwd=ROOT, env=env, check=True)
    assert (out / "index.html").is_file()
    assert (out / "maturity.html").is_file()
    assert (out / "component-maturity.js").is_file()
    assert (out / "data/ecosystem-snapshot.json").is_file()
    assert (out / "data/context-packs/project-knowledge.json").is_file()

print("TRAMA_CONTROL_CENTER_RENDER_BUILD_CONTRACT_PASS")
