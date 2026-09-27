#!/usr/bin/env python3
import hashlib,json,sys
from pathlib import Path
ALLOWED={'repo.read','ref.read','commit.read','pr.read','review.read','thread.read','workflow.read','job.read','check.read','status.read','content.read'}
VOLATILE={'retrievedAt','observedAt'}
class E(Exception):pass
def fail(c):raise E(c)
def canon(x):
 if isinstance(x,dict):return {k:canon(v) for k,v in sorted(x.items()) if k not in VOLATILE}
 if isinstance(x,list):
  y=[canon(v) for v in x]
  if all(isinstance(v,dict) and 'id' in v for v in y):y=sorted(y,key=lambda v:str(v['id']))
  return y
 return x
def digest(x):return hashlib.sha256(json.dumps(canon(x),sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
def evaluate(f):
 k=f['kind'];d=f.get('data',{})
 if k=='operation':
  if d['operation'] not in ALLOWED:fail('MUTATION_SURFACE_FORBIDDEN')
 elif k=='enrollment':
  if not d.get('enrolled'):fail('UNENROLLED_REPOSITORY')
 elif k=='pagination':
  if not d.get('terminal') or d.get('received')!=d.get('expected'):fail('INCOMPLETE_PAGINATION')
 elif k=='transport':
  if d.get('status') in (403,429) or d.get('timeout') or d.get('truncated') or d.get('retriesExhausted'):fail('SOURCE_UNAVAILABLE')
 elif k=='session':
  if d.get('anchorStart')!=d.get('anchorEnd'):fail('COLLECTION_INVALIDATED')
 elif k=='head':
  if d.get('exactHead')!=d.get('observedHead'):fail('HEAD_MISMATCH')
 elif k=='provenance':
  if not d.get('provenanceRefs') or not d.get('canonicalizationVersion') or not d.get('payloadDigest'):fail('PROVENANCE_INCOMPLETE')
 elif k=='digest-equal':
  if digest(d['left'])!=digest(d['right']):fail('DIGEST_NOT_STABLE')
 elif k=='digest-different':
  if digest(d['left'])==digest(d['right']):fail('DIGEST_NOT_MATERIAL')
 elif k=='ci-human':
  if d.get('ci')=='PASS' and d.get('humanApproval') is True:fail('CI_IS_NOT_HUMAN_APPROVAL')
 elif k=='normalize-pr':
  if d.get('state') not in ('OPEN','DRAFT','MERGED','CLOSED'):fail('MALFORMED_PAYLOAD')
 elif k=='malformed': fail('MALFORMED_PAYLOAD')
 else:fail('UNKNOWN_FIXTURE_KIND')
 return 'PASS'
def main():
 p=Path(sys.argv[1]);f=json.loads(p.read_text());exp=f['expected']
 try:act=evaluate(f)
 except E as e:act=str(e)
 if act!=exp:
  print(f'FAIL expected={exp} actual={act}');return 1
 print(f'PASS {p.stem} expected={exp} actual={act}');return 0
if __name__=='__main__':raise SystemExit(main())
