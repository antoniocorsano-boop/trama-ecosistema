import concurrent.futures
import copy
import tempfile
import unittest
from pathlib import Path

from scripts.compute_factory_quota_ledger import QuotaLedger
from scripts.review_orchestrator import time
from tests.test_review_orchestrator import request, providers, receipt, NOW

EXPIRY = int(time('2026-11-28T09:00:00Z').timestamp())
NOW_SEC = int(time(NOW).timestamp())
UNIT = 'REVIEW_SIM'

class ReviewReservationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / 'ledger.db'
        self.q = QuotaLedger(self.path)
        for pid in ('codex','devin','local'):
            self.q.seed('synthetic:review:'+pid, UNIT, 1, EXPIRY)
    def tearDown(self):
        self.q.close(); self.tmp.cleanup()
    def reserve(self, req=None, ps=None, rs=None, now=NOW):
        return self.q.reserve_review_plan(request() if req is None else req,
                                          providers() if ps is None else ps, rs or [], now)
    def used(self, pid):
        return self.q.balance('synthetic:review:'+pid)[2]
    def test_batch_and_replay(self):
        first = self.reserve(); second = self.reserve()
        self.assertEqual(first, second)
        self.assertEqual(first['decision'], 'SIMULATED_RESERVED')
        self.assertEqual(len(first['reservations']), 2)
        self.assertFalse(first['dispatchAuthorized']); self.assertFalse(first['paidComputeAuthorized'])
        self.assertEqual(self.used('codex')+self.used('devin')+self.used('local'), 2)
    def test_rollback_all_if_second_exhausted(self):
        req = request(); req['pr']=8; req['risk']='ORDINARY'; req['providerAllowlist']=['devin']; req['requiredScopes']=['ci']
        self.assertEqual(self.reserve(req)['decision'],'SIMULATED_RESERVED')
        result=self.reserve()
        self.assertEqual(result['decision'],'HOLD_SIMULATED_QUOTA')
        self.assertEqual(result['reservations'],[]); self.assertEqual(self.used('codex'),0)
        self.assertEqual(self.used('devin'),1)
    def test_no_plan_no_reservation(self):
        ps=providers()
        for p in ps:p['estimatedRunsRemaining']=0
        self.assertEqual(self.reserve(ps=ps)['decision'],'HOLD_NO_COVERAGE')
        self.assertEqual(sum(self.used(p) for p in ('codex','devin','local')),0)
    def test_changed_plan_not_reallocated(self):
        self.reserve(); ps=providers(); ps[0]['estimatedRunsRemaining']=0
        self.assertEqual(self.reserve(ps=ps)['decision'],'HOLD_RECONCILIATION')
        self.assertEqual(self.used('local'),0)
    def test_uncertain_recovery(self):
        first=self.reserve(); key=first['reservations'][0]['key']
        self.assertTrue(self.q.transition(key,'start_simulation',NOW_SEC+1))
        self.assertEqual(self.q.recover(EXPIRY),2)
        ps=providers(); ps[0]['estimatedRunsRemaining']=0
        self.assertEqual(self.reserve(ps=ps)['decision'],'HOLD_RECONCILIATION')
        self.assertEqual(sum(self.used(p) for p in ('codex','devin','local')),1)
    def test_unchanged_replay_reports_uncertain(self):
        first=self.reserve(); key=first['reservations'][0]['key']
        self.q.transition(key,'start_simulation',NOW_SEC+1); self.q.recover(EXPIRY)
        r=self.reserve()
        self.assertEqual(r['decision'],'HOLD_RECONCILIATION')
        self.assertIn('UNCERTAIN',[x['state'] for x in r['reservations']])
    def test_real_observation_never_reserved(self):
        ps=providers(); ps[0]['evidenceRef']='https://github.com/o/r/pull/7#issuecomment-1'
        with self.assertRaises(ValueError):self.reserve(ps=ps)
        with self.assertRaises(ValueError):self.reserve(rs=[receipt('codex',['security','ci'],evidenceRef='https://github.com/o/r/pull/7')])
    def test_visual_unit_separation(self):
        from tests.test_compute_factory_quota_ledger import reference
        with self.assertRaises(ValueError):self.q.reserve(reference(),'synthetic:review:codex',UNIT,1,EXPIRY,NOW_SEC)
        with self.assertRaises(ValueError):self.q.seed('synthetic:gpu',UNIT,1,EXPIRY)
    def test_distinct_concurrent_atomic(self):
        def attempt(i):
            q=QuotaLedger(self.path); req=request();req['pr']=i+1
            try:return q.reserve_review_plan(req,providers(),[],NOW)['decision']
            finally:q.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            states=list(pool.map(attempt,range(16)))
        self.assertEqual(states.count('SIMULATED_RESERVED'),1)
        self.assertEqual(states.count('HOLD_SIMULATED_QUOTA'),15)
        self.assertEqual(sum(self.used(p) for p in ('codex','devin','local')),2)
    def test_duplicate_concurrent_idempotent(self):
        def attempt(_):
            q=QuotaLedger(self.path)
            try:return q.reserve_review_plan(request(),providers(),[],NOW)
            finally:q.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            results=list(pool.map(attempt,range(16)))
        self.assertTrue(all(x==results[0] for x in results))
        self.assertEqual(sum(self.used(p) for p in ('codex','devin','local')),2)
    def test_completed_not_reissued(self):
        first=self.reserve()
        for r in first['reservations']:
            self.assertTrue(self.q.transition(r['key'],'start_simulation',NOW_SEC+1))
            self.assertTrue(self.q.transition(r['key'],'finish_simulation',NOW_SEC+2))
        again=self.reserve();self.assertEqual(again['decision'],'HOLD_RECONCILIATION')
        self.assertTrue(all(r['state']=='SIMULATED_DONE' for r in again['reservations']))
    def test_changed_request_same_assignment_holds(self):
        first=self.reserve(); req=request(); req["maxRequests"]=4
        self.assertEqual(self.reserve(req)["decision"], "HOLD_RECONCILIATION")
        self.assertEqual(sum(self.used(p) for p in ("codex","devin","local")),2)
    def test_expired_evidence_holds(self):
        self.assertEqual(self.reserve(now='2026-11-28T09:00:01Z')['decision'],'HOLD_NO_COVERAGE')
        self.assertEqual(sum(self.used(p) for p in ('codex','devin','local')),0)
