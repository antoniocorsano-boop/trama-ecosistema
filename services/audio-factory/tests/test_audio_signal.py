"""Regressions: isolated full-scale sample != sustained overload."""
import struct
import tempfile
import unittest
import wave
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from audio_signal import inspect_pcm16_peaks, safe_headroom_gain


def create_wav(path, values):
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(24000)
        wav.writeframes(b"".join(struct.pack("<h", value) for value in values))


class SignalTests(unittest.TestCase):
    def test_headroom_never_boosts_and_prevents_pcm_overflow(self):
        self.assertEqual(safe_headroom_gain(0.5), 1)
        self.assertAlmostEqual(safe_headroom_gain(1.2), 0.85 / 1.2)
        self.assertAlmostEqual(safe_headroom_gain(1), 0.85)
        self.assertLessEqual(1.2 * safe_headroom_gain(1.2), 0.85 + 1e-12)
        for bad in (-1.0, float("nan"), float("inf")):
            with self.assertRaises(ValueError):
                safe_headroom_gain(bad)

    def test_isolated_peak_not_declared_confirmed_clipping(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "one.wav"
            create_wav(path, [0] * 300 + [32767] + [12000] * 300)
            result = inspect_pcm16_peaks(path)
            self.assertEqual(result["near_full_scale_count"], 1)
            self.assertEqual(result["longest_near_full_scale_run"], 1)
            self.assertEqual(result["classification"], "ISOLATED_NEAR_FULL_SCALE_SAMPLE")
            self.assertFalse(result["proves_audible_clipping"])

    def test_sustained_near_rail_warning(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "plateau.wav"
            create_wav(path, [0] * 300 + [32767, 32767, 32767] + [0] * 300)
            result = inspect_pcm16_peaks(path)
            self.assertEqual(result["longest_near_full_scale_run"], 3)
            self.assertEqual(result["classification"], "SUSTAINED_PEAK_WARNING")
            self.assertFalse(result["proves_audible_clipping"])

    def test_ordinary_safe_wav(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "safe.wav"
            create_wav(path, [0, 12000, -8000] * 300)
            self.assertEqual(inspect_pcm16_peaks(path)["classification"], "NO_NEAR_FULL_SCALE_SAMPLE")

    def test_inspection_does_not_modify_original_bytes(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "immutable.wav"
            create_wav(path, [0, 32767, 0, -5000] * 100)
            original = path.read_bytes()
            inspect_pcm16_peaks(path)
            self.assertEqual(path.read_bytes(), original)


if __name__ == "__main__":
    unittest.main()
