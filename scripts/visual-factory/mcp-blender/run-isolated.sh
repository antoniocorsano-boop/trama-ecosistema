#!/usr/bin/env bash
set -euo pipefail
adapter_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
cd "$RUNNER_TEMP/vf3d-l0"
mkdir -p bridge/home bridge/runtime
chmod 700 bridge/runtime
# Only the audited vendor file, not the full Qwen package or autolaunch.
curl --fail --silent --show-error --location --proto '=https' --proto-redir '=https' --connect-timeout 15 --max-time 60 --output bridge/addon.py 'https://raw.githubusercontent.com/QwenLM/Qwen-MM-Plugins/qwen-mm-plugins-blender-v1.2.0/src/capabilities/blender/qwen_mm_plugins_blender/vendor/addon.py'
test "$(git hash-object bridge/addon.py)" = 77ec1f85083b39030c12e94e188a7c5a70229744
printf '%s  %s\n' f8d22dc2c29aed35730c787a321b9d7b79bd6d5ebdd431420585a8a525b463ec bridge/addon.py | sha256sum --strict --check
# Docker daemon already supplied by the standard runner; no new provider.
command -v docker
docker info --format '{{.ServerVersion}}'
# Pin the base digest observed in run 44173983086.
base=ubuntu@sha256:73b999393d07f2bf65a40373778a44dc9a6d54ad7718d29247d8ff9413c4d6a8
docker pull "$base"
printf '%s\n' "$base" > bridge/base-image.txt
mkdir -p container-build
cp "$adapter_dir/Dockerfile" "container-build/Dockerfile"
docker build --build-arg "LAB_UID=$(id -u)" --build-arg "LAB_GID=$(id -g)" --tag vf3d-local-probe:single --file container-build/Dockerfile container-build
docker image inspect vf3d-local-probe:single --format '{{.Id}}' > bridge/probe-image.txt
cp "$adapter_dir/blender-start.py" "bridge/start.py"
cp "$adapter_dir/vendor-smoke.py" "bridge/client.py"
cp "$adapter_dir/mcp-client.py" "bridge/mcp-client.py"
cp "$adapter_dir/container-session.sh" "bridge/run.sh"
mkdir -p adapter
cp "$adapter_dir/j07_adapter.py" "$adapter_dir/j07-synthetic.py" "$adapter_dir/../j07_session_contract.py" adapter/
# No host network, ports, credentials, GPU devices, socket or privileged container.
# Fail closed rather than running outside the boundary.
name="vf3d-isolated-${GITHUB_RUN_ID:?}-${GITHUB_RUN_ATTEMPT:?}"
trap 'docker rm -f "$name" >/dev/null 2>&1 || true' EXIT
docker create --name "$name" --network none --read-only --user "$(id -u):$(id -g)" \
  --cap-drop ALL --security-opt no-new-privileges:true --cpus 4 --memory 6g --pids-limit 256 \
  --tmpfs /tmp:rw,nosuid,nodev,size=512m,mode=1777 --shm-size 256m \
  --mount "type=bind,src=$PWD/blender-4.2.23-linux-x64,dst=/opt/blender,readonly" \
  --mount "type=bind,src=$PWD/bridge,dst=/work" \
  --mount "type=bind,src=$PWD/mcp-input,dst=/deps,readonly" \
  --mount "type=bind,src=$PWD/adapter,dst=/adapter,readonly" \
  --workdir /work vf3d-local-probe:single \
  /usr/bin/env -i PATH=/usr/bin:/bin HOME=/work/home XDG_RUNTIME_DIR=/work/runtime LIBGL_ALWAYS_SOFTWARE=1 \
  /bin/bash /work/run.sh
docker inspect "$name" --format '{{json .HostConfig}}' > container-build/host-config.json
python3 - <<'PY'
import json, pathlib
h=json.loads(pathlib.Path("container-build/host-config.json").read_text())
assert h["NetworkMode"]=="none" and h["ReadonlyRootfs"] and not h["Privileged"]
assert "ALL" in h["CapDrop"] and not h["PortBindings"] and not h["Devices"]
assert any(x.startswith("no-new-privileges") for x in h["SecurityOpt"])
assert h["Memory"]==6*1024**3 and h["NanoCpus"]==4*10**9
pathlib.Path("bridge/isolation-config.json").write_text(json.dumps({
    "networkMode":h["NetworkMode"],"readonlyRootfs":h["ReadonlyRootfs"],
    "privileged":h["Privileged"],"capDrop":h["CapDrop"],
    "securityOpt":h["SecurityOpt"],"memory":h["Memory"],"nanoCpus":h["NanoCpus"]
},indent=2))
PY
# Detached start and bounded state polling: distinguish Docker launch from child startup.
if ! timeout 25s docker start "$name" > bridge/docker-start.log 2>&1; then
  cat bridge/docker-start.log
  docker inspect "$name" --format '{{json .State}}' > bridge/docker-state.json || true
  exit 11
fi
echo "DOCKER_START_ACCEPTED"
running=true
for i in $(seq 1 215); do
  running="$(docker inspect "$name" --format '{{.State.Running}}')"
  [[ "$running" = true ]] || break
  sleep 2
done
docker inspect "$name" --format '{{json .State}}' > bridge/docker-state.json
docker logs "$name" > bridge/docker.log 2>&1 || true
cat bridge/docker-state.json
tail -100 bridge/docker.log
if [[ "$running" = true ]]; then
  echo "STOP_CONTAINER_TIMEOUT"
  exit 12
fi
test "$(docker inspect "$name" --format '{{.State.ExitCode}}')" = 0
python3 - <<'PY'
import json, pathlib
e=json.loads(pathlib.Path("bridge/transport-evidence.json").read_text())
assert e["status"]=="VENDOR_TCP_BRIDGE_PASS" and e["isolationSmokePassed"]
assert not e["fullMcpClientQualified"] and not e["agentControlQualified"]
m=json.loads(pathlib.Path("bridge/mcp-evidence.json").read_text())
assert m["status"]=="MCP_IMAGE_LOOP_PASS" and m["fullMcpClientQualified"] and not m["agentControlQualified"]
import hashlib
root=pathlib.Path("bridge")
j=json.loads((root/"j07-lifecycle.json").read_text())
assert j["status"]=="SYNTHETIC_LIFECYCLE_PASS" and j["rejectedRequests"]==4
assert j["actualRenderTransportVerified"] and not j["productionAdmission"]
assert j["costStatus"]=="UNKNOWN" and not any(j["authority"].values())
assert json.loads((root/"j07-reopen.json").read_text())["status"]=="PASS"
for name,meta in [("j07-base.blend",j["base"]),("j07-candidate.blend",j["candidate"]),("j07-before.png",j["renders"]["before"]),("j07-after.png",j["renders"]["after"]),("mcp-j07-before.png",j["renders"]["before"]),("mcp-j07-after.png",j["renders"]["after"])]:
    data=(root/name).read_bytes()
    assert len(data)==meta["bytes"] and hashlib.sha256(data).hexdigest()==meta["sha256"]
assert json.loads((root/"j07-contract-fixture.json").read_text())["receipt"]["status"]=="STOPPED"
PY
