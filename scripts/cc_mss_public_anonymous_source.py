"""CC-MSS-01 public anonymous read-only source.
Offline-qualifiable. Real network remains gated by an exact-head one-shot permit.
"""
from dataclasses import dataclass
from datetime import datetime, timezone
from threading import Lock
from typing import Protocol, Iterable
import hashlib, json
import httpx

class AnonymousSourceError(RuntimeError): pass
def die(code): raise AnonymousSourceError(code)

AUTHORITY="api.github.com"
MODE="PUBLIC_ANONYMOUS_READ_ONLY"
OPS={
 "repo.read":"/repos/{repository}",
 "ref.read":"/repos/{repository}/git/ref/heads/{branch}",
 "commit.read":"/repos/{repository}/commits/{head}",
}
FORBIDDEN_HEADER_NAMES={
 "authorization","cookie","proxy-authorization","host","forwarded",
 "x-forwarded-for","x-forwarded-host","x-forwarded-proto"
}

def canon(value):
 return json.dumps(value,sort_keys=True,separators=(",",":"))

def digest(value):
 return "sha256:"+hashlib.sha256(canon(value).encode()).hexdigest()

@dataclass(frozen=True)
class AnonymousReceipt:
 ref:str
 probe_id:str
 repository:str
 exact_sha:str
 operations:tuple[str,...]
 issued_at:datetime
 expires_at:datetime
 policy_digest:str
 resource_digest:str
 mode:str=MODE

class ReceiptStore:
 def __init__(self):
  self._state={}
  self._lock=Lock()
 def issue(self,r):
  with self._lock:
   if r.ref in self._state: die("RECEIPT_EXISTS")
   self._state[r.ref]=(r,"ISSUED")
 def claim(self,ref,probe_id,exact_sha):
  with self._lock:
   item=self._state.get(ref)
   if not item or item[1]!="ISSUED": die("RECEIPT_NOT_CLAIMABLE")
   r,_=item
   if r.probe_id!=probe_id or r.exact_sha!=exact_sha: die("RECEIPT_BINDING_MISMATCH")
   self._state[ref]=(r,"CLAIMED")
   return r
 def finish(self,ref,state):
  if state not in {"CONSUMED","FAILED"}: die("RECEIPT_STATE_INVALID")
  with self._lock:
   item=self._state.get(ref)
   if not item or item[1]!="CLAIMED": die("RECEIPT_NOT_CLAIMED")
   self._state[ref]=(item[0],state)
 def state(self,ref):
  with self._lock:
   return self._state.get(ref,(None,"UNKNOWN"))[1]

class LiveExecutionPermit(Protocol):
 def authorize(self,request:dict)->bool: ...

class DisabledPermit:
 def authorize(self,request): return False

class PublicVisibilitySource(Protocol):
 def attest(self,repository:str)->dict: ...

def validate_time(r,now):
 if now.tzinfo is None or now.utcoffset() is None: die("CLOCK_INVALID")
 now=now.astimezone(timezone.utc)
 if r.issued_at.tzinfo is None or r.expires_at.tzinfo is None: die("RECEIPT_TIME_INVALID")
 if not (r.issued_at.astimezone(timezone.utc)<=now<r.expires_at.astimezone(timezone.utc)):
  die("RECEIPT_EXPIRED")

def validate_enrollment(enrollment,repository,branch):
 if enrollment.get("repository")!=repository: die("ENROLLMENT_REPOSITORY_MISMATCH")
 if enrollment.get("state")!="ENROLLED": die("REPOSITORY_NOT_ENROLLED")
 if enrollment.get("discoveryPolicy")!="allowlist": die("DISCOVERY_POLICY_INVALID")
 if enrollment.get("defaultBranch")!=branch: die("DEFAULT_BRANCH_MISMATCH")
 if not enrollment.get("authorityRef") or not enrollment.get("sourceRefs"): die("ENROLLMENT_PROVENANCE_MISSING")

def validate_visibility(att,repository,branch):
 if att.get("repository")!=repository: die("VISIBILITY_BINDING_MISMATCH")
 if att.get("visibility")!="public": die("PUBLIC_VISIBILITY_NOT_VERIFIED")
 if att.get("defaultBranch")!=branch: die("DEFAULT_BRANCH_MISMATCH")
 if not att.get("sourceOperation") or not att.get("observedAt"): die("VISIBILITY_PROVENANCE_MISSING")
 expected=digest({k:att[k] for k in ("repository","visibility","defaultBranch","sourceOperation","observedAt")})
 if att.get("digest")!=expected: die("VISIBILITY_DIGEST_MISMATCH")
 return att

def public_attestation(repository,default_branch,source_operation,observed_at):
 payload={
  "repository":repository,
  "visibility":"public",
  "defaultBranch":default_branch,
  "sourceOperation":source_operation,
  "observedAt":observed_at,
 }
 return {**payload,"digest":digest(payload)}

def validate_request(request):
 if request.get("method")!="GET" or request.get("scheme")!="https" or request.get("host")!=AUTHORITY:
  die("SOURCE_BOUNDARY_VIOLATION")
 if request.get("redirect")!="DENY": die("SOURCE_BOUNDARY_VIOLATION")
 op=request.get("operation")
 if op not in OPS: die("OPERATION_NOT_AUTHORIZED")
 repository=request.get("repository","")
 if "/" not in repository or any(x in repository for x in ("..","://","\r","\n","#","?")):
  die("REPOSITORY_ID_INVALID")
 caller_headers=request.get("headers")
 if caller_headers:
  die("CALLER_HEADERS_FORBIDDEN")
 return request

def anonymous_headers():
 return {"Accept":"application/vnd.github+json","User-Agent":"trama-control-center-public-anonymous"}

def assert_no_secret_headers(headers):
 lowered={k.lower():v for k,v in headers.items()}
 if any(k in lowered for k in FORBIDDEN_HEADER_NAMES): die("CREDENTIAL_SURFACE_DETECTED")
 if any("bearer " in str(v).lower() or "token " in str(v).lower() for v in lowered.values()):
  die("CREDENTIAL_SURFACE_DETECTED")

def build_path(request,branch,head):
 op=request["operation"]
 return OPS[op].format(repository=request["repository"],branch=branch,head=head or "HEAD")

class AnonymousHTTPTransport:
 def __init__(self,injected_transport:httpx.BaseTransport,permit:LiveExecutionPermit|None=None):
  if injected_transport is None: die("INJECTED_TRANSPORT_REQUIRED")
  self._permit=permit or DisabledPermit()
  self._client=httpx.Client(
   transport=injected_transport,
   trust_env=False,
   follow_redirects=False,
   http2=False,
   verify=True,
   headers={}
  )
 def close(self): self._client.close()
 def execute(self,request,branch="main",head=None)->tuple[int,Iterable[bytes],dict]:
  r=validate_request(request)
  if not self._permit.authorize(r): die("LIVE_NOT_AUTHORIZED")
  headers=anonymous_headers()
  assert_no_secret_headers(headers)
  path=build_path(r,branch,head)
  url="https://"+AUTHORITY+path
  req=self._client.build_request("GET",url,headers=headers)
  assert_no_secret_headers(dict(req.headers))
  resp=self._client.send(req,stream=True,follow_redirects=False)
  try:
   if 300<=resp.status_code<400: die("SOURCE_BOUNDARY_VIOLATION")
   if resp.status_code!=200: die("SOURCE_UNAVAILABLE")
   return resp.status_code,_owned_stream(resp),dict(resp.headers)
  except BaseException:
   resp.close()
   raise

def _owned_stream(resp):
 try:
  yield from resp.iter_raw()
 finally:
  resp.close()

class AnonymousOneShotSession:
 def __init__(self,store,visibility_source,exact_sha,clock):
  self.store=store
  self.visibility_source=visibility_source
  self.exact_sha=exact_sha
  self.clock=clock
 def prepare(self,receipt_ref,probe_id,enrollment,branch):
  r=self.store.claim(receipt_ref,probe_id,self.exact_sha)
  try:
   validate_time(r,self.clock.now())
   if r.mode!=MODE: die("MODE_MISMATCH")
   if not r.operations or any(op not in OPS for op in r.operations): die("OPERATION_NOT_AUTHORIZED")
   validate_enrollment(enrollment,r.repository,branch)
   att=self.visibility_source.attest(r.repository)
   validate_visibility(att,r.repository,branch)
   return {"receipt":r,"visibilityAttestation":att,"evidenceState":"IN_PROGRESS"}
  except BaseException:
   self.store.finish(receipt_ref,"FAILED")
   raise
 def complete(self,ctx):
  r=ctx["receipt"]
  try:
   validate_time(r,self.clock.now())
   ctx["evidenceState"]="VALID"
   self.store.finish(r.ref,"CONSUMED")
   return ctx
  except BaseException:
   ctx["evidenceState"]="INVALID/INCOMPLETE"
   if self.store.state(r.ref)=="CLAIMED": self.store.finish(r.ref,"FAILED")
   raise
