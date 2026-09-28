#!/usr/bin/env python3
import ast,sys
from pathlib import Path
R=Path(__file__).resolve().parents[1];targets=[R/'scripts/validate_cc_mss_stage_c2_pre_live.py',R/'scripts/qualify_cc_mss_stage_c2_pre_live.py',R/'scripts/cc_mss_stage_c2_safety.py']
NETWORK={'requests','urllib','http','httpx','aiohttp'};ESCAPE={'subprocess','os.system','popen'};WRITE={'merge','dispatch','rerun','cancel','delete','create_file','update_file','delete_file','push','approve','dismiss','upload','publish','remote_put'};bad=[]
def dotted(n):
 if isinstance(n,ast.Name):return n.id
 if isinstance(n,ast.Attribute):return (dotted(n.value)+'.'+n.attr).strip('.')
 return ''
for p in targets:
 t=ast.parse(p.read_text(),filename=str(p))
 for n in ast.walk(t):
  if isinstance(n,ast.Import):
   roots={a.name.split('.')[0] for a in n.names}
   if roots&NETWORK or roots&ESCAPE:bad.append(f'{p.name}: forbidden import {sorted(roots&(NETWORK|ESCAPE))}')
  elif isinstance(n,ast.ImportFrom):
   root=str(n.module or '').split('.')[0]
   if root in NETWORK|ESCAPE:bad.append(f'{p.name}: forbidden import {root}')
  elif isinstance(n,ast.Call):
   leaf=dotted(n.func).lower().rsplit('.',1)[-1]
   if leaf in WRITE and not (p.name=='cc_mss_stage_c2_safety.py' and leaf=='remote_put'):bad.append(f'{p.name}: forbidden call {dotted(n.func)}')
if bad:print('\n'.join(sorted(set(bad))));sys.exit(1)
print('C2_SURFACE: PASS — no network client/subprocess/write surface in collector pre-live code')
