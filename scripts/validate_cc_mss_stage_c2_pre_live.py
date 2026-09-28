#!/usr/bin/env python3
import hashlib,json,re,sys
from pathlib import Path
API_HOST='api.github.com'; SCHEME='https'; CANON='cc-mss-c1-v1'
READ_OPS={'repo.read','ref.read','commit.read','pr.read','review.read','thread.read','workflow.read','job.read','check.read','status.read','content.read'}
class E(Exception):pass
def fail(c):raise E(c)
def sha(x):return hashlib.sha256(json.dumps(x,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def evaluate(f):
 k=f['kind'];d=f.get('data',{})
 if k=='repository':
  if not d.get('enrolled'):fail('UNENROLLED_REPOSITORY')
 elif k=='operation':
  if d.get('operation') not in READ_OPS or d.get('arbitraryUrl'):fail('OPERATION_NOT_ALLOWED')
 elif k=='permission':
  if d.get('status')!='VERIFIED_READ_ONLY':fail('SOURCE_PERMISSION_UNVERIFIED')
  if d.get('writePresent'):fail('SOURCE_PERMISSION_WRITE_PRESENT')
  if d.get('proof')=='GET_SUCCESS':fail('PERMISSION_PROOF_INVALID')
 elif k=='boundary':
  if d.get('scheme')!=SCHEME or d.get('host')!=API_HOST:fail('SOURCE_BOUNDARY_VIOLATION')
  if d.get('redirect') or d.get('credentialForwarding'):fail('SOURCE_BOUNDARY_VIOLATION')
 elif k=='budget':
  used=sum(d.get(x,0) for x in ('attempts','retries','pages','attestation','anchorOpen','anchorClose'))
  if used>d.get('maxRequests',0):fail('REQUEST_BUDGET_EXHAUSTED')
  if d.get('dependentNext') and d.get('maxRequests',0)-used < d.get('reservedClose',1):fail('REQUEST_BUDGET_INSUFFICIENT')
 elif k=='resource':
  limits=d['limits'];obs=d['observed']
  for x in ('compressedBytes','decompressedBytes','items','pages','sessionBytes'):
   if obs.get(x,0)>limits.get(x,0):fail('SOURCE_RESOURCE_LIMIT_EXCEEDED')
  if obs.get('depth',0)>limits.get('depth',0):fail('SOURCE_RESOURCE_LIMIT_EXCEEDED')
 elif k=='session':
  if d.get('anchorStart')!=d.get('anchorEnd'):fail('COLLECTION_INVALIDATED')
 elif k=='pagination':
  if not d.get('terminal') or d.get('received')!=d.get('expected'):fail('INCOMPLETE_PAGINATION')
 elif k=='persistence':
  if d.get('remote'):fail('REMOTE_PERSISTENCE_FORBIDDEN')
 elif k=='logging':
  text=json.dumps(d).lower()
  if any(x in text for x in ('authorization:','bearer ','cookie:','token-secret')):fail('SECRET_LEAKAGE')
 elif k=='attestation-digest':
  if d.get('version')!=CANON or not re.fullmatch(r'[0-9a-f]{64}',d.get('digest','')):fail('ATTESTATION_INVALID')
  if sha(d.get('payload'))!=d.get('digest'):fail('ATTESTATION_DIGEST_MISMATCH')
 else:fail('UNKNOWN_FIXTURE_KIND')
 return 'PASS'
def main():
 p=Path(sys.argv[1]);f=json.loads(p.read_text());exp=f['expected']
 try:a=evaluate(f)
 except E as e:a=str(e)
 print(('PASS' if a==exp else 'FAIL')+f' {p.stem} expected={exp} actual={a}')
 return 0 if a==exp else 1
if __name__=='__main__':raise SystemExit(main())
