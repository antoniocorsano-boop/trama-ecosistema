#!/usr/bin/env bash
set -euo pipefail
stage() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a /work/stages.log; }
xpid=
bpid=
cleanup() {
  if [[ -n "$bpid" ]]; then kill "$bpid" 2>/dev/null || true; fi
  if [[ -n "$xpid" ]]; then kill "$xpid" 2>/dev/null || true; fi
}
trap cleanup EXIT
stage D1_CONTAINER_STARTED
id
test -w /work
test -w /tmp
test -w "$HOME"
getent passwd "$(id -u)"
stage D1_CONTAINER_PASS
stage D2_DISPLAY_START
export DISPLAY=:99
export XAUTHORITY=/tmp/vf3d.Xauthority
touch "$XAUTHORITY"
chmod 600 "$XAUTHORITY"
cookie="$(python3 -c 'import secrets; print(secrets.token_hex(16))')"
timeout 5s xauth -f "$XAUTHORITY" add "$DISPLAY" . "$cookie"
Xvfb "$DISPLAY" -screen 0 1280x720x24 -nolisten tcp -auth "$XAUTHORITY" > /work/xvfb.log 2>&1 &
xpid=$!
ready=0
for i in $(seq 1 15); do
  kill -0 "$xpid" || { stage D2_XVFB_EXITED; cat /work/xvfb.log; exit 21; }
  if timeout 2s xdpyinfo > /work/xdpyinfo.log 2>&1; then ready=1; break; fi
  sleep 1
done
[[ "$ready" = 1 ]] || { stage D2_DISPLAY_TIMEOUT; cat /work/xvfb.log; exit 22; }
stage D2_DISPLAY_PASS
stage D3_BLENDER_START
/opt/blender/blender --factory-startup --disable-autoexec --threads 4 --python-exit-code 1 --python /work/start.py > /work/bridge.log 2>&1 &
bpid=$!
for i in $(seq 1 35); do
  kill -0 "$bpid" || { stage D3_BLENDER_EXITED; tail -80 /work/bridge.log; exit 31; }
  [[ ! -f /work/startup-error.txt ]] || { stage D3_STARTUP_ERROR; cat /work/startup-error.txt; exit 32; }
  [[ ! -f /work/blender-ready.txt ]] || break
  sleep 1
done
[[ -f /work/blender-ready.txt ]] || { stage D3_BLENDER_TIMEOUT; tail -80 /work/bridge.log; exit 33; }
stage D3_BLENDER_PASS
stage D4_VENDOR_START
for i in $(seq 1 25); do
  kill -0 "$bpid" || { stage D4_BLENDER_EXITED; exit 41; }
  [[ ! -f /work/startup-error.txt ]] || { stage D4_ADDON_ERROR; cat /work/startup-error.txt; exit 42; }
  [[ ! -f /work/bridge-ready.txt ]] || break
  sleep 1
done
[[ -f /work/bridge-ready.txt ]] || { stage D4_ADDON_TIMEOUT; exit 43; }
stage D4_VENDOR_READY
timeout 75s /usr/bin/python3 -u /work/client.py > /work/client.log 2>&1 || { stage D4_CLIENT_FAILED; cat /work/client.log; exit 44; }
cat /work/client.log
stage D4_TRANSPORT_PASS
stage D5_MCP_START
/usr/bin/python3 -m venv /work/mcp-venv
/work/mcp-venv/bin/python -m pip --isolated --disable-pip-version-check install --no-index --find-links /deps/wheels --only-binary=:all: --require-hashes -r /deps/requirements.lock
/work/mcp-venv/bin/python -m pip check
timeout 95s /work/mcp-venv/bin/python -u /work/mcp-client.py > /work/mcp-client.log 2>&1 || { stage D5_MCP_FAILED; cat /work/mcp-client.log; exit 51; }
cat /work/mcp-client.log
stage D5_MCP_IMAGE_LOOP_PASS

stage D6_J07_LIFECYCLE_START
test "$(stat -c %a /adapter)" != ""
/usr/bin/python3 -c 'import os; assert os.statvfs("/adapter").f_flag & os.ST_RDONLY'
timeout 135s env PYTHONDONTWRITEBYTECODE=1 /work/mcp-venv/bin/python -u /adapter/j07-synthetic.py > /work/j07-lifecycle.log 2>&1 || { stage D6_J07_FAILED; cat /work/j07-lifecycle.log; tail -80 /work/bridge.log; exit 61; }
cat /work/j07-lifecycle.log
stage D6_J07_LIFECYCLE_PASS
kill "$bpid" 2>/dev/null || true
wait "$bpid" 2>/dev/null || true
bpid=
timeout 45s /opt/blender/blender --background --factory-startup --disable-autoexec --threads 4 --python-exit-code 1 /work/j07-candidate.blend --python-expr 'import bpy,json,pathlib,math; o=bpy.data.objects["Cube"]; assert len(o.data.vertices)==8 and len(o.data.polygons)==6 and math.isclose(o.rotation_euler.z,.8,abs_tol=1e-5) and math.isclose(o.scale.x,1.4,abs_tol=1e-5); assert math.isclose(o.data.materials[0].node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value[2],.75,abs_tol=1e-5); pathlib.Path("/work/j07-reopen.json").write_text(json.dumps({"status":"PASS","vertices":8,"faces":6}))' > /work/j07-reopen.log 2>&1
stage D7_J07_REOPEN_PASS
