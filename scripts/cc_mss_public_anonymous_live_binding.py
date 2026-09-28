"""PUBLIC-ANONYMOUS-LIVE-BINDING-01 — offline-qualified single-use binding.

No network client is present here. This module validates and atomically claims
an explicit human authorization envelope before a future anonymous collector
may become eligible.
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
class Authorization:
    authorization_ref:str
    run_id:str
    exact_sha:str
    repositories:tuple[str,...]
    operations:tuple[str,...]
    principal_ref:str
    evidence_destination:str
    issued_at:str
    expires_at:str

def _utc(value:str)->datetime:
    try:
        d=datetime.fromisoformat(value.replace("Z","+00:00"))
    except Exception: die("TIME_INVALID")
    if d.tzinfo is None or d.utcoffset() is None: die("TIME_INVALID")
    return d.astimezone(timezone.utc)

def validate(a:Authorization,current_sha:str,enrolled:tuple[str,...],now:datetime)->Authorization:
    if not a.authorization_ref or not a.run_id: die("IDENTITY_MISSING")
    if a.exact_sha!=current_sha or len(current_sha)!=40: die("EXACT_HEAD_MISMATCH")
    if a.principal_ref!=PRINCIPAL: die("PRINCIPAL_MISMATCH")
    if a.evidence_destination!="LOCAL_EPHEMERAL_ONLY": die("EVIDENCE_DESTINATION_INVALID")
    if tuple(a.repositories)!=tuple(enrolled) or not enrolled: die("REPOSITORY_BINDING_MISMATCH")
    if tuple(a.operations)!=ALLOWED_OPS: die("OPERATION_BINDING_MISMATCH")
    issued=_utc(a.issued_at);expires=_utc(a.expires_at)
    if now.tzinfo is None or now.utcoffset() is None: die("CLOCK_INVALID")
    n=now.astimezone(timezone.utc)
    if not issued<=n<expires: die("AUTHORIZATION_EXPIRED")
    if (expires-issued).total_seconds()>1800: die("AUTHORIZATION_WINDOW_TOO_LARGE")
    return a

class LocalAtomicClaim:
    """Ephemeral job-local anti-replay marker. O_EXCL makes claim atomic."""
    def __init__(self,root:Path): self.root=root
    def _path(self,ref:str)->Path:
        if not ref.replace("-","").replace("_","").isalnum(): die("AUTHORIZATION_REF_INVALID")
        return self.root/(ref+".claim")
    def claim(self,a:Authorization):
        self.root.mkdir(parents=True,exist_ok=True)
        p=self._path(a.authorization_ref)
        payload=json.dumps({"authorizationRef":a.authorization_ref,"runId":a.run_id,"exactSha":a.exact_sha,"state":"CLAIMED"},sort_keys=True)
        try:
            fd=os.open(str(p),os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
        except FileExistsError: die("AUTHORIZATION_ALREADY_CLAIMED")
        with os.fdopen(fd,"w",encoding="utf-8") as f:
            f.write(payload+"\n");f.flush();os.fsync(f.fileno())
        return p
    def finish(self,a:Authorization,state:str):
        if state not in {"CONSUMED","FAILED"}: die("TERMINAL_STATE_INVALID")
        p=self._path(a.authorization_ref)
        if not p.exists(): die("CLAIM_MISSING")
        current=json.loads(p.read_text(encoding="utf-8"))
        if current.get("state")!="CLAIMED" or current.get("runId")!=a.run_id or current.get("exactSha")!=a.exact_sha: die("CLAIM_BINDING_MISMATCH")
        tmp=p.with_suffix(".tmp")
        tmp.write_text(json.dumps({**current,"state":state},sort_keys=True)+"\n",encoding="utf-8")
        os.replace(tmp,p)

def load_authorization(path:Path)->Authorization:
    d=json.loads(path.read_text(encoding="utf-8"))
    if set(d)!={"authorizationRef","runId","exactSha","repositories","operations","principalRef","evidenceDestination","issuedAt","expiresAt"}: die("AUTHORIZATION_SHAPE_INVALID")
    return Authorization(d["authorizationRef"],d["runId"],d["exactSha"],tuple(d["repositories"]),tuple(d["operations"]),d["principalRef"],d["evidenceDestination"],d["issuedAt"],d["expiresAt"])
