#!/usr/bin/env python3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CANON=ROOT/"docs/prototypes/TRAMA-CONTROL-CENTER-L0-REALISTIC.html"
PREVIEW=ROOT/"control-center/preview/l0/index.html"

def fail(msg):
    raise SystemExit("CONTROL_CENTER_L0_RENDER_PREVIEW_INVALID: "+msg)

def main():
    if not CANON.is_file():
        fail("canonical prototype missing")
    if not PREVIEW.is_file():
        fail("render preview missing")
    a=CANON.read_bytes()
    b=PREVIEW.read_bytes()
    if a != b:
        fail("preview drifted from canonical prototype")
    text=b.decode("utf-8")
    for forbidden in ["fetch(","XMLHttpRequest","WebSocket","EventSource","api.github.com","Authorization:","Bearer "]:
        if forbidden in text:
            fail("forbidden runtime/network capability: "+forbidden)
    for required in ["Prototipo realistico · non è la Home pubblica","role=\"status\"","@media(max-width:700px)"]:
        if required not in text:
            fail("missing preview invariant: "+required)
    print("TRAMA Control Center L0 Render preview: PASS")

if __name__=="__main__":
    main()
