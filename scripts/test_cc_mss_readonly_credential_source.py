#!/usr/bin/env python3
import importlib.util,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("anon",ROOT/"scripts/cc_mss_readonly_credential_source.py")
m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m)
enrollment=json.loads((ROOT/"config/repository-enrollment.json").read_text())

class Verify:
 def __init__(self,public=True):self.public=public;self.calls=[]
 def verify_public(self,repository):self.calls.append(repository);return self.public

repo="antoniocorsano-boop/Curriculum-Atlas"
s=m.GovernedAnonymousReadOnlySource(Verify(True),enrollment)
p=s.authorize(repo,"repo.read")
assert p.principal_ref=="PUBLIC_ANONYMOUS"
r=m.request_descriptor(p,"/repos/antoniocorsano-boop/Curriculum-Atlas")
assert r["method"]=="GET" and r["host"]=="api.github.com"
assert s.authorize(repo,"pr.read").operation=="pr.read"
assert r["authorizationHeader"]=="ABSENT" and r["cookieHeader"]=="ABSENT" and r["proxyPolicy"]=="DISABLED"

assert s.authorize(repo,"pr.read").operation=="pr.read"\nfor op in ("repo.write","issues.write","admin",""):
 try:s.authorize(repo,op);raise AssertionError("write/unknown operation accepted")
 except m.AnonymousReadOnlyError:pass

try:s.authorize("owner/not-enrolled","repo.read");raise AssertionError("unenrolled accepted")
except m.AnonymousReadOnlyError:pass

private=m.GovernedAnonymousReadOnlySource(Verify(False),enrollment)
try:private.authorize(repo,"repo.read");raise AssertionError("non-public accepted")
except m.AnonymousReadOnlyError:pass

for bad in (
 "https://api.github.com/repos/antoniocorsano-boop/Curriculum-Atlas",
 "/repos/other/repo",
 "/repos/antoniocorsano-boop/Curriculum-Atlas#frag",
 "/repos/antoniocorsano-boop/Curriculum-Atlas?access_token=secret"
):
 try:m.request_descriptor(p,bad);raise AssertionError("bad path accepted")
 except m.AnonymousReadOnlyError:pass

print("TRAMA_PUBLIC_ANONYMOUS_READ_ONLY_PASS")
