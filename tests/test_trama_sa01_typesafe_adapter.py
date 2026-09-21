import json
import os
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ADAPTER = ROOT / "scripts" / "run_trama_sa01_typesafe.py"


class TramaSA01TypeSafeAdapterTests(unittest.TestCase):
    def test_live_adapter_fails_closed_without_key(self):
        env = os.environ.copy()
        env.pop("TYPESAFE_API_KEY", None)
        run = subprocess.run(
            [sys.executable, str(ADAPTER), "--output", str(ROOT / "artifacts" / "should-not-exist.json")],
            cwd=ROOT,
            env=env,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(run.returncode, 2)
        self.assertIn("TYPESAFE_API_KEY non configurata", run.stderr)

    def test_adapter_contract_with_fake_sdk(self):
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

            class _ChoiceAnswer:
                choice = "ALIGNED"
                confidence = 0.91
                probabilities = {
                    "ALIGNED": 0.91,
                    "PARTIAL": 0.05,
                    "CONTRADICTORY": 0.02,
                    "INSUFFICIENT_EVIDENCE": 0.02,
                }

            class _NoulAnswer:
                noul = 0.88

            class _Usage:
                input_tokens = 10
                output_tokens = 2

            class _Response:
                model = "jev-test"
                usage = _Usage()
                choices = {"alignment": _ChoiceAnswer()}
                nouls = {"claim_support": _NoulAnswer()}

            class TypeSafeClient:
                def __enter__(self):
                    return self
                def __exit__(self, exc_type, exc, tb):
                    return False
                def system_one(self, state, questions, model=None):
                    assert set(questions) == {"alignment", "claim_support"}
                    return _Response()
            """
        )
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            (tmp_path / "typesafe_sdk.py").write_text(fake_sdk, encoding="utf-8")
            output = tmp_path / "raw.json"
            env = os.environ.copy()
            env["TYPESAFE_API_KEY"] = "synthetic-test-key"
            env["PYTHONPATH"] = str(tmp_path) + os.pathsep + env.get("PYTHONPATH", "")
            run = subprocess.run(
                [sys.executable, str(ADAPTER), "--output", str(output), "--model", "jev-test"],
                cwd=ROOT,
                env=env,
                text=True,
                capture_output=True,
                check=False,
            )
            self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
            data = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(len(data["results"]), 10)
            self.assertEqual(data["providerErrors"], [])
            self.assertFalse(data["runtimeWritesAllowed"])
            self.assertFalse(data["humanReviewComplete"])
            self.assertTrue(all(row["advisoryOnly"] for row in data["results"]))
            self.assertTrue(all(row["humanReview"]["reviewed"] is False for row in data["results"]))
            self.assertTrue(all(row["semanticLabel"] == "ALIGNED" for row in data["results"]))


if __name__ == "__main__":
    unittest.main()
