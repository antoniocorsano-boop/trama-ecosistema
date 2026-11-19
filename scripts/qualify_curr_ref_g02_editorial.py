"""CURR-REF-01/G02 — Proiezione editoriale in sola lettura.

Prototipo offline: non è un'interfaccia di Registro Docente né un contratto
di trasferimento. Il master provvisorio non è mai promosso ad approvato.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_REL = "docs/research/curr-ref-01-g01-uda-valutazione.json"
CASE_REL = "docs/research/curr-ref-01-g02-editorial-case-v0.1.json"
EXPECTED_G01_BLOB = "9ca31126356280807f04a4f2553d16bf2b14af72"
EXPECTED_B25_BLOB = "4e0493bc161d5c0b7cd50d89f5105604eaf8ee0f"
EXPECTED_ASSESSMENT_BLOB = "29ae8d1d6b5c712192b41eadbce2fb1bf9e78de1"


def require(condition: bool, reason: str) -> None:
    if not condition:
        raise ValueError("G02_BLOCKED: " + reason)


def keys(value: object, expected: set[str], label: str) -> None:
    require(type(value) is dict and set(value) == expected, label + " keys")


def git_blob_sha(data: bytes) -> str:
    content = b"blob " + str(len(data)).encode("ascii") + bytes([0]) + data
    return hashlib.sha1(content).hexdigest()


def load_case() -> tuple[dict, dict, bytes]:
    source_bytes = (ROOT / SOURCE_REL).read_bytes()
    source = json.loads(source_bytes)
    case = json.loads((ROOT / CASE_REL).read_bytes())
    return source, case, source_bytes


def validate(source: dict, case: dict, source_bytes: bytes) -> None:
    keys(case, {"schemaVersion", "id", "status", "source", "criteriaRefs",
                "illustrations", "review", "boundaries"}, "case")
    require(case["schemaVersion"] == "trama.curr-ref-g02-editorial-case/v0.1", "schema")
    require(case["id"] == "CURR-REF-01/G02-B25", "case identity")
    require(case["status"] == "EDITORIAL_SIMULATION_NOT_OBSERVATION", "case status")

    pin = case["source"]
    keys(pin, {"g01Path", "g01GitBlob", "g01CaseId", "arenaMasterVersion",
               "arenaFingerprint", "docenteOsProjectionBlob",
               "registroEvidenceContractBlob"}, "source pin")
    require(pin["g01Path"] == SOURCE_REL and pin["g01CaseId"] == "CURR-REF-01/G01-B25",
            "G01 locator")
    require(pin["g01GitBlob"] == EXPECTED_G01_BLOB, "G01 expected pin")
    require(git_blob_sha(source_bytes) == EXPECTED_G01_BLOB, "G01 content drift")
    require(pin["docenteOsProjectionBlob"] == EXPECTED_B25_BLOB, "B25 source pin")
    require(pin["registroEvidenceContractBlob"] == EXPECTED_ASSESSMENT_BLOB,
            "Registro contract pin")
    require(pin["arenaMasterVersion"] == "1.3" and pin["arenaFingerprint"] == "b355be71",
            "Arena master pin")
    require(source["id"] == "CURR-REF-01/G01", "G01 identity")
    require(source["status"] == "READ_ONLY_DESIGN_REVIEW_NO_PRODUCT_INTEGRATION",
            "G01 read-only provenance")
    authority = source["authority"]
    require(authority["sourceOfTruth"] == "ARENA", "authority source")
    require(authority["version"] == pin["arenaMasterVersion"] and
            authority["fingerprint"] == pin["arenaFingerprint"], "authority drift")
    require(authority["state"] == "PROVISIONAL_COMPLETE_NOT_IN_FORCE" and
            authority["professionalReview"] == "OPEN", "institutional authority")

    expected_sources = {
        ("DOCENTE_OS", "product/src/core/presentation/human-task-approved-projections-b23-b27.ts"):
            EXPECTED_B25_BLOB,
        ("REGISTRO_DOCENTE", "src/assessment/assessmentEvidence.ts"):
            EXPECTED_ASSESSMENT_BLOB,
    }
    actual = {(product["product"], item["path"]): item["blob"]
              for product in source["productEvidence"]
              for item in product["sources"]}
    for identity, sha in expected_sources.items():
        require(actual.get(identity) == sha, "upstream source pin " + identity[0])

    base = source["example"]
    require(base["id"] == pin["g01CaseId"] and
            base["status"] == "SYNTHETIC_PLANNING_EXAMPLE_NOT_RECORDED_AS_OBSERVATION",
            "G01 case status")
    reference = base["masterReference"]
    require(reference["masterVersion"] == "1.3" and
            reference["state"] == "NOT_APPROVED_OR_BINDABLE" and
            reference["referenceKind"] == "LOCAL_COMPETENCE_CANDIDATE" and
            reference["referenceText"] == "confrontare soluzioni", "provisional reference")
    lesson = base["docenteOs"]
    require(lesson["projectionId"] == "HTC-PRIMA-B25-PLAN-v1" and
            lesson["uda"] == "CAN-UDA-1-05" and lesson["block"] == "B25" and
            lesson["durationMinutes"] == 120 and
            lesson["sourceAlignment"] == "COMPOSED", "lesson identity")
    require(lesson["sourceType"] ==
            "APPROVED_HUMAN_TASK_LESSON_NOT_CURRICOLO_AUTHORITY", "lesson status")
    require(lesson["actualStudentEvidence"] == [], "student evidence in upstream source")
    require(lesson["expectedProduct"] == "Matrice di scelta motivata.", "B25 output")
    require(base["observationProtocol"]["assessmentGrade"] == "NOT_CREATED" and
            base["observationProtocol"]["competenceJudgement"] == "NOT_CREATED", 
            "assessment authority")
    require(source["crossProductRules"]["exportRule"] ==
            "NO_GENERAL_INTEROP_TRANSFORMATION_CONFIRMED", "no verified interchange")

    criteria = base["candidateCriteria"]
    require(len(criteria) == 2 and type(criteria) is list, "criteria count")
    require(type(case["criteriaRefs"]) is list and
            case["criteriaRefs"] == [item["id"] for item in criteria] and
            len(set(case["criteriaRefs"])) == 2, "criteria references")
    require([item["focus"] for item in criteria] == ["process", "argumentation"] and
            all(item["teacherDecision"] == "PENDING" for item in criteria),
            "unapproved criteria")

    illustrations = case["illustrations"]
    require(type(illustrations) is list and len(illustrations) == 2,
            "illustrations count")
    require({item["criterionRef"] for item in illustrations} == set(case["criteriaRefs"]),
            "illustrations criteria binding")
    for item in illustrations:
        keys(item, {"id", "criterionRef", "kind", "state", "title", "example"},
             "illustration")
        require(item["id"] in {"ILL-G02-PROCESS", "ILL-G02-ARGUMENTATION"},
                "illustration ID")
        require(item["state"] == "SYNTHETIC_NOT_OBSERVED", "illustration state")
        linked = next((c for c in criteria if c["id"] == item["criterionRef"]), None)
        require(linked is not None and item["kind"] == linked["focus"],
                "criterion semantics")
        require(type(item["title"]) is str and bool(item["title"].strip()) and
                type(item["example"]) is str and bool(item["example"].strip()),
                "illustration text")
    require(len({x["id"] for x in illustrations}) == 2, "duplicate illustration")
    keys(case["review"], {"teacherDecision", "professionalOutcome",
                           "registrableInRegistro", "canCreateGrade",
                           "canAssessCompetence"}, "review")
    require(case["review"] == {
        "teacherDecision": "PENDING", "professionalOutcome": "OPEN",
        "registrableInRegistro": False, "canCreateGrade": False,
        "canAssessCompetence": False,
    }, "review is not professional approval")
    boundaries = case["boundaries"]
    keys(boundaries, {"editorialOnly", "sourceOfTruth", "publicExposure",
                      "runtimeIntegration", "liveObservations",
                      "individualRecords", "automaticTransfer",
                      "automaticScore", "authorizationToPublish"}, "boundaries")
    require(boundaries == {
        "editorialOnly": True, "sourceOfTruth": "ARENA",
        "publicExposure": False, "runtimeIntegration": False,
        "liveObservations": False, "individualRecords": False,
        "automaticTransfer": False, "automaticScore": False,
        "authorizationToPublish": False,
    }, "no export or promotion")


def project_editorial(source: dict, case: dict, source_bytes: bytes,
                      *, surface: str) -> dict:
    """Produce an offline presentation only; never mutate files or inputs."""
    require(surface == "EDITORIAL", "surface must be EDITORIAL")
    validate(source, case, source_bytes)
    base = source["example"]
    lesson = base["docenteOs"]
    master = base["masterReference"]
    illustrations = {x["criterionRef"]: x for x in case["illustrations"]}
    return {
        "schemaVersion": "trama.curr-ref-g02-editorial-preview/v0.1",
        "status": "NON_PUBLISHABLE_EDITORIAL_PREVIEW",
        "caseId": case["id"],
        "provenance": {
            "g01GitBlob": case["source"]["g01GitBlob"],
            "docenteOsProjectionBlob": case["source"]["docenteOsProjectionBlob"],
            "registroEvidenceContractBlob": case["source"]["registroEvidenceContractBlob"],
        },
        "curricolo": {
            "source": "ARENA", "masterVersion": master["masterVersion"],
            "fingerprint": case["source"]["arenaFingerprint"],
            "schoolOrder": "secondaria-di-primo-grado", "grade": base["grade"],
            "sourceSection": master["sourceSection"],
            "reference": master["referenceText"],
            "referenceKind": "LOCAL_COMPETENCE_CANDIDATE",
            "authority": "PROVISIONAL_COMPLETE_NOT_IN_FORCE",
            "bindable": False,
        },
        "lesson": {
            "product": "DOCENTE_OS", "projectionId": lesson["projectionId"],
            "uda": lesson["uda"], "block": lesson["block"],
            "title": lesson["title"], "minutes": lesson["durationMinutes"],
            "objective": lesson["objective"],
            "expectedProduct": lesson["expectedProduct"],
            "sourceAlignment": lesson["sourceAlignment"],
        },
        "criteria": [
            {
                "id": criterion["id"], "focus": criterion["focus"],
                "description": criterion["description"],
                "expectedEvidence": criterion["expectedEvidence"],
                "status": "PENDING_TEACHER_REVIEW",
                "illustration": {
                    "title": illustrations[criterion["id"]]["title"],
                    "example": illustrations[criterion["id"]]["example"],
                    "status": "SYNTHETIC_NOT_OBSERVED",
                },
            } for criterion in base["candidateCriteria"]
        ],
        "decisions": {
            "teacherReview": "PENDING",
            "studentObservation": None,
            "numericGrade": None,
            "competenceJudgement": None,
            "integrationAuthorized": False,
            "externalTransfer": False,
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--surface", required=True, choices=["EDITORIAL", "PUBLIC", "RUNTIME"])
    args = parser.parse_args()
    source, case, raw = load_case()
    result = project_editorial(source, case, raw, surface=args.surface)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
