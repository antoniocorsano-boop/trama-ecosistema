import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "governance" / "terminology" / "trama-curricolo-vocabulary-v1.json"
VALIDATOR_PATH = ROOT / "scripts" / "validate_curricolo_vocabulary.py"


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


class CurricoloVocabularyValidatorTests(unittest.TestCase):
    def _validator(self):
        self.assertTrue(
            VALIDATOR_PATH.exists(),
            "TRAMA-TERM-01 diff-aware validator must exist before its behavior can be exercised",
        )
        spec = importlib.util.spec_from_file_location("validate_curricolo_vocabulary", VALIDATOR_PATH)
        self.assertIsNotNone(spec)
        self.assertIsNotNone(spec.loader)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def _policy(self):
        return self._validator().load_policy(REGISTRY_PATH)

    def test_new_forbidden_occurrence_is_reported_with_path_line_and_token(self) -> None:
        validator = self._validator()
        diff = """diff --git a/docs/new.md b/docs/new.md
--- a/docs/new.md
+++ b/docs/new.md
@@ -0,0 +1 @@
+Curriculum pubblico
"""
        violations = validator.scan_added_lines(diff, validator.load_policy(REGISTRY_PATH))
        self.assertEqual(1, len(violations))
        self.assertEqual("docs/new.md", violations[0].path)
        self.assertEqual(1, violations[0].line)
        self.assertEqual("curriculum", violations[0].token.lower())

    def test_removed_occurrence_is_not_reported(self) -> None:
        validator = self._validator()
        diff = """diff --git a/docs/old.md b/docs/old.md
--- a/docs/old.md
+++ b/docs/old.md
@@ -1 +0,0 @@
-Curriculum pubblico
"""
        self.assertEqual([], validator.scan_added_lines(diff, validator.load_policy(REGISTRY_PATH)))

    def test_allowlisted_v1_identifier_is_accepted_only_on_declared_path(self) -> None:
        validator = self._validator()
        allowed_diff = """diff --git a/docs/contracts/CURRICULUM_SNAPSHOT_V1.schema.json b/docs/contracts/CURRICULUM_SNAPSHOT_V1.schema.json
--- a/docs/contracts/CURRICULUM_SNAPSHOT_V1.schema.json
+++ b/docs/contracts/CURRICULUM_SNAPSHOT_V1.schema.json
@@ -1 +1 @@
+{\"title\": \"CurriculumSnapshot v1\"}
"""
        policy = validator.load_policy(REGISTRY_PATH)
        self.assertEqual([], validator.scan_added_lines(allowed_diff, policy))

        forbidden_diff = """diff --git a/docs/new-contract.md b/docs/new-contract.md
--- a/docs/new-contract.md
+++ b/docs/new-contract.md
@@ -0,0 +1 @@
+CurriculumSnapshot v2
"""
        self.assertEqual(1, len(validator.scan_added_lines(forbidden_diff, policy)))

    def test_matching_is_case_insensitive(self) -> None:
        validator = self._validator()
        diff = """diff --git a/docs/new.md b/docs/new.md
--- a/docs/new.md
+++ b/docs/new.md
@@ -0,0 +1,2 @@
+CURRICULUM pubblico
+curriculum_unit_key = legacy
"""
        violations = validator.scan_added_lines(diff, validator.load_policy(REGISTRY_PATH))
        self.assertEqual(2, len(violations))

    def test_policy_rejects_legacy_allowlist_entry_without_reason(self) -> None:
        validator = self._validator()
        invalid_policy = {
            "canonicalTerms": ["curricolo"],
            "forbiddenDomainPatterns": ["(?i)curriculum"],
            "legacyAllowlist": [{"path": "legacy.md", "pattern": "curriculum", "reason": ""}],
            "excludedPaths": [],
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            policy_path = Path(temp_dir) / "policy.json"
            policy_path.write_text(json.dumps(invalid_policy), encoding="utf-8")
            with self.assertRaises(ValueError):
                validator.load_policy(policy_path)

    def test_explicitly_excluded_generated_path_is_ignored(self) -> None:
        validator = self._validator()
        diff = """diff --git a/dist/bundle.js b/dist/bundle.js
--- a/dist/bundle.js
+++ b/dist/bundle.js
@@ -0,0 +1 @@
+const x = 'Curriculum';
"""
        self.assertEqual([], validator.scan_added_lines(diff, validator.load_policy(REGISTRY_PATH)))


if __name__ == "__main__":
    unittest.main()
