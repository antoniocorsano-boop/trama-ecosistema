import copy
import importlib.util
import unittest
from datetime import datetime, timezone
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("validator", Path("scripts/validate_cc_mss_live_decision_package.py"))
v = importlib.util.module_from_spec(SPEC); SPEC.loader.exec_module(v)
NOW = datetime(2026, 9, 28, 15, 0, tzinfo=timezone.utc)

def incomplete():
    import json
    return json.loads(Path("config/cc-mss-01-live-one-shot-decision-package.json").read_text())

def complete():
    d=incomplete(); d.update({
      "state":"READY_FOR_HUMAN_DECISION","candidateExactSha":"a"*40,
      "credentialRef":"ref:github-app-installation:opaque","expectedPrincipalRef":"principal:opaque",
      "permissionAttestationRef":"attestation:opaque","permissionAttestationDigest":"sha256:"+"1"*64,
      "permissionAttestationExpiresAt":"2026-09-28T16:00:00Z","requestBudgetPolicyDigest":"sha256:"+"2"*64,
      "retryTimeoutPolicyDigest":"sha256:"+"3"*64,"resourceLimitPolicyDigest":"sha256:"+"4"*64,
      "canonicalizationVersion":"cc-mss-c14n-v1","authorizationReceiptRef":"receipt:opaque",
      "probeRunId":"probe:opaque","issuedAt":"2026-09-28T14:55:00Z","expiresAt":"2026-09-28T15:30:00Z",
      "clockSkewCeilingSeconds":60,"humanDecision":"PENDING"})
    return d

class TestDecisionPackage(unittest.TestCase):
 def test_template_is_not_ready_and_not_authorized(self):
  r=v.validate(incomplete(),NOW); self.assertEqual(r["state"],"NOT_READY"); self.assertEqual(r["live"],"NOT_AUTHORIZED")
 def test_incomplete_cannot_claim_ready(self):
  d=incomplete();d["state"]="READY_FOR_HUMAN_DECISION"
  with self.assertRaisesRegex(ValueError,"INCOMPLETE_PACKAGE_MUST_FAIL_CLOSED"):v.validate(d,NOW)
 def test_incomplete_cannot_authorize_live(self):
  d=incomplete();d["live"]="AUTHORIZED"
  with self.assertRaisesRegex(ValueError,"INCOMPLETE_PACKAGE_MUST_FAIL_CLOSED"):v.validate(d,NOW)
 def test_complete_package_can_only_reach_human_decision_gate(self):
  r=v.validate(complete(),NOW);self.assertEqual(r["state"],"READY_FOR_HUMAN_DECISION");self.assertEqual(r["live"],"NOT_AUTHORIZED")
 def test_write_operation_denied(self):
  d=complete();d["operations"].append("pr.merge")
  with self.assertRaisesRegex(ValueError,"OPERATIONS_INVALID"):v.validate(d,NOW)
 def test_wrong_repository_denied(self):
  d=complete();d["repository"]="other/repo"
  with self.assertRaisesRegex(ValueError,"REPOSITORY_INVALID"):v.validate(d,NOW)
 def test_wrong_authority_denied(self):
  d=complete();d["authority"]="https://example.com"
  with self.assertRaisesRegex(ValueError,"AUTHORITY_INVALID"):v.validate(d,NOW)
 def test_non_get_denied(self):
  d=complete();d["httpMethod"]="POST"
  with self.assertRaisesRegex(ValueError,"METHOD_INVALID"):v.validate(d,NOW)
 def test_remote_evidence_denied(self):
  d=complete();d["evidenceDestination"]="REMOTE"
  with self.assertRaisesRegex(ValueError,"EVIDENCE_DESTINATION_INVALID"):v.validate(d,NOW)
 def test_expired_package_denied(self):
  d=complete();d["expiresAt"]="2026-09-28T14:59:59Z"
  with self.assertRaisesRegex(ValueError,"PACKAGE_EXPIRED"):v.validate(d,NOW)
 def test_expired_attestation_denied(self):
  d=complete();d["permissionAttestationExpiresAt"]="2026-09-28T14:59:59Z"
  with self.assertRaisesRegex(ValueError,"ATTESTATION_EXPIRED"):v.validate(d,NOW)
 def test_short_attestation_lifetime_denied(self):
  d=complete();d["permissionAttestationExpiresAt"]="2026-09-28T15:10:00Z";d["expiresAt"]="2026-09-28T15:20:00Z"
  with self.assertRaisesRegex(ValueError,"ATTESTATION_LIFETIME_INSUFFICIENT"):v.validate(d,NOW)
 def test_bad_digest_denied(self):
  d=complete();d["requestBudgetPolicyDigest"]="abc"
  with self.assertRaisesRegex(ValueError,"requestBudgetPolicyDigest_INVALID"):v.validate(d,NOW)
 def test_nonopaque_credential_denied(self):
  d=complete();d["credentialRef"]="secret-value"
  with self.assertRaisesRegex(ValueError,"CREDENTIAL_REF_NOT_OPAQUE"):v.validate(d,NOW)
 def test_authorized_state_is_never_accepted_by_validator(self):
  d=complete();d["live"]="AUTHORIZED"
  with self.assertRaisesRegex(ValueError,"PREAUTH_LIVE_FORBIDDEN"):v.validate(d,NOW)
 def test_authorize_decision_not_accepted_in_pre_authorization_package(self):
  d=complete();d["humanDecision"]="AUTHORIZE_LIVE_ONE_SHOT"
  with self.assertRaisesRegex(ValueError,"HUMAN_DECISION_INVALID"):v.validate(d,NOW)

if __name__ == "__main__": unittest.main()
