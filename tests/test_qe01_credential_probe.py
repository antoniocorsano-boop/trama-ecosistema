import importlib.util, io, json, os, unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

S=importlib.util.spec_from_file_location("p",Path("scripts/probe_qe01_nvidia_credential.py"))
p=importlib.util.module_from_spec(S);S.loader.exec_module(p)

class R:
 def __init__(self,status_code,data=None): self.status_code=status_code; self._data=data or {}
 def json(self): return self._data
class C:
 def __init__(self,response): self.response=response
 def __enter__(self): return self
 def __exit__(self,*a): pass
 def get(self,url,headers): 
  assert url=="https://integrate.api.nvidia.com/v1/models"
  assert "Authorization" in headers
  return self.response

class TestProbe(unittest.TestCase):
 def run_case(self,response=None,key="x"):
  b=io.StringIO()
  env={} if key is None else {"NVIDIA_API_KEY":key}
  with patch.dict(os.environ,env,clear=True), patch.object(p.httpx,"Client",return_value=C(response)) if response else patch.object(p.httpx,"Client"):
   with redirect_stdout(b): rc=p.main()
  return rc,json.loads(b.getvalue())
 def test_missing_secret_fails_closed(self):
  rc,r=self.run_case(key=None); self.assertEqual(rc,2); self.assertEqual(r["failureClass"],"CREDENTIAL_MISSING")
 def test_rejected_secret_normalized(self):
  rc,r=self.run_case(R(401)); self.assertEqual(rc,5); self.assertEqual(r["failureClass"],"CREDENTIAL_REJECTED")
 def test_model_visible_passes_without_invocation(self):
  rc,r=self.run_case(R(200,{"data":[{"id":p.EXPECTED_MODEL}]})); self.assertEqual(rc,0); self.assertFalse(r["modelInvoked"]); self.assertFalse(r["chatCompletionsUsed"])
 def test_model_absent_fails(self):
  rc,r=self.run_case(R(200,{"data":[]})); self.assertEqual(rc,8); self.assertEqual(r["failureClass"],"MODEL_UNAVAILABLE")

if __name__=="__main__": unittest.main()
