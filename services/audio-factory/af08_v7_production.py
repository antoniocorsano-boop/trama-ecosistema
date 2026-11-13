"""AF-08: one bounded V7 production candidate, no human or publication approval."""
from __future__ import annotations
import argparse, difflib, hashlib, json, os, re, subprocess, wave
from pathlib import Path
from core import inspect_wav, qualify, sha256_file, encode_mp3, AudioRejected, canonical_digest
from af07_lexical_review import words

SCRIPT = Path(__file__).parent / "tests/fixtures/missione118_v7_script.md"
SCRIPT_SHA = "5d66b16b503d4d1c85b153dd32fc4ad3f8abd209d9515c7f5d61f9b9d357aeed"
MANIFEST_SHA = "407299aa62ac3a190ff6755ac35bf4874d786cab0255e1f8dee426415315f395"
WEIGHTS_SHA = "b0f0c5f9178e9b6c6f5034220023e40c3904eb035a679b0362ca6831e4360f9b"
UPSTREAM = "facfd066bfbd632c815508e998bfd8b7665b8122"
LABEL = "af08-v7-produzione-autorizzata"
BRANCH = "feat/audio-factory-af03-qwen3-prosody"
PAUSE_FRAMES = 12000
def digest(s): return hashlib.sha256(s.encode("utf-8")).hexdigest()
def scene_plan(path=SCRIPT):
    if sha256_file(path) != SCRIPT_SHA:
        raise ValueError("SCRIPT_DIGEST_MISMATCH")
    source = path.read_text(encoding="utf-8")
    matches = re.findall(r"^## Scena ([1-5]) · ([^\n]+)\n([^\n]+)\n\nControllo:",source,re.M)
    if [x[0] for x in matches] != ["1","2","3","4","5"]:
        raise ValueError("SCENE_COVERAGE")
    scenes=[]
    for n,title,body in matches:
        if not 15 <= len(body) <= 400:
            raise ValueError("TEXT_LENGTH")
        spoken=body.replace("AX-118","a iks centodiciotto")
        scenes.append({"scene":int(n),"title":title,"scope":"BODY_ONLY","canonical_text":body,
                       "spoken_text":spoken,"canonical_sha256":digest(body),"spoken_sha256":digest(spoken),
                       "speaker_id":0,"language":"it-IT","temperature":"0.5","top_k":"100","max_seconds":40})
    return scenes

def assert_authorized():
    if os.environ.get("GITHUB_RUN_ATTEMPT")!="1" or os.environ.get("GITHUB_EVENT_NAME")!="pull_request":
        raise RuntimeError("ONE_SHOT_REQUIRED")
    e=json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text())
    pr=e["pull_request"]
    if (e["repository"]["private"] or e["number"]!=304 or e["action"]!="labeled" or
        e["label"]["name"]!=LABEL or pr["head"]["ref"]!=BRANCH or
        pr["head"]["repo"]["full_name"]!=e["repository"]["full_name"]):
        raise RuntimeError("AUTHORIZATION_REQUIRED")
    if any(os.environ.get(k) for k in ("HF_TOKEN","HUGGING_FACE_HUB_TOKEN","HF_API_TOKEN")):
        raise RuntimeError("CREDENTIALS_FORBIDDEN")
    return pr["head"]["sha"]

def assemble(paths, output):
    if len(paths)!=5:
        raise ValueError("FIVE_SCENES_REQUIRED")
    frames=0; timing=[]
    with wave.open(str(output),"wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000)
        for i,p in enumerate(paths,1):
            with wave.open(str(p),"rb") as f:
                if (f.getnchannels(),f.getsampwidth(),f.getframerate())!=(1,2,24000):
                    raise ValueError("FORMAT")
                n=f.getnframes()
                if n==0: raise ValueError("EMPTY")
                timing.append({"scene":i,"start_frame":frames,"end_frame":frames+n,"sha256":sha256_file(p)})
                w.writeframes(f.readframes(n))
            frames+=n
            if i<5:
                w.writeframes(bytes(PAUSE_FRAMES*2)); frames+=PAUSE_FRAMES
    return {"sha256":sha256_file(output),"duration_seconds":frames/24000,"sample_rate":24000,
            "inter_scene_pause_ms":500,"scenes":timing}

def generate(args):
    head=assert_authorized()
    if sha256_file(args.weights)!=WEIGHTS_SHA: raise ValueError("WEIGHTS_DIGEST")
    scenes=scene_plan(); args.output.mkdir(parents=True,exist_ok=False)
    report={"contract":"trama.af08-v7-production-candidate/v0.1","activity_id":"trama-missione-118-2026",
        "source_version":"0.3.0-draft","source_manifest_sha256":MANIFEST_SHA,"script_sha256":SCRIPT_SHA,
        "run_id":os.environ.get("GITHUB_RUN_ID"),"commit":head,"engine_commit":UPSTREAM,
        "model":"cartesia/azzurra-voice","weights_sha256":WEIGHTS_SHA,"model_license":"CC-BY-NC-SA-4.0",
        "engine_license":"AGPL-3.0","compute_mode":"FREE_ONLY","voice_cloning":False,"reference_audio":False,
        "speaker_id":0,"seed_controlled":False,"review_state":"HUMAN_LISTENING_PENDING",
        "published":False,"results":[],"montage":None}
    def save(): (args.output/"receipt.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    (args.output/"scene-plan.json").write_text(json.dumps(scenes,ensure_ascii=False,indent=2)+"\n")
    (args.output/"script.md").write_bytes(SCRIPT.read_bytes())
    save(); candidates=[]
    for scene in scenes:
        index=scene["scene"]; path=args.output/f"scene-{index}.wav"
        row={"scene":index,"plan_sha256":canonical_digest(scene),"status":"REJECTED"}
        report["results"].append(row); save()
        try:
            subprocess.run([str(args.engine.resolve()),"--cpu","--model-id","cartesia/azzurra-voice",
                "--weights-path",str(args.weights.resolve()),"--speaker-id","0","--text",scene["spoken_text"],
                "--output",str(path.resolve()),"--temperature","0.5","--top-k","100",
                "--max-audio-len-ms","40000"],check=True,timeout=225)
            row["wav_sha256"]=sha256_file(path)
            row["stats"]=inspect_wav(path)
            qualify({"text":scene["spoken_text"],"max_seconds":40},row["stats"])
            row["status"]="CANDIDATE_PENDING_LISTENING"; candidates.append(path)
            try:
                mp3=path.with_suffix(".mp3"); encode_mp3(path,mp3); row["mp3_sha256"]=sha256_file(mp3)
            except AudioRejected as exc: row["mp3_warning"]=exc.reason
        except Exception as exc:
            row["reason"]=getattr(exc,"reason",type(exc).__name__)
            row["detail"]=str(exc)[:240]
        save()
        # No retry and no further synthesis after failed signal.
        if row["status"]!="CANDIDATE_PENDING_LISTENING": return 5
    montage=args.output/"prologo.wav"
    report["montage"]=assemble(candidates,montage)
    try:
        mp3=montage.with_suffix(".mp3"); encode_mp3(montage,mp3)
        report["montage"]["mp3_sha256"]=sha256_file(mp3)
    except AudioRejected as exc: report["montage"]["mp3_warning"]=exc.reason
    save()
    return 0

def lexical_difference(expected, observed):
    a,b=words(expected),words(observed)
    return [{"kind":tag,"expected":a[i:j],"observed":b[k:l]}
            for tag,i,j,k,l in difflib.SequenceMatcher(a=a,b=b,autojunk=False).get_opcodes() if tag!="equal"]

def transcribe(args):
    head=assert_authorized()
    from faster_whisper import WhisperModel
    from huggingface_hub import snapshot_download
    from importlib.metadata import version
    model_dir=Path(snapshot_download("Systran/faster-whisper-small",revision="536b0662742c02347bc0e980a01041f333bce120",
        token=False,allow_patterns=["config.json","model.bin","tokenizer.json","vocabulary.*"]))
    model_sha=sha256_file(model_dir/"model.bin")
    if model_sha!="3e305921506d8872816023e4c273e75d2419fb89b24da97b4fe7bce14170d671":
        raise ValueError("ASR_MODEL_DIGEST")
    model=WhisperModel(str(model_dir),device="cpu",compute_type="int8",cpu_threads=4,num_workers=1,local_files_only=True)
    production=json.loads((args.output/"receipt.json").read_text())
    if production["commit"]!=head or production["script_sha256"]!=SCRIPT_SHA or len(production["results"])!=5:
        raise ValueError("RECEIPT_BINDING")
    report={"script_sha256":SCRIPT_SHA,"commit":head,"model_sha256":model_sha,
        "faster_whisper":version("faster-whisper"),"language":"it","initial_prompt":None,
        "pronunciation_verified":False,"audio_approved":False,"scenes":[]}
    for s,row in zip(scene_plan(),production["results"],strict=True):
        p=args.output/f"scene-{s['scene']}.wav"
        if row["scene"]!=s["scene"] or row["plan_sha256"]!=canonical_digest(s) or row["status"]!="CANDIDATE_PENDING_LISTENING" or sha256_file(p)!=row["wav_sha256"]:
            raise ValueError("AUDIO_BINDING")
        seg,_=model.transcribe(str(p),language="it",task="transcribe",beam_size=5,
            temperature=0,word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt=None)
        observed="".join(x.text for x in seg).strip()
        report["scenes"].append({"scene":s["scene"],"wav_sha256":row["wav_sha256"],"expected":s["spoken_text"],
            "observed":observed,"differences":lexical_difference(s["spoken_text"],observed)})
        (args.output/"asr-review.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    # Differences are flagged, never silently normalized; human listening always required.
    return 0 if all(x["observed"] and not x["differences"] for x in report["scenes"]) else 5

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--output",required=True,type=Path)
    p.add_argument("--engine",type=Path)
    p.add_argument("--weights",type=Path)
    p.add_argument("--asr",action="store_true")
    args=p.parse_args()
    raise SystemExit(transcribe(args) if args.asr else generate(args))
