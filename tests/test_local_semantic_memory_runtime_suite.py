import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME_TESTS = ROOT / 'runtime' / 'local-semantic-memory' / 'tests'


class LocalSemanticMemoryRuntimeSuiteGate(unittest.TestCase):
    def test_full_runtime_suite_passes(self):
        completed = subprocess.run(
            [
                sys.executable,
                '-m',
                'unittest',
                'discover',
                '-s',
                str(RUNTIME_TESTS),
                '-p',
                'test_*.py',
                '-v',
            ],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        evidence = '\n'.join(part for part in (completed.stdout, completed.stderr) if part)
        self.assertEqual(completed.returncode, 0, evidence)


if __name__ == '__main__':
    unittest.main()
