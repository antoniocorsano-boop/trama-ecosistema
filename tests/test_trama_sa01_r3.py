import json
import os
import subprocess
import sys
import tempfile
import textwrap
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "docs" / "pilots" / "trama-sa-01" / "r3-cases.json"
VALIDATOR = ROOT / "scripts" / "validate_trama_sa01_r3.py"
HARNESS = ROOT / "scripts" / "run_trama_sa01_r3.py"
LIVE = ROOT / "scripts" / "run_trama_sa01_typesafe_r3.py"
WORKFLOW = ROOT / ".github" / "workflows" / "trama-sa01-typesafe-r3.yml"

sys.path.insert(0, str(ROOT / "scripts"))
import run_trama_sa01 as base  # noqa: E402
import run_trama_sa01_r3 as r3  # noqa: E402


class R3CorpusTests(unittest.TestCase):
    def test_corpus_is_balanced_multidomain_and_holdout_locked(self):
        data = json.loads(CORPUS.read_text(encoding="utf-8"))
        self.assertEqual(data["pilotSpecVersion"], "3.1.0")
        self.assertEqual(len(data["cases"]), 48)
        self.assertEqual(
            Counter(c["expectedSemanticLabel"] for c in data["cases"]),
            {
                "ALIGNED": 12,
                "PARTIAL": 12,
                "CONTRADICTORY": 12,
                "INSUFFICIENT_EVIDENCE": 12,
            },
        )
        self.assertEqual(
            Counter(c["domain"] for c in data["cases"]),
            {
                "Tecnologia": 12,
                "Scienze": 12,
                "Matematica": 12,
                "Educazione civica": 12,
            },
        )
        self.assertEqual(len(data["splitPolicy"]["developmentCaseIds"]), 32)
        self.assertEqual(len(data["splitPolicy"]["holdoutCaseIds"]), 16)
        self.assertTrue(data["splitPolicy"]["holdoutLocked"])
        self.assertFalse(data["splitPolicy"]["holdoutTuningAllowed"])
        self.assertFalse(
            set(data["splitPolicy"]["developmentCaseIds"])
            & set(data["splitPolicy"]["holdoutCaseIds"])
        )
        self.assertEqual(len({c["paraphraseGroup"] for c in data["cases"]}), 24)

    def test_validator_passes(self):
        run = subprocess.run(
            [sys.executable, str(VALIDATOR)],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertIn("holdout=16 locked", run.stdout)

    def test_workflow_is_development_only(self):
        workflow = WORKFLOW.read_text(encoding="utf-8")
        self.assertIn("--split DEVELOPMENT", workflow)
        self.assertNotIn("--split HOLDOUT", workflow)
        self.assertNotIn("TRAMA_R3_HOLDOUT_AUTHORIZED", workflow)
        self.assertIn("development-metrics.json", workflow)

    def test_holdout_cli_requires_separate_authorization(self):
        env = os.environ.copy()
        env["TYPESAFE_API_KEY"] = "synthetic-key"
        env.pop("TRAMA_R3_HOLDOUT_AUTHORIZED", None)
        run = subprocess.run(
            [sys.executable, str(LIVE), "--split", "HOLDOUT", "--output", "/tmp/r3-holdout.json"],
            cwd=ROOT,
            env=env,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(run.returncode, 3)
        self.assertIn("HOLDOUT R3 non autorizzato", run.stderr)

    def test_development_fails_closed_without_key(self):
        env = os.environ.copy()
        env.pop("TYPESAFE_API_KEY", None)
        run = subprocess.run(
            [sys.executable, str(LIVE), "--split", "DEVELOPMENT", "--output", "/tmp/r3-dev.json"],
            cwd=ROOT,
            env=env,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(run.returncode, 2)
        self.assertIn("TYPESAFE_API_KEY non configurata", run.stderr)

    def test_oracle_development_results_score(self):
        corpus = r3.load_corpus()
        cases = r3.cases_for_split(corpus, "DEVELOPMENT")
        rows = []
        for case in cases:
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

            rows.append(
                {
                    "caseId": case["id"],
                    "evaluatedSplit": "DEVELOPMENT",
                    "paraphraseGroup": case["paraphraseGroup"],
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
                }
            )

        payload = {
            "pilotId": "TRAMA-SA-01/R3",
            "evaluatedSplit": "DEVELOPMENT",
            "policyVersion": "R3-POLICY-001",
            "advisoryOnly": True,
            "runtimeWritesAllowed": False,
            "humanReviewComplete": False,
            "providerErrors": [],
            "results": rows,
        }
        with tempfile.TemporaryDirectory() as tmp:
            raw = Path(tmp) / "raw.json"
            metrics = Path(tmp) / "metrics.json"
            raw.write_text(json.dumps(payload), encoding="utf-8")
            run = subprocess.run(
                [
                    sys.executable,
                    str(HARNESS),
                    "score",
                    "--split",
                    "DEVELOPMENT",
                    "--results",
                    str(raw),
                    "--output",
                    str(metrics),
                ],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=False,
            )
            self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
            data = json.loads(metrics.read_text(encoding="utf-8"))
            self.assertEqual(data["evaluatedSplit"], "DEVELOPMENT")
            self.assertTrue(data["holdoutLocked"])
            self.assertFalse(data["holdoutTuningAllowed"])
            self.assertEqual(data["classification"]["baseline"]["accuracy"], 1.0)
            self.assertEqual(data["classification"]["conservative"]["autoCoverage"], 1.0)

    def test_fake_sdk_development_run_has_32_advisory_results(self):
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
                    import json
                    assert "expectedSemanticLabel" not in json.dumps(state)
                    return _Response()
            """
        )
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            (tmp_path / "typesafe_sdk.py").write_text(fake_sdk, encoding="utf-8")
            output = tmp_path / "r3-development.json"
            env = os.environ.copy()
            env["TYPESAFE_API_KEY"] = "synthetic-test-key"
            env["PYTHONPATH"] = str(tmp_path) + os.pathsep + env.get("PYTHONPATH", "")
            run = subprocess.run(
                [
                    sys.executable,
                    str(LIVE),
                    "--split",
                    "DEVELOPMENT",
                    "--model",
                    "jev-test",
                    "--output",
                    str(output),
                ],
                cwd=ROOT,
                env=env,
                text=True,
                capture_output=True,
                check=False,
            )
            self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
            data = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(data["evaluatedSplit"], "DEVELOPMENT")
            self.assertEqual(len(data["results"]), 32)
            self.assertEqual(data["providerErrors"], [])
            self.assertTrue(all(r["advisoryOnly"] for r in data["results"]))
            self.assertTrue(all(r["humanReview"]["reviewed"] is False for r in data["results"]))


if __name__ == "__main__":
    unittest.main()
