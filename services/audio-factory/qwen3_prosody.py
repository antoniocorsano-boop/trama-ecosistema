#!/usr/bin/env python3
"""AF-03 Qwen3 VoiceDesign Italian pilot. Offline and no inference by default."""
from __future__ import annotations
import argparse
import json
import os
import re
import sys
from pathlib import Path
from core import AudioRejected, canonical_digest, inspect_wav, qualify, sha256_file

CONTRACT = "trama.audio-expressive-probe/v0.1"
MODEL_ID = "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign"
BASELINE_ID = "AF02_NICOLA_2026_11_11"
NICOLA_SHA256 = "6ca6e6e7644c983ce25a084e15f3b7061e5bbebd19c4bf6eda4e30143898e6d9"
FIXTURE = Path(__file__).parent / "tests/fixtures/missione118_provino.json"
REQUIRED = {"contract", "request_id", "language", "model_id", "baseline_id", "text",
            "style_id", "max_seconds", "compute_mode", "no_personal_data", "voice_cloning"}
STYLES = {
    "natural_narration": (
        "Adult male native Italian narrator, natural contemporary Italian diction. "
        "Use gentle, meaningful pitch variation, human phrase-level rhythm, and "
        "natural pauses at semantic boundaries. Avoid a flat or robotic cadence."
    ),
    "restrained_suspense": (
        "Adult male native Italian cinematic narrator. Start reassuring and calm, "
        "then develop restrained suspense with subtle variations of pitch, "
        "semantic emphasis and meaningful pauses. Avoid theatrical overacting."
    ),
}

class InvalidProbe(ValueError):
    pass

def baseline_text():
    return json.loads(FIXTURE.read_text(encoding="utf-8"))["text"]

def validate_probe(raw):
    if not isinstance(raw, dict) or set(raw) != REQUIRED:
        raise InvalidProbe("INVALID_KEYS")
    if raw["contract"] != CONTRACT or raw["model_id"] != MODEL_ID:
        raise InvalidProbe("INVALID_MODEL_OR_CONTRACT")
    if raw["baseline_id"] != BASELINE_ID or raw["language"] != "it-IT":
        raise InvalidProbe("INVALID_BASELINE_OR_LANGUAGE")
    if not isinstance(raw["request_id"], str) or not re.fullmatch(
        r"[a-z0-9][a-z0-9_-]{2,63}", raw["request_id"]
    ):
        raise InvalidProbe("INVALID_REQUEST_ID")
    if raw["style_id"] not in STYLES:
        raise InvalidProbe("UNKNOWN_STYLE")
    if raw["text"] != baseline_text():
        raise InvalidProbe("SCRIPT_MUST_MATCH_NICOLA")
    if type(raw["max_seconds"]) is not int or not 10 <= raw["max_seconds"] <= 40:
        raise InvalidProbe("INVALID_DURATION_LIMIT")
    if raw["compute_mode"] != "FREE_ONLY":
        raise InvalidProbe("PAID_COMPUTE_FORBIDDEN")
    if raw["no_personal_data"] is not True or raw["voice_cloning"] is not False:
        raise InvalidProbe("PRIVACY_OR_CLONING_FORBIDDEN")
    return dict(raw)

def execute_probe(plan, output_dir, synthesizer):
    """Use injected synthesis so all quality gates can run without any model."""
    checked = validate_probe(plan)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=False)
    wav = output_dir / "candidate.wav"
    receipt = {
        "contract": "trama.audio-expressive-receipt/v0.1",
        "request_id": checked["request_id"],
        "plan_sha256": canonical_digest(checked),
        "engine": "QWEN3_VOICE_DESIGN_LOCAL",
        "model_id": MODEL_ID,
        "baseline_id": BASELINE_ID,
        "baseline_wav_sha256": NICOLA_SHA256,
        "style_id": checked["style_id"],
        "language": "it-IT",
        "compute_mode": "FREE_ONLY",
        "status": "REJECTED", "reason": None, "asset": None,
        "review_state": "HUMAN_LISTENING_PENDING", "published": False,
    }
    try:
        synthesizer(checked["text"], STYLES[checked["style_id"]], wav)
        stats = inspect_wav(wav)
        qualify(checked, stats)
        (output_dir / "transcript.txt").write_text(
            checked["text"] + "\n", encoding="utf-8"
        )
        receipt["asset"] = {
            "wav": {"filename": "candidate.wav", "sha256": sha256_file(wav)},
            "duration_seconds": stats["duration_seconds"],
            "rms": stats["rms"], "peak": stats["peak"],
            "sample_rate": stats["sample_rate"],
        }
        receipt["status"] = "CANDIDATE"
    except AudioRejected as exc:
        receipt["reason"] = exc.reason
    except Exception:
        receipt["reason"] = "SYNTHESIS_FAILED"
    finally:
        if receipt["status"] != "CANDIDATE":
            wav.unlink(missing_ok=True)
            (output_dir / "transcript.txt").unlink(missing_ok=True)
        (output_dir / "execution-receipt.json").write_text(
            json.dumps(receipt, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    return receipt

def authorized_local_synthesizer(model_dir):
    """Only pre-downloaded local weights; never use a paid or network provider."""
    if os.environ.get("TRAMA_AF03_FREE_GPU_AUTHORIZED") != "yes":
        raise RuntimeError("FREE_GPU_AUTHORIZATION_REQUIRED")
    if not model_dir.is_absolute() or not model_dir.is_dir():
        raise RuntimeError("LOCAL_MODEL_DIRECTORY_REQUIRED")
    if not (model_dir / "config.json").is_file():
        raise RuntimeError("LOCAL_MODEL_CONFIG_MISSING")
    os.environ["HF_HUB_OFFLINE"] = "1"
    os.environ["TRANSFORMERS_OFFLINE"] = "1"
    import torch
    if not torch.cuda.is_available():
        raise RuntimeError("QUALIFIED_CUDA_GPU_REQUIRED")
    # Conservative internal guard, not a published hardware requirement.
    if torch.cuda.get_device_properties(0).total_memory < 12 * 1024 ** 3:
        raise RuntimeError("GPU_MEMORY_GUARD_12_GIB")
    import soundfile as sf
    from qwen_tts import Qwen3TTSModel
    precision = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
    model = Qwen3TTSModel.from_pretrained(
        str(model_dir), device_map="cuda:0", dtype=precision,
        attn_implementation="sdpa", local_files_only=True,
    )
    def synth(text, instruction, destination):
        audio, rate = model.generate_voice_design(
            text=text, language="Italian", instruct=instruction
        )
        if rate != 24000 or not audio:
            raise AudioRejected("UNSUPPORTED_QWEN_AUDIO_FORMAT")
        sf.write(str(destination), audio[0], samplerate=rate, subtype="PCM_16")
    return synth

def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--plan", type=Path, required=True)
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--model-dir", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args(argv)
    try:
        plan = validate_probe(json.loads(args.plan.read_text(encoding="utf-8")))
    except (ValueError, OSError, KeyError, TypeError) as exc:
        print("INVALID_PROBE: " + str(exc), file=sys.stderr)
        return 2
    if args.validate_only or not args.execute:
        print(json.dumps({"valid": True, "mode": "NO_INFERENCE",
                          "style": plan["style_id"],
                          "plan_sha256": canonical_digest(plan)}))
        return 0
    if args.model_dir is None or args.output is None:
        print("LOCAL_MODEL_AND_OUTPUT_REQUIRED", file=sys.stderr)
        return 3
    try:
        synth = authorized_local_synthesizer(args.model_dir)
        receipt = execute_probe(plan, args.output, synth)
    except (RuntimeError, OSError, FileExistsError) as exc:
        print("AF03_BLOCKED: " + str(exc), file=sys.stderr)
        return 4
    print(json.dumps(receipt, ensure_ascii=False, indent=2))
    return 0 if receipt["status"] == "CANDIDATE" else 5

if __name__ == "__main__":
    raise SystemExit(main())
