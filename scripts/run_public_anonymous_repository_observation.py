#!/usr/bin/env python3
from __future__ import annotations
import argparse,json
from datetime import datetime,timezone
from pathlib import Path
import importlib.util,sys

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("transport",ROOT/"scripts/public_anonymous_transport.py")
t=importlib.util.module_from_spec(spec);sys.modules[spec.name]=t;spec.loader.exec_module(t)

def now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00","Z")

def load(path): return json.loads((ROOT/path).read_text(encoding="utf-8"))

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--output",default="control-center/data/repository-observation.live.json")
    args=ap.parse_args()
    enrollment=load("config/repository-enrollment.json")
    repos=[x for x in enrollment["repositories"] if x["state"]=="ENROLLED"]
    budget=t.Budget(remaining=1+len(repos)*3+1,reserve=1)
    observed_at=now()
    repository_rows=[]
    source_refs=[]
    for item in repos:
        repo=item["repository"]; ref=item["defaultBranch"]
        repo_doc=t.anonymous_get(t.build_url(repo,"repo.read"),budget)
        if repo_doc.get("private") is True: raise RuntimeError("REPOSITORY_NOT_PUBLIC")
        open_ref=t.anonymous_get(t.build_url(repo,"ref.read",ref=ref),budget)
        open_sha=open_ref.get("object",{}).get("sha")
        if not open_sha or len(open_sha)!=40: raise RuntimeError("HEAD_UNAVAILABLE")
        commit=t.anonymous_get(t.build_url(repo,"commit.read",sha=open_sha),budget)
        if commit.get("sha")!=open_sha: raise RuntimeError("COMMIT_BINDING_MISMATCH")
        close_ref=t.anonymous_get(t.build_url(repo,"ref.read",ref=ref),budget, max_bytes=256000)
        close_sha=close_ref.get("object",{}).get("sha")
        if close_sha!=open_sha: raise RuntimeError("ANCHOR_CHANGED")
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
      "pullRequests":[],
      "sourceRefs":source_refs
    }
    out=ROOT/args.output;out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(out)

if __name__=="__main__":
    main()
