"""GOV-REV-03 V1: offline, bounded planning only. No provider calls or authority.
Inputs are declared observations, NOT authenticated receipts or account facts.
The shared TRAMA FREE_ONLY predicate is reused without GPU infrastructure fields.
"""
from __future__ import annotations

import argparse
import datetime as dt
import itertools
import json
import re
from pathlib import Path

from scripts.compile_visual_factory_compute_plan import free_entitlement_reasons

SHA = re.compile(r'[0-9a-f]{40}')
IDENT = re.compile(r'[A-Za-z0-9._:-]{1,100}')
REPO = re.compile(r'[A-Za-z0-9_.-]{1,100}/[A-Za-z0-9_.-]{1,100}')
RISK = {'ORDINARY': 1, 'COMPLEX': 2, 'CRITICAL': 2}
KINDS = {'INDEPENDENT', 'HUMAN', 'COMPLEMENTARY'}
STATES = {'PASS', 'FAIL', 'PENDING', 'FAILED', 'UNCERTAIN'}
SEVERITIES = {'BLOCKING', 'HIGH', 'MEDIUM', 'LOW', 'INFO'}
MAX_AGE = dt.timedelta(hours=1)
REQ_FIELDS = {'repository','pr','base','head','risk','requiredScopes','humanRequired',
              'authorGroups','maxRequests','providerAllowlist','requiredHumanScopes'}
PROVIDER_FIELDS = {'providerId','independenceGroup','capabilities','kind','authorized',
                   'credentialsAvailable','status','effectiveCostClass','estimatedRunsRemaining',
                   'evidenceRef','observedAt','expiresAt'}
RECEIPT_FIELDS = {'repository','pr','base','head','providerId','scopes','state','evidenceRef',
                  'openFindings','limitations'}


def need(ok, label):
    if not ok:
        raise ValueError(label)


def names(xs, nonempty=True):
    need(type(xs) is list and (not nonempty or xs) and len(xs) <= 64, 'invalid list')
    need(all(isinstance(x, str) and IDENT.fullmatch(x) for x in xs), 'invalid identifier')
    need(len(set(xs)) == len(xs), 'duplicate list entry')
    return set(xs)


def time(value):
    need(isinstance(value, str), 'time type')
    parsed = dt.datetime.fromisoformat(value.replace('Z', '+00:00'))
    need(parsed.tzinfo is not None, 'timezone required')
    return parsed.astimezone(dt.timezone.utc)


def reference(value):
    return isinstance(value, str) and 0 < len(value) <= 1024 and bool(value.strip())


def identity(r):
    need(isinstance(r, dict), 'candidate object')
    need(isinstance(r.get('repository'), str) and REPO.fullmatch(r['repository']), 'repository')
    need(type(r.get('pr')) is int and r['pr'] > 0, 'PR identity')
    for key in ('base','head'):
        need(isinstance(r.get(key), str) and SHA.fullmatch(r[key]), 'commit identity')
    return (r['repository'],r['pr'],r['base'],r['head'])


def outcome(decision, **kw):
    return dict(schemaVersion='trama.review-plan/v0.1', decision=decision,
                assignments=[], exclusions=[], staleReceipts=0, countedReceipts=[],
                humanReviewRequired=True, inputOriginVerified=False, liveEvidenceVerified=False,
                dispatchAuthorized=False, paidComputeAuthorized=False,
                reviewAccepted=False, mergeAuthorized=False, releaseAuthorized=False) | kw


def plan(req, providers, receipts, as_of):
    """Evaluate one immutable candidate. No I/O. Malformed input fails closed."""
    try:
        return _plan(req, providers, receipts, as_of)
    except (ValueError, TypeError, KeyError, OverflowError) as e:
        return outcome('HOLD_INVALID_INPUT', reason=type(e).__name__ + ': ' + str(e))


def _plan(req, providers, receipts, as_of):
    ident = identity(req)
    need(set(req)==REQ_FIELDS, 'request contract')
    need(req['risk'] in RISK and type(req['humanRequired']) is bool, 'risk or human requirement')
    need(type(req['maxRequests']) is int and 1 <= req['maxRequests'] <= 4, 'request bound')
    required=names(req['requiredScopes']); author_groups=names(req['authorGroups'])
    human_scopes=names(req['requiredHumanScopes'],False)
    need(human_scopes<=required and bool(human_scopes)==req['humanRequired'], 'human specialist scope contract')
    allowlist=names(req['providerAllowlist']); now=time(as_of)
    need(type(providers) is list and len(providers)<=16, 'bounded provider list')
    need(type(receipts) is list and len(receipts)<=128, 'bounded receipts')
    inventory={}; exclusions={}; candidates=[]
    for p in providers:
        need(isinstance(p,dict) and set(p)==PROVIDER_FIELDS,'provider contract')
        pid=p['providerId']; group=p['independenceGroup']
        need(isinstance(pid,str) and IDENT.fullmatch(pid) and pid not in inventory,'duplicate or invalid provider')
        need(isinstance(group,str) and IDENT.fullmatch(group),'independence identity')
        need(p['kind'] in KINDS,'provider kind');names(p['capabilities'])
        need(type(p['authorized']) is bool and type(p['credentialsAvailable']) is bool,'authorization type')
        need(p['status'] in {'AVAILABLE','DEGRADED','UNAVAILABLE','UNKNOWN'},'provider status')
        need(p['effectiveCostClass'] in {'ZERO_MARGINAL','CREDIT_COVERED','PAID','UNKNOWN'},'cost class')
        inventory[pid]=p
        reasons=[]
        if type(p['estimatedRunsRemaining']) is not int or not 0<=p['estimatedRunsRemaining']<=10**12:
            reasons.append('INVALID_FREE_ENTITLEMENT')
        else:
            reasons.extend(free_entitlement_reasons(p,dict(providerAllowlist=sorted(allowlist),requiredEstimatedRunsRemaining=1)))
        if not reference(p['evidenceRef']):reasons.append('MISSING_ENTITLEMENT_EVIDENCE')
        observed,expires=time(p['observedAt']),time(p['expiresAt'])
        if not observed<=now<expires or now-observed>MAX_AGE:reasons.append('STALE_OR_FUTURE_ENTITLEMENT')
        if group in author_groups:reasons.append('NOT_INDEPENDENT_FROM_AUTHOR')
        if p['kind']=='COMPLEMENTARY':reasons.append('COMPLEMENTARY_ONLY')
        if not required.intersection(p['capabilities']):reasons.append('NO_REQUIRED_CAPABILITY')
        exclusions[pid]=reasons
        if not reasons:candidates.append(p)
    relevant={}; stale=0; conflict=False; receipt_evidence=[]
    for r in receipts:
        rid=identity(r)
        if rid!=ident:
            stale+=1;continue
        need(set(r)==RECEIPT_FIELDS,'receipt contract')
        pid=r['providerId'];need(isinstance(pid,str) and pid in inventory,'unknown receipt provider')
        need(r['state'] in STATES and reference(r['evidenceRef']),'receipt state or evidence')
        scopes=names(r['scopes'],False);limits=names(r['limitations'],False)
        need(scopes <= set(inventory[pid]['capabilities']) and limits <= scopes,'receipt scope not covered')
        need(type(r['openFindings']) is list and len(r['openFindings'])<=64,'findings')
        for f in r['openFindings']:
            need(isinstance(f,dict) and set(f)=={'severity','reference'} and f['severity'] in SEVERITIES and reference(f['reference']),'finding contract')
        if pid in relevant and relevant[pid]!=r:conflict=True
        relevant[pid]=r
        item=dict(providerId=pid,state=r['state'],evidenceRef=r['evidenceRef'],scopes=sorted(scopes),
                  limitations=sorted(limits),openFindings=sorted(r['openFindings'],key=lambda f:(f['severity'],f['reference'])))
        if item not in receipt_evidence:receipt_evidence.append(item)
    # Receipt status is evaluated before candidate scheduling. No majority override.
    common=dict(candidate=dict(zip(('repository','pr','base','head'),ident)),staleReceipts=stale,
                receiptEvidence=sorted(receipt_evidence,key=lambda x:(x['providerId'],x['state'],x['evidenceRef'])))
    if conflict:return outcome('HOLD_CONFLICT',**common)
    if any(r['state']=='UNCERTAIN' for r in relevant.values()):return outcome('HOLD_UNCERTAIN',**common)
    if any(r['state']=='FAIL' or any(f['severity'] in {'BLOCKING','HIGH','MEDIUM'} for f in r['openFindings']) for r in relevant.values()):
        return outcome('HOLD_FINDINGS',**common)
    if any(r['state']=='PENDING' for r in relevant.values()):return outcome('WAITING_RECEIPT',**common)
    # Conservative per-candidate one review/provider; a failed provider is not retried on same candidate.
    # An operator must reconcile an ambiguous attempt before considering alternatives.
    if len(relevant)>req['maxRequests']:return outcome('HOLD_ATTEMPT_BOUND',**common)
    valid=[];groups=set(); covered=set(); human_covered=set()
    for pid,r in sorted(relevant.items()):
        p=inventory[pid]; group=p['independenceGroup']
        if (r['state']=='PASS' and pid in allowlist and p['authorized'] is True and
            p['kind']!='COMPLEMENTARY' and group not in author_groups):
            usable=(set(r['scopes'])-set(r['limitations'])) & required
            if usable:
                valid.append(pid);groups.add(group);covered.update(usable)
                if p['kind']=='HUMAN':human_covered.update(usable)
        exclusions[pid].append('EXISTING_ATTEMPT_OR_RECEIPT')
    common['countedReceipts']=valid
    minimum=RISK[req['risk']]
    def sufficient(g,c,h):return len(g)>=minimum and required<=c and human_scopes<=h
    if sufficient(groups,covered,human_covered):
        return outcome('EVIDENCE_COMPLETE_FOR_HUMAN_REVIEW',exclusions=[{'providerId':p,'reasons':r} for p,r in sorted(exclusions.items()) if r],**common)
    pool=sorted((p for p in candidates if p['providerId'] not in relevant and p['independenceGroup'] not in groups),key=lambda p:(-p['estimatedRunsRemaining'],p['providerId']))
    remaining=max(0,req['maxRequests']-len(relevant))
    # Small, bounded exhaustive search finds a covering set, not just the first available reviewer.
    for count in range(1,min(remaining,len(pool))+1):
        for subset in itertools.combinations(pool,count):
            gs=[p['independenceGroup'] for p in subset]
            if len(set(gs))!=len(gs):continue
            cs=covered | set().union(*(set(p['capabilities'])&required for p in subset))
            hs=human_covered | set().union(*(set(p['capabilities'])&required for p in subset if p['kind']=='HUMAN'))
            if not sufficient(groups|set(gs),cs,hs):continue
            assignments=[]
            for p in subset:
                scopes=sorted(set(p['capabilities'])&required)
                assignments.append(dict(providerId=p['providerId'],independenceGroup=p['independenceGroup'],scopes=scopes,
                    dedupKey=[*ident,p['providerId'],scopes],entitlementEvidenceRef=p['evidenceRef'],expiresAt=p['expiresAt']))
            return outcome('PLAN_READY_FOR_REVIEW',assignments=assignments,exclusions=[{'providerId':p,'reasons':r} for p,r in sorted(exclusions.items()) if r],**common)
    return outcome('HOLD_NO_COVERAGE',exclusions=[{'providerId':p,'reasons':r} for p,r in sorted(exclusions.items()) if r],uncoveredScopes=sorted(required-covered),uncoveredHumanScopes=sorted(human_scopes-human_covered),**common)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input',type=Path);args=parser.parse_args()
    data=json.loads(args.input.read_text(encoding='utf-8'))
    result=plan(data['request'],data['providers'],data['receipts'],data['asOf'])
    print(json.dumps(result,ensure_ascii=False,indent=2,sort_keys=True))
    return 0


if __name__=='__main__':raise SystemExit(main())
