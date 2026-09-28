#!/usr/bin/env python3
import ast,sys
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'scripts/cc_mss_stage_c2_adapter_m0.py';t=ast.parse(p.read_text());bad=[]
FORBIDDEN_IMPORT={'socket','requests','urllib','http','httpx','aiohttp','subprocess','os'}
FORBIDDEN_CALL={'post','put','patch','delete','merge','dispatch','upload','publish','remote_put','system','popen','getenv'}
FORBIDDEN_TEXT={'authorization','bearer ','github_token','gh_token','secret store','os.environ'}
for n in ast.walk(t):
 if isinstance(n,(ast.Import,ast.ImportFrom)):
  ns=[a.name.split('.')[0] for a in n.names] if isinstance(n,ast.Import) else [str(n.module or '').split('.')[0]]
  for x in ns:
   if x in FORBIDDEN_IMPORT:bad.append('forbidden import '+x)
 if isinstance(n,ast.Call):
  leaf=(n.func.attr if isinstance(n.func,ast.Attribute) else n.func.id if isinstance(n.func,ast.Name) else '').lower()
  if leaf in FORBIDDEN_CALL:bad.append('forbidden call '+leaf)
text=p.read_text().lower()
for x in FORBIDDEN_TEXT:
 if x in text:bad.append('forbidden credential/network surface '+x)
if bad:print('\n'.join(sorted(set(bad))));sys.exit(1)
print('C2_ADAPTER_M0_SURFACE: PASS — inert; no network/subprocess/credential-loader/remote-write surface')
