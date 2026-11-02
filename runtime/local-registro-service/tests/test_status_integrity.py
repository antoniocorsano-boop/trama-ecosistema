import importlib
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


class RegistroStatusIntegrityTests(unittest.TestCase):
    def setUp(self):
        self.module = importlib.import_module('trama_registro')
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.prefix = self.root / 'usr'
        self.home = self.root / 'home'
        self.app = self.home / 'registro-docente'
        (self.app / 'dist' / 'assets').mkdir(parents=True)
        (self.app / 'server.ts').write_text('// server\n', encoding='utf-8')
        (self.app / 'package.json').write_text('{}\n', encoding='utf-8')
        (self.app / 'dist' / 'index.html').write_text('<div id="root"></div>\n', encoding='utf-8')
        (self.app / 'dist' / 'assets' / 'app.js').write_text('console.log("v1")\n', encoding='utf-8')
        self.runtime = self.prefix / 'bin' / 'node'
        self.runtime.parent.mkdir(parents=True)
        self.runtime.write_text('#!/bin/sh\n', encoding='utf-8')
        self.runtime.chmod(0o755)
        self.sha = 'b' * 40

    def tearDown(self):
        self.temp.cleanup()

    def test_status_never_reports_http_ready_when_candidate_identity_has_drifted(self):
        installed = self.module.install_service(
            app_dir=self.app,
            runtime_command=self.runtime,
            candidate_sha=self.sha,
            prefix=self.prefix,
            home=self.home,
            git_head_resolver=lambda _app: self.sha,
        )
        (self.app / 'dist' / 'assets' / 'app.js').write_text('console.log("v2")\n', encoding='utf-8')

        with patch.object(self.module, '_service_is_active', return_value=True), patch.object(
            self.module,
            '_default_http_get',
            return_value=(200, '<div id="root"></div>'),
        ) as http_get:
            status = self.module.status_service(installed)

        self.assertTrue(status['serviceActive'])
        self.assertFalse(status['identityVerified'])
        self.assertFalse(status['httpReady'])
        http_get.assert_not_called()


if __name__ == '__main__':
    unittest.main()
