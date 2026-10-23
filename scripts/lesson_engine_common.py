#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import unicodedata

DIRECT_CAUSAL_EVIDENCE_KINDS = {
    "DIRECT_EXCEPTION",
    "FAILED_ASSERTION",
    "CONTROLLED_REPRODUCTION",
}


def normalize_text(value: str) -> str:
    """Normalize human-authored lesson text for deterministic comparison."""
    text = unicodedata.normalize("NFKC", value or "")
    return " ".join(text.split()).strip().casefold()


def canonical_source_ref(ref: dict) -> str:
    return json.dumps(ref, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def direct_causal_evidence(proposal: dict) -> list[dict]:
    refs = proposal.get("sourceRefs", [])
    if not isinstance(refs, list):
        return []
    return [
        ref
        for ref in refs
        if isinstance(ref, dict)
        and ref.get("evidenceKind") in DIRECT_CAUSAL_EVIDENCE_KINDS
    ]


def lesson_fingerprint(proposal: dict) -> str:
    material = {
        "category": normalize_text(str(proposal.get("category", ""))),
        "scope": normalize_text(str(proposal.get("scope", ""))),
        "subjects": sorted(
            normalize_text(str(subject))
            for subject in proposal.get("subjects", [])
            if isinstance(subject, str) and normalize_text(subject)
        ),
        "title": normalize_text(str(proposal.get("title", ""))),
        "learnedPrinciple": normalize_text(str(proposal.get("learnedPrinciple", ""))),
        "proposedRule": normalize_text(str(proposal.get("proposedRule", ""))),
    }
    payload = json.dumps(
        material,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return "sha256:" + hashlib.sha256(payload).hexdigest()
