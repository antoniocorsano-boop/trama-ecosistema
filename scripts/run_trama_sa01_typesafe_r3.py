#!/usr/bin/env python3
"""TRAMA-SA-01/R3: preregistered robustness run with locked holdout.

Laboratorio soltanto. Nessuna scrittura su Arena, Atlas o Docente OS.
Il boundary 0.5 è usato esclusivamente per il routing sperimentale della
seconda domanda e non costituisce soglia di autorizzazione o policy runtime.
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
DEFAULT_OUTPUT = ROOT / "artifacts" / "trama-sa01-typesafe-r3-raw.json"
EXPERIMENTAL_ROUTING_BOUNDARY = 0.5
R3_CASES_PATH = ROOT / "docs" / "pilots" / "trama-sa-01" / "r3-cases.json"


def sdk_version() -> str:
    try:
        return metadata.version("typesafe-sdk")
    except metadata.PackageNotFoundError:
        return "UNKNOWN"


def load_sdk():
    if not os.environ.get("TYPESAFE_API_KEY"):
        raise RuntimeError("TYPESAFE_API_KEY non configurata; esecuzione R3 non avviata")
    try:
        from typesafe_sdk import Choice, Noul, TypeSafeClient
    except ModuleNotFoundError as exc:
        raise RuntimeError("typesafe-sdk non installato") from exc
    return Choice, Noul, TypeSafeClient


def semantic_cases(corpus: dict) -> list[dict]:
    return [case for case in corpus["cases"] if not harness.pre_gate(case)]


def state_for(case: dict) -> dict:
    return {
        "curriculumEvidence": case["evidence"],
        "publicationCandidate": case["manifest"],
    }


def evidence_question(Noul):
    return Noul(
        instructions=(
            "curriculumEvidence.objective contiene informazione sufficientemente specifica "
            "per giudicare semanticamente se publicationCandidate.summary ne conserva il "
            "significato? Valuta la sufficienza dell'evidenza, non la correttezza della sintesi."
        ),
        criteria={
            "true": (
                "L'obiettivo è abbastanza specifico da consentire un confronto semantico "
                "significativo con la sintesi proposta."
            ),
            "false": (
                "L'obiettivo è troppo generico, incompleto o non pertinente per consentire "
                "un confronto semantico significativo con la sintesi proposta."
            ),
        },
    )


def alignment_question(Choice):
    return Choice(
        instructions=(
            "Assumendo sufficiente l'evidenza fornita, valuta se publicationCandidate.summary "
            "conserva il significato sostanziale di curriculumEvidence.objective. "
            "Non valutare autorizzazioni o pubblicabilità."
        ),
        criteria={
            "ALIGNED": (
                "Conserva il significato sostanziale senza omissioni rilevanti o contraddizioni."
            ),
            "PARTIAL": (
                "È coerente solo in parte oppure omette un elemento sostanziale."
            ),
            "CONTRADICTORY": (
                "Contraddice, inverte o altera sostanzialmente il significato."
            ),
        },
    )


def add_usage(total: dict[str, int], usage) -> None:
    total["inputTokens"] += usage.input_tokens or 0
    total["outputTokens"] += usage.output_tokens or 0


def run_case(client, Choice, Noul, case: dict, model: str) -> dict:
    state = state_for(case)
    digest = harness.canonical_digest(state)
    total_usage = {"inputTokens": 0, "outputTokens": 0}
    started = time.perf_counter()

    evidence_response = client.system_one(
        state=state,
        questions={"evidence_sufficient": evidence_question(Noul)},
        model=model,
    )
    add_usage(total_usage, evidence_response.usage)
    evidence_probability = evidence_response.nouls["evidence_sufficient"].noul

    route = "EVIDENCE_INSUFFICIENT"
    semantic_label = "INSUFFICIENT_EVIDENCE"
    alignment = None
    alignment_model = None

    if evidence_probability > EXPERIMENTAL_ROUTING_BOUNDARY:
        route = "ALIGNMENT_EVALUATED"
        alignment_response = client.system_one(
            state=state,
            questions={"alignment": alignment_question(Choice)},
            model=model,
        )
        add_usage(total_usage, alignment_response.usage)
        answer = alignment_response.choices["alignment"]
        if answer.choice not in {"ALIGNED", "PARTIAL", "CONTRADICTORY"}:
            raise RuntimeError(f"{case['id']}: etichetta alignment non ammessa: {answer.choice}")
        semantic_label = answer.choice
        alignment_model = alignment_response.model
        alignment = {
            "choice": answer.choice,
            "confidence": answer.confidence,
            "probabilities": dict(answer.probabilities),
        }

    elapsed_ms = round((time.perf_counter() - started) * 1000, 2)

    return {
        "caseId": case["id"],
        "evaluatedSplit": split,
        "provider": "TypeSafe",
        "providerSdk": "typesafe-sdk",
        "providerSdkVersion": sdk_version(),
        "requestedModel": model,
        "evidenceModel": evidence_response.model,
        "alignmentModel": alignment_model,
        "judgmentDesign": "R3_EVIDENCE_THEN_ALIGNMENT",
        "evidenceSufficientNoul": evidence_probability,
        "experimentalRoutingBoundary": EXPERIMENTAL_ROUTING_BOUNDARY,
        "route": route,
        "semanticLabel": semantic_label,
        "alignment": alignment,
        "usage": total_usage,
        "elapsedMs": elapsed_ms,
        "advisoryOnly": True,
        "stateDigest": digest,
        "evaluatedAt": datetime.now(timezone.utc).isoformat(),
        "humanReview": {"reviewed": False, "label": None, "note": None},
    }


def selected_cases(corpus: dict, split: str) -> list[dict]:
    semantic = {case["id"]: case for case in semantic_cases(corpus)}
    policy = corpus.get("splitPolicy", {})
    ids = policy.get("developmentCaseIds", []) if split == "DEVELOPMENT" else policy.get("holdoutCaseIds", [])
    return [semantic[case_id] for case_id in ids if case_id in semantic]


def execute(output: Path, model: str, split: str) -> int:
    corpus = harness.load_json(R3_CASES_PATH)
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

    cases = selected_cases(corpus, split)
    results: list[dict] = []
    provider_errors: list[dict] = []

    with TypeSafeClient() as client:
        for case in cases:
            try:
                results.append(run_case(client, Choice, Noul, case, model))
            except Exception as exc:
                provider_errors.append(
                    {"caseId": case["id"], "errorType": type(exc).__name__, "message": str(exc)}
                )

    payload = {
        "pilotId": "TRAMA-SA-01",
        "iteration": "R3",
        "corpusVersion": corpus["pilotSpecVersion"],
        "provider": "TypeSafe",
        "requestedModel": model,
        "advisoryOnly": True,
        "runtimeWritesAllowed": False,
        "humanReviewComplete": False,
        "holdoutLocked": bool(corpus.get("splitPolicy", {}).get("holdoutLocked")),
        "developmentCaseIds": corpus.get("splitPolicy", {}).get("developmentCaseIds", []),
        "holdoutCaseIds": corpus.get("splitPolicy", {}).get("holdoutCaseIds", []),
        "experimentalRoutingBoundary": EXPERIMENTAL_ROUTING_BOUNDARY,
        "routingBoundaryPurpose": "QUERY_ROUTING_ONLY_NOT_AUTHORIZATION",
        "results": results,
        "providerErrors": provider_errors,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"TRAMA-SA-01/R3 raw run: {len(results)} results, "
        f"{len(provider_errors)} provider errors -> {output}"
    )
    return 0 if not provider_errors and len(results) == len(cases) else 1


def main() -> int:
    parser = argparse.ArgumentParser(description="TRAMA-SA-01/R3 TypeSafe robustness adapter")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--model", default="jev-latest")
    parser.add_argument("--split", choices=["DEVELOPMENT", "HOLDOUT"], default="DEVELOPMENT")
    args = parser.parse_args()
    return execute(args.output, args.model, args.split)


if __name__ == "__main__":
    sys.exit(main())
