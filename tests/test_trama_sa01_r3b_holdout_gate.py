import json,subprocess,sys,unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CORPUS=ROOT/"docs"/"pilots"/"trama-sa-01"/"r3b-cases.json"
SCRIPT=ROOT/"scripts"/"run_trama_sa01_typesafe_r3b.py"

class R3BHoldoutGateTests(unittest.TestCase):
    def test_frozen_holdout_is_16_and_stratified(self):
        d=json.loads(CORPUS.read_text(encoding="utf-8"))
        ids=d["splitPolicy"]["holdoutCaseIds"]
        by={c["id"]:c for c in d["cases"]}
        self.assertEqual(len(ids),16)
        for label in d["labels"]:
            self.assertEqual(sum(by[i]["expectedSemanticLabel"]==label for i in ids),4)

    def test_holdout_workflow_is_separate_and_holdout_only(self):
        dev=(ROOT/".github"/"workflows"/"trama-sa01-typesafe-r3b.yml").read_text(encoding="utf-8")
        hold=(ROOT/".github"/"workflows"/"trama-sa01-typesafe-r3b-holdout.yml").read_text(encoding="utf-8")
        self.assertIn("--split DEVELOPMENT",dev)
        self.assertNotIn("--split HOLDOUT",dev)
        self.assertIn("--split HOLDOUT",hold)
        self.assertNotIn("--split DEVELOPMENT",hold)

    def test_no_runtime_or_adr_promotion(self):
        hold=(ROOT/".github"/"workflows"/"trama-sa01-typesafe-r3b-holdout.yml").read_text(encoding="utf-8")
        self.assertNotIn("push:",hold)
        self.assertIn("workflow_dispatch:",hold)

if __name__=="__main__":
    unittest.main()
