#!/usr/bin/env python3
from __future__ import annotations

import argparse
import fnmatch
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import NamedTuple


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_POLICY = ROOT / "governance" / "terminology" / "trama-curricolo-vocabulary-v1.json"
HUNK_RE = re.compile(r"^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@")


class Violation(NamedTuple):
    path: str
    line: int
    token: str


def load_policy(path: Path) -> dict:
    policy = json.loads(path.read_text(encoding="utf-8"))

    canonical_terms = policy.get("canonicalTerms")
    if not isinstance(canonical_terms, list) or "curricolo" not in {
        str(term).strip().lower() for term in canonical_terms
    }:
        raise ValueError("canonicalTerms must include 'curricolo'")

    forbidden_patterns = policy.get("forbiddenDomainPatterns")
    if not isinstance(forbidden_patterns, list) or not forbidden_patterns:
        raise ValueError("forbiddenDomainPatterns must be a non-empty list")
    for pattern in forbidden_patterns:
        if not isinstance(pattern, str) or not pattern.strip():
            raise ValueError("each forbiddenDomainPatterns entry must be a non-empty string")
        re.compile(pattern)

    allowlist = policy.get("legacyAllowlist")
    if not isinstance(allowlist, list):
        raise ValueError("legacyAllowlist must be a list")
    for index, entry in enumerate(allowlist):
        if not isinstance(entry, dict):
            raise ValueError(f"legacyAllowlist[{index}] must be an object")
        for key in ("path", "pattern", "reason"):
            if not isinstance(entry.get(key), str) or not entry[key].strip():
                raise ValueError(f"legacyAllowlist[{index}].{key} must be a non-empty string")
        re.compile(entry["pattern"])

    excluded_paths = policy.get("excludedPaths", [])
    if not isinstance(excluded_paths, list) or not all(isinstance(item, str) for item in excluded_paths):
        raise ValueError("excludedPaths must be a list of strings")

    return policy


def _path_matches(path: str, pattern: str) -> bool:
    return path == pattern or fnmatch.fnmatchcase(path, pattern)


def _is_excluded(path: str, policy: dict) -> bool:
    return any(_path_matches(path, pattern) for pattern in policy.get("excludedPaths", []))


def _is_allowlisted(path: str, added_text: str, policy: dict) -> bool:
    for entry in policy.get("legacyAllowlist", []):
        if _path_matches(path, entry["path"]) and re.search(entry["pattern"], added_text):
            return True
    return False


def scan_added_lines(diff_text: str, policy: dict) -> list[Violation]:
    forbidden_patterns = [re.compile(pattern) for pattern in policy["forbiddenDomainPatterns"]]
    violations: list[Violation] = []
    current_path: str | None = None
    new_line_number: int | None = None

    for raw_line in diff_text.splitlines():
        if raw_line.startswith("+++ "):
            target = raw_line[4:].strip()
            if target == "/dev/null":
                current_path = None
            elif target.startswith("b/"):
                current_path = target[2:]
            else:
                current_path = target
            new_line_number = None
            continue

        hunk_match = HUNK_RE.match(raw_line)
        if hunk_match:
            new_line_number = int(hunk_match.group(1))
            continue

        if current_path is None or new_line_number is None:
            continue

        if raw_line.startswith("+") and not raw_line.startswith("+++"):
            added_text = raw_line[1:]
            if not _is_excluded(current_path, policy) and not _is_allowlisted(current_path, added_text, policy):
                for pattern in forbidden_patterns:
                    for match in pattern.finditer(added_text):
                        violations.append(
                            Violation(path=current_path, line=new_line_number, token=match.group(0))
                        )
            new_line_number += 1
            continue

        if raw_line.startswith("-") and not raw_line.startswith("---"):
            continue

        new_line_number += 1

    return violations


def _git_diff(base: str) -> str:
    result = subprocess.run(
        ["git", "diff", "--unified=0", f"{base}...HEAD"],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"git diff failed for base {base}")
    return result.stdout


def _ref_exists(ref: str) -> bool:
    result = subprocess.run(
        ["git", "rev-parse", "--verify", "--quiet", ref],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    return result.returncode == 0


def _resolve_base(explicit_base: str | None) -> str:
    candidates = [
        explicit_base,
        os.environ.get("TRAMA_TERMINOLOGY_BASE_SHA"),
        os.environ.get("GITHUB_BASE_SHA"),
    ]
    for candidate in candidates:
        if candidate and set(candidate) != {"0"}:
            return candidate

    if _ref_exists("origin/main"):
        return "origin/main"
    if _ref_exists("HEAD^"):
        return "HEAD^"
    raise RuntimeError("unable to resolve a git base for terminology validation")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate added lines against TRAMA-TERM-01 terminology policy")
    parser.add_argument("--policy", type=Path, default=DEFAULT_POLICY)
    parser.add_argument("--base", help="Git base commit/ref used for a base...HEAD diff")
    parser.add_argument("--diff-file", type=Path, help="Read a unified diff from a file instead of invoking git")
    args = parser.parse_args(argv)

    try:
        policy = load_policy(args.policy)
        if args.diff_file:
            diff_text = args.diff_file.read_text(encoding="utf-8")
        else:
            diff_text = _git_diff(_resolve_base(args.base))
        violations = scan_added_lines(diff_text, policy)
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError, re.error) as exc:
        print(f"TRAMA curricolo vocabulary: FAIL — {exc}", file=sys.stderr)
        return 1

    if violations:
        print("TRAMA curricolo vocabulary: FAIL", file=sys.stderr)
        for violation in violations:
            print(
                f"{violation.path}:{violation.line}: forbidden legacy token '{violation.token}'",
                file=sys.stderr,
            )
        return 1

    print("TRAMA curricolo vocabulary: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
