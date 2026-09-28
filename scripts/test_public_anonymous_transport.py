#!/usr/bin/env python3
import importlib.util,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("transport",ROOT/"scripts/public_anonymous_transport.py")
m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m)
b=m.Budget(5,1)
assert m.build_url("a/b","repo.read")=="https://api.github.com/repos/a/b"
assert m.build_url("a/b","ref.read","main").endswith("/git/ref/heads/main")
assert m.build_url("a/b","commit.read",sha="a"*40).endswith("/commits/"+"a"*40)
try:m.build_url("a/b","repo.write");raise AssertionError
except m.TransportError:pass
for _ in range(4): b.consume()
try:b.consume();raise AssertionError
except m.TransportError:pass
print("TRAMA_PUBLIC_ANONYMOUS_TRANSPORT_OFFLINE_PASS")

assert isinstance(m._opener().handlers[0], __import__("urllib.request",fromlist=["ProxyHandler"]).ProxyHandler)
op=m._opener()
assert any(h.__class__.__name__=="_NoRedirect" for h in op.handlers)
