#!/usr/bin/env python3
import json,sys
from pathlib import Path
from jsonschema import Draft202012Validator,FormatChecker

ROOT=Path(__file__).resolve().parents[1]

def validate(schema_path,data_path):
    schema=json.loads((ROOT/schema_path).read_text(encoding='utf-8'))
    data=json.loads((ROOT/data_path).read_text(encoding='utf-8'))
    errors=sorted(Draft202012Validator(schema,format_checker=FormatChecker()).iter_errors(data),key=lambda e:list(e.path))
    if errors:
        for e in errors: print(f'{data_path}: {list(e.path)}: {e.message}',file=sys.stderr)
        raise SystemExit(1)

validate(Path('schemas/project-context-snapshot.schema.json'),Path('control-center/data/project-context-snapshot.json'))
validate(Path('schemas/trama-context-pack.schema.json'),Path('control-center/data/context-packs/atlas-percorsi.json'))
validate(Path('schemas/trama-context-pack.schema.json'),Path('control-center/data/context-packs/project-knowledge.json'))
validate(Path('schemas/repository-observation.schema.json'),Path('control-center/fixtures/project-knowledge/repository-observation-complete.json'))
validate(Path('schemas/repository-observation.schema.json'),Path('control-center/fixtures/project-knowledge/repository-observation-partial.json'))
print('TRAMA_PROJECT_KNOWLEDGE_AND_REPOSITORY_OBSERVATION_SCHEMA_PASS')
