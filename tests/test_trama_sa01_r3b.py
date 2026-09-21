import json,subprocess,sys,unittest
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CORPUS=ROOT/"docs"/"pilots"/"trama-sa-01"/"r3b-cases.json"
R3=ROOT/"docs"/"pilots"/"trama-sa-01"/"r3-cases.json"
SCRIPT=ROOT/"scripts"/"run_trama_sa01_typesafe_r3b.py"
VALIDATOR=ROOT/"scripts"/"validate_trama_sa01_r3b.py"

class R3BTests(unittest.TestCase):
    def test_stratified_split_and_new_cases(self):
        data=json.loads(CORPUS.read_text(encoding="utf-8"))
        old=json.loads(R3.read_text(encoding="utf-8"))
        self.assertEqual(len(data["cases"]),48)
        self.assertTrue(data["preregistered"])
        self.assertTrue(data["splitPolicy"]["holdoutLocked"])
        self.assertFalse(data["splitPolicy"]["tuningOnHoldoutAllowed"])
        self.assertFalse(set(c["id"] for c in data["cases"]) & set(c["id"] for c in old["cases"]))
        by_id={c["id"]:c for c in data["cases"]}
        for label in data["labels"]:
            self.assertEqual(sum(c["expectedSemanticLabel"]==label for c in data["cases"]),12)
            self.assertEqual(sum(by_id[i]["expectedSemanticLabel"]==label for i in data["splitPolicy"]["developmentCaseIds"]),8)
            self.assertEqual(sum(by_id[i]["expectedSemanticLabel"]==label for i in data["splitPolicy"]["holdoutCaseIds"]),4)

    def test_validator_passes(self):
        r=subprocess.run([sys.executable,str(VALIDATOR)],cwd=ROOT,text=True,capture_output=True)
        self.assertEqual(r.returncode,0,r.stdout+r.stderr)
        self.assertIn("HOLDOUT 4/label",r.stdout)

    def test_holdout_fails_closed_before_provider(self):
        r=subprocess.run([sys.executable,str(SCRIPT),"--split","HOLDOUT"],cwd=ROOT,text=True,capture_output=True)
        self.assertEqual(r.returncode,3)
        self.assertIn("HOLDOUT bloccato",r.stderr)

    def test_workflow_is_development_only(self):
        w=(ROOT/".github"/"workflows"/"trama-sa01-typesafe-r3b.yml").read_text(encoding="utf-8")
        self.assertIn("--split DEVELOPMENT",w)
        self.assertNotIn("--split HOLDOUT",w)

if __name__=="__main__":
    unittest.main()
