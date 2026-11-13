"""Optional real Kokoro CPU adapter. Import only on an explicit inference run."""
from __future__ import annotations

from pathlib import Path

MODEL_ID = "hexgrad/Kokoro-82M"


def synthesize(text: str, voice: str, destination: Path) -> None:
    # External dependencies and model downloads occur only in this function.
    import numpy as np
    import soundfile as sf
    from kokoro import KPipeline

    pipeline = KPipeline(lang_code="i", repo_id=MODEL_ID, device="cpu")
    chunks = []
    for _graphemes, _phonemes, audio in pipeline(text, voice=voice):
        if audio is None:
            continue
        value = audio.detach().cpu().numpy() if hasattr(audio, "detach") else np.asarray(audio)
        value = np.asarray(value, dtype=np.float32).reshape(-1)
        if value.size:
            chunks.append(value)
    if not chunks:
        raise RuntimeError("KOKORO_RETURNED_NO_AUDIO")
    data = np.concatenate(chunks)
    sf.write(str(destination), data, samplerate=24000, subtype="PCM_16")
