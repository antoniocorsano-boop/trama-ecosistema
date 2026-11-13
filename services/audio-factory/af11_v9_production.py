"""AF-11: private-review V9 audio candidate, reusing two human-approved WAVs."""
from __future__ import annotations
import argparse, json, os, re, shutil
from pathlib import Path
from core import inspect_wav, qualify, sha256_file, canonical_digest, encode_mp3, AudioRejected
from af09_v7_nicola import write_scene, compare
from af08_v7_production import assemble
from af10_v9_pilot import REGIA, MODEL, VOICE, SNAPSHOT, PINS, ASR_HASH, BRANCH, BASE, REPO, save

REGIA_SHA = "a0f4700e87a14ab246e369ead7690b3fc194f8b84220c3484f745065e8c0069b"
APPROVED = {
    "S3U3": ("A", "6fcf7c3743847150e33484b0ef4ce94c10faca717febfb48e5652284ceab3d33"),
    "S5U3": ("B", "a96d5ae4d84fc4b1ff0466e319e9f11b04c2d2a27ece96b3c3b826de33f8e530"),
}
PAUSES = ((350,0),(250,450,0),(350,300,0),(300,300,0),(450,400,0))
APPROVAL = "https://github.com/antoniocorsano-boop/trama-ecosistema/pull/312#issuecomment-6861928905"

def plan():
    if sha256_file(REGIA)!=REGIA_SHA:
        raise ValueError("REGIA_DRIFT")
    rows = re.findall(r"^- (S[1-5]U[1-3]): (.+)$", REGIA.read_text(encoding="utf-8"), re.M)
    expected = [f"S{i}U{j}" for i, pauses in enumerate(PAUSES,1) for j in range(1,len(pauses)+1)]
    if [u for u,_ in rows]!=expected or len(rows)!=14:
        raise ValueError("UNIT_COVERAGE")
    scenes=[]
    for i,pauses in enumerate(PAUSES,1):
        units=[{"id":uid,"text":text,"pause_after_ms":pause,"reuse":uid in APPROVED}
               for (uid,text),pause in zip([(u,t) for u,t in rows if u.startswith(f"S{i}U")],pauses,strict=True)]
        scenes.append({"scene":i,"units":units,"spoken_text":" ".join(u["text"] for u in units)})
    return scenes

def authorization(event, attempt, event_name, credentials=False):
    if attempt!="1" or event_name!="pull_request" or credentials:
        raise ValueError("ONE_SHOT_FREE_ONLY")
    p=event["pull_request"]; head=p["head"]["sha"]
    if (not re.fullmatch(r"[0-9a-f]{40}",head) or event["number"]!=312 or
        event["action"]!="labeled" or event["repository"]["private"] or
        event["repository"]["full_name"]!=REPO or p["head"]["repo"]["full_name"]!=REPO or
        p["head"]["ref"]!=BRANCH or p["base"]["ref"]!=BASE or
        event["label"]["name"]!=f"af11-{head}"):
        raise ValueError("AUTHORIZATION_REQUIRED")
    return head

def authorize():
    return authorization(json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text()),
        os.environ.get("GITHUB_RUN_ATTEMPT"),os.environ.get("GITHUB_EVENT_NAME"),
        any(os.environ.get(k) for k in ("HF_TOKEN","HUGGING_FACE_HUB_TOKEN","HF_API_TOKEN")))

def verified_reuse(root):
    result={}
    for uid,(folder,digest) in APPROVED.items():
        p=root/folder/(uid+".wav")
        if sha256_file(p)!=digest:
            raise ValueError("APPROVED_AUDIO_DRIFT")
        inspect_wav(p)
        result[uid]=p
    return result

def timecode(frame):
    ms=round(frame*1000/24000)
    h,ms=divmod(ms,3600000); m,ms=divmod(ms,60000); s,ms=divmod(ms,1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

def captions(scenes, rows, montage):
    lines=[]; timeline=[]; n=0
    for scene,row,mt in zip(scenes,rows,montage["scenes"],strict=True):
        for u,t in zip(scene["units"],row["timing"],strict=True):
            if u["id"]!=t["id"]: raise ValueError("TIMING_DRIFT")
            start=mt["start_frame"]+t["start_frame"]; end=mt["start_frame"]+t["end_frame"]
            n+=1
            lines.extend([str(n),f"{timecode(start)} --> {timecode(end)}",u["text"],""])
            timeline.append({"scene":scene["scene"],"unit":u["id"],"start_frame":start,"end_frame":end,"text":u["text"]})
    return "\n".join(lines)+"\n",timeline

def generate(out,reuse_root):
    head=authorize()
    scenes=plan()
    approved=verified_reuse(reuse_root)
    import numpy as np
    import soundfile as sf
    import torch
    from kokoro import KPipeline
    from importlib.metadata import version
    from huggingface_hub import snapshot_download
    if version("kokoro")!="0.9.4": raise ValueError("KOKORO_VERSION_DRIFT")
    snapshot=Path(snapshot_download(MODEL,revision=SNAPSHOT,token=False,allow_patterns=list(PINS)))
    if snapshot.name!=SNAPSHOT or any(sha256_file(snapshot/k)!=v for k,v in PINS.items()):
        raise ValueError("MODEL_DRIFT")
    os.environ["HF_HUB_OFFLINE"]="1"
    torch.set_num_threads(4); torch.manual_seed(118)
    pipeline=KPipeline(lang_code="i",repo_id=MODEL,device="cpu")
    out.mkdir(parents=True,exist_ok=False)
    report={"contract":"trama.af11-v9-candidate/v0.1","commit":head,"run_id":os.environ["GITHUB_RUN_ID"],
            "regia_sha256":REGIA_SHA,"plan_sha256":canonical_digest(scenes),"approval":APPROVAL,
            "voice":VOICE,"model":MODEL,"model_snapshot":SNAPSHOT,"model_files":PINS,
            "model_license":"Apache-2.0","asr_model_license":"MIT","compute_mode":"FREE_ONLY",
            "audio_approved":False,"published":False,"results":[],"montage":None}
    save(out/"plan.json",scenes)
    (out/"regia.md").write_bytes(REGIA.read_bytes())
    save(out/"receipt.json",report); paths=[]
    for scene in scenes:
        row={"scene":scene["scene"],"status":"REJECTED","segments":[]}
        report["results"].append(row); save(out/"receipt.json",report); parts=[]
        try:
            for u in scene["units"]:
                p=out/(u["id"]+".wav")
                if u["reuse"]:
                    shutil.copyfile(approved[u["id"]],p)
                    if sha256_file(p)!=APPROVED[u["id"]][1]: raise ValueError("COPY_DRIFT")
                else:
                    chunks=[np.asarray(a.detach().cpu().numpy() if hasattr(a,"detach") else a,dtype=np.float32).reshape(-1)
                            for _,_,a in pipeline(u["text"],voice=VOICE) if a is not None]
                    if not chunks: raise ValueError("NO_AUDIO")
                    sf.write(str(p),np.concatenate(chunks),24000,subtype="PCM_16")
                stats=inspect_wav(p); qualify({"text":u["text"],"max_seconds":30},stats)
                row["segments"].append({"id":u["id"],"reused":u["reuse"],"wav_sha256":sha256_file(p),"stats":stats})
                parts.append(p); save(out/"receipt.json",report)
            p=out/f"scene-{scene['scene']}.wav"
            row["timing"]=write_scene(parts,scene["units"],p)
            stats=inspect_wav(p); qualify({"text":scene["spoken_text"],"max_seconds":45},stats)
            row.update(status="HUMAN_LISTENING_PENDING",wav_sha256=sha256_file(p),stats=stats)
            paths.append(p); save(out/"receipt.json",report)
        except Exception as exc:
            row["reason"]=getattr(exc,"reason",type(exc).__name__)
            row["detail"]=str(exc)[:200]; save(out/"receipt.json",report); return 5
    report["montage"]=assemble(paths,out/"prologo.wav")
    srt,timeline=captions(scenes,report["results"],report["montage"])
    (out/"prologo.srt").write_text(srt,encoding="utf-8")
    save(out/"timeline.json",{"sample_rate":24000,"caption_precision":"unit_boundaries","units":timeline})
    (out/"trascrizione-accessibile.md").write_text("\n\n".join(
        f"## Scena {s['scene']}\n"+s["spoken_text"]+{1:"\nAnno: 2045.",3:"\nNome del robot: AX-118.",5:"\n117 tentativi falliti. Missione 118."}.get(s["scene"],"") for s in scenes)+"\n",encoding="utf-8")
    try:
        encode_mp3(out/"prologo.wav",out/"prologo.mp3")
        report["montage"]["mp3_sha256"]=sha256_file(out/"prologo.mp3")
    except AudioRejected as exc: report["montage"]["mp3_warning"]=exc.reason
    report["caption_sha256"]=sha256_file(out/"prologo.srt")
    report["timeline_sha256"]=sha256_file(out/"timeline.json")
    save(out/"receipt.json",report); return 0

def asr(out):
    head=authorize(); scenes=plan()
    r=json.loads((out/"receipt.json").read_text())
    if r["commit"]!=head or r["plan_sha256"]!=canonical_digest(scenes) or len(r["results"])!=5:
        raise ValueError("RECEIPT_BINDING")
    for s,row in zip(scenes,r["results"],strict=True):
        if row["scene"]!=s["scene"] or row["status"]!="HUMAN_LISTENING_PENDING" or sha256_file(out/f"scene-{s['scene']}.wav")!=row["wav_sha256"]:
            raise ValueError("SCENE_BINDING")
        for u,seg in zip(s["units"],row["segments"],strict=True):
            if seg["id"]!=u["id"] or sha256_file(out/(u["id"]+".wav"))!=seg["wav_sha256"] or seg["reused"]!=u["reuse"]:
                raise ValueError("UNIT_BINDING")
            if u["reuse"] and seg["wav_sha256"]!=APPROVED[u["id"]][1]: raise ValueError("APPROVAL_DRIFT")
    from faster_whisper import WhisperModel
    from huggingface_hub import snapshot_download
    m=Path(snapshot_download("Systran/faster-whisper-small",revision="536b0662742c02347bc0e980a01041f333bce120",token=False,allow_patterns=["config.json","model.bin","tokenizer.json","vocabulary.*"]))
    if sha256_file(m/"model.bin")!=ASR_HASH: raise ValueError("ASR_MODEL_DIGEST")
    model=WhisperModel(str(m),device="cpu",compute_type="int8",cpu_threads=4,num_workers=1,local_files_only=True)
    review={"commit":head,"plan_sha256":r["plan_sha256"],"model_sha256":ASR_HASH,"audio_approved":False,"pronunciation_verified":False,"scenes":[]}
    for s,row in zip(scenes,r["results"],strict=True):
        seg,_=model.transcribe(str(out/f"scene-{s['scene']}.wav"),language="it",task="transcribe",beam_size=5,temperature=0,word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt=None)
        observed="".join(x.text for x in seg).strip()
        review["scenes"].append({"scene":s["scene"],"expected":s["spoken_text"],"observed":observed,"wav_sha256":row["wav_sha256"],"differences":compare(s["spoken_text"],observed)})
        save(out/"asr-review.json",review)
    return 0 if all(s["observed"] and not s["differences"] for s in review["scenes"]) else 5

if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--output",type=Path,required=True);p.add_argument("--reuse",type=Path);p.add_argument("--asr",action="store_true");a=p.parse_args()
    if not a.asr and a.reuse is None: p.error("--reuse required")
    raise SystemExit(asr(a.output) if a.asr else generate(a.output,a.reuse))
