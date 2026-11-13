#!/usr/bin/env python3
"""Bounded, fail-closed Audio Factory pilot. No model activity in validate mode."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from core import InvalidPlan, canonical_digest, execute, validate_plan


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="TRAMA Audio Factory AF-01 (local pilot)")
    parser.add_argument("--plan", type=Path, required=True, help="JSON request file")
    parser.add_argument("--output", type=Path, help="new, nonexistent output directory")
    parser.add_argument("--validate-only", action="store_true", help="no inference, no download")
    parser.add_argument("--allow-model-download", action="store_true",
                        help="explicitly authorize official Kokoro model download/cache")
    parser.add_argument("--mp3", action="store_true", help="also encode MP3 using local FFmpeg")
    args = parser.parse_args(argv)
    try:
        raw = json.loads(args.plan.read_text(encoding="utf-8"))
        plan = validate_plan(raw)
    except (OSError, json.JSONDecodeError, InvalidPlan) as exc:
        print(f"PIANO NON VALIDO: {exc}", file=sys.stderr)
        return 2
    if args.validate_only:
        print(json.dumps({"valid": True, "plan_sha256": canonical_digest(plan),
                          "mode": "NO_INFERENCE"}, ensure_ascii=False))
        return 0
    if not args.allow_model_download or args.output is None:
        print("IN ATTESA: servono --output e --allow-model-download per una prova CPU esplicita.",
              file=sys.stderr)
        return 3
    from kokoro_adapter import synthesize
    try:
        receipt = execute(plan, args.output, synthesize, mp3=args.mp3)
    except FileExistsError:
        print("CARTELLA GIÀ ESISTENTE: scegliere una destinazione nuova.", file=sys.stderr)
        return 4
    print(json.dumps(receipt, ensure_ascii=False, indent=2))
    return 0 if receipt["status"] == "CANDIDATE" else 5


if __name__ == "__main__":
    raise SystemExit(main())
