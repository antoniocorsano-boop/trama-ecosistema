import json
import struct
import unittest
from scripts.compute_factory_procedural_evidence import reference, sha

def glb(doc):
    body=json.dumps(doc).encode()
    body+=b" "*(-len(body)%4)
    return struct.pack("<4sIII4s",b"glTF",2,20+len(body),len(body),b"JSON")+body

class ProceduralTests(unittest.TestCase):
    def setUp(self):
        self.doc={"asset":{"version":"2.0"},"meshes":[{} for _ in range(33)]}
        self.data=glb(self.doc)
        self.row={"variant":"standard","file":"armillare-standard.glb","bytes":len(self.data),
                  "sha256":sha(self.data),"parts":33,"triangles":11456,"gpu_seconds":0}
    def check_bytes(self,data):
        return reference(data,dict(self.row,bytes=len(data),sha256=sha(data)),b"synthetic source")
    def test_review_only(self):
        result=self.check_bytes(self.data)
        self.assertEqual(result["engine"],"CF06A_TRIMESH_LAB")
        self.assertEqual(result["meshCount"],33)
        self.assertTrue(result["artifactHashMatched"])
        for key in ("trustedOriginVerified","geometryQualified","engineAdmitted",
                    "executionAuthorized","publicationAuthorityGranted","candidateQualified",
                    "studentAuthorized","paidComputeAuthorized"):
            self.assertIs(result[key],False,key)
    def test_hash_mismatch(self):
        with self.assertRaises(ValueError):
            reference(self.data,dict(self.row,sha256="0"*64),b"source")
    def test_header(self):
        with self.assertRaises(ValueError): self.check_bytes(b"BAD!"+self.data[4:])
    def test_external_resource(self):
        for field in ("buffers","images"):
            with self.subTest(field=field),self.assertRaises(ValueError):
                self.check_bytes(glb(dict(self.doc,**{field:[{"uri":"external.bin"}]})))
    def test_parts(self):
        with self.assertRaises(ValueError): self.check_bytes(glb(dict(self.doc,meshes=[])))
    def test_gpu_claim(self):
        with self.assertRaises(ValueError):
            reference(self.data,dict(self.row,gpu_seconds=1),b"source")
    def test_variant(self):
        with self.assertRaises(ValueError):
            reference(self.data,dict(self.row,variant="light"),b"source")
    def test_truncated(self):
        with self.assertRaises(ValueError): self.check_bytes(self.data[:-1])
    def test_source_binding(self):
        a=reference(self.data,self.row,b"source1")
        b=reference(self.data,self.row,b"source2")
        self.assertNotEqual(a["sourceSha256"],b["sourceSha256"])
        self.assertEqual(a["artifactSha256"],b["artifactSha256"])

if __name__=="__main__": unittest.main()
