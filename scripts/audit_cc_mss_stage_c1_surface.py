#!/usr/bin/env python3
import ast,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TARGETS=[ROOT/'scripts/validate_cc_mss_stage_c1.py',ROOT/'scripts/qualify_cc_mss_stage_c1.py']
FORBIDDEN_WORDS={'merge','dispatch','rerun','cancel','delete','create_file','update_file','delete_file','push','approve','dismiss','label','secret','environment','ruleset','protection'}
NETWORK_IMPORTS={'requests','urllib','http','httpx','aiohttp'}
errors=[]
for p in TARGETS:
 t=ast.parse(p.read_text(),filename=str(p))
 for n in ast.walk(t):
  if isinstance(n,(ast.Import,ast.ImportFrom)):
   names=[a.name.split('.')[0] for a in n.names] if isinstance(n,ast.Import) else [str(n.module or '').split('.')[0]]
   if any(x in NETWORK_IMPORTS for x in names):errors.append(f'{p.name}: network client import {names}')
  if isinstance(n,ast.Constant) and isinstance(n.value,str):
   s=n.value.lower()
   if any(w in s for w in FORBIDDEN_WORDS) and 'forbidden' not in s and 'digest' not in s: errors.append(f'{p.name}: suspicious mutation token {n.value}')
if errors:
 print('\n'.join(errors));sys.exit(1)
print('MUTATION_SURFACE: PASS — no write/network client surface detected')
