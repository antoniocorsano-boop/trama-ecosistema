#!/usr/bin/env python3
import ast,sys
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'scripts/cc_mss_stage_c2_live_probe_sim.py';t=ast.parse(p.read_text());bad=[]
for n in ast.walk(t):
 if isinstance(n,(ast.Import,ast.ImportFrom)):
  names=[a.name.split('.')[0] for a in n.names] if isinstance(n,ast.Import) else [str(n.module or '').split('.')[0]]
  if set(names)&{'socket','requests','urllib','http','httpx','aiohttp','subprocess'}:bad.append('forbidden import '+','.join(names))
 if isinstance(n,ast.Attribute) and n.attr.lower() in {'post','put','patch','delete','merge','dispatch','upload','publish'}:bad.append('forbidden capability '+n.attr)
if bad:print('\n'.join(bad));sys.exit(1)
print('C2_LIVE_SIM_SURFACE: PASS — offline simulation has no network/write client surface')
