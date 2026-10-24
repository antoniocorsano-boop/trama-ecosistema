import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CORE = ROOT / "shared" / "contextual-copilot-core"


class ContextualCopilotCoreTests(unittest.TestCase):
    def test_cross_app_core_contract_passes(self):
        result = subprocess.run(
            ["npm", "test"],
            cwd=CORE,
            text=True,
            capture_output=True,
        )
        self.assertEqual(result.returncode, 0, msg=result.stdout + result.stderr)
        self.assertIn("# pass 8", result.stdout)
        self.assertIn("# fail 0", result.stdout)

    def test_package_surface_is_bounded_and_reproducible(self):
        result = subprocess.run(
            ["npm", "pack", "--dry-run", "--json"],
            cwd=CORE,
            text=True,
            capture_output=True,
        )
        self.assertEqual(result.returncode, 0, msg=result.stdout + result.stderr)
        payload = json.loads(result.stdout)
        self.assertEqual(len(payload), 1)
        files = {item["path"] for item in payload[0]["files"]}
        self.assertEqual(files, {"README.md", "index.d.ts", "package.json", "src/index.js"})


if __name__ == "__main__":
    unittest.main()
