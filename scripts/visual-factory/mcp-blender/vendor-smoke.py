import json, os, pathlib, socket, time
from math import isclose
root = pathlib.Path("/work")
assert os.getuid() != 0
assert {name for _, name in socket.if_nameindex()} == {"lo"}
assert not pathlib.Path("/home/runner").exists()
assert not os.access("/root", os.R_OK | os.X_OK)
assert not any("TOKEN" in k or "KEY" in k or "SECRET" in k for k in os.environ)
assert not pathlib.Path("/var/run/docker.sock").exists()
proc = pathlib.Path("/proc/self/status").read_text()
assert "CapEff:\t0000000000000000" in proc and "NoNewPrivs:\t1" in proc
assert os.statvfs("/").f_flag & os.ST_RDONLY
# No external address is reachable in this namespace.
s = socket.socket()
s.settimeout(1)
try:
    s.connect(("192.0.2.1", 443))
except OSError:
    pass
else:
    raise AssertionError("unexpected external route")
finally:
    s.close()
deadline = time.monotonic() + 60
while True:
    try:
        conn = socket.create_connection(("127.0.0.1", 9876), timeout=2)
        break
    except OSError:
        if time.monotonic() >= deadline:
            raise
        time.sleep(1)
conn.settimeout(30)
def call(kind, params=None, ok=True):
    conn.sendall(json.dumps({"type": kind, "params": params or {}}).encode())
    buf = b""
    while len(buf) < 1024 * 1024:
        piece = conn.recv(8192)
        if not piece:
            raise RuntimeError("bridge closed connection")
        buf += piece
        try:
            reply = json.loads(buf)
        except (ValueError, UnicodeDecodeError):
            continue
        assert reply["status"] == ("success" if ok else "error"), reply
        result = reply.get("result", {})
        assert "error" not in result, result
        return result
    raise RuntimeError("oversize response")
scene = call("get_scene_info")
assert any(o["name"] == "Cube" for o in scene["objects"])
before = call("get_object_info", {"name": "Cube"})
assert before["mesh"]["vertices"] == 8
# This is fixed, synthetic scene code, not a model-generated command.
changed = call("execute_code", {"code": "bpy.data.objects['Cube'].rotation_euler.z = 0.65"})
assert changed["executed"]
after = call("get_object_info", {"name": "Cube"})
assert isclose(after["rotation"][2], 0.65, abs_tol=1e-5)
assert after["mesh"] == before["mesh"]
assert after["rotation"] != before["rotation"]
for service in ("polyhaven", "hyper3d", "sketchfab", "hunyuan3d"):
    status = call("get_" + service + "_status")
    assert status["enabled"] is False, status
call("download_polyhaven_asset", ok=False)
call("create_rodin_job", ok=False)
call("create_hunyuan_job", ok=False)
call("download_sketchfab_model", ok=False)
conn.close()
result = {"status": "VENDOR_TCP_BRIDGE_PASS", "isolationSmokePassed": True,
          "sourceBlob": "77ec1f85083b39030c12e94e188a7c5a70229744",
          "scene": scene, "before": before, "after": after,
          "fullMcpClientQualified": False, "agentControlQualified": False,
          "artisticApproval": False, "publicationAuthorized": False}
(root / "transport-evidence.json").write_text(json.dumps(result, indent=2))
print(json.dumps(result, indent=2))
