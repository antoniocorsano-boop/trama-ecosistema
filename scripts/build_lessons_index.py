#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = Path(__file__).resolve().parent
EVENTS_PATH = ROOT / "status/project-knowledge-events.json"
LESSONS_ROOT = ROOT / "docs/knowledge/lessons"
CANONICAL_ROOT = LESSONS_ROOT / "canonical"
JSON_INDEX_PATH = LESSONS_ROOT / "LESSONS_INDEX.json"
MARKDOWN_INDEX_PATH = LESSONS_ROOT / "LESSONS_INDEX.md"
INDEX_SCHEMA_VERSION = "trama.lessons-index/v1"

if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from lesson_engine_common import LESSON_INDEXABLE_STATUSES, is_lessons_engine_event


class LessonIndexError(ValueError):
    pass


def _fail(code: str, detail: str | None = None) -> None:
    raise LessonIndexError(code if detail is None else f"{code}: {detail}")


def _lesson_events(events: dict) -> list[dict]:
    if not isinstance(events, dict) or not isinstance(events.get("events", []), list):
        _fail("PROJECT_KNOWLEDGE_EVENTS_INVALID")

    selected: list[dict] = []
    seen: set[str] = set()
    for event in events.get("events", []):
        if not is_lessons_engine_event(event):
            continue
        lesson = event["lesson"]
        lesson_id = lesson["lessonId"].strip()
        if lesson_id in seen:
            _fail("DUPLICATE_LESSON_ID", lesson_id)
        seen.add(lesson_id)
        if event.get("status") not in LESSON_INDEXABLE_STATUSES:
            _fail("LESSON_STATUS_INVALID", f"{lesson_id}:{event.get('status')}")
        selected.append(event)
    return selected


def _canonical_documents(lesson_root: Path) -> dict[str, Path]:
    if not lesson_root.exists():
        return {}
    if not lesson_root.is_dir():
        _fail("CANONICAL_LESSON_ROOT_INVALID", str(lesson_root))

    documents: dict[str, Path] = {}
    for path in sorted(lesson_root.glob("*.md"), key=lambda item: item.name):
        lesson_id = path.stem
        if lesson_id in documents:
            _fail("DUPLICATE_CANONICAL_LESSON_DOCUMENT", lesson_id)
        documents[lesson_id] = path
    return documents


def _source_repository(source_refs: list[dict], lesson_id: str) -> str:
    for ref in source_refs:
        if isinstance(ref, dict) and isinstance(ref.get("repository"), str) and ref["repository"]:
            return ref["repository"]
    _fail("LESSON_SOURCE_REPOSITORY_MISSING", lesson_id)


def _entry(event: dict) -> dict:
    lesson = event["lesson"]
    lesson_id = lesson["lessonId"].strip()
    source_refs = event.get("sourceRefs")
    if not isinstance(source_refs, list) or not source_refs:
        _fail("LESSON_SOURCE_REFS_MISSING", lesson_id)

    supersedes = lesson.get("supersedes", [])
    if not isinstance(supersedes, list) or any(not isinstance(item, str) or not item for item in supersedes):
        _fail("LESSON_SUPERSESSION_INVALID", lesson_id)

    canonical_document = lesson.get("canonicalDocument")
    if not isinstance(canonical_document, str) or not canonical_document:
        _fail("CANONICAL_DOCUMENT_REF_MISSING", lesson_id)

    status = event["status"]
    return {
        "lessonId": lesson_id,
        "title": lesson.get("title", lesson_id),
        "status": status,
        "active": status == "CURRENT",
        "category": lesson.get("category"),
        "scope": lesson.get("scope"),
        "priority": lesson.get("priority"),
        "subjects": deepcopy(lesson.get("subjects", [])),
        "fingerprint": lesson.get("fingerprint"),
        "causalStatus": lesson.get("causalStatus"),
        "sourceRepository": _source_repository(source_refs, lesson_id),
        "sourceRefs": deepcopy(source_refs),
        "canonicalDocument": canonical_document,
        "supersedes": deepcopy(supersedes),
        "humanDecisionRef": lesson.get("humanDecisionRef"),
    }


def build_index(events: dict, lesson_root: Path) -> dict:
    """Build a deterministic, non-authoritative projection of canonical lessons."""
    lesson_events = _lesson_events(events)
    documents = _canonical_documents(lesson_root)
    event_ids = {event["lesson"]["lessonId"].strip() for event in lesson_events}

    for lesson_id in sorted(event_ids):
        if lesson_id not in documents:
            _fail("CANONICAL_LESSON_DOCUMENT_MISSING", lesson_id)

    for lesson_id in sorted(documents):
        if lesson_id not in event_ids:
            _fail("ORPHAN_CANONICAL_LESSON_DOCUMENT", lesson_id)

    entries = sorted((_entry(event) for event in lesson_events), key=lambda item: item["lessonId"])
    return {"schemaVersion": INDEX_SCHEMA_VERSION, "lessons": entries}


def render_markdown(index: dict) -> str:
    if not isinstance(index, dict) or index.get("schemaVersion") != INDEX_SCHEMA_VERSION:
        _fail("LESSONS_INDEX_INVALID")
    lessons = index.get("lessons")
    if not isinstance(lessons, list):
        _fail("LESSONS_INDEX_INVALID")

    ordered = sorted(lessons, key=lambda item: item.get("lessonId", ""))
    lines = [
        "# TRAMA Lessons Index",
        "",
        "Generated projection of canonical Lessons Engine `FAILURE_LEARNING` events. Project Knowledge remains authoritative.",
        "",
    ]
    if not ordered:
        lines.extend(["No canonical Lessons Engine lessons are indexed.", ""])
        return "\n".join(lines)

    lines.extend([
        "| Lesson | Status | Active | Scope | Category | Canonical document |",
        "| --- | --- | --- | --- | --- | --- |",
    ])
    for item in ordered:
        active = "yes" if item.get("active") else "no"
        lines.append(
            f"| `{item.get('lessonId', '')}` — {item.get('title', '')} | {item.get('status', '')} | {active} | "
            f"{item.get('scope') or ''} | {item.get('category') or ''} | `{item.get('canonicalDocument', '')}` |"
        )
    lines.append("")
    return "\n".join(lines)


def _json_text(index: dict) -> str:
    return json.dumps(index, ensure_ascii=False, indent=2) + "\n"


def _load_events() -> dict:
    return json.loads(EVENTS_PATH.read_text(encoding="utf-8"))


def _generated_outputs() -> tuple[str, str]:
    index = build_index(_load_events(), CANONICAL_ROOT)
    return _json_text(index), render_markdown(index)


def _write_outputs(json_text: str, markdown_text: str) -> None:
    LESSONS_ROOT.mkdir(parents=True, exist_ok=True)
    CANONICAL_ROOT.mkdir(parents=True, exist_ok=True)
    JSON_INDEX_PATH.write_text(json_text, encoding="utf-8")
    MARKDOWN_INDEX_PATH.write_text(markdown_text, encoding="utf-8")


def _check_output(path: Path, expected: str) -> None:
    if not path.is_file():
        _fail("LESSONS_INDEX_PROJECTION_MISSING", str(path.relative_to(ROOT)))
    actual = path.read_text(encoding="utf-8")
    if actual != expected:
        _fail("LESSONS_INDEX_DRIFT", str(path.relative_to(ROOT)))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Build or verify the deterministic TRAMA canonical lessons index.")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--write", action="store_true", help="Write LESSONS_INDEX.json and LESSONS_INDEX.md")
    mode.add_argument("--check", action="store_true", help="Fail if committed index projections drift from Project Knowledge")
    args = parser.parse_args(argv)

    try:
        json_text, markdown_text = _generated_outputs()
        if args.write:
            _write_outputs(json_text, markdown_text)
            print("LESSONS_INDEX_WRITTEN")
        elif args.check:
            _check_output(JSON_INDEX_PATH, json_text)
            _check_output(MARKDOWN_INDEX_PATH, markdown_text)
            print("LESSONS_INDEX_CHECK_PASS")
        else:
            sys.stdout.write(json_text)
    except (OSError, json.JSONDecodeError, LessonIndexError) as exc:
        print(f"LESSONS_INDEX_BLOCKED: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
