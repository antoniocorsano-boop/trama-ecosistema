from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
PRODUCTION = ROOT / "docs" / "capabilities" / "atlas-percorsi" / "production"
PIPELINE_DOC = PRODUCTION / "VISUAL-GENERATION-PIPELINE-v0.2.md"
RECEIPT_DOC = PRODUCTION / "VF-ORCH-01-QUALIFICATION-RECEIPT-v0.1.md"
PROVIDER_MATRIX_DOC = PRODUCTION / "PROVIDER-QUALIFICATION-MATRIX-v0.1.md"


class VisualFactoryHfGovernanceDocsTests(unittest.TestCase):
    def test_governed_docs_match_live_credential_boundary(self):
        pipeline = PIPELINE_DOC.read_text(encoding="utf-8")
        receipt = RECEIPT_DOC.read_text(encoding="utf-8")
        matrix = PROVIDER_MATRIX_DOC.read_text(encoding="utf-8")

        for doc in (pipeline, receipt, matrix):
            self.assertNotIn("credential-neutral", doc)

        self.assertIn("`dry-run` remains credential-free", pipeline)
        self.assertIn("live `references` / `shots` step binds `HF_TOKEN`", pipeline)
        self.assertIn("`dry-run` remains credential-free", receipt)
        self.assertIn("only for live `references` / `shots` execution", receipt)
        self.assertIn("`dry-run` remains credential-free", matrix)
        self.assertIn("trusted provider credentials only in the live execution step", matrix)


if __name__ == "__main__":
    unittest.main()
