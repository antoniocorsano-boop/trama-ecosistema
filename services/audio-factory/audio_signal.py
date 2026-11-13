"""AF-03 offline PCM16 diagnostics; near-full-scale is not proof of audible clipping.

No inference, model imports, networking, or external dependencies.
"""
from __future__ import annotations

import math
import struct
import wave
from pathlib import Path


def safe_headroom_gain(raw_peak: float, ceiling: float = 0.85) -> float:
    """Attenuate before PCM conversion; never amplify source audio."""
    if not isinstance(raw_peak, (float, int)) or not math.isfinite(raw_peak):
        raise ValueError("INVALID_SOURCE_PEAK")
    if raw_peak < 0 or not 0 < ceiling < 1:
        raise ValueError("INVALID_HEADROOM_REQUEST")
    return min(1.0, ceiling / raw_peak) if raw_peak else 1.0


def inspect_pcm16_peaks(path: Path) -> dict:
    """Classify near-rail samples by count and contiguous runs.

    A lone PCM16 value of 32767 does NOT establish that the waveform was
    clipped. Labels describe observable samples, not inferred distortion.
    """
    count = 0
    near_rail = 0
    longest_run = 0
    run = 0
    with wave.open(str(path), "rb") as reader:
        if (reader.getnchannels(), reader.getsampwidth(), reader.getframerate()) != (1, 2, 24000):
            raise ValueError("INVALID_WAV_FORMAT")
        while True:
            block = reader.readframes(8192)
            if not block:
                break
            for (value,) in struct.iter_unpack("<h", block):
                count += 1
                if value >= 32760 or value <= -32760:
                    near_rail += 1
                    run += 1
                    longest_run = max(longest_run, run)
                else:
                    run = 0
    if not count:
        raise ValueError("EMPTY_WAV")
    fraction = near_rail / count
    if near_rail == 0:
        classification = "NO_NEAR_FULL_SCALE_SAMPLE"
    elif near_rail <= 2 and longest_run == 1:
        classification = "ISOLATED_NEAR_FULL_SCALE_SAMPLE"
    elif longest_run >= 3 or fraction >= 0.001:
        classification = "SUSTAINED_PEAK_WARNING"
    else:
        classification = "PEAKS_REQUIRE_REVIEW"
    return {
        "sample_count": count,
        "near_full_scale_count": near_rail,
        "near_full_scale_fraction": round(fraction, 9),
        "longest_near_full_scale_run": longest_run,
        "classification": classification,
        "proves_audible_clipping": False,
    }
