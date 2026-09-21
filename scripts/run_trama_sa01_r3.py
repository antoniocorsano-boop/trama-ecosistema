#!/usr/bin/env python3
"""Harness provider-neutral per TRAMA-SA-01/R3.

Valida il corpus preregistrato e calcola metriche sul solo split
effettivamente eseguito. L'HOLDOUT resta congelato finché non viene
autorizzato da un gate umano separato.
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
DOMAINS = {"Tecnologia", "Scienze", "Matematica", "Educazione civica"}
SPLIT_NAMES = {"DEVELOPMENT": "development", "HOLDOUT": "holdout"}


def load_corpus() -> dict:
    return json.loads(CORPUS_PATH.read_text(encoding="utf-8"))


def state_for(case: dict) -> dict:
    return {
        "curriculumEvidence": case["evidence"],
        "publicationCandidate": case["manifest"],
    }


def split_case_ids(corpus: dict, split: str) -> list[str]:
    policy = corpus["splitPolicy"]
    if split == "DEVELOPMENT":
        return list(policy["developmentCaseIds"])
    if split == "HOLDOUT":
        return list(policy["holdoutCaseIds"])
    raise ValueError(f"split non valido: {split}")


def cases_for_split(corpus: dict, split: str) -> list[dict]:
    by_id = {c["id"]: c for c in corpus["cases"]}
    return [by_id[cid] for cid in split_case_ids(corpus, split)]


def validate_corpus(corpus: dict) -> list[str]:
    errors: list[str] = []
    if corpus.get("pilotId") != "TRAMA-SA-01" or corpus.get("iteration") != "R3":
        errors.append("identità R3 non valida")
    if corpus.get("pilotSpecVersion") != "3.1.0":
        errors.append("pilotSpecVersion deve essere 3.1.0")
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

    split_meta = corpus.get("splits", {})
    if split_meta.get("development", {}).get("count") != 32:
        errors.append("development deve contenere 32 casi")
    if split_meta.get("holdout", {}).get("count") != 16:
        errors.append("holdout deve contenere 16 casi")
    if split_meta.get("holdout", {}).get("tuningAllowed") is not False:
        errors.append("holdout tuningAllowed deve essere false")

    split_policy = corpus.get("splitPolicy", {})
    dev_ids = split_policy.get("developmentCaseIds", [])
    hold_ids = split_policy.get("holdoutCaseIds", [])
    if len(dev_ids) != 32 or len(hold_ids) != 16:
        errors.append("splitPolicy deve essere 32/16")
    if set(dev_ids) & set(hold_ids):
        errors.append("development e holdout non possono sovrapporsi")
    if split_policy.get("holdoutLocked") is not True:
        errors.append("holdoutLocked deve essere true")
    if split_policy.get("holdoutTuningAllowed") is not False:
        errors.append("holdoutTuningAllowed deve essere false")

    policies = corpus.get("preRegisteredPolicies", {})
    baseline = policies.get("baselineP05", {})
    conservative = policies.get("conservativeEscalation", {})
    b = baseline.get("evidenceRoutingBoundary")
    low = conservative.get("evidenceReviewLow")
    high = conservative.get("evidenceReviewHigh")
    floor = conservative.get("alignmentConfidenceFloor")
    if b != 0.5:
        errors.append("baseline evidenceRoutingBoundary deve essere 0.5")
    if not all(isinstance(x, (int, float)) for x in (low, high, floor)):
        errors.append("policy conservative incompleta")
    elif not (0 <= low < b < high <= 1 and 0 <= floor <= 1):
        errors.append("policy conservative incoerente")

    cases = corpus.get("cases", [])
    if len(cases) != 48:
        errors.append(f"R3 richiede 48 casi, trovati {len(cases)}")

    ids: set[str] = set()
    labels = Counter()
    domains = Counter()
    split_counts = Counter()
    split_labels = Counter()
    split_domains = Counter()
    groups: dict[str, list[dict]] = defaultdict(list)

    for case in cases:
        cid = case.get("id", "")
        if not cid or cid in ids:
            errors.append(f"id assente o duplicato: {cid}")
        ids.add(cid)

        label = case.get("expectedSemanticLabel")
        domain = case.get("domain")
        split = case.get("split")
        if label not in LABELS:
            errors.append(f"{cid}: label non valida")
        if domain not in DOMAINS:
            errors.append(f"{cid}: dominio non valido")
        if split not in {"development", "holdout"}:
            errors.append(f"{cid}: split non valido")

        labels[label] += 1
        domains[domain] += 1
        split_counts[split] += 1
        split_labels[(split, label)] += 1
        split_domains[(split, domain)] += 1
        groups[case.get("paraphraseGroup", "")].append(case)

        if case.get("expectedStage") != "SEMANTIC_REVIEW":
            errors.append(f"{cid}: expectedStage deve essere SEMANTIC_REVIEW")
        gate_errors = base.pre_gate(case)
        if gate_errors:
            errors.append(f"{cid}: pre-gate fallisce: {'; '.join(gate_errors)}")

    if set(dev_ids) | set(hold_ids) != ids:
        errors.append("splitPolicy non copre esattamente il corpus")

    for label in LABELS:
        if labels[label] != 12:
            errors.append(f"{label}: attesi 12 casi")
        if split_labels[("development", label)] != 8:
            errors.append(f"development/{label}: attesi 8 casi")
        if split_labels[("holdout", label)] != 4:
            errors.append(f"holdout/{label}: attesi 4 casi")

    for domain in DOMAINS:
        if domains[domain] != 12:
            errors.append(f"{domain}: attesi 12 casi")
        if split_domains[("development", domain)] != 8:
            errors.append(f"development/{domain}: attesi 8 casi")
        if split_domains[("holdout", domain)] != 4:
            errors.append(f"holdout/{domain}: attesi 4 casi")

    if split_counts["development"] != 32 or split_counts["holdout"] != 16:
        errors.append("conteggio split non coerente")

    if len(groups) != 24 or "" in groups:
        errors.append("servono 24 gruppi di parafrasi nominati")
    for group, pair in groups.items():
        if not group:
            continue
        if len(pair) != 2:
            errors.append(f"{group}: attesi 2 casi")
            continue
        for field in ("split", "domain", "expectedSemanticLabel"):
            if pair[0].get(field) != pair[1].get(field):
                errors.append(f"{group}: {field} incoerente nella coppia")
        if pair[0]["evidence"]["objective"] != pair[1]["evidence"]["objective"]:
            errors.append(f"{group}: objective non identico nella coppia")
        if pair[0]["manifest"]["summary"] == pair[1]["manifest"]["summary"]:
            errors.append(f"{group}: parafrasi non distinte")

    return errors


def confusion(rows: list[tuple[str, str]]) -> dict:
    matrix: dict[str, dict[str, int]] = {}
    for expected, predicted in rows:
        matrix.setdefault(expected, {})
        matrix[expected][predicted] = matrix[expected].get(predicted, 0) + 1
    return matrix


def predicted(row: dict, conservative: bool) -> str:
    if not conservative:
        return row.get("baselineSemanticLabel", "INVALID")
    if row.get("conservativeRoute") == "REVIEW_REQUIRED":
        return "REVIEW_REQUIRED"
    return row.get("conservativeSemanticLabel") or "INVALID"


def validate_raw_results(corpus: dict, raw: dict, split: str) -> list[str]:
    errors: list[str] = []
    if raw.get("pilotId") != "TRAMA-SA-01/R3":
        errors.append("pilotId raw non valido")
    if raw.get("evaluatedSplit") != split:
        errors.append("evaluatedSplit non corrisponde allo split richiesto")
    if raw.get("advisoryOnly") is not True or raw.get("runtimeWritesAllowed") is not False:
        errors.append("boundary advisory/runtime non valido")
    if raw.get("humanReviewComplete") is not False:
        errors.append("humanReviewComplete deve essere false nel raw")
    if raw.get("providerErrors"):
        errors.append("providerErrors non vuoto")

    expected_cases = {c["id"]: c for c in cases_for_split(corpus, split)}
    results = raw.get("results", [])
    if len(results) != len(expected_cases):
        errors.append(f"attesi {len(expected_cases)} risultati, trovati {len(results)}")

    seen: set[str] = set()
    for row in results:
        cid = row.get("caseId")
        if cid not in expected_cases:
            errors.append(f"caso non autorizzato per {split}: {cid}")
            continue
        if cid in seen:
            errors.append(f"risultato duplicato: {cid}")
        seen.add(cid)
        if row.get("advisoryOnly") is not True:
            errors.append(f"{cid}: advisoryOnly deve essere true")
        if row.get("stateDigest") != base.canonical_digest(state_for(expected_cases[cid])):
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
                errors.append(f"{cid}: REVIEW_REQUIRED non deve avere label")
        elif c_label not in LABELS:
            errors.append(f"{cid}: conservativeSemanticLabel non valida")
        if row.get("humanReview", {}).get("reviewed") is not False:
            errors.append(f"{cid}: humanReview deve restare pending")

    missing = sorted(set(expected_cases) - seen)
    if missing:
        errors.append("risultati mancanti: " + ", ".join(missing))
    return errors


def metrics_for(cases: list[dict], by_result: dict[str, dict]) -> dict:
    baseline_rows: list[tuple[str, str]] = []
    conservative_rows: list[tuple[str, str]] = []
    false_aligned = false_insufficient = 0
    c_false_aligned = c_false_insufficient = 0
    review_required = auto_count = auto_exact = 0

    for case in cases:
        expected = case["expectedSemanticLabel"]
        row = by_result[case["id"]]
        b = predicted(row, False)
        c = predicted(row, True)
        baseline_rows.append((expected, b))
        conservative_rows.append((expected, c))
        false_aligned += int(b == "ALIGNED" and expected != "ALIGNED")
        false_insufficient += int(b == "INSUFFICIENT_EVIDENCE" and expected != "INSUFFICIENT_EVIDENCE")
        if c == "REVIEW_REQUIRED":
            review_required += 1
        else:
            auto_count += 1
            auto_exact += int(c == expected)
            c_false_aligned += int(c == "ALIGNED" and expected != "ALIGNED")
            c_false_insufficient += int(c == "INSUFFICIENT_EVIDENCE" and expected != "INSUFFICIENT_EVIDENCE")

    baseline_exact = sum(int(e == p) for e, p in baseline_rows)
    total = len(cases)
    return {
        "total": total,
        "baseline": {
            "exact": baseline_exact,
            "accuracy": baseline_exact / total if total else None,
            "falseAligned": false_aligned,
            "falseInsufficientEvidence": false_insufficient,
            "confusion": confusion(baseline_rows),
        },
        "conservative": {
            "reviewRequired": review_required,
            "reviewRate": review_required / total if total else None,
            "autoCount": auto_count,
            "autoCoverage": auto_count / total if total else None,
            "autoExact": auto_exact,
            "autoAccuracy": auto_exact / auto_count if auto_count else None,
            "falseAligned": c_false_aligned,
            "falseInsufficientEvidence": c_false_insufficient,
            "confusion": confusion(conservative_rows),
        },
    }


def paraphrase_stability(cases: list[dict], by_result: dict[str, dict]) -> dict:
    groups: dict[str, list[dict]] = defaultdict(list)
    for case in cases:
        groups[case["paraphraseGroup"]].append(case)
    total = b_stable = c_stable = 0
    for pair in groups.values():
        if len(pair) != 2:
            continue
        total += 1
        rows = [by_result[x["id"]] for x in pair]
        b_stable += int(predicted(rows[0], False) == predicted(rows[1], False))
        c_stable += int(predicted(rows[0], True) == predicted(rows[1], True))
    return {
        "pairs": total,
        "baselineStablePairs": b_stable,
        "baselineStabilityRate": b_stable / total if total else None,
        "conservativeStablePairs": c_stable,
        "conservativeStabilityRate": c_stable / total if total else None,
    }


def score(raw_path: Path, output: Path, split: str) -> int:
    corpus = load_corpus()
    errors = validate_corpus(corpus)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    raw = json.loads(raw_path.read_text(encoding="utf-8"))
    errors = validate_raw_results(corpus, raw, split)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    cases = cases_for_split(corpus, split)
    by_result = {r["caseId"]: r for r in raw["results"]}
    latency = [r.get("elapsedMs") for r in raw["results"] if isinstance(r.get("elapsedMs"), (int, float))]
    metrics = {
        "pilotId": "TRAMA-SA-01/R3",
        "evaluatedSplit": split,
        "corpusVersion": corpus["pilotSpecVersion"],
        "policyVersion": raw.get("policyVersion"),
        "holdoutLocked": corpus["splitPolicy"]["holdoutLocked"],
        "holdoutTuningAllowed": False,
        "classification": metrics_for(cases, by_result),
        "paraphraseStability": paraphrase_stability(cases, by_result),
        "usage": {
            "inputTokens": sum((r.get("usage") or {}).get("inputTokens") or 0 for r in raw["results"]),
            "outputTokens": sum((r.get("usage") or {}).get("outputTokens") or 0 for r in raw["results"]),
            "averageElapsedMs": sum(latency) / len(latency) if latency else None,
        },
        "providerErrors": len(raw.get("providerErrors", [])),
        "humanReviewComplete": False,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(metrics, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"TRAMA-SA-01/R3 {split} metrics: {output}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="TRAMA-SA-01/R3 provider-neutral harness")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("validate")
    score_p = sub.add_parser("score")
    score_p.add_argument("--results", type=Path, required=True)
    score_p.add_argument("--output", type=Path, required=True)
    score_p.add_argument("--split", choices=["DEVELOPMENT", "HOLDOUT"], required=True)
    args = parser.parse_args()

    if args.command == "validate":
        errors = validate_corpus(load_corpus())
        if errors:
            for error in errors:
                print(f"ERROR: {error}")
            return 1
        print("TRAMA-SA-01/R3 corpus validation: PASS (48; development=32; holdout=16 locked)")
        return 0
    return score(args.results, args.output, args.split)


if __name__ == "__main__":
    sys.exit(main())
