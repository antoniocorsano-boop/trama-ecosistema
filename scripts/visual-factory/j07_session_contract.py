"""J07 BLENDER_FINISH: offline contract validation, no process or network access.

This is not a runtime admission, orchestrator, or executable Blender agent.
All refs are opaque evidence identifiers; no supplied filesystem path or URL.
"""
import hashlib
import json
import re

SCHEMA = "trama.visual-3d-j07-session/v0.1"
RECEIPT_SCHEMA = "trama.visual-3d-j07-receipt/v0.1"
OPS = frozenset({"inspect", "apply_reviewed_patch", "render", "snapshot", "reopen"})
AUTHORITY = frozenset({"artisticApproval", "publicationAuthorized", "studentAuthorized",
                       "runtimeQualified", "autonomousAgentQualified"})
HEX = re.compile(r"[0-9a-f]{64}")
REF = re.compile(r"[A-Za-z0-9][A-Za-z0-9._:-]{0,159}")
MIME = {"master": "application/x-blender", "render": "image/png",
        "diagnostic": "application/json"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def keys(value, required):
    require(type(value) is dict and set(value) == set(required), "unexpected/missing fields")


def digest(value):
    require(type(value) is str and HEX.fullmatch(value), "invalid SHA-256")
    return value


def ref(value):
    require(type(value) is str and REF.fullmatch(value) and ".." not in value, "invalid evidence identifier")
    return value


def integer(value, low, high):
    require(type(value) is int and low <= value <= high, "integer outside bound")
    return value


def false_authority(value):
    keys(value, AUTHORITY)
    require(all(v is False for v in value.values()), "authority escalation")


def canonical_digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"),
                                     ensure_ascii=True, allow_nan=False).encode()).hexdigest()


def validate_session(s):
    keys(s, {"schema", "job", "sessionId", "requestDigest", "referenceDigest",
             "baseSceneDigest", "adapterRevision", "runtimeEvidenceRef",
             "computeAdmissionRef", "rightsEvidenceRef", "costClass", "mode",
             "cycle", "maxCycles", "limits", "isolation", "allowedOps", "authority"})
    require(s["schema"] == SCHEMA and s["job"] == "J07", "wrong contract/job")
    for k in ("sessionId", "runtimeEvidenceRef", "computeAdmissionRef", "rightsEvidenceRef"):
        ref(s[k])
    for k in ("requestDigest", "referenceDigest", "baseSceneDigest", "adapterRevision"):
        digest(s[k])
    require(s["costClass"] == "FREE_ONLY", "cost policy")
    require(s["mode"] == "artist_directed", "autonomous mode unqualified")
    integer(s["maxCycles"], 1, 2)
    integer(s["cycle"], 1, s["maxCycles"])
    limits = s["limits"]
    keys(limits, {"wallSeconds", "cpu", "ramMiB", "outputBytes"})
    integer(limits["wallSeconds"], 1, 900)
    integer(limits["cpu"], 1, 4)
    integer(limits["ramMiB"], 1, 6144)
    integer(limits["outputBytes"], 1, 512 * 1024**2)
    isolation = s["isolation"]
    keys(isolation, {"network", "nonPrivileged", "rootReadonly", "inputReadonly",
                     "credentialsAbsent", "externalServicesDisabled"})
    require(isolation["network"] == "none" and all(
        isolation[k] is True for k in isolation if k != "network"), "isolation incomplete")
    ops = s["allowedOps"]
    require(type(ops) is list and all(type(op) is str for op in ops)
            and len(ops) == len(set(ops)) and set(ops) == OPS, "operation allowlist")
    false_authority(s["authority"])
    return canonical_digest(s)


def validate_receipt(session, receipt):
    sd = validate_session(session)
    keys(receipt, {"schema", "sessionDigest", "sessionId", "status", "costStatus",
                   "costEvidenceRef", "isolationEvidenceRef", "durationSeconds",
                   "sameBlenderProcess", "parentDigest", "outputs", "authority",
                   "qualityReviewRef", "stopReason"})
    require(receipt["schema"] == RECEIPT_SCHEMA and receipt["sessionDigest"] == sd
            and receipt["sessionId"] == session["sessionId"], "session mismatch")
    require(receipt["parentDigest"] == session["baseSceneDigest"], "parent mismatch")
    false_authority(receipt["authority"])
    require(receipt["qualityReviewRef"] is None, "review belongs to separate gate")
    require(receipt["costStatus"] in ("VERIFIED_ZERO", "UNKNOWN"), "cost status")
    ref(receipt["isolationEvidenceRef"])
    integer(receipt["durationSeconds"], 0, session["limits"]["wallSeconds"])
    require(type(receipt["sameBlenderProcess"]) is bool, "invalid persistence flag")
    outputs = receipt["outputs"]
    require(type(outputs) is list and len(outputs) <= 16, "output count")
    names = set()
    total = 0
    kinds = []
    for output in outputs:
        keys(output, {"id", "kind", "mime", "sha256", "bytes"})
        name = ref(output["id"])
        require(name not in names, "duplicate output")
        names.add(name)
        kind = output["kind"]
        require(type(kind) is str and kind in MIME and output["mime"] == MIME[kind],
                "output kind/mime mismatch")
        digest(output["sha256"])
        total += integer(output["bytes"], 1, session["limits"]["outputBytes"])
        kinds.append(kind)
    require(total <= session["limits"]["outputBytes"], "output budget")
    status = receipt["status"]
    if status == "CANDIDATE_REVIEW_REQUIRED":
        require(receipt["costStatus"] == "VERIFIED_ZERO", "unverified cost")
        ref(receipt["costEvidenceRef"])
        require(receipt["sameBlenderProcess"] is True and receipt["stopReason"] is None,
                "incomplete session")
        require(kinds.count("master") == 1 and kinds.count("render") >= 2,
                "missing master or comparative renders")
    elif status == "STOPPED":
        ref(receipt["stopReason"])
        if receipt["costStatus"] == "VERIFIED_ZERO":
            ref(receipt["costEvidenceRef"])
        else:
            require(receipt["costEvidenceRef"] is None, "unknown cost cannot assert evidence")
        require(all(k == "diagnostic" for k in kinds), "stopped run cannot promote output")
    else:
        raise ValueError("unsupported outcome")
    return canonical_digest(receipt)
