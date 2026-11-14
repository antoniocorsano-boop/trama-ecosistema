"""FD-05/C: diagnostic report must never grant deployment authority."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from free_deploy_readiness import assess, ARCHIVE_SHA, HOST

META = {
    "state": "PROJECT_METADATA_PASS", "project": "trama-fd02",
    "hostname": HOST, "productionBranch": "main",
    "currentProductionDeploymentId": "12345678-1234-1234-1234-123456789abc",
    "readOnly": True, "writesPerformed": False, "syntheticOnly": True,
}
REMOTE = {
    "state": "REMOTE_BYTES_VERIFIED", "fixture": "FD-02/1.0.1",
    "origin": "https://" + HOST, "archiveSha256": ARCHIVE_SHA,
    "fileCount": 6, "syntheticOnly": True,
}


class ReadinessTests(unittest.TestCase):
    def test_mobile_pass_is_not_remote_or_cost_pass(self):
        report = assess(metadata=META, human_mobile_pass=True)
        self.assertTrue(report["observations"]["humanMobilePassReported"])
        self.assertFalse(report["observations"]["remoteBytesReceiptMatches"])
        self.assertIn("REMOTE_BYTES_EVIDENCE_MISSING_OR_INVALID", report["blockers"])
        self.assertIn("ACCOUNT_FREE_ONLY_UNQUALIFIED", report["blockers"])

    def test_matching_receipts_do_not_unlock(self):
        report = assess(metadata=META, remote=REMOTE, human_mobile_pass=True)
        self.assertTrue(report["observations"]["metadataReceiptMatches"])
        self.assertTrue(report["observations"]["remoteBytesReceiptMatches"])
        self.assertEqual(report["state"], "NOT_AUTHORIZED")
        for key in ("deployAuthorized", "studentPublicationAuthorized",
                    "privacyQualified", "costVerified", "quotaVerified"):
            self.assertIs(report[key], False)

    def test_wrong_digest_or_count_is_rejected(self):
        for change in ({"archiveSha256": "0" * 64}, {"fileCount": 5},
                       {"origin": "https://other.pages.dev"},
                       {"syntheticOnly": False}):
            self.assertFalse(assess(remote={**REMOTE, **change})
                             ["observations"]["remoteBytesReceiptMatches"])

    def test_wrong_metadata_is_rejected(self):
        for change in ({"hostname": "other.pages.dev"},
                       {"productionBranch": "preview"},
                       {"currentProductionDeploymentId": "not-a-uuid"},
                       {"writesPerformed": True}, {"readOnly": False}):
            self.assertFalse(assess(metadata={**META, **change})
                             ["observations"]["metadataReceiptMatches"])

    def test_claimed_authorization_has_no_effect(self):
        report = assess(metadata={**META, "deployAuthorized": True,
                                   "costVerified": True, "quotaVerified": True},
                        remote={**REMOTE, "privacyQualified": True,
                                "studentPublicationAuthorized": True})
        self.assertFalse(report["observations"]["metadataReceiptMatches"])
        self.assertFalse(report["observations"]["remoteBytesReceiptMatches"])
        self.assertFalse(report["deployAuthorized"])
        self.assertFalse(report["studentPublicationAuthorized"])

    def test_malformed_input_fails_closed(self):
        report = assess(metadata=[], remote="PASS", human_mobile_pass="true")
        self.assertFalse(any(report["observations"].values()))
        self.assertIn("METADATA_EVIDENCE_MISSING_OR_INVALID", report["blockers"])

    def test_rollback_and_private_access_remain_separate(self):
        report = assess(metadata=META, remote=REMOTE)
        self.assertIn("ROLLBACK_NOT_QUALIFIED", report["blockers"])
        self.assertIn("RESTRICTED_ACCESS_NOT_QUALIFIED", report["blockers"])
        self.assertIn("EXACT_DEPLOY_AUTHORIZATION_MISSING", report["blockers"])


if __name__ == "__main__":
    unittest.main()
