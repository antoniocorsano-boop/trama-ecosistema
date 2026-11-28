import copy
import tempfile
import unittest
from pathlib import Path

from scripts.trama_t1_events import collect, Ledger, ReplaySource

REPO = "example/trama"
HEAD = "a" * 40


def policy():
    return {"repository": REPO, "pullRequest": 5, "workflowIds": [11, 12], "reviewActor": "codex[bot]", "gates": {"human": "human"}}


def bundle():
    repo = {"full_name": REPO}
    anchor = {"number": 5, "state": "open", "draft": True, "base": {"repo": repo}, "head": {"repo": repo, "sha": HEAD}}
    rows = [{"event": "pull_request", "head_sha": HEAD, "repository": repo, "head_repository": repo, "pull_requests": [{"number": 5, "head": {"sha": HEAD}}], "id": w + 100, "workflow_id": w, "run_attempt": 1, "status": "completed", "conclusion": "success"} for w in (11, 12)]
    return {"anchors": [copy.deepcopy(anchor), copy.deepcopy(anchor)], "page": {"complete": True, "data": {"total_count": 2, "workflow_runs": rows}}, "event": {"action": "completed", "repository": repo, "workflow_run": copy.deepcopy(rows[0])}}


class EventTests(unittest.TestCase):
    def setUp(self):
        self.p, self.b = policy(), bundle()

    def collect(self):
        self.source = ReplaySource(self.b)
        return collect(self.p, self.b["event"], self.source)

    def test_exact_event(self):
        r = self.collect()
        self.assertEqual(r["status"], "OBSERVED")
        self.assertEqual(self.source.calls, ["pr.read", "workflow.read", "pr.read"])
        self.assertEqual([x["state"] for x in r["projection"]["checks"]], ["PASS", "PASS"])
        self.assertFalse(r["projection"]["executionAuthorized"])

    def test_foreign_event_no_reads(self):
        self.b["event"]["repository"] = {"full_name": "other/repo"}
        self.assertEqual(self.collect()["status"], "IGNORED_EVENT")
        self.assertEqual(self.source.calls, [])

    def test_fork_no_reads(self):
        self.b["event"]["workflow_run"]["head_repository"] = {"full_name": "other/repo"}
        self.assertEqual(self.collect()["status"], "IGNORED_EVENT")
        self.assertEqual(self.source.calls, [])

    def test_unlisted_workflow_no_reads(self):
        self.b["event"]["workflow_run"]["workflow_id"] = 99
        self.assertEqual(self.collect()["status"], "IGNORED_EVENT")
        self.assertEqual(self.source.calls, [])

    def test_old_head(self):
        self.b["anchors"][0]["head"]["sha"] = "b" * 40
        self.assertEqual(self.collect()["status"], "STALE_EVENT")
        self.assertEqual(self.source.calls, ["pr.read"])

    def test_moved_head(self):
        self.b["anchors"][1]["head"]["sha"] = "b" * 40
        self.assertEqual(self.collect()["status"], "COLLECTION_INVALIDATED")

    def test_partial(self):
        self.b["page"]["complete"] = False
        self.assertEqual(self.collect()["status"], "INCOMPLETE_COLLECTION")

    def test_wrong_count(self):
        self.b["page"]["data"]["total_count"] = 4
        self.assertEqual(self.collect()["status"], "INCOMPLETE_COLLECTION")

    def test_uncorroborated_event(self):
        self.b["event"]["workflow_run"]["id"] = 999
        self.assertEqual(self.collect()["status"], "EVENT_NOT_CORROBORATED")

    def test_forged_conclusion(self):
        self.b["event"]["workflow_run"]["conclusion"] = "failure"
        self.assertEqual(self.collect()["status"], "EVENT_NOT_CORROBORATED")

    def test_old_attempt(self):
        self.b["page"]["data"]["workflow_runs"][0]["run_attempt"] = 2
        self.assertEqual(self.collect()["status"], "EVENT_NOT_CORROBORATED")

    def test_wrong_run_pr(self):
        self.b["page"]["data"]["workflow_runs"][1]["pull_requests"][0]["number"] = 6
        self.assertEqual(self.collect()["status"], "RUN_IDENTITY_MISMATCH")

    def test_untrusted_event_receipts_ignored(self):
        self.b["event"]["review"] = {"state": "PASS", "head": HEAD, "actor": "codex[bot]", "receiptId": 1}
        self.assertEqual(self.collect()["projection"]["review"]["state"], "UNKNOWN")

    def test_source_error(self):
        class Unavailable:
            def pr(self, *_):
                raise OSError("403")
        self.assertEqual(collect(self.p, self.b["event"], Unavailable())["status"], "SOURCE_UNAVAILABLE_OR_INVALID")

    def test_missing_terminal_anchor(self):
        self.b["anchors"].pop()
        self.assertEqual(self.collect()["status"], "SOURCE_UNAVAILABLE_OR_INVALID")

    def test_outbox_persists_and_deduplicates(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "ledger.sqlite"
            self.assertTrue(Ledger(path).ingest(self.p, self.b["event"], ReplaySource(self.b))["projection"]["notify"])
            self.b["event"]["workflow_run"] = copy.deepcopy(self.b["page"]["data"]["workflow_runs"][1])
            self.assertFalse(Ledger(path).ingest(self.p, self.b["event"], ReplaySource(self.b))["projection"]["notify"])
            self.assertEqual(len(Ledger(path).pending()), 1)
            self.b["page"]["data"]["workflow_runs"][0]["conclusion"] = "failure"
            self.assertTrue(Ledger(path).ingest(self.p, self.b["event"], ReplaySource(self.b))["projection"]["notify"])
            self.assertEqual(len(Ledger(path).pending()), 2)

    def test_invalid_collection_preserves_state(self):
        with tempfile.TemporaryDirectory() as tmp:
            ledger = Ledger(Path(tmp) / "ledger.sqlite")
            ledger.ingest(self.p, self.b["event"], ReplaySource(self.b))
            self.b["page"]["complete"] = False
            self.assertEqual(ledger.ingest(self.p, self.b["event"], ReplaySource(self.b))["status"], "INCOMPLETE_COLLECTION")
            self.assertEqual(len(ledger.pending()), 1)


if __name__ == "__main__":
    unittest.main()
