#!/usr/bin/env python3
from __future__ import annotations

import shutil
import struct
import subprocess
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROTOTYPE = ROOT / "docs" / "product" / "prototypes" / "r3-f0-s3-v1"
OUT = ROOT / "artifacts" / "r3-f0-s3-v1"
OUT.mkdir(parents=True, exist_ok=True)


def find_browser() -> str:
    for name in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser"):
        found = shutil.which(name)
        if found:
            return found
    raise SystemExit("No Chrome/Chromium binary found on the runner")


def png_size(path: Path) -> tuple[int, int]:
    with path.open("rb") as handle:
        signature = handle.read(24)
    if signature[:8] != b"\x89PNG\r\n\x1a\n":
        raise RuntimeError(f"{path} is not a PNG")
    return struct.unpack(">II", signature[16:24])


def main() -> None:
    browser = find_browser()

    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass

    server = ThreadingHTTPServer(
        ("127.0.0.1", 0),
        lambda *args, **kwargs: QuietHandler(*args, directory=str(PROTOTYPE), **kwargs),
    )
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    try:
        url = f"http://127.0.0.1:{server.server_port}/index.html"

        dom = subprocess.run(
            [
                browser,
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--dump-dom",
                url,
            ],
            check=True,
            capture_output=True,
            text=True,
            timeout=45,
        ).stdout

        required = (
            "Agricoltura come sistema tecnologico",
            "CurricularStatus",
            "EditorialStatus",
            "UIFeedbackStatus",
            "Elenco equivalente",
        )
        for marker in required:
            if marker not in dom:
                raise RuntimeError(f"Rendered DOM is missing marker: {marker}")

        viewports = {
            "android-390x844": (390, 844),
            "desktop-1440x1100": (1440, 1100),
            "lim-1920x1080": (1920, 1080),
        }

        for name, (width, height) in viewports.items():
            target = OUT / f"{name}.png"
            subprocess.run(
                [
                    browser,
                    "--headless=new",
                    "--disable-gpu",
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--hide-scrollbars",
                    f"--window-size={width},{height}",
                    f"--screenshot={target}",
                    url,
                ],
                check=True,
                capture_output=True,
                timeout=45,
            )
            if not target.exists() or target.stat().st_size < 10_000:
                raise RuntimeError(f"Screenshot evidence missing or unexpectedly small: {target}")
            actual_width, actual_height = png_size(target)
            if actual_width != width or actual_height != height:
                raise RuntimeError(
                    f"Unexpected screenshot size for {name}: "
                    f"{actual_width}x{actual_height}, expected {width}x{height}"
                )

        (OUT / "rendered-dom.html").write_text(dom, encoding="utf-8")
        print(f"Browser validation PASS using {browser}")
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
