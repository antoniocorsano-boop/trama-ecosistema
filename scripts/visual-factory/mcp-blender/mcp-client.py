import asyncio, base64, hashlib, importlib.util, json, os, pathlib, struct, sys, zlib
from math import isclose
assert importlib.util.find_spec("PIL") is None, "Pillow must not be installed in native profile"
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
root=pathlib.Path("/work")
source="/deps/source/src"
env={"PATH":"/usr/bin:/bin","HOME":"/work/home","BLENDER_HOST":"127.0.0.1",
     "BLENDER_PORT":"9876","QWEN_MM_NO_AUTO_INSTALL":"1","QWEN_MM_AUTOLAUNCH":"0","QWEN_MM_NATIVE_MODE":"1",
     "PYTHONPATH":source+":"+source+"/capabilities/blender",
     "PYTHONDONTWRITEBYTECODE":"1","TMPDIR":"/tmp"}
def png_pixels(raw):
    # Bounded, standard-library validation of the synthetic Blender PNG output.
    assert raw[:8]==b"\x89PNG\r\n\x1a\n" and len(raw)<=8*1024*1024
    offset=8
    payload=[]
    size=None
    ended=False
    while offset<len(raw):
        assert offset+12<=len(raw)
        n,kind=struct.unpack_from(">I4s",raw,offset)
        assert offset+12+n<=len(raw)
        data=raw[offset+8:offset+8+n]
        crc=struct.unpack_from(">I",raw,offset+8+n)[0]
        assert zlib.crc32(kind+data)&0xffffffff==crc
        offset+=12+n
        if kind==b"IHDR":
            assert size is None and n==13
            w,h,depth,color,comp,filt,interlace=struct.unpack(">IIBBBBB",data)
            assert 1<=w<=512 and 1<=h<=512 and depth==8 and color in (2,6)
            assert (comp,filt,interlace)==(0,0,0)
            size=(w,h)
            channels=3 if color==2 else 4
        elif kind==b"IDAT":
            assert size is not None
            payload.append(data)
        elif kind==b"IEND":
            assert n==0 and offset==len(raw)
            ended=True
            break
    assert size and payload and ended
    stride=w*channels
    expected=h*(stride+1)
    dec=zlib.decompressobj()
    filtered=dec.decompress(b"".join(payload),expected+1)
    assert len(filtered)==expected and dec.eof and not dec.unused_data and not dec.unconsumed_tail
    prev=bytearray(stride)
    pixels=bytearray()
    def paeth(a,b,c):
        p=a+b-c
        da,db,dc=abs(p-a),abs(p-b),abs(p-c)
        return a if da<=db and da<=dc else b if db<=dc else c
    for y in range(h):
        start=y*(stride+1)
        mode=filtered[start]
        assert mode<=4
        row=bytearray(filtered[start+1:start+1+stride])
        for x in range(stride):
            a=row[x-channels] if x>=channels else 0
            b=prev[x]
            c=prev[x-channels] if x>=channels else 0
            predict=(0,a,b,(a+b)//2,paeth(a,b,c))[mode]
            row[x]=(row[x]+predict)&255
        pixels.extend(row)
        prev=row
    assert any(pixels)
    return size,hashlib.sha256(pixels).hexdigest()
async def run():
    params=StdioServerParameters(command=sys.executable,args=["-m","qwen_mm_plugins_blender"],env=env)
    async with stdio_client(params) as (read,write):
        async with ClientSession(read,write) as session:
            init=await session.initialize()
            listed=await session.list_tools()
            names={t.name for t in listed.tools}
            assert len(names)==22 and {"get_scene_info","get_object_info","execute_blender_code","get_viewport_screenshot"} <= names
            async def call(name,args):
                r=await session.call_tool(name,args)
                assert not r.isError, r
                return r.content
            async def text(name,args):
                blocks=await call(name,args)
                assert len(blocks)==1 and blocks[0].type=="text"
                return blocks[0].text
            async def capture(name):
                blocks=await call("get_viewport_screenshot",{"max_size":512})
                assert len(blocks)==1 and blocks[0].type=="image", blocks
                b=blocks[0]
                assert b.mimeType=="image/png"
                raw=base64.b64decode(b.data,validate=True)
                assert raw[:8]==b"\x89PNG\r\n\x1a\n"
                size,pixels=png_pixels(raw)
                (root/name).write_bytes(raw)
                return {"name":name,"bytes":len(raw),"sha256":hashlib.sha256(raw).hexdigest(),"size":list(size),"pixelSha256":pixels}
            scene=json.loads(await text("get_scene_info",{}))
            assert any(o["name"]=="Cube" for o in scene["objects"])
            before=json.loads(await text("get_object_info",{"object_name":"Cube"}))
            pid1=await text("execute_blender_code",{"code":"import os; print(os.getpid())"})
            assert pid1.startswith("Code executed successfully:")
            a=await capture("mcp-before.png")
            reply=await text("execute_blender_code",{"code":"bpy.data.objects['Cube'].rotation_euler.z = 1.1; bpy.data.objects['Cube'].scale = (1.6, 0.7, 1.0)"})
            assert reply.startswith("Code executed successfully:"),reply
            after=json.loads(await text("get_object_info",{"object_name":"Cube"}))
            assert isclose(after["rotation"][2],1.1,abs_tol=1e-5)
            assert isclose(after["scale"][0],1.6,abs_tol=1e-5) and before["mesh"]==after["mesh"]
            b=await capture("mcp-after.png")
            pid2=await text("execute_blender_code",{"code":"import os; print(os.getpid())"})
            assert pid1==pid2
            assert a["size"]==b["size"] and a["pixelSha256"]!=b["pixelSha256"] and a["sha256"]!=b["sha256"]
            evidence={"status":"MCP_IMAGE_LOOP_PASS","protocolVersion":init.protocolVersion,
                      "toolCount":len(names),"tools":sorted(names),"images":[a,b],
                      "before":before,"after":after,"sameBlenderProcess":True,
                      "profile":"native Blender source-only","pillowInstalled":False,"nativeImageMode":True,
                      "fullMcpClientQualified":True,"agentControlQualified":False,
                      "artisticApproval":False,"publicationAuthorized":False}
            (root/"mcp-evidence.json").write_text(json.dumps(evidence,indent=2))
            print(json.dumps(evidence,indent=2))
asyncio.run(asyncio.wait_for(run(),timeout=80))
