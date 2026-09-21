#!/usr/bin/env python3
"""Compatibility entry point for the canonical TRAMA-SA-01/R3 validator."""

import sys

from run_trama_sa01_r3 import load_corpus, validate_corpus


def main() -> int:
    errors = validate_corpus(load_corpus())
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    print("TRAMA-SA-01/R3 corpus validation: PASS (48; development=32; holdout=16 locked)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
