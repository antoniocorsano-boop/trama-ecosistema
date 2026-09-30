#!/usr/bin/env python3
"""Collect the qualified Atlas R1 component-isolation evidence from public GitHub metadata.

Read-only pilot adapter for TRAMA Component Evidence Lane v2.
No token, write capability, promotion or repository mutation is used.
"""

from __future__ import annotations

import json
import sys
import urllib.request
from datetime import datetime, timezone

REPOSITORY = "antoniocorsano-boop/Curriculum-Atlas"
RUN_ID = "36671130676"
EXPECTED_HEAD = "fe43bb037ae0bd5bc13aba40e17875d1673667c2"
EXPECTED_ARTIFACT_ID = "11078325536"
EXPECTED_DIGEST = "sha256:3a664cea8d53ea87eed192afefc756a1d67eaf6ad3fd43b9d9a01d85405ec2a5"
SOURCE_REF = "scripts/capture-atlas-component-isolation.mjs"
COMPONENTS = (
    "ATLAS.RELATION_EXPLORER.FAMILY",
    "ATLAS.CURRICULUM_TREE.DISCLOSURE",
)


class LiveAtlasEvidenceError(RuntimeError):
    pass


def fetch_json(url: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "TRAMA-Control-Center-Live-Evidence-R1",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def collect() -> dict:
    base = f"https://api.github.com/repos/{REPOSITORY}"
    run = fetch_json(f"{base}/actions/runs/{RUN_ID}")
    if run.get("conclusion") != "success":
        raise LiveAtlasEvidenceError("ATLAS_R1_RUN_NOT_SUCCESS")
    if run.get("head_sha") != EXPECTED_HEAD:
        raise LiveAtlasEvidenceError("ATLAS_R1_EXACT_HEAD_MISMATCH")

    artifacts_payload = fetch_json(f"{base}/actions/runs/{RUN_ID}/artifacts")
    artifact = next(
        (
            item
            for item in artifacts_payload.get("artifacts", [])
            if str(item.get("id")) == EXPECTED_ARTIFACT_ID
        ),
        None,
    )
    if artifact is None:
        raise LiveAtlasEvidenceError("ATLAS_R1_ARTIFACT_MISSING")
    if artifact.get("expired") is True:
        raise LiveAtlasEvidenceError("ATLAS_R1_ARTIFACT_EXPIRED")
    if artifact.get("digest") != EXPECTED_DIGEST:
        raise LiveAtlasEvidenceError("ATLAS_R1_ARTIFACT_DIGEST_MISMATCH")

    observed_at = datetime.now(timezone.utc).isoformat()
    items = []
    for component_id in COMPONENTS:
        items.append(
            {
                "componentId": component_id,
                "evidenceType": "ISOLATED",
                "status": "PRESENT",
                "repository": REPOSITORY,
                "exactHead": EXPECTED_HEAD,
                "sourceRef": SOURCE_REF,
                "runId": RUN_ID,
                "runConclusion": "SUCCESS",
                "artifactId": EXPECTED_ARTIFACT_ID,
                "artifactDigest": EXPECTED_DIGEST,
            }
        )
    return {
        "schemaVersion": "trama.live-component-evidence-overlay/v1",
        "observedAt": observed_at,
        "status": "COMPLETE",
        "items": items,
    }


def main() -> int:
    try:
        payload = collect()
    except Exception as exc:
        print(f"TRAMA_ATLAS_LIVE_COMPONENT_EVIDENCE_UNAVAILABLE: {exc}", file=sys.stderr)
        return 1
    json.dump(payload, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
