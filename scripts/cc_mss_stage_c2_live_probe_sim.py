#!/usr/bin/env python3
"""C2 LIVE probe — deterministic OFFLINE composition. NO network client."""
import hashlib,json,time
from dataclasses import dataclass
from scripts.cc_mss_stage_c2_safety import BudgetLedger,EphemeralSink,permission_attestation,safe_log
class ProbeError(RuntimeError):pass
def die(c):raise ProbeError(c)
def canon(x):return json.dumps(x,sort_keys=True,separators=(',',':'))
def digest(x):return hashlib.sha256(canon(x).encode()).hexdigest()
OPS={
 'repo.read':('GET','/repos/{repository}','repo-v1'),
 'ref.read':('GET','/repos/{repository}/git/ref/heads/main','ref-v1'),
 'commit.read':('GET','/repos/{repository}/commits/{head}','commit-v1')}
@dataclass(frozen=True)
class Envelope:
 probeRunId:str;implementationSha:str;authorizedSha:str;repository:str;enrolled:bool;operations:tuple;credentialRef:str;issuedAt:int;expiresAt:int;maxRequests:int;maxRetries:int;timeoutMs:int;maxCompressedBytes:int;maxDecompressedBytes:int;maxPages:int;maxItems:int;maxSessionBytes:int;canonicalizationVersion:str;evidenceDestination:str
class Boundary:
 def validate(self,scheme,host,redirect=False):
  if scheme!='https' or host!='api.github.com' or redirect:die('SOURCE_BOUNDARY_VIOLATION')
class FakeTransport:
 """Offline deterministic transport; responses are preloaded fixtures."""
 def __init__(self,responses,boundary=None):self.responses=list(responses);self.calls=[];self.boundary=boundary or Boundary()
 def read(self,operation,repository,ctx):
  if operation not in OPS:die('OPERATION_NOT_AUTHORIZED')
  method,path,schema=OPS[operation]
  if method!='GET':die('MUTATION_FORBIDDEN')
  self.boundary.validate(ctx['scheme'],ctx['host'],ctx.get('redirect',False))
  self.calls.append((method,path.format(repository=repository,head=ctx.get('head','HEAD')),schema))
  if not self.responses:die('SOURCE_UNAVAILABLE')
  x=self.responses.pop(0)
  if isinstance(x,Exception):raise x
  return x
def validate_envelope(e,now):
 if e.implementationSha!=e.authorizedSha:die('IMPLEMENTATION_SHA_MISMATCH')
 if not(e.issuedAt<=now<e.expiresAt):die('AUTHORIZATION_EXPIRED')
 if not e.enrolled:die('UNENROLLED_REPOSITORY')
 if not e.operations or any(x not in OPS for x in e.operations):die('OPERATION_NOT_AUTHORIZED')
 if not e.credentialRef or e.credentialRef.startswith('token:'):die('CREDENTIAL_REF_INVALID')
 if e.maxRequests<3 or e.maxRetries<0 or e.timeoutMs<=0:die('AUTHORIZATION_ENVELOPE_INVALID')
 if min(e.maxCompressedBytes,e.maxDecompressedBytes,e.maxPages,e.maxItems,e.maxSessionBytes)<=0:die('AUTHORIZATION_ENVELOPE_INVALID')
 if e.canonicalizationVersion!='cc-mss-c1-v1' or e.evidenceDestination!='ephemeral://memory':die('AUTHORIZATION_ENVELOPE_INVALID')
def bind_attestation(e,observed):
 a=permission_attestation(observed,{'contents:read'});payload={'probeRunId':e.probeRunId,'repository':e.repository,'implementationSha':e.implementationSha,'credentialRef':e.credentialRef,'attestation':a};payload['digest']=digest(payload)
 if a['attestationStatus']!='VERIFIED_READ_ONLY':die('SOURCE_PERMISSION_UNVERIFIED')
 return payload
def bounded_payload(x,e):
 raw=canon(x).encode()
 if len(raw)>e.maxDecompressedBytes or len(raw)>e.maxSessionBytes:die('SOURCE_RESOURCE_LIMIT_EXCEEDED')
 if isinstance(x,list) and len(x)>e.maxItems:die('SOURCE_RESOURCE_LIMIT_EXCEEDED')
 return x
def read_counted(ledger,transport,op,repo,ctx,e,dependent=True):
 attempts=0
 while True:
  ledger.consume(dependent=dependent);attempts+=1
  try:return bounded_payload(transport.read(op,repo,ctx),e)
  except ProbeError:raise
  except Exception:
   if attempts>e.maxRetries:die('SOURCE_UNAVAILABLE')
def run(e,observed_permissions,transport,now=None,ctx=None):
 now=int(time.time()) if now is None else now;ctx=ctx or {'scheme':'https','host':'api.github.com','redirect':False}
 validate_envelope(e,now);att=bind_attestation(e,observed_permissions);ledger=BudgetLedger(e.maxRequests,1);sink=EphemeralSink()
 start=read_counted(ledger,transport,'ref.read',e.repository,ctx,e,True);head=start.get('head')
 pages=0;session_bytes=0
 for op in e.operations:
  payload=read_counted(ledger,transport,op,e.repository,{**ctx,'head':head},e,True);pages+=1
  if pages>e.maxPages:die('SOURCE_RESOURCE_LIMIT_EXCEEDED')
  b=len(canon(payload).encode());session_bytes+=b
  if session_bytes>e.maxSessionBytes:die('SOURCE_RESOURCE_LIMIT_EXCEEDED')
  if isinstance(payload,dict) and payload.get('paginationComplete') is False:die('INCOMPLETE_PAGINATION')
  sink.put({'operation':op,'schema':OPS[op][2],'payloadDigest':digest(payload)})
 ledger.close();end=transport.read('ref.read',e.repository,{**ctx,'head':head})
 if start.get('head')!=end.get('head'):die('COLLECTION_INVALIDATED')
 evidence={'probeRunId':e.probeRunId,'repository':e.repository,'implementationSha':e.implementationSha,'canonicalizationVersion':e.canonicalizationVersion,'consistency':'CONSISTENT','requestCount':ledger.used,'attestationDigest':att['digest'],'items':sink.items};evidence['digest']=digest(evidence)
 return evidence,safe_log({'probeRunId':e.probeRunId,'repository':e.repository,'status':'PASS','requestCount':ledger.used})
