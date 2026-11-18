"""Restricted J07 MCP transport. Synthetic qualification profile only.

No public generic execute API. Commands are fixed internally; no caller-supplied
Python, paths or URLs. Production evidence/compute admission is not implemented.
The upstream server still exposes arbitrary code; Docker remains the boundary.
"""
import base64
import hashlib
import json
import pathlib
import struct
import sys
from contextlib import asynccontextmanager
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

ROOT = pathlib.Path("/work")
ENV = {"PATH": "/usr/bin:/bin", "HOME": "/work/home", "BLENDER_HOST": "127.0.0.1",
       "BLENDER_PORT": "9876", "QWEN_MM_NO_AUTO_INSTALL": "1", "QWEN_MM_AUTOLAUNCH": "0",
       "QWEN_MM_NATIVE_MODE": "1", "PYTHONPATH": "/deps/source/src:/deps/source/src/capabilities/blender",
       "PYTHONDONTWRITEBYTECODE": "1", "TMPDIR": "/tmp"}
PATCH = {"id": "synthetic-cube-v1", "rotationZ": 0.8, "scale": [1.4, 0.75, 1.0],
         "color": [0.08, 0.32, 0.75, 1.0]}
PATCH_DIGEST = hashlib.sha256(json.dumps(PATCH, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
PATCH_CODE = """import bpy
o=bpy.data.objects['Cube']
o.rotation_euler.z=.8
o.scale=(1.4,.75,1.)
o.data.materials[0].node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.08,.32,.75,1)
bpy.context.view_layer.update()
print('J07='+__import__('json').dumps({'patched':True}))
"""
INSPECT = """import bpy,os,json
o=bpy.data.objects['Cube']
print('J07='+json.dumps({'pid':os.getpid(),'rotation':list(o.rotation_euler),'scale':list(o.scale),'vertices':len(o.data.vertices),'faces':len(o.data.polygons)}))
"""
INITIALIZE = """import bpy,json
o=bpy.data.objects['Cube']
o.rotation_euler=(0,0,0)
o.scale=(1,1,1)
m=bpy.data.materials.new('J07_synthetic');m.use_nodes=True
m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.65,.1,.05,1)
o.data.materials.clear();o.data.materials.append(m)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.device='CPU';s.cycles.samples=4
s.render.resolution_x=128;s.render.resolution_y=128;s.render.resolution_percentage=100
s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA'
bpy.context.view_layer.update()
print('J07='+json.dumps({'initialized':True}))
"""


def file_meta(path, limit=32*1024**2):
    if path.is_symlink() or not path.is_file() or not 0 < path.stat().st_size <= limit:
        raise ValueError("invalid output")
    raw=path.read_bytes()
    return {"sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


class J07Adapter:
    def __init__(self, session):
        self._session=session
        self.patch_applied=False

    async def _code(self, code):
        r=await self._session.call_tool("execute_blender_code", {"code": code})
        if r.isError or len(r.content)!=1 or r.content[0].type!="text":
            raise RuntimeError("MCP command failed")
        s=r.content[0].text
        if not s.startswith("Code executed successfully:"):
            raise RuntimeError("MCP command rejected")
        lines=[x for x in s.removeprefix("Code executed successfully:").strip().splitlines() if x.startswith("J07=")]
        if len(lines)!=1:
            raise RuntimeError("invalid response")
        return json.loads(lines[0][4:])

    async def initialize_synthetic(self):
        return await self._code(INITIALIZE)

    async def inspect(self):
        return await self._code(INSPECT)

    async def apply_reviewed_patch(self, patch_id, digest):
        if patch_id!=PATCH["id"] or digest!=PATCH_DIGEST or self.patch_applied:
            raise ValueError("patch not allowed or cycle exhausted")
        result=await self._code(PATCH_CODE)
        self.patch_applied=True
        return result

    async def snapshot(self, slot):
        names={"base":"j07-base.blend","candidate":"j07-candidate.blend"}
        if slot not in names:
            raise ValueError("unknown snapshot slot")
        name=names[slot]
        code="import bpy,json\nbpy.ops.wm.save_as_mainfile(filepath="+repr("/work/"+name)+")\nprint('J07='+json.dumps({'saved':True}))"
        assert (await self._code(code))["saved"]
        return file_meta(ROOT/name)

    async def render(self, slot):
        names={"before":"j07-before.png","after":"j07-after.png"}
        if slot not in names:
            raise ValueError("unknown render slot")
        name=names[slot]
        code="import bpy,json\nbpy.context.scene.render.filepath="+repr("/work/"+name)+"\nbpy.ops.render.render(write_still=True)\nprint('J07='+json.dumps({'rendered':True}))"
        assert (await self._code(code))["rendered"]
        meta=file_meta(ROOT/name,8*1024**2)
        received=bytearray()
        for offset in range(0,meta["bytes"],65536):
            code=("import base64,json,pathlib\nwith pathlib.Path("+repr("/work/"+name)+").open('rb') as f:\n f.seek("+str(offset)+")\n b=f.read(65536)\nprint('J07='+json.dumps({'data':base64.b64encode(b).decode('ascii')}))")
            received.extend(base64.b64decode((await self._code(code))["data"],validate=True))
        assert len(received)==meta["bytes"] and hashlib.sha256(received).hexdigest()==meta["sha256"]
        assert received[:8]==b"\x89PNG\r\n\x1a\n" and struct.unpack(">II",received[16:24])==(128,128)
        (ROOT/("mcp-"+name)).write_bytes(received)
        return meta


@asynccontextmanager
async def connect():
    params=StdioServerParameters(command=sys.executable,args=["-m","qwen_mm_plugins_blender"],env=ENV)
    async with stdio_client(params) as (read,write):
        async with ClientSession(read,write) as session:
            init=await session.initialize()
            names={t.name for t in (await session.list_tools()).tools}
            if len(names)!=22 or "execute_blender_code" not in names:
                raise RuntimeError("unexpected upstream tool registry")
            yield J07Adapter(session),init.protocolVersion
