#!/usr/bin/env python3
import json,runpy,socket,subprocess,sys
from pathlib import Path
R=Path(__file__).resolve().parents[1];D=R/'control-center/fixtures/cc-mss-stage-c1/cases';M=R/'control-center/fixtures/cc-mss-stage-c1/manifest.json';V=R/'scripts/validate_cc_mss_stage_c1.py'
class NetworkForbidden(RuntimeError):pass
def deny(*a,**k): raise NetworkForbidden('C1_NETWORK_FORBIDDEN')
def run_one(p):
 old_socket=socket.socket;old_create=socket.create_connection;old_getaddr=socket.getaddrinfo
 socket.socket=deny;socket.create_connection=deny;socket.getaddrinfo=deny
 try:
  old_argv=sys.argv[:];sys.argv=[str(V),str(p)]
  try:
   try: runpy.run_path(str(V),run_name='__main__')
   except SystemExit as e: return int(e.code or 0)
  finally: sys.argv=old_argv
 finally:
  socket.socket=old_socket;socket.create_connection=old_create;socket.getaddrinfo=old_getaddr

def main():
 m=json.loads(M.read_text());fail=[]
 for c in m['cases']:
  p=D/(c+'.json')
  if not p.exists(): print(c+': FAIL missing');fail.append(c);continue
  try:r=run_one(p)
  except NetworkForbidden: print(c+': FAIL network attempt blocked');r=1
  if r:fail.append(c)
 print(f"SUMMARY total={len(m['cases'])} passed={len(m['cases'])-len(fail)} failed={len(fail)} network=GUARDED")
 return 1 if fail else 0
if __name__=='__main__':raise SystemExit(main())
