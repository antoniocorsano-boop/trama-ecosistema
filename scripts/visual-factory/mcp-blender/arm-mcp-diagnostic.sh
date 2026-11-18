#!/usr/bin/env bash
# OCI-01b, bounded ARM diagnostic only. Reuse the existing J07 client/session.
set -euo pipefail
test "$(uname -m)" = aarch64
adapter=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
root="$RUNNER_TEMP/oci01-arm-mcp"
mkdir -p "$root"/{build,deps/wheels,deps/source,work/home,work/runtime,adapter}
chmod 700 "$root/work/runtime"
cd "$root"
# Reuse OCI-01a's exact observed image in the same job; install Python runtime
# from Ubuntu signed repositories, record resulting image and package versions.
base=$(cat "$RUNNER_TEMP/oci01-arm/work/image.txt")
[[ "$base" =~ ^sha256:[0-9a-f]{64}$ ]]
test "$(docker image inspect "$base" --format '{{.Architecture}}')" = arm64
docker tag "$base" vf3d-oci01-arm:parent
cat > build/Dockerfile <<'EOF'
FROM vf3d-oci01-arm:parent
RUN apt-get update -q && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    python3 python3-venv ca-certificates && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /opt/blender && ln -s /usr/bin/blender /opt/blender/blender
EOF
docker build --platform linux/arm64 --tag vf3d-oci01-arm:mcp build
image=$(docker image inspect vf3d-oci01-arm:mcp --format '{{.Id}}')
test "$(docker image inspect "$image" --format '{{.Architecture}}')" = arm64
printf '%s\n' "$image" > work/image.txt
printf '%s\n' "$base" > work/parent-image.txt
grep -v '^pillow==' "$adapter/requirements.lock" | cut -d' ' -f1 > deps/versions.txt
test "$(wc -l < deps/versions.txt)" = 35
# Acquisition only. Wheels cannot execute during pip download (binary-only,
# no dependencies, no builds). No credentials or production inputs mounted.
docker run --rm --pull=never --user "$(id -u):$(id -g)" --cap-drop ALL \
  --security-opt no-new-privileges:true --read-only --cpus 2 --memory 2g \
  --tmpfs /tmp:rw,nosuid,nodev,size=768m,mode=1777 \
  --mount "type=bind,src=$PWD/deps,dst=/deps" "$image" \
  /usr/bin/env -i PATH=/usr/bin:/bin HOME=/tmp PIP_CONFIG_FILE=/dev/null \
  /bin/bash -euc 'python3 -c "import sys; assert sys.version_info[:2]==(3,14)"
    python3 -m venv /tmp/acquire
    /tmp/acquire/bin/python -m pip --isolated --disable-pip-version-check download --no-cache-dir --no-deps \
      --index-url https://pypi.org/simple --only-binary=:all: --dest /deps/wheels -r /deps/versions.txt' \
  > work/arm-wheel-acquisition.log 2>&1 || { cat work/arm-wheel-acquisition.log; exit 1; }
python3 "$adapter/arm-dependency-review.py"
cp deps/requirements.lock work/arm-requirements-observed.lock
# Pinned upstream source, identical to x64 native profile, no package install.
git init -q upstream
git -C upstream -c credential.helper= fetch --depth=1 https://github.com/QwenLM/Qwen-MM-Plugins.git refs/tags/qwen-mm-plugins-blender-v1.2.0
test "$(git -C upstream rev-parse 'FETCH_HEAD^{commit}')" = 33a54695774020e5da2d6b1ed13119d4014f848f
git -C upstream archive FETCH_HEAD src | tar -x -C deps/source
test "$(git hash-object deps/source/src/mcp_framework.py)" = 071fa7b3617fc57bd2a47c3ea7d66971a4e7bf81
vendor=deps/source/src/capabilities/blender/qwen_mm_plugins_blender/vendor/addon.py
test "$(git hash-object "$vendor")" = 77ec1f85083b39030c12e94e188a7c5a70229744
test "$(git hash-object deps/source/src/capabilities/blender/qwen_mm_plugins_blender/tools/get_viewport_screenshot.py)" = 8b04c9bbfe835c0ca0f384c0c5b3f0462d6e3992
printf '%s  %s\n' f8d22dc2c29aed35730c787a321b9d7b79bd6d5ebdd431420585a8a525b463ec "$vendor" | sha256sum --strict --check
cp "$vendor" work/addon.py
cp "$adapter/vendor-smoke.py" work/client.py
cp "$adapter/mcp-client.py" work/mcp-client.py
cp "$adapter/j07_adapter.py" "$adapter/j07-synthetic.py" "$adapter/../j07_session_contract.py" adapter/
# Only explicit diagnostic port differences from x64 session.
python3 - "$adapter" <<'PY'
import pathlib,sys
src=pathlib.Path(sys.argv[1])
def adapt(source,target,old,new,count):
    s=source.read_text()
    assert s.count(old)==count,(source,old,s.count(old))
    target.write_text(s.replace(old,new))
adapt(src/"blender-start.py",pathlib.Path("work/start.py"),"(4, 2, 23)","(5, 0, 1)",1)
adapt(src/"container-session.sh",pathlib.Path("work/run.sh"),"--threads 4","--threads 2",2)
p=pathlib.Path("adapter/j07-synthetic.py")
adapt(p,p,'"cpu":4','"cpu":2',1)
PY
# Inventory exact Ubuntu source versions and OSV; diagnostic only, not approval.
docker run --rm --pull=never --network none --read-only --user 65534:65534 \
  --cap-drop ALL --security-opt no-new-privileges:true "$image" \
  dpkg-query -W -f='${binary:Package}\t${Version}\t${source:Package}\t${source:Version}\t${db:Status-Abbrev}\n' > work/packages.tsv
python3 - <<'PY'
import json,pathlib,urllib.request
root=pathlib.Path("work")
sources=set()
for line in (root/"packages.tsv").read_text().splitlines():
    b,v,s,sv,status=line.split("\t")
    if status.startswith("ii"):
        assert s and sv
        sources.add((s,sv))
assert sources and any(n=="blender" for n,v in sources)
findings=[]
entries=sorted(sources)
for i in range(0,len(entries),50):
    batch=entries[i:i+50]
    req=urllib.request.Request("https://api.osv.dev/v1/querybatch",data=json.dumps({"queries":[{"package":{"name":n,"ecosystem":"Ubuntu:26.04:LTS"},"version":v} for n,v in batch]}).encode(),headers={"Content-Type":"application/json"})
    with urllib.request.urlopen(req,timeout=45) as r: rows=json.load(r)["results"]
    assert len(rows)==len(batch)
    for (n,v),row in zip(batch,rows):
        assert isinstance(row,dict) and set(row)<={"vulns"}
        findings.extend({"source":n,"version":v,"id":x["id"]} for x in row.get("vulns",[]))
(root/"arm-ubuntu-osv.json").write_text(json.dumps({"scope":"Ubuntu:26.04:LTS; feed coverage not independently established","sourcePackagesChecked":len(entries),"findings":findings,"productionAuthorized":False},indent=2))
print("ARM_UBUNTU_OSV_REVIEW_REQUIRED",len(entries),len(findings))
PY
name="vf3d-oci01-mcp-${GITHUB_RUN_ID:?}-${GITHUB_RUN_ATTEMPT:?}"
trap 'docker rm -f "$name" >/dev/null 2>&1 || true' EXIT
docker create --name "$name" --network none --read-only --user "$(id -u):$(id -g)" \
  --cap-drop ALL --security-opt no-new-privileges:true --cpus 2 --memory 6g --pids-limit 256 \
  --tmpfs /tmp:rw,nosuid,nodev,size=512m,mode=1777 --shm-size 256m \
  --mount "type=bind,src=$PWD/work,dst=/work" \
  --mount "type=bind,src=$PWD/deps,dst=/deps,readonly" \
  --mount "type=bind,src=$PWD/adapter,dst=/adapter,readonly" \
  --workdir /work "$image" \
  /usr/bin/env -i PATH=/usr/bin:/bin HOME=/work/home XDG_RUNTIME_DIR=/work/runtime \
  LIBGL_ALWAYS_SOFTWARE=1 /bin/bash /work/run.sh
docker inspect "$name" --format '{{json .HostConfig}}' > work/isolation.json
python3 - <<'PY'
import json,pathlib
h=json.loads(pathlib.Path("work/isolation.json").read_text())
assert h["NetworkMode"]=="none" and h["ReadonlyRootfs"] and not h["Privileged"]
assert h["NanoCpus"]==2*10**9 and h["Memory"]==6*1024**3
assert "ALL" in h["CapDrop"] and any(x.startswith("no-new-privileges") for x in h["SecurityOpt"])
assert not h["PortBindings"] and not h["Devices"]
PY
timeout 430s docker start -a "$name" > work/container.log 2>&1 || {
    tail -100 work/container.log; tail -60 work/bridge.log 2>/dev/null || true; exit 1;
}
test "$(docker inspect "$name" --format '{{.State.ExitCode}}')" = 0
python3 - <<'PY'
import hashlib,json,pathlib
r=pathlib.Path("work")
v=json.loads((r/"transport-evidence.json").read_text())
m=json.loads((r/"mcp-evidence.json").read_text())
j=json.loads((r/"j07-lifecycle.json").read_text())
assert v["isolationSmokePassed"] and v["status"]=="VENDOR_TCP_BRIDGE_PASS"
assert m["status"]=="MCP_IMAGE_LOOP_PASS" and m["fullMcpClientQualified"] and not m["agentControlQualified"]
assert j["status"]=="SYNTHETIC_LIFECYCLE_PASS" and j["rejectedRequests"]==4
assert j["actualRenderTransportVerified"] and not j["productionAdmission"] and j["costStatus"]=="UNKNOWN"
assert not any(j["authority"].values())
assert json.loads((r/"j07-reopen.json").read_text())["status"]=="PASS"
for name,meta in [("j07-base.blend",j["base"]),("j07-candidate.blend",j["candidate"]),("j07-before.png",j["renders"]["before"]),("j07-after.png",j["renders"]["after"]),("mcp-j07-before.png",j["renders"]["before"]),("mcp-j07-after.png",j["renders"]["after"])]:
    raw=(r/name).read_bytes()
    assert len(raw)==meta["bytes"] and hashlib.sha256(raw).hexdigest()==meta["sha256"]
f=json.loads((r/"j07-contract-fixture.json").read_text())
assert f["session"]["limits"]["cpu"]==2 and f["receipt"]["status"]=="STOPPED"
print("OCI01B_ARM_J07_DIAGNOSTIC_PASS",json.dumps({"toolCount":m["toolCount"],"rejectedRequests":j["rejectedRequests"],"elapsedSeconds":j["elapsedSeconds"],"productionAuthorized":False}))
PY
