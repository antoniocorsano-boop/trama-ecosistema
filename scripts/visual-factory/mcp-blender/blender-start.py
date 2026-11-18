import bpy, pathlib, runpy, traceback
root = pathlib.Path("/work")
def startup():
    try:
        assert not bpy.app.background and bpy.app.version[:3] == (4, 2, 23)
        (root / "blender-ready.txt").write_text(bpy.app.version_string)
        print("BLENDER_GUI_READY", flush=True)
        runpy.run_path("/work/addon.py", run_name="__main__")
        scene = bpy.context.scene
        for suffix in ("polyhaven", "hyper3d", "sketchfab", "hunyuan3d"):
            setattr(scene, "blendermcp_use_" + suffix, False)
        assert bpy.types.blendermcp_server.running
        (root / "bridge-ready.txt").write_text("READY")
        print("VENDOR_ADDON_READY", flush=True)
    except Exception:
        (root / "startup-error.txt").write_text(traceback.format_exc())
        traceback.print_exc()
    return None
bpy.app.timers.register(startup, first_interval=1.0)
