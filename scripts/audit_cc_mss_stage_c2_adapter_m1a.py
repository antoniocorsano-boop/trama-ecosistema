#!/usr/bin/env python3
"""Closed-world capability audit for CC-MSS-01 C2 Adapter M1-A."""
import ast,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
RUNTIME=(Path('scripts/cc_mss_stage_c2_adapter_m1a.py'),)
FORBIDDEN_IMPORTS={'socket','requests','urllib','urllib3','aiohttp','subprocess','os','importlib'}
FORBIDDEN_CALLS={'post','put','patch','delete','merge','dispatch','upload','publish','system','popen','getenv','__import__','eval','exec'}
FORBIDDEN_TEXT={'os.environ','trust_env=true','follow_redirects=true','verify=false','http2=true','proxy=','mounts=','cookies=','cookiejar','permissionSource('.lower()}
bad=[]
for rel in RUNTIME:
 p=ROOT/rel
 if not p.is_file(): bad.append(f'{rel}: runtime target missing'); continue
 text=p.read_text(); tree=ast.parse(text)
 for n in ast.walk(tree):
  if isinstance(n,(ast.Import,ast.ImportFrom)):
   names=[a.name.split('.')[0] for a in n.names] if isinstance(n,ast.Import) else [str(n.module or '').split('.')[0]]
   for name in names:
    if name in FORBIDDEN_IMPORTS: bad.append(f'{rel}: forbidden import {name}')
  if isinstance(n,ast.Call):
   leaf=(n.func.attr if isinstance(n.func,ast.Attribute) else n.func.id if isinstance(n.func,ast.Name) else '').lower()
   if leaf in FORBIDDEN_CALLS: bad.append(f'{rel}: forbidden call {leaf}')
  if isinstance(n,ast.ClassDef):
   bases={(b.id if isinstance(b,ast.Name) else b.attr if isinstance(b,ast.Attribute) else '') for b in n.bases}
   if 'PermissionSource' in bases: bad.append(f'{rel}: concrete PermissionSource forbidden')
 low=text.lower()
 for needle in FORBIDDEN_TEXT:
  if needle in low: bad.append(f'{rel}: forbidden surface {needle}')
 # Required fail-closed HTTPX invariants must remain literal/auditable.
 required=('trust_env=False','follow_redirects=False','http2=False','verify=True','stream=True')
 for needle in required:
  if needle not in text: bad.append(f'{rel}: required invariant missing: {needle}')
if bad:
 print('\n'.join(sorted(set(bad))));sys.exit(1)
print('C2_ADAPTER_M1A_SURFACE: PASS — declared runtime surface only; HTTPX capability constrained; live remains interlocked')
