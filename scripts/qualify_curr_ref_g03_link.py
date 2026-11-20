"""G03: contract for a non-personal didactic reference, not a Registro import.

Reuses the existing G02 source proof. Runs offline, in read-only mode; it
does not create criteria revisions, teacher attestations or observations.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from qualify_curr_ref_g02_editorial import (
    ROOT, CASE_REL, git_blob_sha, load_case, project_editorial,
)

G03_REL = "docs/research/curr-ref-01-g03-activity-link-v0.1.json"
G02_BLOB = "39503599adfce38fd34e1a4ef0eaf4680f128a0a"


def require(condition: bool, explanation: str) -> None:
    if not condition:
        raise ValueError("G03_BLOCKED: " + explanation)


def exact_keys(value: object, required: set[str], label: str) -> None:
    require(type(value) is dict and set(value.keys()) == required, label + ": unexpected fields")


def scalar_id(value: object) -> bool:
    return type(value) is str and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._:-]{0,127}", value) is not None


def validate_link(manifest: dict, g01: dict, preview: dict, case_raw: bytes) -> None:
    """Validate one provenance-pinned proof without deriving an approval."""
    exact_keys(manifest, {"schemaVersion", "id", "status", "origin", "links",
                          "safety", "next"}, "manifest")
    require(manifest["schemaVersion"] == "trama.curr-ref-g03-activity-link/v0.1",
            "schema version")
    require(manifest["id"] == "CURR-REF-01/G03", "proposal ID")
    require(manifest["status"] == "EDITORIAL_CANDIDATE_ONLY", "proposal status")
    origin = manifest["origin"]
    exact_keys(origin, {"g02Path", "g02GitBlob", "g02CaseId", "matchingPolicy"},
               "source locator")
    require(origin == {
        "g02Path": CASE_REL,
        "g02GitBlob": G02_BLOB,
        "g02CaseId": preview["caseId"],
        "matchingPolicy": "EXACT_SOURCE_PINS_REQUIRED",
    }, "source locator drift")
    require(git_blob_sha(case_raw) == G02_BLOB, "G02 file was revised")

    safety = manifest["safety"]
    require(safety == {
        "readOnly": True, "publicFacing": False, "runtimeEnabled": False,
        "registerImportEnabled": False, "automaticConfirmation": False,
        "personalDataIncluded": False, "studentsObserved": False,
        "gradesGenerated": False, "competenceCertifications": False,
        "retainsSourceProvenance": True,
    }, "unsafe permissions")
    exact_keys(manifest["next"], {"name", "needs"}, "next")
    require(manifest["next"]["name"] == "G03 verification" and
            manifest["next"]["needs"] ==
            "review teacher criteria and authorized consumer integration separately",
            "next state")
    links = manifest["links"]
    require(type(links) is list and len(links) == 1,
            "one pinned activity in current G02 evidence")
    link = links[0]
    exact_keys(link, {"linkId", "scope", "activity", "curricolo", "criteriaRefs",
                      "relation", "rationaleCode", "teacherReview",
                      "usableForAssessment"}, "link")
    require(scalar_id(link["linkId"]), "link ID")
    require(link["relation"] == "PROPOSED_DIDACTIC_ALIGNMENT" and
            link["rationaleCode"] ==
            "ACTIVITY_RELEVANT_TO_LOCAL_COMPETENCE_CANDIDATE",
            "unapproved semantic mapping")
    require(link["teacherReview"] == "PENDING" and
            link["usableForAssessment"] is False,
            "teacher authority")
    scope = link["scope"]
    exact_keys(scope, {"schoolYear", "schoolOrder", "grade", "discipline",
                       "regime"}, "scope")
    require(scope == {
        "schoolYear": g01["example"]["schoolYear"],
        "schoolOrder": preview["curricolo"]["schoolOrder"],
        "grade": preview["curricolo"]["grade"],
        "discipline": g01["example"]["domain"],
        "regime": g01["example"]["normativeRegime"],
    }, "school context or regime mismatch")
    activity = link["activity"]
    exact_keys(activity, {"product", "planCode", "udaCode", "blockId",
                          "projectionId"}, "activity")
    expected_activity = g01["example"]["docenteOs"]
    require(activity == {
        "product": preview["lesson"]["product"],
        "planCode": expected_activity["plan"],
        "udaCode": preview["lesson"]["uda"],
        "blockId": preview["lesson"]["block"],
        "projectionId": preview["lesson"]["projectionId"],
    }, "activity identity mismatch")
    require(activity["product"] == "DOCENTE_OS", "source product")
    curricolo = link["curricolo"]
    exact_keys(curricolo, {"product", "masterVersion", "masterFingerprint",
                          "bandRef", "sourceSection", "referenceKind",
                          "referenceText", "authority"}, "curricolo")
    upstream = g01["example"]["masterReference"]
    require(curricolo == {
        "product": "ARENA", "masterVersion": preview["curricolo"]["masterVersion"],
        "masterFingerprint": preview["curricolo"]["fingerprint"],
        "bandRef": upstream["bandId"],
        "sourceSection": preview["curricolo"]["sourceSection"],
        "referenceKind": preview["curricolo"]["referenceKind"],
        "referenceText": preview["curricolo"]["reference"],
        "authority": preview["curricolo"]["authority"],
    }, "curricolo provenance mismatch")
    require(curricolo["authority"] == "PROVISIONAL_COMPLETE_NOT_IN_FORCE" and
            upstream["state"] == "NOT_APPROVED_OR_BINDABLE" and
            preview["curricolo"]["bindable"] is False,
            "unapproved source cannot bind")
    criteria = link["criteriaRefs"]
    expected_criteria = [c["id"] for c in preview["criteria"]]
    require(type(criteria) is list and criteria == expected_criteria and
            len(criteria) > 0 and len(criteria) == len(set(criteria)) and
            all(scalar_id(item) for item in criteria),
            "missing/duplicate/unreviewed criterion")


def render_reference_link(manifest: dict, *, surface: str = "EDITORIAL") -> dict:
    """Return a portable reference proposal with NO observation or confirmation."""
    require(surface == "EDITORIAL", "only offline EDITORIAL is supported")
    g01, g02, g01raw = load_case()
    case_raw = (ROOT / CASE_REL).read_bytes()
    preview = project_editorial(g01, g02, g01raw, surface="EDITORIAL")
    validate_link(manifest, g01, preview, case_raw)
    link = manifest["links"][0]
    activity = link["activity"]
    return {
        "schemaVersion": "trama.curr-ref-g03-reference-view/v0.1",
        "status": "EDITORIAL_PROPOSAL_NOT_IMPORTABLE",
        "linkId": link["linkId"],
        "activityRef": {
            "sourceProduct": activity["product"],
            "schoolYear": link["scope"]["schoolYear"],
            "schoolOrder": link["scope"]["schoolOrder"],
            "discipline": link["scope"]["discipline"],
            "grade": link["scope"]["grade"],
            "regime": link["scope"]["regime"],
            "planCode": activity["planCode"],
            "udaCode": activity["udaCode"],
            "blockId": activity["blockId"],
            "projectionId": activity["projectionId"],
            "sourceGitBlob": preview["provenance"]["docenteOsProjectionBlob"],
        },
        "curricoloRef": {
            "sourceProduct": "ARENA",
            "masterVersion": link["curricolo"]["masterVersion"],
            "fingerprint": link["curricolo"]["masterFingerprint"],
            "bandRef": link["curricolo"]["bandRef"],
            "reference": link["curricolo"]["referenceText"],
            "referenceKind": link["curricolo"]["referenceKind"],
            "authority": "PROVISIONAL_COMPLETE_NOT_IN_FORCE",
            "bindable": False,
        },
        "plannedLesson": {
            "title": preview["lesson"]["title"],
            "objective": preview["lesson"]["objective"],
            "expectedProduct": preview["lesson"]["expectedProduct"],
        },
        "criterionCandidates": [
            {
                "ref": item["id"],
                "focus": item["focus"],
                "description": item["description"],
                "expectedEvidence": item["expectedEvidence"],
                "approval": "PENDING_TEACHER_REVIEW",
            } for item in preview["criteria"]
        ],
        "provenance": {
            "g02GitBlob": manifest["origin"]["g02GitBlob"],
            "g01GitBlob": preview["provenance"]["g01GitBlob"],
            "registroContractGitBlob": preview["provenance"]["registroEvidenceContractBlob"],
        },
        "permissions": {
            "view": "OFFLINE_EDITORIAL_ONLY",
            "registroImport": False,
            "externalTransfer": False,
            "teacherConfirmation": None,
            "grade": None,
            "competenceJudgement": None,
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--surface", choices=("EDITORIAL", "PUBLIC", "RUNTIME"),
                        required=True)
    args = parser.parse_args()
    manifest = json.loads((ROOT / G03_REL).read_text(encoding="utf-8"))
    print(json.dumps(render_reference_link(manifest, surface=args.surface),
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
