import importlib
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


class RegistroWorktreeIntegrityTests(unittest.TestCase):
    def setUp(self):
        self.module = importlib.import_module('trama_registro')
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.prefix = self.root / 'usr'
        self.home = self.root / 'home'
        self.app = self.home / 'registro-docente'
        (self.app / 'dist' / 'assets').mkdir(parents=True)
        (self.app / 'server.ts').write_text('// qualified server\n', encoding='utf-8')
        (self.app / 'package.json').write_text('{}\n', encoding='utf-8')
        (self.app / 'dist' / 'index.html').write_text('<div id="root"></div>\n', encoding='utf-8')
        (self.app / 'dist' / 'assets' / 'app.js').write_text('console.log("qualified")\n', encoding='utf-8')
        self.runtime = self.prefix / 'bin' / 'node'
        self.runtime.parent.mkdir(parents=True)
        self.runtime.write_text('#!/bin/sh\n', encoding='utf-8')
        self.runtime.chmod(0o755)

        self._git('init')
        self._git('config', 'user.name', 'TRAMA Test')
        self._git('config', 'user.email', 'trama-test@example.invalid')
        self._git('add', 'server.ts', 'package.json', 'dist/index.html', 'dist/assets/app.js')
        self._git('commit', '-m', 'qualified candidate')
        self.sha = self._git('rev-parse', 'HEAD').stdout.strip()

    def tearDown(self):
        self.temp.cleanup()

    def _git(self, *args):
        return subprocess.run(
            ['git', '-C', str(self.app), *args],
            check=True,
            text=True,
            capture_output=True,
        )

    def test_install_rejects_dirty_tracked_source_before_publishing_service(self):
        (self.app / 'server.ts').write_text('// dirty before install\n', encoding='utf-8')
        with self.assertRaisesRegex(RuntimeError, 'worktree|modific|sporco|dirty'):
            self.module.install_service(
                app_dir=self.app,
                runtime_command=self.runtime,
                candidate_sha=self.sha,
                prefix=self.prefix,
                home=self.home,
            )
        self.assertFalse((self.prefix / 'bin' / 'trama-registro').exists())
        self.assertFalse((self.home / '.config' / 'trama-registro' / 'config.env').exists())

    def test_start_rejects_dirty_tracked_source_even_when_head_and_dist_are_unchanged(self):
        installed = self.module.install_service(
            app_dir=self.app,
            runtime_command=self.runtime,
            candidate_sha=self.sha,
            prefix=self.prefix,
            home=self.home,
        )
        (self.app / 'server.ts').write_text('// modified without commit\n', encoding='utf-8')
        self.assertEqual(self._git('rev-parse', 'HEAD').stdout.strip(), self.sha)

        commands = []

        def runner(args, **kwargs):
            commands.append(tuple(str(value) for value in args))
            class Result:
                returncode = 1 if 'status' in args else 0
                stdout = 'down: service: 1s\n' if 'status' in args else ''
                stderr = ''
            return Result()

        with patch.object(self.module, '_loopback_port_in_use', return_value=False):
            with self.assertRaisesRegex(RuntimeError, 'worktree|modific|sporco|dirty'):
                self.module.start_service(installed, runner=runner)

        self.assertEqual(commands, [])


if __name__ == '__main__':
    unittest.main()
