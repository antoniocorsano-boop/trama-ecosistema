import os
import sys
import tempfile
import unittest
import wave
import struct
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from af04_preset_probe import run, probe_plan, API_NAME, DEMO_LANGUAGE, INSTRUCT
from narrative_direction import SPEAKER
from qwen3_prosody import baseline_text
from core import AudioRejected

class PresetProbeTests(unittest.TestCase):
    def test_exact_baseline_and_no_reference_audio(self):
        plan = probe_plan()
        self.assertEqual(plan["text"], baseline_text())
        self.assertEqual(plan["speaker"], SPEAKER)
        self.assertFalse(plan["personal_voice_input_allowed"])
        self.assertFalse(plan["voice_cloning_allowed"])

    def test_fails_closed_without_auth(self):
        with tempfile.TemporaryDirectory() as tmp, patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(RuntimeError, "EXPLICIT_AUTHORIZATION_REQUIRED"):
                run(Path(tmp)/"out", lambda: self.fail("client must not start"))

    def test_no_retry_and_no_token(self):
        for env, reason in [({"GITHUB_RUN_ATTEMPT":"2"}, "RETRY_FORBIDDEN"), ({"HF_TOKEN":"not-a-real-token"}, "ANONYMOUS_ONLY")]:
            with tempfile.TemporaryDirectory() as tmp, patch.dict(os.environ, {"TRAMA_AF04_PRESET_PROBE_AUTHORIZED":"yes", **env}, clear=True):
                with self.assertRaisesRegex(RuntimeError, reason):
                    run(Path(tmp)/"out", lambda: self.fail("client must not start"))

    def test_one_exact_request_and_optional_mp3(self):
        with tempfile.TemporaryDirectory() as tmp, patch.dict(os.environ, {"TRAMA_AF04_PRESET_PROBE_AUTHORIZED":"yes"}, clear=True):
            root = Path(tmp)
            src = root/"stub.wav"
            with wave.open(str(src), "wb") as w:
                w.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
                w.writeframes(struct.pack("<hh", 4000, -4000) * 120000)
            calls = []
            class Client:
                def predict(self, *args, **kwargs):
                    calls.append((args, kwargs))
                    return (str(src), "OK")
            with patch("af04_preset_probe.encode_mp3", side_effect=AudioRejected("FFMPEG_NOT_INSTALLED")):
                result = run(root/"out", Client)
            self.assertEqual(calls, [((baseline_text(), DEMO_LANGUAGE, SPEAKER, INSTRUCT, "1.7B"), {"api_name":API_NAME})])
            self.assertEqual(result["request_count"], 1)
            self.assertEqual(result["status"], "CANDIDATE_PENDING_LISTENING")
            self.assertEqual(result["mp3_warning"], "FFMPEG_NOT_INSTALLED")
            self.assertTrue((root/"out"/"source.wav").exists())
            self.assertTrue((root/"out"/"listening.wav").exists())

if __name__ == "__main__":
    unittest.main()
