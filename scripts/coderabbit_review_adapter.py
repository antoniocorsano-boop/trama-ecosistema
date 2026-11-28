"""Offline CodeRabbit receipt adapter. Input is a declared, read-only connector
observation, not a signed receipt. Never invokes a provider, predicts a quota
reset, or grants execution/merge authority. Unknown format fails closed.
"""
from __future__ import annotations
import argparse
import copy
import datetime as dt
import json
import re
from pathlib import Path
from scripts.review_orchestrator import identity, need, time, plan, MAX_AGE

BOT_LOGIN='coderabbitai[bot]'
BOT_ID=136622811
SCOPES=['code','security','ci']
# A general code review is not an independent specialist attestation of security/CI.
LIMITATIONS=['security','ci']
FIELDS={'repository','pr','base','head','visibility','installationAuthorized',
        'changedFilesComplete','changedFiles','threadsComplete','openCodeRabbitThreads','comment'}
COMMENT_FIELDS={'id','authorLogin','authorId','url','createdAt','updatedAt','body'}

def unique(pattern, body, label):
    matches=re.findall(pattern,body,re.MULTILINE)
    need(len(matches)==1,label)
    return matches[0]

def observe(observation, as_of):
    ident=identity(observation)
    need(set(observation)==FIELDS,'observation fields')
    repo,pr,base,head=ident
    need(observation['visibility']=='public' and observation['installationAuthorized'] is True,'public authorized repository only')
    need(observation['changedFilesComplete'] is True and observation['threadsComplete'] is True,'incomplete connector observation')
    paths=observation['changedFiles']
    need(type(paths) is list and 0<len(paths)<=3000 and all(isinstance(p,str) and 0<len(p)<=1024 and '\n' not in p and '`' not in p for p in paths),'changed files')
    need(len(set(paths))==len(paths),'duplicate changed files')
    count=observation['openCodeRabbitThreads']
    need(type(count) is int and count>=0,'thread count')
    c=observation['comment'];need(isinstance(c,dict) and set(c)==COMMENT_FIELDS,'comment fields')
    need(c['authorLogin']==BOT_LOGIN and type(c['authorId']) is int and c['authorId']==BOT_ID,'unexpected bot identity')
    need(type(c['id']) is int and c['id']>0,'comment identity')
    ref=f'https://github.com/{repo}/pull/{pr}#issuecomment-{c["id"]}'
    need(c['url']==ref,'comment repository/PR identity')
    created,updated,now=time(c['createdAt']),time(c['updatedAt']),time(as_of)
    need(created<=updated<=now,'comment time')
    b=c['body'];need(isinstance(b,str) and 0<len(b)<=500_000,'comment body')
    need(b.count('<!-- coderabbit-ai-generated:v1 -->')==1,'receipt marker')
    cov=json.loads(unique(r'<!-- final_review_risk_coverage:(\{[^\n]*\}) -->',b,'coverage marker'))
    need(cov=={'sourceCommitId':head,'coveredCommitId':head,'kind':'reviewed'},'exact reviewed head')
    commits=unique(r'^Reviewing files that changed from the base of the PR and between ([0-9a-f]{40}) and ([0-9a-f]{40})\.$',b,'reviewed range')
    need(commits==(base,head),'exact reviewed base and head')
    run=unique(r'^- \*\*Run ID\*\*: `([0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12})`$',b,'run identity')
    declared,files=unique(r'<summary><strong>Files selected for processing: (\d+)</strong></summary>\s*(?:<dl>\s*<dd>\s*<br>\s*)?((?:\* `[^`\n]+`\n)+)',b,'file coverage')
    selected=re.findall(r'^\* `([^`\n]+)`$',files,re.MULTILINE)
    need(int(declared)==len(selected)==len(paths) and sorted(selected)==sorted(paths),'full selected file coverage')
    status=re.findall(r'<!-- recent_review_status_start -->\s*(.*?)\s*<!-- recent_review_status_end -->',b,re.DOTALL)
    passed=len(status)==1 and status[0]=='No actionable comments were generated in the recent review.' and count==0
    # This is an observation of past included consumption, not a live budget check.
    quotas=re.findall(r'\*\*Included review availability:\*\* This review used your included allowance\. Your plan provides up to (\d+) included review(?:s)? per hour; (\d+) remain after this review\.',b)
    q=None
    if len(quotas)==1:
        cap,left=map(int,quotas[0]);
        if 0<=left<=cap<=10**6:q={'perHour':cap,'remainingAfterReview':left,'observedAt':c['createdAt']}
    fresh=now-created<MAX_AGE
    p=dict(providerId='coderabbit',independenceGroup='coderabbit',capabilities=SCOPES.copy(),kind='INDEPENDENT',authorized=True,
           credentialsAvailable=False,status='UNAVAILABLE' if fresh and q and q['remainingAfterReview']==0 else 'UNKNOWN',
           effectiveCostClass='UNKNOWN',estimatedRunsRemaining=0,evidenceRef=ref,observedAt=c['createdAt'],expiresAt=(created+MAX_AGE).isoformat())
    receipt=dict(zip(('repository','pr','base','head'),ident),providerId='coderabbit',scopes=SCOPES.copy() if passed else [],
                 state='PASS' if passed else 'UNCERTAIN',evidenceRef=ref,openFindings=[],limitations=LIMITATIONS.copy() if passed else [])
    return dict(provider=p,receipt=receipt,quotaObservation=q,runId=run,sourceUpdatedAt=c['updatedAt'],
                fileCount=len(selected),originVerified=False,dispatchAuthorized=False,paidComputeAuthorized=False,
                mergeAuthorized=False,releaseAuthorized=False)

def integrate(data, observation, as_of):
    """Produce V1 planner input. Refuse conflicts instead of replacing receipts."""
    need(identity(data['request'])==identity(observation),'candidate changed')
    result=observe(observation,as_of);out=copy.deepcopy(data)
    out['asOf']=as_of
    allow=out['request']['providerAllowlist']
    need('coderabbit' in allow,'provider not explicitly allowlisted')
    existing=[p for p in out['providers'] if p['providerId']=='coderabbit']
    need(len(existing)<=1,'duplicate provider')
    out['providers']=[p for p in out['providers'] if p['providerId']!='coderabbit']+[result['provider']]
    same=[r for r in out['receipts'] if identity(r)==identity(observation) and r['providerId']=='coderabbit']
    need(len(same)<=1 and (not same or same[0]==result['receipt']),'conflicting existing receipt')
    if not same:out['receipts'].append(result['receipt'])
    return out

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('input',type=Path);p.add_argument('observation',type=Path);p.add_argument('--as-of',required=True);a=p.parse_args()
    try:
        o=json.loads(a.observation.read_text());d=integrate(json.loads(a.input.read_text()),o,a.as_of)
        print(json.dumps({'observation':observe(o,a.as_of),'input':d,'plan':plan(d['request'],d['providers'],d['receipts'],d['asOf'])},indent=2,sort_keys=True));return 0
    except (ValueError,TypeError,KeyError,OSError) as exc:
        print(json.dumps({'decision':'HOLD_INVALID_OBSERVATION','reason':str(exc),'dispatchAuthorized':False}));return 1
if __name__=='__main__':raise SystemExit(main())
