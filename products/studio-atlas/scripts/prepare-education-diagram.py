"""Prepare the bounded educational candidate with the existing qualified renderer.
Build-time only; no execution from web input, no new renderer or provider.
"""
import hashlib
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile

APP = pathlib.Path(__file__).resolve().parents[1]
LAB = APP.parents[1] / "fixtures" / "visual-factory-diagram"
OUT = APP / "public" / "design" / "education-diagram"
STEM = "eco02-p1-filiera-orticola"
VARIANTS = ("mobile-vertical", "desktop-lim-horizontal")

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="education-diagram-", dir=OUT.parent) as temp:
        target = pathlib.Path(temp)
        subprocess.run([sys.executable, str(LAB / "render-profile-demonstrator.py"),
                        "--education-out", str(target)], check=True, timeout=30)
        source = LAB / "education-pilot-source.json"
        receipt = json.loads((target / "education-receipt.json").read_text(encoding="utf-8"))
        assert receipt["schema"] == "trama.diagram-education-receipt/v0.1"
        assert receipt["status"] == "GENERATED_TEACHER_REVIEW_REQUIRED"
        assert receipt["runtimeAuthorized"] is False and receipt["publicationAuthorized"] is False
        assert receipt["sourceSha256"] == digest(source)
        assert receipt["profilesSha256"] == digest(LAB / "profile-candidates.json")
        assert receipt["guideSha256"] == digest(target / "guida-docente.md")
        assert [item["variant"] for item in receipt["outputs"]] == list(VARIANTS)
        for item in receipt["outputs"]:
            assert item["id"] == STEM + "-" + item["variant"]
            for ext in ("html", "svg"):
                assert item[ext + "Sha256"] == digest(target / (item["id"] + "." + ext))
        shutil.copyfile(source, target / source.name)
        expected = {"education-receipt.json", "guida-docente.md", source.name}
        expected.update(STEM + "-" + v + "." + e for v in VARIANTS for e in ("html", "svg"))
        assert {path.name for path in target.iterdir()} == expected
        # Replace only the dedicated generated directory, never source assets.
        if OUT.exists():
            shutil.rmtree(OUT)
        shutil.copytree(target, OUT)
    print("Education diagram: source, two validated static pairs, guide and receipt prepared.")

if __name__ == "__main__":
    main()
