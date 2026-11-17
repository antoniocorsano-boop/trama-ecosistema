"""Read-only CF-06A GLB evidence reference; no execution or admission."""
import hashlib
import json
import struct


def sha(data):
    return hashlib.sha256(data).hexdigest()


def require(ok, reason):
    if not ok:
        raise ValueError(reason)


def reference(data, row, source_bytes):
    require(type(data) is bytes and 20 <= len(data) <= 32*1024*1024, "GLB size")
    require(type(source_bytes) is bytes and 0 < len(source_bytes) <= 1024*1024, "source size")
    require(isinstance(row, dict) and row.get("variant") in ("standard", "light"), "variant")
    require(row.get("file") == "armillare-"+row["variant"]+".glb", "file identity")
    require(type(row.get("bytes")) is int and row["bytes"] == len(data), "size mismatch")
    require(row.get("sha256") == sha(data), "hash mismatch")
    magic, version, length = struct.unpack_from("<4sII", data)
    require((magic, version, length) == (b"glTF", 2, len(data)), "GLB header")
    chunks=[]; pos=12
    while pos < len(data):
        require(pos+8 <= len(data), "truncated chunk header")
        n, kind=struct.unpack_from("<I4s", data, pos); pos+=8
        require(n%4==0 and pos+n<=len(data), "chunk bounds")
        chunks.append((kind,data[pos:pos+n])); pos+=n
    require([k for k,_ in chunks] in ([b"JSON"],[b"JSON",b"BIN\x00"]), "chunk order")
    def unique(pairs):
        result=dict(pairs); require(len(result)==len(pairs), "duplicate key"); return result
    doc=json.loads(chunks[0][1].decode("utf-8"),object_pairs_hook=unique)
    require(isinstance(doc,dict) and isinstance(doc.get("asset"),dict) and
            doc["asset"].get("version")=="2.0", "asset version")
    for field in ("buffers", "images"):
        items=doc.get(field,[])
        require(isinstance(items,list) and all(isinstance(x,dict) and "uri" not in x for x in items),
                "external resource or invalid collection")
    meshes=doc.get("meshes",[])
    require(isinstance(meshes,list) and type(row.get("parts")) is int and row["parts"]==len(meshes)==33, "part count")
    require(type(row.get("triangles")) is int and row["triangles"]>0, "triangle claim")
    require(type(row.get("gpu_seconds")) is int and row["gpu_seconds"]==0, "GPU claim")
    return {"schemaVersion":"trama.procedural-evidence-reference/v0.1", "engine":"CF06A_TRIMESH_LAB",
            "variant":row["variant"],"artifactSha256":sha(data),"sourceSha256":sha(source_bytes),
            "artifactBytes":len(data),"meshCount":len(meshes),"reportedTriangles":row["triangles"],
            "reportedGpuSeconds":row["gpu_seconds"],"decision":"REVIEW_REFERENCE_ONLY",
            "artifactHashMatched":True,"trustedOriginVerified":False,"geometryQualified":False,
            "engineAdmitted":False,"executionAuthorized":False,"publicationAuthorityGranted":False,
            "candidateQualified":False,"studentAuthorized":False,"paidComputeAuthorized":False}
