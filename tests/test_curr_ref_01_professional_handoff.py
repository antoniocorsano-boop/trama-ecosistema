import copy
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "docs/research"
HANDOFF = BASE / "curr-ref-01-e-r4-professional-review.json"

CURRENT_PROPOSALS = {
    "tec-sec1-2026-r2-n1",
    "tec-sec1-2026-r2-n2",
    "tec-sec1-2026-r2-n3",
    "tec-sec1-2026-r2-n4",
    "tec-sec1-2026-r2-verticalita",
}
SOURCE_RECEIPTS = {
    "ER1A": "curr-ref-01-e-r1-master-alignment.json",
    "ER1B": "curr-ref-01-e-r1b-technology-chains.json",
    "ER2A": "curr-ref-01-e-r2-nuclei-progression.json",
    "ER2B": "curr-ref-01-e-r2b-continuity.json",
    "ER3": "curr-ref-01-e-r3-infanzia.json",
}


def validate(p):
    assert p["schemaVersion"] == "trama.curr-ref-er4/v0.1"
    assert p["status"] == "HANDOFF_PREPARED_NO_HUMAN_VALIDATION"
    assert p["scope"] == "TECNOLOGIA_PILOT_AND_INFANZIA_WITH_VERTICALITY"
    m = p["master"]
    assert m["id"] == "CAN-CURR-MASTER-00" and m["version"] == "1.3"
    assert m["authorityState"] == "MATERIALIZED_NOT_IN_FORCE"
    assert (m["professionalValidation"], m["verticalReview"], m["readyForCollegio"]) == ("OPEN", "OPEN", "NOT_YET")
    assert m["approved"] is False

    arena = p["arena"]
    assert arena["revision"] == "d8b1bf43388cb5c4cdcc940b0c558bb128976c4c"
    assert arena["lifecycleContract"]["version"] == "1.2.0"
    assert arena["registry"]["version"] == "1.13.0"
    assert arena["reviewPilot"]["id"] == "TEC-SEC1-2026-01"
    assert arena["reviewPilot"]["revision"] == 2
    assert arena["reviewPilot"]["humanOutcome"] == "OPEN"
    assert arena["caseContract"]["path"] == "src/domain/curriculum/reviewCase.ts"
    assert arena["sessionContract"]["path"] == "src/domain/curriculum/caseWorkSession.ts"

    assert set(p["sources"]) == set(SOURCE_RECEIPTS) | {"ARENA_PILOT"}
    for k, filename in SOURCE_RECEIPTS.items():
        assert p["sources"][k] == "docs/research/" + filename
        assert (BASE / filename).is_file()

    registered = p["registeredProposals"]
    pending = p["pendingRegistrations"]
    assert len(registered) == 5
    assert {r["proposalRef"] for r in registered} == CURRENT_PROPOSALS
    assert len(pending) == 6 and all(r["proposalRef"] is None for r in pending)
    assert {r["id"] for r in registered + pending} == {
        "ER4-R2-N1", "ER4-R2-N2", "ER4-R2-N3", "ER4-R2-N4",
        "ER4-R2-VERTICALITA", "ER4-PROFILE", "ER4-SIX-GAPS",
        "ER4-PRIMARY-BRIDGE", "ER4-INF-FIELDS", "ER4-INF-BRIDGE", "ER4-OVERALL-VERTICAL"
    }
    assert all(r["type"] == "REGISTERED_PROPOSAL_REVIEW" and
               r["registration"] == "EXISTS_IN_ARENA_PILOT_R2" and
               r["opening"] == "NOT_OPENED_BY_THIS_HANDOFF" for r in registered)
    assert all(r["type"] == "REQUIRES_REGISTERED_PROPOSAL" and
               r["registration"] == "NOT_IN_PILOT_R2" and
               r["opening"] == "BLOCKED_UNTIL_QUALIFIED_TRIGGER_AND_REGISTRATION" for r in pending)

    for item in registered + pending:
        assert item["phase"] in {"H2_PROFESSIONAL_VALIDATION", "H3_VERTICAL_REVIEW"}
        assert item["sources"] and set(item["sources"]).issubset(p["sources"])
        assert item["ownerRole"] and item["question"] and item["checks"]
        assert item["decision"] == "PENDING_HUMAN_REVIEW"
        assert item["outcome"] is None
    assert next(x for x in registered if x["id"] == "ER4-R2-VERTICALITA")["scope"]["order"] == "secondaria"
    assert next(x for x in pending if x["id"] == "ER4-PRIMARY-BRIDGE")["scope"]["order"] == "primaria-to-secondaria"
    assert next(x for x in pending if x["id"] == "ER4-INF-FIELDS")["scope"]["order"] == "infanzia"
    assert next(x for x in pending if x["id"] == "ER4-INF-BRIDGE")["phase"] == "H3_VERTICAL_REVIEW"

    tech = p["technicalChecks"]
    assert {x["id"] for x in tech} == {"ER4-T1", "ER4-T2", "ER4-T3"}
    assert all(x["neverPromoteAuthority"] is True and x["sourceRefs"] for x in tech)

    w = p["workflow"]
    assert w["existingCycle"] == [
        "H1_APPLICABLE_CURRICULUM", "H2_PROFESSIONAL_VALIDATION",
        "H3_VERTICAL_REVIEW", "H4_INSTITUTIONAL_PROCESS",
        "H5_DIDACTIC_USE", "H6_PRACTICE_REVIEW"
    ]
    assert w["workSession"] == ["EXAMINE", "SHARE", "COMPARE", "RECORD_TEAM_OUTCOME"]
    assert w["entry"] == "EXISTING_ARENA_CURRICULUM_WORK_SESSION"
    assert w["trigger"] == "EXPLICIT_QUALIFIED_AND_HUMAN_OPENED"
    assert "CURRENT_PERSISTED_SHARE_FOR_COMPARE" in w["preconditions"]
    assert "VERTICAL_REVIEW_BEFORE_INSTITUTIONAL_PROPOSAL" in w["preconditions"]
    assert w["progressState"] == "NO_CASE_OPENED_NO_CONTRIBUTION_SHARED_NO_OUTCOME_RECORDED"
    assert len(w["decisions"]) == 4
    assert set(p["boundaries"]) == {
        "masterEdited", "arenaEdited", "reviewCaseCreated", "reviewTriggerCreated",
        "contributionPersisted", "teamOutcomeRecorded", "verticalOutcomeRecorded",
        "institutionalDecisionRecorded", "adoptionReceiptCreated", "professionalApproval",
        "automaticPromotion", "studentData", "publication"
    }
    assert all(v is False for v in p["boundaries"].values())

    er3 = json.loads((BASE / SOURCE_RECEIPTS["ER3"]).read_text(encoding="utf-8"))
    assert len(er3["fields"]) == 5
    assert sum(len(f["targets"]) for f in er3["fields"]) == 10
    er2b = json.loads((BASE / SOURCE_RECEIPTS["ER2B"]).read_text(encoding="utf-8"))
    assert sum(x["state"] == "REMAINS_NOT_SPECIFIC" for x in er2b["gapReview"]) == 6


class ProfessionalHandoffTests(unittest.TestCase):
    def setUp(self):
        self.p = json.loads(HANDOFF.read_text(encoding="utf-8"))

    def test_review_pack_and_existing_arena_contract(self):
        validate(self.p)

    def test_no_fake_existing_proposal_or_registered_case(self):
        for where, field, value in (
            ("pendingRegistrations", "proposalRef", "tec-sec1-2026-r2-n2"),
            ("pendingRegistrations", "registration", "EXISTS_IN_ARENA_PILOT_R2"),
            ("registeredProposals", "opening", "READY_TO_OPEN"),
        ):
            bad = copy.deepcopy(self.p)
            bad[where][0][field] = value
            with self.subTest(where=where, field=field), self.assertRaises(AssertionError):
                validate(bad)

    def test_no_implicit_human_outcome(self):
        for where, field, value in (
            ("registeredProposals", "outcome", "APPROVED"),
            ("pendingRegistrations", "decision", "CONFERMA"),
        ):
            bad = copy.deepcopy(self.p)
            bad[where][0][field] = value
            with self.subTest(field=field), self.assertRaises(AssertionError):
                validate(bad)
        bad = copy.deepcopy(self.p)
        bad["master"]["approved"] = True
        with self.assertRaises(AssertionError):
            validate(bad)

    def test_no_authority_or_student_data(self):
        for key in self.p["boundaries"]:
            bad = copy.deepcopy(self.p)
            bad["boundaries"][key] = True
            with self.subTest(key=key), self.assertRaises(AssertionError):
                validate(bad)

    def test_no_shortcut_across_phases(self):
        for field, value in (
            ("trigger", "AUTOMATIC"),
            ("entry", "NEW_EXTERNAL_REVIEW_PORTAL"),
            ("progressState", "REVIEW_COMPLETE"),
        ):
            bad = copy.deepcopy(self.p)
            bad["workflow"][field] = value
            with self.subTest(field=field), self.assertRaises(AssertionError):
                validate(bad)
        bad = copy.deepcopy(self.p)
        bad["workflow"]["existingCycle"][2] = "H4_INSTITUTIONAL_PROCESS"
        with self.assertRaises(AssertionError):
            validate(bad)
