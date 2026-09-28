#!/usr/bin/env python3
import importlib.util,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("anon",ROOT/"scripts/cc_mss_readonly_credential_source.py")
m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m)
enrollment=json.loads((ROOT/"config/repository-enrollment.json").read_text())
class Verify:
 def __init__(self,public=True):self.public=public
 def verify_public(self,repository):return self.public
repo="antoniocorsano-boop/Curriculum-Atlas"
s=m.GovernedAnonymousReadOnlySource(Verify(True),enrollment)
p=s.authorize(repo,"repo.read")
r=m.request_descriptor(p,"/repos/"+repo)
assert r["method"]=="GET" and r["host"]=="api.github.com"
assert r["authorizationHeader"]=="ABSENT" and r["cookieHeader"]=="ABSENT" and r["proxyPolicy"]=="DISABLED"
prp=s.authorize(repo,"pr.read")
prd=m.request_descriptor(prp,"/repos/"+repo+"/pulls?state=open&per_page=100")
assert prd["operation"]=="pr.read"
for op in ("repo.write","issues.write","admin",""):
 try:s.authorize(repo,op);raise AssertionError("write/unknown operation accepted")
 except m.AnonymousReadOnlyError:pass
try:s.authorize("owner/not-enrolled","repo.read");raise AssertionError("unenrolled accepted")
except m.AnonymousReadOnlyError:pass
try:m.GovernedAnonymousReadOnlySource(Verify(False),enrollment).authorize(repo,"repo.read");raise AssertionError("non-public accepted")
except m.AnonymousReadOnlyError:pass
for bad in (
 "https://api.github.com/repos/"+repo,
 "/repos/"+repo+"/pulls",
 "/repos/other/repo",
 "/repos/"+repo+"#frag",
 "/repos/"+repo+"/pulls?access_token=secret",
 "/repos/"+repo+"/pulls?state=all&per_page=100"
):
 try:m.request_descriptor(prp if "/pulls?" in bad else p,bad);raise AssertionError("bad path accepted")
 except m.AnonymousReadOnlyError:pass
print("TRAMA_PUBLIC_ANONYMOUS_READ_ONLY_PASS")
