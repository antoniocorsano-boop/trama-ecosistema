"""AF-10: exactly two editorial probes; no production or publication."""
from __future__ import annotations
import argparse, json, os, re
from pathlib import Path
from core import inspect_wav, qualify, sha256_file, canonical_digest
from af09_v7_nicola import compare

BRANCH = "docs/af10-missione118-v9"
BASE = "feat/audio-factory-af03-qwen3-prosody"
REPO = "antoniocorsano-boop/trama-ecosistema"
REGIA = Path(__file__).with_name("AF10_MISSIONE118_V9_REGIA.md")
UNITS = (
    ("S3U3", "Anche una macchina può sbagliare. Come può Teo accorgersene?"),
    ("S5U3", "Per cambiare il futuro servono tre cose: attenzione, verifica e responsabilità."),
)
MODEL = "hexgrad/Kokoro-82M"
VOICE = "im_nicola"
SNAPSHOT = "f3ff3571791e39611d31c381e3a41a3af07b4987"
PINS = {
    "config.json": "5abb01e2403b072bf03d04fde160443e209d7a0dad49a423be15196b9b43c17f",
    "kokoro-v1_0.pth": "496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4",
    "voices/im_nicola.pt": "234ed06648649f9bd874b37508ea17560b9c993ef85b4ddb3e3a71e062bd2c12",
}
ASR_HASH = "3e305921506d8872816023e4c273e75d2419fb89b24da97b4fe7bce14170d671"

def plan():
    source = REGIA.read_text(encoding="utf-8")
    for uid, text in UNITS:
        if source.splitlines().count(f"- {uid}: {text}") != 1:
            raise ValueError("EDITORIAL_DRIFT")
    return [{"id": uid, "text": text} for uid, text in UNITS]

def authorization(event, attempt, event_name, credentials=False):
    if attempt != "1" or event_name != "pull_request" or credentials:
        raise ValueError("ONE_SHOT_FREE_ONLY")
    p = event["pull_request"]
    head = p["head"]["sha"]
    if not re.fullmatch(r"[0-9a-f]{40}", head):
        raise ValueError("INVALID_HEAD")
    if (event["action"] != "labeled" or event["repository"]["private"]
        or event["repository"]["full_name"] != REPO
        or p["head"]["repo"]["full_name"] != REPO
        or p["head"]["ref"] != BRANCH or p["base"]["ref"] != BASE
        or event["label"]["name"] != f"af10-pilot-{head}"):
        raise ValueError("AUTHORIZATION_REQUIRED")
    return head

def authorize():
    event = json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text())
    return authorization(event, os.environ.get("GITHUB_RUN_ATTEMPT"),
                         os.environ.get("GITHUB_EVENT_NAME"),
                         any(os.environ.get(k) for k in ("HF_TOKEN", "HUGGING_FACE_HUB_TOKEN", "HF_API_TOKEN")))

def save(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")

def generate(out):
    head = authorize()
    units = plan()
    import numpy as np
    import soundfile as sf
    import torch
    from kokoro import KPipeline
    from importlib.metadata import version
    from huggingface_hub import snapshot_download
    if version("kokoro") != "0.9.4":
        raise ValueError("KOKORO_VERSION_DRIFT")
    snapshot = Path(snapshot_download(MODEL, token=False, allow_patterns=list(PINS)))
    if snapshot.name != SNAPSHOT or any(sha256_file(snapshot/k) != v for k,v in PINS.items()):
        raise ValueError("AF09_MODEL_DRIFT")
    os.environ["HF_HUB_OFFLINE"] = "1"
    torch.set_num_threads(4)
    torch.manual_seed(118)
    pipeline = KPipeline(lang_code="i", repo_id=MODEL, device="cpu")
    out.mkdir(parents=True, exist_ok=False)
    report = {"contract":"trama.af10-pilot/v0.1","commit":head,
              "run_id":os.environ["GITHUB_RUN_ID"],"regia_sha256":sha256_file(REGIA),
              "plan_sha256":canonical_digest(units),"baseline_run":"43477588581",
              "voice":VOICE,"model":MODEL,"model_snapshot":SNAPSHOT,"model_files":PINS,
              "kokoro_version":version("kokoro"),"compute_mode":"FREE_ONLY",
              "audio_approved":False,"published":False,"results":[]}
    save(out/"plan.json",units)
    save(out/"receipt.json",report)
    for unit in units:
        path = out/(unit["id"]+".wav")
        row = {"id":unit["id"],"status":"REJECTED"}
        report["results"].append(row)
        try:
            chunks = [np.asarray(a.detach().cpu().numpy() if hasattr(a,"detach") else a,dtype=np.float32).reshape(-1)
                      for _,_,a in pipeline(unit["text"],voice=VOICE) if a is not None]
            if not chunks:
                raise ValueError("NO_AUDIO")
            sf.write(str(path),np.concatenate(chunks),24000,subtype="PCM_16")
            stats=inspect_wav(path)
            qualify({"text":unit["text"],"max_seconds":30},stats)
            row.update(status="HUMAN_LISTENING_PENDING",wav_sha256=sha256_file(path),stats=stats)
        except Exception as exc:
            row["reason"]=getattr(exc,"reason",type(exc).__name__)
            save(out/"receipt.json",report)
            return 5
        save(out/"receipt.json",report)
    return 0

def asr(out):
    head = authorize()
    units = plan()
    r=json.loads((out/"receipt.json").read_text())
    if (r["commit"]!=head or r["regia_sha256"]!=sha256_file(REGIA)
        or r["plan_sha256"]!=canonical_digest(units) or len(r["results"])!=len(units)):
        raise ValueError("RECEIPT_BINDING")
    for u,row in zip(units,r["results"],strict=True):
        if (row["id"]!=u["id"] or row["status"]!="HUMAN_LISTENING_PENDING"
            or sha256_file(out/(u["id"]+".wav"))!=row["wav_sha256"]):
            raise ValueError("AUDIO_BINDING")
    from faster_whisper import WhisperModel
    from huggingface_hub import snapshot_download
    m=Path(snapshot_download("Systran/faster-whisper-small",revision="536b0662742c02347bc0e980a01041f333bce120",token=False,allow_patterns=["config.json","model.bin","tokenizer.json","vocabulary.*"]))
    if sha256_file(m/"model.bin")!=ASR_HASH:
        raise ValueError("ASR_MODEL_DIGEST")
    model=WhisperModel(str(m),device="cpu",compute_type="int8",cpu_threads=4,num_workers=1,local_files_only=True)
    review={"commit":head,"plan_sha256":r["plan_sha256"],"model_sha256":ASR_HASH,
            "audio_approved":False,"pronunciation_verified":False,"units":[]}
    for u,row in zip(units,r["results"],strict=True):
        segments,_=model.transcribe(str(out/(u["id"]+".wav")),language="it",task="transcribe",beam_size=5,temperature=0,word_timestamps=True,vad_filter=False,condition_on_previous_text=False,initial_prompt=None)
        observed="".join(s.text for s in segments).strip()
        review["units"].append({"id":u["id"],"expected":u["text"],"observed":observed,
                                "wav_sha256":row["wav_sha256"],"differences":compare(u["text"],observed)})
        save(out/"asr-review.json",review)
    return 0 if all(u["observed"] and not u["differences"] for u in review["units"]) else 5

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--output",type=Path,required=True)
    p.add_argument("--asr",action="store_true")
    a=p.parse_args()
    raise SystemExit(asr(a.output) if a.asr else generate(a.output))
