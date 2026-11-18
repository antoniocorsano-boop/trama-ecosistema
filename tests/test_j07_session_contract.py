"""Offline contract tests: synthetic records, not compute admission or execution."""
import copy
import importlib.util
from pathlib import Path
import unittest

path = Path(__file__).resolve().parents[1] / "scripts/visual-factory/j07_session_contract.py"
spec = importlib.util.spec_from_file_location("j07", path)
j07 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j07)


def sample():
    authority = {k: False for k in j07.AUTHORITY}
    session = {
        "schema": j07.SCHEMA, "job": "J07", "sessionId": "synthetic-01",
        "requestDigest": "a"*64, "referenceDigest": "b"*64, "baseSceneDigest": "c"*64,
        "adapterRevision": "d"*64, "runtimeEvidenceRef": "fixture-runtime",
        "computeAdmissionRef": "fixture-compute", "rightsEvidenceRef": "fixture-rights",
        "costClass": "FREE_ONLY", "mode": "artist_directed", "cycle": 1, "maxCycles": 2,
        "limits": {"wallSeconds": 900, "cpu": 4, "ramMiB": 6144, "outputBytes": 1000},
        "isolation": {"network": "none", "nonPrivileged": True, "rootReadonly": True,
                      "inputReadonly": True, "credentialsAbsent": True, "externalServicesDisabled": True},
        "allowedOps": sorted(j07.OPS), "authority": authority,
    }
    receipt = {
        "schema": j07.RECEIPT_SCHEMA, "sessionDigest": j07.canonical_digest(session),
        "sessionId": session["sessionId"], "status": "CANDIDATE_REVIEW_REQUIRED",
        "costStatus": "VERIFIED_ZERO", "costEvidenceRef": "fixture-cost",
        "isolationEvidenceRef": "fixture-isolation", "durationSeconds": 500,
        "sameBlenderProcess": True, "parentDigest": session["baseSceneDigest"],
        "outputs": [{"id": name, "kind": kind, "mime": j07.MIME[kind], "sha256": "e"*64, "bytes": 100}
                    for name, kind in (("master", "master"), ("front", "render"), ("oblique", "render"))],
        "authority": dict(authority), "qualityReviewRef": None, "stopReason": None,
    }
    return session, receipt


class Contract(unittest.TestCase):
    def test_candidate(self):
        s, r = sample()
        self.assertEqual(j07.validate_receipt(s, r), j07.canonical_digest(r))

    def test_stopped(self):
        s, r = sample()
        r.update(status="STOPPED", costStatus="UNKNOWN", costEvidenceRef=None,
                 stopReason="STOP_NO_FREE_RUNTIME", sameBlenderProcess=False, outputs=[])
        j07.validate_receipt(s, r)

    def test_session_negative(self):
        mutations = [
            ("extra", lambda s: s.update(extra=True)),
            ("job", lambda s: s.update(job="J08")),
            ("digest", lambda s: s.update(referenceDigest="missing")),
            ("path", lambda s: s.update(sessionId="../foo")),
            ("url", lambda s: s.update(runtimeEvidenceRef="https://example.org")),
            ("paid", lambda s: s.update(costClass="PAID")),
            ("agent", lambda s: s.update(mode="autonomous")),
            ("third cycle", lambda s: s.update(cycle=3)),
            ("network", lambda s: s["isolation"].update(network="bridge")),
            ("privileges", lambda s: s["isolation"].update(nonPrivileged=False)),
            ("credentials", lambda s: s["isolation"].update(credentialsAbsent=False)),
            ("services", lambda s: s["isolation"].update(externalServicesDisabled=False)),
            ("time", lambda s: s["limits"].update(wallSeconds=901)),
            ("cpu", lambda s: s["limits"].update(cpu=5)),
            ("ram", lambda s: s["limits"].update(ramMiB=6145)),
            ("operation", lambda s: s["allowedOps"].append("execute_arbitrary")),
            ("authority", lambda s: s["authority"].update(publicationAuthorized=True)),
        ]
        for name, change in mutations:
            with self.subTest(name=name):
                s, _ = sample()
                change(s)
                with self.assertRaises(ValueError):
                    j07.validate_session(s)

    def test_receipt_negative(self):
        mutations = [
            ("session", lambda r: r.update(sessionDigest="0"*64)),
            ("parent", lambda r: r.update(parentDigest="0"*64)),
            ("unknown cost", lambda r: r.update(costStatus="UNKNOWN")),
            ("false evidence", lambda r: r.update(costEvidenceRef=None)),
            ("time", lambda r: r.update(durationSeconds=901)),
            ("process", lambda r: r.update(sameBlenderProcess=False)),
            ("missing render", lambda r: r["outputs"].pop()),
            ("duplicate", lambda r: r["outputs"][1].update(id="master")),
            ("mime", lambda r: r["outputs"][1].update(mime="text/html")),
            ("hash", lambda r: r["outputs"][1].update(sha256="bad")),
            ("size", lambda r: r["outputs"][1].update(bytes=999)),
            ("approval", lambda r: r["authority"].update(artisticApproval=True)),
            ("review", lambda r: r.update(qualityReviewRef="fixture-review")),
            ("stop", lambda r: r.update(status="STOPPED", stopReason="STOP")),
            ("path", lambda r: r["outputs"][0].update(id="../file")),
        ]
        for name, change in mutations:
            with self.subTest(name=name):
                s, r = sample()
                change(r)
                with self.assertRaises(ValueError):
                    j07.validate_receipt(s, r)


if __name__ == "__main__":
    unittest.main()
