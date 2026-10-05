import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
INTENT = ROOT / "schemas" / "atlas-visual-intent-spec.v0.1.schema.json"
RECEIPT = ROOT / "schemas" / "atlas-visual-preflight-receipt.v0.1.schema.json"


class VisualPreflightContractTests(unittest.TestCase):
    def load(self, path: pathlib.Path):
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    def test_schema_identities_are_exact_and_top_level_is_closed(self):
        intent = self.load(INTENT)
        receipt = self.load(RECEIPT)

        self.assertEqual(
            intent["properties"]["schemaVersion"]["const"],
            "atlas.visual-intent-spec/v0.1",
        )
        self.assertEqual(
            receipt["properties"]["schemaVersion"]["const"],
            "atlas.visual-preflight-receipt/v0.1",
        )
        self.assertFalse(intent["additionalProperties"])
        self.assertFalse(receipt["additionalProperties"])

    def test_receipt_authority_flags_are_required_and_fixed_false(self):
        receipt = self.load(RECEIPT)
        authority = (
            "paidComputeAuthorized",
            "allowQualityDowngrade",
            "runtimeAuthorized",
            "publicationAuthorityGranted",
        )

        for field in authority:
            self.assertIn(field, receipt["required"])
            self.assertIs(receipt["properties"][field]["const"], False)

    def test_compiled_prompt_is_bounded_to_one_variant(self):
        receipt = self.load(RECEIPT)
        compiled = receipt["properties"]["compiledPrompts"]["items"]
        self.assertEqual(compiled["properties"]["maxVariants"]["const"], 1)


if __name__ == "__main__":
    unittest.main()
