#!/usr/bin/env python3
from pathlib import Path
import ast
ROOT=Path(__file__).resolve().parents[1]
p=(ROOT/"scripts/run_public_anonymous_live_one_shot.py").read_text(encoding="utf-8")
ast.parse(p)
assert "AUTHORIZE_LIVE_ONE_SHOT" in p
assert 'credential_ref="NONE"' in p
assert 'principal_ref=b.PRINCIPAL' in p
assert 'store.claim(receipt)' in p
assert p.index('store.claim(receipt)') < p.index('c.collect(')
assert 'store.finish(receipt,"CONSUMED")' in p
assert 'store.finish(receipt,"FAILED")' in p
assert "subprocess" not in p and "requests" not in p and "httpx" not in p
print("TRAMA_PUBLIC_ANONYMOUS_LIVE_WORKFLOW_BINDING_PASS")
