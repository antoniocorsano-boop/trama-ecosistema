import hashlib
import os
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "shared" / "contextual-copilot-core" / "src" / "index.js"


class Lib04aDigestProbe(unittest.TestCase):
    def test_000_report_frozen_source_digest(self):
        actual = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
        print(f"LIB04A_SRC_INDEX_SHA256={actual}", flush=True)
        os._exit(1)


if __name__ == "__main__":
    unittest.main()
