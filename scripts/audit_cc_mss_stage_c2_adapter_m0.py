#!/usr/bin/env python3
import ast,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
# Closed-world executable M0 surface. The audit and tests are deliberately
# outside this set: they contain detector vocabulary and are not runtime M0.
M0_RUNTIME_PATHS=(Path('scripts/cc_mss_stage_c2_adapter_m0.py'),)
TARGETS=[ROOT/p for p in M0_RUNTIME_PATHS]
bad=[]
FI={'socket','requests','urllib','http','httpx','aiohttp','subprocess','os','importlib'}
FC={'post','put','patch','delete','merge','dispatch','upload','publish','remote_put','system','popen','getenv','__import__','eval','exec'}
FT={'authorization','bearer ','github_token','gh_token','secret store','os.environ'}
for p in TARGETS:
 if not p.is_file():
  bad.append(f'{p.relative_to(ROOT)}: M0 target surface missing')
  continue
 text=p.read_text();t=ast.parse(text)
 for n in ast.walk(t):
  if isinstance(n,(ast.Import,ast.ImportFrom)):
   ns=[a.name.split('.')[0] for a in n.names] if isinstance(n,ast.Import) else [str(n.module or '').split('.')[0]]
   for x in ns:
    if x in FI:bad.append(f'{p.name}: forbidden import {x}')
  if isinstance(n,ast.Call):
   leaf=(n.func.attr if isinstance(n.func,ast.Attribute) else n.func.id if isinstance(n.func,ast.Name) else '').lower()
   if leaf in FC:bad.append(f'{p.name}: forbidden call {leaf}')
  if isinstance(n,ast.ClassDef):
   bases={(b.id if isinstance(b,ast.Name) else b.attr if isinstance(b,ast.Attribute) else '') for b in n.bases}
   if bases&{'Transport','PermissionSource'}:bad.append(f'{p.name}: concrete protocol implementation {n.name}')
 low=text.lower()
 for x in FT:
  if x in low:bad.append(f'{p.name}: forbidden credential/network surface {x}')
if bad:print('\n'.join(sorted(set(bad))));sys.exit(1)
print(f'C2_ADAPTER_M0_SURFACE: PASS — {len(TARGETS)} explicitly declared M0 runtime script(s) inert; no concrete protocol/network/subprocess/dynamic-import/credential-loader/remote-write surface')
