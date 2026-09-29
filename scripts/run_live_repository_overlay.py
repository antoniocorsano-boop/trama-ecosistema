#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
import tempfile
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT=Path(__file__).resolve().parents[1]

def load_module(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    module=importlib.util.module_from_spec(spec)
    sys.modules[spec.name]=module
    spec.loader.exec_module(module)
    return module

collector=load_module("repository_observation_collector","scripts/run_public_anonymous_repository_observation.py")

def load(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

def observation_to_live_overlay(observation):
    if observation.get("schemaVersion")!="trama.repository-observation/v1":
        raise RuntimeError("REPOSITORY_OBSERVATION_IDENTITY_INVALID")
    if observation.get("status") not in {"COMPLETE","PARTIAL","UNKNOWN"}:
        raise RuntimeError("REPOSITORY_OBSERVATION_STATUS_INVALID")
    if not observation.get("observedAt"):
        raise RuntimeError("REPOSITORY_OBSERVATION_OBSERVED_AT_MISSING")

    repositories=[]
    for row in observation.get("repositories",[]):
        repositories.append({
            "repository":row["repository"],
            "availabilityStatus":row["availabilityStatus"],
            "freshnessStatus":row["freshnessStatus"],
            "completenessStatus":row["completenessStatus"],
            "observedHead":row.get("observedHead"),
            "sourceRefs":list(row.get("sourceRefs",[]))
        })

    pull_requests=[]
    for row in observation.get("pullRequests",[]):
        pull_requests.append({
            "repository":row["repository"],
            "number":row["number"],
            "state":row["state"],
            "draft":bool(row["draft"]),
            "merged":bool(row["merged"]),
            "observedHead":row["observedHead"],
            "observedAt":row["observedAt"],
            "sourceRefs":list(row.get("sourceRefs",[]))
        })

    status_map={
        "COMPLETE":"COMPLETE",
        "PARTIAL":"PARTIAL",
        "UNKNOWN":"PARTIAL"
    }

    overlay={
        "schemaVersion":"trama.live-repository-overlay/v1",
        "observedAt":observation["observedAt"],
        "status":status_map[observation["status"]],
        "repositories":repositories,
        "pullRequests":pull_requests,
        "workflows":[],
        "semanticAnchors":[]
    }
    validate_overlay(overlay)
    return overlay

def validate_overlay(overlay):
    schema=load("schemas/live-repository-overlay.schema.json")
    errors=sorted(
        Draft202012Validator(schema,format_checker=FormatChecker()).iter_errors(overlay),
        key=lambda e:list(e.path)
    )
    if errors:
        raise RuntimeError("LIVE_REPOSITORY_OVERLAY_SCHEMA_INVALID: "+errors[0].message)
    return True

def collect_live_overlay():
    with tempfile.TemporaryDirectory(prefix="trama-live-overlay-") as temp_dir:
        temp_path=Path(temp_dir)/"repository-observation.json"
        _,observation=collector.collect(str(temp_path))
        overlay=observation_to_live_overlay(observation)
        if not temp_path.exists():
            raise RuntimeError("EPHEMERAL_OBSERVATION_NOT_MATERIALIZED")
    if temp_path.exists():
        raise RuntimeError("EPHEMERAL_OBSERVATION_NOT_CLEANED")
    return overlay

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--pretty",action="store_true")
    args=ap.parse_args()
    overlay=collect_live_overlay()
    if args.pretty:
        print(json.dumps(overlay,ensure_ascii=False,indent=2))
    else:
        print(json.dumps(overlay,ensure_ascii=False,sort_keys=True,separators=(",",":")))

if __name__=="__main__":
    main()
