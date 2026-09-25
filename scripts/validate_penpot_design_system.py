#!/usr/bin/env python3
from pathlib import Path
import json
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

TOKENS = ROOT / "docs/design/penpot/TRAMA_TOKENS_V0_1.json"
DESKTOP = ROOT / "docs/design/penpot/TRAMA_DESKTOP_BLUEPRINT_V0_1.svg"
MOBILE = ROOT / "docs/design/penpot/TRAMA_MOBILE_BLUEPRINT_V0_1.svg"
DESIGN_DOC = ROOT / "docs/design/TRAMA_PENPOT_DESIGN_SYSTEM_V0_1.md"
INVENTORY = ROOT / "docs/design/penpot/TRAMA_PENPOT_BUILD_INVENTORY_V0_1.md"
COMPONENT_MAP = ROOT / "docs/design/TRAMA_PENPOT_COMPONENT_MAP_V0_1.md"

errors = []

def require(condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)

for path in (TOKENS, DESKTOP, MOBILE, DESIGN_DOC, INVENTORY, COMPONENT_MAP):
    require(path.exists(), f"missing required design-system file: {path.relative_to(ROOT)}")

if TOKENS.exists():
    data = json.loads(TOKENS.read_text(encoding="utf-8"))
    size = data.get("trama", {}).get("size", {})
    require(size.get("desktopWidth", {}).get("$value") == "1440px", "desktopWidth token must remain 1440px")
    require(size.get("mobileWidth", {}).get("$value") == "390px", "mobileWidth token must remain 390px")
    require(size.get("touchTargetMin", {}).get("$value") == "44px", "touchTargetMin token must remain 44px")

def check_svg(path: Path, width: str, height: str, viewbox: str) -> None:
    if not path.exists():
        return
    root = ET.parse(path).getroot()
    require(root.tag.endswith("svg"), f"{path.name} root must be svg")
    require(root.attrib.get("width") == width, f"{path.name} width must be {width}")
    require(root.attrib.get("height") == height, f"{path.name} height must be {height}")
    require(root.attrib.get("viewBox") == viewbox, f"{path.name} viewBox must be {viewbox}")
    text = path.read_text(encoding="utf-8")
    require("<script" not in text.lower(), f"{path.name} must not contain scripts")
    require("foreignObject" not in text, f"{path.name} must not contain foreignObject")

check_svg(DESKTOP, "1440", "1024", "0 0 1440 1024")
check_svg(MOBILE, "390", "844", "0 0 390 844")

if DESIGN_DOC.exists():
    text = DESIGN_DOC.read_text(encoding="utf-8")
    require("Mobile non è desktop ridotto" in text, "mobile-first invariant missing")
    require("WCAG 2.2 AA" in text, "WCAG 2.2 AA target missing")
    require("44 × 44 px" in text, "44x44 touch target requirement missing")
    require("non l'autorità dei dati rappresentati" in text, "design-vs-data-authority invariant missing")
    require("Impatto runtime: **nessuno**" in text, "no-runtime statement missing")

if INVENTORY.exists():
    text = INVENTORY.read_text(encoding="utf-8")
    require("44 × 44 px" in text, "build inventory must carry 44x44 touch target rule")
    require("mobile progettato autonomamente" in text, "mobile autonomous-design rule missing")

if COMPONENT_MAP.exists():
    text = COMPONENT_MAP.read_text(encoding="utf-8")
    require("Mobile: lista, senza scroll orizzontale obbligatorio." in text, "mobile evidence-list rule missing")
    require("Mobile: relazione semplificata e navigabile, con alternativa testuale." in text, "mobile ecosystem alternative missing")

if errors:
    print("Penpot design-system validation: FAIL")
    for err in errors:
        print(f"- {err}")
    sys.exit(1)

print("Penpot design-system validation: PASS")
