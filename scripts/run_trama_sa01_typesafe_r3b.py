#!/usr/bin/env python3
"""TRAMA-SA-01/R3B: stratified development run with locked holdout."""
from __future__ import annotations
import argparse,json,os,sys,time
from datetime import datetime,timezone
from importlib import metadata
from pathlib import Path

import run_trama_sa01 as base
import run_trama_sa01_typesafe_r2 as r2
import validate_trama_sa01_r3b as validator

ROOT=Path(__file__).resolve().parents[1]
CASES=ROOT/"docs"/"pilots"/"trama-sa-01"/"r3b-cases.json"
DEFAULT_OUTPUT=ROOT/"artifacts"/"trama-sa01-typesafe-r3b-development-raw.json"
BOUNDARY=0.5
UNCERTAIN_LOW=0.4
UNCERTAIN_HIGH=0.6

def sdk_version():
    try:return metadata.version("typesafe-sdk")
    except metadata.PackageNotFoundError:return "UNKNOWN"

def load_sdk():
    if not os.environ.get("TYPESAFE_API_KEY"):
        raise RuntimeError("TYPESAFE_API_KEY non configurata; R3B non avviato")
    from typesafe_sdk import Choice,Noul,TypeSafeClient
    return Choice,Noul,TypeSafeClient

def holdout_authorized():
    return os.environ.get("TRAMA_R3B_HOLDOUT_AUTHORIZED") == "true"

def selected_cases(corpus,split):
    policy=corpus["splitPolicy"]
    if split=="HOLDOUT":
        if not holdout_authorized():
            raise RuntimeError("R3B HOLDOUT bloccato: autorizzazione one-shot assente")
        ids=policy["holdoutCaseIds"]
    else:
        ids=policy["developmentCaseIds"]
    by_id={c["id"]:c for c in corpus["cases"]}
    return [by_id[i] for i in ids]

def run_case(client,Choice,Noul,case,model,split):
    state=r2.state_for(case)
    digest=base.canonical_digest(state)
    usage={"inputTokens":0,"outputTokens":0}
    started=time.perf_counter()

    ev=client.system_one(
        state=state,
        questions={"evidence_sufficient":r2.evidence_question(Noul)},
        model=model,
    )
    r2.add_usage(usage,ev.usage)
    ep=ev.nouls["evidence_sufficient"].noul
    near_boundary=UNCERTAIN_LOW <= ep <= UNCERTAIN_HIGH

    route="EVIDENCE_INSUFFICIENT"
    label="INSUFFICIENT_EVIDENCE"
    alignment=None
    alignment_model=None

    if ep>BOUNDARY:
        route="ALIGNMENT_EVALUATED"
        ar=client.system_one(
            state=state,
            questions={"alignment":r2.alignment_question(Choice)},
            model=model,
        )
        r2.add_usage(usage,ar.usage)
        ans=ar.choices["alignment"]
        if ans.choice not in {"ALIGNED","PARTIAL","CONTRADICTORY"}:
            raise RuntimeError(f"{case['id']}: alignment label non ammessa: {ans.choice}")
        label=ans.choice
        alignment_model=ar.model
        alignment={
            "choice":ans.choice,
            "confidence":ans.confidence,
            "probabilities":dict(ans.probabilities),
        }

    alignment_uncertain=bool(alignment and alignment["confidence"]<0.7)
    review_required=near_boundary or alignment_uncertain or label!=case["expectedSemanticLabel"]

    return {
        "caseId":case["id"],
        "evaluatedSplit":split,
        "domain":case["domain"],
        "family":case["family"],
        "expectedSemanticLabel":case["expectedSemanticLabel"],
        "provider":"TypeSafe",
        "providerSdkVersion":sdk_version(),
        "requestedModel":model,
        "evidenceModel":ev.model,
        "alignmentModel":alignment_model,
        "judgmentDesign":"R3B_EVIDENCE_THEN_ALIGNMENT",
        "evidenceSufficientNoul":ep,
        "experimentalRoutingBoundary":BOUNDARY,
        "nearBoundary":near_boundary,
        "route":route,
        "semanticLabel":label,
        "alignment":alignment,
        "reviewRequiredByExperimentalPolicy":review_required,
        "usage":usage,
        "elapsedMs":round((time.perf_counter()-started)*1000,2),
        "advisoryOnly":True,
        "stateDigest":digest,
        "evaluatedAt":datetime.now(timezone.utc).isoformat(),
        "humanReview":{"reviewed":False,"label":None,"note":None},
    }

def metrics(results):
    labels=("ALIGNED","PARTIAL","CONTRADICTORY","INSUFFICIENT_EVIDENCE")
    matrix={a:{b:0 for b in labels} for a in labels}
    exact=0
    for r in results:
        e=r["expectedSemanticLabel"]; a=r["semanticLabel"]
        matrix[e][a]+=1; exact+=e==a
    return {
        "exactAgreement":exact,
        "total":len(results),
        "falseAligned":sum(r["semanticLabel"]=="ALIGNED" and r["expectedSemanticLabel"]!="ALIGNED" for r in results),
        "falseInsufficientEvidence":sum(r["semanticLabel"]=="INSUFFICIENT_EVIDENCE" and r["expectedSemanticLabel"]!="INSUFFICIENT_EVIDENCE" for r in results),
        "confusionMatrix":matrix,
        "reviewRequired":sum(r["reviewRequiredByExperimentalPolicy"] for r in results),
        "inputTokens":sum(r["usage"]["inputTokens"] for r in results),
        "outputTokens":sum(r["usage"]["outputTokens"] for r in results),
        "meanElapsedMs":round(sum(r["elapsedMs"] for r in results)/len(results),2) if results else 0,
    }

def execute(output,model,split):
    corpus=json.loads(CASES.read_text(encoding="utf-8"))
    errors=validator.validate_corpus(corpus)
    if errors:
        for e in errors: print("ERROR:",e,file=sys.stderr)
        return 1
    cases=selected_cases(corpus,split)
    Choice,Noul,Client=load_sdk()
    results=[]; provider_errors=[]
    with Client() as client:
        for case in cases:
            try: results.append(run_case(client,Choice,Noul,case,model,split))
            except Exception as exc:
                provider_errors.append({"caseId":case["id"],"errorType":type(exc).__name__,"message":str(exc)})

    payload={
        "pilotId":"TRAMA-SA-01",
        "iteration":"R3B",
        "corpusVersion":corpus["pilotSpecVersion"],
        "evaluatedSplit":split,
        "holdoutLockedByCorpus":True,
        "holdoutAuthorizationUsed": bool(split=="HOLDOUT" and holdout_authorized()),
        "provider":"TypeSafe",
        "requestedModel":model,
        "advisoryOnly":True,
        "runtimeWritesAllowed":False,
        "humanReviewComplete":False,
        "experimentalRoutingBoundary":BOUNDARY,
        "uncertaintyBand":[UNCERTAIN_LOW,UNCERTAIN_HIGH],
        "results":results,
        "metrics":metrics(results),
        "providerErrors":provider_errors,
    }
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"TRAMA-SA-01/R3B {split}: {len(results)} results, {len(provider_errors)} provider errors -> {output}")
    return 0 if not provider_errors and len(results)==len(cases) else 1

def main():
    ap=argparse.ArgumentParser(description="TRAMA-SA-01/R3B stratified TypeSafe pilot")
    ap.add_argument("--output",type=Path,default=DEFAULT_OUTPUT)
    ap.add_argument("--model",default="jev-latest")
    ap.add_argument("--split",choices=["DEVELOPMENT","HOLDOUT"],default="DEVELOPMENT")
    ap.add_argument("--validate-only",action="store_true")
    args=ap.parse_args()
    if args.validate_only:
        c=json.loads(CASES.read_text(encoding="utf-8"))
        errors=validator.validate_corpus(c)
        if errors:
            print("\n".join(errors)); return 1
        print("R3B corpus PASS"); return 0
    try:return execute(args.output,args.model,args.split)
    except RuntimeError as exc:
        print(f"ERROR: {exc}",file=sys.stderr); return 3 if "HOLDOUT bloccato" in str(exc) else 2

if __name__=="__main__":
    sys.exit(main())
