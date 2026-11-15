"""Read-only qualification of the Atlas record-only candidate. No publication or writes."""
import copy
import json
import re
import unicodedata
import unittest
from pathlib import Path
from jsonschema import Draft202012Validator, ValidationError

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = json.loads((ROOT / "schemas/atlas-knowledge-candidate.v0.1.schema.json").read_text(encoding="utf-8"))
FIXTURE = ROOT / "docs/capabilities/atlas-knowledge/fixtures/existing-atlas-candidate-v0.1.json"

def normalize(text):
    text = unicodedata.normalize("NFKD", text.casefold())
    return " ".join(re.findall(r"[a-z0-9]+", "".join(c for c in text if not unicodedata.combining(c))))

def validate(data):
    Draft202012Validator.check_schema(SCHEMA)
    Draft202012Validator(SCHEMA).validate(data)
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
    return data

def search(data, query="", objective_id=None, stage=None):
    """Editor-only candidate retrieval. Exact label/question match, then token coverage."""
    validate(data)
    q = normalize(query)
    qwords = set(q.split())
    if not q and not objective_id:
        return []
    concepts = {c["id"]: c for c in data["concepts"]}
    results = []
    for r in data["resources"]:
        if stage and stage not in r["schoolStages"]:
            continue
        maps = [m for m in r["mappings"] if m["objectiveId"] == objective_id]
        if objective_id and not maps:
            continue
        labels = [r["title"]]
        for key in r["conceptIds"]:
            c = concepts[key]
            labels.extend([c["title"], *c["aliases"], *c["questions"]])
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
        if q and not scores:
            continue
        score, match = max(scores, default=(0, ""))
        results.append({"id": r["id"], "score": score, "matchedLabel": match,
                        "objectiveStatus": "PROPOSED" if maps else None,
                        "publicationAuthorized": False})
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

if __name__ == "__main__":
    unittest.main(verbosity=2)
