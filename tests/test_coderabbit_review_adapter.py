import copy
import json
from pathlib import Path
import unittest
from scripts.review_orchestrator import plan
from scripts.coderabbit_review_adapter import observe, integrate

ROOT=Path(__file__).resolve().parents[1]
NOW='2026-11-28T09:57:00Z'
FRESH='2026-11-28T09:00:00Z'
def sample():return json.loads((ROOT/'examples/coderabbit-pr7-observation.json').read_text())
def inputs():return json.loads((ROOT/'examples/pr-7-v2-input.json').read_text())

class AdapterTests(unittest.TestCase):
    def run_obs(self,x=None,now=NOW):return observe(sample() if x is None else x,now)
    def test_exact_receipt(self):
        x=self.run_obs();self.assertEqual(x['receipt']['state'],'PASS');self.assertEqual(x['receipt']['scopes'],['code','security','ci']);self.assertEqual(x['receipt']['limitations'],['security','ci']);self.assertFalse(x['originVerified']);self.assertFalse(x['dispatchAuthorized'])
    def test_stale_quota_never_refills(self):
        p=self.run_obs()['provider'];self.assertEqual(p['status'],'UNKNOWN');self.assertEqual(p['estimatedRunsRemaining'],0);self.assertEqual(p['effectiveCostClass'],'UNKNOWN')
    def test_fresh_exhaustion(self):
        p=self.run_obs(now=FRESH)['provider'];self.assertEqual(p['status'],'UNAVAILABLE');self.assertEqual(p['estimatedRunsRemaining'],0)
    def test_positive_historical_count_not_dispatch(self):
        x=sample();x['comment']['body']=x['comment']['body'].replace('0 remain','1 remain');p=self.run_obs(x, FRESH)['provider'];self.assertEqual(p['estimatedRunsRemaining'],0);self.assertEqual(p['status'],'UNKNOWN')
    def test_spoofed_author(self):
        x=sample();x['comment']['authorId']=1;self.assertRaises(ValueError,self.run_obs,x)
    def test_spoofed_login(self):
        x=sample();x['comment']['authorLogin']='coderabbitai';self.assertRaises(ValueError,self.run_obs,x)
    def test_wrong_comment_url(self):
        x=sample();x['comment']['url']=x['comment']['url'].replace('/pull/7','/pull/8');self.assertRaises(ValueError,self.run_obs,x)
    def test_wrong_head(self):
        x=sample();x['head']='a'*40;self.assertRaises(ValueError,self.run_obs,x)
    def test_wrong_base(self):
        x=sample();x['base']='a'*40;self.assertRaises(ValueError,self.run_obs,x)
    def test_missing_coverage(self):
        x=sample();x['comment']['body']=x['comment']['body'].replace('final_review_risk_coverage','unrecognized');self.assertRaises(ValueError,self.run_obs,x)
    def test_duplicate_coverage(self):
        x=sample();s=x['comment']['body'];line=next(y for y in s.splitlines() if 'final_review_risk_coverage' in y);x['comment']['body']+= '\n'+line;self.assertRaises(ValueError,self.run_obs,x)
    def test_missing_changed_file(self):
        x=sample();x['changedFiles'].append('other.py');self.assertRaises(ValueError,self.run_obs,x)
    def test_partial_file_list(self):
        x=sample();x['changedFilesComplete']=False;self.assertRaises(ValueError,self.run_obs,x)
    def test_incomplete_threads(self):
        x=sample();x['threadsComplete']=False;self.assertRaises(ValueError,self.run_obs,x)
    def test_open_thread_is_not_pass(self):
        x=sample();x['openCodeRabbitThreads']=1;self.assertEqual(self.run_obs(x)['receipt']['state'],'UNCERTAIN')
    def test_actionable_is_not_pass(self):
        x=sample();x['comment']['body']=x['comment']['body'].replace('No actionable comments were generated in the recent review.','Actionable comments: 1');self.assertEqual(self.run_obs(x)['receipt']['state'],'UNCERTAIN')
    def test_private_repo_rejected(self):
        x=sample();x['visibility']='private';self.assertRaises(ValueError,self.run_obs,x)
    def test_not_authorized(self):
        x=sample();x['installationAuthorized']=False;self.assertRaises(ValueError,self.run_obs,x)
    def test_future_timestamp_rejected(self):self.assertRaises(ValueError,self.run_obs,None,'2026-11-28T08:50:00Z')
    def test_missing_quota_stays_unknown(self):
        x=sample();x['comment']['body']=x['comment']['body'].replace('Included review availability','unknown');self.assertEqual(self.run_obs(x)['provider']['status'],'UNKNOWN')
    def test_no_replay_new_candidate(self):
        d=inputs();d['request']['head']='c'*40;self.assertRaises(ValueError,integrate,d,sample(),NOW)
    def test_integrated_plan_counts_one_no_dispatch(self):
        d=integrate(inputs(),sample(),NOW);x=plan(d['request'],d['providers'],d['receipts'],d['asOf']);self.assertEqual(x['decision'],'HOLD_NO_COVERAGE');self.assertEqual(x['countedReceipts'],['coderabbit']);self.assertEqual(x['uncoveredHumanScopes'],['security']);self.assertFalse(x['dispatchAuthorized'])
    def test_repeated_ingest_idempotent(self):
        a=integrate(inputs(),sample(),NOW);self.assertEqual(a,integrate(a,sample(),NOW))
    def test_conflicting_existing_receipt_not_overwritten(self):
        a=integrate(inputs(),sample(),NOW);a['receipts'][-1]['state']='FAIL';self.assertRaises(ValueError,integrate,a,sample(),NOW)
    def test_allowlist_not_expanded(self):
        d=inputs();d['request']['providerAllowlist'].remove('coderabbit');self.assertRaises(ValueError,integrate,d,sample(),NOW)
    def test_not_mutate_input(self):
        d=inputs();old=copy.deepcopy(d);integrate(d,sample(),NOW);self.assertEqual(d,old)
