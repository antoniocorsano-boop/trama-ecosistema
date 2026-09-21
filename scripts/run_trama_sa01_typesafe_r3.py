#!/usr/bin/env python3
"""Adapter TypeSafe live per TRAMA-SA-01/R3.

Le policy sono lette dal corpus preregistrato e non sono configurabili
dal workflow. L'holdout non modifica prompt, criteri o boundary.
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

import run_trama_sa01 as base
import run_trama_sa01_r3 as r3

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "artifacts" / "trama-sa01-typesafe-r3-raw.json"
POLICY_VERSION = "R3-POLICY-001"


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


def evidence_question(Noul):
    return Noul(
        instructions=(
            "curriculumEvidence.objective contiene informazione sufficientemente specifica "
            "per giudicare semanticamente se publicationCandidate.summary ne conserva il significato? "
            "Valuta la sufficienza dell'evidenza, non la correttezza della sintesi."
        ),
        criteria={
            "true": "L'obiettivo consente un confronto semantico significativo con la sintesi.",
            "false": "L'obiettivo è troppo generico, incompleto o non pertinente per un confronto significativo.",
        },
    )


def alignment_question(Choice):
    return Choice(
        instructions=(
            "Assumendo sufficiente l'evidenza, valuta se publicationCandidate.summary conserva "
            "il significato sostanziale di curriculumEvidence.objective. "
            "Non valutare autorizzazioni, approvazioni o pubblicabilità."
        ),
        criteria={
            "ALIGNED": "Conserva il significato sostanziale senza omissioni rilevanti o contraddizioni.",
            "PARTIAL": "È coerente solo in parte oppure omette un elemento sostanziale.",
            "CONTRADICTORY": "Contraddice, inverte o altera sostanzialmente il significato.",
        },
    )


def add_usage(total: dict[str, int], usage) -> None:
    total["inputTokens"] += usage.input_tokens or 0
    total["outputTokens"] += usage.output_tokens or 0


def run_case(client, Choice, Noul, case: dict, model: str, policies: dict) -> dict:
    state = r3.state_for(case)
    digest = base.canonical_digest(state)
    baseline_boundary = policies["baselineP05"]["evidenceRoutingBoundary"]
    conservative = policies["conservativeEscalation"]
    low = conservative["evidenceReviewLow"]
    high = conservative["evidenceReviewHigh"]
    confidence_floor = conservative["alignmentConfidenceFloor"]

    usage = {"inputTokens": 0, "outputTokens": 0}
    started = time.perf_counter()
    evidence_response = client.system_one(
        state=state,
        questions={"evidence_sufficient": evidence_question(Noul)},
        model=model,
    )
    add_usage(usage, evidence_response.usage)
    p = evidence_response.nouls["evidence_sufficient"].noul

    alignment = None
    alignment_model = None
    baseline_label = "INSUFFICIENT_EVIDENCE"

    if p > baseline_boundary:
        alignment_response = client.system_one(
            state=state,
            questions={"alignment": alignment_question(Choice)},
            model=model,
        )
        add_usage(usage, alignment_response.usage)
        answer = alignment_response.choices["alignment"]
        if answer.choice not in {"ALIGNED", "PARTIAL", "CONTRADICTORY"}:
            raise RuntimeError(f"{case['id']}: etichetta alignment non ammessa: {answer.choice}")
        alignment_model = alignment_response.model
        alignment = {
            "choice": answer.choice,
            "confidence": answer.confidence,
            "probabilities": dict(answer.probabilities),
        }
        baseline_label = answer.choice

    if p < low:
        conservative_route = "AUTO_INSUFFICIENT"
        conservative_label = "INSUFFICIENT_EVIDENCE"
    elif p <= high:
        conservative_route = "REVIEW_REQUIRED"
        conservative_label = None
    else:
        if alignment is None:
            raise RuntimeError(f"{case['id']}: alignment assente sopra evidenceReviewHigh")
        if alignment["confidence"] < confidence_floor:
            conservative_route = "REVIEW_REQUIRED"
            conservative_label = None
        else:
            conservative_route = "AUTO_ALIGNMENT"
            conservative_label = alignment["choice"]

    return {
        "caseId": case["id"],
        "split": case["split"],
        "paraphraseGroup": case["paraphraseGroup"],
        "provider": "TypeSafe",
        "providerSdk": "typesafe-sdk",
        "providerSdkVersion": sdk_version(),
        "requestedModel": model,
        "evidenceModel": evidence_response.model,
        "alignmentModel": alignment_model,
        "policyVersion": POLICY_VERSION,
        "evidenceSufficientNoul": p,
        "alignment": alignment,
        "baselineSemanticLabel": baseline_label,
        "conservativeRoute": conservative_route,
        "conservativeSemanticLabel": conservative_label,
        "usage": usage,
        "elapsedMs": round((time.perf_counter() - started) * 1000, 2),
        "advisoryOnly": True,
        "stateDigest": digest,
        "evaluatedAt": datetime.now(timezone.utc).isoformat(),
        "humanReview": {"reviewed": False, "label": None, "note": None},
    }


def execute(output: Path, model: str) -> int:
    corpus = r3.load_corpus()
    errors = r3.validate_corpus(corpus)
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
        for case in corpus["cases"]:
            try:
                results.append(
                    run_case(client, Choice, Noul, case, model, corpus["preRegisteredPolicies"])
                )
            except Exception as exc:
                provider_errors.append(
                    {"caseId": case["id"], "errorType": type(exc).__name__, "message": str(exc)}
                )

    payload = {
        "pilotId": "TRAMA-SA-01/R3",
        "corpusVersion": corpus["r3SpecVersion"],
        "provider": "TypeSafe",
        "requestedModel": model,
        "policyVersion": POLICY_VERSION,
        "preRegisteredPolicies": corpus["preRegisteredPolicies"],
        "advisoryOnly": True,
        "runtimeWritesAllowed": False,
        "humanReviewComplete": False,
        "holdoutTuningAllowed": False,
        "results": results,
        "providerErrors": provider_errors,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"TRAMA-SA-01/R3 raw run: {len(results)} results, "
        f"{len(provider_errors)} provider errors -> {output}"
    )
    return 0 if not provider_errors and len(results) == 48 else 1


def main() -> int:
    parser = argparse.ArgumentParser(description="TRAMA-SA-01/R3 TypeSafe lab adapter")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--model", default="jev-latest")
    args = parser.parse_args()
    return execute(args.output, args.model)


if __name__ == "__main__":
    sys.exit(main())
