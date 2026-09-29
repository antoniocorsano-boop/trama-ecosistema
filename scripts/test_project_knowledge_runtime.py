#!/usr/bin/env python3
import importlib.util
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def load_module(name,rel):
    spec=importlib.util.spec_from_file_location(name,ROOT/rel)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

snapshot_mod=load_module('project_context','scripts/build_project_context_snapshot.py')
pack_mod=load_module('context_pack','scripts/build_trama_context_pack.py')

snapshot=snapshot_mod.build()
snapshot_mod.validate(snapshot)
assert snapshot['project']=='TRAMA'
assert snapshot['status'] in {'PARTIAL','CURRENT'}
if snapshot['status']=='CURRENT':
    assert any(r.get('observation',{}).get('completenessStatus')=='COMPLETE' for r in snapshot['repositories'])
assert any(e.get('eventId')=='TRAMA-EVT-PERCORSI-PR96-RECOVERY' for e in snapshot['knowledgeEvents'])
assert any(h.get('exactHead')=='dfb5b106708bee88016907c13ee0d104c093e7ca' for h in snapshot['activeExactHeads'])
assert snapshot['knowledgeSources']

atlas_pack=pack_mod.build('atlas-percorsi',snapshot)
assert atlas_pack['subject']=='atlas-percorsi'
assert any('PR #96' in e.get('statement','') for e in atlas_pack['evidence'])
assert atlas_pack['exactHeads']
assert atlas_pack['sourceRefs']

knowledge_pack=pack_mod.build('project-knowledge',snapshot)
assert any(x.get('type')=='REJECTION' for x in knowledge_pack['knownRejectedApproaches'])
assert any('primary operational memory' in x.get('statement','') for x in knowledge_pack['evidence'])
print('TRAMA_PROJECT_KNOWLEDGE_RUNTIME_PASS')
