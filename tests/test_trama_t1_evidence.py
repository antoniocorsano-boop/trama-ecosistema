import copy
import unittest
from scripts.trama_t1_evidence import evaluate

REPO = "example/trama"
HEAD = "a" * 40


def policy():
    return {"repository": REPO, "pullRequest": 5, "workflowIds": [11, 12], "reviewActor": "codex[bot]", "gates": {"offline": "technical", "student": "human", "original": "input", "quality": "functional"}}


def snapshot():
    return {"repository": REPO, "pullRequest": 5, "anchorStart": HEAD, "anchorEnd": HEAD, "availability": "AVAILABLE", "fresh": True, "complete": True, "totalCount": 2, "prState": "DRAFT",
            "runs": [{"repository": REPO, "pullRequest": 5, "head": HEAD, "event": "pull_request", "workflowId": w, "runId": 100 + w, "attempt": 1, "status": "completed", "conclusion": "success"} for w in (11, 12)],
            "review": {"head": HEAD, "actor": "codex[bot]", "receiptId": 73, "state": "PASS"},
            "gates": {k: {"head": HEAD, "state": "PENDING" if k == "student" else "PASS", "reference": "test:" + k} for k in policy()["gates"]}}


class EvidenceTests(unittest.TestCase):
    def setUp(self):
        self.p, self.s = policy(), snapshot()

    def run_projection(self):
        r = evaluate(self.p, self.s)
        for k in ("executionAuthorized", "mergeAuthorized", "publicationAuthorized"):
            self.assertIs(r[k], False)
        return r

    def test_baseline_not_approval(self):
        r = self.run_projection()
        self.assertEqual([x["state"] for x in r["checks"]], ["PASS", "PASS"])
        self.assertEqual(r["proposals"], ["REQUEST_HUMAN_REVIEW"])

    def test_head_invalidated(self):
        self.s["anchorEnd"] = "b" * 40
        self.assertEqual(self.run_projection()["collection"], "HEAD_INVALIDATED")

    def test_scope_mismatch(self):
        self.s["repository"] = "foreign/repo"
        self.assertEqual(self.run_projection()["collection"], "SUBJECT_MISMATCH")

    def test_stale(self):
        self.s["fresh"] = False
        self.assertEqual(self.run_projection()["collection"], "SOURCE_UNAVAILABLE_OR_STALE")

    def test_rate_limit(self):
        self.s["availability"] = "RATE_LIMIT"
        self.assertEqual(self.run_projection()["collection"], "SOURCE_UNAVAILABLE_OR_STALE")

    def test_incomplete(self):
        self.s["complete"] = False
        self.assertEqual(self.run_projection()["collection"], "INCOMPLETE_COLLECTION")

    def test_wrong_count(self):
        self.s["totalCount"] = 3
        self.assertEqual(self.run_projection()["collection"], "INCOMPLETE_COLLECTION")

    def test_closed_pr(self):
        self.s["prState"] = "MERGED"
        self.assertEqual(self.run_projection()["collection"], "PR_NOT_ACTIVE")

    def test_run_head_mismatch(self):
        self.s["runs"][0]["head"] = "c" * 40
        self.assertEqual(self.run_projection()["collection"], "RUN_IDENTITY_MISMATCH")

    def test_attempt_missing(self):
        del self.s["runs"][0]["attempt"]
        self.assertEqual(self.run_projection()["collection"], "MALFORMED_RUN")

    def test_wrong_event(self):
        self.s["runs"][0]["event"] = "push"
        self.assertEqual(self.run_projection()["collection"], "RUN_IDENTITY_MISMATCH")

    def test_missing_workflow(self):
        self.s["runs"].pop()
        self.s["totalCount"] = 1
        self.assertIn("MISSING", [x["state"] for x in self.run_projection()["checks"]])

    def test_failure_diagnosis_not_retry(self):
        self.s["runs"][0]["conclusion"] = "failure"
        self.assertEqual(self.run_projection()["proposals"][0], "DIAGNOSE_FAILURE")

    def test_running(self):
        self.s["runs"][0].update(status="in_progress", conclusion=None)
        self.assertIn("WAIT_QUALIFICATION", self.run_projection()["proposals"])

    def test_skipped_not_pass(self):
        self.s["runs"][0]["conclusion"] = "skipped"
        self.assertEqual(self.run_projection()["checks"][0]["state"], "SKIP")

    def test_cancelled_not_pass(self):
        self.s["runs"][0]["conclusion"] = "cancelled"
        self.assertEqual(self.run_projection()["checks"][0]["state"], "CANCELLED")

    def test_duplicate_equivalent(self):
        before = self.run_projection()
        self.s["runs"].append(copy.deepcopy(self.s["runs"][0]))
        self.s["totalCount"] += 1
        self.assertEqual(before["semanticDigest"], self.run_projection()["semanticDigest"])

    def test_duplicate_conflict(self):
        row = dict(self.s["runs"][0], conclusion="failure")
        self.s["runs"].append(row)
        self.s["totalCount"] += 1
        self.assertEqual(self.run_projection()["collection"], "CONFLICTING_RUN")

    def test_run_id_workflow_conflict(self):
        row = dict(self.s["runs"][0], workflowId=12, attempt=2)
        self.s["runs"].append(row)
        self.s["totalCount"] += 1
        self.assertEqual(self.run_projection()["collection"], "CONFLICTING_RUN")

    def test_new_attempt_replaces_old_pass(self):
        self.s["runs"].append(dict(self.s["runs"][0], attempt=2, conclusion="failure"))
        self.s["totalCount"] += 1
        self.assertEqual(self.run_projection()["checks"][0]["state"], "FAIL")

    def test_multiple_runs_ambiguous(self):
        self.s["runs"].append(dict(self.s["runs"][0], runId=999))
        self.s["totalCount"] += 1
        self.assertEqual(self.run_projection()["checks"][0]["state"], "AMBIGUOUS")

    def test_previous_sha_review_not_pass(self):
        self.s["review"]["head"] = "b" * 40
        self.assertEqual(self.run_projection()["review"]["state"], "UNKNOWN")

    def test_wrong_reviewer(self):
        self.s["review"]["actor"] = "untrusted"
        self.assertEqual(self.run_projection()["review"]["state"], "UNKNOWN")

    def test_quota_no_retry(self):
        self.s["review"]["state"] = "QUOTA_BLOCKED"
        self.assertIn("WAIT_AGENT_QUOTA", self.run_projection()["proposals"])

    def test_missing_input(self):
        self.s["gates"]["original"]["state"] = "BLOCKED_INPUT"
        self.assertIn("REQUEST_MISSING_INPUT", self.run_projection()["proposals"])

    def test_old_offline_evidence(self):
        self.s["gates"]["offline"]["head"] = "b" * 40
        self.assertIn("RECONCILE_EVIDENCE", self.run_projection()["proposals"])

    def test_manual_approval_not_granted(self):
        self.s["gates"]["student"]["state"] = "PASS"
        self.assertIn("REQUEST_HUMAN_REVIEW", self.run_projection()["proposals"])

    def test_finding_despite_all_ci_green(self):
        self.s["gates"]["quality"]["state"] = "FINDING"
        self.assertEqual(self.run_projection()["proposals"][0], "PROPOSE_BOUNDED_REPAIR")

    def test_environment_distinct(self):
        self.s["gates"]["offline"]["state"] = "BLOCKED_ENVIRONMENT"
        self.assertIn("RESOLVE_ENVIRONMENT", self.run_projection()["proposals"])

    def test_semantic_dedup(self):
        first = self.run_projection()
        self.s["runs"].reverse()
        self.s["observedAt"] = "other"
        next_ = evaluate(self.p, self.s, first["semanticDigest"])
        self.assertFalse(next_["notify"])
        self.assertEqual(first["semanticDigest"], next_["semanticDigest"])

    def test_change_notifies(self):
        first = self.run_projection()
        self.s["review"]["state"] = "FINDING"
        self.assertTrue(evaluate(self.p, self.s, first["semanticDigest"])["notify"])

    def test_malformed_run(self):
        self.s["runs"][0]["status"] = []
        self.assertEqual(self.run_projection()["collection"], "MALFORMED_RUN")

    def test_malformed_gate(self):
        self.s["gates"]["offline"]["state"] = []
        self.assertIn("RECONCILE_EVIDENCE", self.run_projection()["proposals"])

    def test_policy_duplicate_workflows(self):
        self.p["workflowIds"] = [11, 11]
        with self.assertRaises(ValueError):
            self.run_projection()


if __name__ == "__main__":
    unittest.main()
