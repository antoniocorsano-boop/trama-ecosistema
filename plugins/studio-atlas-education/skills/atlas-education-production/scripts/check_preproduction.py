"""Structural preproduction gate; cannot authenticate human approval."""
import argparse
import hashlib
import json
from pathlib import Path

FAMILIES = {"avventura","microcorso","laboratorio","videolezione","racconto-fumetto","sfida"}
ROLES = {"brief","foundations","screenplay","storyboard","art-direction","teacher-plan"}
def require(condition, code):
    if not condition:
        raise ValueError(code)
def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()
def check(root, record):
    root = Path(root)
    require(root.is_dir() and not root.is_symlink(), "INVALID_DESIGN_ROOT")
    root = root.resolve()
    require(isinstance(record,dict) and record.get("schema")=="atlas-preproduction/v1", "INVALID_RECORD")
    family=record.get("family")
    require(isinstance(family,str) and family in FAMILIES,"INVALID_FAMILY")
    require(isinstance(record.get("version"),str) and bool(record["version"].strip()),"MISSING_VERSION")
    narrative=record.get("narrative")
    require(type(narrative) is bool,"MISSING_NARRATIVE_DECISION")
    require(narrative or family not in {"avventura","racconto-fumetto"},"NARRATIVE_REQUIRED")
    if not narrative:
        require(isinstance(record.get("nonNarrativeRationale"),str) and bool(record["nonNarrativeRationale"].strip()),"MISSING_RATIONALE")
    roles=ROLES | ({"story","world"} if narrative else set())
    artifacts=record.get("artifacts")
    require(isinstance(artifacts,dict) and set(artifacts)==roles,"MISSING_DESIGN_ARTIFACTS")
    used=set()
    for role,item in artifacts.items():
        require(isinstance(item,dict) and isinstance(item.get("path"),str),"INVALID_ARTIFACT")
        rel=Path(item["path"])
        require(not rel.is_absolute() and ".." not in rel.parts and bool(rel.parts),"UNSAFE_ARTIFACT_PATH")
        path=root
        for part in rel.parts:
            path=path/part
            require(not path.is_symlink(),"SYMLINK")
        require(path.is_file() and path.stat().st_size>0 and path.resolve().is_relative_to(root),"MISSING_ARTIFACT")
        require(path.resolve() not in used,"DUPLICATE_ARTIFACT")
        used.add(path.resolve())
        require(digest(path)==item.get("sha256"),"DESIGN_HASH_MISMATCH")
    # Hash binds the full design declaration, including family, version, rationale and artifact roles.
    design={k:v for k,v in record.items() if k!="reviews"}
    binding=hashlib.sha256(json.dumps(design,sort_keys=True,ensure_ascii=False,separators=(",",":")).encode()).hexdigest()
    gates={"experience"} | ({"story","world"} if narrative else set())
    reviews=record.get("reviews")
    require(isinstance(reviews,dict) and set(reviews)==gates,"MISSING_REVIEW")
    for gate,r in reviews.items():
        require(isinstance(r,dict) and r.get("decision")=="PASS","REVIEW_NOT_PASS")
        require(r.get("designSha256")==binding,"STALE_REVIEW")
        for key in ("reviewer","date","evidence"):
            require(isinstance(r.get(key),str) and bool(r[key].strip()),"MISSING_REVIEW_EVIDENCE")
        require(r.get("authority")=="HUMAN_DECLARED","HUMAN_REVIEW_REQUIRED")
    return {"status":"RECORD_STRUCTURALLY_COMPLETE","designSha256":binding,
            "human_authority_verified":False,"production_authorized":False,
            "quality_verified":False,"publication_authorized":False}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("design_root",type=Path)
    p.add_argument("record",type=Path)
    a=p.parse_args()
    try:
        print(json.dumps(check(a.design_root,json.loads(a.record.read_text(encoding="utf-8"))),ensure_ascii=False))
    except (ValueError,OSError,TypeError) as exc:
        p.exit(2,f"PREPRODUCTION_BLOCKED: {exc}\n")
if __name__=="__main__":
    main()
