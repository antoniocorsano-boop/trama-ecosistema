import json
import subprocess
import sys
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ProviderAdapterFailClosedTests(unittest.TestCase):
    def run_script(self, rel, extra):
        with tempfile.TemporaryDirectory() as td:
            output = Path(td) / "out.json"
            cmd = [sys.executable, str(ROOT / rel), *extra, "--output", str(output)]
            subprocess.run(cmd, check=True)
            return json.loads(output.read_text())

    def test_kubernetes_requires_explicit_zero_marginal_authorization(self):
        data = self.run_script(
            "scripts/probe_owned_k8s_entitlement.py",
            ["--estimated-runs-remaining", "2"],
        )
        self.assertEqual(data["decision"], "UNKNOWN")
        self.assertEqual(data["reason"], "ZERO_MARGINAL_USE_NOT_AUTHORIZED")
        self.assertFalse(data["providerRecord"]["authorized"])

    def test_azure_without_cli_fails_closed_or_reads_if_environment_has_cli(self):
        data = self.run_script(
            "scripts/probe_azure_credit_entitlement.py",
            [
                "--billing-account-id", "fixture-account",
                "--billing-profile-id", "fixture-profile",
                "--run-cost-upper-bound-usd", "2.0",
            ],
        )
        self.assertIn(data["decision"], {"NOT_CONFIGURED", "UNKNOWN"})
        self.assertNotEqual(data["decision"], "ELIGIBLE")


if __name__ == "__main__":
    unittest.main()
