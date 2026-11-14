#!/usr/bin/env python3
"""FD-05/A: prepare and verify only the approved synthetic FD-02 fixture."""
import argparse
import hashlib
import io
import json
import stat
import zipfile
from pathlib import Path
from urllib.request import build_opener, HTTPRedirectHandler, Request

ARCHIVE_SHA = "cd15460469fcec08cefe5b304bd30eb3f73e22849e1e007245fcbce2c4daa8da"
MAX_ARCHIVE = 65536
ORIGIN = "https://trama-fd02.pages.dev"
FILES = {
    "index.html": (1545, "dd81495df12bdfae65a44fb37b9d63ac4d7cb39da382fb1464833ee3e0c7c174", {"text/html"}),
    "style.css": (881, "f4d006c83e5f6bbca691d6424fc31239ea7c3ef2cce1b153d970b4f62e6ab97c", {"text/css"}),
    "app.js": (773, "7936b83955a925c4e504ab735fa9068b5ae24f4010115e4eed04205b7ec0c810", {"text/javascript", "application/javascript"}),
    "media/marker.webp": (340, "a283e888ca4902e06444d24d7bb2584f263d9ff24072fcff3ccc605a5708f2ff", {"image/webp"}),
    "media/tone.mp3": (36719, "3ff59ff860b6b071f4ce0a9d24dcc7f6966957de48b26e2a3d53b85c4408e520", {"audio/mpeg"}),
    "manifest.json": (911, "fd985df06fa9fa87ea24b60d4155d6bec3e69a9366099f0980bc11a38ad0850f", {"application/json"}),
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def check_bytes(name, data):
    size, sha, _ = FILES[name]
    if len(data) != size or digest(data) != sha:
        raise ValueError(f"STOP_INTEGRITY: {name}")


def read_fixture(archive):
    with Path(archive).open("rb") as f:
        data = f.read(MAX_ARCHIVE + 1)
    if len(data) > MAX_ARCHIVE or digest(data) != ARCHIVE_SHA:
        raise ValueError("STOP_ARCHIVE_NOT_PINNED")
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        infos = z.infolist()
        if len(infos) != len(FILES) or {i.filename for i in infos} != set(FILES):
            raise ValueError("STOP_FILE_ALLOWLIST")
        result = {}
        for i in infos:
            size = FILES[i.filename][0]
            if i.file_size != size or stat.S_ISLNK(i.external_attr >> 16) or i.flag_bits & 1:
                raise ValueError("STOP_ARCHIVE_ENTRY")
            result[i.filename] = z.read(i)
            check_bytes(i.filename, result[i.filename])
    return result


def prepare(archive, destination):
    files = read_fixture(archive)
    destination = Path(destination)
    # Only create a new directory. Never replace or reuse a previous staging tree.
    destination.mkdir(exist_ok=False)
    for name, data in files.items():
        path = destination / name
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("xb") as f:
            f.write(data)
    return receipt("PREPARED_LOCAL_ONLY")


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError("STOP_REDIRECT")


def fetch(name):
    size, _, types = FILES[name]
    route = "/" if name == "index.html" else "/" + name
    req = Request(ORIGIN + route, headers={"Accept-Encoding": "identity", "Cache-Control": "no-cache"})
    with build_opener(NoRedirect()).open(req, timeout=10) as response:
        if response.status != 200 or response.headers.get_content_type() not in types:
            raise ValueError(f"STOP_HTTP_OR_MIME: {name}")
        return response.read(size + 1)


def verify_live():
    for name in FILES:
        check_bytes(name, fetch(name))
    return receipt("REMOTE_BYTES_VERIFIED")


def receipt(state):
    return {"state": state, "fixture": "FD-02/1.0.1", "archiveSha256": ARCHIVE_SHA,
            "origin": ORIGIN, "fileCount": len(FILES), "syntheticOnly": True,
            "studentPublicationAuthorized": False, "deployAuthorized": False,
            "costVerified": False, "privacyQualified": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("prepare")
    p.add_argument("archive", type=Path)
    p.add_argument("destination", type=Path)
    sub.add_parser("verify-live")
    args = parser.parse_args()
    try:
        result = prepare(args.archive, args.destination) if args.command == "prepare" else verify_live()
    except (OSError, ValueError, RuntimeError, zipfile.BadZipFile) as exc:
        parser.exit(1, f"STOP: {type(exc).__name__}: {exc}\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
