import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME_TESTS = ROOT / 'runtime' / 'local-semantic-memory' / 'tests'
REGISTRO_SERVICE_TESTS = ROOT / 'runtime' / 'local-registro-service' / 'tests'


def run_suite(path: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [
            sys.executable,
            '-m',
            'unittest',
            'discover',
            '-s',
            str(path),
            '-p',
            'test_*.py',
            '-v',
        ],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )


class LocalSemanticMemoryRuntimeSuiteGate(unittest.TestCase):
    def test_full_runtime_suite_passes(self):
        completed = run_suite(RUNTIME_TESTS)
        evidence = '\n'.join(part for part in (completed.stdout, completed.stderr) if part)
        self.assertEqual(completed.returncode, 0, evidence)

    def test_local_registro_service_suite_passes(self):
        completed = run_suite(REGISTRO_SERVICE_TESTS)
        evidence = '\n'.join(part for part in (completed.stdout, completed.stderr) if part)
        self.assertEqual(completed.returncode, 0, evidence)


if __name__ == '__main__':
    unittest.main()
