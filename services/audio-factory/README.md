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

    sudo apt-get install espeak-ng ffmpeg
    python -m venv .venv
    . .venv/bin/activate
    pip install -r services/audio-factory/requirements-kokoro.txt
    python services/audio-factory/cli.py --plan services/audio-factory/tests/fixtures/missione118_provino.json --output /tmp/trama-audio-provino-001 --allow-model-download --mp3

The final command may fetch hundreds of megabytes of official model and voice files to the local model cache. Execution uses CPU and does not invoke a paid API. The output directory **must not exist**.

Optional --mp3 requires FFmpeg. Without it, omit the flag and inspect the WAV.

If the technical quality gate rejects a clip, there is no usable WAV/MP3 and the directory contains only a rejected receipt. If it accepts, this remains a candidate requiring a human pronunciation and pedagogy review.

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
