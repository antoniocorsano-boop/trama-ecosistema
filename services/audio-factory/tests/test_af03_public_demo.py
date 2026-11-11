"""AF-03 public Space trial safety checks; never load model in offline tests."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from af03_public_demo import load_plans, get_audio_path, main

class TrialTests(unittest.TestCase):
    def test_identical_italian_scripts(self):
        p=load_plans()
        self.assertEqual(len(p),2)
        self.assertEqual(p[0]["text"],p[1]["text"])
        self.assertNotEqual(p[0]["style_id"],p[1]["style_id"])
        self.assertTrue(all(x["compute_mode"]=="FREE_ONLY" and x["voice_cloning"] is False for x in p))
    def test_offline_validation(self):
        self.assertEqual(main(["--validate-only"]),0)
    def test_without_authorization_no_files(self):
        with patch.dict(os.environ, {"TRAMA_AF03_PUBLIC_DEMO_AUTHORIZED":"no"}):
            with tempfile.TemporaryDirectory() as d:
                output=Path(d)/"trial"
                self.assertEqual(main(["--output",str(output)]),4)
                self.assertFalse(output.exists())
    def test_audio_path_construction(self):
        self.assertIsNone(get_audio_path(None))
        self.assertEqual(get_audio_path({"path":"/tmp/clip.wav"}),Path("/tmp/clip.wav"))
    def test_workflow_is_label_only_and_no_secrets(self):
        path=Path(__file__).resolve().parents[3]/".github/workflows/audio-factory-af03-zerogpu.yml"
        content=path.read_text(encoding="utf-8")
        self.assertIn("types: [labeled]",content)
        self.assertIn("pull_request.number == 304",content)
        self.assertIn("af03-demo-autorizzato",content)
        self.assertIn("persist-credentials: false",content)
        self.assertNotIn("workflow_dispatch",content)
        self.assertNotIn("push:",content)
        self.assertNotIn("HF_TOKEN:",content)
