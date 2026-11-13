"""No-network tests for 2-scene voice-continuity trial."""
import os
import sys
import tempfile
import unittest
import wave
from array import array
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from af03_continuity_trial import load_manifest, main, qualify_listening

class ContinuityTests(unittest.TestCase):
    def test_manifest_and_profile(self):
        p = load_manifest()
        self.assertEqual(p["voice_profile"]["style_id"], "natural_narration")
        self.assertEqual(len(p["scenes"]), 2)
        self.assertFalse(p["continuity_verified"])
        self.assertFalse(p["audio_generation_authorized"])

    def test_validation_does_not_load_model(self):
        self.assertEqual(main(["--validate-only"]), 0)

    def test_no_unauthorized_access(self):
        with patch.dict(os.environ, {"TRAMA_AF03_CONTINUITY_AUTHORIZED": "no"}):
            with tempfile.TemporaryDirectory() as d:
                path=Path(d)/"out"
                self.assertEqual(main(["--output", str(path)]),4)
                self.assertFalse(path.exists())

    def test_isolated_peak_preserves_source_and_preview(self):
        with tempfile.TemporaryDirectory() as d:
            original, preview=Path(d)/"original.wav", Path(d)/"listening.wav"
            samples=array("h", [5500]*240000)
            samples[132000]=32767
            with wave.open(str(original),"wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(24000)
                w.writeframes(samples.tobytes())
            r=qualify_listening(original,preview,"Questa frase narrativa prosegue una scena.")
            self.assertEqual(r["status"],"LISTENING_ONLY_UNQUALIFIED")
            self.assertEqual(r["peak_diagnostics"]["near_full_scale_count"],1)
            self.assertTrue(original.exists())
            self.assertTrue(preview.exists())
            self.assertFalse(r["published"])

    def test_workflow_requires_label(self):
        content=(Path(__file__).resolve().parents[3]/
                 ".github/workflows/audio-factory-af03-continuity.yml").read_text()
        for s in ("types: [labeled]","af03-continuita-autorizzata",
                  "pull_request.number == 304","persist-credentials: false"):
            self.assertIn(s,content)
        for s in ("workflow_dispatch","push:","HF_TOKEN:","apt-get"):
            self.assertNotIn(s,content)
