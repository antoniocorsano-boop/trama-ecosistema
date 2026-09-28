#!/usr/bin/env python3
import importlib.util,sys,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("transport",ROOT/"scripts/public_anonymous_transport.py")
m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m)
b=m.Budget(5,1)
rb=m.ResourceBudget(100)
assert m.build_url("a/b","repo.read")=="https://api.github.com/repos/a/b"
assert m.build_url("a/b","ref.read","main").endswith("/git/ref/heads/main")
assert m.build_url("a/b","commit.read",sha="a"*40).endswith("/commits/"+"a"*40)
assert m.build_url("a/b","pr.read")=="https://api.github.com/repos/a/b/pulls?state=open&per_page=100"
try:m.build_url("a/b","repo.write");raise AssertionError
except m.TransportError:pass
for _ in range(4): b.consume()
try:b.consume();raise AssertionError
except m.TransportError:pass
rb.consume(60)
try: rb.consume(41); raise AssertionError
except m.TransportError: pass
print("TRAMA_PUBLIC_ANONYMOUS_TRANSPORT_OFFLINE_PASS")

op=m._opener()
assert not any(isinstance(h,urllib.request.ProxyHandler) and getattr(h,"proxies",{}) for h in op.handlers)
assert any(h.__class__.__name__=="_NoRedirect" for h in op.handlers)
