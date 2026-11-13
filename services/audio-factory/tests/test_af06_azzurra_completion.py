import sys
import json
import hashlib
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from af06_azzurra_completion import scene_plan, TEMPERATURE, TOP_K, FIXTURE

class CompletionTests(unittest.TestCase):
    def test_only_remaining_canonical_bodies(self):
        p=scene_plan()
        self.assertEqual([r["scene"] for r in p],[3,4,5])
        self.assertEqual([r["speaker_id"] for r in p],[0,0,0])
        source=json.loads(FIXTURE.read_text(encoding="utf-8"))["scenes"][2:]
        for r, x in zip(p,source):
            self.assertEqual(r["text"],x["text"])
            self.assertEqual(r["canonical_title"],x["title"])
            self.assertEqual(r["narration_scope"],"BODY_ONLY")
            self.assertEqual(r["text_sha256"],hashlib.sha256(x["text"].encode()).hexdigest())
        self.assertEqual(TEMPERATURE,"0.5")
        self.assertEqual(TOP_K,"100")
