"""Validate prepared score against immutable canonical fixture; no synthesis."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parent
def validate(score,fixture):
    if score["contract"]!="trama.narrative-score/v0.1" or score["sourceSha"]!=fixture["source_sha"] or score["sourceEntrypointSha256"]!=fixture["entrypoint_sha256"]:
        raise ValueError("SOURCE_DRIFT")
    if score["audioApproved"] is not False or score["published"] is not False or score["computeMode"]!="FREE_ONLY":
        raise ValueError("UNAUTHORIZED_STATUS")
    if any(score["voice"][x] is not False for x in ("personalSamples","cloning","globalRegeneration")):
        raise ValueError("VOICE_POLICY")
    if [s["scene"] for s in score["scenes"]]!=[1,2,3,4,5]:
        raise ValueError("SCENE_ORDER")
    lexicon={x["word"] for x in score["lexicon"]}
    ids=set()
    for sc,canonical in zip(score["scenes"],fixture["scenes"]):
        n=sc["scene"]
        if sc["title"]!=canonical["title"] or sc["titleSpoken"] is not (n==1):
            raise ValueError("TITLE_SCOPE")
        expected=(canonical["title"]+". " if n==1 else "")+canonical["text"]
        if " ".join(u["canonicalText"] for u in sc["units"])!=expected:
            raise ValueError("CANONICAL_TEXT_DRIFT")
        for u in sc["units"]:
            if u["id"] in ids or u["renderStatus"]!="NOT_REQUESTED" or u["approval"]!="PENDING":
                raise ValueError("UNIT_STATE")
            ids.add(u["id"])
            if type(u["pauseAfterMs"]) is not int or not 0<=u["pauseAfterMs"]<=2000:
                raise ValueError("PAUSE_TARGET")
            for x in u["internalPauses"]:
                if type(x["targetMs"]) is not int or not 0<=x["targetMs"]<=2000:
                    raise ValueError("PAUSE_TARGET")
            for key in ("emphasis","pronunciationWatch","connectedGroups"):
                if any(not x or x not in u["canonicalText"] for x in u[key]):
                    raise ValueError("UNBOUND_ANNOTATION")
            if any(x["after"] not in u["canonicalText"] for x in u["internalPauses"]):
                raise ValueError("UNBOUND_PAUSE")
            if not set(u["pronunciationWatch"])<=lexicon:
                raise ValueError("MISSING_LEXICON")
    return len(ids)
def load():
    return (json.loads((ROOT/"missione118_narrative_score.json").read_text(encoding="utf-8")),
            json.loads((ROOT/"tests/fixtures/missione118_v5_continuous.json").read_text(encoding="utf-8")))
if __name__=="__main__":
    print("Prepared narrative score valid; units:",validate(*load()))
