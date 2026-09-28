#!/usr/bin/env python3
"""Fail-closed static audit for the LIVE_ONE_SHOT non-secret binding materializer."""
import ast
import sys
from pathlib import Path

TARGET = Path("scripts/materialize_cc_mss_live_bindings.py")
FORBIDDEN_IMPORT_ROOTS = {
    "socket", "ssl", "http", "urllib", "urllib3", "requests", "httpx",
    "aiohttp", "ftplib", "smtplib", "telnetlib", "websocket", "websockets",
    "paramiko", "subprocess"
}
FORBIDDEN_CALL_NAMES = {"urlopen", "create_connection", "system", "popen"}
FORBIDDEN_TEXT = (
    "GITHUB_TOKEN", "GH_TOKEN", "Authorization", "Bearer ",
    "api.github.com", "github.com/login", "os.environ", "getenv("
)
REQUIRED_TEXT = (
    '"live":"NOT_AUTHORIZED"',
    '"humanDecision":"PENDING"',
    '"state":"READY_FOR_HUMAN_DECISION"',
    "SECRET_LIKE_VALUE_FORBIDDEN",
)

def fail(reason):
    print(f"FAIL: {reason}")
    return 1

def main():
    source = TARGET.read_text(encoding="utf-8")
    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        return fail(f"syntax error: {exc}")

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name.split(".")[0] in FORBIDDEN_IMPORT_ROOTS:
                    return fail(f"forbidden import: {alias.name}")
        elif isinstance(node, ast.ImportFrom):
            root = (node.module or "").split(".")[0]
            if root in FORBIDDEN_IMPORT_ROOTS:
                return fail(f"forbidden import: {node.module}")
        elif isinstance(node, ast.Call):
            name = None
            if isinstance(node.func, ast.Name): name = node.func.id
            elif isinstance(node.func, ast.Attribute): name = node.func.attr
            if name in FORBIDDEN_CALL_NAMES:
                return fail(f"forbidden call: {name}")

    for token in FORBIDDEN_TEXT:
        if token in source:
            return fail(f"forbidden capability/secret source marker: {token}")
    for token in REQUIRED_TEXT:
        if token not in source:
            return fail(f"required fail-closed marker missing: {token}")

    print("PASS: materializer surface is offline/non-secret and pre-authorization only")
    return 0

if __name__ == "__main__":
    sys.exit(main())
