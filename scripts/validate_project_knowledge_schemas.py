#!/usr/bin/env python3
import json,sys
from pathlib import Path
from jsonschema import Draft202012Validator,FormatChecker

ROOT=Path(__file__).resolve().parents[1]

def validate(schema_path,data_path,expect_valid=True):
    schema=json.loads((ROOT/schema_path).read_text(encoding='utf-8'))
    data=json.loads((ROOT/data_path).read_text(encoding='utf-8'))
    errors=sorted(Draft202012Validator(schema,format_checker=FormatChecker()).iter_errors(data),key=lambda e:list(e.path))
    if expect_valid and errors:
        for e in errors: print(f'{data_path}: {list(e.path)}: {e.message}',file=sys.stderr)
        raise SystemExit(1)
    if not expect_valid and not errors:
        print(f'{data_path}: expected invalid but schema accepted fixture',file=sys.stderr)
        raise SystemExit(1)

validate(Path('schemas/project-context-snapshot.schema.json'),Path('control-center/data/project-context-snapshot.json'))
validate(Path('schemas/trama-context-pack.schema.json'),Path('control-center/data/context-packs/atlas-percorsi.json'))
validate(Path('schemas/trama-context-pack.schema.json'),Path('control-center/data/context-packs/project-knowledge.json'))
validate(Path('schemas/repository-observation.schema.json'),Path('control-center/fixtures/project-knowledge/repository-observation-complete.json'))
validate(Path('schemas/repository-observation.schema.json'),Path('control-center/fixtures/project-knowledge/repository-observation-partial.json'))
validate(Path('schemas/repository-observation-promotion-proposal.schema.json'),Path('control-center/fixtures/project-knowledge/repository-observation-promotion-proposal-valid.json'))
validate(Path('schemas/repository-observation-promotion-proposal.schema.json'),Path('control-center/fixtures/project-knowledge/repository-observation-promotion-proposal-invalid.json'),expect_valid=False)
validate(Path('schemas/repository-observation-promotion-event.schema.json'),Path('control-center/fixtures/project-knowledge/repository-observation-promotion-event-valid.json'))
validate(Path('schemas/repository-observation-promotion-event.schema.json'),Path('control-center/fixtures/project-knowledge/repository-observation-promotion-event-invalid.json'),expect_valid=False)
validate(Path('schemas/repository-observation-promotion-write-bundle.schema.json'),Path('control-center/fixtures/project-knowledge/repository-observation-promotion-write-bundle-valid.json'))
validate(Path('schemas/repository-observation-promotion-write-bundle.schema.json'),Path('control-center/fixtures/project-knowledge/repository-observation-promotion-write-bundle-invalid.json'),expect_valid=False)
validate(Path('schemas/source-registry.schema.json'),Path('docs/knowledge/source-registry.json'))
validate(Path('schemas/live-repository-overlay.schema.json'),Path('control-center/fixtures/project-knowledge/live-overlay-head-drift.json'))
validate(Path('schemas/live-repository-overlay.schema.json'),Path('control-center/fixtures/project-knowledge/live-overlay-semantic-drift.json'))
validate(Path('schemas/live-repository-overlay.schema.json'),Path('control-center/fixtures/project-knowledge/live-overlay-partial.json'))
validate(Path('schemas/effective-project-context.schema.json'),Path('control-center/fixtures/project-knowledge/effective-context-head-drift.json'))
validate(Path('schemas/effective-project-context.schema.json'),Path('control-center/fixtures/project-knowledge/effective-context-semantic-drift.json'))
validate(Path('schemas/effective-project-context.schema.json'),Path('control-center/fixtures/project-knowledge/effective-context-partial.json'))
print('TRAMA_PROJECT_KNOWLEDGE_REPOSITORY_OBSERVATION_PROMOTION_AND_DUAL_SPEED_SCHEMA_PASS')
