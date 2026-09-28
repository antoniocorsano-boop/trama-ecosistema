"""CC-MSS-01 C2 Adapter M1-A — concrete HTTPX configuration, OFFLINE ONLY.
No live credential source or live execution permit is implemented here.
"""
from dataclasses import dataclass
from typing import Protocol, Iterable
import httpx

class M1AError(RuntimeError): pass
def die(code): raise M1AError(code)

AUTHORITY="api.github.com"
ALLOWED_ENCODINGS={"identity","deflate"}
FORBIDDEN_OUTBOUND={"host","proxy-authorization","cookie","forwarded"}

@dataclass(frozen=True)
class ClientPolicy:
 connect_timeout: float=5.0
 read_timeout: float=10.0
 write_timeout: float=5.0
 pool_timeout: float=5.0
 def validate(self):
  vals=(self.connect_timeout,self.read_timeout,self.write_timeout,self.pool_timeout)
  if any(not isinstance(v,(int,float)) or isinstance(v,bool) or v<=0 or v>30 for v in vals): die("CLIENT_POLICY_INVALID")
  return self

class CredentialProvider(Protocol):
 def get_secret(self, credential_ref:str)->str: ...

class LiveExecutionPermit(Protocol):
 def authorize(self, request:dict)->bool: ...

class DisabledPermit:
 def authorize(self, request:dict)->bool: return False

class OfflineCredentialProvider:
 """Deterministic test-only provider; refuses values resembling real GitHub tokens."""
 def __init__(self, secret="offline-fixture-secret"):
  if secret.startswith(("ghp_","github_pat_")): die("REAL_CREDENTIAL_FORBIDDEN")
  self._secret=secret
 def get_secret(self, credential_ref:str)->str:
  if not credential_ref.startswith("fixture:"): die("CREDENTIAL_REF_NOT_OFFLINE")
  return self._secret

def _headers(secret:str)->dict:
 if not secret or "\r" in secret or "\n" in secret: die("HEADER_VALUE_INVALID")
 return {"Accept":"application/vnd.github+json","Authorization":"Bearer "+secret,"User-Agent":"trama-control-center-m1a"}

def validate_request(r:dict):
 if r.get("method")!="GET" or r.get("scheme")!="https" or r.get("host")!=AUTHORITY or r.get("redirect")!="DENY": die("SOURCE_BOUNDARY_VIOLATION")
 p=r.get("path")
 if not isinstance(p,str) or not p.startswith("/repos/") or "://" in p or any(x in p for x in ("\r","\n","#")): die("SOURCE_BOUNDARY_VIOLATION")
 return r

def classify_status(status:int)->str:
 if 200<=status<300:return "OK"
 if 300<=status<400:return "SOURCE_BOUNDARY_VIOLATION"
 if status in (401,403):return "SOURCE_PERMISSION_UNVERIFIED"
 return "SOURCE_UNAVAILABLE"

def validate_encoding(value:str|None)->str:
 v=(value or "identity").strip().lower()
 if "," in v or v not in ALLOWED_ENCODINGS: die("CONTENT_ENCODING_REJECTED")
 return v

class M1ATransport:
 """HTTPX client exists, but execute() is interlocked before any send/DNS/socket."""
 def __init__(self, injected_transport:httpx.BaseTransport, credential_provider:CredentialProvider, permit:LiveExecutionPermit|None=None, policy:ClientPolicy=ClientPolicy()):
  if injected_transport is None: die("INJECTED_TRANSPORT_REQUIRED")
  self._provider=credential_provider; self._permit=permit or DisabledPermit(); policy.validate()
  timeout=httpx.Timeout(connect=policy.connect_timeout,read=policy.read_timeout,write=policy.write_timeout,pool=policy.pool_timeout)
  self._client=httpx.Client(transport=injected_transport,trust_env=False,follow_redirects=False,http2=False,verify=True,timeout=timeout,headers={})
 def close(self): self._client.close()
 def execute(self, validated_request:dict)->tuple[int,str,Iterable[bytes]]:
  r=validate_request(validated_request)
  # M1-A qualification provides no authorizing permit. Fail before request/header/transport use.
  if not self._permit.authorize(r): die("LIVE_NOT_AUTHORIZED")
  secret=self._provider.get_secret(r.get("credentialRef",""))
  url="https://"+AUTHORITY+r["path"]
  req=self._client.build_request("GET",url,headers=_headers(secret))
  resp=self._client.send(req,stream=True,follow_redirects=False)
  status=classify_status(resp.status_code)
  if status!="OK":
   resp.close(); die(status)
  enc=validate_encoding(resp.headers.get("content-encoding"))
  return resp.status_code,enc,resp.iter_raw()
