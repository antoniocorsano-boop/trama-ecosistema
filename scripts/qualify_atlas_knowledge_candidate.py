"""Read-only qualification of the Atlas record-only candidate. No publication or writes."""
import copy
import hashlib
import json
import re
import unicodedata
import unittest
from pathlib import Path
from jsonschema import Draft202012Validator, ValidationError

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = json.loads((ROOT / "schemas/atlas-knowledge-candidate.v0.1.schema.json").read_text(encoding="utf-8"))
FIXTURE = ROOT / "docs/capabilities/atlas-knowledge/fixtures/existing-atlas-candidate-v0.1.json"
SCHEMA_V2 = json.loads((ROOT / "schemas/atlas-knowledge-candidate.v0.2.schema.json").read_text(encoding="utf-8"))
FIXTURE_V2 = ROOT / "docs/capabilities/atlas-knowledge/fixtures/existing-atlas-candidate-v0.2.json"
VERSION_V2 = "atlas.knowledge-candidate/v0.2"

def normalize(text):
    text = unicodedata.normalize("NFKD", text.casefold())
    return " ".join(re.findall(r"[a-z0-9]+", "".join(c for c in text if not unicodedata.combining(c))))

def validate(data):
    schema = SCHEMA_V2 if data.get("schemaVersion") == VERSION_V2 else SCHEMA
    Draft202012Validator.check_schema(schema)
    Draft202012Validator(schema).validate(data)
    concepts = {c["id"]: c for c in data["concepts"]}
    resources = {r["id"]: r for r in data["resources"]}
    if len(concepts) != len(data["concepts"]) or len(resources) != len(data["resources"]):
        raise ValueError("duplicate identifier")
    names = {}
    for c in concepts.values():
        for label in [c["title"], *c["aliases"]]:
            key = normalize(label)
            if not key or (key in names and names[key] != c["id"]):
                raise ValueError("ambiguous concept label")
            names[key] = c["id"]
    edges = {k: set() for k in concepts}
    seen = set()
    for rel in data["relations"]:
        a, b, kind = rel["from"], rel["to"], rel["kind"]
        if a not in concepts or b not in concepts or a == b:
            raise ValueError("invalid relation endpoint")
        key = (kind, *sorted([a, b])) if kind == "related_to" else (kind, a, b)
        if key in seen:
            raise ValueError("duplicate relation")
        seen.add(key)
        if kind in ("prerequisite_of", "broader_than"):
            edges[a].add(b)
    visiting, done = set(), set()
    def visit(node):
        if node in visiting:
            raise ValueError("hierarchy or prerequisite cycle")
        if node in done:
            return
        visiting.add(node)
        for target in edges[node]:
            visit(target)
        visiting.remove(node)
        done.add(node)
    for node in edges:
        visit(node)
    for r in resources.values():
        if not set(r["conceptIds"]) <= concepts.keys():
            raise ValueError("unknown concept")
        ids = [m["objectiveId"] for m in r["mappings"]]
        if len(ids) != len(set(ids)):
            raise ValueError("duplicate objective")
    if data["schemaVersion"] == VERSION_V2:
        validate_alignment(data)
    return data

def validate_alignment(data):
    ev = data["alignmentEvidence"]
    bands = {b["id"]: b for b in ev["bands"]}
    if len(bands) != len(ev["bands"]):
        raise ValueError("duplicate band evidence")
    for b in bands.values():
        ordinals = [o["ordinal"] for o in b["objectives"]]
        if len(ordinals) != len(set(ordinals)):
            raise ValueError("duplicate source ordinal")
    # This is a deliberately narrow, pinned pilot. Source changes need a new review.
    expected = {
        "masterVersion": "1.3", "fingerprint": "b355be71",
        "sourceBlob": "d1ab3fd860db9c043452e62359e404e4c9b94bfd",
        "arenaRevision": "d8b1bf43388cb5c4cdcc940b0c558bb128976c4c",
        "atlasRevision": "2a681bcd4a611badcfa984b3b60b868eede21e55",
        "projectionBlob": "a4dbcc5f452e3aef756ca1143dd964eee5d7f9d2",
    }
    if any(ev[k] != v for k, v in expected.items()):
        raise ValueError("source drift: requalification required")
    expected_band = {
        "id": "secondaria-di-primo-grado-tecnologia-classe-ii", "disciplineId": "tecnologia",
        "schoolStage": "Secondaria di primo grado", "gradeLabel": "Classe II",
        "regime": "Regime 2012 transitorio", "sourceSection": "7.3.8",
        "objectives": [{"ordinal": 3, "text": "leggere processi produttivi"}],
    }
    if ev["bands"] != [expected_band]:
        raise ValueError("source excerpt drift: requalification required")
    for r in data["resources"]:
        for m in r["mappings"]:
            if m["status"] == "HISTORICAL_UNRESOLVED":
                continue
            b = bands.get(m["bandId"])
            if not b or m["objectiveId"] != f'{b["id"]}-o{m["ordinal"]}':
                raise ValueError("projected identity mismatch")
            if m["sourceVersion"] != ev["masterVersion"] or m["fingerprint"] != ev["fingerprint"]:
                raise ValueError("mapping source mismatch")
            if b["disciplineId"] not in r["disciplineIds"] or b["schoolStage"] not in r["schoolStages"]:
                raise ValueError("mapping scope mismatch")
            if {"ordinal": m["ordinal"], "text": m["text"]} not in b["objectives"]:
                raise ValueError("mapping text or ordinal mismatch")
    # Verify non-destructive migration against the original, retained record.
    prior_bytes = FIXTURE.read_bytes()
    prior_blob = hashlib.sha1(f"blob {len(prior_bytes)}\0".encode() + prior_bytes).hexdigest()
    old = json.loads(prior_bytes)
    if prior_blob != "951a3e304f92a3e86efca26adf9b17bac9b2005e" or data["migration"]["fromBlob"] != prior_blob or data["source"] != old["source"]:
        raise ValueError("migration provenance mismatch")
    old_resources = {r["id"]: r for r in old["resources"]}
    if set(old_resources) != {r["id"] for r in data["resources"]}:
        raise ValueError("resource identity drift")
    for r in data["resources"]:
        prior = old_resources[r["id"]]
        if any(r[k] != v for k, v in prior.items() if k != "mappings"):
            raise ValueError("resource record drift")
        legacy = [m["objectiveId"] for m in r["mappings"] if m["status"] == "HISTORICAL_UNRESOLVED"]
        if legacy != [m["objectiveId"] for m in prior["mappings"]]:
            raise ValueError("historical mapping lost or changed")
        current = [m for m in r["mappings"] if m["status"] == "PROPOSED"]
        if len(current) != (1 if r["id"] == "r-tec-003" else 0):
            raise ValueError("unreviewed association added or lost")
    old_concepts = {c["id"]: c for c in old["concepts"]}
    if set(old_concepts) != {c["id"] for c in data["concepts"]}:
        raise ValueError("concept identity drift")
    for c in data["concepts"]:
        prior = old_concepts[c["id"]]
        if any(c[k] != prior[k] for k in ("title", "definition", "questions")):
            raise ValueError("concept content drift")
        aliases, related = set(c["aliases"]), set(c["relatedTerms"])
        if aliases & related or aliases | related != set(prior["aliases"]):
            raise ValueError("term migration loss or overlap")
        expected_related = {
            "k-system": {"tecnica e tecnologia"},
            "k-agriculture": {"filiera agricola"},
            "k-text": {"lettura informativa", "testo espositivo"},
            "k-matter": {"trasformazioni fisiche"},
        }
        if related != expected_related[c["id"]]:
            raise ValueError("unreviewed term equivalence")
    if [{k: v for k, v in r.items() if k != "status"} for r in data["relations"]] != old["relations"]:
        raise ValueError("relation drift")

def search(data, query="", objective_id=None, stage=None, *, historical_objective_id=None, source_version=None, fingerprint=None):
    """Editor-only candidate retrieval. Exact label/question match, then token coverage."""
    validate(data)
    v2 = data["schemaVersion"] == VERSION_V2
    if v2 and objective_id and (historical_objective_id or not source_version or not fingerprint):
        raise ValueError("version and fingerprint required for projected objective")
    if not v2 and historical_objective_id:
        raise ValueError("explicit historical lookup requires v0.2")
    q = normalize(query)
    qwords = set(q.split())
    if not q and not objective_id and not historical_objective_id:
        return []
    concepts = {c["id"]: c for c in data["concepts"]}
    results = []
    for r in data["resources"]:
        if stage and stage not in r["schoolStages"]:
            continue
        if historical_objective_id:
            maps = [m for m in r["mappings"] if m["status"] == "HISTORICAL_UNRESOLVED" and m["objectiveId"] == historical_objective_id]
        elif v2 and objective_id:
            maps = [m for m in r["mappings"] if m["status"] == "PROPOSED" and m["objectiveId"] == objective_id
                    and m["sourceVersion"] == source_version and m["fingerprint"] == fingerprint]
        else:
            maps = [m for m in r["mappings"] if m["objectiveId"] == objective_id]
        if (objective_id or historical_objective_id) and not maps:
            continue
        labels = [r["title"]]
        related_terms = []
        for key in r["conceptIds"]:
            c = concepts[key]
            labels.extend([c["title"], *c["aliases"], *c["questions"]])
            related_terms.extend(c.get("relatedTerms", []))
        scores = []
        for label in labels:
            normalized = normalize(label)
            shared = qwords & set(normalized.split())
            if q and q == normalized:
                scores.append((100, label))
            elif qwords and qwords <= set(normalized.split()):
                scores.append((50, label))
            elif len(shared) >= 2:
                scores.append((len(shared), label))
        for label in related_terms:
            normalized = normalize(label)
            if q and q == normalized:
                scores.append((25, label))
            elif qwords and qwords <= set(normalized.split()):
                scores.append((10, label))
        if q and not scores:
            continue
        score, match = max(scores, default=(0, ""))
        result = {"id": r["id"], "score": score, "matchedLabel": match,
                  "objectiveStatus": maps[0]["status"] if maps else None,
                  "publicationAuthorized": False}
        if v2:
            result["matchKind"] = ("RELATED_TERM" if match in related_terms and match not in labels
                                   else "LABEL_OR_QUESTION" if match else "OBJECTIVE_LOOKUP")
            result["referenceVersion"] = maps[0]["sourceVersion"] if maps else None
            result["authorityState"] = data["alignmentEvidence"]["authorityState"]
        results.append(result)
    return sorted(results, key=lambda r: (-r["score"], r["id"]))

class CandidateTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(FIXTURE.read_text(encoding="utf-8"))

    def test_original_records_and_mappings(self):
        validate(self.data)
        self.assertEqual({r["id"]: [m["objectiveId"] for m in r["mappings"]] for r in self.data["resources"]},
                         {"r-tec-001":["tech-s2-1"], "r-tec-002":["tech-s2-1"],
                          "r-tec-003":["tech-s2-1"], "r-ita-001":[], "r-sci-001":[]})
        self.assertEqual(self.data["source"]["blob"], "4344613798011c9c9fccad433bc22d9fc241d934")

    def test_search_synonym(self):
        self.assertEqual(search(self.data, "cambiamenti di stato")[0]["id"], "r-sci-001")

    def test_search_question(self):
        self.assertEqual(search(self.data, "Come funziona un’azienda agricola?")[0]["id"], "r-tec-003")

    def test_search_objective_proposed(self):
        results = search(self.data, objective_id="tech-s2-1")
        self.assertEqual(len(results), 3)
        self.assertTrue(all(r["objectiveStatus"] == "PROPOSED" for r in results))
        self.assertTrue(all(not r["publicationAuthorized"] for r in results))

    def test_stage_filter(self):
        self.assertEqual(search(self.data, "testo informativo", stage="Primaria")[0]["id"], "r-ita-001")
        self.assertEqual(search(self.data, "sistema agricolo", stage="Primaria"), [])

    def test_unmatched_and_empty(self):
        self.assertEqual(search(self.data, "astronomia quantistica"), [])
        self.assertEqual(search(self.data), [])

    def test_unknown_concept(self):
        self.data["resources"][0]["conceptIds"] = ["k-missing"]
        with self.assertRaises(ValueError):
            validate(self.data)

    def test_duplicate_id(self):
        duplicate = copy.deepcopy(self.data["resources"][0])
        duplicate["title"] += " duplicato"
        self.data["resources"].append(duplicate)
        with self.assertRaises(ValueError):
            validate(self.data)

    def test_alias_collision(self):
        self.data["concepts"][1]["aliases"].append("TECNICA E TECNOLOGIA")
        with self.assertRaises(ValueError):
            validate(self.data)

    def test_cycle(self):
        self.data["relations"].append({"from":"k-agriculture","to":"k-system","kind":"prerequisite_of"})
        with self.assertRaises(ValueError):
            validate(self.data)

    def test_self_relation(self):
        self.data["relations"].append({"from":"k-system","to":"k-system","kind":"related_to"})
        with self.assertRaises(ValueError):
            validate(self.data)

    def test_no_promotion(self):
        for field in ("runtimeAuthorized", "publicationAuthorized"):
            with self.subTest(field=field):
                data = copy.deepcopy(self.data)
                data[field] = True
                with self.assertRaises(ValidationError):
                    validate(data)

    def test_no_unverified_mapping_promotion(self):
        self.data["resources"][0]["mappings"][0]["status"] = "VERIFIED"
        with self.assertRaises(ValidationError):
            validate(self.data)

    def test_no_private_payload_field(self):
        self.data["resources"][0]["privateChat"] = "synthetic disallowed field"
        with self.assertRaises(ValidationError):
            validate(self.data)

class VersionedCandidateTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(FIXTURE_V2.read_text(encoding="utf-8"))
        self.target = "secondaria-di-primo-grado-tecnologia-classe-ii-o3"

    def test_migration_and_proposal(self):
        validate(self.data)
        self.assertEqual(len(self.data["resources"]), 5)
        self.assertEqual(len(self.data["concepts"]), 4)
        result = search(self.data, objective_id=self.target, source_version="1.3", fingerprint="b355be71")
        self.assertEqual([r["id"] for r in result], ["r-tec-003"])
        self.assertEqual(result[0]["objectiveStatus"], "PROPOSED")
        self.assertFalse(result[0]["publicationAuthorized"])

    def test_historical_is_not_current(self):
        self.assertEqual(search(self.data, objective_id="tech-s2-1", source_version="1.3", fingerprint="b355be71"), [])
        result = search(self.data, historical_objective_id="tech-s2-1")
        self.assertEqual(len(result), 3)
        self.assertTrue(all(r["objectiveStatus"] == "HISTORICAL_UNRESOLVED" for r in result))
        self.assertEqual(search(self.data, objective_id=self.target, source_version="1.4", fingerprint="b355be71"), [])
        with self.assertRaises(ValueError):
            search(self.data, objective_id=self.target)

    def test_related_terms_distinct_from_aliases(self):
        result = search(self.data, "trasformazioni fisiche")
        self.assertEqual(result[0]["id"], "r-sci-001")
        self.assertEqual(result[0]["matchKind"], "RELATED_TERM")
        self.assertEqual(search(self.data, "cambiamenti di stato")[0]["matchKind"], "LABEL_OR_QUESTION")
        self.assertEqual(search(self.data, "Come funziona un’azienda agricola?")[0]["id"], "r-tec-003")

    def test_source_drift_and_wrong_target(self):
        for key, value in (("fingerprint", "changed"), ("sourceBlob", "0" * 40)):
            data = copy.deepcopy(self.data)
            data["alignmentEvidence"][key] = value
            with self.subTest(key=key), self.assertRaises(ValueError):
                validate(data)
        for key, value in (("text", "testo diverso"), ("ordinal", 4), ("bandId", "other-band"),
                           ("objectiveId", "wrong-id"), ("sourceVersion", "1.4")):
            data = copy.deepcopy(self.data)
            data["resources"][2]["mappings"][1][key] = value
            with self.subTest(key=key), self.assertRaises(ValueError):
                validate(data)

    def test_no_historical_loss_or_bulk_association(self):
        data = copy.deepcopy(self.data)
        data["resources"][0]["mappings"] = []
        with self.assertRaises(ValueError):
            validate(data)
        data = copy.deepcopy(self.data)
        data["resources"][0]["mappings"].append(copy.deepcopy(data["resources"][2]["mappings"][1]))
        with self.assertRaises(ValueError):
            validate(data)

    def test_reject_unreviewed_equivalence(self):
        data = copy.deepcopy(self.data)
        concept = data["concepts"][0]
        concept["aliases"].append(concept["relatedTerms"].pop())
        with self.assertRaises(ValueError):
            validate(data)

    def test_no_publication_or_promotion(self):
        for key in ("publicationAuthorized", "runtimeAuthorized"):
            data = copy.deepcopy(self.data)
            data[key] = True
            with self.subTest(key=key), self.assertRaises(ValidationError):
                validate(data)
        data = copy.deepcopy(self.data)
        data["resources"][2]["mappings"][1]["review"] = "PASS"
        with self.assertRaises(ValidationError):
            validate(data)
        data = copy.deepcopy(self.data)
        data["resources"][2]["rights"] = "RESOLVED"
        with self.assertRaises(ValidationError):
            validate(data)

LINK_EVIDENCE = ROOT / "docs/capabilities/atlas-knowledge/fixtures/f-r3c-link-evidence-v0.1.json"


def validate_link_evidence(record, data):
    """Pinned editorial review, not a runtime graph or approval receipt."""
    validate(data)
    if record["schemaVersion"] != "atlas.knowledge-link-evidence/v0.1" or record["status"] != "EDITORIAL_REVIEW_CANDIDATE":
        raise ValueError("invalid review receipt")
    expected_flags = {"noTransitiveAuthority", "noAutomaticMapping", "noPublicProjection",
                      "noNewPortal", "noRuntimeChange", "noStudentData", "noLearningClaim"}
    if set(record["invariants"]) != expected_flags or any(v is not True for v in record["invariants"].values()):
        raise ValueError("review boundaries changed")
    sources = {item["id"]: item for item in record["sources"]}
    expected_sources = {
        "KB": "016cb9e9bb66a976fb4bb6652cb0dce2001930de",
        "M118": "1b8c64fffdb0ca5aa0532c24796a720d08e43143",
        "CQP07": "d95d2140775d9a04b6399f5ff425adc8bc999d6a",
        "PORTFOLIO": "17a3a883724531a99b2e4424dec172cc2e3b1d41",
        "PW_INFO": "046b7740f7ce6c96c9aca11e846b49e2ee714a9e",
        "PW_CONSTRAINTS": "33c36879766b56e1835f92628c0bb05f0575349a",
        "SVG": "ec1468d237a36d6802c1d870771609c3bbc299a1",
    }
    if len(sources) != len(record["sources"]) or {k:v["blob"] for k,v in sources.items()} != expected_sources:
        raise ValueError("missing or changed evidence")
    for source in sources.values():
        if not re.fullmatch("[0-9a-f]{40}", source["revision"]):
            raise ValueError("invalid revision")
    kb_bytes = FIXTURE_V2.read_bytes()
    if hashlib.sha1(f"blob {len(kb_bytes)}\0".encode() + kb_bytes).hexdigest() != expected_sources["KB"]:
        raise ValueError("local catalog drift")
    if data != json.loads(kb_bytes):
        raise ValueError("catalog candidate changed")
    ev = data["alignmentEvidence"]
    for key in ("sourceBlob", "masterVersion", "fingerprint", "authorityState", "atlasRevision"):
        if record["arena"][key] != ev[key]:
            raise ValueError("source alignment drift")
    if record["arena"]["sourceMatch"] != "CHECKED_ON_PINNED_REVISIONS_NOT_APPROVED":
        raise ValueError("unsupported authority promotion")
    resources = {r["id"]: r for r in data["resources"]}
    rr = record["resourceReview"]
    if rr["resourceId"] != "r-tec-003" or rr["source"] != "SVG" or rr["status"] != "CONTENT_INSPECTED_NOT_QUALIFIED":
        raise ValueError("unsupported resource review")
    resource = resources[rr["resourceId"]]
    if rr["rights"] != resource["rights"] or rr["accessibility"] != resource["accessibility"] or rr["publicationAuthorized"] is not False:
        raise ValueError("resource promotion")
    if not any(m["objectiveId"] == rr["mappingRef"] and m["status"] == rr["mappingState"] == "PROPOSED" for m in resource["mappings"]):
        raise ValueError("resource link mismatch")
    reviews = {r["id"]: r for r in record["experienceReviews"]}
    if len(reviews) != len(record["experienceReviews"]) or set(reviews) != {"trama-missione-118-2026", "pw-missing-information-01", "pw-constraints-tradeoffs-01"}:
        raise ValueError("experience identity drift")
    for item in reviews.values():
        if item["runtimeAuthorized"] is not False or item["publicationAuthorized"] is not False or item["review"] != "PENDING":
            raise ValueError("experience promotion")
        if item["resourceLinks"]:
            raise ValueError("unproven resource use")
        if not item["sourceRefs"] or not set(item["sourceRefs"]) <= sources.keys():
            raise ValueError("unresolved evidence")
        if any(link["conceptId"] not in {c["id"] for c in data["concepts"]} for link in item["conceptLinks"]):
            raise ValueError("unknown concept")
    m = reviews["trama-missione-118-2026"]
    if m["version"] != "0.4.2-draft" or m["manifestDigest"] != "c9dc1c6b909d8496dfaf1bc9f7cc43e9ab7e5b2511c0f68e64050e51ed4b5aa4":
        raise ValueError("wrong activity version")
    if m["registryState"] != "PRIVATE_PREVIEW_NOT_IN_PUBLIC_PORTFOLIO" or set(m["sourceRefs"]) != {"M118", "CQP07"}:
        raise ValueError("wrong activity registry or source")
    if m["objectiveState"] != "PROPOSED" or m["objectiveRefs"] != [f"secondaria-di-primo-grado-tecnologia-classe-iii-o{n}" for n in (2,4,5,6,8)] or m["axisRefs"] != ["educazione-civica","ai-literacy"]:
        raise ValueError("unreviewed mapping")
    links = m["conceptLinks"]
    if len(links) != 1 or any(links[0][k] != v for k,v in {"conceptId":"k-system","outcomeRef":"O4","role":"RELATED_APPLICATION","status":"PROPOSED"}.items()) or not links[0]["reason"]:
        raise ValueError("unreviewed concept association")
    for ident, source in (("pw-missing-information-01","PW_INFO"), ("pw-constraints-tradeoffs-01","PW_CONSTRAINTS")):
        item = reviews[ident]
        if item["version"] != "1.1.0" or item["registryState"] != "REGISTERED_CANDIDATE" or set(item["sourceRefs"]) != {"PORTFOLIO", source}:
            raise ValueError("wrong portfolio candidate")
        if item["objectiveState"] != "NOT_PROPOSED" or item["objectiveRefs"] or item["axisRefs"] or item["conceptLinks"] or not item["withheldReason"]:
            raise ValueError("forced transversal mapping")
    return record


class LinkEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(FIXTURE_V2.read_text(encoding="utf-8"))
        self.record = json.loads(LINK_EVIDENCE.read_text(encoding="utf-8"))

    def test_pinned_editorial_receipt(self):
        validate_link_evidence(self.record, self.data)

    def test_no_inferred_resource_use_or_learning(self):
        for field, value in (("resourceLinks", ["r-tec-003"]), ("publicationAuthorized", True),
                             ("runtimeAuthorized", True), ("review", "PASS")):
            record = copy.deepcopy(self.record)
            record["experienceReviews"][0][field] = value
            with self.subTest(field=field), self.assertRaises(ValueError):
                validate_link_evidence(record, self.data)

    def test_no_forced_transversal_binding(self):
        record = copy.deepcopy(self.record)
        record["experienceReviews"][1]["objectiveRefs"] = ["secondaria-di-primo-grado-tecnologia-classe-ii-o3"]
        with self.assertRaises(ValueError):
            validate_link_evidence(record, self.data)

    def test_no_transitive_authority(self):
        record = copy.deepcopy(self.record)
        record["invariants"]["noTransitiveAuthority"] = False
        with self.assertRaises(ValueError):
            validate_link_evidence(record, self.data)

    def test_source_and_mapping_drift(self):
        for field, value in (("fingerprint","changed"), ("sourceBlob","0"*40)):
            record = copy.deepcopy(self.record)
            record["arena"][field] = value
            with self.subTest(field=field), self.assertRaises(ValueError):
                validate_link_evidence(record, self.data)
        record = copy.deepcopy(self.record)
        record["experienceReviews"][0]["conceptLinks"][0]["outcomeRef"] = "O2"
        with self.assertRaises(ValueError):
            validate_link_evidence(record, self.data)

SEARCH_EVIDENCE = ROOT / "docs/capabilities/atlas-knowledge/fixtures/f-r3d-search-evidence-v0.1.json"
SEARCH_STOP = frozenset("a al alla alle ai ad anche che chi come con cosa da dal dalla dei del della delle di e ed gli il in l la le lo mi nel nella o per quale quali se si su sul sulla tra un una uno".split())
SEARCH_KINDS = {"CONCEPT", "RESOURCE", "EXPERIENCE", "OBJECTIVE"}
SEARCH_STAGES = {"Primaria", "Secondaria di primo grado"}


def _blob(path):
    raw = path.read_bytes()
    return hashlib.sha1(f"blob {len(raw)}\0".encode() + raw).hexdigest()


def validate_search_evidence(meta, links, data):
    validate_link_evidence(links, data)
    if links != json.loads(LINK_EVIDENCE.read_text(encoding="utf-8")):
        raise ValueError("link receipt drift")
    expected_labels = [
        {"id":"trama-missione-118-2026", "title":"Missione 118 V9.1", "schoolStage":"Secondaria di primo grado", "sourceRefs":["CQP07","M118"]},
        {"id":"pw-missing-information-01", "title":"Prima di decidere, cosa manca?", "schoolStage":"Primaria", "sourceRefs":["PORTFOLIO","PW_INFO"]},
        {"id":"pw-constraints-tradeoffs-01", "title":"Una soluzione, molti vincoli", "schoolStage":"Secondaria di primo grado", "sourceRefs":["PORTFOLIO","PW_CONSTRAINTS"]},
    ]
    expected_objectives = [
        {"ordinal":2,"text":"analizzare sistemi energetici/produttivi"},
        {"ordinal":4,"text":"usare dati"},
        {"ordinal":5,"text":"progettare"},
        {"ordinal":6,"text":"verificare"},
        {"ordinal":8,"text":"motivare scelte e interessi professionali"},
    ]
    if meta["schemaVersion"] != "atlas.knowledge-search-evidence/v0.1" or meta["status"] != "EDITORIAL_ONLY":
        raise ValueError("not editorial evidence")
    if meta["linkEvidenceBlob"] != _blob(LINK_EVIDENCE) or meta["linkEvidenceBlob"] != "c5c1aab7359ddd972dd978bbe46566dff7dcd194":
        raise ValueError("link evidence digest drift")
    if meta["catalogBlob"] != _blob(FIXTURE_V2) or meta["catalogBlob"] != "016cb9e9bb66a976fb4bb6652cb0dce2001930de":
        raise ValueError("catalog digest drift")
    if meta["experienceLabels"] != expected_labels or meta["missionObjectiveLabels"] != expected_objectives:
        raise ValueError("unreviewed search labels")
    if meta["boundaries"] != dict.fromkeys(("runtimeAuthorized", "publicationAuthorized", "publicResultsAllowed", "studentData"), False):
        raise ValueError("search promotion")
    return meta


def _content_words(text):
    return {word for word in normalize(text).split() if word not in SEARCH_STOP}


def _direct_match(query, labels):
    """All content words must match one label; no partial-overlap guesses."""
    words = _content_words(query)
    if not words:
        return None
    matches = []
    for label, kind in labels:
        if not words <= _content_words(label):
            continue
        exact = normalize(query) == normalize(label)
        score = (100 if exact else 60) if kind != "RELATED_TERM" else (30 if exact else 20)
        matches.append((score, label, kind))
    return max(matches, default=None)


def search_transversal(data, links, meta, query="", *, surface, kind=None, stage=None,
                       objective_id=None, source_version=None, fingerprint=None):
    """Offline editorial retrieval; public mode deliberately exposes nothing."""
    if surface == "PUBLIC":
        return []
    if surface != "EDITORIAL":
        raise ValueError("explicit editorial surface required")
    validate_search_evidence(meta, links, data)
    if not isinstance(query, str) or len(query) > 256:
        raise ValueError("invalid query")
    if kind is not None and kind not in SEARCH_KINDS:
        raise ValueError("invalid result kind")
    if stage is not None and stage not in SEARCH_STAGES:
        raise ValueError("invalid school stage")
    if objective_id is not None:
        if not isinstance(objective_id, str) or not source_version or not fingerprint:
            raise ValueError("exact objective lookup requires version and fingerprint")
        if (source_version, fingerprint) != (data["alignmentEvidence"]["masterVersion"], data["alignmentEvidence"]["fingerprint"]):
            return []
    elif source_version is not None or fingerprint is not None:
        raise ValueError("version filter requires objective id")
    if not _content_words(query) and not objective_id:
        return []
    if query.strip() and not _content_words(query):
        return []
    concepts = {c["id"]: c for c in data["concepts"]}
    resources = {r["id"]: r for r in data["resources"]}
    reviews = {e["id"]: e for e in links["experienceReviews"]}
    labels = {e["id"]: e for e in meta["experienceLabels"]}
    source = data["alignmentEvidence"]
    objectives = {}
    for r in resources.values():
        for m in r["mappings"]:
            if m["status"] == "PROPOSED":
                objectives[m["objectiveId"]] = (m["text"], r["schoolStages"], "KB")
    mission = reviews["trama-missione-118-2026"]
    for ident, evidence in zip(mission["objectiveRefs"], meta["missionObjectiveLabels"], strict=True):
        if not ident.endswith(f'-o{evidence["ordinal"]}'):
            raise ValueError("objective label identity drift")
        objectives[ident] = (evidence["text"], [labels[mission["id"]]["schoolStage"]], "M118")
    if objective_id and objective_id not in objectives:
        return []

    concept_matches = {}
    for c in concepts.values():
        match = _direct_match(query, [(c["title"], "TITLE")] +
                              [(a, "ALIAS") for a in c["aliases"]] +
                              [(q, "QUESTION") for q in c["questions"]] +
                              [(t, "RELATED_TERM") for t in c["relatedTerms"]])
        if match:
            concept_matches[c["id"]] = match
    result = []
    def add(ident, title, category, stages, match, refs, status, **details):
        if kind and kind != category:
            return
        if stage and stage not in stages:
            return
        if not match:
            if query.strip():
                return
            match = (100, objectives[objective_id][0], "EXACT_OBJECTIVE_ID")
        score, label, reason_kind = match
        result.append({
            "id": ident, "title": title, "kind": category,
            "schoolStages": stages, "score": score, "matchedLabel": label,
            "matchKind": reason_kind, "sourceRefs": refs, "status": status,
            "publicationAuthorized": False, "runtimeAuthorized": False,
            **details,
        })
    def best_link(ids, link_kind):
        # One directly matched concept only. No traversal of concept relations.
        candidates = [(min(concept_matches[c][0], 45), c, concept_matches[c][1])
                      for c in ids if c in concept_matches]
        if not candidates:
            return None, None
        score, cid, label = max(candidates)
        return (score, label, link_kind), cid
    for c in concepts.values():
        if objective_id or c["id"] not in concept_matches:
            continue
        stages = sorted({stage_name for r in resources.values() if c["id"] in r["conceptIds"]
                         for stage_name in r["schoolStages"]} |
                        {labels[e["id"]]["schoolStage"] for e in reviews.values()
                         if any(l["conceptId"] == c["id"] for l in e["conceptLinks"])})
        add(c["id"], c["title"], "CONCEPT", stages, concept_matches[c["id"]], ["KB"], "CANDIDATE",
            scopeMeaning="LINKED_CANDIDATE_SCOPE_NOT_CONCEPT_ASSIGNMENT")
    # Reuse the existing exact, versioned resource lookup for objective mode.
    eligible_resources = None
    if objective_id:
        eligible_resources = {r["id"] for r in search(data, objective_id=objective_id,
                              source_version=source_version, fingerprint=fingerprint)}
    for r in resources.values():
        if eligible_resources is not None and r["id"] not in eligible_resources:
            continue
        direct = _direct_match(query, [(r["title"], "TITLE")])
        linked, cid = best_link(r["conceptIds"], "DIRECT_CONCEPT_RESOURCE")
        match = max([m for m in (direct, linked) if m], default=None)
        own = [m for m in r["mappings"] if m["status"] == "PROPOSED"]
        add(r["id"], r["title"], "RESOURCE", r["schoolStages"], match, ["KB"],
            "RECORD_ONLY", conceptRef=cid if match and match == linked else None,
            objectiveRefs=[m["objectiveId"] for m in own],
            objectiveState="PROPOSED" if own else "NOT_PROPOSED",
            authorityState=source["authorityState"] if own else None,
            sourceVersion=source["masterVersion"] if own else None,
            fingerprint=source["fingerprint"] if own else None,
            rights=r["rights"], accessibility=r["accessibility"],
            historicalReferenceCount=sum(m["status"] == "HISTORICAL_UNRESOLVED" for m in r["mappings"]))
    for e in reviews.values():
        if objective_id and objective_id not in e["objectiveRefs"]:
            continue
        label = labels[e["id"]]
        direct = _direct_match(query, [(label["title"], "TITLE")])
        linked, cid = best_link([l["conceptId"] for l in e["conceptLinks"]], "PROPOSED_CONCEPT_APPLICATION")
        match = max([m for m in (direct, linked) if m], default=None)
        chosen = next((l for l in e["conceptLinks"] if l["conceptId"] == cid), None) if match and match == linked else None
        add(e["id"], label["title"], "EXPERIENCE", [label["schoolStage"]], match,
            e["sourceRefs"], e["registryState"], version=e["version"],
            conceptRef=chosen["conceptId"] if chosen else None,
            linkState=chosen["status"] if chosen else None,
            linkReason=chosen["reason"] if chosen else None,
            objectiveRefs=e["objectiveRefs"], objectiveState=e["objectiveState"],
            authorityState=source["authorityState"] if e["objectiveRefs"] else None,
            sourceVersion=source["masterVersion"] if e["objectiveRefs"] else None,
            fingerprint=source["fingerprint"] if e["objectiveRefs"] else None)
    for ident, (title, stages, ref) in objectives.items():
        if objective_id and objective_id != ident:
            continue
        add(ident, title, "OBJECTIVE", stages, _direct_match(query, [(title, "OBJECTIVE_TEXT")]),
            [ref], "PROPOSED", sourceVersion=source["masterVersion"],
            fingerprint=source["fingerprint"], authorityState=source["authorityState"])
    return sorted(result, key=lambda x: (-x["score"], x["kind"], x["id"]))


class TransversalSearchTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(FIXTURE_V2.read_text(encoding="utf-8"))
        self.links = json.loads(LINK_EVIDENCE.read_text(encoding="utf-8"))
        self.meta = json.loads(SEARCH_EVIDENCE.read_text(encoding="utf-8"))

    def lookup(self, query="", **kwargs):
        return search_transversal(self.data, self.links, self.meta, query, surface="EDITORIAL", **kwargs)

    def test_question_and_no_transitive_experience(self):
        result = self.lookup("Come funziona un’azienda agricola?")
        self.assertEqual({x["id"] for x in result}, {"k-agriculture", "r-tec-003"})
        self.assertTrue(all(not x["publicationAuthorized"] for x in result))

    def test_explicit_concept_application(self):
        result = self.lookup("sistema tecnologico", kind="EXPERIENCE")
        self.assertEqual([r["id"] for r in result], ["trama-missione-118-2026"])
        self.assertEqual(result[0]["matchKind"], "PROPOSED_CONCEPT_APPLICATION")
        self.assertEqual(result[0]["linkState"], "PROPOSED")
        self.assertTrue(result[0]["linkReason"])

    def test_alias_related_and_stage(self):
        self.assertEqual(self.lookup("cambiamenti di stato", kind="CONCEPT")[0]["matchKind"], "ALIAS")
        self.assertEqual(self.lookup("trasformazioni fisiche", kind="CONCEPT")[0]["matchKind"], "RELATED_TERM")
        self.assertEqual(self.lookup("sistema tecnologico", stage="Primaria"), [])
        self.assertEqual(self.lookup("testo informativo", stage="Primaria", kind="RESOURCE")[0]["id"], "r-ita-001")

    def test_direct_experience_is_not_curricular_binding(self):
        r = self.lookup("Prima di decidere, cosa manca?", kind="EXPERIENCE")[0]
        self.assertEqual(r["id"], "pw-missing-information-01")
        self.assertEqual(r["objectiveRefs"], [])
        self.assertEqual(r["objectiveState"], "NOT_PROPOSED")
        self.assertEqual(self.lookup("informazioni principali", kind="EXPERIENCE"), [])

    def test_exact_objective_separates_year_and_never_inherits(self):
        opts = {"source_version":"1.3", "fingerprint":"b355be71"}
        ii = self.lookup(objective_id="secondaria-di-primo-grado-tecnologia-classe-ii-o3", **opts)
        self.assertEqual({r["kind"] for r in ii}, {"RESOURCE","OBJECTIVE"})
        self.assertEqual({r["id"] for r in ii}, {"r-tec-003","secondaria-di-primo-grado-tecnologia-classe-ii-o3"})
        iii = self.lookup(objective_id="secondaria-di-primo-grado-tecnologia-classe-iii-o5", **opts)
        self.assertEqual({r["kind"] for r in iii}, {"EXPERIENCE","OBJECTIVE"})
        self.assertEqual(self.lookup(objective_id="tech-s2-1", **opts), [])
        self.assertEqual(self.lookup(objective_id="secondaria-di-primo-grado-tecnologia-classe-ii-o3", source_version="1.4", fingerprint="b355be71"), [])
        with self.assertRaises(ValueError):
            self.lookup(objective_id="tech-s2-1")

    def test_objective_text_and_empty(self):
        self.assertEqual(self.lookup("leggere processi produttivi", kind="OBJECTIVE")[0]["id"], "secondaria-di-primo-grado-tecnologia-classe-ii-o3")
        self.assertEqual(self.lookup("come si fa"), [])
        self.assertEqual(self.lookup("astronomia quantistica"), [])
        self.assertEqual(self.lookup(""), [])

    def test_public_deny_and_unknown_surface(self):
        self.assertEqual(search_transversal(self.data, self.links, self.meta, "Missione 118", surface="PUBLIC"), [])
        with self.assertRaises(ValueError):
            search_transversal(self.data, self.links, self.meta, "Missione 118", surface="UNKNOWN")

    def test_pinned_evidence_and_filter_validation(self):
        bad = copy.deepcopy(self.meta)
        bad["experienceLabels"][0]["title"] = "other"
        with self.assertRaises(ValueError):
            search_transversal(self.data, self.links, bad, "Missione", surface="EDITORIAL")
        for kw in ({"kind":"OTHER"}, {"stage":"OTHER"}, {"source_version":"1.3"}):
            with self.assertRaises(ValueError):
                self.lookup("sistema", **kw)

    def test_deterministic_no_mutation(self):
        prior = copy.deepcopy((self.data, self.links, self.meta))
        self.assertEqual(self.lookup("sistema tecnologico"), self.lookup("SISTEMA TECNOLOGICO"))
        self.assertEqual(prior, (self.data, self.links, self.meta))


def run_cli():
    import argparse
    import sys
    parser = argparse.ArgumentParser(description="ATL-KB: ricerca editoriale candidata, nessuna pubblicazione")
    parser.add_argument("--search", default="")
    parser.add_argument("--surface", required=True, choices=["EDITORIAL", "PUBLIC"])
    parser.add_argument("--kind", choices=sorted(SEARCH_KINDS))
    parser.add_argument("--stage", choices=sorted(SEARCH_STAGES))
    parser.add_argument("--objective-id")
    parser.add_argument("--source-version")
    parser.add_argument("--fingerprint")
    args = parser.parse_args()
    try:
        result = search_transversal(
            json.loads(FIXTURE_V2.read_text(encoding="utf-8")),
            json.loads(LINK_EVIDENCE.read_text(encoding="utf-8")),
            json.loads(SEARCH_EVIDENCE.read_text(encoding="utf-8")),
            args.search, surface=args.surface, kind=args.kind, stage=args.stage,
            objective_id=args.objective_id, source_version=args.source_version, fingerprint=args.fingerprint)
    except ValueError as exc:
        parser.error(str(exc))
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    import sys
    if "--surface" in sys.argv or "--search" in sys.argv or "--objective-id" in sys.argv:
        run_cli()
    else:
        unittest.main(verbosity=2)
