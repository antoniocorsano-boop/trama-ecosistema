import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "run_trama_sa01.py"
CASES = ROOT / "docs" / "pilots" / "trama-sa-01" / "cases.json"


def digest(value):
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


class TramaSA01Tests(unittest.TestCase):
    def test_corpus_validation_passes(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "validate"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("10 semantic, 2 pre-gate reject", result.stdout)

    def test_prepare_excludes_pre_gate_rejections(self):
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "prepared.json"
            result = subprocess.run(
                [sys.executable, str(SCRIPT), "prepare", "--output", str(output)],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            data = json.loads(output.read_text(encoding="utf-8"))
            ids = {item["caseId"] for item in data["items"]}
            self.assertEqual(len(ids), 10)
            self.assertNotIn("SA01-009", ids)
            self.assertNotIn("SA01-010", ids)
            self.assertTrue(all(item["advisoryOnly"] for item in data["items"]))
            self.assertFalse(data["runtimeWritesAllowed"])

    def test_score_requires_human_review_and_digest_binding(self):
        corpus = json.loads(CASES.read_text(encoding="utf-8"))
        results = []
        for case in corpus["cases"]:
            if case["expectedStage"] != "SEMANTIC_REVIEW":
                continue
            state = {
                "curriculumEvidence": case["evidence"],
                "publicationCandidate": case["manifest"],
            }
            results.append(
                {
                    "caseId": case["id"],
                    "provider": "HARNESS_TEST_ONLY",
                    "providerModel": "NONE",
                    "judgmentType": "CHOICE_ALIGNMENT",
                    "semanticLabel": case["expectedSemanticLabel"],
                    "distribution": {},
                    "advisoryOnly": True,
                    "stateDigest": digest(state),
                    "evaluatedAt": "2026-09-21T00:00:00Z",
                    "humanReview": {
                        "reviewed": True,
                        "label": case["expectedSemanticLabel"],
                        "note": "Test dell'harness, non esito TypeSafe.",
                    },
                }
            )
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "results.json"
            path.write_text(json.dumps({"results": results}, ensure_ascii=False), encoding="utf-8")
            run = subprocess.run(
                [sys.executable, str(SCRIPT), "score", "--results", str(path)],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=False,
            )
            self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
            metrics = json.loads(run.stdout)
            self.assertEqual(metrics["semanticCases"], 10)
            self.assertEqual(metrics["reviewedCases"], 10)
            self.assertEqual(metrics["falsePasses"], 0)
            self.assertEqual(metrics["exactAgreementRate"], 1.0)


if __name__ == "__main__":
    unittest.main()
