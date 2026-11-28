#!/usr/bin/env python3
"""Offline, advisory T1/T2 projection. No GitHub writes, network, or agent calls.
Inputs are normalized observations, not authority. A live adapter is a separate gate.
"""
import argparse
import json
import re
from pathlib import Path

from scripts.validate_cc_mss_stage_c1 import CANON_VERSION, digest

HEX40 = re.compile(r"[0-9a-f]{40}")
REVIEW_STATES = {"PASS", "FINDING", "PENDING", "QUOTA_BLOCKED", "MISSING", "UNKNOWN"}
GATE_STATES = {"PASS", "FAIL", "FINDING", "PENDING", "BLOCKED_INPUT", "BLOCKED_ENVIRONMENT", "SKIP", "UNKNOWN"}


def positive(x):
    return type(x) is int and x > 0


def exact_sha(x):
    return isinstance(x, str) and HEX40.fullmatch(x) is not None


def run_state(row):
    if row.get("status") in {"queued", "in_progress", "waiting", "requested", "pending"}:
        return "IN_PROGRESS" if row.get("conclusion") is None else "UNKNOWN"
    if row.get("status") != "completed":
        return "UNKNOWN"
    return {"success": "PASS", "failure": "FAIL", "timed_out": "FAIL", "action_required": "BLOCKED", "cancelled": "CANCELLED", "skipped": "SKIP", "neutral": "NEUTRAL", "stale": "UNKNOWN"}.get(row.get("conclusion"), "UNKNOWN")


def evaluate(policy, snapshot, previous_digest=None):
    """Return deterministic projection. An untrusted or incomplete source fails closed."""
    if not isinstance(policy, dict) or not isinstance(snapshot, dict):
        raise ValueError("INVALID_INPUT")
    repo, pr = policy["repository"], policy["pullRequest"]
    expected = policy["workflowIds"]
    gates = policy["gates"]
    if not isinstance(repo, str) or not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repo) or not positive(pr):
        raise ValueError("INVALID_POLICY_SUBJECT")
    if not isinstance(expected, list) or not expected or any(not positive(x) for x in expected) or len(set(expected)) != len(expected):
        raise ValueError("INVALID_WORKFLOW_POLICY")
    if not isinstance(gates, dict) or not gates or any(v not in {"technical", "human", "input", "functional"} for v in gates.values()):
        raise ValueError("INVALID_GATE_POLICY")
    if not isinstance(policy.get("reviewActor"), str) or not policy["reviewActor"].strip():
        raise ValueError("INVALID_REVIEW_POLICY")
    head = snapshot.get("anchorStart")
    result = {"schemaVersion": "trama-t1-advisory/v1", "repository": repo, "pullRequest": pr,
              "head": head if exact_sha(head) else None, "collection": "UNKNOWN", "checks": [],
              "review": {"state": "UNKNOWN"}, "gates": [], "proposals": [],
              "executionAuthorized": False, "mergeAuthorized": False, "publicationAuthorized": False}

    def finish():
        result["semanticDigest"] = digest({"canonicalizationVersion": CANON_VERSION, "projection": result})
        result["notify"] = result["semanticDigest"] != previous_digest
        return result

    def stop(reason):
        result["collection"] = reason
        result["proposals"] = ["RECONCILE_EVIDENCE"]
        return finish()

    if snapshot.get("repository") != repo or snapshot.get("pullRequest") != pr:
        return stop("SUBJECT_MISMATCH")
    if not exact_sha(head) or head != snapshot.get("anchorEnd"):
        return stop("HEAD_INVALIDATED")
    if snapshot.get("availability") != "AVAILABLE" or snapshot.get("fresh") is not True:
        return stop("SOURCE_UNAVAILABLE_OR_STALE")
    runs = snapshot.get("runs")
    if not isinstance(runs, list) or len(runs) > 500 or snapshot.get("complete") is not True or type(snapshot.get("totalCount")) is not int or snapshot["totalCount"] != len(runs):
        return stop("INCOMPLETE_COLLECTION")
    if snapshot.get("prState") not in {"OPEN", "DRAFT"}:
        return stop("PR_NOT_ACTIVE")
    seen = {}
    run_workflows = {}
    for row in runs:
        if not isinstance(row, dict) or not positive(row.get("workflowId")) or not positive(row.get("runId")) or not positive(row.get("attempt")):
            return stop("MALFORMED_RUN")
        if row.get("head") != head or row.get("pullRequest") != pr or row.get("repository") != repo or row.get("event") != "pull_request":
            return stop("RUN_IDENTITY_MISMATCH")
        key = (row["runId"], row["attempt"])
        if row["runId"] in run_workflows and run_workflows[row["runId"]] != row["workflowId"]:
            return stop("CONFLICTING_RUN")
        run_workflows[row["runId"]] = row["workflowId"]
        if not isinstance(row.get("status"), str) or (row.get("conclusion") is not None and not isinstance(row["conclusion"], str)):
            return stop("MALFORMED_RUN")
        facts = (row["workflowId"], run_state(row))
        if key in seen and seen[key] != facts:
            return stop("CONFLICTING_RUN")
        seen[key] = facts
    result["collection"] = "CONSISTENT"
    for wid in sorted(expected):
        matching = [(rid, attempt, state) for (rid, attempt), (w, state) in seen.items() if w == wid]
        if not matching:
            result["checks"].append({"workflowId": wid, "state": "MISSING"})
            continue
        # A newer run supersedes a previous run; within the same run the last attempt wins.
        # Conflicting multiple run IDs are not ordered by numeric ID (no API timestamp proof).
        if len({r for r, _, _ in matching}) != 1:
            result["checks"].append({"workflowId": wid, "state": "AMBIGUOUS"})
            continue
        rid, attempt, state = max(matching, key=lambda x: x[1])
        result["checks"].append({"workflowId": wid, "runId": rid, "attempt": attempt, "state": state})
    review = snapshot.get("review")
    if isinstance(review, dict) and review.get("head") == head and review.get("actor") == policy.get("reviewActor") and positive(review.get("receiptId")) and isinstance(review.get("state"), str) and review["state"] in REVIEW_STATES:
        result["review"] = {"state": review["state"], "receiptId": review["receiptId"]}
    evidence = snapshot.get("gates")
    evidence = evidence if isinstance(evidence, dict) else {}
    for name, kind in sorted(gates.items()):
        item = evidence.get(name)
        if not isinstance(item, dict) or item.get("head") != head or not isinstance(item.get("reference"), str) or not item["reference"].strip() or not isinstance(item.get("state"), str) or item["state"] not in GATE_STATES:
            result["gates"].append({"id": name, "kind": kind, "state": "UNKNOWN"})
        else:
            state = item["state"]
            # This offline projection cannot establish or grant human approval.
            if kind == "human" and state == "PASS":
                state = "UNKNOWN"
            result["gates"].append({"id": name, "kind": kind, "state": state, "reference": item["reference"]})
    checks = {x["state"] for x in result["checks"]}
    gs = result["gates"]
    rv = result["review"]["state"]
    p = result["proposals"]
    if "FAIL" in checks or any(g["state"] == "FAIL" for g in gs):
        p.append("DIAGNOSE_FAILURE")
    if rv == "FINDING" or any(g["state"] == "FINDING" for g in gs):
        p.append("PROPOSE_BOUNDED_REPAIR")
    if checks & {"MISSING", "AMBIGUOUS", "UNKNOWN", "NEUTRAL", "SKIP", "CANCELLED", "BLOCKED"} or any(g["state"] == "UNKNOWN" or (g["state"] == "SKIP" and g["kind"] != "input") for g in gs):
        p.append("RECONCILE_EVIDENCE")
    if "IN_PROGRESS" in checks:
        p.append("WAIT_QUALIFICATION")
    if rv == "QUOTA_BLOCKED":
        p.append("WAIT_AGENT_QUOTA")
    elif rv in {"UNKNOWN", "MISSING"}:
        p.append("ACQUIRE_EXACT_REVIEW")
    elif rv == "PENDING":
        p.append("WAIT_REVIEW")
    if any(g["state"] == "BLOCKED_INPUT" or (g["kind"] == "input" and g["state"] == "SKIP") for g in gs):
        p.append("REQUEST_MISSING_INPUT")
    if any(g["state"] == "BLOCKED_ENVIRONMENT" for g in gs):
        p.append("RESOLVE_ENVIRONMENT")
    if any(g["kind"] == "human" and g["state"] != "PASS" for g in gs):
        p.append("REQUEST_HUMAN_REVIEW")
    if any(g["kind"] != "human" and g["state"] == "PENDING" for g in gs):
        p.append("WAIT_EVIDENCE")
    if not p:
        p.append("REQUEST_AUTHORITY_DECISION")
    return finish()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("policy", type=Path)
    parser.add_argument("snapshot", type=Path)
    parser.add_argument("--previous-digest")
    args = parser.parse_args()
    result = evaluate(json.loads(args.policy.read_text()), json.loads(args.snapshot.read_text()), args.previous_digest)
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
