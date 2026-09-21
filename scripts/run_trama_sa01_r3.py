#!/usr/bin/env python3
"""Harness provider-neutral per TRAMA-SA-01/R3.

Valida il corpus preregistrato e calcola metriche development/holdout
senza modificare prompt, policy o boundary durante il run.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

import run_trama_sa01 as base

ROOT = Path(__file__).resolve().parents[1]
CORPUS_PATH = ROOT / "docs" / "pilots" / "trama-sa-01" / "r3-cases.json"

LABELS = {"ALIGNED", "PARTIAL", "CONTRADICTORY", "INSUFFICIENT_EVIDENCE"}
SPLITS = {"development", "holdout"}
DOMAINS = {"Tecnologia", "Scienze", "Matematica", "Educazione civica"}


def load_corpus() -> dict:
    return json.loads(CORPUS_PATH.read_text(encoding="utf-8"))


def state_for(case: dict) -> dict:
    return {
        "curriculumEvidence": case["evidence"],
        "publicationCandidate": case["manifest"],
    }


def validate_corpus(corpus: dict) -> list[str]:
    errors: list[str] = []
    if corpus.get("pilotId") != "TRAMA-SA-01" or corpus.get("iteration") != "R3":
        errors.append("pilotId R3 non valido")
    if corpus.get("authorizationScope") != "R3_EXPERIMENT_ONLY":
        errors.append("authorizationScope deve essere R3_EXPERIMENT_ONLY")
    for key, expected in (
        ("providerNeutral", True),
        ("personalDataAllowed", False),
        ("runtimeWritesAllowed", False),
        ("advisoryOnly", True),
        ("humanReviewRequired", True),
    ):
        if corpus.get(key) is not expected:
            errors.append(f"{key} deve essere {expected}")

    split_policy = corpus.get("splits", {})
    if split_policy.get("development", {}).get("count") != 32:
        errors.append("development deve contenere 32 casi")
    if split_policy.get("holdout", {}).get("count") != 16:
        errors.append("holdout deve contenere 16 casi")
    if split_policy.get("holdout", {}).get("tuningAllowed") is not False:
        errors.append("holdout.tuningAllowed deve essere false")

    policies = corpus.get("preRegisteredPolicies", {})
    baseline = policies.get("baselineP05", {})
    conservative = policies.get("conservativeEscalation", {})
    b = baseline.get("evidenceRoutingBoundary")
    low = conservative.get("evidenceReviewLow")
    high = conservative.get("evidenceReviewHigh")
    floor = conservative.get("alignmentConfidenceFloor")
    if b != 0.5:
        errors.append("baseline evidenceRoutingBoundary deve restare preregistrato a 0.5")
    if not all(isinstance(x, (int, float)) for x in (low, high, floor)):
        errors.append("policy conservative incompleta")
    elif not (0 <= low < b < high <= 1 and 0 <= floor <= 1):
        errors.append("policy conservative non coerente")

    cases = corpus.get("cases", [])
    if len(cases) != 48:
        errors.append(f"R3 richiede 48 casi, trovati {len(cases)}")

    ids: set[str] = set()
    label_counts = Counter()
    split_counts = Counter()
    domain_counts = Counter()
    split_label_counts = Counter()
    split_domain_counts = Counter()
    groups: dict[str, list[dict]] = defaultdict(list)

    for case in cases:
        cid = case.get("id", "")
        if not cid or cid in ids:
            errors.append(f"id R3 assente o duplicato: {cid}")
        ids.add(cid)
        label = case.get("expectedSemanticLabel")
        split = case.get("split")
        domain = case.get("domain")
        if label not in LABELS:
            errors.append(f"{cid}: label non valida")
        if split not in SPLITS:
            errors.append(f"{cid}: split non valido")
        if domain not in DOMAINS:
            errors.append(f"{cid}: dominio non valido")
        label_counts[label] += 1
        split_counts[split] += 1
        domain_counts[domain] += 1
        split_label_counts[(split, label)] += 1
        split_domain_counts[(split, domain)] += 1
        group = case.get("paraphraseGroup", "")
        if not group:
            errors.append(f"{cid}: paraphraseGroup assente")
        groups[group].append(case)

        gate_errors = base.pre_gate(case)
        if gate_errors:
            errors.append(f"{cid}: pre-gate fallisce: {'; '.join(gate_errors)}")

    for label in LABELS:
        if label_counts[label] != 12:
            errors.append(f"{label}: attesi 12 casi, trovati {label_counts[label]}")
        if split_label_counts[("development", label)] != 8:
            errors.append(f"development/{label}: attesi 8 casi")
        if split_label_counts[("holdout", label)] != 4:
            errors.append(f"holdout/{label}: attesi 4 casi")

    for domain in DOMAINS:
        if domain_counts[domain] != 12:
            errors.append(f"{domain}: attesi 12 casi")
        if split_domain_counts[("development", domain)] != 8:
            errors.append(f"development/{domain}: attesi 8 casi")
        if split_domain_counts[("holdout", domain)] != 4:
            errors.append(f"holdout/{domain}: attesi 4 casi")

    if split_counts["development"] != 32 or split_counts["holdout"] != 16:
        errors.append("split R3 non bilanciato 32/16")

    if len(groups) != 24:
        errors.append(f"attesi 24 gruppi di parafrasi, trovati {len(groups)}")
    for group, pair in groups.items():
        if len(pair) != 2:
            errors.append(f"{group}: il gruppo deve contenere esattamente 2 casi")
            continue
        fields = ("split", "domain", "expectedSemanticLabel")
        for field in fields:
            if pair[0].get(field) != pair[1].get(field):
                errors.append(f"{group}: {field} non coerente nella coppia")
        if pair[0]["evidence"]["objective"] != pair[1]["evidence"]["objective"]:
            errors.append(f"{group}: objective deve essere identico nella coppia")
        if pair[0]["manifest"]["summary"] == pair[1]["manifest"]["summary"]:
            errors.append(f"{group}: le parafrasi devono essere distinte")

    return errors


def result_key(row: dict, conservative: bool) -> str:
    if not conservative:
        return row.get("baselineSemanticLabel", "INVALID")
    if row.get("conservativeRoute") == "REVIEW_REQUIRED":
        return "REVIEW_REQUIRED"
    return row.get("conservativeSemanticLabel") or "INVALID"


def confusion(rows: list[tuple[str, str]]) -> dict:
    matrix: dict[str, dict[str, int]] = {}
    for expected, predicted in rows:
        matrix.setdefault(expected, {})
        matrix[expected][predicted] = matrix[expected].get(predicted, 0) + 1
    return matrix


def metrics_for(cases: list[dict], by_result: dict[str, dict]) -> dict:
    baseline_rows: list[tuple[str, str]] = []
    conservative_rows: list[tuple[str, str]] = []
    false_aligned = 0
    false_insufficient = 0
    conservative_false_aligned = 0
    conservative_false_insufficient = 0
    review_required = 0
    auto_exact = 0
    auto_count = 0

    for case in cases:
        expected = case["expectedSemanticLabel"]
        row = by_result[case["id"]]
        baseline = result_key(row, False)
        conservative = result_key(row, True)
        baseline_rows.append((expected, baseline))
        conservative_rows.append((expected, conservative))
        if baseline == "ALIGNED" and expected != "ALIGNED":
            false_aligned += 1
        if baseline == "INSUFFICIENT_EVIDENCE" and expected != "INSUFFICIENT_EVIDENCE":
            false_insufficient += 1
        if conservative == "REVIEW_REQUIRED":
            review_required += 1
        else:
            auto_count += 1
            auto_exact += int(conservative == expected)
            if conservative == "ALIGNED" and expected != "ALIGNED":
                conservative_false_aligned += 1
            if conservative == "INSUFFICIENT_EVIDENCE" and expected != "INSUFFICIENT_EVIDENCE":
                conservative_false_insufficient += 1

    baseline_exact = sum(int(e == p) for e, p in baseline_rows)
    return {
        "total": len(cases),
        "baseline": {
            "exact": baseline_exact,
            "accuracy": baseline_exact / len(cases) if cases else None,
            "falseAligned": false_aligned,
            "falseInsufficientEvidence": false_insufficient,
            "confusion": confusion(baseline_rows),
        },
        "conservative": {
            "reviewRequired": review_required,
            "reviewRate": review_required / len(cases) if cases else None,
            "autoCount": auto_count,
            "autoCoverage": auto_count / len(cases) if cases else None,
            "autoExact": auto_exact,
            "autoAccuracy": auto_exact / auto_count if auto_count else None,
            "falseAligned": conservative_false_aligned,
            "falseInsufficientEvidence": conservative_false_insufficient,
            "confusion": confusion(conservative_rows),
        },
    }


def paraphrase_stability(cases: list[dict], by_result: dict[str, dict]) -> dict:
    groups: dict[str, list[dict]] = defaultdict(list)
    for case in cases:
        groups[case["paraphraseGroup"]].append(case)
    baseline_stable = 0
    conservative_stable = 0
    total = 0
    for pair in groups.values():
        if len(pair) != 2:
            continue
        total += 1
        rows = [by_result[x["id"]] for x in pair]
        baseline_stable += int(result_key(rows[0], False) == result_key(rows[1], False))
        conservative_stable += int(result_key(rows[0], True) == result_key(rows[1], True))
    return {
        "pairs": total,
        "baselineStablePairs": baseline_stable,
        "baselineStabilityRate": baseline_stable / total if total else None,
        "conservativeStablePairs": conservative_stable,
        "conservativeStabilityRate": conservative_stable / total if total else None,
    }


def validate_raw_results(corpus: dict, raw: dict) -> list[str]:
    errors: list[str] = []
    if raw.get("pilotId") != "TRAMA-SA-01/R3":
        errors.append("risultati non appartengono a R3")
    if raw.get("advisoryOnly") is not True or raw.get("runtimeWritesAllowed") is not False:
        errors.append("boundary advisory/runtime non valido")
    if raw.get("humanReviewComplete") is not False:
        errors.append("il raw R3 deve precedere la review umana")
    if raw.get("providerErrors"):
        errors.append("providerErrors non vuoto")

    cases = {c["id"]: c for c in corpus["cases"]}
    results = raw.get("results", [])
    if len(results) != len(cases):
        errors.append(f"attesi 48 risultati, trovati {len(results)}")
    seen: set[str] = set()
    for row in results:
        cid = row.get("caseId")
        if cid not in cases:
            errors.append(f"caseId non ammesso: {cid}")
            continue
        if cid in seen:
            errors.append(f"caseId duplicato nei risultati: {cid}")
        seen.add(cid)
        if row.get("advisoryOnly") is not True:
            errors.append(f"{cid}: advisoryOnly deve essere true")
        if row.get("stateDigest") != base.canonical_digest(state_for(cases[cid])):
            errors.append(f"{cid}: stateDigest non corrisponde")
        p = row.get("evidenceSufficientNoul")
        if not isinstance(p, (int, float)) or not 0 <= p <= 1:
            errors.append(f"{cid}: evidenceSufficientNoul non valido")
        if row.get("baselineSemanticLabel") not in LABELS:
            errors.append(f"{cid}: baselineSemanticLabel non valida")
        route = row.get("conservativeRoute")
        if route not in {"AUTO_INSUFFICIENT", "AUTO_ALIGNMENT", "REVIEW_REQUIRED"}:
            errors.append(f"{cid}: conservativeRoute non valida")
        c_label = row.get("conservativeSemanticLabel")
        if route == "REVIEW_REQUIRED":
            if c_label is not None:
                errors.append(f"{cid}: REVIEW_REQUIRED non deve avere semantic label")
        elif c_label not in LABELS:
            errors.append(f"{cid}: conservativeSemanticLabel non valida")
        review = row.get("humanReview", {})
        if review.get("reviewed") is not False:
            errors.append(f"{cid}: humanReview deve essere pending nel raw")

    missing = sorted(set(cases) - seen)
    if missing:
        errors.append("risultati mancanti: " + ", ".join(missing))
    return errors


def score(raw_path: Path, output: Path | None) -> int:
    corpus = load_corpus()
    corpus_errors = validate_corpus(corpus)
    if corpus_errors:
        for error in corpus_errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    raw = json.loads(raw_path.read_text(encoding="utf-8"))
    result_errors = validate_raw_results(corpus, raw)
    if result_errors:
        for error in result_errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    by_result = {row["caseId"]: row for row in raw["results"]}
    cases = corpus["cases"]
    dev = [c for c in cases if c["split"] == "development"]
    holdout = [c for c in cases if c["split"] == "holdout"]

    usage_in = sum((r.get("usage") or {}).get("inputTokens") or 0 for r in raw["results"])
    usage_out = sum((r.get("usage") or {}).get("outputTokens") or 0 for r in raw["results"])
    latency = [r.get("elapsedMs") for r in raw["results"] if isinstance(r.get("elapsedMs"), (int, float))]

    metrics = {
        "pilotId": "TRAMA-SA-01/R3",
        "corpusVersion": corpus["r3SpecVersion"],
        "policyVersion": raw.get("policyVersion"),
        "holdoutTuningAllowed": False,
        "development": metrics_for(dev, by_result),
        "holdout": metrics_for(holdout, by_result),
        "overall": metrics_for(cases, by_result),
        "paraphraseStability": {
            "development": paraphrase_stability(dev, by_result),
            "holdout": paraphrase_stability(holdout, by_result),
            "overall": paraphrase_stability(cases, by_result),
        },
        "usage": {
            "inputTokens": usage_in,
            "outputTokens": usage_out,
            "averageElapsedMs": sum(latency) / len(latency) if latency else None,
        },
        "providerErrors": len(raw.get("providerErrors", [])),
        "humanReviewComplete": False,
    }
    rendered = json.dumps(metrics, ensure_ascii=False, indent=2) + "\n"
    if output:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(rendered, encoding="utf-8")
        print(f"TRAMA-SA-01/R3 metrics: {output}")
    else:
        print(rendered, end="")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="TRAMA-SA-01/R3 provider-neutral harness")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("validate")
    score_p = sub.add_parser("score")
    score_p.add_argument("--results", type=Path, required=True)
    score_p.add_argument("--output", type=Path)
    args = parser.parse_args()

    if args.command == "validate":
        errors = validate_corpus(load_corpus())
        if errors:
            for error in errors:
                print(f"ERROR: {error}")
            return 1
        print("TRAMA-SA-01/R3 corpus validation: PASS (48 cases; development=32; holdout=16)")
        return 0
    if args.command == "score":
        return score(args.results, args.output)
    return 2


if __name__ == "__main__":
    sys.exit(main())
