import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from af06_azzurra_scene2 import scene_plan, TEMPERATURE, TOP_K
from af06_azzurra_continuity import scene_plan as previous_plan

class Scene2RevisionTests(unittest.TestCase):
    def test_exactly_one_existing_scene(self):
        p = scene_plan()
        self.assertEqual(p, [previous_plan()[1]])
        self.assertEqual(p[0]["speaker_id"], 0)
        self.assertEqual(p[0]["scene"], 2)
        self.assertEqual(p[0]["text_sha256"], "578a1115b285e4f685df5ba7c3e931da2271125afc6392bf8043b16abc2a857d")

    def test_sampling_parameters(self):
        self.assertEqual(TEMPERATURE, "0.5")
        self.assertEqual(TOP_K, "100")
