"""Inventory local editorial files. No runtime execution or publication authority."""
import argparse
import hashlib
import json
from pathlib import Path

MAX_FILES = 200
MAX_BYTES = 64 * 1024 * 1024
ALLOWED = {".html",".css",".js",".mjs",".json",".md",".txt",".pdf",".docx",".png",".jpg",".jpeg",".webp",".svg",".wav",".mp3",".mp4",".webm",".vtt",".srt"}
def inventory(root):
    root = Path(root)
    if root.is_symlink() or not root.is_dir():
        raise ValueError("INVALID_ROOT")
    root = root.resolve()
    rows = []
    total = 0
    for p in sorted(root.rglob("*")):
        if p.is_symlink():
            raise ValueError("SYMLINK")
        if p.is_dir():
            continue
        relative = p.relative_to(root)
        if not p.is_file() or any(x.startswith(".") for x in relative.parts) or p.suffix.lower() not in ALLOWED:
            raise ValueError("UNSUPPORTED_FILE")
        size = p.stat().st_size
        total += size
        if len(rows) >= MAX_FILES or total > MAX_BYTES:
            raise ValueError("LOCAL_PREFLIGHT_LIMIT")
        if not size:
            raise ValueError("EMPTY_FILE")
        digest = hashlib.sha256()
        with p.open("rb") as f:
            for block in iter(lambda: f.read(1024 * 1024), b""):
                digest.update(block)
        rows.append({"path":relative.as_posix(),"bytes":size,"sha256":digest.hexdigest()})
    if not rows:
        raise ValueError("EMPTY_PRODUCT")
    return {"status":"INVENTORY_ONLY","file_count":len(rows),"total_bytes":total,
            "files":rows,"activity_package_validated":False,"rights_verified":False,
            "privacy_verified":False,"runtime_tested":False,"publication_authorized":False}
def main():
    p = argparse.ArgumentParser()
    p.add_argument("root",type=Path)
    p.add_argument("--output",type=Path,required=True)
    args = p.parse_args()
    root = args.root.resolve()
    output = args.output.resolve()
    if output == root or root in output.parents:
        raise ValueError("REPORT_INSIDE_PRODUCT")
    result = inventory(args.root)
    with output.open("x",encoding="utf-8") as f:
        json.dump(result,f,ensure_ascii=False,indent=2)
        f.write("\n")
    print("INVENTORY_ONLY",result["file_count"],result["total_bytes"])
if __name__=="__main__":
    main()
