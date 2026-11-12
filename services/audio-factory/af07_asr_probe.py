"""AF-07B.2: blind ASR of immutable synthetic audio; never approve a narration."""
from __future__ import annotations
import argparse, hashlib, io, json, wave, zipfile, os
from pathlib import Path
from af07_lexical_review import review_transcript

ARCHIVES = {
    "opening": ("9553b7aaf908e6b1cb9e4d12c693496cccd76d3eeebcec6453b4aca743e6174e", "af06b.zip"),
    "revision": ("0535b3712a390256ecd2a8a0b592f55c371f5ce1edca463953185c73dff2b15c", "af06c.zip"),
    "remaining": ("6c79eae2852e2aa4bafff3a6332c9231eedc3735b026b744791f4036aea5ef96", "af06e.zip"),
}
MODEL = "Systran/faster-whisper-small"
REVISION = "536b066"
INPUTS = [
    (1,"opening","scene-1-listening.wav","9880a1666221af6a5e3dca455f8c8b4631947b8db6c3ca53f736273023852a42",0),
    (2,"revision","scene-2-listening.wav","ea20a0555e13304a4e0fb322ecaac9415c95bcdac38faa74d53146dadf0777d1",37200),
    (3,"remaining","scene-3-listening.wav","9a2f2189dc8061483b60adb7d354f2ed17279b6fae784e1a30bab2f05b5350ee",0),
    (4,"remaining","scene-4-listening.wav","9c58590933d9fdcc1644eb2b05f9f179e7356d25cea88e7ab1edefe6de53de13",0),
    (5,"remaining","scene-5-listening.wav","7eb2e522f972d2b810a2d9cedc3a9fcf65243a1179eb50cfeb71849dd2a74957",0),
]
def sha(data): return hashlib.sha256(data).hexdigest()

def prepare(root, out):
    out.mkdir(parents=True,exist_ok=True)
    blobs={}
    for key,(expected,name) in ARCHIVES.items():
        data=(root/name).read_bytes()
        if sha(data)!=expected: raise ValueError("ARCHIVE_DIGEST:"+key)
        blobs[key]=data
    records=[]
    for scene,key,name,expected,cut in INPUTS:
        with zipfile.ZipFile(io.BytesIO(blobs[key])) as z:
            data=z.read(name)
        if sha(data)!=expected: raise ValueError("WAV_DIGEST:"+name)
        with wave.open(io.BytesIO(data),"rb") as r:
            if (r.getnchannels(),r.getsampwidth(),r.getframerate())!=(1,2,24000):
                raise ValueError("WAV_FORMAT")
            if cut>=r.getnframes(): raise ValueError("INVALID_CUT")
            r.setpos(cut)
            frames=r.readframes(r.getnframes()-cut)
            params=r.getparams()
        path=out/f"scene-{scene}.wav"
        with wave.open(str(path),"wb") as w:
            w.setparams(params)
            w.writeframes(frames)
        records.append({"scene":scene,"source_wav_sha256":expected,"cut_frames":cut,
                        "input_wav_sha256":sha(path.read_bytes()),"seconds":len(frames)/48000})
    return records

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--archives",type=Path,required=True)
    p.add_argument("--output",type=Path,required=True)
    p.add_argument("--prepare-only",action="store_true")
    args=p.parse_args()
    records=prepare(args.archives,args.output)
    (args.output/"inputs.json").write_text(json.dumps(records,indent=2))
    if args.prepare_only: return 0
    if os.environ.get("TRAMA_AF07_ASR_AUTHORIZED")!="yes" or os.environ.get("GITHUB_RUN_ATTEMPT")!="1":
        raise RuntimeError("AUTHORIZATION_REQUIRED")
    from faster_whisper import WhisperModel
    from huggingface_hub import snapshot_download
    from importlib.metadata import version
    model_dir=Path(snapshot_download(MODEL,revision=REVISION,token=False,allow_patterns=["config.json","model.bin","tokenizer.json","vocabulary.*"]))
    model=WhisperModel(str(model_dir),device="cpu",compute_type="int8",cpu_threads=4,num_workers=1,local_files_only=True)
    report={"contract":"trama.af07-blind-asr/v0.1","model":MODEL,"model_snapshot":model_dir.name,
            "faster_whisper":version("faster-whisper"),"ctranslate2":version("ctranslate2"),
            "model_bin_sha256":sha((model_dir/"model.bin").read_bytes()),
            "device":"cpu","compute_type":"int8","language":"it","initial_prompt":None,
            "beam_size":5,"word_timestamps":True,"vad_filter":False,
            "condition_on_previous_text":False,"audio_approved":False,"published":False,"scenes":[]}
    def save():
        (args.output/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    save()
    for row in records:
        scene=row["scene"]
        segments,info=model.transcribe(str(args.output/f"scene-{scene}.wav"),language="it",task="transcribe",beam_size=5,
            temperature=0,word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt=None)
        segments=list(segments)
        observed="".join(s.text for s in segments).strip()
        review=review_transcript(scene,observed)
        review["recognition_executed"]=True
        report["scenes"].append({"input":row,"review":review,"segments":[{"start":s.start,"end":s.end,"text":s.text,
            "avg_logprob":s.avg_logprob,"words":[{"word":w.word,"start":w.start,"end":w.end,"probability":w.probability} for w in (s.words or [])]} for s in segments]})
        save()
        print(json.dumps({"scene":scene,"observed":observed,"status":review["status"],"differences":review["differences"]},ensure_ascii=False),flush=True)
    return 0 if len(report["scenes"])==5 and all(x["review"]["status"]!="TRANSCRIPT_MISSING" for x in report["scenes"]) else 5

if __name__=="__main__": raise SystemExit(main())
