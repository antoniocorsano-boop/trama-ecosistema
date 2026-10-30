import hashlib
import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "shared" / "contextual-copilot-semantic-memory"
MANIFEST = PACKAGE / "distribution.json"
EXPECTED_FILES = {"README.md", "index.d.ts", "package.json", "src/index.js"}
EXPECTED_SOURCE_COMMIT = "34e5e8a75ace1d32bc54b692c4abcc39e7561e9b"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class SemanticMemoryDistributionTests(unittest.TestCase):
    def load_manifest(self):
        self.assertTrue(MANIFEST.exists(), "distribution.json must exist")
        return json.loads(MANIFEST.read_text(encoding="utf-8"))

    def test_manifest_is_exact_versioned_and_offline_for_consumers(self):
        manifest = self.load_manifest()
        self.assertEqual(
            manifest["schemaVersion"],
            "trama.contextual-copilot-semantic-memory-distribution/v1",
        )
        self.assertEqual(manifest["package"]["name"], "@trama/contextual-copilot-semantic-memory")
        self.assertEqual(manifest["package"]["version"], "0.1.0")
        self.assertEqual(manifest["source"]["repository"], "antoniocorsano-boop/trama-ecosistema")
        self.assertEqual(manifest["source"]["commit"], EXPECTED_SOURCE_COMMIT)
        self.assertEqual(manifest["source"]["path"], "shared/contextual-copilot-semantic-memory")
        self.assertEqual(manifest["consumerMode"], "vendored-file-package")
        self.assertFalse(manifest["networkRequiredAtBuild"])
        self.assertFalse(manifest["externalRegistryRequired"])

    def test_manifest_file_set_and_hashes_match_the_frozen_package(self):
        manifest = self.load_manifest()
        entries = manifest["files"]
        self.assertEqual({entry["path"] for entry in entries}, EXPECTED_FILES)
        self.assertEqual(len(entries), len(EXPECTED_FILES))
        for entry in entries:
            path = PACKAGE / entry["path"]
            self.assertTrue(path.is_file(), f"missing package file: {entry['path']}")
            self.assertRegex(entry["sha256"], r"^[0-9a-f]{64}$")
            self.assertEqual(entry["sha256"], sha256(path), f"digest drift: {entry['path']}")

    def test_pack_surface_stays_bounded_to_the_importable_four_files(self):
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


if __name__ == "__main__":
    unittest.main()
