import copy
import json
import unittest

from scripts.validate_trama_component_evidence_registry import (
    DATA,
    ROOT,
    RegistryValidationError,
    validate_registry,
)


class TramaComponentEvidenceRegistryTests(unittest.TestCase):
    def load_registry(self):
        return json.loads(DATA.read_text(encoding="utf-8"))

    def test_current_registry_is_valid(self):
        validate_registry(self.load_registry(), ROOT)

    def test_external_present_evidence_without_repository_is_rejected(self):
        registry = copy.deepcopy(self.load_registry())
        target = next(
            entry for entry in registry["entries"]
            if entry["componentId"] == "ARENA.TABS.GOVERNED"
        )
        evidence = next(
            item for item in target["evidence"]
            if item["type"] == "BEHAVIOURAL"
        )
        evidence.pop("repository", None)

        with self.assertRaisesRegex(
            RegistryValidationError,
            "ARENA\\.TABS\\.GOVERNED external evidence repository",
        ):
            validate_registry(registry, ROOT)

    def test_local_repository_relative_evidence_does_not_require_repository(self):
        registry = copy.deepcopy(self.load_registry())
        target = next(
            entry for entry in registry["entries"]
            if entry["componentId"] == "ARENA.DIALOG_CONFIRM.LEGACY"
        )
        evidence = next(
            item for item in target["evidence"]
            if item["type"] == "BEHAVIOURAL"
        )
        self.assertNotIn("repository", evidence)
        validate_registry(registry, ROOT)


if __name__ == "__main__":
    unittest.main()
