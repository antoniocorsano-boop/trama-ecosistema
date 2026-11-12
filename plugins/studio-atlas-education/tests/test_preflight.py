import hashlib, importlib.util, json, tempfile, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SKILL=ROOT/"skills/atlas-education-production"
spec=importlib.util.spec_from_file_location("preflight",SKILL/"scripts/preflight.py")
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
class Tests(unittest.TestCase):
    def test_manifest_and_resources(self):
        p=json.loads((ROOT/"plugin.json").read_text())
        self.assertEqual(p["name"],"studio-atlas-education")
        self.assertEqual(p["version"],"0.1.0")
        self.assertFalse((ROOT/"mcp.json").exists())
        for name in ["SKILL.md","references/production.md","references/families.md","templates/brief.md","templates/delivery.md","templates/review.md","scripts/preflight.py"]:
            self.assertTrue((SKILL/name).is_file(),name)
    def test_hash_not_approval(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/"lesson.html";p.write_bytes(b"<p>test</p>")
            r=mod.inventory(d)
            self.assertEqual(r["files"][0]["sha256"],hashlib.sha256(p.read_bytes()).hexdigest())
            self.assertEqual(r["status"],"INVENTORY_ONLY")
            for key in ["activity_package_validated","rights_verified","privacy_verified","runtime_tested","publication_authorized"]:
                self.assertIs(r[key],False)
            p.write_bytes(b"changed")
            self.assertNotEqual(mod.inventory(d)["files"][0]["sha256"],r["files"][0]["sha256"])
    def test_empty_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaisesRegex(ValueError,"EMPTY_PRODUCT"):mod.inventory(d)
    def test_unsupported_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d)/"archive.zip").write_bytes(b"x")
            with self.assertRaisesRegex(ValueError,"UNSUPPORTED_FILE"):mod.inventory(d)
    def test_symlink_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/"a.txt";p.write_text("x")
            (Path(d)/"b.txt").symlink_to(p)
            with self.assertRaisesRegex(ValueError,"SYMLINK"):mod.inventory(d)
    def test_limit_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d)/"a.txt").write_text("1234")
            old=mod.MAX_BYTES
            try:
                mod.MAX_BYTES=3
                with self.assertRaisesRegex(ValueError,"LOCAL_PREFLIGHT_LIMIT"):mod.inventory(d)
            finally:mod.MAX_BYTES=old
if __name__=="__main__":unittest.main()
