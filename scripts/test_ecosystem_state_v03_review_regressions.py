#!/usr/bin/env python3
from __future__ import annotations

import tempfile
from pathlib import Path

from test_ecosystem_state_v03_contract import base_document, expect_invalid, prepare_root
from validate_ecosystem_state_v03 import validate_graph


def main() -> int:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        prepare_root(root)

        # REAL and PARTIAL assert implemented boundaries, so they must retain governed evidence.
        doc = base_document()
        doc["nodes"][0]["evidenceRefs"] = []
        expect_invalid(doc, root, "evidencerefs")

        doc = base_document()
        doc["nodes"][1]["evidenceRefs"] = []
        expect_invalid(doc, root, "evidencerefs")

        doc = base_document()
        doc["flows"][0]["evidenceRefs"] = []
        expect_invalid(doc, root, "evidencerefs")

        # Unimplemented DESIGNED boundaries may legitimately have no runtime evidence yet.
        doc = base_document()
        doc["flows"][0]["state"] = "DESIGNED"
        doc["flows"][0]["evidenceRefs"] = []
        doc["flows"][0]["gap"] = {
            "summary": "Confine approvato ma non ancora dimostrato",
            "missing": ["prova runtime"],
        }
        validate_graph(doc, root)

        # Existing arbitrary files are not valid authority artifacts.
        (root / "README.md").write_text("not governed authority", encoding="utf-8")
        doc = base_document()
        doc["flows"][0]["authorityOwner"] = None
        doc["flows"][0]["authorityRefs"] = ["path:README.md"]
        expect_invalid(doc, root, "authority")

        # The approved design specification remains a valid governed authority source.
        doc = base_document()
        doc["flows"][0]["authorityOwner"] = None
        doc["flows"][0]["authorityRefs"] = [
            "path:docs/superpowers/specs/2026-10-17-trama-ecosystem-state-v0.3-design.md"
        ]
        validate_graph(doc, root)

    print("TRAMA_ECOSYSTEM_STATE_V03_REVIEW_REGRESSIONS_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
