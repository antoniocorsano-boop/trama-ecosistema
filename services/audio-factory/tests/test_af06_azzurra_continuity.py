import unittest
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from af06_azzurra_continuity import scene_plan

class AzzurraContinuityTests(unittest.TestCase):
    def test_only_two_canonical_scenes_same_speaker(self):
        p=scene_plan()
        self.assertEqual([r["scene"] for r in p],[1,2])
        self.assertEqual([r["speaker_id"] for r in p],[0,0])
        self.assertTrue(p[0]["text"].startswith("La città perfetta. Le città sono diventate intelligenti."))
        self.assertTrue(p[1]["text"].startswith("Le prime anomalie. Poi") is False)
        self.assertTrue(p[1]["text"].startswith("Le prime anomalie. Le persone"))
        self.assertTrue(p[1]["text"].endswith("smettono di fare domande."))
        self.assertNotEqual(p[0]["text_sha256"],p[1]["text_sha256"])
        self.assertEqual(p,scene_plan())
