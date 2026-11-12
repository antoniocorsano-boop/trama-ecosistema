"""AF-07D: frozen audio corpus and independent acoustic observations, no synthesis."""
from __future__ import annotations
import argparse, hashlib, json, math, statistics, struct, wave, zipfile
from pathlib import Path
from af07_asr_probe import prepare

VOX_SHA = "aa4e952ae1d867682bdde44bec16378d23d014c84fdf682c95ae81c9a16f5ca6"
ASR_SHA = "557679b9c4283585bd3142c6edb410db9f4be31ac0a5a2b29cf744233b63c4f4"
SILERO_COMMIT = "066409f3d9db45a30d21dfcbf9147826ffdd7052"

def sha(data):
    return hashlib.sha256(data).hexdigest()

def read_zip(path, expected):
    data=path.read_bytes()
    if sha(data)!=expected: raise ValueError("ARCHIVE_DIGEST")
    return zipfile.ZipFile(path)

def pcm(path):
    with wave.open(str(path),"rb") as w:
        if (w.getnchannels(),w.getsampwidth())!=(1,2) or w.getframerate() not in (24000,48000):
            raise ValueError("PCM_FORMAT")
        rate=w.getframerate()
        samples=[v[0]/32768 for v in struct.iter_unpack("<h",w.readframes(w.getnframes()))]
    if not samples: raise ValueError("EMPTY_PCM")
    return rate,samples

def rms(samples):
    return math.sqrt(sum(x*x for x in samples)/len(samples)) if samples else 0.0

def low_energy_runs(samples,rate,threshold_db=-55,min_ms=120):
    # Non-overlapping 20 ms frames; low energy is not a linguistic pause.
    hop=round(rate*.02)
    threshold=10**(threshold_db/20)
    active=[rms(samples[i:i+hop])>=threshold for i in range(0,len(samples),hop)]
    result=[]
    start=None
    for i,a in enumerate(active+[True]):
        if not a and start is None: start=i
        elif a and start is not None:
            begin=start*hop/rate
            end=min(i*hop,len(samples))/rate
            if start>0 and i<len(active) and (end-begin)*1000>=min_ms-1e-6:
                result.append({"start":round(begin,3),"end":round(end,3),"seconds":round(end-begin,3)})
            start=None
    return result

def pitch_window(times,frequencies,start,end):
    if len(times)!=len(frequencies) or start>=end: raise ValueError("PITCH_WINDOW")
    values=[f for t,f in zip(times,frequencies) if start<=t<end]
    voiced=[f for f in values if f>0]
    return {"frames":len(values),"voiced_fraction":round(len(voiced)/len(values),4) if values else None,
            "median_f0_hz":round(statistics.median(voiced),2) if voiced else None}

def corpus(root,out):
    records=prepare(root,out)
    with read_zip(root/"af07-asr.zip",ASR_SHA) as z:
        asr=json.loads(z.read("report.json"))
    clips=[]
    for row in records:
        n=row["scene"]
        observation=next(x for x in asr["scenes"] if x["input"]["scene"]==n)
        if observation["input"]["input_wav_sha256"]!=row["input_wav_sha256"]:
            raise ValueError("ASR_AUDIO_MISMATCH")
        clips.append({"id":f"azzurra-{n}","path":out/f"scene-{n}.wav",
                      "sha":row["input_wav_sha256"],"asr":observation["review"]["status"],
                      "lexical_differences":observation["review"]["differences"]})
    with read_zip(root/"af07c.zip",VOX_SHA) as z:
        gen=json.loads(z.read("generation.json"))
        asr=json.loads(z.read("asr.json"))
        if [r["id"] for r in gen["results"]]!=["A","B"]: raise ValueError("PAIR_MISSING")
        for row in gen["results"]:
            k=row["id"]
            data=z.read(k+".wav")
            match=next(x for x in asr["results"] if x["id"]==k)
            if sha(data)!=row["source_sha256"] or sha(data)!=match["source_sha256"]: raise ValueError("PAIR_DIGEST")
            path=out/f"vox-{k}.wav";path.write_bytes(data)
            clips.append({"id":f"vox-{k}","path":path,"sha":sha(data),
                          "asr":"MATCH" if match["lexical_match"] else "MISMATCH",
                          "lexical_differences":[] if match["lexical_match"] else [{"expected":match["expected"],"observed":match["observed"]}],
                          "seed":row["seed"],"instruction":row["instruction"],"text":row["text"]})
    if len(clips)!=7: raise ValueError("CORPUS_INCOMPLETE")
    return clips

def analyze(clip,model):
    import numpy as np
    import parselmouth
    import torch
    from scipy.signal import resample_poly
    from silero_vad import get_speech_timestamps
    rate,x=pcm(clip["path"])
    if sha(clip["path"].read_bytes())!=clip["sha"]: raise ValueError("AUDIO_DIGEST")
    sound=parselmouth.Sound(np.asarray(x),sampling_frequency=rate)
    pitch=sound.to_pitch(time_step=.01,pitch_floor=75,pitch_ceiling=600)
    ts=pitch.xs().tolist()
    fs=pitch.selected_array["frequency"].tolist()
    y=resample_poly(np.asarray(x,dtype=np.float32),2,3) if rate==24000 else resample_poly(np.asarray(x,dtype=np.float32),1,3)
    spans=get_speech_timestamps(torch.from_numpy(y),model,sampling_rate=16000,
            threshold=.5,min_speech_duration_ms=100,min_silence_duration_ms=100,speech_pad_ms=0,return_seconds=False)
    intervals=[{"start":s["start"]/16000,"end":s["end"]/16000} for s in spans]
    result={k:v for k,v in clip.items() if k!="path"}
    result.update({"duration_seconds":len(x)/rate,"rms_dbfs":round(20*math.log10(max(rms(x),1e-12)),2),
                   "low_energy_internal_intervals":low_energy_runs(x,rate),
                   "pitch_summary":pitch_window(ts,fs,0,len(x)/rate),
                   "vad_speech_intervals":intervals,"vad_speech_seconds":round(sum(s["end"]-s["start"] for s in intervals),4),
                   "pronunciation_verified":False,"expressivity_verified":False,"audio_approved":False})
    if clip["id"]=="vox-B":
        # Listening-review window containing the sustained sound after the first sentence.
        result["review_window"]={"start":4.55,"end":5.75,**pitch_window(ts,fs,4.55,5.75),
                                  "interpretation":"PERIODIC_VOCAL_ACTIVITY_PROXY_NOT_FILLER_CLASSIFIER"}
    return result

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--archives",type=Path,required=True)
    p.add_argument("--output",type=Path,required=True)
    p.add_argument("--prepare-only",action="store_true")
    args=p.parse_args()
    clips=corpus(args.archives,args.output)
    if args.prepare_only:
        print(json.dumps([{k:v for k,v in c.items() if k!="path"} for c in clips],ensure_ascii=False,indent=2))
        return 0
    import torch
    from silero_vad import load_silero_vad
    from importlib.metadata import version
    torch.set_num_threads(1)
    model=load_silero_vad(onnx=True)
    report={"contract":"trama.af07d-acoustic-review/v0.1","silero_source_commit":SILERO_COMMIT,
            "silero_version":version("silero-vad"),"parselmouth_version":version("praat-parselmouth"),
            "onnxruntime_version":version("onnxruntime"),"scipy_version":version("scipy"),
            "vad_threshold":.5,"min_silence_ms":100,"pitch_floor_hz":75,"pitch_ceiling_hz":600,
            "low_energy_threshold_dbfs":-55,"audio_approved":False,"published":False,"winner":None,"clips":[]}
    for clip in clips:
        report["clips"].append(analyze(clip,model))
        (args.output/"acoustic-review.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if len(report["clips"])==7 else 5

if __name__=="__main__": raise SystemExit(main())
