"""AF-06C: one controlled scene-2 revision at temperature 0.5, no publication."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
from core import inspect_wav, qualify, AudioRejected, sha256_file, encode_mp3
from audio_signal import inspect_pcm16_peaks
from af03_public_demo import make_quiet_listening_copy

EXPECTED = "b0f0c5f9178e9b6c6f5034220023e40c3904eb035a679b0362ca6831e4360f9b"
UPSTREAM = "facfd066bfbd632c815508e998bfd8b7665b8122"
SOURCE_SHA = "f0c29655632a7edc6d78c78d48d006aa8da020a2"
FIXTURE = Path(__file__).parent / "tests/fixtures/missione118_v5_continuous.json"

TEMPERATURE = "0.5"
TOP_K = "100"

def scene_plan():
    p = json.loads(FIXTURE.read_text(encoding="utf-8"))
    if p["source_sha"] != SOURCE_SHA or p["compute_mode"] != "FREE_ONLY" or p["voice_cloning"] is not False or p["no_personal_data"] is not True:
        raise ValueError("SOURCE_POLICY")
    scenes = p["scenes"]
    texts = [x["title"] + ". " + x["text"] for x in scenes]
    if [x["scene"] for x in scenes] != [1,2,3,4,5] or hashlib.sha256("\n\n".join(texts).encode()).hexdigest() != "437db14c64dfb695a07f36841974de417d9a72740f65c565ddd86a205a006a9d":
        raise ValueError("CANONICAL_TEXT_DRIFT")
    return [{"scene": i, "speaker_id": 0, "text": text, "text_sha256": hashlib.sha256(text.encode()).hexdigest()} for i,text in enumerate(texts[1:2],2)]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--engine", type=Path, required=True)
    parser.add_argument("--weights", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    assert os.environ.get("GITHUB_RUN_ATTEMPT") == "1"
    assert os.environ.get("GITHUB_EVENT_NAME") == "pull_request"
    event = json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text())
    assert event["repository"]["private"] is False
    assert event["number"] == 304 and event["action"] == "labeled"
    assert event["label"]["name"] == "af06-azzurra-scena2-autorizzata"
    assert event["pull_request"]["head"]["ref"] == "feat/audio-factory-af03-qwen3-prosody"
    assert not any(os.environ.get(k) for k in ("HF_TOKEN", "HUGGING_FACE_HUB_TOKEN", "HF_API_TOKEN"))
    assert sha256_file(args.weights) == EXPECTED
    scenes = scene_plan()
    report = {"contract":"trama.af06-azzurra-scene2-rework/v0.1","engine_commit":UPSTREAM,
              "model":"cartesia/azzurra-voice","weights_sha256":EXPECTED,
              "model_license":"CC-BY-NC-SA-4.0","engine_license":"AGPL-3.0",
              "compute_mode":"FREE_ONLY","speaker_ids":[0],"source_sha":SOURCE_SHA,
              "selected_probe_run":43200500865,"baseline_run":43203663330,
              "temperature":TEMPERATURE,"top_k":TOP_K,"seed_controlled":False,
              "preserved_scene1_sha256":"514b3ae7bf1ef37df34c277c31bca1f8e35e130f39e45426939bfb4cfe07d1a8",
              "baseline_scene2_sha256":"bc648afcbec3390018a3adc4130ec962c1aac55838c1fed8d17758e952d3d0d9",
              "speaker_gender_verified":False,
              "voice_identity_guaranteed":False,"reference_audio":False,"published":False,
              "review_state":"HUMAN_LISTENING_PENDING","results":[]}
    out=args.output.resolve()
    receipt=out/"receipt.json"
    def save():
        receipt.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (out/"scene-plan.json").write_text(json.dumps(scenes,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    save()
    for scene in scenes:
        sid=scene["speaker_id"]
        index=scene["scene"]
        text=scene["text"]
        row={"speaker_id":sid,"scene":index,"text_sha256":scene["text_sha256"],"status":"REJECTED"}
        report["results"].append(row)
        start=time.monotonic()
        source=out/f"scene-{index}-source.wav"
        listening=out/f"scene-{index}-listening.wav"
        try:
            cmd=[str(args.engine.resolve()),"--cpu","--model-id","cartesia/azzurra-voice",
                 "--weights-path",str(args.weights.resolve()),"--speaker-id",str(sid),
                 "--text",text,"--output",str(source),"--temperature",TEMPERATURE,"--top-k",TOP_K,
                 "--max-audio-len-ms","40000"]
            subprocess.run(cmd,check=True,timeout=225)
            if not source.is_file():
                raise RuntimeError("NO_AUDIO_RETURNED")
            row["source_sha256"]=sha256_file(source)
            row["stats"]=inspect_wav(source)
            row["peak_diagnostics"]=inspect_pcm16_peaks(source)
            signal_plan={"text":text,"max_seconds":40}
            try:
                qualify(signal_plan,row["stats"])
            except AudioRejected as exc:
                row["signal_reason"]=exc.reason
                if exc.reason!="CLIPPING_DETECTED" or row["peak_diagnostics"]["classification"]!="ISOLATED_NEAR_FULL_SCALE_SAMPLE":
                    raise
            make_quiet_listening_copy(source,listening)
            qualify(signal_plan,inspect_wav(listening))
            row["listening_sha256"]=sha256_file(listening)
            try:
                mp3=out/f"scene-{index}.mp3"
                encode_mp3(listening,mp3)
                row["mp3_sha256"]=sha256_file(mp3)
            except AudioRejected as exc:
                row["mp3_warning"]=exc.reason
            row["status"]="LISTENING_ONLY_UNQUALIFIED" if row.get("signal_reason") else "CANDIDATE_PENDING_LISTENING"
        except Exception as exc:
            row["reason"]=getattr(exc,"reason",type(exc).__name__)
            row["detail"]=str(exc)[:300]
        finally:
            row["wall_seconds"]=round(time.monotonic()-start,2)
            save()
        if row["status"]=="REJECTED":
            break
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if len(report["results"])==1 and all(r["status"]=="CANDIDATE_PENDING_LISTENING" for r in report["results"]) else 5

if __name__=="__main__":
    raise SystemExit(main())
