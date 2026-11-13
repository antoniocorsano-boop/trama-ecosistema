"""AF-07B: offline lexical review, not speech recognition or pronunciation certification."""
from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
import unicodedata
from pathlib import Path

FIXTURE = Path(__file__).parent / "tests/fixtures/missione118_v5_continuous.json"
SOURCE_SHA = "f0c29655632a7edc6d78c78d48d006aa8da020a2"
CANONICAL_SHA = "437db14c64dfb695a07f36841974de417d9a72740f65c565ddd86a205a006a9d"

def digest(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def words(text: str) -> list[str]:
    # Preserve lexical accents, numbers and apostrophes; ignore case and punctuation.
    text = unicodedata.normalize("NFC", text).casefold().replace("’", "'").replace("ʼ", "'")
    return re.findall(r"[^\W_]+(?:'[^\W_]+)*", text, flags=re.UNICODE)

def expected_scene(scene: int) -> dict:
    p = json.loads(FIXTURE.read_text(encoding="utf-8"))
    scenes = p["scenes"]
    full = [s["title"] + ". " + s["text"] for s in scenes]
    if p["source_sha"] != SOURCE_SHA or [s["scene"] for s in scenes] != [1,2,3,4,5] or digest("\n\n".join(full)) != CANONICAL_SHA:
        raise ValueError("CANONICAL_SOURCE_DRIFT")
    if type(scene) is not int or scene not in range(1,6):
        raise ValueError("INVALID_SCENE")
    item = scenes[scene-1]
    # Preserve the already reviewed opening. Scene 2's title is editorially visual-only.
    text = full[0] if scene == 1 else item["text"]
    return {"scene": scene, "source_sha": SOURCE_SHA, "canonical_title": item["title"],
            "scope": "TITLE_AND_BODY" if scene == 1 else "BODY_ONLY",
            "text": text, "text_sha256": digest(text)}

def review_transcript(scene: int, observed: str | None) -> dict:
    expected = expected_scene(scene)
    a = words(expected["text"])
    b = words(observed) if isinstance(observed,str) else []
    report = {"contract":"trama.lexical-review/v0.1", "expected": expected,
              "observed": observed, "expected_word_count":len(a),
              "observed_word_count":len(b), "differences":[],
              "observed_text_sha256":digest(observed) if isinstance(observed,str) else None,
              "recognition_executed":False, "pronunciation_verified":False,
              "timing_verified":False, "audio_approved":False, "published":False}
    if not b:
        report["status"] = "TRANSCRIPT_MISSING"
        return report
    for tag,i,j,k,l in difflib.SequenceMatcher(a=a,b=b,autojunk=False).get_opcodes():
        if tag != "equal":
            report["differences"].append({"kind":tag,"expected_word_range":[i,j],
                                          "observed_word_range":[k,l],
                                          "expected_words":a[i:j],"observed_words":b[k:l]})
    report["status"] = "LEXICAL_MISMATCH_REVIEW_REQUIRED" if report["differences"] else "LEXICAL_MATCH_REVIEW_REQUIRED"
    return report

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--scene",type=int,required=True)
    parser.add_argument("--transcript",type=Path,required=True)
    args = parser.parse_args()
    observed = args.transcript.read_text(encoding="utf-8")
    report = review_transcript(args.scene, observed)
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if report["status"] == "LEXICAL_MATCH_REVIEW_REQUIRED" else 5

if __name__ == "__main__":
    raise SystemExit(main())
