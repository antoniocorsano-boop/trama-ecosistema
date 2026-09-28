"""PUBLIC-ANONYMOUS-LIVE-BINDING-01 — offline-qualified single-use binding.

No network client is present here. A human-authorized dispatch becomes one
executable receipt only when bound to a unique GitHub Actions run_id and
run_attempt == 1. Reruns fail closed.
"""
from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
import json, os

class BindingError(RuntimeError): pass
def die(code:str): raise BindingError(code)

ALLOWED_OPS=("repo.read","ref.read","commit.read","pr.read")
PRINCIPAL="PUBLIC_ANONYMOUS"
MODE="LIVE_ONE_SHOT"

@dataclass(frozen=True)
class HumanAuthorization:
    authorization_ref:str
    runtime_mode:str
    credential_ref:str
    exact_sha:str
    repositories:tuple[str,...]
    operations:tuple[str,...]
    principal_ref:str
    evidence_destination:str
    issued_at:str
    expires_at:str

@dataclass(frozen=True)
class Invocation:
    run_id:str
    run_attempt:int

@dataclass(frozen=True)
class ExecutableReceipt:
    receipt_ref:str
    authorization_ref:str
    runtime_mode:str
    credential_ref:str
    run_id:str
    run_attempt:int
    exact_sha:str
    repositories:tuple[str,...]
    operations:tuple[str,...]
    principal_ref:str
    evidence_destination:str

def _utc(value:str)->datetime:
    try:d=datetime.fromisoformat(value.replace("Z","+00:00"))
    except Exception:die("TIME_INVALID")
    if d.tzinfo is None or d.utcoffset() is None:die("TIME_INVALID")
    return d.astimezone(timezone.utc)

def admit(a:HumanAuthorization,current_sha:str,enrolled:tuple[str,...],now:datetime,invocation:Invocation)->ExecutableReceipt:
    if not a.authorization_ref:die("AUTHORIZATION_REF_MISSING")
    if a.runtime_mode!=MODE:die("RUNTIME_MODE_INVALID")
    if a.credential_ref!="NONE":die("CREDENTIAL_REF_INVALID")
    if not invocation.run_id or not str(invocation.run_id).isdigit():die("RUN_ID_INVALID")
    if invocation.run_attempt!=1:die("WORKFLOW_RERUN_FORBIDDEN")
    if a.exact_sha!=current_sha or len(current_sha)!=40:die("EXACT_HEAD_MISMATCH")
    if a.principal_ref!=PRINCIPAL:die("PRINCIPAL_MISMATCH")
    if a.evidence_destination!="LOCAL_EPHEMERAL_ONLY":die("EVIDENCE_DESTINATION_INVALID")
    if tuple(a.repositories)!=tuple(enrolled) or not enrolled:die("REPOSITORY_BINDING_MISMATCH")
    if tuple(a.operations)!=ALLOWED_OPS:die("OPERATION_BINDING_MISMATCH")
    issued=_utc(a.issued_at);expires=_utc(a.expires_at)
    if now.tzinfo is None or now.utcoffset() is None:die("CLOCK_INVALID")
    n=now.astimezone(timezone.utc)
    if not issued<=n<expires:die("AUTHORIZATION_EXPIRED")
    if (expires-issued).total_seconds()>1800:die("AUTHORIZATION_WINDOW_TOO_LARGE")
    receipt_ref=f"{a.authorization_ref}--gha-{invocation.run_id}"
    return ExecutableReceipt(receipt_ref,a.authorization_ref,a.runtime_mode,a.credential_ref,str(invocation.run_id),invocation.run_attempt,a.exact_sha,a.repositories,a.operations,a.principal_ref,a.evidence_destination)

class LocalAtomicClaim:
    """Intra-run concurrency/replay guard; cross-run identity is the GitHub run_id."""
    def __init__(self,root:Path):self.root=root
    def _path(self,receipt_ref:str)->Path:
        safe=receipt_ref.replace("-","").replace("_","")
        if not safe.isalnum():die("RECEIPT_REF_INVALID")
        return self.root/(receipt_ref+".claim")
    def claim(self,r:ExecutableReceipt):
        self.root.mkdir(parents=True,exist_ok=True)
        p=self._path(r.receipt_ref)
        payload=json.dumps({"receiptRef":r.receipt_ref,"authorizationRef":r.authorization_ref,"runId":r.run_id,"runAttempt":r.run_attempt,"exactSha":r.exact_sha,"state":"CLAIMED"},sort_keys=True)
        try:fd=os.open(str(p),os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
        except FileExistsError:die("RECEIPT_ALREADY_CLAIMED")
        with os.fdopen(fd,"w",encoding="utf-8") as h:
            h.write(payload+"\n");h.flush();os.fsync(h.fileno())
        return p
    def finish(self,r:ExecutableReceipt,state:str):
        if state not in {"CONSUMED","FAILED"}:die("TERMINAL_STATE_INVALID")
        p=self._path(r.receipt_ref)
        if not p.exists():die("CLAIM_MISSING")
        current=json.loads(p.read_text(encoding="utf-8"))
        if current.get("state")!="CLAIMED" or current.get("runId")!=r.run_id or current.get("exactSha")!=r.exact_sha:die("CLAIM_BINDING_MISMATCH")
        tmp=p.with_suffix(".tmp")
        tmp.write_text(json.dumps({**current,"state":state},sort_keys=True)+"\n",encoding="utf-8")
        os.replace(tmp,p)
