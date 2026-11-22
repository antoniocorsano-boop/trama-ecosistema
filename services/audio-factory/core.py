"""AF-01: deterministic, provider-independent audio planning and qualification.

Only the injected synthesizer can perform inference. This module has no network
dependencies and never grants publication or editorial approval.
"""
from __future__ import annotations

import hashlib
import json
import math
import re
import shutil
import struct
import subprocess
import wave
from pathlib import Path
from typing import Any, Callable

CONTRACT = "trama.audio-generation-plan/v0.1"
RECEIPT_CONTRACT = "trama.audio-execution-receipt/v0.1"
VOICES = frozenset({"im_nicola", "if_sara"})
REQUIRED = frozenset({
    "contract", "request_id", "language", "voice", "text", "purpose",
    "compute_mode", "no_personal_data", "voice_cloning", "max_seconds",
})


class InvalidPlan(ValueError):
    pass


class AudioRejected(RuntimeError):
    def __init__(self, reason: str):
        super().__init__(reason)
        self.reason = reason


def validate_plan(plan: Any) -> dict:
    if not isinstance(plan, dict) or set(plan) != REQUIRED:
        raise InvalidPlan("INVALID_KEYS")
    if plan["contract"] != CONTRACT:
        raise InvalidPlan("INVALID_CONTRACT")
    if not isinstance(plan["request_id"], str) or not re.fullmatch(
        r"[a-z0-9][a-z0-9_-]{2,63}", plan["request_id"]
    ):
        raise InvalidPlan("INVALID_REQUEST_ID")
    if plan["language"] != "it-IT":
        raise InvalidPlan("UNSUPPORTED_LANGUAGE")
    if plan["voice"] not in VOICES:
        raise InvalidPlan("UNSUPPORTED_VOICE")
    if plan["purpose"] not in ("narration", "accessible_reading"):
        raise InvalidPlan("UNSUPPORTED_PURPOSE")
    if plan["compute_mode"] != "FREE_ONLY":
        raise InvalidPlan("PAID_COMPUTE_FORBIDDEN")
    if plan["no_personal_data"] is not True or plan["voice_cloning"] is not False:
        raise InvalidPlan("PRIVACY_POLICY_VIOLATION")
    if not isinstance(plan["text"], str) or not 15 <= len(plan["text"].strip()) <= 400:
        raise InvalidPlan("TEXT_LENGTH_OUT_OF_RANGE")
    if any(ord(ch) < 32 and ch not in "\n\t" for ch in plan["text"]):
        raise InvalidPlan("CONTROL_CHARACTER")
    if type(plan["max_seconds"]) is not int or not 3 <= plan["max_seconds"] <= 60:
        raise InvalidPlan("INVALID_DURATION_LIMIT")
    return dict(plan)


def canonical_digest(plan: dict) -> str:
    return hashlib.sha256(json.dumps(
        plan, sort_keys=True, ensure_ascii=False, separators=(",", ":")
    ).encode("utf-8")).hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(65536), b""):
            h.update(block)
    return h.hexdigest()


def inspect_wav(path: Path) -> dict:
    with wave.open(str(path), "rb") as f:
        channels, sample_width = f.getnchannels(), f.getsampwidth()
        sample_rate, frame_count = f.getframerate(), f.getnframes()
        if channels != 1 or sample_width != 2 or sample_rate != 24000:
            raise AudioRejected("INVALID_WAV_FORMAT")
        if frame_count == 0:
            raise AudioRejected("EMPTY_AUDIO")
        peak = 0.0
        energy = 0.0
        samples = 0
        while True:
            block = f.readframes(8192)
            if not block:
                break
            for (value,) in struct.iter_unpack("<h", block):
                amp = abs(value) / 32768.0
                peak = max(peak, amp)
                energy += amp * amp
                samples += 1
    return {
        "duration_seconds": round(frame_count / 24000, 3),
        "sample_rate": 24000,
        "channels": 1,
        "peak": round(peak, 5),
        "rms": round(math.sqrt(energy / samples), 5),
    }


def qualify(plan: dict, stats: dict) -> None:
    # An upstream Kokoro report describes Italian outputs stuck at 0.3s.
    minimum = max(0.6, len(plan["text"].strip()) / 30.0)
    if stats["duration_seconds"] < minimum:
        raise AudioRejected("AUDIO_TRUNCATED_OR_TOO_SHORT")
    if stats["duration_seconds"] > plan["max_seconds"]:
        raise AudioRejected("AUDIO_EXCEEDS_TIME_LIMIT")
    if stats["rms"] < 0.002:
        raise AudioRejected("SILENT_AUDIO")
    if stats["peak"] >= 0.999:
        raise AudioRejected("CLIPPING_DETECTED")


def encode_mp3(wav_path: Path, mp3_path: Path) -> None:
    if shutil.which("ffmpeg") is None:
        raise AudioRejected("FFMPEG_NOT_INSTALLED")
    cmd = [
        "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(wav_path), "-ac", "1", "-ar", "24000",
        "-codec:a", "libmp3lame", "-b:a", "96k", str(mp3_path),
    ]
    try:
        subprocess.run(cmd, check=True, timeout=90, capture_output=True)
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        raise AudioRejected("MP3_CONVERSION_FAILED") from exc
    if not mp3_path.is_file() or mp3_path.stat().st_size < 100:
        raise AudioRejected("MP3_OUTPUT_INVALID")


def execute(
    plan: dict,
    output_dir: Path,
    synthesizer: Callable[[str, str, Path], None],
    *,
    mp3: bool = False,
) -> dict:
    checked = validate_plan(plan)
    output_dir = Path(output_dir)
    # A fresh directory avoids silent overwrites and preserves exact receipts.
    output_dir.mkdir(parents=True, exist_ok=False)
    wav_path = output_dir / "candidate.wav"
    mp3_path = output_dir / "candidate.mp3"
    receipt: dict[str, Any] = {
        "contract": RECEIPT_CONTRACT,
        "request_id": checked["request_id"],
        "plan_sha256": canonical_digest(checked),
        "engine": "KOKORO_LOCAL_CPU",
        "model_id": "hexgrad/Kokoro-82M",
        "voice": checked["voice"],
        "language": "it-IT",
        "compute_mode": "FREE_ONLY",
        "status": "REJECTED",
        "reason": None,
        "asset": None,
        "review_state": "HUMAN_LISTENING_PENDING",
        "published": False,
    }
    try:
        synthesizer(checked["text"], checked["voice"], wav_path)
        stats = inspect_wav(wav_path)
        qualify(checked, stats)
        if mp3:
            encode_mp3(wav_path, mp3_path)
        (output_dir / "transcript.txt").write_text(checked["text"] + "\n", encoding="utf-8")
        asset: dict[str, Any] = {
            "wav": {"filename": "candidate.wav", "sha256": sha256_file(wav_path)},
            "duration_seconds": stats["duration_seconds"],
            "peak": stats["peak"],
            "rms": stats["rms"],
            "sample_rate": stats["sample_rate"],
        }
        if mp3:
            asset["mp3"] = {"filename": "candidate.mp3", "sha256": sha256_file(mp3_path)}
        receipt["asset"] = asset
        receipt["status"] = "CANDIDATE"
        return receipt
    except AudioRejected as exc:
        receipt["reason"] = exc.reason
        return receipt
    except Exception:
        receipt["reason"] = "SYNTHESIS_FAILED"
        return receipt
    finally:
        if receipt["status"] != "CANDIDATE":
            for item in (wav_path, mp3_path, output_dir / "transcript.txt"):
                item.unlink(missing_ok=True)
        (output_dir / "execution-receipt.json").write_text(
            json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
