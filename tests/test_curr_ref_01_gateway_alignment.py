"""F-R3a evidence structure only; no cross-repository runtime authorization."""
import copy
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RECEIPT = ROOT / "docs/research/curr-ref-01-f-r3a-raccordo-gateway.json"

BOUNDARIES = {
    "runtimeAuthorized", "publicationAuthorized", "newPortal", "newResolver",
    "newCatalog", "changesMaster", "changesRuntime", "changesArena",
    "studentData", "automaticApproval",
}


def validate(record):
    assert record["status"] == "DESIGN_CANDIDATE_READ_ONLY"
    assert set(record["boundaries"]) == BOUNDARIES
    assert all(value is False for value in record["boundaries"].values())
    sources = record["sources"]
    ids = {s["id"] for s in sources}
    assert len(ids) == len(sources)
    assert ids == {"AG02", "AG03", "GATEWAY", "HUB", "HUB_ROUTE", "LOADER",
                   "PORTFOLIO", "KB", "KB_SCHEMA", "AWC"}
    for source in sources:
        assert re.fullmatch(r"[0-9a-f]{40}", source["observedHead"])
        assert re.fullmatch(r"[0-9a-f]{40}", source["blob"])
        assert source["repositoryRole"] in {"ATLAS", "TRAMA"}
        assert source["path"] and not source["path"].startswith("/")
    observation = record["observations"]
    assert observation["portalIds"] == ["curricolo", "esperienze", "studio"]
    assert observation["portalResolver"] == "AG03"
    assert observation["sceneAndAccessibleEntry"] == "GATEWAY"
    assert observation["hubPreviewOnly"] is True
    assert observation["studioDestinationBlocked"] is True
    assert observation["authorizedPathwayCount"] == 0
    assert observation["registeredPathwayCount"] == 2
    assert observation["knowledgeCandidateConcepts"] == 4
    assert observation["knowledgeCandidateResources"] == 5
    assert observation["knowledgeCandidateRelations"] == 1
    for field in ("recordOnlyResources", "rightsUnresolvedResources", "accessibilityUnverifiedResources"):
        assert observation[field] == observation["knowledgeCandidateResources"]
    assert observation["knowledgePublicEligibleCount"] == 0
    assert observation["unresolvedHistoricalObjectiveResourceIds"] == [
        "r-tec-001", "r-tec-002", "r-tec-003"
    ]
    assert observation["worldCatalogMode"] == "PLAN_ONLY"
    assert observation["worldReferenceId"] == "library.reference"
    deps = record["dependencies"]
    assert {(d["repositoryRole"], d["pr"]) for d in deps} == {
        ("ATLAS", 143), ("ATLAS", 144), ("TRAMA", 336),
        ("ATLAS", 136), ("ATLAS", 145)
    }
    assert all(d["state"] == "OPEN_NOT_MERGED" and
               re.fullmatch(r"[0-9a-f]{40}", d["head"]) for d in deps)
    assert {r["id"] for r in record["responsibilities"]} == {
        "Arena", "ATL-KB", "Studio Atlas", "AG-02/AG-03", "ASC/AWC"
    }
    assert [n["id"] for n in record["next"]] == ["F-R3b", "F-R3c", "F-R3d", "F-R3e"]
    assert all(n["requires"] and set(n["requires"]) <= ids for n in record["next"])


class GatewayAlignmentTests(unittest.TestCase):
    def setUp(self):
        self.record = json.loads(RECEIPT.read_text(encoding="utf-8"))

    def test_read_only_candidate(self):
        validate(self.record)

    def test_reject_publication_and_new_authorities(self):
        for key in BOUNDARIES:
            bad = copy.deepcopy(self.record)
            bad["boundaries"][key] = True
            with self.subTest(key=key), self.assertRaises(AssertionError):
                validate(bad)

    def test_reject_extra_portal_and_false_eligibility(self):
        for key, value in [
            ("portalIds", ["curricolo", "esperienze", "studio", "new"]),
            ("studioDestinationBlocked", False), ("hubPreviewOnly", False),
            ("knowledgePublicEligibleCount", 1), ("authorizedPathwayCount", 1),
            ("worldCatalogMode", "EXECUTE"),
        ]:
            bad = copy.deepcopy(self.record)
            bad["observations"][key] = value
            with self.subTest(key=key), self.assertRaises(AssertionError):
                validate(bad)

    def test_reject_stale_claim_or_missing_evidence(self):
        bad = copy.deepcopy(self.record)
        bad["dependencies"][0]["state"] = "MERGED"
        with self.assertRaises(AssertionError):
            validate(bad)
        bad = copy.deepcopy(self.record)
        bad["next"][0]["requires"].append("MISSING")
        with self.assertRaises(AssertionError):
            validate(bad)


if __name__ == "__main__":
    unittest.main()
