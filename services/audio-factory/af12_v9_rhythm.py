"""AF-12: one revised phrase and nondestructive V9 rhythm assembly."""
from __future__ import annotations
import argparse, json, os, re, shutil, wave, struct, math
from pathlib import Path
from core import inspect_wav, qualify, sha256_file, canonical_digest, encode_mp3, AudioRejected
from af09_v7_nicola import write_scene, compare
from af11_v9_production import plan as original_plan, captions, APPROVED
from af10_v9_pilot import MODEL, VOICE, SNAPSHOT, PINS, ASR_HASH, BRANCH, BASE, REPO, save

SOURCE_COMMIT="711648c1971d0756497c2414d094584ade1b0a13"
SOURCE_RECEIPT="e89da73270fa6de454c74d74d93037d8f29e9952aa1b5feb7a40c5bbb8b714aa"
SOURCE_PLAN="39fceb8d4e587c3674a3ea54563c4ccfbc61164e81c3963b8dbe4504fcc2db3c"
TARGET="S4U3"
NEW_TEXT="Poi deve chiedere un controllo."
TARGETS=((500,0),(500,550,0),(500,500,0),(500,500,0),(600,550,0))
SCENE_TARGET=750

def plan():
    scenes=original_plan()
    for s,targets in zip(scenes,TARGETS,strict=True):
        for u,target in zip(s["units"],targets,strict=True):
            if u["id"]==TARGET: u["text"]=NEW_TEXT
            u["reuse"]=u["id"]!=TARGET
            u["target_gap_ms"]=target
            u["pause_after_ms"]=0
        s["spoken_text"]=" ".join(u["text"] for u in s["units"])
    return scenes

def authorization(e,attempt,event,credentials=False):
    if attempt!="1" or event!="pull_request" or credentials: raise ValueError("ONE_SHOT_FREE_ONLY")
    p=e["pull_request"]; h=p["head"]["sha"]
    if (not re.fullmatch(r"[0-9a-f]{40}",h) or e["number"]!=312 or e["action"]!="labeled"
        or e["repository"]["private"] or e["repository"]["full_name"]!=REPO
        or p["head"]["repo"]["full_name"]!=REPO or p["head"]["ref"]!=BRANCH
        or p["base"]["ref"]!=BASE or e["label"]["name"]!=f"af12-{h}"):
        raise ValueError("AUTHORIZATION_REQUIRED")
    return h

def authorize():
    return authorization(json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text()),
        os.environ.get("GITHUB_RUN_ATTEMPT"),os.environ.get("GITHUB_EVENT_NAME"),
        any(os.environ.get(k) for k in ("HF_TOKEN","HUGGING_FACE_HUB_TOKEN","HF_API_TOKEN")))

def verified_source(root):
    if sha256_file(root/"receipt.json")!=SOURCE_RECEIPT or sha256_file(root/"plan.json")!=SOURCE_PLAN:
        raise ValueError("SOURCE_METADATA_DRIFT")
    r=json.loads((root/"receipt.json").read_text())
    if r["commit"]!=SOURCE_COMMIT or r["plan_sha256"]!=canonical_digest(original_plan()):
        raise ValueError("SOURCE_BINDING")
    records={}
    for s,row in zip(original_plan(),r["results"],strict=True):
        if row["scene"]!=s["scene"]: raise ValueError("SOURCE_SCENE")
        for u,seg in zip(s["units"],row["segments"],strict=True):
            uid=u["id"]; path=root/(uid+".wav")
            if seg["id"]!=uid or sha256_file(path)!=seg["wav_sha256"]: raise ValueError("SOURCE_WAV_DRIFT")
            inspect_wav(path)
            if uid in APPROVED and seg["wav_sha256"]!=APPROVED[uid][1]: raise ValueError("APPROVED_DRIFT")
            records[uid]=path
    return records

def edge_ms(path):
    # Estimate quiet boundary frames, never remove any samples.
    with wave.open(str(path),"rb") as w:
        if (w.getnchannels(),w.getsampwidth(),w.getframerate())!=(1,2,24000): raise ValueError("FORMAT")
        flags=[]
        while True:
            b=w.readframes(240)
            if not b: break
            samples=struct.unpack("<"+"h"*(len(b)//2),b)
            flags.append(math.sqrt(sum(x*x for x in samples)/len(samples))>32)
    if not any(flags): raise ValueError("NO_ACTIVE_AUDIO")
    first=flags.index(True); last=len(flags)-1-flags[::-1].index(True)
    return first*10,(len(flags)-1-last)*10

def gap(target,left,right):
    return max(0,target-left-right)

def arrange(paths,segments):
    edges=[edge_ms(p) for p in paths]
    out=[]; evidence=[]
    for i,s in enumerate(segments):
        t=dict(s)
        t["pause_after_ms"]=gap(t["target_gap_ms"],edges[i][1],edges[i+1][0]) if i+1<len(paths) else 0
        out.append(t)
        if i+1<len(paths):
            evidence.append({"after":s["id"],"before":segments[i+1]["id"],"target_ms":t["target_gap_ms"],
                "left_quiet_ms":edges[i][1],"right_quiet_ms":edges[i+1][0],"added_ms":t["pause_after_ms"],
                "estimated_total_ms":edges[i][1]+edges[i+1][0]+t["pause_after_ms"]})
    return out,evidence

def generate(out,source):
    head=authorize(); scenes=plan(); originals=verified_source(source)
    import numpy as np
    import soundfile as sf
    import torch
    from kokoro import KPipeline
    from importlib.metadata import version
    from huggingface_hub import snapshot_download
    if version("kokoro")!="0.9.4": raise ValueError("VERSION_DRIFT")
    snapshot=Path(snapshot_download(MODEL,revision=SNAPSHOT,token=False,allow_patterns=list(PINS)))
    if snapshot.name!=SNAPSHOT or any(sha256_file(snapshot/k)!=v for k,v in PINS.items()): raise ValueError("MODEL_DRIFT")
    os.environ["HF_HUB_OFFLINE"]="1"; torch.set_num_threads(4); torch.manual_seed(118)
    pipeline=KPipeline(lang_code="i",repo_id=MODEL,device="cpu")
    out.mkdir(parents=True,exist_ok=False)
    r={"contract":"trama.af12-v9-rhythm/v0.1","commit":head,"source_commit":SOURCE_COMMIT,
        "source_run":"43486156318","source_receipt_sha256":SOURCE_RECEIPT,"plan_sha256":canonical_digest(scenes),
        "voice":VOICE,"model":MODEL,"model_snapshot":SNAPSHOT,"model_files":PINS,"compute_mode":"FREE_ONLY",
        "audio_approved":False,"published":False,"results":[],"montage":None}
    save(out/"plan.json",scenes); save(out/"receipt.json",r)
    scene_paths=[]
    for s in scenes:
        row={"scene":s["scene"],"status":"REJECTED","segments":[]}
        r["results"].append(row); save(out/"receipt.json",r); paths=[]
        try:
            for u in s["units"]:
                uid=u["id"]; p=out/(uid+".wav")
                if u["reuse"]:
                    shutil.copyfile(originals[uid],p)
                    if sha256_file(p)!=sha256_file(originals[uid]): raise ValueError("COPY_DRIFT")
                else:
                    if uid!=TARGET: raise ValueError("UNEXPECTED_INFERENCE")
                    chunks=[np.asarray(a.detach().cpu().numpy() if hasattr(a,"detach") else a,dtype=np.float32).reshape(-1)
                            for _,_,a in pipeline(u["text"],voice=VOICE) if a is not None]
                    if not chunks: raise ValueError("NO_AUDIO")
                    sf.write(str(p),np.concatenate(chunks),24000,subtype="PCM_16")
                stats=inspect_wav(p); qualify({"text":u["text"],"max_seconds":30},stats)
                row["segments"].append({"id":uid,"reused":u["reuse"],"wav_sha256":sha256_file(p),"stats":stats})
                paths.append(p); save(out/"receipt.json",r)
            segments,gaps=arrange(paths,s["units"])
            p=out/f"scene-{s['scene']}.wav"
            row["timing"]=write_scene(paths,segments,p); row["gaps"]=gaps
            stats=inspect_wav(p); qualify({"text":s["spoken_text"],"max_seconds":45},stats)
            row.update(status="HUMAN_LISTENING_PENDING",wav_sha256=sha256_file(p),stats=stats)
            scene_paths.append(p); save(out/"receipt.json",r)
        except Exception as exc:
            row["reason"]=getattr(exc,"reason",type(exc).__name__); row["detail"]=str(exc)[:200]
            save(out/"receipt.json",r); return 5
    scene_segments=[{"id":str(s["scene"]),"target_gap_ms":SCENE_TARGET} for s in scenes]
    arranged,gaps=arrange(scene_paths,scene_segments)
    montage=out/"prologo.wav"; timing=write_scene(scene_paths,arranged,montage)
    stats=inspect_wav(montage)
    r["montage"]={"sha256":sha256_file(montage),"duration_seconds":stats["duration_seconds"],"gaps":gaps,
        "scenes":[{"scene":int(t["id"]),"start_frame":t["start_frame"],"end_frame":t["end_frame"],"sha256":t["wav_sha256"]} for t in timing]}
    srt,timeline=captions(scenes,r["results"],r["montage"])
    (out/"prologo.srt").write_text(srt,encoding="utf-8")
    save(out/"timeline.json",{"sample_rate":24000,"caption_precision":"unit_boundaries","units":timeline})
    (out/"trascrizione-accessibile.md").write_text("\n\n".join(f"## Scena {s['scene']}\n"+s["spoken_text"]+{1:"\nAnno: 2045.",3:"\nNome del robot: AX-118.",5:"\n117 tentativi falliti. Missione 118."}.get(s["scene"],"") for s in scenes)+"\n",encoding="utf-8")
    try:
        encode_mp3(montage,out/"prologo.mp3"); r["montage"]["mp3_sha256"]=sha256_file(out/"prologo.mp3")
    except AudioRejected as exc: r["montage"]["mp3_warning"]=exc.reason
    r["caption_sha256"]=sha256_file(out/"prologo.srt");r["timeline_sha256"]=sha256_file(out/"timeline.json")
    save(out/"receipt.json",r);return 0

def asr(out):
    head=authorize(); scenes=plan(); r=json.loads((out/"receipt.json").read_text())
    if r["commit"]!=head or r["plan_sha256"]!=canonical_digest(scenes) or len(r["results"])!=5: raise ValueError("RECEIPT_BINDING")
    for s,row in zip(scenes,r["results"],strict=True):
        if row["scene"]!=s["scene"] or row["status"]!="HUMAN_LISTENING_PENDING" or sha256_file(out/f"scene-{s['scene']}.wav")!=row["wav_sha256"]: raise ValueError("SCENE_BINDING")
        for u,seg in zip(s["units"],row["segments"],strict=True):
            if u["id"]!=seg["id"] or u["reuse"]!=seg["reused"] or sha256_file(out/(u["id"]+".wav"))!=seg["wav_sha256"]: raise ValueError("UNIT_BINDING")
            if u["id"] in APPROVED and seg["wav_sha256"]!=APPROVED[u["id"]][1]: raise ValueError("APPROVAL_DRIFT")
    from faster_whisper import WhisperModel
    from huggingface_hub import snapshot_download
    m=Path(snapshot_download("Systran/faster-whisper-small",revision="536b0662742c02347bc0e980a01041f333bce120",token=False,allow_patterns=["config.json","model.bin","tokenizer.json","vocabulary.*"]))
    if sha256_file(m/"model.bin")!=ASR_HASH: raise ValueError("ASR_MODEL_DIGEST")
    model=WhisperModel(str(m),device="cpu",compute_type="int8",cpu_threads=4,num_workers=1,local_files_only=True)
    review={"commit":head,"audio_approved":False,"pronunciation_verified":False,"scenes":[]}
    for s,row in zip(scenes,r["results"],strict=True):
        segments,_=model.transcribe(str(out/f"scene-{s['scene']}.wav"),language="it",task="transcribe",beam_size=5,temperature=0,word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt=None)
        observed="".join(x.text for x in segments).strip()
        review["scenes"].append({"scene":s["scene"],"expected":s["spoken_text"],"observed":observed,"wav_sha256":row["wav_sha256"],"differences":compare(s["spoken_text"],observed)})
        save(out/"asr-review.json",review)
    return 0 if all(s["observed"] and not s["differences"] for s in review["scenes"]) else 5

if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--output",type=Path,required=True);p.add_argument("--source",type=Path);p.add_argument("--asr",action="store_true");a=p.parse_args()
    if not a.asr and a.source is None: p.error("--source required")
    raise SystemExit(asr(a.output) if a.asr else generate(a.output,a.source))
