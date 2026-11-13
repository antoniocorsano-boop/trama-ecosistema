# TRAMA Audio Factory — AF-01 · Kokoro Italian pilot

Status: IMPLEMENTED_PROTOTYPE / NO_MODEL_INFERENCE_VERIFIED / HUMAN_LISTENING_PENDING / NOT_DEPLOYED

This is a **shared audio-production capability** in TRAMA, not a new Atlas student runtime. Studio Atlas authors narration; Audio Factory generates *candidates*; human reviewers accept or reject them; Atlas and Docente OS consume approved assets through separate publication workflows.

## What AF-01 actually provides

- JSON request validation with an Italian-only, zero-cost policy.
- Optional local Kokoro CPU adapter, exclusively using Italian voices im_nicola and if_sara.
- WAV 24 kHz mono, optionally MP3 via an already-installed FFmpeg executable.
- Duration, silence, clipping and file format gates; SHA-256 receipt; companion transcript.
- Standard-library tests that run without neural models, GPU, keys or network.
- No voice cloning, recording of students, automatic publication, deployment, or paid fallback.

**Not demonstrated yet:** actual Kokoro inference on a qualified machine or convincing Italian pronunciation. An open upstream issue reports Italian audio truncated to 0.3 seconds; AF-01 fails closed on abnormally short output. See https://github.com/hexgrad/kokoro/issues/364.

## Deterministic preflight (safe, no downloads)

From repository root:

    python services/audio-factory/cli.py --plan services/audio-factory/tests/fixtures/missione118_provino.json --validate-only
    python -m unittest discover -s services/audio-factory/tests -p 'test_*.py' -v

No Python dependencies beyond the standard library are required for these commands.

## Optional real local synthesis (only after checking hardware/consent)

Use a supported **Python 3.10–3.12** environment on a computer you control.
Never install Kokoro into Atlas public, Studio Atlas web runtime, or the image service.
Example Linux commands:

    python -m venv .venv
    . .venv/bin/activate
    pip install -r services/audio-factory/requirements-kokoro.txt
    python services/audio-factory/cli.py --plan services/audio-factory/tests/fixtures/missione118_provino.json --output /tmp/trama-audio-provino-001 --allow-model-download

The final command may fetch hundreds of megabytes of official model and voice files to the local model cache. Execution uses CPU and does not invoke a paid API. The output directory **must not exist**.

No Ubuntu packages need to be installed for the Italian phonemizer: `misaki[en]` supplies `espeakng-loader` and the bundled native library. Optional `--mp3` requires FFmpeg if already installed; otherwise inspect the WAV.

If the technical quality gate rejects a clip, there is no usable WAV/MP3 and the directory contains only a rejected receipt. If it accepts, this remains a candidate requiring a human pronunciation and pedagogy review.

## AF-02 execution history / infrastructure hardening

- First authorized run #43048603760: cancelled; `apt-get update` stalled on `security.ubuntu.com` DNS; no audio.
- Second authorized run #43052938541: failed quickly at DNS preflight on `security.ubuntu.com`, while `pypi.org` and `huggingface.co` were resolvable; no audio.
- The third-generation workflow revision no longer invokes `apt-get` and checks only the Python package index and the model registry. It installs the Python-distributed eSpeak NG library, verifies Italian phonemes, and emits WAV even if FFmpeg is not present.
- This revision is **not a third authorized inference attempt**. The `af02-provino-autorizzato` label has been removed and no run is triggered by a normal PR commit.
- The offline tests assert that AF-02 cannot invoke the Ubuntu package manager, that eSpeak NG is supplied through Python, and that the workflow can run only after a new explicit authorization label.
- New synthesis remains prohibited until new explicit authorization, following offline CI and human review.

## Contract boundaries

Plan: ../../schemas/audio-generation-plan.v0.1.schema.json
Receipt: ../../schemas/audio-execution-receipt.v0.1.schema.json
Decision: ../../docs/decisions/trama-adr-022-audio-factory-af01.md

- Requests must contain public/fictional, non-personal text and declare no personal data.
- Voice cloning and recognition of real speakers are forbidden in v0.1.
- No credential or network inference provider is part of this adapter.
- FREE_ONLY does not guarantee free hardware, electricity or connectivity; it forbids automatic charges.
- Never ingest a student's speech, voiceprint or other personal information.
- A successful technical receipt does not authorize publishing or classroom use.
- Retain attribution, licenses and attribution notes for **specific voice weights**, not only the Python package.
- Audio is optional in the student experience: provide transcript, pause, replay, skip, and accessible equivalent.
