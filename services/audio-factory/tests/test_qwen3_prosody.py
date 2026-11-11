"""Offline-only tests; Qwen and CUDA must never be imported here."""
import json
import math
import struct
import sys
import tempfile
import unittest
import wave
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from qwen3_prosody import (
    MODEL_ID, STYLES, InvalidProbe, baseline_text,
    execute_probe, main, validate_probe,
)

FIX = Path(__file__).parent / "fixtures"

def synth(duration=12.0):
    def fake(text, instruction, target):
        assert text == baseline_text()
        assert instruction in STYLES.values()
        with wave.open(str(target), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(24000)
            data = b"".join(struct.pack(
                "<h", int(5000 * math.sin(2 * math.pi * 220 * x / 24000))
            ) for x in range(int(duration * 24000)))
            w.writeframes(data)
    return fake

class Qwen3ProsodyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.natural_path = FIX / "missione118_qwen3_natural.json"
        cls.suspense_path = FIX / "missione118_qwen3_suspense.json"
        cls.natural = json.loads(cls.natural_path.read_text())
        cls.suspense = json.loads(cls.suspense_path.read_text())

    def test_fixed_identical_script(self):
        self.assertEqual(self.natural["text"], self.suspense["text"])
        self.assertEqual(self.natural["text"], baseline_text())
        self.assertNotEqual(self.natural["style_id"], self.suspense["style_id"])

    def test_valid_plans(self):
        for plan in (self.natural, self.suspense):
            self.assertEqual(validate_probe(plan)["model_id"], MODEL_ID)

    def test_reject_uncontrolled_inputs(self):
        for changes in (
            {"text": self.natural["text"] + " Finale."},
            {"style_id": "imitate_real_person"},
            {"compute_mode": "PAID"},
            {"voice_cloning": True},
            {"no_personal_data": False},
            {"model_id": "other/model"},
            {"extra_url": "https://example.com"},
        ):
            with self.assertRaises(InvalidProbe):
                validate_probe(dict(self.natural, **changes))

    def test_mock_audio_is_not_published(self):
        with tempfile.TemporaryDirectory() as temp:
            out = Path(temp) / "candidate"
            receipt = execute_probe(self.natural, out, synth())
            self.assertEqual(receipt["status"], "CANDIDATE")
            self.assertEqual(receipt["asset"]["duration_seconds"], 12.0)
            self.assertFalse(receipt["published"])
            self.assertEqual(receipt["review_state"], "HUMAN_LISTENING_PENDING")
            self.assertTrue((out / "candidate.wav").exists())

    def test_short_output_rejected_without_audio(self):
        with tempfile.TemporaryDirectory() as temp:
            out = Path(temp) / "short"
            rec = execute_probe(self.natural, out, synth(.3))
            self.assertEqual(rec["reason"], "AUDIO_TRUNCATED_OR_TOO_SHORT")
            self.assertFalse((out / "candidate.wav").exists())
            self.assertTrue((out / "execution-receipt.json").exists())

    def test_validate_only_never_loads_model(self):
        self.assertEqual(main(["--plan", str(self.natural_path),
                               "--validate-only"]), 0)
        self.assertEqual(main(["--plan", str(self.suspense_path)]), 0)

    def test_unapproved_inference_blocked(self):
        with patch.dict("os.environ", {"TRAMA_AF03_FREE_GPU_AUTHORIZED": "no"}):
            with tempfile.TemporaryDirectory() as temp:
                out = Path(temp) / "out"
                code = main(["--plan", str(self.natural_path),
                             "--execute", "--model-dir", temp,
                             "--output", str(out)])
                self.assertEqual(code, 4)
                self.assertFalse(out.exists())

    def test_local_offline_only(self):
        code = (Path(__file__).parents[1] / "qwen3_prosody.py").read_text()
        self.assertIn('HF_HUB_OFFLINE', code)
        self.assertIn('local_files_only=True', code)
        self.assertNotIn('generate_voice_clone(', code)

if __name__ == "__main__":
    unittest.main()
