import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "shared" / "contextual-copilot-intent-embedding"


class ContextualCopilotIntentEmbeddingTests(unittest.TestCase):
    def test_package_tests_pass(self):
        result = subprocess.run(
            ["npm", "test"],
            cwd=PACKAGE,
            text=True,
            capture_output=True,
        )
        self.assertEqual(result.returncode, 0, msg=result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
