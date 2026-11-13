"""AF-09: bounded alternative narration, never an editorial approval."""
from __future__ import annotations
import argparse, hashlib, json, os, re, wave
from pathlib import Path
from core import inspect_wav, qualify, sha256_file, canonical_digest, AudioRejected, encode_mp3
from af08_v7_production import scene_plan, assemble, lexical_difference, SCRIPT, SCRIPT_SHA, MANIFEST_SHA
LABEL="af09-v7-nicola-autorizzato"
BRANCH="feat/audio-factory-af03-qwen3-prosody"
VOICE="im_nicola"
MODEL="hexgrad/Kokoro-82M"
def authorize():
    if os.environ.get("GITHUB_RUN_ATTEMPT")!="1" or os.environ.get("GITHUB_EVENT_NAME")!="pull_request":
        raise RuntimeError("ONE_SHOT_REQUIRED")
    e=json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text())
    p=e["pull_request"]
    if e["repository"]["private"] or e["number"]!=304 or e["action"]!="labeled" or e["label"]["name"]!=LABEL or p["head"]["ref"]!=BRANCH or p["head"]["repo"]["full_name"]!=e["repository"]["full_name"]:
        raise RuntimeError("AUTHORIZATION_REQUIRED")
    if any(os.environ.get(k) for k in ("HF_TOKEN","HUGGING_FACE_HUB_TOKEN","HF_API_TOKEN")):
        raise RuntimeError("CREDENTIALS_FORBIDDEN")
    return p["head"]["sha"]
def plan():
    scenes=[]
    for s in scene_plan():
        texts=re.split(r"(?<=[.!?]) +",s["spoken_text"])
        if " ".join(texts)!=s["spoken_text"] or any(not t for t in texts):
            raise ValueError("SEGMENT_DRIFT")
        segments=[{"id":f"s{s['scene']}-u{i+1}","text":t,"sha256":hashlib.sha256(t.encode()).hexdigest(),
                   "pause_after_ms":0 if i==len(texts)-1 else (420 if t.endswith("?") else 260)}
                  for i,t in enumerate(texts)]
        scenes.append({"scene":s["scene"],"canonical_text":s["canonical_text"],"spoken_text":s["spoken_text"],
                       "voice":VOICE,"model":MODEL,"segments":segments})
    return scenes
def write_scene(paths, segments, dest):
    if len(paths)!=len(segments): raise ValueError("SEGMENT_COUNT")
    frames=0; timing=[]
    with wave.open(str(dest),"wb") as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000)
        for path,seg in zip(paths,segments,strict=True):
            with wave.open(str(path),"rb") as f:
                if (f.getnchannels(),f.getsampwidth(),f.getframerate())!=(1,2,24000):
                    raise ValueError("PCM_FORMAT")
                n=f.getnframes(); pcm=f.readframes(n)
                if not n or len(pcm)!=n*2: raise ValueError("PCM_EMPTY")
            w.writeframes(pcm)
            timing.append({"id":seg["id"],"start_frame":frames,"end_frame":frames+n,"wav_sha256":sha256_file(path)})
            frames+=n
            pause=seg["pause_after_ms"]*24
            w.writeframes(bytes(pause*2));frames+=pause
    return timing
def generate(out):
    head=authorize()
    import numpy as np
    import soundfile as sf
    import torch
    from kokoro import KPipeline
    from importlib.metadata import version
    from huggingface_hub import snapshot_download
    # Pin the downloaded snapshot for reproducibility in this execution; record hashes of actual files.
    snapshot=Path(snapshot_download(MODEL,token=False,allow_patterns=["config.json","kokoro-v1_0.pth","voices/im_nicola.pt"]))
    pins={str(p.relative_to(snapshot)):sha256_file(p) for p in snapshot.rglob("*") if p.is_file()}
    if not {"config.json","kokoro-v1_0.pth","voices/im_nicola.pt"}<=set(pins):
        raise ValueError("MODEL_FILES_MISSING")
    os.environ["HF_HUB_OFFLINE"]="1"
    torch.set_num_threads(4)
    torch.manual_seed(118)
    pipeline=KPipeline(lang_code="i",repo_id=MODEL,device="cpu")
    out.mkdir(parents=True,exist_ok=False)
    scenes=plan()
    report={"contract":"trama.af09-v7-nicola-candidate/v0.1","commit":head,"run_id":os.environ["GITHUB_RUN_ID"],
        "activity_id":"trama-missione-118-2026","source_manifest_sha256":MANIFEST_SHA,"script_sha256":SCRIPT_SHA,
        "baseline_run":"43467596519","model":MODEL,"model_snapshot":snapshot.name,"model_files":pins,
        "kokoro_version":version("kokoro"),"voice":VOICE,"language":"it-IT","compute_mode":"FREE_ONLY",
        "voice_cloning":False,"reference_audio":False,"published":False,"review_state":"HUMAN_LISTENING_PENDING",
        "results":[],"montage":None}
    def save(): (out/"receipt.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    (out/"scene-plan.json").write_text(json.dumps(scenes,ensure_ascii=False,indent=2)+"\n")
    (out/"script.md").write_bytes(SCRIPT.read_bytes());save()
    paths=[]
    for s in scenes:
        row={"scene":s["scene"],"plan_sha256":canonical_digest(s),"status":"REJECTED","segments":[]}
        report["results"].append(row);save();parts=[]
        try:
            for seg in s["segments"]:
                p=out/(seg["id"]+".wav")
                chunks=[]
                for _,_,audio in pipeline(seg["text"],voice=VOICE):
                    if audio is not None:
                        chunks.append(np.asarray(audio.detach().cpu().numpy() if hasattr(audio,"detach") else audio,dtype=np.float32).reshape(-1))
                if not chunks: raise ValueError("NO_AUDIO")
                sf.write(str(p),np.concatenate(chunks),24000,subtype="PCM_16")
                stats=inspect_wav(p);qualify({"text":seg["text"],"max_seconds":30},stats)
                row["segments"].append({"id":seg["id"],"wav_sha256":sha256_file(p),"stats":stats});parts.append(p);save()
            path=out/f"scene-{s['scene']}.wav"
            row["timing"]=write_scene(parts,s["segments"],path)
            stats=inspect_wav(path);qualify({"text":s["spoken_text"],"max_seconds":45},stats)
            row.update(wav_sha256=sha256_file(path),stats=stats,status="CANDIDATE_PENDING_LISTENING")
            paths.append(path);save()
        except Exception as exc:
            row["reason"]=getattr(exc,"reason",type(exc).__name__);row["detail"]=str(exc)[:200];save();return 5
    report["montage"]=assemble(paths,out/"prologo.wav");save()
    try:
        encode_mp3(out/"prologo.wav",out/"prologo.mp3")
        report["montage"]["mp3_sha256"]=sha256_file(out/"prologo.mp3")
    except AudioRejected as exc:report["montage"]["mp3_warning"]=exc.reason
    save();return 0
def compare(expected, observed):
    # Only explicit equivalent number spellings; preserve raw transcript/diffs.
    def normalize(s):
        s=s.casefold()
        s=re.sub(r"\b(?:117|centodiciassette)\b","centodiciassette",s)
        s=re.sub(r"\b(?:118|centodiciotto)\b","centodiciotto",s)
        s=re.sub(r"\b3\b","tre",s)
        return s
    return lexical_difference(normalize(expected),normalize(observed))
def asr(out):
    head=authorize()
    from faster_whisper import WhisperModel
    from huggingface_hub import snapshot_download
    m=Path(snapshot_download("Systran/faster-whisper-small",revision="536b0662742c02347bc0e980a01041f333bce120",token=False,allow_patterns=["config.json","model.bin","tokenizer.json","vocabulary.*"]))
    h=sha256_file(m/"model.bin")
    if h!="3e305921506d8872816023e4c273e75d2419fb89b24da97b4fe7bce14170d671":raise ValueError("ASR_MODEL_DIGEST")
    model=WhisperModel(str(m),device="cpu",compute_type="int8",cpu_threads=4,num_workers=1,local_files_only=True)
    r=json.loads((out/"receipt.json").read_text())
    if r["commit"]!=head or r["script_sha256"]!=SCRIPT_SHA or len(r["results"])!=5:raise ValueError("RECEIPT_BINDING")
    review={"commit":head,"script_sha256":SCRIPT_SHA,"model_sha256":h,"audio_approved":False,"pronunciation_verified":False,"scenes":[]}
    for s,row in zip(plan(),r["results"],strict=True):
        p=out/f"scene-{s['scene']}.wav"
        if row["scene"]!=s["scene"] or row["plan_sha256"]!=canonical_digest(s) or row["status"]!="CANDIDATE_PENDING_LISTENING" or sha256_file(p)!=row["wav_sha256"]:raise ValueError("AUDIO_BINDING")
        segments,_=model.transcribe(str(p),language="it",task="transcribe",beam_size=5,temperature=0,word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt=None)
        observed="".join(x.text for x in segments).strip()
        review["scenes"].append({"scene":s["scene"],"expected":s["spoken_text"],"observed":observed,"wav_sha256":row["wav_sha256"],"raw_differences":lexical_difference(s["spoken_text"],observed),"differences":compare(s["spoken_text"],observed)})
        (out/"asr-review.json").write_text(json.dumps(review,ensure_ascii=False,indent=2)+"\n")
    return 0 if all(s["observed"] and not s["differences"] for s in review["scenes"]) else 5
if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--output",type=Path,required=True);p.add_argument("--asr",action="store_true");a=p.parse_args()
    raise SystemExit(asr(a.output) if a.asr else generate(a.output))
