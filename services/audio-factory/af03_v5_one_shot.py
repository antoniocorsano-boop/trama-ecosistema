#!/usr/bin/env python3
"""One anonymous continuous synthesis, no retries, no release."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
import shutil
from pathlib import Path
from af03_public_demo import SPACE, API_NAME, get_audio_path, make_quiet_listening_copy
from audio_signal import inspect_pcm16_peaks
from core import AudioRejected, inspect_wav, qualify, sha256_file, encode_mp3
from qwen3_prosody import MODEL_ID, STYLES

PLAN = Path(__file__).parent / "tests/fixtures/missione118_v5_continuous.json"

def load_plan():
    p = json.loads(PLAN.read_text(encoding="utf-8"))
    assert p["source_sha"] == "f0c29655632a7edc6d78c78d48d006aa8da020a2"
    assert p["entrypoint_sha256"] == "22971583a2a7dc2d45947b4ce19a843a057b05864b9a2b896762728c9519175e"
    assert p["compute_mode"] == "FREE_ONLY" and p["no_personal_data"] is True and p["voice_cloning"] is False
    assert p["style"] == "natural_narration"
    assert [s["scene"] for s in p["scenes"]] == [1, 2, 3, 4, 5]
    text = "\n\n".join(s["title"] + ". " + s["text"] for s in p["scenes"])
    assert len(text) == 1065
    return p, text

def run(output: Path, client_factory=None):
    if os.environ.get("TRAMA_AF03_V5_ONE_SHOT_AUTHORIZED") != "yes":
        raise RuntimeError("EXPLICIT_AUTHORIZATION_REQUIRED")
    if os.environ.get("GITHUB_RUN_ATTEMPT", "1") != "1":
        raise RuntimeError("RETRY_FORBIDDEN")
    if any(os.environ.get(k) for k in ("HF_TOKEN", "HUGGING_FACE_HUB_TOKEN", "HF_API_TOKEN")):
        raise RuntimeError("ANONYMOUS_ONLY")
    p, text = load_plan()
    output.mkdir(parents=True, exist_ok=False)
    (output / "plan.json").write_bytes(PLAN.read_bytes())
    (output / "transcript.txt").write_text(text + "\n", encoding="utf-8")
    prompt = STYLES["natural_narration"]
    (output / "voice-description.txt").write_text(prompt + "\n", encoding="utf-8")
    report = {"contract": p["contract"], "source_sha": p["source_sha"], "model": MODEL_ID,
              "space": SPACE, "api_name": API_NAME, "compute_mode": "FREE_ONLY",
              "language": "Auto", "request_count": 0, "published": False,
              "review_state": "HUMAN_LISTENING_PENDING", "status": "REJECTED",
              "text_sha256": hashlib.sha256(text.encode("utf-8")).hexdigest()}
    try:
        if client_factory is None:
            from gradio_client import Client
            client_factory = lambda: Client(SPACE, verbose=False)
        client = client_factory()
        report["request_count"] = 1
        response = client.predict(text, "Auto", prompt, api_name=API_NAME)
        if not isinstance(response, (list, tuple)) or len(response) < 2:
            raise RuntimeError("UNEXPECTED_RESPONSE")
        source = get_audio_path(response[0])
        if source is None or not source.is_file():
            raise RuntimeError("NO_AUDIO_RETURNED: " + str(response[1])[:250])
        original = output / "source.wav"
        shutil.copyfile(source, original)
        report["source_sha256"] = sha256_file(original)
        stats = inspect_wav(original)
        report["stats"] = stats
        peaks = inspect_pcm16_peaks(original)
        report["peak_diagnostics"] = peaks
        signal_plan = {"text": text, "max_seconds": 170}
        try:
            qualify(signal_plan, stats)
        except AudioRejected as exc:
            report["signal_reason"] = exc.reason
            if exc.reason != "CLIPPING_DETECTED" or peaks["classification"] != "ISOLATED_NEAR_FULL_SCALE_SAMPLE":
                raise
        preview = output / "listening.wav"
        make_quiet_listening_copy(original, preview)
        qualify(signal_plan, inspect_wav(preview))
        report["listening_sha256"] = sha256_file(preview)
        encode_mp3(preview, output / "listening.mp3")
        report["listening_mp3_sha256"] = sha256_file(output / "listening.mp3")
        report["status"] = "LISTENING_ONLY_UNQUALIFIED" if report.get("signal_reason") else "CANDIDATE_PENDING_LISTENING"
    except Exception as exc:
        report["reason"] = getattr(exc, "reason", type(exc).__name__)
        report["detail"] = str(exc)[:350]
    finally:
        (output / "receipt.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if args.validate_only:
        p, text = load_plan()
        print(json.dumps({"mode": "NO_INFERENCE", "characters": len(text), "scene_count": len(p["scenes"])}))
    else:
        if args.output is None:
            parser.error("--output required")
        receipt = run(args.output)
        print(json.dumps(receipt, ensure_ascii=False, indent=2))
        raise SystemExit(0 if receipt["status"] == "CANDIDATE_PENDING_LISTENING" else 5)
