#!/usr/bin/env python3
from __future__ import annotations

import math
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


def luminance(hex_color: str) -> float:
    value = hex_color.lstrip("#")
    rgb = [int(value[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    linear = [
        c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
        for c in rgb
    ]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast(a: str, b: str) -> float:
    high, low = sorted((luminance(a), luminance(b)), reverse=True)
    return (high + 0.05) / (low + 0.05)


def screenshot(browser: str, url: str, name: str, width: int, height: int) -> None:
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


def dump_dom(browser: str, url: str) -> str:
    return subprocess.run(
        [
            browser,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--virtual-time-budget=1500",
            "--dump-dom",
            url,
        ],
        check=True,
        capture_output=True,
        text=True,
        timeout=45,
    ).stdout


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
        base = f"http://127.0.0.1:{server.server_port}/"
        url = base + "index.html"

        dom = dump_dom(browser, url)
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

        harness_dom = dump_dom(browser, base + "validation-harness.html")
        (OUT / "validation-harness-dom.html").write_text(harness_dom, encoding="utf-8")
        if 'data-validation="PASS"' not in harness_dom:
            result_start = harness_dom.find('<pre id="result"')
            detail = harness_dom[result_start:result_start + 5000] if result_start >= 0 else harness_dom[-5000:]
            raise RuntimeError("Validation harness did not produce PASS. Rendered result:\n" + detail)

        viewports = {
            "android": (390, 844),
            "desktop": (1440, 1100),
            "lim": (1920, 1080),
            "reflow320": (320, 800),
        }
        sections = {
            "top": "",
            "student": "#percorsi",
            "teacher": "#risorse",
            "map": "#esplora",
            "states": "#states-title",
        }

        for viewport, (width, height) in viewports.items():
            for section, fragment in sections.items():
                screenshot(
                    browser,
                    url + fragment,
                    f"{viewport}-{section}-{width}x{height}",
                    width,
                    height,
                )

        non_text_pairs = {
            "focus-ring-on-white": ("#0369a1", "#ffffff"),
            "strong-border-on-white": ("#6b7280", "#ffffff"),
            "arena-indicator-on-white": ("#312e81", "#ffffff"),
            "atlas-indicator-on-white": ("#0f766e", "#ffffff"),
            "withdrawn-indicator-on-white": ("#7c2d12", "#ffffff"),
            "error-indicator-on-white": ("#991b1b", "#ffffff"),
        }
        contrast_report = {}
        for name, pair in non_text_pairs.items():
            ratio = contrast(*pair)
            contrast_report[name] = ratio
            if ratio < 3.0:
                raise RuntimeError(f"Non-text contrast failed for {name}: {ratio:.2f}:1")

        (OUT / "rendered-dom.html").write_text(dom, encoding="utf-8")
        (OUT / "non-text-contrast.txt").write_text(
            "\n".join(f"{name}: {ratio:.2f}:1" for name, ratio in contrast_report.items()) + "\n",
            encoding="utf-8",
        )
        print(f"Browser validation PASS using {browser}")
        print("Validation harness PASS at 320 CSS px")
        for name, ratio in contrast_report.items():
            print(f"{name}: {ratio:.2f}:1")
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
