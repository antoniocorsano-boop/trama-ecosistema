import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "shared" / "contextual-copilot-semantic-memory"
EXPECTED_PACK_FILES = {"README.md", "index.d.ts", "package.json", "src/index.js"}


class SemanticMemoryContractTests(unittest.TestCase):
    def test_package_is_private_offline_and_node20_plus(self):
        package = json.loads((PACKAGE / "package.json").read_text(encoding="utf-8"))
        self.assertTrue(package["private"])
        self.assertEqual(package["engines"]["node"], ">=20")
        self.assertNotIn("dependencies", package)

    def test_runtime_source_has_no_storage_network_model_or_vertical_action_dependency(self):
        source = (PACKAGE / "src" / "index.js").read_text(encoding="utf-8").lower()
        for forbidden in (
            "fetch(",
            "sqlite",
            "sqlite-vec",
            "http://",
            "https://",
            "embeddinggemma",
            "ollama",
            "llama.cpp",
            "review-source",
            "link-source",
        ):
            self.assertNotIn(forbidden, source, forbidden)
        self.assertNotIn("sortrevision", source)
        self.assertNotIn("comparerevision", source)

    def test_readme_states_derived_no_authority_cas_and_consumer_responsibility(self):
        readme = (PACKAGE / "README.md").read_text(encoding="utf-8")
        for phrase in (
            "derived",
            "no authority",
            "expectedRevision",
            "canonicalRef",
            "consumer",
            "CURRICOLO",
        ):
            self.assertIn(phrase, readme)

    def test_type_surface_exposes_the_local_semantic_memory_port(self):
        declarations = (PACKAGE / "index.d.ts").read_text(encoding="utf-8")
        self.assertIn("export interface LocalSemanticMemoryPort", declarations)
        self.assertIn("mode: 'local'", declarations)
        self.assertIn("health(): Promise<SemanticMemoryHealthV1>", declarations)
        self.assertIn("upsert(request: SemanticMemoryUpsertRequestV1): Promise<SemanticMemoryUpsertReceiptV1>", declarations)
        self.assertIn("remove(request: SemanticMemoryRemoveRequestV1): Promise<SemanticMemoryRemoveReceiptV1>", declarations)
        self.assertIn("search(request: SemanticMemorySearchRequestV1): Promise<SemanticMemorySearchResponseV1>", declarations)

    def test_pack_surface_is_exactly_four_importable_files(self):
        result = subprocess.run(
            ["npm", "pack", "--dry-run", "--json"],
            cwd=PACKAGE,
            text=True,
            capture_output=True,
        )
        self.assertEqual(result.returncode, 0, msg=result.stdout + result.stderr)
        payload = json.loads(result.stdout)
        self.assertEqual(len(payload), 1)
        files = {entry["path"] for entry in payload[0]["files"]}
        self.assertEqual(files, EXPECTED_PACK_FILES)


if __name__ == "__main__":
    unittest.main()
