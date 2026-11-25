import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import unittest

RENDERER = Path(__file__).resolve().parents[1] / "fixtures/visual-factory-diagram/render-profile-demonstrator.py"
SOURCE = {
    "schema": "trama.diagram-education-source/v0.1",
    "id": "diagramma-docente",
    "status": "TEACHER_REVIEW_REQUIRED",
    "profile": "studio-atlas",
    "runtimeAuthorized": False,
    "publicationAuthorized": False,
    "title": "Energia & movimento",
    "description": "Individuare le trasformazioni energetiche.",
    "nodes": [{"id": "n1", "label": "Batteria", "detail": "Energia chimica"},
              {"id": "n2", "label": "Motore", "detail": "Movimento"}],
    "edges": [["n2", "n1"]],
}


def generate(source):
    result = subprocess.run([sys.executable, "-I", "-B", str(RENDERER), "--education-stdio"],
                            input=json.dumps(source).encode(), capture_output=True, check=True, timeout=4)
    return json.loads(result.stdout)


class AuthoredDiagram(unittest.TestCase):
    def test_integrity_and_regeneration(self):
        first = generate(SOURCE)["files"]
        self.assertEqual(first, generate(SOURCE)["files"])
        receipt = json.loads(first["education-receipt.json"])
        self.assertFalse(receipt["runtimeAuthorized"])
        self.assertFalse(receipt["publicationAuthorized"])
        self.assertEqual(receipt["rendererSha256"], hashlib.sha256(RENDERER.read_bytes()).hexdigest())
        self.assertEqual(set(receipt["files"]), set(first) - {"education-receipt.json"})
        for name, digest in receipt["files"].items():
            self.assertEqual(digest, hashlib.sha256(first[name].encode()).hexdigest())
        edited = copy.deepcopy(SOURCE)
        edited["nodes"][1]["label"] = "Ventola"
        second = generate(edited)["files"]
        for name in first:
            self.assertNotEqual(first[name], second[name])
            if name.endswith((".html", ".svg")):
                self.assertIn("Energia &amp; movimento", second[name])
                self.assertIn("Ventola", second[name])
                self.assertIn("2 → 1", second[name])
        self.assertIn("Ventola → Batteria", second["guida-docente.md"])

    def test_optional_activity_and_backward_compatibility(self):
        original=generate(SOURCE)["files"]
        self.assertNotIn("activity",json.loads(original["education-source.json"]))
        self.assertIn("non ancora definiti",original["guida-docente.md"])
        activity={"question":"Quale trasformazione avviene?","criterion":"Individua la trasformazione energetica."}
        source={**SOURCE,"activity":activity}
        files=generate(source)["files"]
        self.assertEqual(json.loads(files["education-source.json"])["activity"],activity)
        self.assertIn(activity["question"],files["guida-docente.md"])
        self.assertIn(activity["criterion"],files["guida-docente.md"])
        self.assertEqual(files,generate(source)["files"])
        for invalid in [{"question":"<script>","criterion":"Risposta"},
                        {"question":"Domanda","criterion":""},
                        {"question":"Domanda","criterion":"a"*161},
                        {"question":"Domanda","criterion":"Risposta","extra":True}]:
            with self.subTest(invalid=invalid):
                self.assertIn("error",generate({**SOURCE,"activity":invalid}))

    def test_closed_source(self):
        for edits in [
            {"title": "<script>"}, {"title": "https://example.org"}, {"title": "example.org"},
            {"description": "data:text/html"}, {"description": "a" * 161},
            {"runtimeAuthorized": True}, {"publicationAuthorized": True}, {"profile": "arena"},
            {"nodes": []}, {"nodes": SOURCE["nodes"] * 3}, {"edges": [["n1", "n4"]]},
            {"edges": [["n1", "n1"]]}, {"edges": [["n1", "n2"]] * 2}, {"path": "/tmp/out"},
        ]:
            with self.subTest(edits=edits):
                self.assertIn("error", generate({**SOURCE, **edits}))


if __name__ == "__main__":
    unittest.main()
