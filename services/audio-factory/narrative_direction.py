"""AF-04 narrative direction compiler. No inference, network or personal voice input."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

CONTRACT = "trama.narrative-direction/v0.1"
# A fixed built-in speaker is a candidate, NOT an approved narrator.
MODEL = "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"
SPEAKER = "Ryan"
DIRECTIVES = {
    "wonder": ("Calm, curious and warm. Measured pace, subtle wonder; no overacting.", 450),
    "unease": ("Gradually introduce concern. Clear contrast, restrained tension.", 550),
    "revelation": ("Reveal the information with meaningful pauses and quiet urgency.", 650),
    "team": ("Warm and purposeful. Clear phrasing when introducing each character.", 450),
    "invitation": ("Hopeful and engaging. Emphasize the final invitation, without shouting.", 500),
}
COMMON = ("Speak clear natural Italian. Keep the same narrator identity, "
          "consistent register and loudness throughout. Read the text exactly; "
          "do not add words, sound effects or music. ")

def digest(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def compile_direction(source: dict, directions: dict) -> dict:
    if set(source) != {"source_sha", "entrypoint_sha256", "scenes"}:
        raise ValueError("INVALID_SOURCE")
    if not all(isinstance(source[k], str) and re.fullmatch(r"[0-9a-f]{40}" if k == "source_sha" else r"[0-9a-f]{64}", source[k]) for k in ("source_sha", "entrypoint_sha256")):
        raise ValueError("INVALID_SOURCE_DIGEST")
    scenes = source["scenes"]
    if not isinstance(scenes, list) or not 1 <= len(scenes) <= 20:
        raise ValueError("INVALID_SCENE_COUNT")
    if not isinstance(directions, dict) or set(directions) != {str(i) for i in range(1, len(scenes) + 1)}:
        raise ValueError("DIRECTION_COVERAGE")
    requests = []
    for index, scene in enumerate(scenes, 1):
        if not isinstance(scene, dict) or set(scene) != {"scene", "title", "text"} or type(scene["scene"]) is not int or scene["scene"] != index:
            raise ValueError("INVALID_SCENE_ORDER")
        if any(not isinstance(scene[k], str) or not scene[k].strip() or len(scene[k]) > 2000 or any(ord(ch) < 32 for ch in scene[k]) for k in ("title", "text")):
            raise ValueError("INVALID_SCENE_TEXT")
        mode = directions[str(index)]
        if not isinstance(mode, str) or mode not in DIRECTIVES:
            raise ValueError("UNKNOWN_DIRECTION")
        instruct, pause = DIRECTIVES[mode]
        text = scene["title"] + ". " + scene["text"]
        requests.append({
            "scene": index, "text": text, "text_sha256": digest(text),
            "speaker": SPEAKER, "language": "Italian", "direction": mode,
            "instruct": COMMON + instruct,
            "post_scene_pause_ms": pause if index < len(scenes) else 0,
        })
    return {
        "contract": CONTRACT,
        "source_sha": source["source_sha"],
        "entrypoint_sha256": source["entrypoint_sha256"],
        "model_id": MODEL, "speaker": SPEAKER,
        "voice_type": "BUILT_IN_SYNTHETIC", "compute_mode": "FREE_ONLY",
        "personal_voice_input_allowed": False, "voice_cloning_allowed": False,
        "audio_generation_authorized": False, "published": False,
        "qualification": "CANDIDATE_NOT_ACOUSTICALLY_QUALIFIED",
        "text_sha256": digest("\n\n".join(r["text"] for r in requests)),
        "requests": requests,
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--directions", required=True, type=Path)
    args = parser.parse_args()
    source = json.loads(args.source.read_text(encoding="utf-8"))
    if source.get("contract") != "trama.af03-continuous-narration/v0.1" or source.get("compute_mode") != "FREE_ONLY" or source.get("voice_cloning") is not False or source.get("no_personal_data") is not True:
        raise ValueError("SOURCE_POLICY")
    source = {k: source[k] for k in ("source_sha", "entrypoint_sha256", "scenes")}
    print(json.dumps(compile_direction(source, json.loads(args.directions.read_text(encoding="utf-8"))), ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
