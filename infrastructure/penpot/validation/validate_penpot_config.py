#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
compose = ROOT / "docker-compose.yml"
env_example = ROOT / ".env.example"
gitignore = ROOT / ".gitignore"

errors = []

def require(condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)

text = compose.read_text(encoding="utf-8")
env = env_example.read_text(encoding="utf-8")
ignore = gitignore.read_text(encoding="utf-8")

require("penpot-mcp:" in text, "penpot-mcp service missing")
require("enable-mcp" in text, "enable-mcp flag missing")
require("penpotapp/frontend:${PENPOT_VERSION:-2.18}" in text, "frontend image not version-governed")
require("penpotapp/backend:${PENPOT_VERSION:-2.18}" in text, "backend image not version-governed")
require("penpotapp/exporter:${PENPOT_VERSION:-2.18}" in text, "exporter image not version-governed")
require("penpotapp/mcp:${PENPOT_VERSION:-2.18}" in text, "MCP image not version-governed")
require('image: "postgres:15"' in text, "PostgreSQL baseline must remain 15 unless separately reviewed")
require('image: "valkey/valkey:8.1"' in text, "Valkey baseline must remain 8.1 unless separately reviewed")
require("PENPOT_SECRET_KEY must be set" in text, "secret key must be required, not defaulted")
require("PENPOT_DATABASE_PASSWORD must be set" in text, "database password must be required, not defaulted")
require("change-this-insecure-key" not in text, "insecure upstream example secret must not be present")
require("PENPOT_TELEMETRY_ENABLED: \"false\"" in text, "telemetry must remain disabled in TRAMA pilot baseline")
require("127.0.0.1:9001:8080" in text, "frontend must bind localhost in local pilot baseline")

for service in ("penpot-postgres", "penpot-valkey", "penpot-mcp"):
    block = re.search(rf"^  {re.escape(service)}:\n(?P<body>(?:    .*\n|\n)*)", text, re.MULTILINE)
    require(block is not None, f"{service} service missing")
    if block:
        require("\n    ports:" not in block.group("body"), f"{service} must not publish host ports")

require(".env" in ignore, ".env must be ignored")
require("PENPOT_SECRET_KEY=REPLACE_" in env, ".env.example must contain only placeholder secret")
require("userToken" not in env, ".env.example must never contain an MCP userToken")

if errors:
    print("Penpot config validation: FAIL")
    for err in errors:
        print(f"- {err}")
    sys.exit(1)

print("Penpot config validation: PASS")
