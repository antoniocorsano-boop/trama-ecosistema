#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = Path(__file__).resolve().parent
EVENTS_PATH = ROOT / "status/project-knowledge-events.json"
_HEAD_RE = re.compile(r"^[0-9a-f]{40}$")
_ALLOWED_DECISION_KINDS = {"PR_REVIEW_APPROVAL", "PR_EXPLICIT_DECISION"}

if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import validate_lesson_proposal as proposal_validator


class LessonPromotionError(ValueError):
    pass


def _fail(code: str, detail: str | None = None) -> None:
    raise LessonPromotionError(code if detail is None else f"{code}: {detail}")


def _validated_decision(decision: dict) -> dict:
    if not isinstance(decision, dict) or not decision:
        _fail("HUMAN_GATE_REQUIRED")
    required = {
        "decisionKind",
        "reviewer",
        "humanDecisionRef",
        "pullRequest",
        "headSha",
        "decidedAt",
    }
    if required - set(decision):
        _fail("HUMAN_GATE_REQUIRED")
    if decision.get("decisionKind") not in _ALLOWED_DECISION_KINDS:
        _fail("HUMAN_GATE_REQUIRED")
    if not isinstance(decision.get("reviewer"), str) or not decision["reviewer"]:
        _fail("HUMAN_GATE_REQUIRED")
    if decision["reviewer"].casefold().endswith("[bot]"):
        _fail("HUMAN_GATE_REQUIRED")
    if not isinstance(decision.get("humanDecisionRef"), str) or not decision["humanDecisionRef"]:
        _fail("HUMAN_GATE_REQUIRED")
    pr = decision.get("pullRequest")
    if isinstance(pr, bool) or not isinstance(pr, int) or pr < 1:
        _fail("HUMAN_GATE_REQUIRED")
    head = decision.get("headSha")
    if not isinstance(head, str) or _HEAD_RE.fullmatch(head) is None:
        _fail("HUMAN_GATE_REQUIRED")
    if not isinstance(decision.get("decidedAt"), str) or not decision["decidedAt"]:
        _fail("HUMAN_GATE_REQUIRED")
    return deepcopy(decision)


def canonical_document_path(lesson_id: str) -> str:
    return f"docs/knowledge/lessons/canonical/{lesson_id}.md"


def _event_id(lesson_id: str) -> str:
    return f"TRAMA-EVT-LESSON-{lesson_id}"


def _event_ids_for_superseded_lessons(lesson_ids: list[str]) -> list[str]:
    return [_event_id(lesson_id) for lesson_id in lesson_ids]


def build_failure_learning_event(proposal: dict, decision: dict) -> dict:
    """Pure candidate-to-Project-Knowledge transformation after a verified human gate."""
    checked_decision = _validated_decision(decision)
    try:
        validated = proposal_validator.validate_proposal(deepcopy(proposal))
    except proposal_validator.LessonProposalError as exc:
        _fail("LESSON_PROPOSAL_INVALID", str(exc))

    lesson_id = validated["lessonId"]
    subjects = deepcopy(validated["subjects"])
    return {
        "eventId": _event_id(lesson_id),
        "type": "FAILURE_LEARNING",
        "subject": subjects[0],
        "statement": validated["learnedPrinciple"],
        "status": "CURRENT",
        "rationale": validated["proposedRule"],
        "sourceRefs": deepcopy(proposal["sourceRefs"]),
        "validFrom": checked_decision["decidedAt"],
        "supersedes": _event_ids_for_superseded_lessons(validated["supersedes"]),
        "invalidatedBy": [],
        "freshness": {"policy": "UNTIL_CHANGE"},
        "lesson": {
            "lessonId": lesson_id,
            "title": validated["title"],
            "category": validated["category"],
            "scope": validated["scope"],
            "priority": validated["priority"],
            "subjects": subjects,
            "fingerprint": validated["fingerprint"],
            "causalStatus": validated["causalStatus"],
            "humanDecisionRef": checked_decision["humanDecisionRef"],
            "humanDecisionKind": checked_decision["decisionKind"],
            "humanDecisionHead": checked_decision["headSha"],
            "humanReviewer": checked_decision["reviewer"],
            "canonicalDocument": canonical_document_path(lesson_id),
            "supersedes": deepcopy(validated["supersedes"]),
        },
    }


def _source_ref_lines(source_refs: list[dict]) -> list[str]:
    lines: list[str] = []
    for source in source_refs:
        parts = [source.get("repository", "unknown")]
        if source.get("pullRequest") is not None:
            parts.append(f"PR #{source['pullRequest']}")
        if source.get("exactHead"):
            parts.append(f"exact SHA `{source['exactHead']}`")
        if source.get("workflowRun"):
            parts.append(f"run `{source['workflowRun']}`")
        if source.get("evidenceKind"):
            parts.append(str(source["evidenceKind"]))
        lines.append("- " + " · ".join(parts))
    return lines


def render_canonical_markdown(proposal: dict, decision: dict) -> str:
    """Pure human-readable projection of the same approved lesson."""
    event = build_failure_learning_event(proposal, decision)
    lesson = event["lesson"]
    source_lines = _source_ref_lines(event["sourceRefs"])
    related = proposal.get("relatedLessons", [])
    supersedes = proposal.get("supersedes", [])

    lines = [
        f"# {lesson['lessonId']} — {lesson['title']}",
        "",
        "**Status:** CANONICAL  ",
        f"**Category:** {lesson['category']}  ",
        f"**Scope:** {lesson['scope']}  ",
        f"**Priority:** {lesson['priority']}  ",
        f"**Causal status:** {lesson['causalStatus']}  ",
        f"**Fingerprint:** `{lesson['fingerprint']}`  ",
        f"**Human decision:** `{lesson['humanDecisionRef']}`  ",
        f"**Decision head:** `{lesson['humanDecisionHead']}`",
        "",
        "## Observed problem",
        "",
        proposal["observedProblem"],
        "",
        "## Previous behavior",
        "",
        proposal["previousBehavior"],
        "",
        "## Learned principle",
        "",
        proposal["learnedPrinciple"],
        "",
        "## Canonical rule",
        "",
        proposal["proposedRule"],
        "",
        "## Evidence",
        "",
        *source_lines,
        "",
        "## Subjects",
        "",
        *[f"- `{subject}`" for subject in proposal["subjects"]],
        "",
        "## Relations",
        "",
        f"- Related lessons: {', '.join(related) if related else 'none'}",
        f"- Supersedes: {', '.join(supersedes) if supersedes else 'none'}",
        "",
        "## Governance",
        "",
        "This lesson became canonical only after an exact-head-bound human GitHub decision. CI success alone is not approval, and this document does not authorize merge, deploy or runtime execution.",
        "",
    ]
    return "\n".join(lines)


def _load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def _existing_active_lesson(events: dict, lesson_id: str) -> dict | None:
    expected_event_id = _event_id(lesson_id)
    for event in events.get("events", []):
        if not isinstance(event, dict):
            continue
        lesson = event.get("lesson")
        if (
            event.get("type") == "FAILURE_LEARNING"
            and event.get("status") == "CURRENT"
            and (
                event.get("eventId") == expected_event_id
                or (isinstance(lesson, dict) and lesson.get("lessonId") == lesson_id)
            )
        ):
            return event
    return None


def assert_promotion_target_available(proposal: dict, events: dict) -> None:
    existing = _existing_active_lesson(events, proposal.get("lessonId", ""))
    if existing is not None:
        _fail("ACTIVE_LESSON_ALREADY_EXISTS", proposal.get("lessonId", ""))


def _write_outputs(proposal: dict, decision: dict, event: dict, markdown: str) -> None:
    events = _load_json(EVENTS_PATH)
    assert_promotion_target_available(proposal, events)
    events.setdefault("events", []).append(event)
    events["updatedAt"] = decision["decidedAt"]

    lesson_path = ROOT / canonical_document_path(proposal["lessonId"])
    lesson_path.parent.mkdir(parents=True, exist_ok=True)
    if lesson_path.exists():
        _fail("CANONICAL_DOCUMENT_ALREADY_EXISTS", str(lesson_path.relative_to(ROOT)))

    lesson_path.write_text(markdown, encoding="utf-8")
    EVENTS_PATH.write_text(json.dumps(events, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Render or explicitly materialize a human-approved TRAMA lesson promotion."
    )
    parser.add_argument("proposal", type=Path, nargs="?", help="Lesson proposal JSON")
    parser.add_argument("--decision", type=Path, help="Normalized verified human-decision JSON")
    parser.add_argument("--write", action="store_true", help="Write canonical document and Project Knowledge event")
    args = parser.parse_args(argv)

    if args.proposal is None or args.decision is None:
        parser.error("proposal and --decision are required")

    proposal_path = args.proposal if args.proposal.is_absolute() else ROOT / args.proposal
    decision_path = args.decision if args.decision.is_absolute() else ROOT / args.decision
    try:
        proposal = _load_json(proposal_path)
        decision = _load_json(decision_path)
        event = build_failure_learning_event(proposal, decision)
        markdown = render_canonical_markdown(proposal, decision)
        if args.write:
            _write_outputs(proposal, decision, event, markdown)
    except (OSError, json.JSONDecodeError, LessonPromotionError) as exc:
        print(f"LESSON_PROMOTION_BLOCKED: {exc}", file=sys.stderr)
        return 1

    if args.write:
        print(f"LESSON_PROMOTION_MATERIALIZED lessonId={proposal['lessonId']}")
    else:
        print(json.dumps({"event": event, "markdown": markdown}, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
