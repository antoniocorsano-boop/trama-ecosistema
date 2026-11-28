"""Staged T1 event adapter and local transactional outbox; no network or dispatch.
Source callbacks must be bound to an authorized, read-only collector before live use.
The event only selects a subject: it cannot supply review, gate or approval evidence.
"""
import argparse
import json
import sqlite3
from pathlib import Path

from scripts.trama_t1_evidence import evaluate, exact_sha, positive


def matches_run(row, repo, pr, head):
    if not isinstance(row, dict):
        return False
    links = row.get("pull_requests")
    return (row.get("event") == "pull_request" and row.get("head_sha") == head
            and row.get("repository", {}).get("full_name") == repo
            and row.get("head_repository", {}).get("full_name") == repo
            and isinstance(links, list) and len(links) == 1
            and links[0].get("number") == pr and links[0].get("head", {}).get("sha") == head
            and positive(row.get("id")) and positive(row.get("workflow_id"))
            and positive(row.get("run_attempt")))


def pr_anchor(row, repo, pr):
    if (row.get("number") != pr or row.get("base", {}).get("repo", {}).get("full_name") != repo
            or row.get("head", {}).get("repo", {}).get("full_name") != repo
            or row.get("state") != "open" or type(row.get("draft")) is not bool):
        raise ValueError("PR_IDENTITY_OR_STATE")
    head = row.get("head", {}).get("sha")
    if not exact_sha(head):
        raise ValueError("INVALID_PR_HEAD")
    return head, "DRAFT" if row["draft"] else "OPEN"


def collect(policy, event, source, receipts=None):
    """Use at most three bounded reads; return no projection for stale/foreign events.
    source.pr(repo, number) and source.runs(repo, head) are read-only interfaces.
    runs returns {complete: bool, data: GitHub workflow-runs response}.
    receipts are separate advisory evidence, not proof of authenticity.
    """
    repo, pr = policy["repository"], policy["pullRequest"]
    try:
        row = event.get("workflow_run", {})
        head = row.get("head_sha")
        if (event.get("action") != "completed" or event.get("repository", {}).get("full_name") != repo
                or not exact_sha(head) or not matches_run(row, repo, pr, head)
                or row.get("workflow_id") not in policy["workflowIds"] or row.get("status") != "completed"):
            return {"status": "IGNORED_EVENT"}
    except (AttributeError, TypeError, IndexError):
        return {"status": "IGNORED_EVENT"}
    try:
        start = pr_anchor(source.pr(repo, pr), repo, pr)
        if start[0] != head:
            return {"status": "STALE_EVENT"}
        page = source.runs(repo, head)
        data = page["data"]
        rows = data["workflow_runs"]
        complete = (page.get("complete") is True and isinstance(rows, list) and len(rows) <= 100
                    and type(data.get("total_count")) is int and data["total_count"] == len(rows))
        end = pr_anchor(source.pr(repo, pr), repo, pr)
        if end != start:
            return {"status": "COLLECTION_INVALIDATED"}
        if not complete:
            return {"status": "INCOMPLETE_COLLECTION"}
        if any(not matches_run(r, repo, pr, head) for r in rows):
            return {"status": "RUN_IDENTITY_MISMATCH"}
        corroborated = [r for r in rows if r["id"] == row["id"] and r["workflow_id"] == row["workflow_id"]]
        if not corroborated or not any(r["run_attempt"] == row["run_attempt"] and r.get("status") == "completed" and r.get("conclusion") == row.get("conclusion") for r in corroborated):
            return {"status": "EVENT_NOT_CORROBORATED"}
        if max(r["run_attempt"] for r in corroborated) != row["run_attempt"]:
            return {"status": "STALE_EVENT"}
        snapshot = {"repository": repo, "pullRequest": pr, "anchorStart": head, "anchorEnd": end[0],
                    "availability": "AVAILABLE", "fresh": True, "complete": True, "totalCount": len(rows),
                    "prState": start[1], "runs": [{"repository": repo, "pullRequest": pr, "head": head,
                        "event": r["event"], "workflowId": r["workflow_id"], "runId": r["id"],
                        "attempt": r["run_attempt"], "status": r.get("status"), "conclusion": r.get("conclusion")} for r in rows]}
        # Never use event bodies or issue prose as evidence. Optional receipts are an explicit separate input.
        if isinstance(receipts, dict):
            snapshot.update(review=receipts.get("review"), gates=receipts.get("gates"))
        projection = evaluate(policy, snapshot)
        if projection["collection"] != "CONSISTENT":
            return {"status": projection["collection"]}
        return {"status": "OBSERVED", "projection": projection}
    except (OSError, RuntimeError, ValueError, KeyError, TypeError, AttributeError, IndexError, StopIteration):
        return {"status": "SOURCE_UNAVAILABLE_OR_INVALID"}


class Ledger:
    """Local SQLite transaction serializes collection and change recording.
    Outbox means queued advisory, not a notification delivered or an agent dispatched.
    """
    def __init__(self, path):
        self.path = path

    def ingest(self, policy, event, source, receipts=None):
        db = sqlite3.connect(self.path, timeout=5)
        try:
            with db:
                db.execute("CREATE TABLE IF NOT EXISTS latest (subject TEXT PRIMARY KEY, digest TEXT NOT NULL)")
                db.execute("CREATE TABLE IF NOT EXISTS outbox (id INTEGER PRIMARY KEY, subject TEXT NOT NULL, payload TEXT NOT NULL)")
                db.execute("BEGIN IMMEDIATE")
                result = collect(policy, event, source, receipts)
                if result["status"] != "OBSERVED":
                    return result
                subject = json.dumps([policy["repository"], policy["pullRequest"]], separators=(",", ":"))
                projection = result["projection"]
                prior = db.execute("SELECT digest FROM latest WHERE subject=?", (subject,)).fetchone()
                projection["notify"] = not prior or prior[0] != projection["semanticDigest"]
                if projection["notify"]:
                    db.execute("INSERT INTO outbox(subject,payload) VALUES (?,?)", (subject, json.dumps(projection, sort_keys=True)))
                    db.execute("INSERT INTO latest(subject,digest) VALUES (?,?) ON CONFLICT(subject) DO UPDATE SET digest=excluded.digest", (subject, projection["semanticDigest"]))
                return result
        finally:
            db.close()

    def pending(self):
        db = sqlite3.connect(self.path)
        try:
            return [(i, json.loads(p)) for i, p in db.execute("SELECT id,payload FROM outbox ORDER BY id")]
        finally:
            db.close()


class ReplaySource:
    """Explicitly offline: reads a recorded bundle, not GitHub or environment credentials."""
    def __init__(self, bundle):
        self.anchors = iter(bundle["anchors"])
        self.page = bundle["page"]
        self.calls = []

    def pr(self, repo, number):
        self.calls.append("pr.read")
        return next(self.anchors)

    def runs(self, repo, head):
        self.calls.append("workflow.read")
        return self.page


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("policy", type=Path)
    parser.add_argument("bundle", type=Path)
    parser.add_argument("ledger", type=Path)
    args = parser.parse_args()
    policy, bundle = (json.loads(p.read_text()) for p in (args.policy, args.bundle))
    result = Ledger(args.ledger).ingest(policy, bundle["event"], ReplaySource(bundle), bundle.get("receipts"))
    print(json.dumps({"mode": "OFFLINE_REPLAY", **result}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
