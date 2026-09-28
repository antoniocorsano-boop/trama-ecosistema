#!/usr/bin/env python3
"""C2 LIVE probe state machine — OFFLINE SIMULATION ONLY. No network client."""
import hashlib,json,time
from dataclasses import dataclass
from scripts.cc_mss_stage_c2_safety import BudgetLedger,EphemeralSink,SafetyError,permission_attestation,safe_log
class ProbeError(RuntimeError):pass
def die(code):raise ProbeError(code)
def digest(x):return hashlib.sha256(json.dumps(x,sort_keys=True,separators=(',',':')).encode()).hexdigest()
@dataclass(frozen=True)
class Envelope:
 probeRunId:str; implementationSha:str; authorizedSha:str; repository:str; enrolled:bool; operations:tuple; expiresAt:int; maxRequests:int
class FakeTransport:
 """Deterministic transport fixture. It cannot perform I/O."""
 def __init__(self,responses):self.responses=list(responses);self.calls=[]
 def read(self,operation,repository):
  self.calls.append((operation,repository))
  if not self.responses:die('SOURCE_UNAVAILABLE')
  x=self.responses.pop(0)
  if isinstance(x,Exception):raise x
  return x
def run(envelope,observed_permissions,transport,now=None):
 now=int(time.time()) if now is None else now
 if envelope.implementationSha!=envelope.authorizedSha:die('IMPLEMENTATION_SHA_MISMATCH')
 if now>=envelope.expiresAt:die('AUTHORIZATION_EXPIRED')
 if not envelope.enrolled:die('UNENROLLED_REPOSITORY')
 allowed={'repo.read','ref.read','commit.read'}
 if not envelope.operations or any(x not in allowed for x in envelope.operations):die('OPERATION_NOT_AUTHORIZED')
 att=permission_attestation(observed_permissions,{'contents:read'})
 if att['attestationStatus']!='VERIFIED_READ_ONLY':die('SOURCE_PERMISSION_UNVERIFIED')
 ledger=BudgetLedger(envelope.maxRequests,1);sink=EphemeralSink()
 ledger.consume(dependent=True);start=transport.read('ref.read',envelope.repository)
 for op in envelope.operations:
  ledger.consume(dependent=True);payload=transport.read(op,envelope.repository)
  sink.put({'operation':op,'payloadDigest':digest(payload)})
 ledger.close();end=transport.read('ref.read',envelope.repository)
 if start.get('head')!=end.get('head'):die('COLLECTION_INVALIDATED')
 evidence={'probeRunId':envelope.probeRunId,'repository':envelope.repository,'consistency':'CONSISTENT','requestCount':ledger.used,'attestationStatus':att['attestationStatus'],'items':sink.items}
 evidence['digest']=digest(evidence)
 return evidence,safe_log({'probeRunId':envelope.probeRunId,'repository':envelope.repository,'status':'PASS','requestCount':ledger.used})
