import importlib.util
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("c", Path("scripts/collect_qe01_dsh_observation.py"))
c = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(c)

class TestCollector(unittest.TestCase):
    def test_reads_default_and_configured_provider(self):
        text = """
- name: '@deepseek-ai/dsh-agent-default-model'
  config:
    provider: openai
    model: gpt-test
- name: '@deepseek-ai/dsh-llm-pi-ai'
  config:
    providers:
      openai:
        apiKeyEnv: OPENAI_API_KEY
"""
        self.assertEqual(c.default_selection(text), ("openai", "gpt-test"))
        self.assertEqual(c.provider_is_configured(text, "openai"), (True, "dsh-llm-pi-ai"))
        c.assert_no_literal_secrets(text)

    def test_rejects_literal_secret(self):
        with self.assertRaisesRegex(ValueError, "SECRET"):
            c.assert_no_literal_secrets("apiKey: sk-not-allowed")

    def test_missing_default_fails(self):
        with self.assertRaisesRegex(ValueError, "DEFAULT-MODEL"):
            c.default_selection("- id: llm-pi-ai\n  config: {}")

    def test_catalog_name_without_profile_binding_not_configured(self):
        text = """
- name: '@deepseek-ai/dsh-agent-default-model'
  config:
    provider: anthropic
    model: claude-example
- name: '@deepseek-ai/dsh-llm-pi-ai'
  config:
    providers:
      openai:
        apiKeyEnv: OPENAI_API_KEY
"""
        self.assertEqual(c.provider_is_configured(text, "anthropic"), (False, "UNKNOWN"))

if __name__ == "__main__":
    unittest.main()
