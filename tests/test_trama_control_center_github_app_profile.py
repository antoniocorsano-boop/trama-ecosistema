import copy
import importlib.util
import json
import unittest
from pathlib import Path

SPEC=importlib.util.spec_from_file_location("p",Path("scripts/validate_trama_control_center_github_app_profile.py"));v=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(v)
P=json.loads(Path("config/trama-control-center-github-app-profile.json").read_text());R=json.loads(Path("config/trama-control-center-system-registry.json").read_text())

class TestProfile(unittest.TestCase):
 def test_profile_passes_offline(self): self.assertEqual(v.validate(copy.deepcopy(P),copy.deepcopy(R))["result"],"PASS")
 def test_all_repositories_scope_denied(self):
  p=copy.deepcopy(P);p["installationScope"]="ALL_REPOSITORIES"
  with self.assertRaisesRegex(ValueError,"INSTALLATION_SCOPE_INVALID"):v.validate(p,R)
 def test_write_permission_denied(self):
  p=copy.deepcopy(P);p["repositoryPermissions"]["contents"]="write"
  with self.assertRaisesRegex(ValueError,"REPOSITORY_PERMISSIONS_INVALID"):v.validate(p,R)
 def test_extra_permission_denied(self):
  p=copy.deepcopy(P);p["repositoryPermissions"]["issues"]="read"
  with self.assertRaisesRegex(ValueError,"REPOSITORY_PERMISSIONS_INVALID"):v.validate(p,R)
 def test_org_permission_denied(self):
  p=copy.deepcopy(P);p["organizationPermissions"]={"members":"read"}
  with self.assertRaisesRegex(ValueError,"NON_REPOSITORY_PERMISSION_FORBIDDEN"):v.validate(p,R)
 def test_webhook_denied(self):
  p=copy.deepcopy(P);p["webhooks"]={"enabled":True,"events":["push"]}
  with self.assertRaisesRegex(ValueError,"WEBHOOKS_FORBIDDEN"):v.validate(p,R)
 def test_private_key_repository_denied(self):
  p=copy.deepcopy(P);p["credentialBoundary"]["privateKeyInRepository"]=True
  with self.assertRaisesRegex(ValueError,"SECRET_BOUNDARY_INVALID"):v.validate(p,R)
 def test_token_in_package_denied(self):
  p=copy.deepcopy(P);p["credentialBoundary"]["installationTokenInDecisionPackage"]=True
  with self.assertRaisesRegex(ValueError,"SECRET_BOUNDARY_INVALID"):v.validate(p,R)
 def test_nonopaque_binding_denied(self):
  p=copy.deepcopy(P);p["credentialBoundary"]["acceptedRuntimeBinding"]="TOKEN"
  with self.assertRaisesRegex(ValueError,"RUNTIME_BINDING_INVALID"):v.validate(p,R)
 def test_multi_repo_single_probe_denied(self):
  p=copy.deepcopy(P);p["probeBoundary"]["oneRepositoryPerLiveOneShot"]=False
  with self.assertRaisesRegex(ValueError,"PROBE_SCOPE_INVALID"):v.validate(p,R)
 def test_remote_evidence_denied(self):
  p=copy.deepcopy(P);p["probeBoundary"]["evidenceDestination"]="REMOTE"
  with self.assertRaisesRegex(ValueError,"EVIDENCE_DESTINATION_INVALID"):v.validate(p,R)
 def test_missing_human_gate_denied(self):
  p=copy.deepcopy(P);p["probeBoundary"]["separateHumanAuthorizationRequired"]=False
  with self.assertRaisesRegex(ValueError,"HUMAN_AUTHORIZATION_REQUIRED"):v.validate(p,R)
 def test_live_state_denied(self):
  p=copy.deepcopy(P);p["live"]="AUTHORIZED"
  with self.assertRaisesRegex(ValueError,"LIVE_STATE_INVALID"):v.validate(p,R)
 def test_disabled_registry_system_denied(self):
  r=copy.deepcopy(R);r["systems"][0]["monitoring"]="DISABLED"
  with self.assertRaisesRegex(ValueError,"REGISTRY_SYSTEM_INVALID"):v.validate(P,r)

if __name__=="__main__":unittest.main()
