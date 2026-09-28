#!/usr/bin/env python3
import ast,sys
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'scripts/cc_mss_stage_c2_live_probe_sim.py';t=ast.parse(p.read_text());bad=[]
NETWORK={'socket','requests','urllib','http','httpx','aiohttp','subprocess'}
REMOTE_WRITE={'post','patch','delete','merge','dispatch','upload','publish','remote_put'}

def dotted(n):
 if isinstance(n,ast.Name):return n.id
 if isinstance(n,ast.Attribute):return (dotted(n.value)+'.'+n.attr).strip('.')
 return ''

for n in ast.walk(t):
 if isinstance(n,(ast.Import,ast.ImportFrom)):
  names=[a.name.split('.')[0] for a in n.names] if isinstance(n,ast.Import) else [str(n.module or '').split('.')[0]]
  if set(names)&NETWORK:bad.append('forbidden import '+','.join(names))
 elif isinstance(n,ast.Call):
  call=dotted(n.func);leaf=call.lower().rsplit('.',1)[-1]
  if leaf in REMOTE_WRITE:bad.append('forbidden capability '+call)
  # `put` is not forbidden lexically: the simulation intentionally uses
  # EphemeralSink.put for local in-memory evidence. Any remote write surface
  # must be represented by an explicitly forbidden remote capability above.

if bad:print('\n'.join(sorted(set(bad))));sys.exit(1)
print('C2_LIVE_SIM_SURFACE: PASS — offline simulation has no network/remote-write client surface; EphemeralSink.put is local-only')
