"""Unit tests require only the Python standard library. Never download a model."""
import json
import math
import struct
import sys
import tempfile
import unittest
import wave
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from core import AudioRejected, InvalidPlan, execute, inspect_wav, validate_plan

FIXTURE = Path(__file__).parent / "fixtures" / "missione118_provino.json"


def make_synth(seconds: float, amplitude: float = 0.20):
    def synth(_text, _voice, destination):
        rate = 24000
        with wave.open(str(destination), "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(rate)
            frame_count = int(seconds * rate)
            blocks = []
            for n in range(frame_count):
                value = int(amplitude * 32767 * math.sin(2 * math.pi * 220 * n / rate))
                blocks.append(struct.pack("<h", value))
            wav.writeframes(b"".join(blocks))
    return synth


class AudioFactoryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.plan = json.loads(FIXTURE.read_text(encoding="utf-8"))

    def test_valid_plan(self):
        self.assertEqual(validate_plan(self.plan)["voice"], "im_nicola")

    def test_free_only(self):
        plan = dict(self.plan, compute_mode="PAID")
        with self.assertRaisesRegex(InvalidPlan, "PAID_COMPUTE_FORBIDDEN"):
            validate_plan(plan)

    def test_reject_voice_cloning(self):
        with self.assertRaisesRegex(InvalidPlan, "PRIVACY_POLICY_VIOLATION"):
            validate_plan(dict(self.plan, voice_cloning=True))

    def test_reject_untrusted_voice(self):
        with self.assertRaisesRegex(InvalidPlan, "UNSUPPORTED_VOICE"):
            validate_plan(dict(self.plan, voice="anonymous-voice"))

    def test_reject_unbounded_text(self):
        with self.assertRaisesRegex(InvalidPlan, "TEXT_LENGTH_OUT_OF_RANGE"):
            validate_plan(dict(self.plan, text="a" * 401))

    def test_reject_unknown_keys(self):
        with self.assertRaisesRegex(InvalidPlan, "INVALID_KEYS"):
            validate_plan(dict(self.plan, provider_url="https://example.org"))

    def test_audio_candidate_never_approved(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "candidate"
            rec = execute(self.plan, path, make_synth(15))
            self.assertEqual(rec["status"], "CANDIDATE")
            self.assertFalse(rec["published"])
            self.assertEqual(rec["review_state"], "HUMAN_LISTENING_PENDING")
            self.assertTrue((path / "candidate.wav").is_file())
            self.assertTrue((path / "transcript.txt").is_file())
            self.assertTrue((path / "execution-receipt.json").is_file())
            self.assertEqual(rec["asset"]["duration_seconds"], 15)

    def test_detect_italian_truncation(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "candidate"
            rec = execute(self.plan, path, make_synth(0.3))
            self.assertEqual(rec["reason"], "AUDIO_TRUNCATED_OR_TOO_SHORT")
            self.assertFalse((path / "candidate.wav").exists())
            self.assertIsNone(rec["asset"])

    def test_detect_silence(self):
        with tempfile.TemporaryDirectory() as tmp:
            rec = execute(self.plan, Path(tmp) / "candidate", make_synth(15, 0))
            self.assertEqual(rec["reason"], "SILENT_AUDIO")

    def test_detect_clipping(self):
        with tempfile.TemporaryDirectory() as tmp:
            rec = execute(self.plan, Path(tmp) / "candidate", make_synth(15, 1.0))
            self.assertEqual(rec["reason"], "CLIPPING_DETECTED")

    def test_no_overwrite(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "existing"
            path.mkdir()
            with self.assertRaises(FileExistsError):
                execute(self.plan, path, make_synth(15))


if __name__ == "__main__":
    unittest.main()
