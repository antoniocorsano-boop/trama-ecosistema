"""Real synthetic MCP lifecycle, not production admission."""
import asyncio, hashlib, json, pathlib, time
from math import isclose
from j07_adapter import connect, file_meta, PATCH, PATCH_DIGEST
import j07_session_contract as contract

ROOT=pathlib.Path("/work")
AUTH={k:False for k in contract.AUTHORITY}

async def run():
    start=time.monotonic()
    async with connect() as (adapter,protocol):
        await adapter.initialize_synthetic()
        before=await adapter.inspect()
        base=await adapter.snapshot("base")
        first=await adapter.render("before")
        # Negative calls must stop locally, before reaching MCP.
        for patch_id,digest in (("external-code",PATCH_DIGEST),(PATCH["id"],"0"*64)):
            try:await adapter.apply_reviewed_patch(patch_id,digest)
            except ValueError:pass
            else:raise AssertionError("unapproved patch accepted")
        try:await adapter.snapshot("../escape")
        except ValueError:pass
        else:raise AssertionError("arbitrary path accepted")
        await adapter.apply_reviewed_patch(PATCH["id"],PATCH_DIGEST)
        try:await adapter.apply_reviewed_patch(PATCH["id"],PATCH_DIGEST)
        except ValueError:pass
        else:raise AssertionError("second patch accepted")
        after=await adapter.inspect()
        assert before["pid"]==after["pid"]
        assert before["vertices"]==after["vertices"]==8 and before["faces"]==after["faces"]==6
        assert isclose(after["rotation"][2],.8,abs_tol=1e-5)
        assert isclose(after["scale"][0],1.4,abs_tol=1e-5)
        second=await adapter.render("after")
        candidate=await adapter.snapshot("candidate")
        assert first["sha256"]!=second["sha256"]
        assert base==file_meta(ROOT/"j07-base.blend")
        assert candidate["sha256"]!=base["sha256"]
    evidence={"status":"SYNTHETIC_LIFECYCLE_PASS","protocol":protocol,
              "before":before,"after":after,"base":base,"candidate":candidate,
              "renders":{"before":first,"after":second},"rejectedRequests":4,
              "reviewedPatchDigest":PATCH_DIGEST,"actualRenderTransportVerified":True,
              "elapsedSeconds":int(time.monotonic()-start),"authority":AUTH,
              "productionAdmission":False,"costStatus":"UNKNOWN"}
    (ROOT/"j07-lifecycle.json").write_text(json.dumps(evidence,indent=2))
    # Demonstrate the actual validator's fail-closed cost boundary. This is a
    # structural synthetic fixture, never a trusted admission or positive receipt.
    session={"schema":contract.SCHEMA,"job":"J07","sessionId":"synthetic-live-j07",
             "requestDigest":contract.canonical_digest({"scope":"synthetic-ci"}),
             "referenceDigest":contract.canonical_digest({"reference":"synthetic-cube"}),
             "baseSceneDigest":base["sha256"],
             "adapterRevision":hashlib.sha256(pathlib.Path("/adapter/j07_adapter.py").read_bytes()).hexdigest(),
             "runtimeEvidenceRef":"synthetic-runtime","computeAdmissionRef":"synthetic-not-admitted",
             "rightsEvidenceRef":"synthetic-only","costClass":"FREE_ONLY","mode":"artist_directed",
             "cycle":1,"maxCycles":1,"limits":{"wallSeconds":900,"cpu":4,"ramMiB":6144,"outputBytes":32*1024**2},
             "isolation":{"network":"none","nonPrivileged":True,"rootReadonly":True,
                          "inputReadonly":True,"credentialsAbsent":True,"externalServicesDisabled":True},
             "allowedOps":sorted(contract.OPS),"authority":AUTH}
    receipt={"schema":contract.RECEIPT_SCHEMA,"sessionDigest":contract.validate_session(session),
             "sessionId":session["sessionId"],"status":"STOPPED","costStatus":"UNKNOWN",
             "costEvidenceRef":None,"isolationEvidenceRef":"synthetic-isolation",
             "durationSeconds":evidence["elapsedSeconds"],"sameBlenderProcess":True,
             "parentDigest":base["sha256"],"outputs":[],"authority":AUTH,
             "qualityReviewRef":None,"stopReason":"STOP_NO_COST_EVIDENCE"}
    contract.validate_receipt(session,receipt)
    (ROOT/"j07-contract-fixture.json").write_text(json.dumps({"scope":"SYNTHETIC_NOT_ADMITTED",
           "session":session,"receipt":receipt},indent=2))
    print("J07_SYNTHETIC_LIFECYCLE_PASS; production receipt STOPPED (cost unknown)",flush=True)

asyncio.run(asyncio.wait_for(run(),timeout=120))
