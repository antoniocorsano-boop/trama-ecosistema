#!/usr/bin/env python3
"""Bounded, anonymous Qwen3 voice-continuity listening trial for Missione 118."""
from __future__ import annotations
import argparse
import json
import os
import shutil
import sys
from pathlib import Path
from af03_public_demo import SPACE, API_NAME, get_audio_path, make_quiet_listening_copy
from audio_signal import inspect_pcm16_peaks
from core import AudioRejected, inspect_wav, qualify, sha256_file
from narrative_voice_profile import validate_scene_manifest, profile_contract
from qwen3_prosody import MODEL_ID, STYLES

MANIFEST = Path(__file__).parent / "tests/fixtures/missione118_continuity.json"
REFERENCE = {
    "run_id": 43063968782,
    "artifact_id": 13875750466,
    "scene_id": "missione118-prologo-01",
    "style_id": "natural_narration",
    "listening_wav_sha256": "19777b6ff550ddebb9e3aa39e75d5d1eb368e5579c46fa280fa8d3c85c15e6b9",
}

def load_manifest():
    manifest = validate_scene_manifest(json.loads(MANIFEST.read_text(encoding="utf-8")))
    if len(manifest["scenes"]) != 2:
        raise ValueError("EXPECTED_EXACTLY_TWO_NEW_SCENES")
    return manifest

def qualify_listening(original: Path, listening: Path, text: str) -> dict:
    stats = inspect_wav(original)
    peaks = inspect_pcm16_peaks(original)
    if peaks["classification"] == "SUSTAINED_PEAK_WARNING":
        raise AudioRejected("SUSTAINED_PEAK_WARNING")
    try:
        qualify({"text": text, "max_seconds": 40}, stats)
    except AudioRejected as exc:
        if exc.reason != "CLIPPING_DETECTED":
            raise
        if peaks["classification"] != "ISOLATED_NEAR_FULL_SCALE_SAMPLE":
            raise
    make_quiet_listening_copy(original, listening)
    preview = inspect_wav(listening)
    qualify({"text": text, "max_seconds": 40}, preview)
    isolated = peaks["near_full_scale_count"] > 0
    return {
        "status": "LISTENING_ONLY_UNQUALIFIED" if isolated else "CANDIDATE",
        "reason": peaks["classification"] if isolated else None,
        "source_sha256": sha256_file(original),
        "listening_sha256": sha256_file(listening),
        "duration_seconds": stats["duration_seconds"],
        "sample_rate": stats["sample_rate"],
        "listening_gain": 0.72,
        "peak_diagnostics": peaks,
        "published": False,
    }

def run_trial(output: Path):
    if os.environ.get("TRAMA_AF03_CONTINUITY_AUTHORIZED") != "yes":
        raise RuntimeError("CONTINUITY_TRIAL_NOT_AUTHORIZED")
    if os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN"):
        raise RuntimeError("ANONYMOUS_ACCESS_ONLY")
    plan = load_manifest()
    output.mkdir(parents=True, exist_ok=False)
    report = {
        "contract": "trama.af03-voice-continuity-trial/v0.1",
        "profile": profile_contract(),
        "model": MODEL_ID, "space": SPACE, "api_name": API_NAME,
        "baseline": REFERENCE, "compute_mode": "FREE_ONLY",
        "published": False, "continuity_verified": False,
        "review_state": "HUMAN_LISTENING_PENDING", "scenes": [],
    }
    (output/"scene-manifest.json").write_text(
        MANIFEST.read_text(encoding="utf-8"), encoding="utf-8")
    from gradio_client import Client
    client = Client(SPACE, verbose=False)
    prompt = STYLES["natural_narration"]
    for scene in plan["scenes"]:
        sid, content = scene["scene_id"], scene["text"]
        directory = output / sid
        directory.mkdir()
        (directory/"transcript.txt").write_text(content+"\n", encoding="utf-8")
        (directory/"voice-description.txt").write_text(prompt+"\n", encoding="utf-8")
        row = {"scene_id": sid, "status": "REJECTED", "reason": None, "asset": None}
        report["scenes"].append(row)
        try:
            result = client.predict(content, "Auto", prompt, api_name=API_NAME)
            if not isinstance(result, (tuple, list)) or len(result) < 2:
                row["reason"] = "UNEXPECTED_RESPONSE"
                break
            returned = get_audio_path(result[0])
            if returned is None or not returned.is_file():
                row["reason"] = "NO_AUDIO_RETURNED"
                row["message"] = str(result[1])[:300]
                break
            source, preview = directory/"source.wav", directory/"listening.wav"
            shutil.copyfile(returned, source)
            row["asset"] = qualify_listening(source, preview, content)
            row["status"] = row["asset"]["status"]
            row["reason"] = row["asset"]["reason"]
        except AudioRejected as exc:
            row["reason"] = exc.reason
            break
        except Exception as exc:
            row["reason"] = "DEMO_UNAVAILABLE_OR_QUOTA"
            row["error_type"] = type(exc).__name__
            row["error_detail"] = str(exc)[:300]
            break
        finally:
            (output/"trial-report.json").write_text(
                json.dumps(report, ensure_ascii=False, indent=2)+"\n",
                encoding="utf-8")
    return report

def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args(argv)
    if args.validate_only:
        p = load_manifest()
        print(json.dumps({"valid": True, "mode": "NO_INFERENCE",
                          "scenes": [x["scene_id"] for x in p["scenes"]]}))
        return 0
    if args.output is None:
        print("OUTPUT_REQUIRED", file=sys.stderr)
        return 2
    try:
        report = run_trial(args.output)
        print(json.dumps(report, ensure_ascii=False, indent=2))
    except Exception as exc:
        print("TRIAL_BLOCKED: "+type(exc).__name__+": "+str(exc)[:300], file=sys.stderr)
        return 4
    return 0 if len(report["scenes"]) == 2 and all(
        s["status"] == "CANDIDATE" for s in report["scenes"]) else 5

if __name__ == "__main__":
    raise SystemExit(main())
