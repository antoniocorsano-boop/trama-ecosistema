import importlib.util, unittest
from pathlib import Path
SPEC=importlib.util.spec_from_file_location("m",Path("scripts/materialize_cc_mss_live_bindings.py"));m=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(m)
SHA="a"*40

def env():
 return {"credentialRef":"ref:github-app:opaque","expectedPrincipalRef":"principal:installation:opaque","permissionAttestationRef":"attestation:opaque","permissionAttestationDigest":"sha256:"+"1"*64,"permissionAttestationExpiresAt":"2026-09-28T18:00:00Z","permissionBootstrap":"github.permissions.read","requestBudgetPolicyDigest":"sha256:"+"2"*64,"retryTimeoutPolicyDigest":"sha256:"+"3"*64,"resourceLimitPolicyDigest":"sha256:"+"4"*64,"canonicalizationVersion":"cc-mss-c14n-v1","authorizationReceiptRef":"receipt:proposed:opaque","probeRunId":"probe:proposed:opaque","issuedAt":"2026-09-28T16:00:00Z","expiresAt":"2026-09-28T17:00:00Z","clockSkewCeilingSeconds":60}
class T(unittest.TestCase):
 def test_materializes_only_pending_not_authorized(self):
  o=m.materialize({"live":"NOT_AUTHORIZED"},env(),SHA);self.assertEqual(o["state"],"READY_FOR_HUMAN_DECISION");self.assertEqual(o["live"],"NOT_AUTHORIZED");self.assertEqual(o["humanDecision"],"PENDING")
 def test_token_like_value_rejected(self):
  e=env();e["credentialRef"]="ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
  with self.assertRaisesRegex(ValueError,"SECRET_LIKE"):m.materialize({},e,SHA)
 def test_pat_like_value_rejected(self):
  e=env();e["credentialRef"]="github_pat_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
  with self.assertRaisesRegex(ValueError,"SECRET_LIKE"):m.materialize({},e,SHA)
 def test_private_key_rejected(self):
  e=env();e["expectedPrincipalRef"]="-----BEGIN PRIVATE KEY-----"
  with self.assertRaisesRegex(ValueError,"SECRET_LIKE"):m.materialize({},e,SHA)
 def test_bearer_rejected(self):
  e=env();e["credentialRef"]="Bearer abcdefghijklmnop"
  with self.assertRaisesRegex(ValueError,"SECRET_LIKE"):m.materialize({},e,SHA)
 def test_multiline_rejected(self):
  e=env();e["probeRunId"]="a\nb"
  with self.assertRaisesRegex(ValueError,"MULTILINE"):m.materialize({},e,SHA)
 def test_extra_field_rejected(self):
  e=env();e["token"]="x"
  with self.assertRaisesRegex(ValueError,"ENVELOPE_FIELDS_INVALID"):m.materialize({},e,SHA)
 def test_missing_field_rejected(self):
  e=env();del e["credentialRef"]
  with self.assertRaisesRegex(ValueError,"ENVELOPE_FIELDS_INVALID"):m.materialize({},e,SHA)
 def test_bad_sha_rejected(self):
  with self.assertRaisesRegex(ValueError,"CANDIDATE_SHA_INVALID"):m.materialize({},env(),"abc")
 def test_nonopaque_credential_rejected(self):
  e=env();e["credentialRef"]="credential"
  with self.assertRaisesRegex(ValueError,"CREDENTIAL_REF_NOT_OPAQUE"):m.materialize({},e,SHA)
 def test_bad_principal_rejected(self):
  e=env();e["expectedPrincipalRef"]="user:123"
  with self.assertRaisesRegex(ValueError,"PRINCIPAL_REF_INVALID"):m.materialize({},e,SHA)
 def test_bad_attestation_ref_rejected(self):
  e=env();e["permissionAttestationRef"]="raw"
  with self.assertRaisesRegex(ValueError,"ATTESTATION_REF_INVALID"):m.materialize({},e,SHA)
 def test_bad_digest_rejected(self):
  e=env();e["resourceLimitPolicyDigest"]="sha256:bad"
  with self.assertRaisesRegex(ValueError,"resourceLimitPolicyDigest_INVALID"):m.materialize({},e,SHA)
 def test_write_bootstrap_rejected(self):
  e=env();e["permissionBootstrap"]="github.permissions.write"
  with self.assertRaisesRegex(ValueError,"PERMISSION_BOOTSTRAP_INVALID"):m.materialize({},e,SHA)
if __name__=="__main__":unittest.main()
