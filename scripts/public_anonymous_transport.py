#!/usr/bin/env python3
from __future__ import annotations
import json, ssl, urllib.request, urllib.error
from dataclasses import dataclass

AUTHORITY="api.github.com"
ALLOWED_OPS={"repo.read","ref.read","commit.read"}

class TransportError(RuntimeError): pass
def die(code): raise TransportError(code)

@dataclass
class Budget:
    remaining:int
    reserve:int=1
    def consume(self,n=1,allow_reserve=False):
        floor=0 if allow_reserve else self.reserve
        if n<1 or self.remaining-n<floor: die("BUDGET_EXHAUSTED")
        self.remaining-=n

def build_url(repository,operation,ref="main",sha=None):
    if operation not in ALLOWED_OPS: die("OPERATION_NOT_ALLOWED")
    base=f"https://{AUTHORITY}/repos/{repository}"
    if operation=="repo.read": return base
    if operation=="ref.read": return f"{base}/git/ref/heads/{ref}"
    if not sha: die("COMMIT_SHA_REQUIRED")
    return f"{base}/commits/{sha}"

def _opener():
    ctx=ssl.create_default_context()
    handler=urllib.request.HTTPSHandler(context=ctx)
    opener=urllib.request.build_opener(handler)
    opener.addheaders=[
      ("Accept","application/vnd.github+json"),
      ("User-Agent","trama-public-anonymous-readonly")
    ]
    return opener

def anonymous_get(url,budget:Budget,max_bytes=512000):
    if not url.startswith(f"https://{AUTHORITY}/repos/"): die("SOURCE_BOUNDARY_VIOLATION")
    budget.consume()
    req=urllib.request.Request(url,method="GET",headers={
      "Accept":"application/vnd.github+json",
      "User-Agent":"trama-public-anonymous-readonly"
    })
    opener=_opener()
    try:
        with opener.open(req,timeout=10) as resp:
            if getattr(resp,"status",0) != 200: die("SOURCE_UNAVAILABLE")
            if resp.geturl()!=url: die("REDIRECT_FORBIDDEN")
            data=resp.read(max_bytes+1)
            if len(data)>max_bytes: die("RESOURCE_LIMIT_EXCEEDED")
            return json.loads(data.decode("utf-8"))
    except urllib.error.HTTPError as e:
        if 300 <= e.code < 400: die("REDIRECT_FORBIDDEN")
        if e.code in (401,403): die("ANONYMOUS_ACCESS_DENIED")
        die("SOURCE_UNAVAILABLE")
    except urllib.error.URLError:
        die("SOURCE_UNAVAILABLE")
