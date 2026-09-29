#!/usr/bin/env python3
from __future__ import annotations
import argparse,base64,hashlib,importlib.util,json,os,re,urllib.error,urllib.parse,urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
TARGET_REPOSITORY="antoniocorsano-boop/trama-ecosistema"
BASE_BRANCH="main"
API_HOST="api.github.com"
ALLOWED_PATHS=(
 "control-center/data/repository-observation.json",
 "control-center/data/project-context-snapshot.json",
 "status/project-knowledge-events.json",
)
SHA40=re.compile(r"^[0-9a-f]{40}$")

def load_module(name,path):
 spec=importlib.util.spec_from_file_location(name,ROOT/path)
 module=importlib.util.module_from_spec(spec)
 spec.loader.exec_module(module)
 return module

canon=load_module("promotion_canon","scripts/repository_observation_promotion_canonical.py")

class ActorError(RuntimeError):
 pass

def die(code):
 raise ActorError(code)

def json_bytes(value):
 return (json.dumps(value,ensure_ascii=False,indent=2)+"\n").encode("utf-8")

def raw_sha256(value):
 return hashlib.sha256(json_bytes(value)).hexdigest()

def validate_bundle(bundle,actor_exact_sha):
 if bundle.get("schemaVersion")!="trama.repository-observation-promotion-write-bundle/v1":
  die("BUNDLE_SCHEMA_VERSION")
 if bundle.get("targetRepository")!=TARGET_REPOSITORY or bundle.get("baseBranch")!=BASE_BRANCH:
  die("TARGET_DENIED")
 if not SHA40.fullmatch(bundle.get("baseExactSha","")):
  die("BASE_SHA_INVALID")
 if not SHA40.fullmatch(actor_exact_sha or ""):
  die("ACTOR_SHA_INVALID")
 proposal=bundle.get("proposal") or {}
 if proposal.get("state")!="READY_FOR_HUMAN_REVIEW" or proposal.get("validationVerdict")!="PASS" or proposal.get("supersessionVerdict")!="NEW_STATE":
  die("PROPOSAL_NOT_PROMOTABLE")
 observation=bundle.get("candidateObservation") or {}
 snapshot=bundle.get("candidateSnapshot") or {}
 observation_digest=canon.sha256_canonical(observation)
 snapshot_digest=canon.sha256_canonical(snapshot)
 if proposal.get("observationDigest")!=observation_digest or proposal.get("proposalId")!=canon.proposal_id(observation_digest):
  die("OBSERVATION_BINDING_MISMATCH")
 changes={item.get("path"):item for item in proposal.get("proposedChanges",[])}
 if set(changes)!=set(ALLOWED_PATHS):
  die("PATH_ALLOWLIST_MISMATCH")
 if changes[ALLOWED_PATHS[0]].get("sha256")!=observation_digest:
  die("OBSERVATION_CHANGE_DIGEST_MISMATCH")
 if changes[ALLOWED_PATHS[1]].get("sha256")!=snapshot_digest:
  die("SNAPSHOT_CHANGE_DIGEST_MISMATCH")
 if changes[ALLOWED_PATHS[2]].get("sha256") is not None:
  die("EVENTS_DIGEST_MUST_BE_ACTOR_DERIVED")
 if not bundle.get("recordedAt") or not bundle.get("recordedBy") or not bundle.get("sourceRefs"):
  die("PROMOTION_METADATA_MISSING")
 return True

def promotion_event(bundle,actor_exact_sha):
 proposal=bundle["proposal"]
 return {
  "schemaVersion":"trama.repository-observation-promotion-event/v1",
  "eventId":canon.promotion_event_id(proposal["observationDigest"],proposal["promotionPolicyDigest"]),
  "proposalId":proposal["proposalId"],
  "observationDigest":proposal["observationDigest"],
  "previousObservationDigest":proposal.get("previousObservationDigest"),
  "recordedAt":bundle["recordedAt"],
  "recordedBy":bundle["recordedBy"],
  "sourceRunId":proposal["sourceRunId"],
  "sourceReceiptRef":proposal["sourceReceiptRef"],
  "collectorExactSha":proposal["collectorExactSha"],
  "promotionActorExactSha":actor_exact_sha,
  "promotionPolicyDigest":proposal["promotionPolicyDigest"],
  "repositoryEnrollmentDigest":proposal["repositoryEnrollmentDigest"],
  "result":"PROMOTED",
  "sourceRefs":list(dict.fromkeys(proposal.get("sourceRefs",[])+bundle.get("sourceRefs",[]))),
  "supersedes":[]
 }

def knowledge_event_from_promotion(event,bundle):
 short=event["eventId"].split("-",1)[1][:16]
 return {
  "eventId":"TRAMA-EVT-REPOSITORY-OBSERVATION-PROMOTION-"+short,
  "type":"PROMOTION",
  "subject":"project-knowledge-repository-state",
  "statement":"A governed RepositoryObservation was promoted into the current Project Knowledge repository-state projection.",
  "status":"CURRENT",
  "rationale":"Promotion is bound to proposal "+event["proposalId"]+", source run "+event["sourceRunId"]+", exact collector and actor revisions, policy digest and enrollment digest.",
  "sourceRefs":[{"repository":TARGET_REPOSITORY,"ref":ref} for ref in event["sourceRefs"]],
  "validFrom":bundle["recordedAt"],
  "supersedes":[],
  "invalidatedBy":[],
  "promotionEvent":event
 }

def update_events(current,bundle,actor_exact_sha):
 output=json.loads(json.dumps(current))
 if output.get("schemaVersion")!="trama.project-knowledge-events/v1":
  die("KNOWLEDGE_EVENTS_SCHEMA")
 event=promotion_event(bundle,actor_exact_sha)
 wrapper=knowledge_event_from_promotion(event,bundle)
 existing=[item for item in output.get("events",[]) if item.get("eventId")==wrapper["eventId"]]
 if existing:
  if existing[0]!=wrapper:
   die("EVENT_ID_COLLISION")
  return output,event,False
 output.setdefault("events",[]).append(wrapper)
 output["updatedAt"]=bundle["recordedAt"]
 return output,event,True

def materialize(bundle,current_events,actor_exact_sha):
 validate_bundle(bundle,actor_exact_sha)
 events,event,_=update_events(current_events,bundle,actor_exact_sha)
 return {
  ALLOWED_PATHS[0]:bundle["candidateObservation"],
  ALLOWED_PATHS[1]:bundle["candidateSnapshot"],
  ALLOWED_PATHS[2]:events,
 },event

class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):
  die("REDIRECT_DENIED")

class GitHubClient:
 def __init__(self,token):
  if not token:
   die("TOKEN_MISSING")
  self.token=token
  self.opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect())
 def request(self,method,path,payload=None,ok=(200,201)):
  if method not in {"GET","POST","PUT"}:
   die("METHOD_DENIED")
  if not path.startswith("/repos/"+TARGET_REPOSITORY+"/"):
   die("API_PATH_DENIED")
  url="https://"+API_HOST+path
  data=None if payload is None else json.dumps(payload,separators=(",",":")).encode()
  request=urllib.request.Request(url,data=data,method=method,headers={
   "Accept":"application/vnd.github+json",
   "Authorization":"Bearer "+self.token,
   "X-GitHub-Api-Version":"2022-11-28",
   "User-Agent":"trama-promotion-write-actor/1"
  })
  try:
   response=self.opener.open(request,timeout=20)
  except urllib.error.HTTPError as error:
   body=error.read().decode("utf-8","replace")
   raise ActorError("GITHUB_HTTP_"+str(error.code)+":"+body[:300])
  if response.status not in ok:
   die("GITHUB_STATUS_UNEXPECTED")
  raw=response.read()
  return json.loads(raw) if raw else {}
 def ref(self,branch):
  return self.request("GET","/repos/"+TARGET_REPOSITORY+"/git/ref/heads/"+urllib.parse.quote(branch,safe=""))
 def get_file(self,path,ref):
  query=urllib.parse.urlencode({"ref":ref})
  try:
   return self.request("GET","/repos/"+TARGET_REPOSITORY+"/contents/"+urllib.parse.quote(path,safe="/")+"?"+query)
  except ActorError as error:
   if str(error).startswith("GITHUB_HTTP_404:"):
    return None
   raise
 def create_branch(self,name,sha):
  return self.request("POST","/repos/"+TARGET_REPOSITORY+"/git/refs",{"ref":"refs/heads/"+name,"sha":sha})
 def put_file(self,path,branch,message,content,existing_sha):
  payload={"message":message,"content":base64.b64encode(json_bytes(content)).decode(),"branch":branch}
  if existing_sha:
   payload["sha"]=existing_sha
  return self.request("PUT","/repos/"+TARGET_REPOSITORY+"/contents/"+urllib.parse.quote(path,safe="/"),payload)
 def compare(self,base,head):
  return self.request("GET","/repos/"+TARGET_REPOSITORY+"/compare/"+urllib.parse.quote(base,safe="")+"..."+urllib.parse.quote(head,safe=""))
 def list_prs(self,head):
  query=urllib.parse.urlencode({"state":"open","head":"antoniocorsano-boop:"+head,"base":BASE_BRANCH})
  return self.request("GET","/repos/"+TARGET_REPOSITORY+"/pulls?"+query)
 def create_pr(self,head,title,body):
  return self.request("POST","/repos/"+TARGET_REPOSITORY+"/pulls",{"title":title,"head":head,"base":BASE_BRANCH,"body":body,"draft":True})

def branch_name(proposal_id,base_exact_sha):
 return "project-knowledge/promotion/"+proposal_id[:20]+"-"+base_exact_sha[:12]

def execute(bundle,actor_exact_sha,token):
 validate_bundle(bundle,actor_exact_sha)
 client=GitHubClient(token)
 base=client.ref(BASE_BRANCH)["object"]["sha"]
 if base!=bundle["baseExactSha"]:
  die("BASE_HEAD_MISMATCH")
 events_file=client.get_file(ALLOWED_PATHS[2],bundle["baseExactSha"])
 if not events_file or events_file.get("encoding")!="base64":
  die("KNOWLEDGE_EVENTS_UNAVAILABLE")
 current_events=json.loads(base64.b64decode(events_file["content"]).decode())
 files,event=materialize(bundle,current_events,actor_exact_sha)
 name=branch_name(bundle["proposal"]["proposalId"],bundle["baseExactSha"])
 try:
  branch=client.ref(name)
  branch_exists=True
 except ActorError as error:
  if str(error).startswith("GITHUB_HTTP_404:"):
   branch_exists=False
   branch=None
  else:
   raise
 if not branch_exists:
  client.create_branch(name,base)
 elif branch["object"]["sha"]==base:
  pass
 else:
  comparison=client.compare(base,name)
  if (comparison.get("merge_base_commit") or {}).get("sha")!=base:
   die("BRANCH_BASE_MISMATCH")
  if comparison.get("status") not in {"ahead","identical"}:
   die("BRANCH_HISTORY_INVALID")
  changed={item.get("filename") for item in comparison.get("files",[])}
  if not changed.issubset(set(ALLOWED_PATHS)):
   die("BRANCH_CONTAINS_UNEXPECTED_PATHS")
 for path in ALLOWED_PATHS:
  existing=client.get_file(path,name)
  if existing and existing.get("encoding")=="base64":
   current=base64.b64decode(existing["content"])
   if current==json_bytes(files[path]):
    continue
   file_sha=existing.get("sha")
  else:
   file_sha=None
  client.put_file(path,name,"chore(project-knowledge): promote "+bundle["proposal"]["proposalId"],files[path],file_sha)
 final_base=client.ref(BASE_BRANCH)["object"]["sha"]
 if final_base!=bundle["baseExactSha"]:
  die("BASE_MOVED_DURING_WRITE")
 prs=client.list_prs(name)
 if len(prs)>1:
  die("MULTIPLE_PROMOTION_PRS")
 if prs:
  return {"result":"EXISTING_PR","branch":name,"pullRequest":prs[0]["number"],"eventId":event["eventId"]}
 title="Project Knowledge: promote "+bundle["proposal"]["proposalId"]
 body="Governed RepositoryObservation promotion. Proposal "+bundle["proposal"]["proposalId"]+". Observation digest "+bundle["proposal"]["observationDigest"]+". Source run "+bundle["proposal"]["sourceRunId"]+". Human review and merge remain required."
 pr=client.create_pr(name,title,body)
 return {"result":"PR_CREATED","branch":name,"pullRequest":pr["number"],"eventId":event["eventId"]}

def main():
 parser=argparse.ArgumentParser()
 parser.add_argument("--bundle",required=True)
 parser.add_argument("--actor-exact-sha",required=True)
 parser.add_argument("--current-events")
 parser.add_argument("--execute",action="store_true")
 args=parser.parse_args()
 bundle=json.loads(Path(args.bundle).read_text())
 if args.execute:
  result=execute(bundle,args.actor_exact_sha,os.environ.get("GITHUB_TOKEN",""))
 else:
  if not args.current_events:
   die("CURRENT_EVENTS_REQUIRED_FOR_DRY_RUN")
  current=json.loads(Path(args.current_events).read_text())
  files,event=materialize(bundle,current,args.actor_exact_sha)
  result={"result":"DRY_RUN_VALID","branch":branch_name(bundle["proposal"]["proposalId"],bundle["baseExactSha"]),"paths":list(files),"eventId":event["eventId"],"digests":{path:raw_sha256(value) for path,value in files.items()}}
 print(json.dumps(result,sort_keys=True))

if __name__=="__main__":
 main()
