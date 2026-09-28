#!/usr/bin/env python3
"""Static audit: executable qualification code must not acquire token/network/live capability.

Documentation/configuration may name forbidden capabilities in order to prohibit them.
Executable Python is inspected through its AST so comments, docstrings and inert string
literals do not become false positives.
"""
from pathlib import Path
import ast
import json
import sys

CONFIG = Path("config/cc-mss-01-credential-provider-actions-ephemeral.json")
PY_TARGETS = [
    Path("scripts/validate_cc_mss_actions_ephemeral_provider.py"),
    Path("tests/test_cc_mss_actions_ephemeral_provider.py"),
]
REQUIRED = ["NOT_AUTHORIZED", "ACTIONS_EPHEMERAL_TOKEN"]
FORBIDDEN_IMPORT_ROOTS = {"requests", "httpx", "urllib", "socket", "subprocess"}
FORBIDDEN_ENV_NAMES = {"GITHUB_TOKEN"}


def dotted_name(node):
    parts = []
    while isinstance(node, ast.Attribute):
        parts.append(node.attr)
        node = node.value
    if isinstance(node, ast.Name):
        parts.append(node.id)
        return ".".join(reversed(parts))
    return None


def audit_python(path):
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    aliases = {}

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for item in node.names:
                root = item.name.split(".")[0]
                aliases[item.asname or root] = item.name
                if root in FORBIDDEN_IMPORT_ROOTS:
                    return f"forbidden executable import {item.name}"
        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            root = module.split(".")[0]
            if root in FORBIDDEN_IMPORT_ROOTS:
                return f"forbidden executable import {module}"
            for item in node.names:
                aliases[item.asname or item.name] = f"{module}.{item.name}" if module else item.name

    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            name = dotted_name(node.func)
            if name:
                root = name.split(".")[0]
                resolved = aliases.get(root, root) + name[len(root):]
                if resolved.startswith(("requests.", "httpx.", "urllib.request.", "socket.", "subprocess.")):
                    return f"forbidden executable capability {resolved}"
                if resolved in {"os.getenv", "os.environ.get"}:
                    if not node.args or not isinstance(node.args[0], ast.Constant) or node.args[0].value in FORBIDDEN_ENV_NAMES:
                        return f"forbidden credential environment access {resolved}"
        elif isinstance(node, ast.Subscript):
            name = dotted_name(node.value)
            if name == "os.environ":
                key = node.slice.value if isinstance(node.slice, ast.Constant) else None
                if key is None or key in FORBIDDEN_ENV_NAMES:
                    return "forbidden credential environment access os.environ"

    return None


def main():
    config_text = CONFIG.read_text(encoding="utf-8")
    config = json.loads(config_text)
    combined = config_text + "\n" + "\n".join(p.read_text(encoding="utf-8") for p in PY_TARGETS)

    for invariant in REQUIRED:
        if invariant not in combined:
            print("FAIL: missing invariant", invariant)
            return 1

    if config.get("acceptedSecretInputs"):
        print("FAIL: provider profile accepts secret inputs")
        return 1
    if config.get("live") != "NOT_AUTHORIZED":
        print("FAIL: live authorization invariant changed")
        return 1

    for path in PY_TARGETS:
        finding = audit_python(path)
        if finding:
            print(f"FAIL: {finding} in {path}")
            return 1

    print("PASS: Actions provider executable qualification surface remains offline and token-free")
    return 0


if __name__ == "__main__":
    sys.exit(main())
