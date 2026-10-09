import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "governance" / "terminology" / "trama-curricolo-vocabulary-v1.json"


class CurricoloVocabularyRegistryTests(unittest.TestCase):
    def test_registry_declares_curricolo_and_requires_legacy_reason(self) -> None:
        self.assertTrue(
            REGISTRY_PATH.exists(),
            "TRAMA-TERM-01 registry must exist before terminology governance can be enforced",
        )

        policy = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        canonical_terms = policy.get("canonicalTerms", [])
        self.assertIn("curricolo", [term.lower() for term in canonical_terms])

        allowlist = policy.get("legacyAllowlist", [])
        for index, entry in enumerate(allowlist):
            with self.subTest(index=index):
                self.assertTrue(str(entry.get("path", "")).strip())
                self.assertTrue(str(entry.get("pattern", "")).strip())
                self.assertTrue(str(entry.get("reason", "")).strip())


if __name__ == "__main__":
    unittest.main()
