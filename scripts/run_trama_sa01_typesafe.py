#!/usr/bin/env python3
"""Adattatore live TypeSafe per TRAMA-SA-01.

Uso esclusivo di laboratorio. Legge il corpus sintetico, esegue i giudizi
System One tramite l'SDK ufficiale e salva risultati grezzi advisory-only.
Non effettua scritture su Arena, Atlas o Docente OS.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from importlib import metadata
from pathlib import Path

import run_trama_sa01 as harness

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "artifacts" / "trama-sa01-typesafe-raw.json"


def sdk_version() -> str:
    try:
        return metadata.version("typesafe-sdk")
    except metadata.PackageNotFoundError:
        return "UNKNOWN"


def load_sdk():
    if not os.environ.get("TYPESAFE_API_KEY"):
        raise RuntimeError("TYPESAFE_API_KEY non configurata; esecuzione live non avviata")
    try:
        from typesafe_sdk import Choice, Noul, TypeSafeClient
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "typesafe-sdk non installato; usare la versione verificata indicata "
            "in requirements/trama-sa01-typesafe.txt"
        ) from exc
    return Choice, Noul, TypeSafeClient


def semantic_cases(corpus: dict) -> list[dict]:
    return [case for case in corpus["cases"] if not harness.pre_gate(case)]


def state_for(case: dict) -> dict:
    return {
        "curriculumEvidence": case["evidence"],
        "publicationCandidate": case["manifest"],
    }


def questions(Choice, Noul) -> dict:
    return {
        "alignment": Choice(
            instructions=(
                "Valuta se publicationCandidate conserva il significato sostanziale di "
                "curriculumEvidence.objective. Non valutare autorizzazioni, approvazioni "
                "istituzionali o pubblicabilità."
            ),
            criteria={
                "ALIGNED": (
                    "Conserva il significato sostanziale dell'evidenza senza omissioni "
                    "rilevanti o contraddizioni."
                ),
                "PARTIAL": (
                    "È coerente solo in parte oppure omette un elemento sostanziale "
                    "dell'evidenza."
                ),
                "CONTRADICTORY": (
                    "Contraddice, inverte o altera sostanzialmente il significato "
                    "dell'evidenza."
                ),
                "INSUFFICIENT_EVIDENCE": (
                    "L'evidenza fornita non basta per decidere in modo significativo "
                    "tra le altre opzioni."
                ),
            },
        ),
        "claim_support": Noul(
            instructions=(
                "La sintesi in publicationCandidate.summary è sostenuta "
                "dall'evidenza curricolare fornita, senza aggiunte sostanziali "
                "non supportate?"
            ),
            criteria={
                "true": "La sintesi è sostenuta dall'evidenza fornita.",
                "false": "La sintesi non è sostenuta o introduce aggiunte sostanziali.",
            },
        ),
    }


def run_case(client, Choice, Noul, case: dict, model: str) -> dict:
    state = state_for(case)
    digest = harness.canonical_digest(state)
    started = time.perf_counter()
    response = client.system_one(
        state=state,
        questions=questions(Choice, Noul),
        model=model,
    )
    elapsed_ms = round((time.perf_counter() - started) * 1000, 2)

    alignment = response.choices["alignment"]
    support = response.nouls["claim_support"]
    label = alignment.choice
    if label not in harness.LABELS:
        raise RuntimeError(f"{case['id']}: etichetta TypeSafe non ammessa: {label}")

    usage = {
        "inputTokens": response.usage.input_tokens,
        "outputTokens": response.usage.output_tokens,
    }

    return {
        "caseId": case["id"],
        "provider": "TypeSafe",
        "providerSdk": "typesafe-sdk",
        "providerSdkVersion": sdk_version(),
        "providerModel": response.model,
        "judgmentType": "CHOICE_ALIGNMENT",
        "semanticLabel": label,
        "distribution": dict(alignment.probabilities),
        "choiceConfidence": alignment.confidence,
        "auxiliaryJudgments": {
            "claimSupportNoul": support.noul,
        },
        "usage": usage,
        "elapsedMs": elapsed_ms,
        "advisoryOnly": True,
        "stateDigest": digest,
        "evaluatedAt": datetime.now(timezone.utc).isoformat(),
        "humanReview": {
            "reviewed": False,
            "label": None,
            "note": None,
        },
    }


def execute(output: Path, model: str) -> int:
    corpus = harness.load_json(harness.CASES_PATH)
    errors = harness.validate_cases(corpus)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    try:
        Choice, Noul, TypeSafeClient = load_sdk()
    except RuntimeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    results: list[dict] = []
    provider_errors: list[dict] = []

    with TypeSafeClient() as client:
        for case in semantic_cases(corpus):
            try:
                results.append(run_case(client, Choice, Noul, case, model))
            except Exception as exc:
                provider_errors.append(
                    {
                        "caseId": case["id"],
                        "errorType": type(exc).__name__,
                        "message": str(exc),
                    }
                )

    payload = {
        "pilotId": "TRAMA-SA-01",
        "corpusVersion": corpus["pilotSpecVersion"],
        "provider": "TypeSafe",
        "requestedModel": model,
        "advisoryOnly": True,
        "runtimeWritesAllowed": False,
        "humanReviewComplete": False,
        "results": results,
        "providerErrors": provider_errors,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(
        f"TRAMA-SA-01 TypeSafe raw run: {len(results)} results, "
        f"{len(provider_errors)} provider errors -> {output}"
    )
    if provider_errors or len(results) != len(semantic_cases(corpus)):
        return 1
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="TRAMA-SA-01 live TypeSafe adapter")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--model", default="jev-latest")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    return execute(args.output, args.model)


if __name__ == "__main__":
    sys.exit(main())
