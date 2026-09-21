import json
import os
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "run_trama_sa01_typesafe_r2.py"


class TramaSA01R2Tests(unittest.TestCase):
    def test_r2_fails_closed_without_key(self):
        env = os.environ.copy()
        env.pop("TYPESAFE_API_KEY", None)
        run = subprocess.run(
            [sys.executable, str(SCRIPT), "--output", str(ROOT / "artifacts" / "r2-none.json")],
            cwd=ROOT,
            env=env,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(run.returncode, 2)
        self.assertIn("TYPESAFE_API_KEY non configurata", run.stderr)

    def test_r2_routes_low_evidence_without_alignment_call(self):
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
                input_tokens = 3
                output_tokens = 1

            class _NoulAnswer:
                def __init__(self, p):
                    self.noul = p

            class _ChoiceAnswer:
                choice = "ALIGNED"
                confidence = 0.9
                probabilities = {"ALIGNED": 0.9, "PARTIAL": 0.05, "CONTRADICTORY": 0.05}

            class _Response:
                def __init__(self, kind, p=0.9):
                    self.model = "jev-test"
                    self.usage = _Usage()
                    self.nouls = {"evidence_sufficient": _NoulAnswer(p)} if kind == "noul" else {}
                    self.choices = {"alignment": _ChoiceAnswer()} if kind == "choice" else {}

            class TypeSafeClient:
                def __enter__(self):
                    return self
                def __exit__(self, exc_type, exc, tb):
                    return False
                def system_one(self, state, questions, model=None):
                    if "evidence_sufficient" in questions:
                        objective = state["curriculumEvidence"]["objective"]
                        low = (
                            "alcuni aspetti della tecnologia" in objective
                            or "Osservare e descrivere elementi" in objective
                        )
                        return _Response("noul", 0.2 if low else 0.9)
                    if "alignment" in questions:
                        return _Response("choice")
                    raise AssertionError("unexpected question")
            """
        )
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            (tmp_path / "typesafe_sdk.py").write_text(fake_sdk, encoding="utf-8")
            output = tmp_path / "r2.json"
            env = os.environ.copy()
            env["TYPESAFE_API_KEY"] = "synthetic-test-key"
            env["PYTHONPATH"] = str(tmp_path) + os.pathsep + env.get("PYTHONPATH", "")
            run = subprocess.run(
                [sys.executable, str(SCRIPT), "--output", str(output), "--model", "jev-test"],
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
            self.assertEqual(data["experimentalRoutingBoundary"], 0.5)
            self.assertEqual(data["routingBoundaryPurpose"], "QUERY_ROUTING_ONLY_NOT_AUTHORIZATION")
            by_id = {row["caseId"]: row for row in data["results"]}
            for cid in ("SA01-004", "SA01-008"):
                self.assertEqual(by_id[cid]["semanticLabel"], "INSUFFICIENT_EVIDENCE")
                self.assertEqual(by_id[cid]["route"], "EVIDENCE_INSUFFICIENT")
                self.assertIsNone(by_id[cid]["alignment"])
            self.assertTrue(all(row["advisoryOnly"] for row in data["results"]))
            self.assertTrue(all(row["humanReview"]["reviewed"] is False for row in data["results"]))


if __name__ == "__main__":
    unittest.main()
