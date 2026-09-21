import json
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class GovernanceTests(unittest.TestCase):
    def test_validator_passes(self):
        result = subprocess.run(
            [sys.executable, str(ROOT / "scripts" / "validate_governance.py")],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_authorities_are_unique_by_domain(self):
        data = json.loads((ROOT / "docs/knowledge/source-registry.json").read_text(encoding="utf-8"))
        domains = [item["domain"] for item in data["sources"]]
        self.assertEqual(len(domains), len(set(domains)))

    def test_dos_a1_is_deferred(self):
        data = json.loads((ROOT / "status/ecosystem-status.json").read_text(encoding="utf-8"))
        dos = next(item for item in data["capabilities"] if item["id"] == "DOS-A1")
        self.assertEqual(dos["state"], "DEFERRED")

    def test_arena_authority_is_explicit(self):
        data = json.loads((ROOT / "docs/knowledge/source-registry.json").read_text(encoding="utf-8"))
        curriculum = next(item for item in data["sources"] if item["domain"] == "curriculum")
        self.assertEqual(curriculum["authority"], "CurManLight_arena")


if __name__ == "__main__":
    unittest.main()

