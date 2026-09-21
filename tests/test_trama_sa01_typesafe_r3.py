import json,subprocess,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SCRIPT=ROOT/"scripts"/"run_trama_sa01_typesafe_r3.py"
CASES=ROOT/"docs"/"pilots"/"trama-sa-01"/"r3-cases.json"
class R3Tests(unittest.TestCase):
    def test_preregistered_corpus_shape(self):
        d=json.loads(CASES.read_text(encoding="utf-8"))
        self.assertEqual(len(d["cases"]),48)
        self.assertEqual(sum(c["split"]=="DEVELOPMENT" for c in d["cases"]),32)
        self.assertEqual(sum(c["split"]=="HOLDOUT" for c in d["cases"]),16)
        for label in d["labels"]:
            self.assertEqual(sum(c["expectedSemanticLabel"]==label for c in d["cases"]),12)
        self.assertFalse(d["tuningOnHoldoutAllowed"])
        self.assertFalse(d["policy"]["personalDataAllowed"])
    def test_validator(self):
        r=subprocess.run([sys.executable,str(SCRIPT),"--validate-only"],cwd=ROOT,text=True,capture_output=True)
        self.assertEqual(r.returncode,0,r.stdout+r.stderr)
        self.assertIn("R3 corpus PASS",r.stdout)
if __name__=="__main__": unittest.main()
