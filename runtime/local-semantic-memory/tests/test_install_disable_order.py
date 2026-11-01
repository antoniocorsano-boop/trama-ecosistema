import importlib
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


class InstallDisableOrderContractTests(unittest.TestCase):
    def setUp(self):
        self.module = importlib.import_module('trama_memory')
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        root = Path(self.tmp.name)
        self.home = root / 'home'
        self.prefix = root / 'usr'
        self.runtime = root / 'runtime'
        self.home.mkdir()
        (self.prefix / 'bin').mkdir(parents=True)
        self.runtime.mkdir()
        (self.runtime / 'main.py').write_text('print("runtime")\n', encoding='utf-8')
        (self.runtime / 'trama_memory.py').write_text('# cli placeholder\n', encoding='utf-8')
        self.llama = self.prefix / 'bin' / 'llama-server'
        self.llama.write_text('#!/bin/sh\nexit 0\n', encoding='utf-8')
        self.llama.chmod(0o700)
        self.model = self.home / 'models' / 'embeddinggemma-2.gguf'
        self.model.parent.mkdir()
        self.model.write_bytes(b'gguf-synthetic')

    def _install(self):
        return self.module.install_stack(
            home=self.home,
            prefix=self.prefix,
            runtime_dir=self.runtime,
            llama_server=self.llama,
            model=self.model,
            origins=('http://127.0.0.1:4174',),
        )

    def test_install_writes_down_marker_before_run_script_for_each_service(self):
        writes = []
        real_atomic_write = self.module._atomic_write

        def recording_write(path, content, mode):
            writes.append(Path(path))
            return real_atomic_write(path, content, mode)

        with patch.object(self.module, '_atomic_write', side_effect=recording_write):
            installed = self._install()

        for service_name in ('trama-embedding', 'trama-memoryd'):
            service = installed.service_root / service_name
            self.assertLess(
                writes.index(service / 'down'),
                writes.index(service / 'run'),
                f'{service_name}: il marker down deve esistere prima che runsvdir possa vedere il run script',
            )

    def test_install_wires_svlogger_for_each_service(self):
        installed = self._install()

        for service_name in ('trama-embedding', 'trama-memoryd'):
            log_run = installed.service_root / service_name / 'log' / 'run'
            self.assertTrue(log_run.is_file(), f'{service_name}: manca log/run')
            self.assertTrue(log_run.stat().st_mode & 0o111, f'{service_name}: log/run non eseguibile')
            content = log_run.read_text(encoding='utf-8')
            self.assertIn(str(self.prefix / 'share' / 'termux-services' / 'svlogger'), content)
            self.assertNotIn('TOKEN', content.upper())


if __name__ == '__main__':
    unittest.main()
