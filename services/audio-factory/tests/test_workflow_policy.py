"""AF-02 safety: voice workflows must never use apt or run by push.

Offline tests inspect configuration only; they never fetch voice weights.
"""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
WORKFLOW = ROOT / ".github/workflows/audio-factory-af02-voice-trial.yml"
REQUIREMENTS = ROOT / "services/audio-factory/requirements-kokoro.txt"


class RuntimePolicyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.workflow = WORKFLOW.read_text(encoding="utf-8")
        cls.requirements = REQUIREMENTS.read_text(encoding="utf-8")

    def test_no_os_package_manager(self):
        for forbidden in ("apt-get", "apt install", "security.ubuntu.com", "sudo "):
            self.assertNotIn(forbidden, self.workflow)

    def test_preflight_required_hosts_only(self):
        self.assertIn('"pypi.org", "huggingface.co"', self.workflow)
        self.assertIn("NETWORK_DNS_UNAVAILABLE", self.workflow)

    def test_italian_phonemizer_is_python_distributed(self):
        self.assertIn("misaki[en]==0.9.4", self.requirements)
        self.assertIn("kokoro==0.9.4", self.requirements)
        self.assertIn("ITALIAN_PHONEMIZER_READY", self.workflow)

    def test_no_unapproved_trigger_or_paid_fallback(self):
        self.assertIn("types: [labeled]", self.workflow)
        self.assertIn("github.event.pull_request.number == 303", self.workflow)
        self.assertIn("af02-provino-autorizzato", self.workflow)
        self.assertNotIn("workflow_dispatch", self.workflow)
        self.assertNotIn("push:", self.workflow)
        self.assertIn("persist-credentials: false", self.workflow)

    def test_ffmpeg_optional_and_artifacts_preserved(self):
        self.assertIn("if command -v ffmpeg", self.workflow)
        self.assertIn("WAV-only candidates", self.workflow)
        self.assertIn("if: always()", self.workflow)
        self.assertIn("retention-days: 7", self.workflow)


if __name__ == "__main__":
    unittest.main()
