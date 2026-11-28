import copy
import unittest
from scripts.review_orchestrator import plan

NOW = '2026-11-28T08:30:00Z'
BASE = 'a'*40
HEAD = 'b'*40

def request(risk='CRITICAL'):
    return dict(repository='owner/repo',pr=7,base=BASE,head=HEAD,risk=risk,
                requiredScopes=['security','ci'],humanRequired=False,requiredHumanScopes=[],
                authorGroups=['builder'],maxRequests=3,
                providerAllowlist=['codex','devin','local','ecc','human'])

def provider(id,group,scopes,**overrides):
    p=dict(providerId=id,independenceGroup=group,capabilities=scopes,kind='INDEPENDENT',
           authorized=True,credentialsAvailable=True,status='AVAILABLE',effectiveCostClass='ZERO_MARGINAL',
           estimatedRunsRemaining=2,evidenceRef='synthetic://availability/'+id,
           observedAt='2026-11-28T08:20:00Z',expiresAt='2026-11-28T09:00:00Z')
    p.update(overrides)
    return p

def providers():
    return [provider('codex','openai',['security','ci']),provider('devin','cognition',['ci']),
            provider('local','local-model',['security']),provider('ecc','scanner',['security','ci'],kind='COMPLEMENTARY')]

def receipt(id,scopes,state='PASS',**overrides):
    r=dict(repository='owner/repo',pr=7,base=BASE,head=HEAD,providerId=id,scopes=scopes,
           state=state,evidenceRef='synthetic://receipt/'+id,openFindings=[],limitations=[])
    r.update(overrides)
    return r

class RouterTests(unittest.TestCase):
    def run_plan(self,ps=None,rs=None,req=None):
        return plan(req if req is not None else request(),ps if ps is not None else providers(),rs or [],NOW)
    def ids(self,result): return [x['providerId'] for x in result['assignments']]
    def test_critical_two_independent(self):
        x=self.run_plan(); self.assertEqual(x['decision'],'PLAN_READY_FOR_REVIEW'); self.assertEqual(len(self.ids(x)),2)
        self.assertNotIn('ecc',self.ids(x)); self.assertFalse(x['dispatchAuthorized']); self.assertFalse(x['mergeAuthorized'])
    def test_ordinary_one(self): self.assertEqual(len(self.ids(self.run_plan(req=request('ORDINARY')))),1)
    def test_quota_failover(self):
        ps=providers(); ps[0]['estimatedRunsRemaining']=0
        self.assertEqual(set(self.ids(self.run_plan(ps))),{'devin','local'})
    def test_unknown_cost(self):
        ps=providers(); ps[0]['effectiveCostClass']='UNKNOWN'; ps[1]['effectiveCostClass']='PAID'
        self.assertEqual(self.run_plan(ps)['decision'],'HOLD_NO_COVERAGE')
    def test_credentials_not_entitlement(self):
        ps=providers(); ps[0]['status']='UNKNOWN'; ps[1]['credentialsAvailable']=False
        self.assertEqual(self.run_plan(ps)['decision'],'HOLD_NO_COVERAGE')
    def test_stale_and_future(self):
        ps=providers(); ps[0]['expiresAt']='2026-11-28T08:00:00Z';ps[1]['observedAt']='2026-11-28T09:00:00Z'
        self.assertEqual(self.run_plan(ps)['decision'],'HOLD_NO_COVERAGE')
    def test_independence_family(self):
        ps=providers();ps[0]['independenceGroup']=ps[1]['independenceGroup']=ps[2]['independenceGroup']='same'
        self.assertEqual(self.run_plan(ps)['decision'],'HOLD_NO_COVERAGE')
    def test_author_family(self):
        ps=providers();ps[0]['independenceGroup']='builder'; ps[2]['independenceGroup']='builder'
        self.assertEqual(self.run_plan(ps)['decision'],'HOLD_NO_COVERAGE')
    def test_human_required(self):
        req=request();req['humanRequired']=True;req['requiredHumanScopes']=['security']
        self.assertEqual(self.run_plan(req=req)['decision'],'HOLD_NO_COVERAGE')
        ps=providers()+[provider('human','specialist',['security'],kind='HUMAN')]
        self.assertIn('human',self.ids(self.run_plan(ps,req=req)))
    def test_current_receipt_reused(self):
        x=self.run_plan(rs=[receipt('codex',['security','ci'])]);self.assertEqual(len(self.ids(x)),1);self.assertNotIn('codex',self.ids(x))
    def test_stale_receipt_not_reused(self):
        x=self.run_plan(rs=[receipt('codex',['security','ci'],head='c'*40)])
        self.assertEqual(len(self.ids(x)),2);self.assertEqual(x['staleReceipts'],1)
    def test_pending_no_duplicate(self):
        x=self.run_plan(rs=[receipt('codex',[],state='PENDING')]);self.assertEqual(x['decision'],'WAITING_RECEIPT');self.assertEqual(self.ids(x),[])
    def test_uncertain_holds(self): self.assertEqual(self.run_plan(rs=[receipt('codex',[],state='UNCERTAIN')])['decision'],'HOLD_UNCERTAIN')
    def test_failed_falls_back(self): self.assertEqual(set(self.ids(self.run_plan(rs=[receipt('codex',[],state='FAILED')]))),{'devin','local'})
    def test_findings_override_pass(self):
        x=self.run_plan(rs=[receipt('codex',['security','ci'],openFindings=[dict(severity='HIGH',reference='synthetic://finding')]),receipt('devin',['ci'])]);self.assertEqual(x['decision'],'HOLD_FINDINGS')
    def test_conflict(self):
        r=receipt('codex',['security','ci']);s=copy.deepcopy(r);s['state']='FAIL'
        self.assertEqual(self.run_plan(rs=[r,s])['decision'],'HOLD_CONFLICT')
    def test_receipt_complete_not_authorization(self):
        x=self.run_plan(rs=[receipt('codex',['security','ci']),receipt('devin',['ci'])]);self.assertEqual(x['decision'],'EVIDENCE_COMPLETE_FOR_HUMAN_REVIEW');self.assertFalse(x['mergeAuthorized']);self.assertFalse(x['reviewAccepted'])
    def test_incomplete_scope(self):
        req=request();req['requiredScopes']=['privacy'];self.assertEqual(self.run_plan(req=req)['decision'],'HOLD_NO_COVERAGE')
    def test_invalid_quota_and_unknown_provenance(self):
        ps=providers();ps[0]['estimatedRunsRemaining']=True;ps[1]['evidenceRef']=''
        self.assertEqual(self.run_plan(ps)['decision'],'HOLD_NO_COVERAGE')
    def test_limit_no_partial_dispatch(self):
        req=request();req['maxRequests']=1;self.assertEqual(self.run_plan(req=req)['decision'],'HOLD_NO_COVERAGE')
    def test_duplicate_provider_fails_closed(self):
        ps=providers();ps.append(copy.deepcopy(ps[0]));self.assertEqual(self.run_plan(ps)['decision'],'HOLD_INVALID_INPUT')
    def test_receipt_unsupported_scope(self):
        x=self.run_plan(rs=[receipt('devin',['security','ci'])]);self.assertEqual(x['decision'],'HOLD_INVALID_INPUT')
    def test_deterministic_order(self): self.assertEqual(self.run_plan(),self.run_plan(list(reversed(providers()))))
    def test_receipt_limits_not_covered(self):
        x=self.run_plan(rs=[receipt('codex',['security','ci'],limitations=['security']),receipt('devin',['ci'])]);self.assertEqual(self.ids(x),['local'])
    def test_budget_override_rejected(self):
        req=request();req['paidComputeAuthorized']=True;self.assertEqual(self.run_plan(req=req)['decision'],'HOLD_INVALID_INPUT')
    def test_complementary_not_independent(self):
        x=self.run_plan(rs=[receipt('ecc',['security','ci'])]);self.assertEqual(len(self.ids(x)),2)

    def test_human_must_cover_specialist_scope(self):
        req=request();req['humanRequired']=True;req['requiredHumanScopes']=['security']
        ps=providers()+[provider('human','specialist',['ci'],kind='HUMAN')]
        self.assertEqual(self.run_plan(ps,req=req)['decision'],'HOLD_NO_COVERAGE')
    def test_minor_findings_preserved(self):
        finding=dict(severity='LOW',reference='synthetic://minor')
        x=self.run_plan(rs=[receipt('codex',['security','ci'],openFindings=[finding]),receipt('devin',['ci'])])
        self.assertEqual(x['decision'],'EVIDENCE_COMPLETE_FOR_HUMAN_REVIEW')
        self.assertEqual(x['receiptEvidence'][0]['openFindings'],[finding])
    def test_attempt_bound_even_with_existing_receipts(self):
        req=request();req['maxRequests']=1
        self.assertEqual(self.run_plan(rs=[receipt('codex',['security','ci']),receipt('devin',['ci'])],req=req)['decision'],'HOLD_ATTEMPT_BOUND')
    def test_changed_base_receipt_not_reused(self):
        x=self.run_plan(rs=[receipt('codex',['security','ci'],base='c'*40)])
        self.assertEqual(x['staleReceipts'],1);self.assertEqual(len(self.ids(x)),2)
    def test_identical_receipt_deduplicated(self):
        r=receipt('codex',['security','ci']);x=self.run_plan(rs=[r,copy.deepcopy(r)])
        self.assertEqual(x['countedReceipts'],['codex']);self.assertEqual(len(self.ids(x)),1)
    def test_exhausted_only_provider_stops(self):
        ps=[provider('codex','openai',['security','ci'],estimatedRunsRemaining=0)]
        self.assertEqual(self.run_plan(ps,req=request('ORDINARY'))['decision'],'HOLD_NO_COVERAGE')
    def test_unauthorized_provider_stops(self):
        ps=[provider('codex','openai',['security','ci'],authorized=False)]
        self.assertEqual(self.run_plan(ps,req=request('ORDINARY'))['decision'],'HOLD_NO_COVERAGE')
    def test_unallowlisted_provider_stops(self):
        req=request('ORDINARY');req['providerAllowlist']=['devin']
        self.assertEqual(self.run_plan([provider('codex','openai',['security','ci'])],req=req)['decision'],'HOLD_NO_COVERAGE')
