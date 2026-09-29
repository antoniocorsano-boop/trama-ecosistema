#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/"docs/prototypes/TRAMA-STAGE-E1-PROJECT-KNOWLEDGE-VISUAL.html"
SPEC=ROOT/"docs/design/trama-stage-e1-project-knowledge-visual-prototype-v1.md"

def fail(msg):
    raise SystemExit("STAGE_E1_VISUAL_PROTOTYPE_INVALID: "+msg)

def main():
    if not HTML.is_file(): fail("prototype missing")
    if not SPEC.is_file(): fail("spec missing")
    html=HTML.read_text(encoding="utf-8")
    spec=SPEC.read_text(encoding="utf-8")

    required_scenarios=[
      'data-scenario="normal"',
      'data-scenario="loading"',
      'data-scenario="empty"',
      'data-scenario="partial"',
      'data-scenario="review"',
      'data-scenario="blocked"',
      'data-scenario="noaccess"',
      'data-scenario="offline"',
    ]
    for token in required_scenarios:
        if token not in html: fail("missing scenario "+token)

    required_copy=[
      "Informazioni verificate",
      "Aggiornamenti recenti",
      "Da verificare",
      "Dettagli tecnici",
      "Nessun aggiornamento da mostrare",
      "Informazioni parzialmente aggiornate",
      "Serve una verifica prima di continuare",
      "Non hai accesso ai dettagli tecnici",
      "Stai vedendo l'ultimo stato disponibile",
    ]
    for token in required_copy:
        if token not in html: fail("missing user-facing copy "+token)

    required_a11y=[
      'lang="it"',
      'aria-live="polite"',
      'role="status"',
      ':focus-visible',
      'prefers-reduced-motion',
      '<details',
      '<summary>',
    ]
    for token in required_a11y:
        if token not in html: fail("missing accessibility invariant "+token)

    forbidden_runtime=[
      "fetch(",
      "XMLHttpRequest",
      "WebSocket(",
      "EventSource(",
      "navigator.sendBeacon",
      "localStorage.setItem",
      "serviceWorker.register",
      "github.com/",
      "api.github.com",
    ]
    for token in forbidden_runtime:
        if token in html: fail("runtime/network capability present: "+token)

    forbidden_primary_labels=[
      ">semantic drift<",
      ">repository head mismatch<",
      ">promotionRequired<",
    ]
    for token in forbidden_primary_labels:
        if token.lower() in html.lower(): fail("technical primary label present: "+token)

    if "nessun overall score" not in spec.lower() and "overall score" not in spec.lower():
        fail("overall-score boundary missing from spec")
    if "nessun accesso di rete" not in spec.lower():
        fail("no-network boundary missing from spec")
    if "dati esclusivamente sintetici" not in spec.lower():
        fail("synthetic-data boundary missing from spec")

    print("TRAMA Stage E1 visual prototype: PASS")
    return 0

if __name__=="__main__":
    sys.exit(main())
