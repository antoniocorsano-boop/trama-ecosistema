"""Staged T1 webhook boundary and explicit delivery to a local durable inbox.
No server, credential acquisition, external notifications or agent execution.
"""
import hashlib
import hmac
import json
import re
import sqlite3
from pathlib import Path

from scripts.trama_t1_events import Ledger

MAX_EVENT_BYTES = 1024 * 1024


def ingest_signed(policy, body, signature, event_type, secret, ledger, source):
    """Verify raw bytes before JSON decoding or any source read. No implicit delivery."""
    if not isinstance(secret, bytes) or len(secret) < 32:
        raise ValueError("WEBHOOK_SECRET_NOT_CONFIGURED")
    if (event_type != "workflow_run" or not isinstance(body, bytes)
            or len(body) > MAX_EVENT_BYTES or not isinstance(signature, str)
            or not re.fullmatch(r"sha256=[0-9a-f]{64}", signature)):
        return {"status": "REJECTED_EVENT"}
    expected = "sha256=" + hmac.new(secret, body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        return {"status": "REJECTED_EVENT"}
    try:
        event = json.loads(body)
    except (ValueError, UnicodeError, RecursionError):
        return {"status": "REJECTED_EVENT"}
    if not isinstance(event, dict):
        return {"status": "REJECTED_EVENT"}
    # Receipts are not accepted from the webhook. Unknown remains unknown.
    return ledger.ingest(policy, event, source)


def deliver_local(ledger_path, inbox_path, limit=20):
    """Explicit, bounded transfer to a separate SQLite inbox, not external delivery.
    One transaction per database: inbox commit first, then source receipt.
    A crash between commits is safe because the inbox key is stable and unique.
    """
    if type(limit) is not int or not 1 <= limit <= 100:
        raise ValueError("INVALID_DELIVERY_LIMIT")
    ledger_path, inbox_path = Path(ledger_path), Path(inbox_path)
    if ledger_path.resolve() == inbox_path.resolve() or (inbox_path.exists() and ledger_path.exists() and ledger_path.samefile(inbox_path)):
        raise ValueError("INBOX_MUST_BE_SEPARATE")
    if not ledger_path.is_file():
        return {"status": "NO_LEDGER", "delivered": 0}
    source = sqlite3.connect(ledger_path, timeout=5)
    try:
        with source:
            source.execute("BEGIN IMMEDIATE")
            source.execute("CREATE TABLE IF NOT EXISTS t1_delivery_receipts (outbox_id INTEGER PRIMARY KEY, digest TEXT NOT NULL)")
            source.execute("CREATE TABLE IF NOT EXISTS t1_delivery_identity (id INTEGER PRIMARY KEY CHECK(id=1), namespace TEXT NOT NULL)")
            source.execute("INSERT OR IGNORE INTO t1_delivery_identity VALUES (1, lower(hex(randomblob(16))))")
            namespace = source.execute("SELECT namespace FROM t1_delivery_identity WHERE id=1").fetchone()[0]
        with source:
            source.execute("BEGIN IMMEDIATE")
            rows = source.execute("SELECT o.id,o.payload FROM outbox o LEFT JOIN t1_delivery_receipts r ON o.id=r.outbox_id WHERE r.outbox_id IS NULL ORDER BY o.id LIMIT ?", (limit,)).fetchall()
            if not rows:
                return {"status": "LOCAL_INBOX", "delivered": 0}
            target = sqlite3.connect(inbox_path, timeout=5)
            try:
                with target:
                    target.execute("BEGIN IMMEDIATE")
                    target.execute("CREATE TABLE IF NOT EXISTS inbox (delivery_key TEXT PRIMARY KEY, payload TEXT NOT NULL, digest TEXT NOT NULL)")
                    receipts = []
                    for row_id, payload in rows:
                        digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
                        key = f"{namespace}:{row_id}"
                        target.execute("INSERT OR IGNORE INTO inbox VALUES (?,?,?)", (key, payload, digest))
                        if target.execute("SELECT payload,digest FROM inbox WHERE delivery_key=?", (key,)).fetchone() != (payload, digest):
                            raise ValueError("DELIVERY_CONFLICT")
                        receipts.append((row_id, digest))
                # Target is committed at this point; only then acknowledge the outbox.
                source.executemany("INSERT INTO t1_delivery_receipts VALUES (?,?)", receipts)
            finally:
                target.close()
            return {"status": "LOCAL_INBOX", "delivered": len(rows)}
    finally:
        source.close()
