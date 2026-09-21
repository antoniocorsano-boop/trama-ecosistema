import json
import subprocess
import sys
import unittest
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CORPUS=ROOT/"docs"/"pilots"/"trama-sa-01"/"r3-cases.json"
VALIDATOR=ROOT/"scripts"/"validate_trama_sa01_r3.py"

class R3CorpusTests(unittest.TestCase):
    def test_preregistered_corpus_is_balanced_and_locked(self):
        data=json.loads(CORPUS.read_text(encoding="utf-8"))
        self.assertEqual(len(data["cases"]),48)
        self.assertEqual(Counter(c["expectedSemanticLabel"] for c in data["cases"]),{
            "ALIGNED":12,"PARTIAL":12,"CONTRADICTORY":12,"INSUFFICIENT_EVIDENCE":12
        })
        self.assertEqual(len(data["splitPolicy"]["developmentCaseIds"]),32)
        self.assertEqual(len(data["splitPolicy"]["holdoutCaseIds"]),16)
        self.assertTrue(data["splitPolicy"]["holdoutLocked"])
        self.assertFalse(set(data["splitPolicy"]["developmentCaseIds"]) & set(data["splitPolicy"]["holdoutCaseIds"]))

    def test_validator_passes(self):
        r=subprocess.run([sys.executable,str(VALIDATOR)],cwd=ROOT,text=True,capture_output=True)
        self.assertEqual(r.returncode,0,r.stdout+r.stderr)
        self.assertIn("48 semantic",r.stdout)

if __name__=="__main__": unittest.main()
