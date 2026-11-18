#!/usr/bin/env bash
set -euo pipefail
cd "$RUNNER_TEMP/vf3d-l0"
mkdir -p mcp-input/wheels mcp-input/source
cp "$GITHUB_WORKSPACE/scripts/visual-factory/mcp-blender/requirements.lock" mcp-input/upstream-requirements.lock
# Native Blender image transport returns PNG bytes; Pillow is not installed in this source-only profile.
grep -v '^pillow==' mcp-input/upstream-requirements.lock > mcp-input/requirements.lock
test "$(wc -l < mcp-input/upstream-requirements.lock)" = 36
test "$(wc -l < mcp-input/requirements.lock)" = 35
python3 - <<'PY'
import datetime, json, pathlib, re, urllib.request
root=pathlib.Path("mcp-input")
entries=[]
for line in (root/"requirements.lock").read_text().splitlines():
    m=re.fullmatch(r"([a-z0-9-]+)==([^ ]+) --hash=sha256:([0-9a-f]{64})",line)
    assert m, line
    name, version, digest=m.groups()
    entries.append({"name":name,"version":version,"sha256":digest})
assert len(entries)==35 and len({x["name"] for x in entries})==35
assert all(x["name"]!="pillow" for x in entries)
queries=[{"package":{"name":x["name"],"ecosystem":"PyPI"},"version":x["version"]} for x in entries]
req=urllib.request.Request("https://api.osv.dev/v1/querybatch",
    data=json.dumps({"queries":queries}).encode(),
    headers={"Content-Type":"application/json"},method="POST")
with urllib.request.urlopen(req,timeout=45) as response:
    results=json.load(response)["results"]
assert len(results)==len(entries) and all(isinstance(x,dict) for x in results)
findings=[]
for item,result in zip(entries,results):
    assert set(result)<= {"vulns"}
    for v in result.get("vulns",[]):
        findings.append({"package":item["name"],"version":item["version"],"id":v["id"]})
evidence={"status":"PASS_NO_OSV_FINDINGS" if not findings else "STOP_KNOWN_ADVISORIES",
          "checkedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),
          "source":"https://api.osv.dev/v1/querybatch","packages":entries,"findings":findings,
          "excludedFromNativeBlenderProfile":["pillow"],
          "scope":"PyPI package advisories only; not a full security certification"}
(root/"audit.json").write_text(json.dumps(evidence,indent=2))
print(json.dumps({"status":evidence["status"],"checked":len(entries),"findings":findings},indent=2))
if findings: raise SystemExit("STOP: advisory review required before execution")
PY
env -i PATH=/usr/bin:/bin HOME="$PWD" PIP_CONFIG_FILE=/dev/null \
  /usr/bin/python3 -m pip --isolated --disable-pip-version-check download --no-cache-dir \
  --index-url https://pypi.org/simple --only-binary=:all: --require-hashes \
  --dest mcp-input/wheels -r mcp-input/requirements.lock
git init -q mcp-upstream
git -C mcp-upstream -c credential.helper= fetch --depth=1 https://github.com/QwenLM/Qwen-MM-Plugins.git refs/tags/qwen-mm-plugins-blender-v1.2.0
test "$(git -C mcp-upstream rev-parse 'FETCH_HEAD^{commit}')" = 33a54695774020e5da2d6b1ed13119d4014f848f
git -C mcp-upstream archive FETCH_HEAD src | tar -x -C mcp-input/source
test "$(git hash-object mcp-input/source/src/mcp_framework.py)" = 071fa7b3617fc57bd2a47c3ea7d66971a4e7bf81
test "$(git hash-object mcp-input/source/src/capabilities/blender/qwen_mm_plugins_blender/vendor/addon.py)" = 77ec1f85083b39030c12e94e188a7c5a70229744
test "$(git hash-object mcp-input/source/src/capabilities/blender/qwen_mm_plugins_blender/tools/get_viewport_screenshot.py)" = 8b04c9bbfe835c0ca0f384c0c5b3f0462d6e3992
python3 - <<'PY'
import ast, json, pathlib
src=pathlib.Path("mcp-input/source/src")
files=list((src/"capabilities/blender/qwen_mm_plugins_blender").rglob("*.py"))
files += [src/"mcp_framework.py",*(src/"shared"/n for n in ("__init__.py","env.py","content.py","native_mode.py","applaunch.py","syscmd.py"))]
hits=[]
for p in files:
    for n in ast.walk(ast.parse(p.read_text())):
        names=[a.name for a in n.names] if isinstance(n,ast.Import) else [n.module or ""] if isinstance(n,ast.ImportFrom) else []
        if any(x.split(".")[0] in ("PIL","pillow") for x in names):
            hits.append(str(p))
evidence={"profile":"native Blender source-only","sourceFilesChecked":len(files),"directPillowImports":hits,
          "scope":"static import check; runtime proof required"}
pathlib.Path("mcp-input/profile-evidence.json").write_text(json.dumps(evidence,indent=2))
print(json.dumps(evidence,indent=2))
assert not hits, hits
PY
