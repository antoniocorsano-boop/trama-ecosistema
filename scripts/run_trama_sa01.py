#!/usr/bin/env python3
"""Harness provider-neutral per TRAMA-SA-01.

Non chiama TypeSafe o altri servizi esterni. Prepara gli input minimizzati,
valida il pre-gate e valuta risultati già acquisiti dal provider.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CASES_PATH = ROOT / "docs" / "pilots" / "trama-sa-01" / "cases.json"

LABELS = {"ALIGNED", "PARTIAL", "CONTRADICTORY", "INSUFFICIENT_EVIDENCE"}
REQUIRED_MANIFEST_FIELDS = {
    "manifestVersion",
    "curriculumRef",
    "curriculumVersionRef",
    "authorityState",
    "authorityReceiptRef",
    "title",
    "summary",
    "rightsStatus",
    "accessibilityStatus",
}
FORBIDDEN_PERSONAL_KEYS = {
    "studentIdentifier",
    "studentName",
    "studentEmail",
    "personId",
    "familyName",
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def canonical_digest(value: object) -> str:
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def pre_gate(case: dict) -> list[str]:
    errors: list[str] = []
    manifest = case.get("manifest")
    evidence = case.get("evidence")
    if not isinstance(manifest, dict):
        return ["manifest assente o non valido"]
    if not isinstance(evidence, dict):
        errors.append("evidence assente o non valido")
    for field in REQUIRED_MANIFEST_FIELDS:
        if not manifest.get(field):
            errors.append(f"campo obbligatorio assente: {field}")
    forbidden = sorted(FORBIDDEN_PERSONAL_KEYS.intersection(manifest))
    if forbidden:
        errors.append("chiavi di contesto personale non ammesse: " + ", ".join(forbidden))
    if isinstance(evidence, dict) and not evidence.get("objective"):
        errors.append("evidenza curricolare insufficiente: objective assente")
    if manifest.get("authorityState") != "APPROVED":
        errors.append("authorityState deve essere APPROVED nel corpus SA-01")
    return errors


def validate_cases(corpus: dict) -> list[str]:
    errors: list[str] = []
    if corpus.get("pilotId") != "TRAMA-SA-01":
        errors.append("pilotId non valido")
    policy = corpus.get("policy", {})
    if policy.get("advisoryOnly") is not True:
        errors.append("policy.advisoryOnly deve essere true")
    if policy.get("personalDataAllowed") is not False:
        errors.append("policy.personalDataAllowed deve essere false")
    if policy.get("providerRuntimeWritesAllowed") is not False:
        errors.append("policy.providerRuntimeWritesAllowed deve essere false")
    if policy.get("humanReviewRequiredForEverySemanticCase") is not True:
        errors.append("la revisione umana deve essere obbligatoria")
    if policy.get("thresholdsPrecalibrated") is not False:
        errors.append("non sono ammesse soglie precalibrate")

    ids: set[str] = set()
    cases = corpus.get("cases", [])
    if len(cases) < 12:
        errors.append("il corpus deve contenere almeno 12 casi")
    families: set[str] = set()
    for case in cases:
        cid = case.get("id", "")
        if cid in ids:
            errors.append(f"id duplicato: {cid}")
        ids.add(cid)
        families.add(case.get("family", ""))
        stage = case.get("expectedStage")
        gate_errors = pre_gate(case)
        if stage == "PRE_GATE_REJECT":
            if not gate_errors:
                errors.append(f"{cid}: atteso PRE_GATE_REJECT ma il pre-gate passa")
            if case.get("expectedSemanticLabel") is not None:
                errors.append(f"{cid}: un caso PRE_GATE_REJECT non deve avere etichetta semantica")
        elif stage == "SEMANTIC_REVIEW":
            if gate_errors:
                errors.append(f"{cid}: il pre-gate fallisce: {'; '.join(gate_errors)}")
            if case.get("expectedSemanticLabel") not in LABELS:
                errors.append(f"{cid}: expectedSemanticLabel non valida")
        else:
            errors.append(f"{cid}: expectedStage non valido")

    required_families = {
        "clear-alignment",
        "partial-formulation",
        "explicit-contradiction",
        "insufficient-evidence",
        "italian-school-lexicon",
        "ambiguous-multiple-alternatives",
        "deterministic-missing-version",
        "deterministic-personal-context",
    }
    missing = required_families - families
    if missing:
        errors.append("famiglie di prova mancanti: " + ", ".join(sorted(missing)))
    return errors


def prepare_payload(corpus: dict) -> dict:
    prepared = []
    for case in corpus["cases"]:
        if pre_gate(case):
            continue
        state = {
            "curriculumEvidence": case["evidence"],
            "publicationCandidate": case["manifest"],
        }
        prepared.append(
            {
                "caseId": case["id"],
                "stateDigest": canonical_digest(state),
                "state": state,
                "judgments": [
                    {
                        "id": "alignment",
                        "primitive": "Choice",
                        "instructions": (
                            "Valuta se publicationCandidate conserva il significato di "
                            "curriculumEvidence.objective. Non valutare autorizzazioni o pubblicabilità."
                        ),
                        "criteria": [
                            "ALIGNED",
                            "PARTIAL",
                            "CONTRADICTORY",
                            "INSUFFICIENT_EVIDENCE",
                        ],
                    },
                    {
                        "id": "claim_support",
                        "primitive": "Noul",
                        "instructions": (
                            "La sintesi in publicationCandidate.summary è sostenuta "
                            "dall'evidenza curricolare fornita, senza aggiunte sostanziali non supportate?"
                        ),
                        "criteria": {"yes": "supportata", "no": "non supportata"},
                    },
                ],
                "advisoryOnly": True,
            }
        )
    return {
        "pilotId": "TRAMA-SA-01",
        "providerContract": "PROVIDER_NEUTRAL",
        "runtimeWritesAllowed": False,
        "items": prepared,
    }


def validate_results(corpus: dict, data: dict) -> tuple[list[str], dict]:
    errors: list[str] = []
    by_id = {c["id"]: c for c in corpus["cases"] if not pre_gate(c)}
    rows = data.get("results", [])
    seen: set[str] = set()
    agreements = 0
    false_passes = 0
    reviewed = 0

    for row in rows:
        cid = row.get("caseId")
        if cid not in by_id:
            errors.append(f"risultato per caso non ammesso o respinto dal pre-gate: {cid}")
            continue
        if cid in seen:
            errors.append(f"risultato duplicato: {cid}")
            continue
        seen.add(cid)
        if row.get("advisoryOnly") is not True:
            errors.append(f"{cid}: advisoryOnly deve essere true")
        label = row.get("semanticLabel")
        if label not in LABELS:
            errors.append(f"{cid}: semanticLabel non valida")
        review = row.get("humanReview")
        if not isinstance(review, dict) or review.get("reviewed") is not True:
            errors.append(f"{cid}: revisione umana obbligatoria")
            continue
        human_label = review.get("label")
        if human_label not in LABELS:
            errors.append(f"{cid}: etichetta umana non valida")
            continue
        reviewed += 1
        if label == human_label:
            agreements += 1
        if label == "ALIGNED" and human_label != "ALIGNED":
            false_passes += 1
        expected_digest = canonical_digest(
            {
                "curriculumEvidence": by_id[cid]["evidence"],
                "publicationCandidate": by_id[cid]["manifest"],
            }
        )
        if row.get("stateDigest") != expected_digest:
            errors.append(f"{cid}: stateDigest non corrisponde allo stato del corpus")

    if set(by_id) != seen:
        missing = sorted(set(by_id) - seen)
        errors.append("risultati mancanti: " + ", ".join(missing))

    metrics = {
        "semanticCases": len(by_id),
        "reviewedCases": reviewed,
        "exactAgreement": agreements,
        "exactAgreementRate": (agreements / reviewed) if reviewed else None,
        "falsePasses": false_passes,
    }
    return errors, metrics


def command_validate() -> int:
    corpus = load_json(CASES_PATH)
    errors = validate_cases(corpus)
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    rejected = sum(bool(pre_gate(c)) for c in corpus["cases"])
    semantic = len(corpus["cases"]) - rejected
    print(f"TRAMA-SA-01 corpus validation: PASS ({semantic} semantic, {rejected} pre-gate reject)")
    return 0


def command_prepare(output: Path) -> int:
    corpus = load_json(CASES_PATH)
    errors = validate_cases(corpus)
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(prepare_payload(corpus), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"TRAMA-SA-01 prepared input: {output}")
    return 0


def command_score(results: Path) -> int:
    corpus = load_json(CASES_PATH)
    errors = validate_cases(corpus)
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    result_data = load_json(results)
    result_errors, metrics = validate_results(corpus, result_data)
    if result_errors:
        for error in result_errors:
            print(f"ERROR: {error}")
        return 1
    print(json.dumps(metrics, ensure_ascii=False, indent=2))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="TRAMA-SA-01 provider-neutral harness")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("validate")
    prep = sub.add_parser("prepare")
    prep.add_argument("--output", type=Path, required=True)
    score = sub.add_parser("score")
    score.add_argument("--results", type=Path, required=True)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    if args.command == "validate":
        return command_validate()
    if args.command == "prepare":
        return command_prepare(args.output)
    if args.command == "score":
        return command_score(args.results)
    return 2


if __name__ == "__main__":
    sys.exit(main())
