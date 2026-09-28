#!/usr/bin/env python3
import importlib.util,sys,tempfile,json
from pathlib import Path
from datetime import datetime,timezone,timedelta
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("b",ROOT/"scripts/cc_mss_public_anonymous_live_binding.py");m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m)
NOW=datetime(2026,9,28,22,0,tzinfo=timezone.utc);SHA="a"*40
REPOS=("antoniocorsano-boop/trama-ecosistema","antoniocorsano-boop/CurManLight_arena","antoniocorsano-boop/Curriculum-Atlas","antoniocorsano-boop/docente-os-2026-27")
def auth(**kw):
 d=dict(authorization_ref="auth-001",run_id="run-001",exact_sha=SHA,repositories=REPOS,operations=m.ALLOWED_OPS,principal_ref=m.PRINCIPAL,evidence_destination="LOCAL_EPHEMERAL_ONLY",issued_at=(NOW-timedelta(minutes=1)).isoformat(),expires_at=(NOW+timedelta(minutes=10)).isoformat());d.update(kw);return m.Authorization(**d)
a=m.validate(auth(),SHA,REPOS,NOW)
with tempfile.TemporaryDirectory() as td:
 s=m.LocalAtomicClaim(Path(td));p=s.claim(a);assert p.exists()
 try:s.claim(a);raise AssertionError("replay accepted")
 except m.BindingError:pass
 s.finish(a,"CONSUMED");assert json.loads(p.read_text())["state"]=="CONSUMED"
for bad,code in [
 (auth(exact_sha="b"*40),"EXACT_HEAD_MISMATCH"),
 (auth(principal_ref="something"),"PRINCIPAL_MISMATCH"),
 (auth(operations=("repo.read",)),"OPERATION_BINDING_MISMATCH"),
 (auth(repositories=REPOS[:-1]),"REPOSITORY_BINDING_MISMATCH"),
 (auth(evidence_destination="REMOTE"),"EVIDENCE_DESTINATION_INVALID"),
 (auth(expires_at=(NOW-timedelta(seconds=1)).isoformat()),"AUTHORIZATION_EXPIRED"),
 (auth(expires_at=(NOW+timedelta(hours=1)).isoformat()),"AUTHORIZATION_WINDOW_TOO_LARGE")
]:
 try:m.validate(bad,SHA,REPOS,NOW);raise AssertionError(code+" accepted")
 except m.BindingError as e:assert str(e)==code
print("TRAMA_PUBLIC_ANONYMOUS_LIVE_BINDING_OFFLINE_PASS")
