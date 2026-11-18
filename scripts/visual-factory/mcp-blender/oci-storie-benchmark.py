"""OCI-01c: fixed, read-only Storie C2 benchmark. No cloud provisioning.

Run only in the previously reviewed isolated ARM64 container after explicit
resource/security admission. This script is a workload, not an admission gate.
"""
import bpy
import hashlib
import json
import os
import pathlib
import platform
import resource
import struct
import time
from mathutils import Vector

INPUT = pathlib.Path("/input/storie-B03-mcp-C2.blend")
ROOT = pathlib.Path("/work")
EXPECTED = "e3225c61357eafd1467c83b270086d669b6ba2602a364e5d0f2a89964a59e4df"
VIEWS = {"obliqua": (2.9, -5.7, 4.3), "frontale": (0, -6, 2.4)}

def require(condition, reason):
    if not condition:
        raise RuntimeError(reason)

def sha(path):
    with path.open("rb") as f:
        return hashlib.file_digest(f, "sha256").hexdigest()

def geometry(scene):
    rows = []
    for o in sorted((o for o in scene.objects if o.type == "MESH"), key=lambda o: o.name):
        h = hashlib.sha256()
        for v in o.data.vertices:
            h.update(struct.pack("<3d", *v.co))
        for p in o.data.polygons:
            h.update(struct.pack("<I", len(p.vertices)))
            for i in p.vertices:
                h.update(struct.pack("<I", i))
        rows.append([o.name, len(o.data.vertices), len(o.data.polygons), h.hexdigest(),
                     [list(r) for r in o.matrix_world], [m.name for m in o.data.materials]])
    return rows

def run():
    require(platform.machine() == "aarch64" and bpy.app.version[:3] == (5,0,1), "wrong runtime")
    require(os.getuid() != 0 and os.statvfs("/").f_flag & os.ST_RDONLY, "isolation required")
    require(os.statvfs("/input").f_flag & os.ST_RDONLY, "input must be read only")
    require(set(os.listdir("/sys/class/net")) == {"lo"}, "network isolation required")
    require(INPUT.stat().st_size == 9244488 and sha(INPUT) == EXPECTED, "master mismatch")
    require(pathlib.Path(bpy.data.filepath) == INPUT, "open exact master with autoexec disabled")
    s = bpy.context.scene
    require(s.render.engine == "CYCLES" and s.cycles.device == "CPU", "render profile")
    require((s.render.resolution_x, s.render.resolution_y, s.render.resolution_percentage,
             s.cycles.samples) == (1024,1024,100,48), "quality mismatch")
    require(s.render.film_transparent and s.render.image_settings.file_format == "PNG"
            and s.render.image_settings.color_mode == "RGBA", "output profile")
    c = s.camera
    require(c is not None and c.data.type == "ORTHO", "camera profile")
    before = geometry(s)
    require(len(before) == 15 and sum(r[2] for r in before) == 105568, "geometry mismatch")
    geom = hashlib.sha256(json.dumps(before, sort_keys=True, separators=(",",":")).encode()).hexdigest()
    require(geom == "774caea0f98a3f7793777a9c94b3666d041d707e2e70ddac2661ef9eaebecdec",
            "geometry digest differs; review version migration")
    old_matrix, old_path = c.matrix_world.copy(), s.render.filepath
    old_mode, old_threads = s.render.threads_mode, s.render.threads
    outputs = []
    start = time.monotonic()
    try:
        s.render.threads_mode = "FIXED"
        s.render.threads = 2
        for name, location in VIEWS.items():
            p = ROOT / ("oci-storie-" + name + ".png")
            require(not p.exists(), "output exists")
            c.location = location
            c.rotation_euler = (Vector((0,0,.22))-c.location).to_track_quat("-Z","Y").to_euler()
            bpy.context.view_layer.update()
            s.render.filepath = str(p)
            t = time.monotonic()
            bpy.ops.render.render(write_still=True)
            raw = p.read_bytes()
            require(raw[:8] == b"\x89PNG\r\n\x1a\n" and
                    struct.unpack(">II", raw[16:24]) == (1024,1024) and raw[25] == 6, "PNG profile")
            outputs.append({"name":p.name, "sha256":hashlib.sha256(raw).hexdigest(),
                            "bytes":len(raw), "seconds":round(time.monotonic()-t,3)})
    finally:
        c.matrix_world = old_matrix
        s.render.filepath = old_path
        s.render.threads_mode, s.render.threads = old_mode, old_threads
        bpy.context.view_layer.update()
    require(geometry(s) == before and sha(INPUT) == EXPECTED, "master changed")
    require(len(outputs) == 2 and outputs[0]["sha256"] != outputs[1]["sha256"], "views invalid")
    receipt = {"status":"BENCHMARK_RENDERED_REVIEW_REQUIRED",
               "scope":"READ_ONLY_ARTISTIC_BENCHMARK", "masterSha256":EXPECTED,
               "geometryDigest":geom, "blender":bpy.app.version_string, "architecture":platform.machine(),
               "renderProfile":{"width":1024,"height":1024,"samples":48,"threads":2},
               "outputs":outputs, "wallSeconds":round(time.monotonic()-start,3),
               "processPeakRssKiB":resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,
               "oracleEntitlementVerified":False,"costClass":"UNKNOWN",
               "artisticApproval":False,"productionAuthorized":False,"publicationAuthorized":False}
    p = ROOT / "oci-storie-benchmark.json"
    require(not p.exists(), "receipt exists")
    p.write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps(receipt,indent=2),flush=True)

if __name__ == "__main__":
    run()
