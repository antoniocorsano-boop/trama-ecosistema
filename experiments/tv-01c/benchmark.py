#!/usr/bin/env python3
"""TV-01C isolated synthetic Italian ASR experiment. Never dispatch actions."""
import argparse
import hashlib
import importlib.metadata
import json
import math
import platform
import re
import subprocess
import tempfile
import time
import wave
from pathlib import Path

CASES = [
    ("mostrami l'orario di domani", "OPEN_TIMETABLE"),
    ("apri la preparazione della lezione", "OPEN_LESSON"),
    ("cerca un laboratorio sull'energia", "SEARCH_LAB"),
    ("mostrami gli obiettivi curricolari", "OPEN_CURRICOLO"),
    ("apri il calendario", "OPEN_CALENDAR"),
    ("cerca una storia sul ciclo dell'acqua", "SEARCH_STORY"),
]
NEGATIVE = [("oggi il cielo è sereno", None), ("", None)]

def tokens(text):
    return re.findall(r"\w+", text.casefold(), flags=re.UNICODE)

def edit_distance(a, b):
    row = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        nxt = [i]
        for j, y in enumerate(b, 1):
            nxt.append(min(nxt[-1] + 1, row[j] + 1, row[j-1] + (x != y)))
        row = nxt
    return row[-1]

def classify(text):
    # Measurement-only labels, never action IDs or dispatch.
    t = set(tokens(text))
    if t & {"non", "annulla", "cancella", "elimina", "scrivi", "registra"}:
        return None
    checks = [
        ("OPEN_TIMETABLE", {"mostrami", "apri", "vedi", "mostra"}, {"orario"}),
        ("OPEN_LESSON", {"apri", "mostrami", "mostra"}, {"lezione"}),
        ("SEARCH_LAB", {"cerca", "trova"}, {"laboratorio"}),
        ("OPEN_CURRICOLO", {"mostrami", "apri", "mostra"}, {"obiettivi"}),
        ("OPEN_CALENDAR", {"apri", "mostrami", "mostra"}, {"calendario"}),
        ("SEARCH_STORY", {"cerca", "trova"}, {"storia"}),
    ]
    matches = [label for label, verb, noun in checks if t & verb and t & noun]
    return matches[0] if len(matches) == 1 else None

def selftest():
    assert edit_distance(["a", "b"], ["a", "c", "d"]) == 2
    assert edit_distance([], ["a"]) == 1
    assert all(classify(text) == label for text, label in CASES + NEGATIVE)
    assert classify("non apri il calendario") is None
    assert classify("apri il calendario e l'orario") is None
    print("Harness selftest PASS (not ASR qualification)")

def synthesize(text, speed, path):
    if text:
        raw = path.with_suffix(".raw.wav")
        subprocess.run(["espeak-ng", "-v", "it", "-s", str(speed), "-w", str(raw), text], check=True)
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(raw),
                        "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(path)], check=True)
    else:
        with wave.open(str(path), "wb") as w:
            w.setparams((1, 2, 16000, 0, "NONE", "not compressed"))
            w.writeframes(b"\0" * 64000)

def recognize(model, path, recognizer_class):
    started = time.perf_counter()
    with wave.open(str(path), "rb") as w:
        assert (w.getnchannels(), w.getsampwidth(), w.getframerate()) == (1, 2, 16000)
        recognizer = recognizer_class(model, 16000)
        parts = []
        duration = w.getnframes() / 16000
        while data := w.readframes(4000):
            if recognizer.AcceptWaveform(data):
                parts.append(json.loads(recognizer.Result()).get("text", ""))
        parts.append(json.loads(recognizer.FinalResult()).get("text", ""))
    return " ".join(p for p in parts if p).strip(), duration, time.perf_counter() - started

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--selftest", action="store_true")
    parser.add_argument("--model", type=Path)
    parser.add_argument("--model-archive", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if args.selftest:
        selftest()
        return
    if not all((args.model, args.model_archive, args.output)):
        parser.error("explicit local model, archive, output required")
    # Fail closed if runner has not isolated its network namespace.
    interfaces = [p.name for p in Path("/sys/class/net").iterdir()]
    if set(interfaces) - {"lo"}:
        raise RuntimeError(f"network isolation not demonstrated: {interfaces}")
    from vosk import Model, KaldiRecognizer, SetLogLevel
    SetLogLevel(-1)
    t0 = time.perf_counter()
    model = Model(model_path=str(args.model.resolve()))
    load_time = time.perf_counter() - t0
    results = []
    with tempfile.TemporaryDirectory(prefix="tv01c-") as directory:
        for speed in (145, 175):
            for i, (reference, expected) in enumerate(CASES + NEGATIVE):
                path = Path(directory) / f"{speed}-{i}.wav"
                synthesize(reference, speed, path)
                text, duration, elapsed = recognize(model, path, KaldiRecognizer)
                predicted = classify(text)
                results.append(dict(reference=reference, transcript=text, expected=expected,
                    predicted=predicted, speed=speed, audio_seconds=round(duration, 3),
                    inference_seconds=round(elapsed, 3),
                    word_errors=edit_distance(tokens(reference), tokens(text)),
                    reference_words=len(tokens(reference)), correct=expected == predicted))
    positives = [r for r in results if r["expected"] is not None]
    negatives = [r for r in results if r["expected"] is None]
    accuracy = sum(r["correct"] for r in positives) / len(positives)
    false_activations = sum(not r["correct"] for r in negatives)
    timings = sorted(r["inference_seconds"] for r in positives)
    digest = hashlib.sha256(args.model_archive.read_bytes()).hexdigest()
    report = dict(schema="trama.tv01c.synthetic-asr/v1", qualification="NOT_QUALIFIED",
        model="vosk-model-small-it-0.22", model_sha256_observed=digest,
        vosk_version=importlib.metadata.version("vosk"), python=platform.python_version(),
        platform=platform.platform(), network_interfaces=interfaces,
        model_load_seconds=round(load_time, 3),
        semantic_accuracy=accuracy, false_activations=false_activations,
        wer=sum(r["word_errors"] for r in positives)/sum(r["reference_words"] for r in positives),
        p95_inference_seconds=timings[math.ceil(.95*len(timings))-1],
        screening="PASS_SYNTHETIC_ONLY" if accuracy >= .8 and false_activations == 0 else "REWORK",
        results=results)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(json.dumps({k:v for k,v in report.items() if k != "results"}, ensure_ascii=False))
    if report["screening"] == "REWORK":
        raise SystemExit(2)

if __name__ == "__main__":
    main()
