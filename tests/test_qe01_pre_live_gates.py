import copy, importlib.util, json, unittest
from pathlib import Path
S=importlib.util.spec_from_file_location("v",Path("scripts/validate_qe01_pre_live_gates.py"))
v=importlib.util.module_from_spec(S);S.loader.exec_module(v)
BASE=json.loads(Path("governance/runtime/qe01-pre-live-gates-v1.json").read_text())

class TestQE01PreLive(unittest.TestCase):
 def test_baseline(self): self.assertEqual(v.validate(BASE),[])
 def test_wildcard_host_rejected(self):
  d=copy.deepcopy(BASE);d["network"]["host"]="*";self.assertIn("QE01-PL-NETWORK",v.validate(d))
 def test_cross_host_redirect_rejected(self):
  d=copy.deepcopy(BASE);d["network"]["crossHostRedirects"]=True;self.assertIn("QE01-PL-FALLBACK",v.validate(d))
 def test_secret_logging_rejected(self):
  d=copy.deepcopy(BASE);d["secret"]["logged"]=True;self.assertIn("QE01-PL-SECRET",v.validate(d))
 def test_retry_rejected(self):
  d=copy.deepcopy(BASE);d["execution"]["maxRetries"]=1;self.assertIn("QE01-PL-EXEC",v.validate(d))
 def test_model_probe_rejected(self):
  d=copy.deepcopy(BASE);d["credentialAccessProbe"]["modelInvocationAllowed"]=True;self.assertIn("QE01-PL-PROBE",v.validate(d))
 def test_probe_cannot_be_precompleted(self):
  d=copy.deepcopy(BASE);d["credentialAccessProbe"]["completed"]=True;self.assertIn("QE01-PL-PROBE",v.validate(d))
 def test_secret_in_evidence_rejected(self):
  d=copy.deepcopy(BASE);d["evidenceReceipt"]["secretsStored"]=True;self.assertIn("QE01-PL-EVIDENCE",v.validate(d))
 def test_dos_a1_activation_rejected(self):
  d=copy.deepcopy(BASE);d["dosA1"]="ACTIVE";self.assertIn("QE01-PL-DOSA1",v.validate(d))

if __name__=="__main__": unittest.main()
