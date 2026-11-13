"""AF-04: single anonymous built-in synthetic speaker probe, no personal audio."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
import shutil
from pathlib import Path
from af03_public_demo import SPACE, get_audio_path, make_quiet_listening_copy
from audio_signal import inspect_pcm16_peaks
from core import AudioRejected, inspect_wav, qualify, sha256_file, encode_mp3
from narrative_direction import MODEL, SPEAKER, COMMON
from qwen3_prosody import baseline_text

API_NAME = "/generate_custom_voice"
# The public demo omits Italian from its dropdown; Auto is supported.
DEMO_LANGUAGE = "Auto"
INSTRUCT = COMMON + ("Adult storyteller, warm and natural. Start with measured curiosity, "
                    "then introduce quiet concern and give weight to the last phrase. "
                    "Use semantic pauses, without overacting.")

def probe_plan():
    text = baseline_text()
    if not 100 <= len(text) <= 250:
        raise ValueError("UNEXPECTED_BASELINE_LENGTH")
    return {"text": text, "text_sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
            "model": MODEL, "speaker": SPEAKER, "language": DEMO_LANGUAGE,
            "instruct": INSTRUCT, "compute_mode": "FREE_ONLY",
            "personal_voice_input_allowed": False, "voice_cloning_allowed": False}

def run(output: Path, client_factory=None):
    if os.environ.get("TRAMA_AF04_PRESET_PROBE_AUTHORIZED") != "yes":
        raise RuntimeError("EXPLICIT_AUTHORIZATION_REQUIRED")
    if os.environ.get("GITHUB_RUN_ATTEMPT", "1") != "1":
        raise RuntimeError("RETRY_FORBIDDEN")
    if any(os.environ.get(k) for k in ("HF_TOKEN", "HUGGING_FACE_HUB_TOKEN", "HF_API_TOKEN")):
        raise RuntimeError("ANONYMOUS_ONLY")
    plan = probe_plan()
    output.mkdir(parents=True, exist_ok=False)
    (output / "plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    (output / "transcript.txt").write_text(plan["text"]+"\n", encoding="utf-8")
    receipt = {"contract": "trama.af04-preset-probe/v0.1", "model": MODEL, "speaker": SPEAKER,
               "space": SPACE, "api_name": API_NAME, "language": DEMO_LANGUAGE,
               "request_count": 0, "status": "REJECTED", "compute_mode": "FREE_ONLY",
               "text_sha256": plan["text_sha256"], "published": False,
               "review_state": "HUMAN_LISTENING_PENDING"}
    try:
        if client_factory is None:
            from gradio_client import Client
            client_factory = lambda: Client(SPACE, verbose=False)
        client = client_factory()
        receipt["request_count"] = 1
        response = client.predict(plan["text"], DEMO_LANGUAGE, SPEAKER, INSTRUCT, "1.7B", api_name=API_NAME)
        if not isinstance(response, (tuple, list)) or len(response) < 2:
            raise RuntimeError("UNEXPECTED_RESPONSE")
        source = get_audio_path(response[0])
        if source is None or not source.is_file():
            raise RuntimeError("NO_AUDIO_RETURNED: " + str(response[1])[:250])
        original = output / "source.wav"
        shutil.copyfile(source, original)
        receipt["source_sha256"] = sha256_file(original)
        stats = inspect_wav(original)
        receipt["stats"] = stats
        peaks = inspect_pcm16_peaks(original)
        receipt["peak_diagnostics"] = peaks
        signal_plan = {"text": plan["text"], "max_seconds": 40}
        try:
            qualify(signal_plan, stats)
        except AudioRejected as exc:
            receipt["signal_reason"] = exc.reason
            if exc.reason != "CLIPPING_DETECTED" or peaks["classification"] != "ISOLATED_NEAR_FULL_SCALE_SAMPLE":
                raise
        preview = output / "listening.wav"
        make_quiet_listening_copy(original, preview)
        qualify(signal_plan, inspect_wav(preview))
        receipt["listening_sha256"] = sha256_file(preview)
        # MP3 is optional: WAV generation success must never depend on encoder availability.
        try:
            encode_mp3(preview, output / "listening.mp3")
            receipt["listening_mp3_sha256"] = sha256_file(output / "listening.mp3")
        except AudioRejected as exc:
            receipt["mp3_warning"] = exc.reason
        receipt["status"] = "LISTENING_ONLY_UNQUALIFIED" if receipt.get("signal_reason") else "CANDIDATE_PENDING_LISTENING"
    except Exception as exc:
        receipt["reason"] = getattr(exc, "reason", type(exc).__name__)
        receipt["detail"] = str(exc)[:350]
    finally:
        (output / "receipt.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    return receipt

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if args.validate_only:
        print(json.dumps(probe_plan(), ensure_ascii=False, indent=2))
    else:
        if args.output is None:
            parser.error("--output required")
        result = run(args.output)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        raise SystemExit(0 if result["status"] == "CANDIDATE_PENDING_LISTENING" else 5)
