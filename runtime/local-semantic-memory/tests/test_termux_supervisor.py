import importlib
import os
import tempfile
import unittest
from pathlib import Path


class TermuxSupervisorContractTests(unittest.TestCase):
    def setUp(self):
        self.module = importlib.import_module('termux_supervisor')

    def test_origin_validation_accepts_exact_origins_and_rejects_wildcards_or_paths(self):
        validate_origin = self.module.validate_origin
        self.assertEqual(validate_origin('http://127.0.0.1:4174'), 'http://127.0.0.1:4174')
        self.assertEqual(validate_origin('https://registro.example.test'), 'https://registro.example.test')
        for invalid in ('*', 'https://*.example.test', 'http://192.168.1.20:4174',
                        'http://example.test', 'https://example.test/path',
                        'https://example.test?x=1', 'file:///tmp/app'):
            with self.subTest(invalid=invalid):
                with self.assertRaises(ValueError):
                    validate_origin(invalid)

    def test_service_rendering_is_loopback_only_and_memoryd_waits_for_embedding(self):
        SupervisorConfig = self.module.SupervisorConfig
        config = SupervisorConfig(
            runtime_dir=Path('/data/data/com.termux/files/home/trama/runtime/local-semantic-memory'),
            llama_server=Path('/data/data/com.termux/files/usr/bin/llama-server'),
            model=Path('/data/data/com.termux/files/home/models/embeddinggemma-2.gguf'),
            memory_home=Path('/data/data/com.termux/files/home/.local/share/trama-semantic-memory'),
            allowed_origins=('http://127.0.0.1:4174',),
            embedding_port=8080,
            memory_port=8765,
            session_ttl_seconds=28800,
            embedding_model='embeddinggemma-2-local',
        )
        embedding = self.module.render_embedding_run(config)
        memoryd = self.module.render_memoryd_run(config)
        self.assertIn('--host 127.0.0.1', embedding)
        self.assertIn('--port 8080', embedding)
        self.assertIn('--embedding', embedding)
        self.assertNotIn('0.0.0.0', embedding)
        self.assertNotIn('curl | sh', embedding)
        self.assertNotIn('wget', embedding)
        self.assertIn('127.0.0.1:8080', memoryd)
        self.assertIn("curl --noproxy '*' --fail", memoryd)
        self.assertIn('TRAMA_MEMORY_HOST="127.0.0.1"', memoryd)
        self.assertIn('TRAMA_MEMORY_PORT="8765"', memoryd)
        self.assertIn('TRAMA_MEMORY_ALLOWED_ORIGINS="http://127.0.0.1:4174"', memoryd)
        self.assertIn('main.py', memoryd)
        self.assertLess(memoryd.index('127.0.0.1:8080'), memoryd.index('main.py'))
        self.assertNotIn('0.0.0.0', memoryd)

    def test_boot_script_uses_termux_services_without_secrets(self):
        boot = self.module.render_boot_script(Path('/data/data/com.termux/files/usr'))
        self.assertIn('start-services.sh', boot)
        self.assertNotIn('TOKEN', boot.upper())
        self.assertNotIn('semantic-memory.token', boot)
        self.assertNotIn('curl', boot)
        self.assertNotIn('wget', boot)

    def test_boot_script_waits_for_runit_supervisors_before_sv_up(self):
        boot = self.module.render_boot_script(Path('/data/data/com.termux/files/usr'))
        embedding_ready = '$SVDIR/trama-embedding/supervise/ok'
        memory_ready = '$SVDIR/trama-memoryd/supervise/ok'
        self.assertIn(embedding_ready, boot)
        self.assertIn(memory_ready, boot)
        self.assertIn('while', boot)
        self.assertIn('sleep 1', boot)
        self.assertLess(boot.index(embedding_ready), boot.index('sv up trama-embedding'))
        self.assertLess(boot.index(memory_ready), boot.index('sv up trama-memoryd'))


if __name__ == '__main__':
    unittest.main()
