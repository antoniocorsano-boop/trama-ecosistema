#!/usr/bin/env python3
from __future__ import annotations
import argparse,json
from jsonschema import Draft202012Validator,FormatChecker
from datetime import datetime,timezone
from pathlib import Path
import importlib.util,sys

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("transport",ROOT/"scripts/public_anonymous_transport.py")
t=importlib.util.module_from_spec(spec);sys.modules[spec.name]=t;spec.loader.exec_module(t)

def now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00","Z")

def load(path): return json.loads((ROOT/path).read_text(encoding="utf-8"))

def canonical_pr_snapshot(prs):
    rows=[]
    for pr in prs:
        pr_sha=pr.get("head",{}).get("sha")
        number=pr.get("number")
        state=pr.get("state")
        if not isinstance(number,int) or not pr_sha or len(pr_sha)!=40 or state!="open":
            raise RuntimeError("PR_IDENTITY_INVALID")
        rows.append((number,pr_sha,bool(pr.get("draft",False))))
    return tuple(sorted(rows))

def collect(output="control-center/data/repository-observation.live.json"):
    enrollment=load("config/repository-enrollment.json")
    repos=[x for x in enrollment["repositories"] if x["state"]=="ENROLLED"]
    budget=t.Budget(remaining=len(repos)*6,reserve=2)
    resources=t.ResourceBudget(remaining_bytes=8_000_000)
    observed_at=now()
    repository_rows=[]
    pull_request_rows=[]
    source_refs=[]
    for item in repos:
        repo=item["repository"]; ref=item["defaultBranch"]
        repo_doc=t.anonymous_get(t.build_url(repo,"repo.read"),budget,resources)
        if repo_doc.get("private") is not False: raise RuntimeError("REPOSITORY_NOT_PUBLIC")
        if repo_doc.get("full_name")!=repo: raise RuntimeError("REPOSITORY_IDENTITY_MISMATCH")
        if repo_doc.get("default_branch")!=ref: raise RuntimeError("DEFAULT_BRANCH_MISMATCH")
        open_ref=t.anonymous_get(t.build_url(repo,"ref.read",ref=ref),budget,resources)
        open_sha=open_ref.get("object",{}).get("sha")
        if not open_sha or len(open_sha)!=40: raise RuntimeError("HEAD_UNAVAILABLE")
        commit=t.anonymous_get(t.build_url(repo,"commit.read",sha=open_sha),budget,resources)
        if commit.get("sha")!=open_sha: raise RuntimeError("COMMIT_BINDING_MISMATCH")
        prs=t.anonymous_get(t.build_url(repo,"pr.read"),budget,resources,max_bytes=1500000)
        if not isinstance(prs,list): raise RuntimeError("PR_RESPONSE_INVALID")
        if len(prs)>=100: raise RuntimeError("INCOMPLETE_PAGINATION")
        first_pr_snapshot=canonical_pr_snapshot(prs)
        for number,pr_sha,draft in first_pr_snapshot:
            pull_request_rows.append({
              "repository":repo,
              "number":number,
              "state":"OPEN",
              "draft":draft,
              "merged":False,
              "observedHead":pr_sha,
              "observedAt":observed_at,
              "sourceRefs":[f"github-public-api:{repo}:pull/{number}@{pr_sha}"]
            })
        close_ref=t.anonymous_get(t.build_url(repo,"ref.read",ref=ref),budget,resources,max_bytes=256000,allow_reserve=True)
        close_sha=close_ref.get("object",{}).get("sha")
        if close_sha!=open_sha: raise RuntimeError("ANCHOR_CHANGED")
        prs_close=t.anonymous_get(t.build_url(repo,"pr.read"),budget,resources,max_bytes=1500000,allow_reserve=True)
        if not isinstance(prs_close,list): raise RuntimeError("PR_RESPONSE_INVALID")
        if len(prs_close)>=100: raise RuntimeError("INCOMPLETE_PAGINATION")
        if canonical_pr_snapshot(prs_close)!=first_pr_snapshot: raise RuntimeError("PR_ANCHOR_CHANGED")
        repository_rows.append({
          "repository":repo,
          "enrollmentRef":item["id"],
          "availabilityStatus":"AVAILABLE",
          "freshnessStatus":"FRESH",
          "completenessStatus":"COMPLETE",
          "observedHead":open_sha,
          "sourceRefs":[f"github-public-api:{repo}@{open_sha}"]
        })
        source_refs.append(f"github-public-api:{repo}")
    result={
      "schemaVersion":"trama.repository-observation/v1",
      "collectionId":"live-one-shot-public-anonymous-"+observed_at.replace(":","").replace("-",""),
      "observedAt":observed_at,
      "status":"COMPLETE",
      "repositories":repository_rows,
      "pullRequests":pull_request_rows,
      "sourceRefs":source_refs
    }
    schema=load("schemas/repository-observation.schema.json")
    errors=sorted(Draft202012Validator(schema,format_checker=FormatChecker()).iter_errors(result),key=lambda e:list(e.path))
    if errors:
        raise RuntimeError("REPOSITORY_OBSERVATION_SCHEMA_INVALID: "+errors[0].message)
    if budget.remaining!=0:
        raise RuntimeError("REQUEST_BUDGET_NOT_FULLY_ACCOUNTED")
    out=ROOT/output;out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    return out,result

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--output",default="control-center/data/repository-observation.live.json")
    args=ap.parse_args()
    out,_=collect(args.output)
    print(out)

if __name__=="__main__":
    main()
