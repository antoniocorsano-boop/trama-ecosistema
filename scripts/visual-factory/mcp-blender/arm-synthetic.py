"""OCI-01 diagnostic only: native ARM Blender synthetic scene, no external input."""
import bpy, hashlib, json, os, pathlib, platform, time, traceback
root=pathlib.Path("/work")
e={"status":"NOT_RUN","arch":platform.machine(),"blender":bpy.app.version_string,
   "background":bpy.app.background,"pid":os.getpid(),"stages":[],
   "scope":"NATIVE_ARM64_DIAGNOSTIC_ONLY","oracleInstanceVerified":False,
   "fullMcpClientQualified":False,"productionAuthorized":False,"publicationAuthorized":False}
def save_evidence():
    (root/"arm-evidence.json").write_text(json.dumps(e,indent=2))
def finish():
    bpy.ops.wm.quit_blender()
    return None
def render(name):
    s=bpy.context.scene
    p=root/(name+".png")
    s.render.filepath=str(p)
    t=time.monotonic()
    bpy.ops.render.render(write_still=True)
    raw=p.read_bytes()
    assert raw.startswith(b"\x89PNG\r\n\x1a\n")
    return {"name":name,"bytes":len(raw),"sha256":hashlib.sha256(raw).hexdigest(),
            "seconds":round(time.monotonic()-t,3),"pid":os.getpid()}
def stage():
    try:
        assert platform.machine()=="aarch64" and not bpy.app.background
        assert bpy.app.version[:3]==(5,0,1)
        assert os.getuid()!=0 and os.statvfs("/").f_flag & os.ST_RDONLY
        assert os.getpid()==e["pid"]
        s=bpy.context.scene
        cube=bpy.data.objects["Cube"]
        if not e["stages"]:
            s.render.engine="CYCLES"
            s.cycles.device="CPU"
            s.cycles.samples=8
            s.render.threads_mode="FIXED"
            s.render.threads=2
            s.render.resolution_x=256
            s.render.resolution_y=256
            s.render.resolution_percentage=100
            s.render.image_settings.file_format="PNG"
            mat=bpy.data.materials.new("OCI01_synthetic")
            mat.use_nodes=True
            mat.node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value=(.65,.12,.05,1)
            cube.data.materials.clear()
            cube.data.materials.append(mat)
            e["stages"].append(render("arm-before"))
            save_evidence()
            return 0.5
        cube.rotation_euler.z=.8
        cube.scale=(1.4,.75,1.)
        cube.data.materials[0].node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value=(.08,.32,.75,1)
        bpy.context.view_layer.update()
        e["stages"].append(render("arm-after"))
        assert e["stages"][0]["sha256"]!=e["stages"][1]["sha256"]
        p=root/"arm-candidate.blend"
        bpy.ops.wm.save_as_mainfile(filepath=str(p))
        raw=p.read_bytes()
        e["master"]={"sha256":hashlib.sha256(raw).hexdigest(),"bytes":len(raw)}
        e["status"]="ARM_GUI_CPU_RENDER_PASS"
    except Exception:
        e["status"]="ARM_GUI_CPU_RENDER_FAIL"
        e["error"]=traceback.format_exc()
    save_evidence()
    bpy.app.timers.register(finish,first_interval=.5)
    return None
bpy.app.timers.register(stage,first_interval=1.0)
