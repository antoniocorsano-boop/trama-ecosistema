#!/usr/bin/env python3
"""Readiness diagnostics only; supplied receipts are not trusted authorizations."""
import argparse
import json
import re
from pathlib import Path

from free_deploy_fixture import ARCHIVE_SHA, FILES, ORIGIN

HOST = "trama-fd02.pages.dev"
UUID = re.compile(r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}", re.I)
FALSE_FLAGS = ("deployAuthorized", "studentPublicationAuthorized",
               "costVerified", "quotaVerified", "privacyQualified")


def no_conflicting_claims(receipt):
    return all(key not in receipt or receipt[key] is False for key in FALSE_FLAGS)


def matches_metadata(receipt):
    return (isinstance(receipt, dict)
            and receipt.get("state") == "PROJECT_METADATA_PASS"
            and receipt.get("project") == "trama-fd02"
            and receipt.get("hostname") == HOST
            and receipt.get("productionBranch") == "main"
            and isinstance(receipt.get("currentProductionDeploymentId"), str)
            and UUID.fullmatch(receipt["currentProductionDeploymentId"]) is not None
            and receipt.get("readOnly") is True
            and receipt.get("writesPerformed") is False
            and receipt.get("syntheticOnly") is True
            and no_conflicting_claims(receipt))


def matches_remote(receipt):
    return (isinstance(receipt, dict)
            and receipt.get("state") == "REMOTE_BYTES_VERIFIED"
            and receipt.get("fixture") == "FD-02/1.0.1"
            and receipt.get("origin") == ORIGIN
            and receipt.get("archiveSha256") == ARCHIVE_SHA
            and type(receipt.get("fileCount")) is int
            and receipt["fileCount"] == len(FILES)
            and receipt.get("syntheticOnly") is True
            and no_conflicting_claims(receipt))


def assess(*, metadata=None, remote=None, human_mobile_pass=False):
    """Report structural matches, not provenance, freshness, or live verification."""
    meta = matches_metadata(metadata)
    live = matches_remote(remote)
    blockers = []
    if not meta:
        blockers.append("METADATA_EVIDENCE_MISSING_OR_INVALID")
    if not live:
        blockers.append("REMOTE_BYTES_EVIDENCE_MISSING_OR_INVALID")
    blockers.extend((
        "EVIDENCE_PROVENANCE_AND_FRESHNESS_NOT_QUALIFIED",
        "ACCOUNT_FREE_ONLY_UNQUALIFIED",
        "ACCOUNT_QUOTA_UNQUALIFIED",
        "WRITE_PERMISSION_NOT_QUALIFIED",
        "ROLLBACK_NOT_QUALIFIED",
        "RESTRICTED_ACCESS_NOT_QUALIFIED",
        "EXACT_DEPLOY_AUTHORIZATION_MISSING",
    ))
    return {
        "schema": "trama.free-deploy.readiness-report/v1",
        "state": "NOT_AUTHORIZED",
        "fixture": "FD-02/1.0.1",
        "syntheticOnly": True,
        "observations": {
            "metadataReceiptMatches": meta,
            "remoteBytesReceiptMatches": live,
            "humanMobilePassReported": human_mobile_pass is True,
        },
        "blockers": blockers,
        **dict.fromkeys(FALSE_FLAGS, False),
        "writesPerformed": False,
    }


def read_receipt(path):
    if path is None:
        return None
    with Path(path).open("rb") as handle:
        data = handle.read(65537)
    if len(data) > 65536:
        raise ValueError("RECEIPT_TOO_LARGE")
    return json.loads(data)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--metadata", type=Path)
    parser.add_argument("--remote", type=Path)
    parser.add_argument("--human-mobile-pass-reported", action="store_true")
    args = parser.parse_args()
    try:
        report = assess(metadata=read_receipt(args.metadata),
                        remote=read_receipt(args.remote),
                        human_mobile_pass=args.human_mobile_pass_reported)
    except (OSError, ValueError, RecursionError):
        parser.exit(1, "STOP_RECEIPT_INPUT\n")
    print(json.dumps(report, indent=2))
    # Never permit use of a successful process exit as deployment authority.
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
