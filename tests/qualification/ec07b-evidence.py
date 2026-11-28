"""Preserve the exact EC07b browser outputs and make a consultation PDF."""

import argparse
import hashlib
import io
import json
import re
from collections import Counter
from pathlib import Path

from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

WIDTHS = (390, 1280)
PHASES = {
    "configurazione": "Configurazione",
    "bozza": "Bozza didattica",
    "richieste": "Richieste dei materiali",
    "preparati": "Materiali preparati",
    "scheda": "Scheda studente",
    "guida": "Guida riservata al docente",
    "diagramma": "Diagramma",
    "simulatore": "Simulatore dopo Avanza di 90°",
    "materials": "Banco Produzione dopo la riapertura",
    "obsoleti": "Materiali delle revisioni precedenti",
}
KINDS = ("DIAGRAM", "SIMULATION", "STUDENT_SHEET")


def preserve(results: Path, destination: Path, sha: str):
    expected = {
        f"ec07b-{phase}-{width}.png" for width in WIDTHS for phase in PHASES
    } | {
        f"ec07b-obsoleto-{kind}-{width}.json" for width in WIDTHS for kind in KINDS
    }
    files = sorted(path for path in results.rglob("ec07b-*") if path.is_file())
    if Counter(path.name for path in files) != Counter(expected):
        actual = Counter(path.name for path in files)
        raise ValueError(
            f"Missing: {sorted(expected - actual.keys())}; "
            f"unexpected or duplicate: {sorted((actual - Counter(expected)).elements())}"
        )

    originals = {}
    entries = []
    for path in files:
        data = path.read_bytes()
        width = int(path.stem.rsplit("-", 1)[-1])
        entry = {
            "file": path.name,
            "viewport": {"width": width, "height": 900},
            "bytes": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
        }
        if path.suffix == ".png":
            with Image.open(io.BytesIO(data)) as image:
                if image.format != "PNG" or not 0 < image.width <= width:
                    raise ValueError(f"Invalid screenshot: {path.name}")
                entry["image_px"] = {"width": image.width, "height": image.height}
                image.verify()
        else:
            binding = json.loads(data)
            kind = path.stem.split("-")[2]
            draft = binding["draftSnapshot"].encode()
            if (
                binding["schema"] != "studio-atlas.didactic-material-binding/v0.1"
                or binding["kind"] != kind
                or binding["draftRevision"] != 1
                or binding["status"] != "TEACHER_REVIEW_REQUIRED"
                or binding["draftSha256"] != hashlib.sha256(draft).hexdigest()
                or any(binding[key] is not False for key in (
                    "studentAuthorized", "publicationAuthorized", "paidComputeAuthorized"
                ))
            ):
                raise ValueError(f"Invalid binding: {path.name}")
            entry["kind"] = kind
        originals[path.name] = data
        entries.append(entry)

    destination.mkdir(parents=True)
    for name, data in originals.items():
        (destination / name).write_bytes(data)
    manifest = {"candidate_sha": sha, "results": [
        {"width": width, "height": 900, "result": "PASS", "png": 10, "json": 3}
        for width in WIDTHS
    ], "files": entries}
    (destination / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    pdf = canvas.Canvas(str(destination / "EC07b-Ingranaggi.pdf"), pageCompression=1)
    pdf.setTitle("EC07b — Ingranaggi")
    for phase, title in PHASES.items():
        for width in WIDTHS:
            img = ImageReader(io.BytesIO(originals[f"ec07b-{phase}-{width}.png"]))
            x, y = img.getSize()
            page_width = 480 if width == 390 else 690
            drawn_width = min(page_width - 48, x)
            drawn_height = drawn_width * y / x
            page_height = drawn_height + 108
            marker = f"{phase}-{width}"
            pdf.setPageSize((page_width, page_height))
            pdf.bookmarkPage(marker)
            if width == 390:
                pdf.addOutlineEntry(title, marker)
            pdf.setFont("Helvetica-Bold", 16)
            pdf.drawString(24, page_height - 28, title)
            pdf.setFont("Helvetica", 10)
            pdf.drawString(24, page_height - 46, f"EC07b · Ingranaggi · viewport {width} × 900 px")
            pdf.drawImage(img, (page_width - drawn_width) / 2, 34,
                          width=drawn_width, height=drawn_height, mask="auto")
            pdf.setFont("Helvetica", 8)
            pdf.drawString(24, 14, f"Candidato {sha}")
            pdf.showPage()
    pdf.save()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("results", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("sha")
    args = parser.parse_args()
    if not re.fullmatch(r"[0-9a-f]{40}", args.sha):
        parser.error("A full lowercase candidate SHA is required")
    preserve(args.results, args.destination, args.sha)
