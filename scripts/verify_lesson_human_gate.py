#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "config/lesson-governance.json"
_HEAD_RE = re.compile(r"^[0-9a-f]{40}$")


class LessonGateError(ValueError):
    pass


def _fail(code: str, detail: str | None = None) -> None:
    raise LessonGateError(code if detail is None else f"{code}: {detail}")


def _validate_config(config: dict) -> dict:
    if not isinstance(config, dict) or config.get("schemaVersion") != "trama.lesson-governance/v1":
        _fail("LESSON_GOVERNANCE_CONFIG_INVALID", "schemaVersion")
    reviewers = config.get("authorizedHumanReviewers")
    if not isinstance(reviewers, list) or not reviewers or any(not isinstance(x, str) or not x for x in reviewers):
        _fail("LESSON_GOVERNANCE_CONFIG_INVALID", "authorizedHumanReviewers")
    kinds = config.get("allowedDecisionKinds")
    if kinds != ["PR_REVIEW_APPROVAL", "PR_EXPLICIT_DECISION"]:
        _fail("LESSON_GOVERNANCE_CONFIG_INVALID", "allowedDecisionKinds")
    if config.get("explicitDecisionToken") != "APPROVE_CANONICAL":
        _fail("LESSON_GOVERNANCE_CONFIG_INVALID", "explicitDecisionToken")
    if config.get("autoMergeAllowed") is not False:
        _fail("LESSON_GOVERNANCE_CONFIG_INVALID", "autoMergeAllowed")
    binding = config.get("proposalBinding")
    if not isinstance(binding, dict):
        _fail("LESSON_GOVERNANCE_CONFIG_INVALID", "proposalBinding")
    pr = binding.get("pullRequest")
    head = binding.get("headSha")
    if isinstance(pr, bool) or not isinstance(pr, int) or pr < 1:
        _fail("LESSON_GOVERNANCE_CONFIG_INVALID", "proposalBinding.pullRequest")
    if not isinstance(head, str) or _HEAD_RE.fullmatch(head) is None:
        _fail("LESSON_GOVERNANCE_CONFIG_INVALID", "proposalBinding.headSha")
    return config


def _is_human(actor: object, authorized: set[str]) -> bool:
    return (
        isinstance(actor, str)
        and bool(actor)
        and actor in authorized
        and not actor.casefold().endswith("[bot]")
    )


def _is_exact_binding(artifact: dict, binding: dict) -> bool:
    return (
        artifact.get("pullRequest") == binding.get("pullRequest")
        and artifact.get("headSha") == binding.get("headSha")
    )


def _normalize_decision(artifact: dict) -> dict:
    return {
        "decisionKind": artifact["kind"],
        "reviewer": artifact["actor"],
        "humanDecisionRef": artifact["decisionRef"],
        "pullRequest": artifact["pullRequest"],
        "headSha": artifact["headSha"],
        "decidedAt": artifact["decidedAt"],
    }


def verify_human_gate(decision_artifacts: list[dict], config: dict) -> dict:
    """Return one authorized exact-head-bound human decision or fail closed."""
    _validate_config(config)
    if not isinstance(decision_artifacts, list):
        _fail("HUMAN_DECISION_REQUIRED")

    authorized = set(config["authorizedHumanReviewers"])
    allowed = set(config["allowedDecisionKinds"])
    binding = config["proposalBinding"]
    expected_token = config["explicitDecisionToken"]

    for artifact in decision_artifacts:
        if not isinstance(artifact, dict):
            continue
        kind = artifact.get("kind")
        actor = artifact.get("actor")
        if kind not in allowed or not _is_human(actor, authorized):
            continue
        if not _is_exact_binding(artifact, binding):
            continue
        if not isinstance(artifact.get("decisionRef"), str) or not artifact.get("decisionRef"):
            continue
        if not isinstance(artifact.get("decidedAt"), str) or not artifact.get("decidedAt"):
            continue

        if kind == "PR_REVIEW_APPROVAL" and artifact.get("state") == "APPROVED":
            return _normalize_decision(artifact)
        if kind == "PR_EXPLICIT_DECISION" and artifact.get("token") == expected_token:
            return _normalize_decision(artifact)

    _fail("HUMAN_DECISION_REQUIRED")


def _load_json(path: Path) -> dict | list:
    return json.loads(path.read_text(encoding="utf-8"))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Verify the exact-head-bound human GitHub decision required to promote a TRAMA lesson."
    )
    parser.add_argument("--artifacts", type=Path, help="JSON list of normalized GitHub decision artifacts")
    parser.add_argument("--pull-request", type=int, help="Candidate pull request number")
    parser.add_argument("--head-sha", help="Exact candidate head SHA")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG, help="Static lesson governance config")
    args = parser.parse_args(argv)

    if args.artifacts is None or args.pull_request is None or args.head_sha is None:
        parser.error("--artifacts, --pull-request and --head-sha are required for verification")

    try:
        config_path = args.config if args.config.is_absolute() else ROOT / args.config
        artifact_path = args.artifacts if args.artifacts.is_absolute() else ROOT / args.artifacts
        static_config = _load_json(config_path)
        if not isinstance(static_config, dict):
            _fail("LESSON_GOVERNANCE_CONFIG_INVALID")
        runtime_config = deepcopy(static_config)
        runtime_config["proposalBinding"] = {
            "pullRequest": args.pull_request,
            "headSha": args.head_sha,
        }
        artifacts = _load_json(artifact_path)
        decision = verify_human_gate(artifacts, runtime_config)  # type: ignore[arg-type]
    except (OSError, json.JSONDecodeError, LessonGateError) as exc:
        print(f"LESSON_HUMAN_GATE_BLOCKED: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(decision, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
