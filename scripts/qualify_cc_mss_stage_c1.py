#!/usr/bin/env python3
import json,subprocess,sys
from pathlib import Path
R=Path(__file__).resolve().parents[1];D=R/'control-center/fixtures/cc-mss-stage-c1/cases';M=R/'control-center/fixtures/cc-mss-stage-c1/manifest.json';V=R/'scripts/validate_cc_mss_stage_c1.py'
def main():
 m=json.loads(M.read_text());fail=[]
 for c in m['cases']:
  p=D/(c+'.json')
  if not p.exists():print(c+': FAIL missing');fail.append(c);continue
  r=subprocess.run([sys.executable,str(V),str(p)],capture_output=True,text=True)
  print(r.stdout.strip() or r.stderr.strip())
  if r.returncode:fail.append(c)
 print(f"SUMMARY total={len(m['cases'])} passed={len(m['cases'])-len(fail)} failed={len(fail)} network=DISABLED")
 return 1 if fail else 0
if __name__=='__main__':raise SystemExit(main())
