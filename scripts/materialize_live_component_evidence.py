#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path
import sys

from jsonschema import Draft202012Validator, FormatChecker

ROOT=Path(__file__).resolve().parents[1]

def load_module(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    module=importlib.util.module_from_spec(spec)
    sys.modules[spec.name]=module
    spec.loader.exec_module(module)
    return module

composer=load_module("effective_component_evidence_composer","scripts/compose_effective_component_evidence.py")

def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def validate(value):
    schema=load(ROOT/"schemas/effective-component-evidence.schema.json")
    errors=sorted(
        Draft202012Validator(schema,format_checker=FormatChecker()).iter_errors(value),
        key=lambda e:list(e.path)
    )
    if errors:
        raise RuntimeError("EFFECTIVE_COMPONENT_EVIDENCE_SCHEMA_INVALID: "+errors[0].message)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--registry",default=str(ROOT/"governance/ui-development/trama-component-evidence-registry-v1.json"))
    ap.add_argument("--overlay")
    ap.add_argument("--output",required=True)
    args=ap.parse_args()
    registry=load(args.registry)
    overlay=load(args.overlay) if args.overlay else None
    result=composer.compose_effective_component_evidence(registry,overlay)
    validate(result)
    out=Path(args.output)
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(out)

if __name__=="__main__":
    main()
