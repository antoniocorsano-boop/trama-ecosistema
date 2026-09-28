#!/usr/bin/env python3
import importlib.util, json
from datetime import datetime,timezone,timedelta
from pathlib import Path
import httpx

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("anon",ROOT/"scripts/cc_mss_public_anonymous_source.py")
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

class Clock:
 def __init__(self,t):self.t=t
 def now(self):return self.t

class Visibility:
 def __init__(self,visibility="public",branch="main"):self.visibility=visibility;self.branch=branch
 def attest(self,repository):
  p={"repository":repository,"visibility":self.visibility,"defaultBranch":self.branch,"sourceOperation":"fixture:repo-metadata","observedAt":"2026-09-28T20:00:00Z"}
  return {**p,"digest":m.digest(p)}

class Permit:
 def __init__(self,allow=True):self.allow=allow
 def authorize(self,request):return self.allow

enrollment_doc=json.loads((ROOT/"config/repository-enrollment.json").read_text())
enrollment=next(x for x in enrollment_doc["repositories"] if x["repository"]=="antoniocorsano-boop/Curriculum-Atlas")
now=datetime(2026,9,28,20,0,0,tzinfo=timezone.utc)
receipt=m.AnonymousReceipt(
 ref="receipt:anon:1",probe_id="probe:anon:1",repository=enrollment["repository"],
 exact_sha="a"*40,operations=("repo.read","ref.read","commit.read"),
 issued_at=now-timedelta(minutes=1),expires_at=now+timedelta(minutes=10),
 policy_digest="sha256:"+"b"*64,resource_digest="sha256:"+"c"*64
)

store=m.ReceiptStore();store.issue(receipt)
session=m.AnonymousOneShotSession(store,Visibility(),receipt.exact_sha,Clock(now))
ctx=session.prepare(receipt.ref,receipt.probe_id,enrollment,"main")
assert ctx["visibilityAttestation"]["visibility"]=="public"
assert store.state(receipt.ref)=="CLAIMED"
session.complete(ctx)
assert store.state(receipt.ref)=="CONSUMED"
assert ctx["evidenceState"]=="VALID"

# replay
try: session.prepare(receipt.ref,receipt.probe_id,enrollment,"main");raise AssertionError("replay accepted")
except m.AnonymousSourceError: pass

# private/unknown visibility fail closed
for vis in ("private","internal","unknown"):
 r=m.AnonymousReceipt(ref="receipt:"+vis,probe_id="p:"+vis,repository=enrollment["repository"],exact_sha="a"*40,operations=("repo.read",),issued_at=now-timedelta(minutes=1),expires_at=now+timedelta(minutes=10),policy_digest="p",resource_digest="r")
 s=m.ReceiptStore();s.issue(r)
 try:m.AnonymousOneShotSession(s,Visibility(vis),r.exact_sha,Clock(now)).prepare(r.ref,r.probe_id,enrollment,"main");raise AssertionError(vis+" accepted")
 except m.AnonymousSourceError:assert s.state(r.ref)=="FAILED"

# enrollment mismatch
bad=dict(enrollment);bad["state"]="SUSPENDED"
r=m.AnonymousReceipt(ref="receipt:suspended",probe_id="p:suspended",repository=enrollment["repository"],exact_sha="a"*40,operations=("repo.read",),issued_at=now-timedelta(minutes=1),expires_at=now+timedelta(minutes=10),policy_digest="p",resource_digest="r")
s=m.ReceiptStore();s.issue(r)
try:m.AnonymousOneShotSession(s,Visibility(),r.exact_sha,Clock(now)).prepare(r.ref,r.probe_id,bad,"main");raise AssertionError("suspended accepted")
except m.AnonymousSourceError:pass

# transport is credentialless / GET-only / caller headers denied
seen=[]
def handler(req):
 seen.append(req)
 return httpx.Response(200,json={"ok":True},request=req)
transport=m.AnonymousHTTPTransport(httpx.MockTransport(handler),Permit(True))
status,stream,_=transport.execute({"method":"GET","scheme":"https","host":"api.github.com","redirect":"DENY","operation":"repo.read","repository":enrollment["repository"]})
assert status==200
b=b"".join(stream);assert b
assert len(seen)==1 and seen[0].method=="GET"
headers={k.lower():v for k,v in seen[0].headers.items()}
for h in ("authorization","cookie","proxy-authorization","forwarded","x-forwarded-for"):
 assert h not in headers
transport.close()

for request in [
 {"method":"POST","scheme":"https","host":"api.github.com","redirect":"DENY","operation":"repo.read","repository":enrollment["repository"]},
 {"method":"GET","scheme":"http","host":"api.github.com","redirect":"DENY","operation":"repo.read","repository":enrollment["repository"]},
 {"method":"GET","scheme":"https","host":"evil.example","redirect":"DENY","operation":"repo.read","repository":enrollment["repository"]},
 {"method":"GET","scheme":"https","host":"api.github.com","redirect":"FOLLOW","operation":"repo.read","repository":enrollment["repository"]},
 {"method":"GET","scheme":"https","host":"api.github.com","redirect":"DENY","operation":"repo.read","repository":enrollment["repository"],"headers":{"Authorization":"x"}},
]:
 try:m.validate_request(request);raise AssertionError("unsafe request accepted")
 except m.AnonymousSourceError:pass

# disabled permit prevents transport use
calls=[]
def forbidden(req):
 calls.append(req);raise AssertionError("transport touched")
t=m.AnonymousHTTPTransport(httpx.MockTransport(forbidden))
try:t.execute({"method":"GET","scheme":"https","host":"api.github.com","redirect":"DENY","operation":"repo.read","repository":enrollment["repository"]});raise AssertionError("live unexpectedly authorized")
except m.AnonymousSourceError as e:assert str(e)=="LIVE_NOT_AUTHORIZED"
assert not calls
t.close()

print("CC_MSS_PUBLIC_ANONYMOUS_READ_ONLY_PASS")
