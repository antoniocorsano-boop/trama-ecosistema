#!/usr/bin/env python3
import argparse,json,sys
from pathlib import Path
class ValidationError(Exception): pass
def fail(c,d=''): raise ValidationError(c+((':'+d) if d else ''))
PREFIXES={'entities':'entity:','workstreams':'workstream:','relations':'relation:','decisions':'decision:','transitions':'transition:','repositoryEnrollment':'enrollment:','attentionRequired':'attention:','collisionCandidates':'collision:'}
def att(s,r,x): return any(a.get('reasonCode')==r and x in a.get('subjectRefs',[]) and a.get('status') in ('OPEN','UNKNOWN') for a in s.get('attentionRequired',[]))
def validate(s):
 objs=[]
 for g,p in PREFIXES.items():
  for o in s.get(g,[]): objs.append((g,o,p))
 for g in ('gates','evidence'):
  for o in s.get(g,[]):
   if isinstance(o,dict) and o.get('id'): objs.append((g,o,None))
 by={}
 for g,o,p in objs:
  i=o.get('id')
  if not i: fail('MISSING_ID',g)
  if i in by: fail('DUPLICATE_ID',i)
  if p and not i.startswith(p): fail('ID_NAMESPACE',i)
  by[i]=(g,o)
 def ref(r,sub,auth=False,kind=None):
  if r not in by:
   if auth: fail('DANGLING_REF',sub+'->'+r)
   return False
  if kind and by[r][0]!=kind: fail('REF_KIND_MISMATCH',r)
  return True
 for g,o,_ in objs:
  if g in PREFIXES and g!='attentionRequired' and 'sourceRefs' in o and not o.get('sourceRefs'): fail('UNSUPPORTED_ASSERTION',o['id'])
 # enrolled governed open change must be represented
 enrolled={e.get('repository') for e in s.get('repositoryEnrollment',[]) if e.get('state')=='ENROLLED'}
 for ch in s.get('observedChanges',[]):
  if ch.get('repository') in enrolled and ch.get('governed') and ch.get('state') in ('OPEN','DRAFT'):
   if not any(w.get('repository')==ch.get('repository') and w.get('changeRef')==ch.get('changeRef') and w.get('state')!='CLOSED' for w in s.get('workstreams',[])): fail('OPEN_WORKSTREAM_OMITTED',str(ch.get('changeRef')))
 for w in s.get('workstreams',[]):
  for r in w.get('entityRefs',[]): ref(r,w['id'],w.get('runtimeAuthorization')=='AUTHORIZED','entities')
  for r in w.get('nextTransitionRefs',[]): ref(r,w['id'],True,'transitions')
  if w.get('exactHead') and w.get('observedHead') and w['exactHead']!=w['observedHead'] and not att(s,'HEAD_MISMATCH',w['id']): fail('HEAD_MISMATCH_UNFLAGGED',w['id'])
  if w.get('runtimeAuthorization')=='AUTHORIZED' and 'DOS-A1' in json.dumps(w,sort_keys=True):
   ok=any(d.get('state')=='APPROVED' and w['id'] in d.get('subjectRefs',[]) and d.get('authority') and d.get('evidenceRefs') and d.get('sourceRefs') for d in s.get('decisions',[]))
   if not ok: fail('DOS_A1_UNAUTHORIZED',w['id'])
 for t in s.get('transitions',[]):
  ref(t['subjectRef'],t['id'],t.get('status')=='ALLOWED')
  if t.get('status')=='ALLOWED':
   if t.get('authorityType')!='CC3-F1' or not t.get('sourceRefs') or not t.get('evidenceRefs'): fail('TRANSITION_AUTHORITY_MISSING',t['id'])
   for r in t.get('gateRefs',[]):
    ref(r,t['id'],True,'gates'); gate=by[r][1]
    if str(gate.get('status',gate.get('state',''))).upper() not in ('PASS','PASSED','SUCCESS'): fail('BLOCKING_GATE_NOT_PASS',r)
 for d in s.get('decisions',[]):
  if d.get('state')=='APPROVED':
   if d.get('approvalBasis')=='CI_ONLY': fail('CI_IS_NOT_HUMAN_APPROVAL',d['id'])
   if not d.get('authority') or not d.get('evidenceRefs') or not d.get('sourceRefs'): fail('UNPROVEN_APPROVAL',d['id'])
 seen=set()
 for a in s.get('attentionRequired',[]):
  if a.get('status') in ('OPEN','UNKNOWN'):
   k=(a.get('reasonCode'),tuple(sorted(a.get('subjectRefs',[]))))
   if k in seen: fail('ATTENTION_DUPLICATE',str(k))
   seen.add(k)
 for e in s.get('repositoryEnrollment',[]):
  if e.get('enrollmentBasis') in ('NAME_SIMILARITY','INFERRED'): fail('UNENROLLED_REPOSITORY',e['id'])
 for c in s.get('collisionCandidates',[]):
  if c.get('derivation')=='TEXT_SIMILARITY': fail('COLLISION_HEURISTIC_FORBIDDEN',c['id'])
  if c.get('ruleId')=='C03_INCOMPATIBLE_TRANSITION' and (not c.get('sourceRefs') or not c.get('evidenceRefs')): fail('C03_AUTHORITY_MISSING',c['id'])
 for src in s.get('sourceObservations',[]):
  if src.get('reachable') is False and src.get('normalizedState') in ('CLOSED','PASS','AUTHORIZED'): fail('SOURCE_OUTAGE_FAIL_CLOSED',src.get('id','source'))
 if s.get('humanCanonicalSource') and s.get('machineCanonicalSource') and s['humanCanonicalSource']!=s['machineCanonicalSource']: fail('CANONICAL_SOURCE_DIVERGENCE')
 return 'PASS'
def backward(c,b):
 projected={k:v for k,v in c.items() if k not in PREFIXES}
 if projected!=b: fail('BACKWARD_SEMANTIC_BREAK')
def semantic(x):
 drop={'generatedAt','observedAt','lastEvaluatedAt'}
 if isinstance(x,dict): return {k:semantic(v) for k,v in x.items() if k not in drop}
 if isinstance(x,list): return [semantic(v) for v in x]
 return x
def run_fixture(p):
 f=json.loads(Path(p).read_text()); exp=f['expected']
 try:
  m=f.get('mode','validate')
  if m=='backward': backward(f['candidate'],f['baseline'])
  elif m=='idempotence':
   if semantic(f['left'])!=semantic(f['right']): fail('SEMANTIC_IDEMPOTENCE')
  else: validate(f['snapshot'])
  act='PASS'
 except ValidationError as e: act=str(e).split(':',1)[0]
 if act!=exp: fail('FIXTURE_EXPECTATION',f'expected={exp},actual={act}')
 return act
def main():
 p=argparse.ArgumentParser();p.add_argument('path',nargs='?');p.add_argument('--fixture');a=p.parse_args()
 try:
  print(run_fixture(a.fixture) if a.fixture else validate(json.loads(Path(a.path).read_text())))
 except ValidationError as e: print(str(e),file=sys.stderr);return 1
 return 0
if __name__=='__main__': raise SystemExit(main())
