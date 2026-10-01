import copy, importlib.util, json, unittest
from pathlib import Path
SPEC=importlib.util.spec_from_file_location("v",Path("scripts/validate_qe01_execution_profile.py"))
v=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(v)
BASE=json.loads(Path("governance/runtime/qe01-first-qualified-execution-profile.json").read_text())

class TestQE01(unittest.TestCase):
 def test_authorized_profile_is_valid_and_bound_to_reviewed_head(self):
  self.assertEqual(v.validate(BASE),[])
  self.assertEqual(BASE["state"],"AUTHORIZED_FOR_QUALIFIED_EXECUTION")
  self.assertTrue(BASE["executable"])
  self.assertEqual(BASE["executionTarget"]["reviewedExactHead"],BASE["humanExactHeadReview"]["approvedHead"])
 def test_auto_mutation_is_rejected(self):
  d=copy.deepcopy(BASE);d["authorityBoundaries"]["arenaWrite"]=True
  self.assertIn("QE01-MUTATION",v.validate(d))
 def test_dos_a1_activation_is_rejected(self):
  d=copy.deepcopy(BASE);d["authorityBoundaries"]["dosA1"]="ACTIVE"
  self.assertIn("QE01-AUTHORITY",v.validate(d))
 def test_student_data_is_rejected(self):
  d=copy.deepcopy(BASE);d["dataPolicy"]["personalStudentData"]=True
  self.assertIn("QE01-DATA",v.validate(d))
 def test_executable_without_provider_is_rejected(self):
  d=copy.deepcopy(BASE);d["runtime"]["providerId"]=""
  self.assertIn("QE01-EXEC-BLOCK",v.validate(d))
 def test_provider_binding_cannot_claim_pending_provider_after_binding(self):
  d=copy.deepcopy(BASE)
  d["state"]="AUTHORIZED_PENDING_PROVIDER_QUALIFICATION"
  self.assertIn("QE01-PROVIDER-STATE",v.validate(d))
 def test_executable_requires_all_gates(self):
  d=copy.deepcopy(BASE);d["gates"]["HUMAN_EXACT_HEAD_REVIEW"]=False
  self.assertIn("QE01-EXEC-BLOCK",v.validate(d))
 def test_execution_target_must_match_reviewed_head(self):
  d=copy.deepcopy(BASE);d["executionTarget"]["reviewedExactHead"]="deadbeef"
  self.assertIn("QE01-TARGET",v.validate(d))

if __name__=="__main__": unittest.main()
