#!/usr/bin/env python3
import json,runpy,socket,sys
from pathlib import Path
R=Path(__file__).resolve().parents[1];M=R/'control-center/fixtures/cc-mss-stage-c2/manifest.json';D=M.parent/'cases';V=R/'scripts/validate_cc_mss_stage_c2_pre_live.py'
class NetworkForbidden(RuntimeError):pass
def deny(*a,**k):raise NetworkForbidden('C2_PRELIVE_NETWORK_FORBIDDEN')
def one(p):
 olds=(socket.socket,socket.create_connection,socket.getaddrinfo);socket.socket=deny;socket.create_connection=deny;socket.getaddrinfo=deny
 try:
  av=sys.argv[:];sys.argv=[str(V),str(p)]
  try:
   try:runpy.run_path(str(V),run_name='__main__')
   except SystemExit as e:return int(e.code or 0)
  finally:sys.argv=av
 finally:socket.socket,socket.create_connection,socket.getaddrinfo=olds
def main():
 m=json.loads(M.read_text());bad=[]
 for n in m['cases']:
  p=D/(n+'.json')
  try:r=one(p)
  except NetworkForbidden:r=1;print(n+': FAIL network attempt blocked')
  if r:bad.append(n)
 print(f"SUMMARY total={len(m['cases'])} passed={len(m['cases'])-len(bad)} failed={len(bad)} network=GUARDED live=NOT_AUTHORIZED")
 return bool(bad)
if __name__=='__main__':raise SystemExit(main())
