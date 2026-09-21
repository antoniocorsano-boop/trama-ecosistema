import json
import os
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HARNESS = ROOT / "scripts" / "run_trama_sa01_r3.py"
LIVE = ROOT / "scripts" / "run_trama_sa01_typesafe_r3.py"
CORPUS = ROOT / "docs" / "pilots" / "trama-sa-01" / "r3-corpus.json"

sys.path.insert(0, str(ROOT / "scripts"))
import run_trama_sa01 as base  # noqa: E402
import run_trama_sa01_r3 as r3  # noqa: E402


class TramaSA01R3Tests(unittest.TestCase):
    def test_corpus_is_balanced_and_holdout_is_sealed(self):
        run = subprocess.run(
            [sys.executable, str(HARNESS), "validate"],
            cwd=ROOT, text=True, capture_output=True, check=False,
        )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
        self.assertEqual(len(corpus["cases"]), 48)
        self.assertEqual(sum(c["split"] == "development" for c in corpus["cases"]), 32)
        self.assertEqual(sum(c["split"] == "holdout" for c in corpus["cases"]), 16)
        self.assertFalse(corpus["splits"]["holdout"]["tuningAllowed"])
        for label in corpus["labels"]:
            self.assertEqual(sum(c["expectedSemanticLabel"] == label for c in corpus["cases"]), 12)

    def test_live_adapter_fails_closed_without_key(self):
        env = os.environ.copy()
        env.pop("TYPESAFE_API_KEY", None)
        run = subprocess.run(
            [sys.executable, str(LIVE), "--output", str(ROOT / "artifacts" / "r3-none.json")],
            cwd=ROOT, env=env, text=True, capture_output=True, check=False,
        )
        self.assertEqual(run.returncode, 2)
        self.assertIn("TYPESAFE_API_KEY non configurata", run.stderr)

    def test_oracle_results_score_without_tuning_holdout(self):
        corpus = r3.load_corpus()
        results = []
        for case in corpus["cases"]:
            expected = case["expectedSemanticLabel"]
            if expected == "INSUFFICIENT_EVIDENCE":
                p = 0.2
                alignment = None
                baseline = expected
                c_route = "AUTO_INSUFFICIENT"
                c_label = expected
            else:
                p = 0.9
                alignment = {
                    "choice": expected,
                    "confidence": 0.9,
                    "probabilities": {
                        "ALIGNED": 1.0 if expected == "ALIGNED" else 0.0,
                        "PARTIAL": 1.0 if expected == "PARTIAL" else 0.0,
                        "CONTRADICTORY": 1.0 if expected == "CONTRADICTORY" else 0.0,
                    },
                }
                baseline = expected
                c_route = "AUTO_ALIGNMENT"
                c_label = expected
            results.append({
                "caseId": case["id"],
                "split": case["split"],
                "paraphraseGroup": case["paraphraseGroup"],
                "provider": "HARNESS_TEST_ONLY",
                "policyVersion": "R3-POLICY-001",
                "evidenceSufficientNoul": p,
                "alignment": alignment,
                "baselineSemanticLabel": baseline,
                "conservativeRoute": c_route,
                "conservativeSemanticLabel": c_label,
                "usage": {"inputTokens": 1, "outputTokens": 1},
                "elapsedMs": 1.0,
                "advisoryOnly": True,
                "stateDigest": base.canonical_digest(r3.state_for(case)),
                "humanReview": {"reviewed": False, "label": None, "note": None},
            })

        payload = {
            "pilotId": "TRAMA-SA-01/R3",
            "policyVersion": "R3-POLICY-001",
            "advisoryOnly": True,
            "runtimeWritesAllowed": False,
            "humanReviewComplete": False,
            "providerErrors": [],
            "results": results,
        }
        with tempfile.TemporaryDirectory() as tmp:
            raw = Path(tmp) / "raw.json"
            metrics = Path(tmp) / "metrics.json"
            raw.write_text(json.dumps(payload), encoding="utf-8")
            run = subprocess.run(
                [sys.executable, str(HARNESS), "score", "--results", str(raw), "--output", str(metrics)],
                cwd=ROOT, text=True, capture_output=True, check=False,
            )
            self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
            data = json.loads(metrics.read_text(encoding="utf-8"))
            self.assertFalse(data["holdoutTuningAllowed"])
            self.assertEqual(data["development"]["baseline"]["accuracy"], 1.0)
            self.assertEqual(data["holdout"]["baseline"]["accuracy"], 1.0)
            self.assertEqual(data["holdout"]["conservative"]["autoCoverage"], 1.0)
            self.assertEqual(data["paraphraseStability"]["holdout"]["baselineStabilityRate"], 1.0)

    def test_fake_sdk_produces_48_advisory_results_without_expected_labels(self):
        fake_sdk = textwrap.dedent(
            """
            class Choice:
                def __init__(self, instructions=None, criteria=None):
                    self.instructions = instructions
                    self.criteria = criteria
            class Noul:
                def __init__(self, instructions=None, criteria=None):
                    self.instructions = instructions
                    self.criteria = criteria
            class _Usage:
                input_tokens = 2
                output_tokens = 1
            class _NoulAnswer:
                noul = 0.9
            class _ChoiceAnswer:
                choice = "ALIGNED"
                confidence = 0.9
                probabilities = {"ALIGNED": 0.9, "PARTIAL": 0.05, "CONTRADICTORY": 0.05}
            class _Response:
                model = "jev-test"
                usage = _Usage()
                nouls = {"evidence_sufficient": _NoulAnswer()}
                choices = {"alignment": _ChoiceAnswer()}
            class TypeSafeClient:
                def __enter__(self):
                    return self
                def __exit__(self, exc_type, exc, tb):
                    return False
                def system_one(self, state, questions, model=None):
                    assert "expectedSemanticLabel" not in json_dump(state)
                    return _Response()
            def json_dump(value):
                import json
                return json.dumps(value)
            """
        )
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            (tmp_path / "typesafe_sdk.py").write_text(fake_sdk, encoding="utf-8")
            output = tmp_path / "r3.json"
            env = os.environ.copy()
            env["TYPESAFE_API_KEY"] = "synthetic-test-key"
            env["PYTHONPATH"] = str(tmp_path) + os.pathsep + env.get("PYTHONPATH", "")
            run = subprocess.run(
                [sys.executable, str(LIVE), "--output", str(output), "--model", "jev-test"],
                cwd=ROOT, env=env, text=True, capture_output=True, check=False,
            )
            self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
            data = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(len(data["results"]), 48)
            self.assertEqual(data["providerErrors"], [])
            self.assertFalse(data["holdoutTuningAllowed"])
            self.assertTrue(all(r["advisoryOnly"] for r in data["results"]))
            self.assertTrue(all(r["humanReview"]["reviewed"] is False for r in data["results"]))


if __name__ == "__main__":
    unittest.main()
