#!/usr/bin/env bash
# Diagnostic only. No Oracle credentials, no provider provisioning, no artistic inputs.
set -euo pipefail
test "$(uname -m)" = aarch64
adapter=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
root="$RUNNER_TEMP/oci01-arm"
mkdir -p "$root/work/home" "$root/work/runtime" "$root/build"
chmod 700 "$root/work/runtime"
cd "$root"
docker pull --platform linux/arm64 ubuntu:26.04
base=$(docker image inspect ubuntu:26.04 --format '{{index .RepoDigests 0}}')
[[ "$base" =~ ^ubuntu@sha256:[0-9a-f]{64}$ ]]
test "$(docker image inspect "$base" --format '{{.Architecture}}')" = arm64
printf '%s\n' "$base" > work/base-image.txt
cat > build/Dockerfile <<'EOF'
ARG BASE
FROM ${BASE}
ARG LAB_UID
ARG LAB_GID
RUN apt-get update -q && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    blender xvfb xauth x11-utils libegl1 libegl-mesa0 libgl1-mesa-dri libglx-mesa0 \
    && DEBIAN_FRONTEND=noninteractive apt-get -y --with-new-pkgs upgrade \
    && rm -rf /var/lib/apt/lists/*
RUN (getent group "$LAB_GID" >/dev/null || groupadd -g "$LAB_GID" vf3d) \
    && (getent passwd "$LAB_UID" >/dev/null || useradd -M -u "$LAB_UID" -g "$LAB_GID" -d /work/home vf3d)
EOF
docker build --platform linux/arm64 --build-arg "BASE=$base" \
  --build-arg "LAB_UID=$(id -u)" --build-arg "LAB_GID=$(id -g)" -t vf3d-oci01-arm:diagnostic build
image=$(docker image inspect vf3d-oci01-arm:diagnostic --format '{{.Id}}')
test "$(docker image inspect "$image" --format '{{.Architecture}}')" = arm64
printf '%s\n' "$image" > work/image.txt
cat > build/session.sh <<'SH'
set -euo pipefail
test "$(uname -m)" = aarch64
test "$(id -u)" != 0
test ! -e /var/run/docker.sock
test "$(ls /sys/class/net)" = lo
grep -q '^CapEff:[[:space:]]*0000000000000000$' /proc/self/status
grep -q '^NoNewPrivs:[[:space:]]*1$' /proc/self/status
dpkg-query -W -f='${binary:Package}\t${Version}\t${source:Package}\t${source:Version}\n' > /work/packages.tsv
blender --version > /work/blender-version.txt
grep -q '^Blender 5\.0\.1' /work/blender-version.txt
timeout 180s xvfb-run -a -s "-screen 0 1280x720x24 -nolisten tcp" \
  blender --factory-startup --disable-autoexec --threads 2 --python-exit-code 1 \
  --python /adapter/arm-synthetic.py > /work/render.log 2>&1
grep -q ARM_GUI_CPU_RENDER_PASS /work/arm-evidence.json
timeout 45s blender --background --factory-startup --disable-autoexec --threads 2 \
  --python-exit-code 1 /work/arm-candidate.blend \
  --python-expr 'import bpy, math, pathlib, json; o=bpy.data.objects["Cube"]; assert len(o.data.vertices)==8 and len(o.data.polygons)==6 and math.isclose(o.rotation_euler.z,.8,abs_tol=1e-5) and math.isclose(o.scale.x,1.4,abs_tol=1e-5); pathlib.Path("/work/reopen.json").write_text(json.dumps({"status":"PASS","vertices":8,"faces":6}))' \
  > /work/reopen.log 2>&1
SH
cp "$adapter/arm-synthetic.py" build/arm-synthetic.py
name="vf3d-oci01-${GITHUB_RUN_ID:?}-${GITHUB_RUN_ATTEMPT:?}"
trap 'docker rm -f "$name" >/dev/null 2>&1 || true' EXIT
docker create --name "$name" --network none --read-only --user "$(id -u):$(id -g)" \
  --cap-drop ALL --security-opt no-new-privileges:true --cpus 2 --memory 6g --pids-limit 256 \
  --tmpfs /tmp:rw,nosuid,nodev,size=512m,mode=1777 --shm-size 256m \
  --mount "type=bind,src=$PWD/build,dst=/adapter,readonly" \
  --mount "type=bind,src=$PWD/work,dst=/work" --workdir /work "$image" \
  /usr/bin/env -i PATH=/usr/bin:/bin HOME=/work/home XDG_RUNTIME_DIR=/work/runtime \
  LIBGL_ALWAYS_SOFTWARE=1 /bin/bash /adapter/session.sh
docker inspect "$name" --format '{{json .HostConfig}}' > work/isolation.json
python3 - <<'PY'
import json,pathlib
h=json.loads(pathlib.Path("work/isolation.json").read_text())
assert h["NetworkMode"]=="none" and h["ReadonlyRootfs"] and not h["Privileged"]
assert h["NanoCpus"]==2*10**9 and h["Memory"]==6*1024**3
assert "ALL" in h["CapDrop"] and any(x.startswith("no-new-privileges") for x in h["SecurityOpt"])
assert not h["PortBindings"] and not h["Devices"]
PY
timeout 250s docker start -a "$name" > work/container.log 2>&1 || {
  cat work/container.log; tail -60 work/render.log 2>/dev/null || true; exit 1;
}
test "$(docker inspect "$name" --format '{{.State.ExitCode}}')" = 0
python3 - <<'PY'
import hashlib,json,pathlib
r=pathlib.Path("work")
e=json.loads((r/"arm-evidence.json").read_text())
assert e["status"]=="ARM_GUI_CPU_RENDER_PASS" and e["arch"]=="aarch64" and not e["background"]
assert len(e["stages"])==2 and all(s["pid"]==e["pid"] for s in e["stages"])
assert e["stages"][0]["sha256"]!=e["stages"][1]["sha256"]
for f,m in [(s["name"]+".png",s) for s in e["stages"]]+[("arm-candidate.blend",e["master"])]:
    raw=(r/f).read_bytes()
    assert len(raw)==m["bytes"] and hashlib.sha256(raw).hexdigest()==m["sha256"]
assert json.loads((r/"reopen.json").read_text())["status"]=="PASS"
assert not any(e[k] for k in ("oracleInstanceVerified","fullMcpClientQualified","productionAuthorized","publicationAuthorized"))
print(json.dumps(e,indent=2))
PY
