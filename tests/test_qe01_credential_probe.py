import importlib.util, io, json, os, unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

S=importlib.util.spec_from_file_location("p",Path("scripts/probe_qe01_nvidia_credential.py"))
p=importlib.util.module_from_spec(S);S.loader.exec_module(p)

class R:
 def __init__(self,status_code): self.status_code=status_code
class C:
 def __init__(self,response): self.response=response
 def __enter__(self): return self
 def __exit__(self,*a): pass
 def post(self,url,headers,json):
  assert url=="https://integrate.api.nvidia.com/v1/chat/completions"
  assert "Authorization" in headers
  assert json=={}
  return self.response

class TestProbe(unittest.TestCase):
 def run_case(self,response=None,key="x"):
  b=io.StringIO(); env={} if key is None else {"NVIDIA_API_KEY":key}
  with patch.dict(os.environ,env,clear=True), patch.object(p.httpx,"Client",return_value=C(response)) if response else patch.object(p.httpx,"Client"):
   with redirect_stdout(b): rc=p.main()
  return rc,json.loads(b.getvalue())
 def test_missing_secret_fails_closed(self):
  rc,r=self.run_case(key=None); self.assertEqual(rc,2); self.assertEqual(r["failureClass"],"CREDENTIAL_MISSING")
 def test_rejected_secret_normalized(self):
  rc,r=self.run_case(R(401)); self.assertEqual(rc,5); self.assertEqual(r["failureClass"],"CREDENTIAL_REJECTED")
 def test_validation_error_means_not_rejected_only(self):
  rc,r=self.run_case(R(422)); self.assertEqual(rc,0); self.assertFalse(r["modelInvoked"]); self.assertFalse(r["validGenerationRequestSent"])
 def test_unexpected_success_fails_closed(self):
  rc,r=self.run_case(R(200)); self.assertEqual(rc,6); self.assertEqual(r["failureClass"],"UNEXPECTED_PROVIDER_RESPONSE")

if __name__=="__main__": unittest.main()
