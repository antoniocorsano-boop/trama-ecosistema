#!/usr/bin/env python3
import importlib.util,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("ro",ROOT/"scripts/cc_mss_readonly_credential_source.py")
m=importlib.util.module_from_spec(spec)
import sys
sys.modules[spec.name]=m
spec.loader.exec_module(m)
enrollment=json.loads((ROOT/"config/repository-enrollment.json").read_text())

class Ctx:
 def __init__(self,p): self._p=p;self.invalidated=False
 @property
 def principal(self): return self._p
 def authorization_header(self):
  if self.invalidated: raise RuntimeError("invalidated")
  return "Bearer fixture-secret"
 def invalidate(self): self.invalidated=True

class Backend:
 def __init__(self,p): self.p=p;self.calls=0;self.last=None
 def materialize(self,ref,repository):
  self.calls+=1;self.last=Ctx(self.p);return self.last

repo="antoniocorsano-boop/Curriculum-Atlas"
good=m.PrincipalDescriptor("github","github-app-installation:atlas-reader",repo,("contents:read","metadata:read"),"github-app-installation-permission-attestation")
b=Backend(good);s=m.GovernedReadOnlyCredentialSource(b,enrollment)
ctx=s.materialize("github-app-installation:atlas-reader",repo)
a=m.permission_attestation(ctx,repo)
assert a["principalRef"]=="github-app-installation:atlas-reader"
assert set(a["permissions"])=={"contents:read","metadata:read"}

for badref in ("fixture:x","env:GITHUB_TOKEN","ghp_secret",""):
 try:s.materialize(badref,repo);raise AssertionError("bad ref accepted")
 except m.ReadOnlyCredentialError:pass

try:s.materialize("github-app-installation:x","owner/not-enrolled");raise AssertionError("unenrolled accepted")
except m.ReadOnlyCredentialError:pass

write=m.PrincipalDescriptor("github","writer",repo,("contents:read","contents:write"),"attestation")
b2=Backend(write);s2=m.GovernedReadOnlyCredentialSource(b2,enrollment)
try:s2.materialize("github-app-installation:writer",repo);raise AssertionError("write accepted")
except m.ReadOnlyCredentialError:assert b2.last.invalidated

mismatch=m.PrincipalDescriptor("github","reader","antoniocorsano-boop/trama-ecosistema",("contents:read",),"attestation")
b3=Backend(mismatch);s3=m.GovernedReadOnlyCredentialSource(b3,enrollment)
try:s3.materialize("github-app-installation:reader",repo);raise AssertionError("mismatch accepted")
except m.ReadOnlyCredentialError:assert b3.last.invalidated

print("TRAMA_READONLY_CREDENTIAL_SOURCE_PASS")
