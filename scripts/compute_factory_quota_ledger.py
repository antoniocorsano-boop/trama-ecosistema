"""Single-host synthetic quota accounting. Never executes or authorizes compute."""
import re
import sqlite3
from contextlib import contextmanager

from scripts.compile_compute_factory_handoff import digest

UNITS = {"LAB_UNIT", "NEURON_SIM", "GPU_WEIGHTED_SECOND_SIM", "CPU_SECOND_SIM"}
HEX = re.compile(r"[0-9a-f]{64}")
NAME = re.compile(r"[A-Za-z0-9._:-]{1,100}")

def check(ok, reason):
    if not ok:
        raise ValueError(reason)

def number(value, minimum=0):
    return type(value) is int and minimum <= value <= 10**12

def sha(value):
    return isinstance(value, str) and HEX.fullmatch(value) is not None

class QuotaLedger:
    """Fixed synthetic buckets; caller-supplied time is for deterministic tests only."""
    def __init__(self, path):
        self.db = sqlite3.connect(path, timeout=15, isolation_level=None)
        self.db.execute("PRAGMA busy_timeout=15000")
        self.db.execute("PRAGMA foreign_keys=ON")
        self.db.execute("PRAGMA synchronous=FULL")
        self.db.executescript("""
        CREATE TABLE IF NOT EXISTS cf_bucket (
          id TEXT PRIMARY KEY, unit TEXT NOT NULL,
          capacity INTEGER NOT NULL CHECK(capacity>=0),
          used INTEGER NOT NULL CHECK(used>=0 AND used<=capacity),
          expires INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS cf_reservation (
          id TEXT PRIMARY KEY, bucket TEXT NOT NULL REFERENCES cf_bucket(id),
          reference TEXT NOT NULL, amount INTEGER NOT NULL CHECK(amount>0),
          expiry INTEGER NOT NULL,
          state TEXT NOT NULL CHECK(state IN ('RESERVED','SIMULATED_RUNNING','SIMULATED_DONE','CANCELLED','UNCERTAIN')));
        """)
    def close(self):
        self.db.close()

    @contextmanager
    def transaction(self):
        self.db.execute("BEGIN IMMEDIATE")
        try:
            yield
            self.db.commit()
        except BaseException:
            self.db.rollback()
            raise

    def seed(self, bucket, unit, capacity, expires):
        check(isinstance(bucket, str) and bucket.startswith("synthetic:") and NAME.fullmatch(bucket),
              "synthetic bucket only")
        check(unit in UNITS and number(capacity) and number(expires, 1), "bucket contract")
        with self.transaction():
            self.db.execute("INSERT OR IGNORE INTO cf_bucket VALUES (?,?,?,0,?)",
                            (bucket, unit, capacity, expires))
            existing = self.db.execute("SELECT unit,capacity,expires FROM cf_bucket WHERE id=?",
                                       (bucket,)).fetchone()
            check(existing == (unit, capacity, expires), "immutable bucket")

    def balance(self, bucket):
        return self.db.execute("SELECT unit,capacity,used,expires FROM cf_bucket WHERE id=?",
                               (bucket,)).fetchone()

    def reserve(self, handoff, bucket, unit, amount, expiry, now):
        check(isinstance(handoff, dict) and handoff.get("schemaVersion") ==
              "trama.compute-factory-handoff/v0.1", "handoff version")
        for key in ("executionAuthorized", "runtimeAuthorized", "paidComputeAuthorized",
                    "publicationAuthorityGranted", "studentAuthorized", "trustedOriginVerified",
                    "liveEvidenceVerified"):
            check(handoff.get(key) is False, "offline authority")
        check(handoff.get("decision") == "REVIEW_REFERENCE_ONLY" and
              handoff.get("humanReviewRequired") is True, "review reference")
        check(handoff.get("sourceDecision") in ("PLAN_READY", "PLAN_READY_FOR_REVIEW"),
              "plan not ready for synthetic reservation")
        check(sha(handoff.get("requestDigest")), "request digest")
        ref = handoff.get("handoffDigest")
        check(sha(ref) and digest({k:v for k,v in handoff.items() if k != "handoffDigest"}) == ref,
              "reference digest")
        # A real plan is not a resource entitlement. All amounts are explicit mock inputs.
        check(number(amount, 1) and number(now) and number(expiry, 1),
              "amount or time")
        check(isinstance(bucket, str) and unit in UNITS, "bucket or unit")
        # One reservation per request digest, even if its plan reference changes.
        key = digest({"simulationRequest": handoff["requestDigest"]})
        with self.transaction():
            old = self.db.execute("SELECT bucket,amount,expiry,state,reference FROM cf_reservation WHERE id=?",
                                  (key,)).fetchone()
            # Existing identity is queryable even after expiry; never reserve again.
            if old:
                check(old[:3] == (bucket, amount, expiry) and old[4] == ref and
                      self.balance(bucket)[0] == unit, "duplicate parameters differ")
                return key, old[3]
            row = self.balance(bucket)
            check(row is not None and row[0] == unit and now < expiry <= row[3], "bucket mismatch")
            if self.db.execute("UPDATE cf_bucket SET used=used+? WHERE id=? AND used<=capacity-?",
                               (amount, bucket, amount)).rowcount != 1:
                return key, "STOP_QUOTA"
            self.db.execute("INSERT INTO cf_reservation VALUES (?,?,?,?,?,'RESERVED')",
                            (key, bucket, ref, amount, expiry))
            return key, "RESERVED"

    def transition(self, key, action, now):
        check(sha(key) and number(now), "transition identity")
        transitions = {"start_simulation": ("RESERVED", "SIMULATED_RUNNING"),
                       "finish_simulation": ("SIMULATED_RUNNING", "SIMULATED_DONE")}
        check(action in transitions, "unsupported transition")
        previous, target = transitions[action]
        with self.transaction():
            return self.db.execute(
                "UPDATE cf_reservation SET state=? WHERE id=? AND state=? AND expiry>?",
                (target, key, previous, now)).rowcount == 1

    def recover(self, now):
        check(number(now), "recovery time")
        with self.transaction():
            rows = self.db.execute(
                "SELECT id,bucket,amount,state FROM cf_reservation WHERE expiry<=? AND state IN ('RESERVED','SIMULATED_RUNNING')",
                (now,)).fetchall()
            for key,bucket,amount,state in rows:
                target = "CANCELLED" if state == "RESERVED" else "UNCERTAIN"
                self.db.execute("UPDATE cf_reservation SET state=? WHERE id=?", (target,key))
                if target == "CANCELLED":
                    self.db.execute("UPDATE cf_bucket SET used=used-? WHERE id=?", (amount,bucket))
            return len(rows)
