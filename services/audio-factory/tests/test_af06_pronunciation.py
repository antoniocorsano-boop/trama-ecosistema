import sys
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from af06_pronunciation import title_plan
from af06_azzurra_title import scene_plan
from af06_azzurra_scene2 import scene_plan as original_plan

class TitlePronunciationTests(unittest.TestCase):
    def test_only_title_and_exact_hint(self):
        p=title_plan()
        self.assertEqual(p["canonical_title"],"Le prime anomalie")
        self.assertEqual(p["text"],"Le prime anomalìe.")
        self.assertEqual(p["speaker_id"],0)
        self.assertEqual(p["canonical_scene_sha256"],original_plan()[0]["text_sha256"])
        self.assertEqual(scene_plan(),[p])
        self.assertTrue(original_plan()[0]["text"].startswith("Le prime anomalie. Le persone"))

    def test_reject_drift(self):
        with patch("af06_pronunciation.source_plan",return_value=[{"text":"Other title. Body","text_sha256":"x"}]):
            with self.assertRaisesRegex(ValueError,"CANONICAL_TITLE_DRIFT"):
                title_plan()
