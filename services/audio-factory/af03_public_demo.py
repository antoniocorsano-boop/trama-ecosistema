#!/usr/bin/env python3
"""Single bounded public ZeroGPU trial; no token, payment, cloning, or fallback."""
from __future__ import annotations
import argparse
import json
import os
import shutil
import sys
from pathlib import Path
from qwen3_prosody import MODEL_ID, NICOLA_SHA256, STYLES, baseline_text, validate_probe
from core import inspect_wav, qualify, sha256_file, AudioRejected

SPACE = "Qwen/Qwen3-TTS"
API_NAME = "/generate_voice_design"
PLANS = ("missione118_qwen3_natural.json", "missione118_qwen3_suspense.json")


def load_plans():
    directory = Path(__file__).parent / "tests/fixtures"
    plans = [validate_probe(json.loads((directory / name).read_text(encoding="utf-8"))) for name in PLANS]
    if plans[0]["text"] != plans[1]["text"] or plans[0]["text"] != baseline_text():
        raise RuntimeError("TEXT_DRIFT")
    return plans


def get_audio_path(value):
    if isinstance(value, str):
        return Path(value)
    if isinstance(value, dict):
        filename = value.get("path") or value.get("name")
        return Path(filename) if isinstance(filename, str) else None
    return None


def make_quiet_listening_copy(source: Path, output: Path) -> float:
    """Attenuate 16-bit PCM for human listening without hiding source clipping.

    Keep original unchanged. The generated copy is explicitly NOT qualified.
    """
    import wave
    from array import array
    with wave.open(str(source), "rb") as reader:
        params = reader.getparams()
        raw = reader.readframes(reader.getnframes())
    if params.nchannels != 1 or params.sampwidth != 2 or params.framerate != 24000:
        raise AudioRejected("INVALID_LISTENING_SOURCE")
    samples = array("h")
    samples.frombytes(raw)
    if sys.byteorder == "big":
        samples.byteswap()
    saturation = sum(abs(value) >= 32760 for value in samples)
    preview = array("h", (int(value * 0.72) for value in samples))
    if sys.byteorder == "big":
        preview.byteswap()
    with wave.open(str(output), "wb") as writer:
        writer.setparams(params)
        writer.writeframes(preview.tobytes())
    return round(saturation / max(len(samples), 1), 6)


def run(output):
    if os.environ.get("TRAMA_AF03_PUBLIC_DEMO_AUTHORIZED") != "yes":
        raise RuntimeError("EXPLICIT_PUBLIC_DEMO_AUTHORIZATION_REQUIRED")
    if os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN"):
        raise RuntimeError("AUTH_TOKEN_FORBIDDEN_IN_ANONYMOUS_TRIAL")
    plans = load_plans()
    output.mkdir(parents=True, exist_ok=False)
    from gradio_client import Client  # import and network only after authorization
    client = Client(SPACE, verbose=False)
    report = {
        "model": MODEL_ID, "space": SPACE, "api_name": API_NAME,
        "baseline_sha256": NICOLA_SHA256,
        "compute_mode": "FREE_ONLY", "access": "ANONYMOUS",
        "published": False, "review_state": "HUMAN_LISTENING_PENDING",
        "results": [],
    }
    for plan in plans:  # at most two calls; stop on first failure
        style = plan["style_id"]
        folder = output / style
        folder.mkdir()
        (folder / "request.json").write_text(json.dumps(plan, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        (folder / "transcript.txt").write_text(plan["text"] + "\n", encoding="utf-8")
        (folder / "description.txt").write_text(STYLES[style] + "\n", encoding="utf-8")
        row = {"style_id": style, "status": "REJECTED", "reason": None, "asset": None}
        report["results"].append(row)
        try:
            response = client.predict(plan["text"], "Auto", STYLES[style], api_name=API_NAME)
            if not isinstance(response, (tuple, list)) or len(response) < 2:
                row["reason"] = "UNEXPECTED_RESPONSE"
                break
            filename = get_audio_path(response[0])
            if filename is None or not filename.is_file():
                row["reason"] = "DEMO_RETURNED_NO_AUDIO"
                row["message"] = str(response[1])[:300]
                break
            wav = folder / "candidate.wav"
            shutil.copyfile(filename, wav)
            stats = inspect_wav(wav)
            try:
                qualify(plan, stats)
            except AudioRejected as quality_error:
                if quality_error.reason != "CLIPPING_DETECTED":
                    raise
                # Quarantine the unchanged source. A quieter listening copy
                # NEVER upgrades the clipped source to a qualified candidate.
                original = folder / "source-clipped.wav"
                wav.rename(original)
                fraction = make_quiet_listening_copy(original, wav)
                preview_stats = inspect_wav(wav)
                qualify(plan, preview_stats)
                row["status"] = "LISTENING_ONLY_UNQUALIFIED"
                row["reason"] = "SOURCE_CLIPPING_DETECTED"
                row["asset"] = {
                    "filename": "candidate.wav", "sha256": sha256_file(wav),
                    "source_filename": "source-clipped.wav",
                    "source_sha256": sha256_file(original),
                    "source_peak": stats["peak"],
                    "saturated_fraction": fraction,
                    "listening_gain": 0.72,
                    "duration_seconds": preview_stats["duration_seconds"],
                    "sample_rate": preview_stats["sample_rate"],
                }
            else:
                row["status"] = "CANDIDATE"
                row["asset"] = {
                    "filename": "candidate.wav", "sha256": sha256_file(wav),
                    "duration_seconds": stats["duration_seconds"],
                    "sample_rate": stats["sample_rate"],
                }
        except AudioRejected as exc:
            row["reason"] = exc.reason
            (folder / "candidate.wav").unlink(missing_ok=True)
            break
        except Exception as exc:
            row["reason"] = "DEMO_UNAVAILABLE_OR_QUOTA"
            row["exception_type"] = type(exc).__name__
            row["exception_detail"] = str(exc)[:300]
            break
        finally:
            (output / "trial-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report


def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument("--validate-only", action="store_true")
    p.add_argument("--output", type=Path)
    args = p.parse_args(argv)
    if args.validate_only:
        plans = load_plans()
        print(json.dumps({"valid": True, "mode": "NO_INFERENCE", "styles": [p["style_id"] for p in plans]}))
        return 0
    if not args.output:
        print("OUTPUT_REQUIRED", file=sys.stderr)
        return 2
    try:
        report = run(args.output)
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 0 if len(report["results"]) == 2 and all(row["status"] == "CANDIDATE" for row in report["results"]) else 5
    except Exception as exc:
        print("TRIAL_BLOCKED: " + type(exc).__name__ + ": " + str(exc)[:300], file=sys.stderr)
        return 4


if __name__ == "__main__":
    raise SystemExit(main())
