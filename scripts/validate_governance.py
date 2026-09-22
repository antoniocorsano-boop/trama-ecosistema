#!/usr/bin/env python3
"""Verifica la coerenza minima del repository TRAMA senza dipendenze esterne."""

from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []


def fail(message: str) -> None:
    ERRORS.append(message)


def load_json(relative: str) -> dict:
    path = ROOT / relative
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"{relative}: JSON non valido: {exc}")
        return {}


def valid_date(value: object, label: str) -> None:
    try:
        date.fromisoformat(str(value))
    except ValueError:
        fail(f"{label}: data non valida: {value}")


def validate_decisions() -> None:
    data = load_json("docs/decisions/decision-register.json")
    allowed = {"PROPOSED", "UNDER_REVIEW", "APPROVED", "IMPLEMENTED", "SUPERSEDED", "REJECTED"}
    impacts = {"NONE", "PRESERVED", "STRENGTHENED", "CHANGED"}
    ids: set[str] = set()
    for item in data.get("decisions", []):
        did = item.get("id", "")
        if not re.fullmatch(r"TRAMA-ADR-\d{3}", did):
            fail(f"decision-register: id non canonico: {did}")
        if did in ids:
            fail(f"decision-register: id duplicato: {did}")
        ids.add(did)
        if item.get("status") not in allowed:
            fail(f"{did}: stato non ammesso")
        if item.get("humanControlImpact") not in impacts:
            fail(f"{did}: impatto sul controllo umano non ammesso")
        valid_date(item.get("date"), did)
        if len(item.get("decision", "")) < 20:
            fail(f"{did}: decisione troppo breve")
    for item in data.get("decisions", []):
        for prior in item.get("supersedes", []):
            if prior not in ids:
                fail(f"{item.get('id')}: riferimento supersedes inesistente: {prior}")


def validate_status() -> None:
    data = load_json("status/ecosystem-status.json")
    allowed = {"CLOSED", "ACTIVE", "DEFERRED", "BLOCKED", "PLANNED"}
    reviews = {"NOT_REQUIRED", "PENDING", "PASS", "FAIL"}
    ids: set[str] = set()
    for item in data.get("capabilities", []):
        cid = item.get("id", "")
        if cid in ids:
            fail(f"ecosystem-status: id duplicato: {cid}")
        ids.add(cid)
        if item.get("state") not in allowed:
            fail(f"{cid}: stato non ammesso")
        if item.get("humanReview") not in reviews:
            fail(f"{cid}: verifica umana non ammessa")
    valid_date(data.get("updatedAt"), "ecosystem-status")
    dos = next((x for x in data.get("capabilities", []) if x.get("id") == "DOS-A1"), None)
    if not dos or dos.get("state") != "DEFERRED":
        fail("DOS-A1 deve rimanere DEFERRED nella baseline corrente")


def validate_sources() -> None:
    data = load_json("docs/knowledge/source-registry.json")
    domains: set[str] = set()
    for source in data.get("sources", []):
        domain = source.get("domain", "")
        if domain in domains:
            fail(f"source-registry: dominio duplicato: {domain}")
        domains.add(domain)
        if not source.get("authority"):
            fail(f"source-registry: autorità assente per {domain}")
    required = {"ecosystem-governance", "curriculum", "learning-resources", "teacher-context", "collaborative-documents"}
    missing = required - domains
    if missing:
        fail(f"source-registry: domini mancanti: {', '.join(sorted(missing))}")


def validate_perceptible_write_contract() -> None:
    data = load_json("status/perceptible-write-contract.json")
    decisions = load_json("docs/decisions/decision-register.json")
    decision_ref = data.get("decisionRef")
    decision_ids = {item.get("id") for item in decisions.get("decisions", [])}
    if decision_ref not in decision_ids:
        fail("TRAMA-PW-01: decisionRef assente o non registrato")
    if decision_ref != "TRAMA-ADR-012":
        fail("TRAMA-PW-01: decisionRef deve puntare a TRAMA-ADR-012")
    boundaries = data.get("boundaries", {})
    required_false = {
        "authorizesNewWrites",
        "activatesDOSA1",
        "authorizesCrossProductRuntime",
        "changesArenaAuthority",
        "atlasRequiresAuthentication",
        "atlasAllowsPersonalStudentData",
    }
    for key in required_false:
        if boundaries.get(key) is not False:
            fail(f"TRAMA-PW-01: boundary {key} deve essere false")
    if boundaries.get("atlasPrivacyFirst") is not True:
        fail("TRAMA-PW-01: atlasPrivacyFirst deve essere true")
    if data.get("rolloutState") not in {"ROLLING_ENFORCEMENT", "FULLY_ENFORCED"}:
        fail("TRAMA-PW-01: rolloutState non ammesso")


def validate_links() -> None:
    link_re = re.compile(r"\[[^]]+\]\((?!https?://|mailto:|#)([^)]+)\)")
    for path in ROOT.rglob("*.md"):
        text = path.read_text(encoding="utf-8")
        for target in link_re.findall(text):
            clean = target.split("#", 1)[0]
            if clean and not (path.parent / clean).resolve().exists():
                fail(f"{path.relative_to(ROOT)}: collegamento locale inesistente: {target}")


def validate_repository_policy() -> None:
    forbidden_extensions = {".pem", ".key", ".p12", ".pfx"}
    for path in ROOT.rglob("*"):
        if ".git" in path.parts or not path.is_file():
            continue
        if path.suffix.lower() in forbidden_extensions:
            fail(f"file riservato non ammesso: {path.relative_to(ROOT)}")


def main() -> int:
    validate_decisions()
    validate_status()
    validate_sources()
    validate_perceptible_write_contract()
    validate_links()
    validate_repository_policy()
    if ERRORS:
        for error in ERRORS:
            print(f"ERROR: {error}")
        return 1
    print("TRAMA governance validation: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())

