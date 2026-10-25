import json
import re
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "shared" / "contextual-copilot-intent-embedding"
EXPECTED_FILES = {"README.md", "index.d.ts", "package.json", "src/index.js"}


class ContextualCopilotIntentEmbeddingTests(unittest.TestCase):
    def test_package_tests_pass(self):
        result = subprocess.run(
            ["npm", "test"],
            cwd=PACKAGE,
            text=True,
            capture_output=True,
        )
        self.assertEqual(result.returncode, 0, msg=result.stdout + result.stderr)
        self.assertRegex(result.stdout, r"# tests [1-9]\d*")
        self.assertIn("# fail 0", result.stdout)

    def test_package_surface_is_bounded_and_offline_consumable(self):
        manifest = json.loads((PACKAGE / "package.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["name"], "@trama/contextual-copilot-intent-embedding")
        self.assertEqual(manifest["version"], "0.1.0")
        self.assertNotIn("dependencies", manifest)
        self.assertEqual(manifest.get("peerDependencies"), {"@trama/contextual-copilot-core": "^0.3.0"})

        result = subprocess.run(
            ["npm", "pack", "--dry-run", "--json"],
            cwd=PACKAGE,
            text=True,
            capture_output=True,
        )
        self.assertEqual(result.returncode, 0, msg=result.stdout + result.stderr)
        payload = json.loads(result.stdout)
        self.assertEqual(len(payload), 1)
        files = {item["path"] for item in payload[0]["files"]}
        self.assertEqual(files, EXPECTED_FILES)

    def test_runtime_has_no_network_provider_storage_or_core_runtime_coupling(self):
        runtime = (PACKAGE / "src" / "index.js").read_text(encoding="utf-8")
        forbidden = [
            "fetch(",
            "http://",
            "https://",
            "node:http",
            "node:https",
            "node:net",
            "node:fs",
            "node:child_process",
            "@trama/contextual-copilot-core",
            "openai",
            "anthropic",
            "gemini",
        ]
        for token in forbidden:
            self.assertNotIn(token, runtime.lower(), f"forbidden runtime token: {token}")
        self.assertIsNone(re.search(r"\b(localstorage|indexeddb|sqlite|postgres|redis)\b", runtime, re.IGNORECASE))

    def test_public_readme_documents_local_only_authority_and_failure_boundaries(self):
        readme = (PACKAGE / "README.md").read_text(encoding="utf-8")
        required = [
            "mode: 'local'",
            "createEmbeddingIntentPort",
            "minSimilarity",
            "0.75",
            "minMargin",
            "0.08",
            "NO_INTENT_MATCH",
            "INTENT_RESOLUTION_FAILED",
            "INTENT_DISCOVERY_FAILED",
            "consumer",
            "authority",
            "provider",
            "stateless",
        ]
        for token in required:
            self.assertIn(token, readme, f"README missing contract token: {token}")


if __name__ == "__main__":
    unittest.main()
