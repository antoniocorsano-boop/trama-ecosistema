#!/usr/bin/env python3
"""Collect a fail-closed QE-01 DSH binding observation without invoking a model."""
from __future__ import annotations
import argparse, json, os, re, subprocess
from datetime import datetime, timezone
from pathlib import Path

SECRET_PATTERNS = (
    re.compile(r"(?i)(api[_-]?key|token|secret|password)\s*:\s*['\"]?([^\s#'\"]+)"),
    re.compile(r"(?i)authorization\s*:\s*['\"]?([^\s#'\"]+)"),
)

def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")

def assert_no_literal_secrets(text: str) -> None:
    for pattern in SECRET_PATTERNS:
        for match in pattern.finditer(text):
            value = match.group(match.lastindex or 1)
            if value and not value.startswith("$"):
                raise ValueError("QE01-OBS-SECRET-LITERAL")

def plugin_block(text: str, plugin: str) -> str | None:
    lines = text.splitlines()
    forms = {f"- id: {plugin}", f"- name: '{plugin}'", f'- name: "{plugin}"', f"- name: {plugin}"}
    start = None
    start_indent = None
    for i, line in enumerate(lines):
        if line.strip() in forms:
            start = i
            start_indent = len(line) - len(line.lstrip())
            break
    if start is None:
        return None
    out = [lines[start]]
    for line in lines[start + 1:]:
        stripped = line.strip()
        indent = len(line) - len(line.lstrip())
        if stripped.startswith("- ") and indent <= start_indent:
            break
        out.append(line)
    return "\n".join(out)

def scalar(block: str, key: str) -> str | None:
    m = re.search(rf"(?m)^\s+{re.escape(key)}:\s*['\"]?([^#'\"\s]+)", block)
    return m.group(1) if m else None

def default_selection(text: str) -> tuple[str, str]:
    block = plugin_block(text, "@deepseek-ai/dsh-agent-default-model")
    if block is None:
        raise ValueError("QE01-OBS-DEFAULT-MODEL-BLOCK-MISSING")
    provider = scalar(block, "provider")
    model = scalar(block, "model")
    if not provider or not model:
        raise ValueError("QE01-OBS-DEFAULT-MODEL-INCOMPLETE")
    return provider, model

def provider_is_configured(text: str, provider: str) -> tuple[bool, str]:
    pi = plugin_block(text, "@deepseek-ai/dsh-llm-pi-ai") or plugin_block(text, "llm-pi-ai")
    if pi and re.search(rf"(?m)^\s{{4,}}{re.escape(provider)}:\s*$", pi):
        return True, "dsh-llm-pi-ai"
    if provider == "deepseek":
        direct = plugin_block(text, "@deepseek-ai/dsh-llm-deepseek") or plugin_block(text, "llm-deepseek")
        if direct:
            return True, "dsh-llm-deepseek"
    return False, "UNKNOWN"

def command_version(command: list[str]) -> str | None:
    try:
        p = subprocess.run(command, check=False, capture_output=True, text=True, timeout=5,
                           env={**os.environ, "NO_COLOR": "1"})
    except (OSError, subprocess.SubprocessError):
        return None
    output = (p.stdout or p.stderr).strip()
    if p.returncode != 0 or not output:
        return None
    first = output.splitlines()[0].strip()
    m = re.search(r"\d+\.\d+(?:\.\d+)?(?:[-+][0-9A-Za-z.-]+)?", first)
    return m.group(0) if m else first[:120]

def package_version(search_roots: list[Path], package_names: list[str]) -> tuple[str | None, str | None]:
    rels = []
    for name in package_names:
        parts = name.split("/")
        if name.startswith("@") and len(parts) == 2:
            rels.append(Path("node_modules") / parts[0] / parts[1] / "package.json")
        else:
            rels.append(Path("node_modules") / name / "package.json")
    for root in search_roots:
        for rel in rels:
            path = root / rel
            if not path.is_file():
                continue
            try:
                data = json.loads(read_text(path))
            except (OSError, json.JSONDecodeError):
                continue
            if isinstance(data.get("version"), str) and isinstance(data.get("name"), str):
                return data["version"], str(path)
    return None, None

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dsh-home", type=Path, default=Path(os.environ.get("DSH_HOME", Path.home() / ".dsh")))
    ap.add_argument("--profile", default="web")
    ap.add_argument("--runtime-root", type=Path, action="append", default=[])
    ap.add_argument("--output", type=Path, required=True)
    args = ap.parse_args()
    profile_path = args.dsh_home / "profiles" / args.profile / "cordis.patch.yml"
    if not profile_path.is_file():
        raise SystemExit(f"FAIL: QE01-OBS-PROFILE-NOT-FOUND: {profile_path}")
    text = read_text(profile_path)
    try:
        assert_no_literal_secrets(text)
        provider, model = default_selection(text)
        configured, adapter_id = provider_is_configured(text, provider)
    except ValueError as exc:
        raise SystemExit(f"FAIL: {exc}") from exc
    roots = [*args.runtime_root, profile_path.parent, args.dsh_home]
    adapter_version, adapter_source = package_version(
        roots, ["@deepseek-ai/dsh-llm-pi-ai", "@deepseek-ai/dsh-llm-deepseek"])
    pi_ai_version, pi_ai_source = package_version(
        roots, ["@earendil-works/pi-ai", "@mariozechner/pi-ai", "pi-ai"])
    runtime_version = command_version(["dsh", "--version"])
    complete = all((runtime_version, adapter_version, provider, model, configured))
    payload = {
        "schemaVersion": "trama.qe01-dsh-observation/v1",
        "executionId": "QE-01",
        "source": "LOCAL_DSH_READ_ONLY_PROFILE_OBSERVATION",
        "observedAt": datetime.now(timezone.utc).isoformat(),
        "profile": args.profile,
        "profilePath": str(profile_path),
        "runtime": {"runtimeType": "dsh", "runtimeVersion": runtime_version},
        "adapter": {
            "adapterId": adapter_id, "adapterVersion": adapter_version,
            "packageSource": adapter_source, "piAiLibraryVersion": pi_ai_version,
            "piAiPackageSource": pi_ai_source,
        },
        "provider": {
            "providerId": provider, "modelId": model,
            "configuredInActiveProfile": configured, "catalogOnly": False,
        },
        "safety": {
            "networkUsed": False, "modelInvoked": False, "credentialsRead": False,
            "credentialsPersisted": False, "mutation": False,
            "personalStudentData": False, "maxRetries": 0,
            "dosA1": "RUNTIME_DEFERRED",
        },
        "complete": complete,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({
        "complete": complete, "providerId": provider, "modelId": model,
        "runtimeVersion": runtime_version, "adapterId": adapter_id,
        "adapterVersion": adapter_version, "output": str(args.output),
    }, sort_keys=True))
    return 0 if complete else 2

if __name__ == "__main__":
    raise SystemExit(main())
