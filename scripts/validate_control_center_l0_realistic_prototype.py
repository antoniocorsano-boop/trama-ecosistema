#!/usr/bin/env python3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
PROTO=ROOT/"docs/prototypes/TRAMA-CONTROL-CENTER-L0-REALISTIC.html"

def fail(msg):
    raise SystemExit("CONTROL_CENTER_L0_PROTOTYPE_INVALID: "+msg)

def main():
    if not PROTO.is_file():
        fail("prototype missing")
    text=PROTO.read_text(encoding="utf-8")

    # Reuse current Control Center visual tokens rather than invent a new system.
    required_tokens=[
        "--bg:#071827","--surface:#0b2235","--surface2:#0e2b42",
        "--line:#1c4662","--text:#f4f8fb","--muted:#9fb9cb",
        "--info:#58bff7","--ok:#55d79a","--warn:#f0b54a","--danger:#f37d87",
        "--arena:#5dd39e","--atlas:#ae88ff","--dos:#ffc45a"
    ]
    for token in required_tokens:
        if token not in text:
            fail("missing existing design token "+token)

    for state in ["normal","attention","decision","offline"]:
        if f"data-state=\"{state}\"" not in text:
            fail("missing preview state "+state)

    for label in [
        "Sintesi","Ecosistema","Attenzione","Verifiche","Cronologia","Tecnico",
        "Cosa è disponibile oggi","Verifiche rilevanti","Cosa è cambiato"
    ]:
        if label not in text:
            fail("missing IA label "+label)

    # Anti-jargon: primary prototype must not regress to internal identifiers.
    forbidden_primary=[
        "ASSURE-","DOCUMENT_CANONICAL","CURRENT_STATE","EVENT_BOUND",
        "semantic drift","promotionRequired","FUTURE_NOT_AUTHORIZED"
    ]
    for value in forbidden_primary:
        if value.lower() in text.lower():
            fail("internal jargon leaked into prototype: "+value)

    # No network or mutation capability in this prototype.
    for capability in ["fetch(","XMLHttpRequest","WebSocket","EventSource","api.github.com","Authorization:","Bearer "]:
        if capability in text:
            fail("forbidden runtime/network capability: "+capability)

    # Accessibility / mobile invariants.
    for token in [
        'role="status"','aria-live="polite"','aria-atomic="true"',
        "min-height:44px","env(safe-area-inset-bottom)","prefers-reduced-motion",
        "@media(max-width:700px)"
    ]:
        if token not in text:
            fail("missing accessibility/mobile invariant "+token)

    if text.count('<a href="#') < 8:
        fail("insufficient internal navigation")

    print("TRAMA Control Center L0 realistic prototype: PASS")

if __name__=="__main__":
    main()
