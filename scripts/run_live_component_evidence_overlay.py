#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

import importlib.util
import sys

ROOT=Path(__file__).resolve().parents[1]

def load_module(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    module=importlib.util.module_from_spec(spec)
    sys.modules[spec.name]=module
    spec.loader.exec_module(module)
    return module

t=load_module("public_anonymous_transport_component_evidence","scripts/public_anonymous_transport.py")

def load(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

def now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00","Z")

def validate(schema_path,data,label):
    schema=load(schema_path)
    errors=sorted(
        Draft202012Validator(schema,format_checker=FormatChecker()).iter_errors(data),
        key=lambda e:list(e.path)
    )
    if errors:
        raise RuntimeError(f"{label}_SCHEMA_INVALID: {errors[0].message}")
    return True

def _workflow_id(doc,name):
    rows=doc.get("workflows")
    if not isinstance(rows,list) or len(rows)>=100:
        raise RuntimeError("WORKFLOW_LIST_INCOMPLETE")
    matches=[x for x in rows if x.get("name")==name]
    if len(matches)!=1:
        raise RuntimeError("ENROLLED_WORKFLOW_IDENTITY_INVALID")
    value=matches[0].get("id")
    if not isinstance(value,int) or value<1:
        raise RuntimeError("WORKFLOW_ID_INVALID")
    return value

def _integrated(compare_doc,exact_head):
    merge_base=(compare_doc.get("merge_base_commit") or {}).get("sha")
    return merge_base==exact_head

def _artifact(doc,prefix,exact_head):
    rows=doc.get("artifacts")
    if not isinstance(rows,list) or len(rows)>=100:
        raise RuntimeError("ARTIFACT_LIST_INCOMPLETE")
    expected=prefix+exact_head
    matches=[
        x for x in rows
        if x.get("name")==expected
        and x.get("expired") is False
        and isinstance(x.get("digest"),str)
        and x["digest"].startswith("sha256:")
    ]
    if len(matches)>1:
        raise RuntimeError("CONTRADICTORY_ARTIFACT_IDENTITY")
    return matches[0] if matches else None

def _discover_group(repository,default_branch,workflow_name,artifact_prefix,budget,resources):
    repo_doc=t.anonymous_get(t.build_url(repository,"repo.read"),budget,resources)
    if repo_doc.get("private") is not False:
        raise RuntimeError("REPOSITORY_NOT_PUBLIC")
    if repo_doc.get("full_name")!=repository:
        raise RuntimeError("REPOSITORY_IDENTITY_MISMATCH")
    if repo_doc.get("default_branch")!=default_branch:
        raise RuntimeError("DEFAULT_BRANCH_MISMATCH")

    ref_doc=t.anonymous_get(t.build_url(repository,"ref.read",ref=default_branch),budget,resources)
    main_head=(ref_doc.get("object") or {}).get("sha")
    if not isinstance(main_head,str) or len(main_head)!=40:
        raise RuntimeError("DEFAULT_BRANCH_HEAD_UNAVAILABLE")

    workflows=t.anonymous_get(t.build_url(repository,"workflow.list"),budget,resources,max_bytes=1200000)
    workflow_id=_workflow_id(workflows,workflow_name)
    runs=t.anonymous_get(
        t.build_url(repository,"workflow.runs.read",workflow_id=workflow_id),
        budget,resources,max_bytes=2000000
    )
    rows=runs.get("workflow_runs")
    if not isinstance(rows,list) or len(rows)>=50:
        raise RuntimeError("WORKFLOW_RUN_LIST_INCOMPLETE")

    for run in rows:
        if run.get("event")!="pull_request" or run.get("conclusion")!="success":
            continue
        exact_head=run.get("head_sha")
        run_id=run.get("id")
        if not isinstance(exact_head,str) or len(exact_head)!=40 or not isinstance(run_id,int):
            continue
        compare=t.anonymous_get(
            t.build_url(repository,"compare.read",base_sha=exact_head,head_sha=main_head),
            budget,resources,max_bytes=1000000
        )
        if not _integrated(compare,exact_head):
            continue
        artifacts=t.anonymous_get(
            t.build_url(repository,"workflow.artifacts.read",run_id=run_id),
            budget,resources,max_bytes=1200000
        )
        artifact=_artifact(artifacts,artifact_prefix,exact_head)
        if artifact is None:
            continue
        return {
            "repository":repository,
            "defaultBranch":default_branch,
            "observedMainHead":main_head,
            "workflowName":workflow_name,
            "exactHead":exact_head,
            "runId":run_id,
            "artifactId":artifact["id"],
            "artifactName":artifact["name"],
            "artifactDigest":artifact["digest"],
            "artifactExpiresAt":artifact.get("expires_at"),
            "integrationStatus":"INTEGRATED_IN_DEFAULT_BRANCH",
            "sourceRefs":[
                f"github-public-api:{repository}@{main_head}",
                f"github-public-api:{repository}:workflow/{workflow_id}/run/{run_id}@{exact_head}",
                f"github-public-api:{repository}:artifact/{artifact['id']}#{artifact['digest']}"
            ]
        }
    return None

def collect_live_component_evidence():
    enrollment=load("config/live-component-evidence-sources.json")
    validate("schemas/live-component-evidence-sources.schema.json",enrollment,"LIVE_COMPONENT_EVIDENCE_SOURCES")
    groups=defaultdict(list)
    for source in enrollment["sources"]:
        key=(source["repository"],source["defaultBranch"],source["workflowName"],source["artifactPrefix"])
        groups[key].append(source)

    budget=t.Budget(remaining=max(64,len(groups)*32),reserve=2)
    resources=t.ResourceBudget(remaining_bytes=20_000_000)
    observed_at=now()
    evidence=[]
    source_refs=[]
    missing=0

    for key,sources in groups.items():
        discovered=_discover_group(*key,budget,resources)
        if discovered is None:
            missing+=len(sources)
            continue
        for source in sources:
            row={
                "sourceId":source["id"],
                "componentId":source["componentId"],
                "evidenceType":source["evidenceType"],
                "status":"PRESENT",
                **discovered
            }
            evidence.append(row)
            source_refs.extend(x for x in row["sourceRefs"] if x not in source_refs)

    if not evidence:
        status="UNAVAILABLE"
    elif missing:
        status="PARTIAL"
    else:
        status="COMPLETE"

    overlay={
        "schemaVersion":"trama.live-component-evidence-overlay/v1",
        "observedAt":observed_at,
        "status":status,
        "evidence":evidence,
        "sourceRefs":source_refs
    }
    validate("schemas/live-component-evidence-overlay.schema.json",overlay,"LIVE_COMPONENT_EVIDENCE_OVERLAY")
    return overlay

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--output")
    ap.add_argument("--pretty",action="store_true")
    args=ap.parse_args()
    overlay=collect_live_component_evidence()
    body=json.dumps(overlay,ensure_ascii=False,indent=2 if args.pretty else None,sort_keys=not args.pretty)
    if args.output:
        out=Path(args.output)
        out.parent.mkdir(parents=True,exist_ok=True)
        out.write_text(body+"\n",encoding="utf-8")
        print(out)
    else:
        print(body)

if __name__=="__main__":
    main()
