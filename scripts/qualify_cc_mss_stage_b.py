#!/usr/bin/env python3
import json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; D=ROOT/'control-center/fixtures/cc-mss-stage-b/cases'; M=ROOT/'control-center/fixtures/cc-mss-stage-b/qualification.json'; V=ROOT/'scripts/validate_cc_mss_stage_b.py'
def main():
 q=json.loads(M.read_text()); cases=q['cases']; fail=[]
 for c in cases:
  p=D/(c['id']+'.json')
  if not p.exists(): print(c['id']+': FAIL missing fixture');fail.append(c['id']);continue
  r=subprocess.run([sys.executable,str(V),'--fixture',str(p)],capture_output=True,text=True)
  ok=r.returncode==0
  print(f"{c['id']}: {'PASS' if ok else 'FAIL'} {r.stdout.strip() or r.stderr.strip()}")
  if not ok: fail.append(c['id'])
 print(f'SUMMARY total={len(cases)} passed={len(cases)-len(fail)} failed={len(fail)}')
 if fail:return 1
 print('QUALIFICATION: PASS — real fixtures executed through validator')
 return 0
if __name__=='__main__':raise SystemExit(main())
