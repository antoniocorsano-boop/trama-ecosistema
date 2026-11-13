"""Bounded Azzurra CPU listening probe; no audio reference, paid provider or publication."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
from core import inspect_wav, qualify, AudioRejected, sha256_file, encode_mp3
from audio_signal import inspect_pcm16_peaks
from qwen3_prosody import baseline_text
from af03_public_demo import make_quiet_listening_copy

EXPECTED = "b0f0c5f9178e9b6c6f5034220023e40c3904eb035a679b0362ca6831e4360f9b"
UPSTREAM = "facfd066bfbd632c815508e998bfd8b7665b8122"

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
    assert event["label"]["name"] == "af06-azzurra-cpu-autorizzato"
    assert event["pull_request"]["head"]["ref"] == "feat/audio-factory-af03-qwen3-prosody"
    assert not any(os.environ.get(k) for k in ("HF_TOKEN", "HUGGING_FACE_HUB_TOKEN", "HF_API_TOKEN"))
    assert sha256_file(args.weights) == EXPECTED
    text = baseline_text()
    assert hashlib.sha256(text.encode()).hexdigest() == "514d2a6a32cf7f8b0350e8d67a2c755f2a0f037ae10b7afcccef9b39e3ecfad7"
    report = {"contract":"trama.af06-azzurra-cpu-probe/v0.1","engine_commit":UPSTREAM,
              "model":"cartesia/azzurra-voice","weights_sha256":EXPECTED,
              "model_license":"CC-BY-NC-SA-4.0","engine_license":"AGPL-3.0",
              "compute_mode":"FREE_ONLY","speaker_ids":[0,1],"speaker_gender_verified":False,
              "voice_identity_guaranteed":False,"reference_audio":False,"published":False,
              "review_state":"HUMAN_LISTENING_PENDING","results":[]}
    out=args.output.resolve()
    receipt=out/"receipt.json"
    def save():
        receipt.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    save()
    for sid in (0,1):
        row={"speaker_id":sid,"status":"REJECTED"}
        report["results"].append(row)
        start=time.monotonic()
        source=out/f"speaker-{sid}-source.wav"
        listening=out/f"speaker-{sid}-listening.wav"
        try:
            cmd=[str(args.engine.resolve()),"--cpu","--model-id","cartesia/azzurra-voice",
                 "--weights-path",str(args.weights.resolve()),"--speaker-id",str(sid),
                 "--text",text,"--output",str(source),"--temperature","0.7","--top-k","100",
                 "--max-audio-len-ms","25000"]
            subprocess.run(cmd,check=True,timeout=210)
            if not source.is_file():
                raise RuntimeError("NO_AUDIO_RETURNED")
            row["source_sha256"]=sha256_file(source)
            row["stats"]=inspect_wav(source)
            row["peak_diagnostics"]=inspect_pcm16_peaks(source)
            signal_plan={"text":text,"max_seconds":25}
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
                mp3=out/f"speaker-{sid}.mp3"
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
    return 0 if len(report["results"])==2 and all(r["status"]=="CANDIDATE_PENDING_LISTENING" for r in report["results"]) else 5

if __name__=="__main__":
    raise SystemExit(main())
