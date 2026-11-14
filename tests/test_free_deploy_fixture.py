import hashlib
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch
from scripts import free_deploy_fixture as fd


class FixtureTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.payload = {"index.html": b"<p>synthetic</p>", "media/tone.mp3": b"fixture"}
        self.pins = {k: (len(v), hashlib.sha256(v).hexdigest(), {"text/html"}) for k, v in self.payload.items()}
        self.addCleanup(patch.stopall)
        patch.object(fd, "FILES", self.pins).start()

    def archive(self, entries):
        p = self.root / "test.zip"
        with zipfile.ZipFile(p, "w") as z:
            for name, body in entries:
                z.writestr(name, body)
        patch.object(fd, "ARCHIVE_SHA", fd.digest(p.read_bytes())).start()
        return p

    def test_prepare_and_no_authority(self):
        p = self.archive(self.payload.items())
        target = self.root / "stage"
        r = fd.prepare(p, target)
        self.assertEqual(r["state"], "PREPARED_LOCAL_ONLY")
        self.assertFalse(r["deployAuthorized"])
        self.assertFalse(r["studentPublicationAuthorized"])
        self.assertFalse(r["costVerified"])
        self.assertFalse(r["privacyQualified"])
        self.assertEqual((target / "media/tone.mp3").read_bytes(), self.payload["media/tone.mp3"])
        with self.assertRaises(FileExistsError):
            fd.prepare(p, target)

    def test_unpinned_archive(self):
        p = self.archive(self.payload.items())
        p.write_bytes(p.read_bytes() + b"modified")
        with self.assertRaisesRegex(ValueError, "STOP_ARCHIVE_NOT_PINNED"):
            fd.prepare(p, self.root / "stage")
        self.assertFalse((self.root / "stage").exists())

    def test_extra_or_missing_file(self):
        for entries in [list(self.payload.items()) + [("secret.txt", b"x")], [("index.html", b"x")]]:
            with self.subTest(entries=entries):
                with self.assertRaisesRegex(ValueError, "STOP_FILE_ALLOWLIST"):
                    fd.read_fixture(self.archive(entries))

    def test_traversal_rejected(self):
        with self.assertRaisesRegex(ValueError, "STOP_FILE_ALLOWLIST"):
            fd.read_fixture(self.archive([("index.html", self.payload["index.html"]), ("../escape", b"x")]))

    def test_wrong_bytes_with_pinned_archive(self):
        entries = [(k, b"x" * len(v)) for k, v in self.payload.items()]
        with self.assertRaisesRegex(ValueError, "STOP_INTEGRITY"):
            fd.read_fixture(self.archive(entries))

    def test_remote_success_and_tamper(self):
        with patch.object(fd, "fetch", side_effect=self.payload.__getitem__):
            self.assertEqual(fd.verify_live()["state"], "REMOTE_BYTES_VERIFIED")
        with patch.object(fd, "fetch", return_value=b"wrong"):
            with self.assertRaisesRegex(ValueError, "STOP_INTEGRITY"):
                fd.verify_live()

    def test_redirect_refused(self):
        with self.assertRaisesRegex(ValueError, "STOP_REDIRECT"):
            fd.NoRedirect().redirect_request(None, None, 302, "", {}, "https://other.example/")

    def test_exact_origin_and_content_type(self):
        from unittest.mock import MagicMock
        response = MagicMock()
        response.__enter__.return_value = response
        response.status = 200
        response.headers.get_content_type.return_value = "text/html"
        response.read.return_value = self.payload["index.html"]
        with patch.object(fd, "build_opener") as opener:
            opener.return_value.open.return_value = response
            self.assertEqual(fd.fetch("index.html"), self.payload["index.html"])
            req = opener.return_value.open.call_args.args[0]
            self.assertEqual(req.full_url, fd.ORIGIN + "/")
            response.headers.get_content_type.return_value = "text/plain"
            with self.assertRaisesRegex(ValueError, "STOP_HTTP_OR_MIME"):
                fd.fetch("index.html")


if __name__ == "__main__":
    unittest.main()
