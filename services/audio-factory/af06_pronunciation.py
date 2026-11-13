"""Explicit, narrowly scoped pronunciation hints; canonical text remains unchanged."""
import hashlib
from af06_azzurra_scene2 import scene_plan as source_plan

def title_plan():
    source = source_plan()[0]
    title, separator, _ = source["text"].partition(". ")
    if title != "Le prime anomalie" or not separator:
        raise ValueError("CANONICAL_TITLE_DRIFT")
    spoken = "Le prime anomalìe."
    return {"scene":2,"speaker_id":0,"canonical_title":title,
            "text":spoken,"text_sha256":hashlib.sha256(spoken.encode()).hexdigest(),
            "canonical_scene_sha256":source["text_sha256"],
            "pronunciation_hint":{"canonical":"anomalie","synthesis":"anomalìe"},
            "scope":"TITLE_ONLY","review_state":"HUMAN_LISTENING_PENDING"}
