#!/usr/bin/env python3
"""Paired, offline ASR comparison. No dispatch or application integration."""
import argparse
import hashlib
import json
import math
import re
import subprocess
import tempfile
import time
from pathlib import Path
from benchmark import CASES, NEGATIVE, classify, edit_distance, tokens, synthesize, recognize

# Grammar is a candidate context vocabulary, not the exact benchmark utterances.
GRAMMAR = ["apri orario", "mostra orario", "orario di oggi", "orario di domani",
           "apri lezione", "preparazione lezione", "mostra lezione",
           "cerca laboratorio", "laboratorio energia", "trova laboratorio",
           "mostra obiettivi", "obiettivi curricolari", "apri calendario",
           "mostra calendario", "cerca storia", "storia acqua", "trova storia", "[unk]"]
HOLDOUT = [("mostra l'orario di oggi", "OPEN_TIMETABLE"),
           ("trova un laboratorio di tecnologia", "SEARCH_LAB"),
           ("mostra il calendario delle attività", "OPEN_CALENDAR"),
           ("cerca una storia sulle piante", "SEARCH_STORY")]
HARD_NEGATIVE = [("non aprire il calendario", None),
                 ("il calendario è sul tavolo", None),
                 ("apri il calendario e mostra l'orario", None),
                 ("cancella il calendario", None),
                 ("vorrei sapere che tempo fa", None)]
def label(text):
    if "[unk]" in text.lower() or re.search(r"\b(non|annulla|cancella|elimina|scrivi|registra)\b", text.lower()):
        return None
    return classify(text)

def whisper(cli, model, path):
    prefix = path.with_suffix(".whisper")
    t0 = time.perf_counter()
    p = subprocess.run([str(cli), "-m", str(model), "-l", "it", "-t", "4",
                        "-f", str(path), "-otxt", "-of", str(prefix), "-nt"],
                       capture_output=True, text=True, timeout=60)
    if p.returncode:
        raise RuntimeError(p.stderr[-2000:])
    return prefix.with_suffix(".whisper.txt").read_text(encoding="utf-8").strip(), time.perf_counter()-t0

def summarize(rows):
    pos = [r for r in rows if r["expected"]]
    neg = [r for r in rows if not r["expected"]]
    held = [r for r in pos if r["group"] == "holdout"]
    timings = sorted(r["seconds"] for r in pos)
    acc = sum(r["correct"] for r in pos)/len(pos)
    holdout = sum(r["correct"] for r in held)/len(held)
    false = sum(not r["correct"] for r in neg)
    return {"accuracy":acc, "holdout_accuracy":holdout, "false_activations":false,
            "positive_count":len(pos), "negative_count":len(neg),
            "wer":sum(r["errors"] for r in pos)/sum(r["words"] for r in pos),
            "p95_seconds":timings[math.ceil(.95*len(timings))-1],
            "screening":"PASS_SYNTHETIC_ONLY" if acc >= .8 and holdout >= .75 and false == 0 else "REWORK"}

def main():
    p = argparse.ArgumentParser()
    for name in ("vosk-model","vosk-archive","whisper-cli","whisper-model","output"):
        p.add_argument("--"+name, type=Path, required=True)
    args=p.parse_args()
    interfaces=sorted(x.name for x in Path("/sys/class/net").iterdir())
    if set(interfaces)-{"lo"}:
        raise RuntimeError(f"network not isolated: {interfaces}")
    from vosk import Model, KaldiRecognizer, SetLogLevel
    SetLogLevel(-1)
    vm=Model(model_path=str(args.vosk_model.resolve()))
    modes={"vosk_free":[], "vosk_context":[], "whisper_base":[]}
    cases=[(a,b,"baseline") for a,b in CASES]+[(a,b,"holdout") for a,b in HOLDOUT]+[(a,b,"negative") for a,b in NEGATIVE+HARD_NEGATIVE]
    with tempfile.TemporaryDirectory(prefix="tv01c-compare-") as d:
        for speed in (145,175):
            for i,(reference,expected,group) in enumerate(cases):
                wav=Path(d)/f"{speed}-{i}.wav"
                synthesize(reference,speed,wav)
                free,_,ft=recognize(vm,wav,KaldiRecognizer)
                constrained,_,ct=recognize(vm,wav,lambda model,rate: KaldiRecognizer(model,rate,json.dumps(GRAMMAR,ensure_ascii=False)))
                wt,ws=whisper(args.whisper_cli.resolve(),args.whisper_model.resolve(),wav)
                for mode,transcript,seconds in [("vosk_free",free,ft),("vosk_context",constrained,ct),("whisper_base",wt,ws)]:
                    predicted=label(transcript)
                    modes[mode].append(dict(reference=reference,transcript=transcript,expected=expected,
                        predicted=predicted,group=group,speed=speed,seconds=round(seconds,3),
                        errors=edit_distance(tokens(reference),tokens(transcript)),words=len(tokens(reference)),correct=expected==predicted))
    summary={mode:summarize(rows) for mode,rows in modes.items()}
    report={"schema":"trama.tv01c.paired-asr/v1","qualification":"NOT_QUALIFIED",
            "network_interfaces":interfaces,"whisper_model_sha256":hashlib.sha256(args.whisper_model.read_bytes()).hexdigest(),
            "vosk_archive_sha256":hashlib.sha256(args.vosk_archive.read_bytes()).hexdigest(),
            "grammar":GRAMMAR,"summary":summary,"results":modes}
    args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(summary,ensure_ascii=False))
    for mode,rows in modes.items():
        print(mode, "mismatches:", json.dumps([{"reference":r["reference"],"transcript":r["transcript"],"predicted":r["predicted"]} for r in rows if not r["correct"]],ensure_ascii=False))
    if not any(s["screening"]=="PASS_SYNTHETIC_ONLY" for s in summary.values()):
        raise SystemExit(2)

if __name__=="__main__":
    main()
