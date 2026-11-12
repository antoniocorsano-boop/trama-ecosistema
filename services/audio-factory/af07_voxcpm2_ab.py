"""AF-07C: two bounded synthetic Voice Design samples, no reference audio."""
from __future__ import annotations
import argparse, hashlib, json, os, subprocess, time, wave, struct, math
from pathlib import Path
from af07_lexical_review import expected_scene, words
from core import qualify, AudioRejected

ENGINE = "d30f00feadb7ebce95bacd55b0d104e3ef501481"
WEIGHTS_REPO = "DennisHuang648/VoxCPM2-GGUF"
WEIGHTS_REV = "169f64d8b98bbaab1761e4ca3a83e6af653456cc"
BASE_SHA = "0113177abd11303503bf0b705e1613ec5f0a8508cc74a7dfd0f99312b962a962"
ACOUSTIC_SHA = "5bde898488ad635ff55d24da53543768fa33d5e5cdc538ce190e5ef831038e85"
ASR_REV = "536b0662742c02347bc0e980a01041f333bce120"
ASR_SHA = "3e305921506d8872816023e4c273e75d2419fb89b24da97b4fe7bce14170d671"
TEXT = "La tecnologia non deve decidere al posto delle persone. Deve aiutarle."
IDENTITY = "An original fictional adult female narrator, native Italian, warm, clear, mid-register voice"
STYLES = {
    "A": "natural conversational reading, even pace and neutral emphasis",
    "B": "reflective storytelling, emphasize the contrast between the two sentences, pause meaningfully before the second sentence, then stress the final word, restrained and sincere",
}
SEED = 42

def sha_file(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""): h.update(b)
    return h.hexdigest()

def plan():
    if not expected_scene(5)["text"].startswith(TEXT+" "):
        raise ValueError("CANONICAL_TEXT_DRIFT")
    return [{"id":k,"text":TEXT,"instruction":IDENTITY+", "+v,
             "seed":SEED,"reference_audio":False} for k,v in STYLES.items()]

def command(engine,base,acoustic,output,variant):
    if variant not in plan(): raise ValueError("UNKNOWN_VARIANT")
    return [str(engine),"--cpu","--seed",str(SEED),"--steps","100","--timesteps","10",
            "--cfg","2.0","--temperature","1.0","-t",
            "("+variant["instruction"]+")"+variant["text"],"-o",str(output),
            str(base),str(acoustic)]

def inspect_native(path):
    with wave.open(str(path),"rb") as w:
        if (w.getnchannels(),w.getsampwidth(),w.getframerate()) != (1,2,48000):
            raise ValueError("EXPECTED_NATIVE_48K_PCM16_MONO")
        frames=w.getnframes()
        if not frames or frames>48000*17: raise ValueError("INVALID_DURATION")
        samples=[v[0]/32768 for v in struct.iter_unpack("<h",w.readframes(frames))]
    return {"duration_seconds":frames/48000,"sample_rate":48000,"channels":1,
            "peak":max(abs(x) for x in samples),"rms":math.sqrt(sum(x*x for x in samples)/len(samples)),
            "near_full_scale_count":sum(abs(x)>=.999 for x in samples)}

def authorized():
    if os.environ.get("TRAMA_AF07C_AUTHORIZED")!="yes" or os.environ.get("GITHUB_RUN_ATTEMPT")!="1":
        raise RuntimeError("ONE_SHOT_AUTHORIZATION_REQUIRED")
    if any(os.environ.get(k) for k in ("HF_TOKEN","HUGGING_FACE_HUB_TOKEN","HF_API_TOKEN")):
        raise RuntimeError("ANONYMOUS_ONLY")

def generate(args):
    authorized()
    args.output.mkdir(parents=True,exist_ok=False)
    report={"contract":"trama.af07c-voxcpm2-ab/v0.1","engine_commit":ENGINE,"weights_repo":WEIGHTS_REPO,
            "weights_revision":WEIGHTS_REV,"base_sha256":BASE_SHA,"acoustic_sha256":ACOUSTIC_SHA,
            "compute_mode":"FREE_ONLY","seed":SEED,"identity_guaranteed":False,
            "reference_audio":False,"voice_cloning":False,"audio_approved":False,"published":False,"results":[]}
    def save():
        (args.output/"generation.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    save()
    if sha_file(args.base)!=BASE_SHA or sha_file(args.acoustic)!=ACOUSTIC_SHA:
        raise ValueError("WEIGHT_DIGEST_MISMATCH")
    (args.output/"plan.json").write_text(json.dumps(plan(),ensure_ascii=False,indent=2)+"\n")
    for variant in plan():
        row={**variant,"status":"REJECTED"}
        report["results"].append(row)
        start=time.monotonic()
        out=args.output/(variant["id"]+".wav")
        try:
            subprocess.run(command(args.engine,args.base,args.acoustic,out,variant),check=True,timeout=300)
            row["source_sha256"]=sha_file(out)
            row["stats"]=inspect_native(out)
            qualify({"text":TEXT,"max_seconds":16},row["stats"])
            row["status"]="SIGNAL_PASS_LISTENING_PENDING"
        except Exception as exc:
            row["reason"]=getattr(exc,"reason",type(exc).__name__)
            row["detail"]=str(exc)[:250]
        finally:
            row["wall_seconds"]=round(time.monotonic()-start,2)
            save()
        if row["status"]=="REJECTED": break
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if len(report["results"])==2 and all(r["status"]=="SIGNAL_PASS_LISTENING_PENDING" for r in report["results"]) else 5

def recognize(args):
    authorized()
    from faster_whisper import WhisperModel
    from huggingface_hub import snapshot_download
    from importlib.metadata import version
    directory=Path(snapshot_download("Systran/faster-whisper-small",revision=ASR_REV,token=False,
                 allow_patterns=["config.json","model.bin","tokenizer.json","vocabulary.*"]))
    if sha_file(directory/"model.bin")!=ASR_SHA: raise ValueError("ASR_MODEL_DIGEST")
    model=WhisperModel(str(directory),device="cpu",compute_type="int8",cpu_threads=4,num_workers=1,local_files_only=True)
    gen=json.loads((args.output/"generation.json").read_text())
    report={"contract":"trama.af07c-blind-asr/v0.1","model_snapshot":directory.name,
            "model_sha256":ASR_SHA,"faster_whisper":version("faster-whisper"),
            "device":"cpu","initial_prompt":None,"audio_approved":False,"results":[]}
    for row in gen["results"]:
        if row["status"]!="SIGNAL_PASS_LISTENING_PENDING": continue
        audio=args.output/(row["id"]+".wav")
        if sha_file(audio)!=row["source_sha256"]: raise ValueError("AUDIO_DIGEST")
        segments,_=model.transcribe(str(audio),language="it",task="transcribe",beam_size=5,
            temperature=0,word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt=None)
        segments=list(segments)
        observed="".join(s.text for s in segments).strip()
        report["results"].append({"id":row["id"],"source_sha256":row["source_sha256"],
            "expected":TEXT,"observed":observed,"lexical_match":words(TEXT)==words(observed),
            "pronunciation_verified":False,"expressivity_verified":False,
            "words":[{"word":w.word,"start":w.start,"end":w.end,"probability":w.probability}
                     for s in segments for w in (s.words or [])]})
        (args.output/"asr.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if len(report["results"])==2 and all(r["lexical_match"] for r in report["results"]) else 5

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--mode",choices=["plan","generate","asr"],required=True)
    p.add_argument("--engine",type=Path)
    p.add_argument("--base",type=Path)
    p.add_argument("--acoustic",type=Path)
    p.add_argument("--output",type=Path)
    args=p.parse_args()
    if args.mode=="plan":
        print(json.dumps(plan(),ensure_ascii=False,indent=2)); return 0
    if args.output is None: p.error("--output required")
    if args.mode=="generate":
        if any(x is None for x in (args.engine,args.base,args.acoustic)): p.error("engine and weights required")
        return generate(args)
    return recognize(args)

if __name__=="__main__": raise SystemExit(main())
