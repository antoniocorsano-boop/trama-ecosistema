#!/usr/bin/env python3
"""TRAMA-SA-01/R3 provider-neutral robustness harness over preregistered synthetic cases."""
from __future__ import annotations
import argparse,json,os,sys,time
from datetime import datetime,timezone
from importlib import metadata
from pathlib import Path
import run_trama_sa01 as base
import run_trama_sa01_typesafe_r2 as r2

ROOT=Path(__file__).resolve().parents[1]
CASES=ROOT/"docs/pilots/trama-sa-01/r3-cases.json"
DEFAULT_OUTPUT=ROOT/"artifacts/trama-sa01-typesafe-r3-raw.json"
BOUNDARY=0.5
UNCERTAIN_LOW=0.4
UNCERTAIN_HIGH=0.6

def sdk_version():
    try:return metadata.version("typesafe-sdk")
    except metadata.PackageNotFoundError:return "UNKNOWN"

def validate(corpus):
    errors=[]
    cases=corpus.get("cases",[])
    if len(cases)!=48: errors.append(f"expected 48 cases, got {len(cases)}")
    ids=[c.get("id") for c in cases]
    if len(ids)!=len(set(ids)): errors.append("duplicate case ids")
    dev=sum(c.get("split")=="DEVELOPMENT" for c in cases)
    hold=sum(c.get("split")=="HOLDOUT" for c in cases)
    if (dev,hold)!=(32,16): errors.append(f"invalid split {dev}/{hold}")
    for label in ("ALIGNED","PARTIAL","CONTRADICTORY","INSUFFICIENT_EVIDENCE"):
        n=sum(c.get("expectedSemanticLabel")==label for c in cases)
        if n!=12: errors.append(f"{label}: expected 12, got {n}")
    if corpus.get("tuningOnHoldoutAllowed") is not False: errors.append("holdout tuning must be false")
    if corpus.get("policy",{}).get("personalDataAllowed") is not False: errors.append("personal data must be forbidden")
    for c in cases:
        if base.pre_gate(c): errors.append(f"{c.get('id')}: unexpected pre-gate rejection")
    return errors

def load_sdk():
    if not os.environ.get("TYPESAFE_API_KEY"): raise RuntimeError("TYPESAFE_API_KEY non configurata; R3 non avviato")
    from typesafe_sdk import Choice,Noul,TypeSafeClient
    return Choice,Noul,TypeSafeClient

def run_case(client,Choice,Noul,case,model):
    state=r2.state_for(case); digest=base.canonical_digest(state); started=time.perf_counter()
    usage={"inputTokens":0,"outputTokens":0}
    ev=client.system_one(state=state,questions={"evidence_sufficient":r2.evidence_question(Noul)},model=model)
    r2.add_usage(usage,ev.usage); ep=ev.nouls["evidence_sufficient"].noul
    near_boundary=UNCERTAIN_LOW <= ep <= UNCERTAIN_HIGH
    route="EVIDENCE_INSUFFICIENT"; label="INSUFFICIENT_EVIDENCE"; alignment=None; amodel=None
    if ep>BOUNDARY:
        route="ALIGNMENT_EVALUATED"
        ar=client.system_one(state=state,questions={"alignment":r2.alignment_question(Choice)},model=model)
        r2.add_usage(usage,ar.usage); ans=ar.choices["alignment"]
        label=ans.choice; amodel=ar.model
        alignment={"choice":ans.choice,"confidence":ans.confidence,"probabilities":dict(ans.probabilities)}
    alignment_uncertain=bool(alignment and alignment["confidence"]<0.7)
    review_required=near_boundary or alignment_uncertain or label!=case["expectedSemanticLabel"]
    return {"caseId":case["id"],"split":case["split"],"domain":case["domain"],"family":case["family"],
      "provider":"TypeSafe","providerSdkVersion":sdk_version(),"requestedModel":model,"evidenceModel":ev.model,
      "alignmentModel":amodel,"judgmentDesign":"R3_EVIDENCE_THEN_ALIGNMENT","evidenceSufficientNoul":ep,
      "experimentalRoutingBoundary":BOUNDARY,"nearBoundary":near_boundary,"route":route,"semanticLabel":label,
      "alignment":alignment,"reviewRequiredByExperimentalPolicy":review_required,"usage":usage,
      "elapsedMs":round((time.perf_counter()-started)*1000,2),"advisoryOnly":True,
      "stateDigest":digest,"evaluatedAt":datetime.now(timezone.utc).isoformat(),
      "humanReview":{"reviewed":False,"label":None,"note":None}}

def metrics(corpus,results):
    expected={c["id"]:c["expectedSemanticLabel"] for c in corpus["cases"]}
    labels=["ALIGNED","PARTIAL","CONTRADICTORY","INSUFFICIENT_EVIDENCE"]
    matrix={a:{b:0 for b in labels} for a in labels}
    exact=false_aligned=false_insufficient=0
    for r in results:
        e=expected[r["caseId"]]; a=r["semanticLabel"]; matrix[e][a]+=1
        exact+=e==a
        false_aligned+=a=="ALIGNED" and e!="ALIGNED"
        false_insufficient+=a=="INSUFFICIENT_EVIDENCE" and e!="INSUFFICIENT_EVIDENCE"
    return {"exactAgreement":exact,"total":len(results),"falseAligned":false_aligned,
      "falseInsufficientEvidence":false_insufficient,"confusionMatrix":matrix,
      "reviewRequired":sum(r["reviewRequiredByExperimentalPolicy"] for r in results),
      "inputTokens":sum(r["usage"]["inputTokens"] for r in results),
      "outputTokens":sum(r["usage"]["outputTokens"] for r in results)}

def execute(output,model,split):
    corpus=json.loads(CASES.read_text(encoding="utf-8")); errors=validate(corpus)
    if errors:
        for e in errors: print("ERROR:",e,file=sys.stderr)
        return 1
    Choice,Noul,Client=load_sdk()
    selected=[c for c in corpus["cases"] if split=="ALL" or c["split"]==split]
    results=[]; provider_errors=[]
    with Client() as client:
        for c in selected:
            try: results.append(run_case(client,Choice,Noul,c,model))
            except Exception as exc: provider_errors.append({"caseId":c["id"],"errorType":type(exc).__name__,"message":str(exc)})
    payload={"pilotId":"TRAMA-SA-01","iteration":"R3","corpusVersion":corpus["pilotSpecVersion"],
      "evaluatedSplit":split,"holdoutTuningAllowed":False,"provider":"TypeSafe","requestedModel":model,
      "advisoryOnly":True,"runtimeWritesAllowed":False,"humanReviewComplete":False,
      "experimentalRoutingBoundary":BOUNDARY,"uncertaintyBand":[UNCERTAIN_LOW,UNCERTAIN_HIGH],
      "results":results,"metrics":metrics(corpus,results),"providerErrors":provider_errors}
    output.parent.mkdir(parents=True,exist_ok=True); output.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"R3 {split}: {len(results)} results, {len(provider_errors)} errors -> {output}")
    return 0 if not provider_errors and len(results)==len(selected) else 1

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--output",type=Path,default=DEFAULT_OUTPUT)
    ap.add_argument("--model",default="jev-latest"); ap.add_argument("--split",choices=["DEVELOPMENT","HOLDOUT","ALL"],default="DEVELOPMENT")
    ap.add_argument("--validate-only",action="store_true"); args=ap.parse_args()
    corpus=json.loads(CASES.read_text(encoding="utf-8")); errors=validate(corpus)
    if args.validate_only:
        print("R3 corpus PASS" if not errors else "\n".join(errors)); return 0 if not errors else 1
    try:return execute(args.output,args.model,args.split)
    except RuntimeError as exc: print(f"ERROR: {exc}",file=sys.stderr); return 2
if __name__=="__main__": sys.exit(main())
