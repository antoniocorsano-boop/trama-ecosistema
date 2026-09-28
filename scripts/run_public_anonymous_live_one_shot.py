#!/usr/bin/env python3
"""Executable LIVE_ONE_SHOT coordinator for PUBLIC_ANONYMOUS_READ_ONLY."""
from __future__ import annotations
import argparse, importlib.util, json, sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def load_module(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m);return m
b=load_module("live_binding","scripts/cc_mss_public_anonymous_live_binding.py")
c=load_module("collector","scripts/run_public_anonymous_repository_observation.py")
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--exact-sha",required=True)
    ap.add_argument("--run-id",required=True)
    ap.add_argument("--run-attempt",required=True,type=int)
    ap.add_argument("--decision",required=True)
    ap.add_argument("--output",default="control-center/data/repository-observation.live.json")
    ap.add_argument("--claim-dir",default=".trama-live-claims")
    args=ap.parse_args()
    if args.decision!="AUTHORIZE_LIVE_ONE_SHOT": raise RuntimeError("HUMAN_DECISION_INVALID")
    if len(args.exact_sha)!=40 or any(ch not in "0123456789abcdef" for ch in args.exact_sha): raise RuntimeError("EXACT_SHA_INVALID")
    enrollment=json.loads((ROOT/"config/repository-enrollment.json").read_text(encoding="utf-8"))
    repos=tuple(x["repository"] for x in enrollment["repositories"] if x.get("state")=="ENROLLED")
    now=datetime.now(timezone.utc)
    auth=b.HumanAuthorization(
        authorization_ref=f"gha-dispatch-{args.run_id}",runtime_mode=b.MODE,credential_ref="NONE",
        exact_sha=args.exact_sha,repositories=repos,operations=b.ALLOWED_OPS,principal_ref=b.PRINCIPAL,
        evidence_destination="LOCAL_EPHEMERAL_ONLY",issued_at=now.isoformat(),expires_at=(now+timedelta(minutes=15)).isoformat())
    receipt=b.admit(auth,args.exact_sha,repos,now,b.Invocation(args.run_id,args.run_attempt))
    store=b.LocalAtomicClaim(ROOT/args.claim_dir)
    out=ROOT/args.output
    store.claim(receipt)
    try:
        _,observation=c.collect(args.output)
        store.finish(receipt,"CONSUMED")
        print(json.dumps({"result":"CONSUMED","receiptRef":receipt.receipt_ref,"runId":receipt.run_id,"exactSha":receipt.exact_sha,"repositoryCount":len(observation["repositories"]),"openPullRequestCount":len(observation["pullRequests"]),"observationStatus":observation["status"]},sort_keys=True))
    except BaseException:
        if out.exists(): out.unlink()
        try: store.finish(receipt,"FAILED")
        finally: raise
if __name__=="__main__": main()
