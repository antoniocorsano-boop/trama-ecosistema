import copy
import hashlib
import hmac
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

from test_trama_t1_events import bundle, policy
from scripts.trama_t1_events import Ledger, ReplaySource
from scripts.trama_t1_runtime import ingest_signed, deliver_local, MAX_EVENT_BYTES

SECRET = b"s" * 32


def sign(body):
    return "sha256=" + hmac.new(SECRET, body, hashlib.sha256).hexdigest()


class RuntimeTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name) / "ledger.sqlite"
        self.inbox = Path(self.tmp.name) / "inbox.sqlite"
        self.ledger = Ledger(self.path)
        self.b = bundle()
        self.body = json.dumps(self.b["event"]).encode()

    def ingest(self, body=None, signature=None, event_type="workflow_run", secret=SECRET):
        body = self.body if body is None else body
        self.source = ReplaySource(self.b)
        return ingest_signed(policy(), body, sign(body) if signature is None else signature,
                             event_type, secret, self.ledger, self.source)

    def query(self, path, sql):
        with sqlite3.connect(path) as db:
            return db.execute(sql).fetchall()

    def test_signed_event_and_replay(self):
        self.assertTrue(self.ingest()["projection"]["notify"])
        self.assertFalse(self.ingest()["projection"]["notify"])
        self.assertEqual(len(self.ledger.pending()), 1)
        self.assertFalse(self.inbox.exists())

    def test_tampering_rejected_before_reads(self):
        self.assertEqual(self.ingest(self.body + b" ", sign(self.body))["status"], "REJECTED_EVENT")
        self.assertEqual(self.source.calls, [])
        self.assertFalse(self.path.exists())

    def test_wrong_event_and_signature(self):
        for signature, event in [("sha256=" + "0" * 64, "workflow_run"), ("bad", "workflow_run"), (sign(self.body), "issues")]:
            self.assertEqual(self.ingest(signature=signature, event_type=event)["status"], "REJECTED_EVENT")
            self.assertEqual(self.source.calls, [])

    def test_bad_json_and_size(self):
        for body in (b"{", b"[]", b"x" * (MAX_EVENT_BYTES + 1)):
            self.assertEqual(self.ingest(body)["status"], "REJECTED_EVENT")
            self.assertEqual(self.source.calls, [])

    def test_missing_secret(self):
        with self.assertRaisesRegex(ValueError, "WEBHOOK_SECRET_NOT_CONFIGURED"):
            self.ingest(secret=b"")
        self.assertEqual(self.source.calls, [])

    def test_receipt_not_accepted_from_event(self):
        event = copy.deepcopy(self.b["event"])
        event["review"] = {"state": "PASS", "head": "a" * 40, "actor": "codex[bot]", "receiptId": 1}
        p = self.ingest(json.dumps(event).encode())["projection"]
        self.assertEqual(p["review"]["state"], "UNKNOWN")
        self.assertFalse(p["executionAuthorized"])

    def test_delivery_persists_and_deduplicates(self):
        self.ingest()
        self.assertEqual(deliver_local(self.path, self.inbox), {"status": "LOCAL_INBOX", "delivered": 1})
        self.assertEqual(deliver_local(self.path, self.inbox)["delivered"], 0)
        self.assertEqual(len(self.query(self.inbox, "SELECT * FROM inbox")), 1)
        self.assertEqual(len(self.query(self.path, "SELECT * FROM t1_delivery_receipts")), 1)
        self.assertEqual(len(self.ledger.pending()), 1)

    def test_recovery_after_inbox_commit(self):
        self.ingest()
        deliver_local(self.path, self.inbox)
        # Simulate the durable target commit surviving while the source ACK does not.
        with sqlite3.connect(self.path) as db:
            db.execute("DELETE FROM t1_delivery_receipts")
        self.assertEqual(deliver_local(self.path, self.inbox)["delivered"], 1)
        self.assertEqual(len(self.query(self.inbox, "SELECT * FROM inbox")), 1)

    def test_real_transaction_rollback_after_target_commit(self):
        self.ingest()
        with sqlite3.connect(self.path) as db:
            db.execute("CREATE TABLE t1_delivery_receipts (outbox_id INTEGER PRIMARY KEY, digest TEXT NOT NULL)")
            db.execute("CREATE TRIGGER interrupt_ack BEFORE INSERT ON t1_delivery_receipts BEGIN SELECT RAISE(ABORT, 'simulated interruption'); END")
        with self.assertRaises(sqlite3.IntegrityError):
            deliver_local(self.path, self.inbox)
        self.assertEqual(len(self.query(self.inbox, "SELECT * FROM inbox")), 1)
        self.assertEqual(self.query(self.path, "SELECT * FROM t1_delivery_receipts"), [])
        with sqlite3.connect(self.path) as db:
            db.execute("DROP TRIGGER interrupt_ack")
        self.assertEqual(deliver_local(self.path, self.inbox)["delivered"], 1)
        self.assertEqual(len(self.query(self.inbox, "SELECT * FROM inbox")), 1)

    def test_target_failure_leaves_pending(self):
        self.ingest()
        self.inbox.mkdir()
        with self.assertRaises(sqlite3.Error):
            deliver_local(self.path, self.inbox)
        self.assertEqual(self.query(self.path, "SELECT * FROM t1_delivery_receipts"), [])
        self.inbox.rmdir()
        self.assertEqual(deliver_local(self.path, self.inbox)["delivered"], 1)

    def test_bounded_and_separate(self):
        self.ingest()
        self.b["page"]["data"]["workflow_runs"][1]["conclusion"] = "failure"
        self.ingest()
        self.assertEqual(deliver_local(self.path, self.inbox, 1)["delivered"], 1)
        self.assertEqual(deliver_local(self.path, self.inbox, 1)["delivered"], 1)
        with self.assertRaises(ValueError):
            deliver_local(self.path, self.path)
        with self.assertRaises(ValueError):
            deliver_local(self.path, self.inbox, 0)

    def test_distinct_ledger_identity(self):
        self.ingest()
        deliver_local(self.path, self.inbox)
        second = Path(self.tmp.name) / "second.sqlite"
        Ledger(second).ingest(policy(), self.b["event"], ReplaySource(self.b))
        deliver_local(second, self.inbox)
        self.assertEqual(len(self.query(self.inbox, "SELECT * FROM inbox")), 2)

    def test_no_ledger_no_side_effect(self):
        self.assertEqual(deliver_local(self.path, self.inbox)["status"], "NO_LEDGER")
        self.assertFalse(self.inbox.exists())


if __name__ == "__main__":
    unittest.main()
