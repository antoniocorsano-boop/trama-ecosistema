"""AF-07R: three selected synthetic narration units, not automatic replacement."""
import argparse, json, os, re, subprocess, time
from pathlib import Path
from af07_narrative_score import load, validate
from af07_lexical_review import words
from af06_azzurra_completion import EXPECTED, UPSTREAM, TEMPERATURE, TOP_K
from core import inspect_wav, qualify, sha256_file
from af03_public_demo import make_quiet_listening_copy

IDS=("S4U1","S4U2","S5U2")
ASR_REV="536b0662742c02347bc0e980a01041f333bce120"
ASR_SHA="3e305921506d8872816023e4c273e75d2419fb89b24da97b4fe7bce14170d671"

def plan():
    score,fixture=load()
    validate(score,fixture)
    units={u["id"]:u for s in score["scenes"] for u in s["units"]}
    lexicon={x["word"]:x for x in score["lexicon"]}
    sigla=lexicon["AX-118"]["synthesisInput"]
    if sigla!="a iks centodiciotto": raise ValueError("UNAPPROVED_SYNTHESIS_SPELLING")
    return [{"id":k,"canonical":units[k]["canonicalText"],
             "spoken":units[k]["canonicalText"].replace("AX-118",sigla),
             "direction":units[k]["direction"],"pauseAfterMs":units[k]["pauseAfterMs"],
             "prosody_applied":False,"speaker_id":0} for k in IDS]

def authorized():
    if os.environ.get("GITHUB_RUN_ATTEMPT")!="1" or os.environ.get("GITHUB_EVENT_NAME")!="pull_request":
        raise RuntimeError("ONE_SHOT_AUTHORIZATION_REQUIRED")
    event=json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text())
    if event["repository"]["private"] or event["number"]!=304 or event["action"]!="labeled" or event["label"]["name"]!="af07r2-regia-autorizzata" or event["pull_request"]["head"]["ref"]!="feat/audio-factory-af03-qwen3-prosody":
        raise RuntimeError("AUTHORIZATION_REQUIRED")
    if any(os.environ.get(k) for k in ("HF_TOKEN","HUGGING_FACE_HUB_TOKEN","HF_API_TOKEN")):
        raise RuntimeError("ANONYMOUS_ONLY")

def lexical(text):
    # Accept only explicit orthographic alternatives for the intended acronym/number.
    text=text.casefold()
    # ASR can render the intended sound as ordinary spelling. Never accept
    # the explicitly rejected sequence "ai ci si"; human listening is mandatory.
    for form in ("a iks centodiciotto","a iks 118","a ics centodiciotto","a ics 118","ax-118","ax 118","ax118"):
        text=re.sub(r"(?<!\w)"+re.escape(form)+r"(?!\w)"," ax118 ",text)
    return words(text)

def generate(args):
    authorized()
    if sha256_file(args.weights)!=EXPECTED: raise ValueError("WEIGHT_DIGEST")
    out=args.output
    out.mkdir(parents=True,exist_ok=True)
    report={"contract":"trama.af07r-selective-direction/v0.1","engine_commit":UPSTREAM,
            "weights_sha256":EXPECTED,"speaker":0,"temperature":TEMPERATURE,"top_k":TOP_K,
            "reference_audio":False,"cloning":False,"published":False,"audio_approved":False,
            "identity_guaranteed":False,"prosody_applied":False,"packaging":"WAV_ONLY","previous_rejected_run":43249465488,"results":[]}
    def save(): (out/"generation.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    save()
    for unit in plan():
        k=unit["id"]
        row={**unit,"status":"REJECTED"}
        report["results"].append(row)
        source=out/(k+"-source.wav")
        listening=out/(k+"-listening.wav")
        start=time.monotonic()
        try:
            subprocess.run([str(args.engine.resolve()),"--cpu","--model-id","cartesia/azzurra-voice",
                "--weights-path",str(args.weights.resolve()),"--speaker-id","0","--text",unit["spoken"],
                "--output",str(source),"--temperature",TEMPERATURE,"--top-k",TOP_K,
                "--max-audio-len-ms","18000"],check=True,timeout=180)
            row["source_sha256"]=sha256_file(source)
            row["stats"]=inspect_wav(source)
            qualify({"text":unit["spoken"],"max_seconds":18},row["stats"])
            make_quiet_listening_copy(source,listening)
            qualify({"text":unit["spoken"],"max_seconds":18},inspect_wav(listening))
            row["listening_sha256"]=sha256_file(listening)
            # WAV is the canonical review artifact. Packaging is independent.
            row["status"]="SIGNAL_PASS_REVIEW_PENDING"
        except Exception as exc:
            row["reason"]=getattr(exc,"reason",type(exc).__name__)
            row["detail"]=str(exc)[:250]
        finally:
            row["wall_seconds"]=round(time.monotonic()-start,2)
            save()
        if row["status"]=="REJECTED":break
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if len(report["results"])==3 and all(r["status"]=="SIGNAL_PASS_REVIEW_PENDING" for r in report["results"]) else 5

def recognize(args):
    authorized()
    from faster_whisper import WhisperModel
    from huggingface_hub import snapshot_download
    d=Path(snapshot_download("Systran/faster-whisper-small",revision=ASR_REV,token=False,
         allow_patterns=["config.json","model.bin","tokenizer.json","vocabulary.*"]))
    if sha256_file(d/"model.bin")!=ASR_SHA: raise ValueError("ASR_MODEL_DIGEST")
    model=WhisperModel(str(d),device="cpu",compute_type="int8",cpu_threads=4,num_workers=1,local_files_only=True)
    gen=json.loads((args.output/"generation.json").read_text())
    report={"model_snapshot":d.name,"model_sha256":ASR_SHA,"initial_prompt":None,"audio_approved":False,"results":[]}
    for row in gen["results"]:
        if row["status"]!="SIGNAL_PASS_REVIEW_PENDING": continue
        path=args.output/(row["id"]+"-listening.wav")
        if sha256_file(path)!=row["listening_sha256"]:raise ValueError("AUDIO_DIGEST")
        segments,_=model.transcribe(str(path),language="it",task="transcribe",beam_size=5,temperature=0,
             word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt=None)
        segments=list(segments)
        observed="".join(s.text for s in segments).strip()
        report["results"].append({"id":row["id"],"expected":row["spoken"],"observed":observed,
             "lexical_match":lexical(row["spoken"])==lexical(observed),"pronunciation_verified":False,
             "prosody_verified":False,"words":[{"word":w.word,"start":w.start,"end":w.end,"probability":w.probability}
                 for s in segments for w in (s.words or [])]})
        (args.output/"asr.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if len(report["results"])==3 and all(r["lexical_match"] for r in report["results"]) else 5

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--mode",choices=["generate","asr","plan"],required=True)
    p.add_argument("--engine",type=Path)
    p.add_argument("--weights",type=Path)
    p.add_argument("--output",type=Path)
    args=p.parse_args()
    if args.mode=="plan":print(json.dumps(plan(),ensure_ascii=False,indent=2));return 0
    return generate(args) if args.mode=="generate" else recognize(args)

if __name__=="__main__":raise SystemExit(main())
