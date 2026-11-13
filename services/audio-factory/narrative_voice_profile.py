"""Locked authoring profile, no model inference or downloaded dependencies."""
from __future__ import annotations
import hashlib
import json
import re
from qwen3_prosody import MODEL_ID, STYLES

PROFILE_ID = "TRAMA_AF03_QWEN3_NATURAL_V1"
STYLE = "natural_narration"
MAX_SCENE_CHARACTERS = 400
MAX_SCENES_PER_MANIFEST = 4


def profile_contract():
    """One stable voice brief for successive scenes. Identity still needs listening review."""
    brief = STYLES[STYLE]
    return {
        "profile_id": PROFILE_ID,
        "model_id": MODEL_ID,
        "language": "it-IT",
        "style_id": STYLE,
        "prompt_sha256": hashlib.sha256(brief.encode("utf-8")).hexdigest(),
        "voice_identity_guaranteed": False,
        "review_state": "HUMAN_LISTENING_PENDING",
        "published": False,
    }


def validate_scene_manifest(value):
    if not isinstance(value, dict) or set(value) != {
        "profile_id", "language", "compute_mode", "no_personal_data",
        "voice_cloning", "scenes",
    }:
        raise ValueError("INVALID_MANIFEST")
    if value["profile_id"] != PROFILE_ID or value["language"] != "it-IT":
        raise ValueError("INVALID_VOICE_PROFILE")
    if (value["compute_mode"] != "FREE_ONLY"
            or value["voice_cloning"] is not False
            or value["no_personal_data"] is not True):
        raise ValueError("SAFETY_CONSTRAINT")
    scenes = value["scenes"]
    if not isinstance(scenes, list) or not 1 <= len(scenes) <= MAX_SCENES_PER_MANIFEST:
        raise ValueError("SCENE_COUNT_OUT_OF_RANGE")
    identifiers = set()
    for scene in scenes:
        if not isinstance(scene, dict) or set(scene) != {"scene_id", "text"}:
            raise ValueError("INVALID_SCENE")
        sid = scene["scene_id"]
        if not isinstance(sid, str) or not re.fullmatch(r"[a-z0-9][a-z0-9-]{2,48}", sid):
            raise ValueError("INVALID_SCENE_ID")
        if sid in identifiers:
            raise ValueError("DUPLICATE_SCENE_ID")
        identifiers.add(sid)
        text = scene["text"]
        if not isinstance(text, str) or not 15 <= len(text.strip()) <= MAX_SCENE_CHARACTERS:
            raise ValueError("INVALID_SCENE_TEXT")
        if any(ord(ch) < 32 and ch not in "\n\t" for ch in text):
            raise ValueError("INVALID_TEXT_CONTROL_CHARACTER")
    return {"voice_profile": profile_contract(),
            "scenes": [{"scene_id": s["scene_id"], "text": s["text"]}
                       for s in scenes],
            "audio_generation_authorized": False,
            "continuity_verified": False}


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    args = parser.parse_args()
    raw = json.loads(open(args.manifest, encoding="utf-8").read())
    print(json.dumps(validate_scene_manifest(raw), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
