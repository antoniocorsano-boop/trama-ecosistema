"""CC-MSS-01 C2 Adapter M1-B candidate — OFFLINE QUALIFICATION ONLY.
No real credential source, permission source, clock, or network transport exists here.
"""
from dataclasses import dataclass
from datetime import datetime, timezone
from threading import Lock
from typing import Protocol

class M1BError(RuntimeError): pass
def die(code): raise M1BError(code)

TERMINAL={"CONSUMED","FAILED"}

class Clock(Protocol):
 def now(self)->datetime: ...

@dataclass(frozen=True)
class Receipt:
 ref:str; probe_id:str; repository:str; exact_sha:str; operations:tuple[str,...]
 credential_ref:str; principal_ref:str; issued_at:datetime; expires_at:datetime
 policy_digest:str; resource_digest:str

class ReceiptStore:
 """Offline atomic state model. Persistent live store is deliberately absent."""
 def __init__(self): self._state={}; self._lock=Lock()
 def issue(self,r:Receipt):
  with self._lock:
   if r.ref in self._state: die("RECEIPT_EXISTS")
   self._state[r.ref]=(r,"ISSUED")
 def claim(self,ref,probe_id,exact_sha):
  with self._lock:
   item=self._state.get(ref)
   if not item or item[1]!="ISSUED": die("RECEIPT_NOT_CLAIMABLE")
   r,_=item
   if r.probe_id!=probe_id or r.exact_sha!=exact_sha: die("RECEIPT_BINDING_MISMATCH")
   self._state[ref]=(r,"CLAIMED"); return r
 def finish(self,ref,state):
  if state not in TERMINAL: die("RECEIPT_STATE_INVALID")
  with self._lock:
   item=self._state.get(ref)
   if not item or item[1]!="CLAIMED": die("RECEIPT_NOT_CLAIMED")
   self._state[ref]=(item[0],state)
 def state(self,ref):
  with self._lock:return self._state.get(ref,(None,"UNKNOWN"))[1]

class FakeCredentialSource:
 def __init__(self,principal="fixture-principal",secret="offline-fixture-secret"):self.principal=principal;self.secret=secret;self.calls=0
 def materialize(self,ref):
  if not ref.startswith("fixture:"):die("REAL_CREDENTIAL_FORBIDDEN")
  self.calls+=1;return self.secret,self.principal

class FakePermissionSource:
 def __init__(self,principal="fixture-principal",permissions=("contents:read",)):self.principal=principal;self.permissions=permissions;self.calls=0
 def attest(self,repository,credential_ref):
  self.calls+=1
  return {"repository":repository,"credentialRef":credential_ref,"principalRef":self.principal,"permissions":self.permissions,"provenance":"fixture:permission-source"}

class RequestBudget:
 def __init__(self,total:int,close_reserve:int=1):
  if total<=close_reserve or close_reserve<1:die("BUDGET_INVALID")
  self.remaining=total;self.reserve=close_reserve
 def consume(self,n=1,allow_reserve=False):
  if n<1:die("BUDGET_INVALID")
  floor=0 if allow_reserve else self.reserve
  if self.remaining-n<floor:die("BUDGET_EXHAUSTED")
  self.remaining-=n

def validate_time(r:Receipt,now:datetime):
 if now.tzinfo is None or now.utcoffset() is None:die("CLOCK_INVALID")
 now=now.astimezone(timezone.utc)
 if r.issued_at.tzinfo is None or r.expires_at.tzinfo is None:die("RECEIPT_TIME_INVALID")
 if not (r.issued_at.astimezone(timezone.utc)<=now<r.expires_at.astimezone(timezone.utc)):die("RECEIPT_EXPIRED")

def validate_attestation(a,r:Receipt,principal):
 if a.get("repository")!=r.repository or a.get("credentialRef")!=r.credential_ref:die("PERMISSION_BINDING_MISMATCH")
 if not a.get("provenance"):die("PERMISSION_PROVENANCE_MISSING")
 if a.get("principalRef")!=principal or principal!=r.principal_ref:die("PRINCIPAL_MISMATCH")
 p=set(a.get("permissions",()))
 if not p or any(x.endswith(":write") for x in p):die("PERMISSION_NOT_READ_ONLY")

class M1BOfflineSession:
 """Exercises ordering/state only. It has no HTTP client and cannot emit network traffic."""
 def __init__(self,store,clock,credential_source,permission_source,exact_sha):
  self.store=store;self.clock=clock;self.credentials=credential_source;self.permissions=permission_source;self.exact_sha=exact_sha
 def prepare(self,receipt_ref,probe_id,budget:RequestBudget):
  # Non-secret validation precedes claim and credential materialization.
  item=self.store._state.get(receipt_ref)
  if not item:die("RECEIPT_UNKNOWN")
  validate_time(item[0],self.clock.now())
  r=self.store.claim(receipt_ref,probe_id,self.exact_sha)
  try:
   validate_time(r,self.clock.now())
   budget.consume() # permission bootstrap request budget, simulated only
   secret,principal=self.credentials.materialize(r.credential_ref)
   if principal!=r.principal_ref:die("PRINCIPAL_MISMATCH")
   validate_time(r,self.clock.now())
   att=self.permissions.attest(r.repository,r.credential_ref)
   validate_attestation(att,r,principal)
   return {"receipt":r,"principal":principal,"secret":secret,"attestation":att,"evidenceState":"IN_PROGRESS"}
  except BaseException:
   self.store.finish(receipt_ref,"FAILED");raise
 def complete(self,ctx,budget:RequestBudget,anchor_same=True):
  r=ctx["receipt"]
  try:
   validate_time(r,self.clock.now());budget.consume(allow_reserve=True)
   if not anchor_same:die("ANCHOR_CHANGED")
   ctx["evidenceState"]="VALID";self.store.finish(r.ref,"CONSUMED");ctx["secret"]=None;return ctx
  except BaseException:
   ctx["evidenceState"]="INVALID/INCOMPLETE";ctx["secret"]=None
   if self.store.state(r.ref)=="CLAIMED":self.store.finish(r.ref,"FAILED")
   raise
