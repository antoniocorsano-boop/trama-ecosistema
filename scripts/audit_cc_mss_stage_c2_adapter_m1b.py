#!/usr/bin/env python3
"""Closed-world audit for M1-B offline candidate: no network/live capability."""
import ast,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TARGET=Path('scripts/cc_mss_stage_c2_adapter_m1b.py')
FORBIDDEN_IMPORTS={'socket','httpx','httpcore','requests','urllib','urllib3','aiohttp','subprocess','os','importlib','ssl'}
FORBIDDEN_CALLS={'open','post','put','patch','delete','send','request','connect','urlopen','system','popen','getenv','__import__','eval','exec'}
FORBIDDEN_TEXT=('api.github.com','https://','http://','os.environ','.env','github_pat_','ghp_','live_one_shot','permissionSource('.lower())
bad=[];p=ROOT/TARGET
if not p.is_file():bad.append('runtime target missing')
else:
 text=p.read_text();tree=ast.parse(text)
 for n in ast.walk(tree):
  if isinstance(n,(ast.Import,ast.ImportFrom)):
   names=[a.name.split('.')[0] for a in n.names] if isinstance(n,ast.Import) else [str(n.module or '').split('.')[0]]
   for name in names:
    if name in FORBIDDEN_IMPORTS:bad.append(f'forbidden import {name}')
  if isinstance(n,ast.Call):
   leaf=(n.func.attr if isinstance(n.func,ast.Attribute) else n.func.id if isinstance(n.func,ast.Name) else '').lower()
   if leaf in FORBIDDEN_CALLS:bad.append(f'forbidden call {leaf}')
 low=text.lower()
 for x in FORBIDDEN_TEXT:
  if x.lower() in low:bad.append(f'forbidden live surface {x}')
 required=('ISSUED','CLAIMED','CONSUMED','FAILED','INVALID/INCOMPLETE','REAL_CREDENTIAL_FORBIDDEN','PRINCIPAL_MISMATCH','BUDGET_EXHAUSTED')
 for x in required:
  if x not in text:bad.append(f'required fail-closed invariant missing {x}')
if bad:
 print('\n'.join(sorted(set(bad))));sys.exit(1)
print('C2_ADAPTER_M1B_OFFLINE_SURFACE: PASS — no network client/live credential source; one-shot state model only')
