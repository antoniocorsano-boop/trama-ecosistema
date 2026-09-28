#!/usr/bin/env python3
import importlib.util,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("ro",ROOT/"scripts/cc_mss_readonly_credential_source.py")
m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m)
enrollment=json.loads((ROOT/"config/repository-enrollment.json").read_text())
repo="antoniocorsano-boop/Curriculum-Atlas";ref="github-app-installation:atlas-reader";principal="github-installation:123"

class Ctx:
 def __init__(self,p):self._p=p;self.invalidated=False
 @property
 def principal(self):return self._p
 def authorization_header(self):
  if self.invalidated:raise RuntimeError("invalidated")
  return "Bearer fixture-secret"
 def invalidate(self):self.invalidated=True
class Backend:
 def __init__(self,p):self.p=p;self.last=None
 def materialize(self,credential_ref,repository):self.last=Ctx(self.p);return self.last
class Perm:
 def __init__(self,a):self.a=a;self.calls=0
 def attest(self,repository,credential_ref,principal_ref):self.calls+=1;return self.a

p=m.CredentialPrincipal("github",principal,repo,ref)
good=m.PermissionAttestation(repo,ref,principal,("contents:read","metadata:read"),"github-app-installation-permissions-api/v1","VERIFIED")
b=Backend(p);s=m.GovernedReadOnlyCredentialSource(b,Perm(good),enrollment)
ctx=s.materialize(ref,repo);a=s.attest(ctx,repo)
assert a["state"]=="VERIFIED" and set(a["permissions"])=={"contents:read","metadata:read"}

cases=[
 m.PermissionAttestation(repo,ref,principal,("contents:read","contents:write"),"github-app-installation-permissions-api/v1","VERIFIED"),
 m.PermissionAttestation(repo,ref,principal,("contents:read",),"self-asserted","VERIFIED"),
 m.PermissionAttestation(repo,ref,principal,("contents:read",),"github-app-installation-permissions-api/v1","UNKNOWN"),
 m.PermissionAttestation(repo,"github-app-installation:other",principal,("contents:read",),"github-app-installation-permissions-api/v1","VERIFIED"),
 m.PermissionAttestation(repo,ref,"other-principal",("contents:read",),"github-app-installation-permissions-api/v1","VERIFIED")
]
for bad in cases:
 bb=Backend(p);ss=m.GovernedReadOnlyCredentialSource(bb,Perm(bad),enrollment)
 try:ss.materialize(ref,repo);raise AssertionError("bad attestation accepted")
 except m.ReadOnlyCredentialError:assert bb.last.invalidated

for badref in ("fixture:x","env:GITHUB_TOKEN","ghp_secret",""):
 try:s.materialize(badref,repo);raise AssertionError("bad ref accepted")
 except m.ReadOnlyCredentialError:pass
try:s.materialize(ref,"owner/not-enrolled");raise AssertionError("unenrolled accepted")
except m.ReadOnlyCredentialError:pass
print("TRAMA_READONLY_CREDENTIAL_SOURCE_PASS")
