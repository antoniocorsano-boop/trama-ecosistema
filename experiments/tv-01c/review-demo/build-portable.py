#!/usr/bin/env python3
"""Build a single offline demo HTML from the exact reviewed source files."""
import argparse
import base64
import hashlib
from pathlib import Path

root=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument("output",type=Path)
args=parser.parse_args()
html=(root/"index.html").read_text(encoding="utf-8")
guard=(root/"review-guard.mjs").read_text(encoding="utf-8").replace("export const ","const ").replace("export function ","function ")
app=(root/"demo.mjs").read_text(encoding="utf-8")
import_line='import {makeReview} from "./review-guard.mjs";'
assert app.count(import_line)==1
script=guard+"\n"+app.replace(import_line,"",1)
assert "</script" not in script.lower()
digest=base64.b64encode(hashlib.sha256(script.encode("utf-8")).digest()).decode("ascii")
old='<script type="module" src="./demo.mjs"></script>'
assert html.count(old)==1 and html.count("script-src 'self';")==1
html=html.replace("script-src 'self';",f"script-src 'sha256-{digest}';",1)
html=html.replace(old,"<script>"+script+"</script>",1)
args.output.parent.mkdir(parents=True,exist_ok=True)
args.output.write_text(html,encoding="utf-8")
print(f"Portable demo written: {args.output}")
