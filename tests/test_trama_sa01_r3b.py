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
        new_pairs={(c["evidence"]["objective"],c["manifest"]["summary"]) for c in data["cases"]}
        old_pairs={(c["evidence"]["objective"],c["manifest"]["summary"]) for c in old["cases"]}
        self.assertFalse(new_pairs & old_pairs)
        by_id={c["id"]:c for c in data["cases"]}
        for label in data["labels"]:
            self.assertEqual(sum(c["expectedSemanticLabel"]==label for c in data["cases"]),12)
            self.assertEqual(sum(by_id[i]["expectedSemanticLabel"]==label for i in data["splitPolicy"]["developmentCaseIds"]),8)
            self.assertEqual(sum(by_id[i]["expectedSemanticLabel"]==label for i in data["splitPolicy"]["holdoutCaseIds"]),4)

    def test_validator_passes(self):
        r=subprocess.run([sys.executable,str(VALIDATOR)],cwd=ROOT,text=True,capture_output=True)
        self.assertEqual(r.returncode,0,r.stdout+r.stderr)
        self.assertIn("HOLDOUT 4/label",r.stdout)

    def test_holdout_fails_closed_without_one_shot_authorization(self):
        r=subprocess.run([sys.executable,str(SCRIPT),"--split","HOLDOUT"],cwd=ROOT,text=True,capture_output=True)
        self.assertEqual(r.returncode,3)
        self.assertIn("HOLDOUT bloccato",r.stderr)

    def test_authorized_holdout_selects_exactly_16(self):
        import os
        sys.path.insert(0,str(ROOT/"scripts"))
        import run_trama_sa01_typesafe_r3b as r3b
        data=json.loads(CORPUS.read_text(encoding="utf-8"))
        old=os.environ.get("TRAMA_R3B_HOLDOUT_AUTHORIZED")
        try:
            os.environ["TRAMA_R3B_HOLDOUT_AUTHORIZED"]="true"
            selected=r3b.selected_cases(data,"HOLDOUT")
            self.assertEqual(len(selected),16)
            self.assertEqual({c["id"] for c in selected},set(data["splitPolicy"]["holdoutCaseIds"]))
        finally:
            if old is None:
                os.environ.pop("TRAMA_R3B_HOLDOUT_AUTHORIZED",None)
            else:
                os.environ["TRAMA_R3B_HOLDOUT_AUTHORIZED"]=old

    def test_holdout_workflow_is_content_pinned_serialized_and_durably_one_shot(self):
        w=(ROOT/".github"/"workflows"/"trama-sa01-typesafe-r3b-holdout.yml").read_text(encoding="utf-8")
        self.assertIn('TRAMA_R3B_HOLDOUT_AUTHORIZED: "true"',w)
        self.assertIn('TRAMA_R3B_MODEL: "jev-latest"',w)
        self.assertIn('test "$GITHUB_REF" = "refs/heads/main"',w)
        self.assertIn("group: trama-sa01-r3b-holdout-one-shot",w)
        self.assertIn("cancel-in-progress: false",w)
        self.assertIn('TRAMA_R3B_CONSUMPTION_ANCHOR_SHA: "72aa1a9919229120f69f9de41f877bb428d46897"',w)
        self.assertIn('TRAMA_R3B_CASES_BLOB: "d161cc03f50d1777eaa58010419f3cc64aaa02a4"',w)
        self.assertIn('TRAMA_R3B_HARNESS_BLOB: "086fac2415238478d25311b2e74b444aafca21e6"',w)
        self.assertIn("git hash-object docs/pilots/trama-sa-01/r3b-cases.json",w)
        self.assertIn("listCommitStatusesForRef",w)
        self.assertIn("createCommitStatus",w)
        self.assertIn("trama-sa01/r3b-holdout-consumed",w)
        self.assertIn("continue-on-error: true",w)
        self.assertIn("if: always()",w)
        self.assertIn("if-no-files-found: warn",w)
        self.assertIn("--split HOLDOUT",w)
        self.assertNotIn("TRAMA_R3B_AUTHORIZED_SOURCE_SHA",w)

    def test_workflow_is_development_only(self):
        w=(ROOT/".github"/"workflows"/"trama-sa01-typesafe-r3b.yml").read_text(encoding="utf-8")
        self.assertIn("--split DEVELOPMENT",w)
        self.assertNotIn("--split HOLDOUT",w)

if __name__=="__main__":
    unittest.main()
