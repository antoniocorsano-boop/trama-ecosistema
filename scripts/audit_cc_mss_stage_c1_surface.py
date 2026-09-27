#!/usr/bin/env python3
import ast,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TARGETS=[ROOT/'scripts/validate_cc_mss_stage_c1.py',ROOT/'scripts/qualify_cc_mss_stage_c1.py']
NETWORK_IMPORTS={'requests','urllib','http','httpx','aiohttp'}
# Audit executable call/import surface, not domain-state literals such as PR state MERGED.
FORBIDDEN_CALL_TOKENS={'merge','dispatch','rerun','cancel','delete','create_file','update_file','delete_file','push','approve','dismiss','set_label','add_label','secret','environment','ruleset','protection'}
errors=[]
def dotted(n):
 if isinstance(n,ast.Name):return n.id
 if isinstance(n,ast.Attribute):
  p=dotted(n.value);return f'{p}.{n.attr}' if p else n.attr
 return ''
for p in TARGETS:
 t=ast.parse(p.read_text(),filename=str(p))
 for n in ast.walk(t):
  if isinstance(n,ast.Import):
   names=[a.name.split('.')[0] for a in n.names]
   if any(x in NETWORK_IMPORTS for x in names):errors.append(f'{p.name}: network client import {names}')
  elif isinstance(n,ast.ImportFrom):
   root=str(n.module or '').split('.')[0]
   if root in NETWORK_IMPORTS:errors.append(f'{p.name}: network client import {n.module}')
  elif isinstance(n,ast.Call):
   target=dotted(n.func).lower();leaf=target.rsplit('.',1)[-1]
   if leaf in FORBIDDEN_CALL_TOKENS or any(leaf.startswith(x+'_') for x in FORBIDDEN_CALL_TOKENS):
    errors.append(f'{p.name}: forbidden mutation call {target}')
if errors:
 print('\n'.join(sorted(set(errors))));sys.exit(1)
print('MUTATION_SURFACE: PASS — executable call/import surface contains no write/network client operation')
