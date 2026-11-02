import importlib
import os
import shlex
import stat
import sys
import tempfile
import unittest
from dataclasses import replace
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

TERMUX_SH = '#!/data/data/com.termux/files/usr/bin/sh'


class RegistroServiceTests(unittest.TestCase):
    def setUp(self):
        self.module = importlib.import_module('trama_registro')
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.prefix = self.root / 'usr'
        self.home = self.root / 'home'
        self.app = self.home / 'registro-docente'
        self.app.mkdir(parents=True)
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

    def install(self, **overrides):
        values = dict(
            app_dir=self.app,
            runtime_command=self.runtime,
            candidate_sha=self.sha,
            prefix=self.prefix,
            home=self.home,
            git_head_resolver=lambda _app: self.sha,
        )
        values.update(overrides)
        return self.module.install_service(**values)

    def test_install_requires_prebuilt_dist_and_exact_candidate(self):
        (self.app / 'dist' / 'index.html').unlink()
        with self.assertRaisesRegex(RuntimeError, 'dist/index.html'):
            self.install()
        (self.app / 'dist' / 'index.html').write_text('<div id="root"></div>\n', encoding='utf-8')
        with self.assertRaisesRegex(RuntimeError, 'SHA|candidate|checkout'):
            self.install(git_head_resolver=lambda _app: 'c' * 40)

    def test_install_writes_config_wrapper_service_log_and_initial_down_marker(self):
        installed = self.install()
        self.assertEqual(installed.port, 4173)
        self.assertTrue(installed.config_path.exists())
        self.assertEqual(stat.S_IMODE(installed.config_path.stat().st_mode), 0o600)
        self.assertTrue(installed.wrapper_path.exists())
        self.assertEqual(stat.S_IMODE(installed.wrapper_path.stat().st_mode), 0o755)
        self.assertTrue((installed.service_dir / 'run').exists())
        self.assertTrue((installed.service_dir / 'down').exists())
        self.assertTrue((installed.service_dir / 'log' / 'run').exists())
        run = (installed.service_dir / 'run').read_text(encoding='utf-8')
        log_run = (installed.service_dir / 'log' / 'run').read_text(encoding='utf-8')
        wrapper = installed.wrapper_path.read_text(encoding='utf-8')
        self.assertEqual(run.splitlines()[0], TERMUX_SH)
        self.assertEqual(log_run.splitlines()[0], TERMUX_SH)
        self.assertEqual(wrapper.splitlines()[0], TERMUX_SH)
        self.assertIn("TRAMA_BIND_HOST='127.0.0.1'", run)
        self.assertIn("PORT='4173'", run)
        self.assertNotIn('build', run.lower())
        self.assertNotIn('git ', run.lower())

    def test_install_freezes_the_entire_dist_tree_not_only_index_html(self):
        installed = self.install()
        (self.app / 'dist' / 'assets' / 'app.js').write_text('console.log("v2")\n', encoding='utf-8')
        with self.assertRaisesRegex(RuntimeError, 'Build Registro cambiata|dist'):
            self.module._verify_installed_identity(installed)

    def test_install_rolls_back_partial_publish_atomically(self):
        installed = self.install()
        targets = [
            installed.config_path,
            installed.wrapper_path,
            installed.service_dir / 'down',
            installed.service_dir / 'log' / 'run',
            installed.service_dir / 'run',
        ]
        for index, path in enumerate(targets):
            path.write_text(f'baseline-{index}\n', encoding='utf-8')
        before = {
            path: (path.read_bytes(), stat.S_IMODE(path.stat().st_mode))
            for path in targets
        }
        original_atomic_write = self.module._atomic_write
        calls = {'count': 0}

        def flaky_atomic_write(path, content, mode):
            calls['count'] += 1
            if calls['count'] == 5:
                raise OSError('simulated publish failure')
            return original_atomic_write(path, content, mode)

        with patch.object(self.module, '_atomic_write', side_effect=flaky_atomic_write):
            with self.assertRaisesRegex(OSError, 'simulated publish failure'):
                self.install(port=4174)

        for path, (content, mode) in before.items():
            self.assertEqual(path.read_bytes(), content)
            self.assertEqual(stat.S_IMODE(path.stat().st_mode), mode)

    def test_persisted_config_reloads_for_a_new_process_start(self):
        installed = self.install()
        loaded = self.module.load_installed(prefix=self.prefix, home=self.home)
        self.assertEqual(loaded.app_dir, installed.app_dir)
        self.assertEqual(loaded.runtime_command, installed.runtime_command)
        self.assertEqual(loaded.candidate_sha, installed.candidate_sha)
        self.assertEqual(loaded.port, installed.port)
        self.assertEqual(loaded.dist_digest, installed.dist_digest)

        loaded = replace(loaded, git_head_resolver=lambda _app: self.sha)
        commands = []

        def runner(args, **kwargs):
            rendered = tuple(str(value) for value in args)
            commands.append(rendered)
            class Result:
                returncode = 1 if 'status' in rendered else 0
                stdout = 'down: service: 1s\n' if 'status' in rendered else ''
                stderr = ''
            return Result()

        with patch.object(self.module, '_loopback_port_in_use', return_value=False):
            self.module.start_service(loaded, runner=runner)

        actions = [command[1] for command in commands if len(command) > 1]
        self.assertEqual(actions, ['status', 'up'])

    def test_start_fails_closed_on_external_listener_and_never_kills_it(self):
        installed = self.install()
        commands = []

        def runner(args, **kwargs):
            rendered = tuple(str(value) for value in args)
            commands.append(rendered)
            class Result:
                returncode = 1 if 'status' in rendered else 0
                stdout = 'down: service: 1s\n' if 'status' in rendered else ''
                stderr = ''
            return Result()

        with patch.object(self.module, '_loopback_port_in_use', return_value=True):
            with self.assertRaisesRegex(RuntimeError, 'non supervisionato|legacy|4173'):
                self.module.start_service(installed, runner=runner)

        rendered = ' '.join(' '.join(command) for command in commands).lower()
        self.assertNotIn('kill', rendered)
        self.assertNotIn('pkill', rendered)

    def test_running_service_proves_listener_ownership_by_stop_release_restart(self):
        installed = self.install()
        commands = []
        port_states = iter([True, False])

        def runner(args, **kwargs):
            rendered = tuple(str(value) for value in args)
            commands.append(rendered)
            class Result:
                returncode = 0
                stdout = 'run: service: (pid 42) 10s\n' if 'status' in rendered else ''
                stderr = ''
            return Result()

        with patch.object(self.module, '_loopback_port_in_use', side_effect=lambda _port: next(port_states, False)):
            self.module.start_service(installed, runner=runner, sleep=lambda _seconds: None)

        actions = [command[1] for command in commands if len(command) > 1]
        self.assertIn('status', actions)
        self.assertIn('down', actions)
        self.assertIn('up', actions)
        self.assertLess(actions.index('down'), actions.index('up'))

    def test_running_service_waits_for_delayed_port_release_before_restart(self):
        installed = self.install()
        commands = []
        port_states = iter([True, True, True, False])
        sleeps = []

        def runner(args, **kwargs):
            rendered = tuple(str(value) for value in args)
            commands.append(rendered)
            class Result:
                returncode = 0
                stdout = 'run: service: (pid 42) 10s\n' if 'status' in rendered else ''
                stderr = ''
            return Result()

        with patch.object(
            self.module,
            '_loopback_port_in_use',
            side_effect=lambda _port: next(port_states, False),
        ):
            self.module.start_service(
                installed,
                runner=runner,
                sleep=lambda seconds: sleeps.append(seconds),
            )

        actions = [command[1] for command in commands if len(command) > 1]
        self.assertEqual(actions, ['status', 'down', 'up'])
        self.assertEqual(sleeps, [0.1, 0.1])

    def test_smoke_requires_http_200_and_root_marker_without_mutation(self):
        installed = self.install()
        with patch.object(self.module, 'start_service') as start:
            result = self.module.smoke_service(
                installed,
                http_get=lambda _url: (200, '<!doctype html><div id="root"></div>'),
            )
        start.assert_called_once()
        self.assertTrue(result)

    def test_boot_install_is_service_specific_and_idempotent(self):
        installed = self.install()
        first = self.module.install_boot(installed)
        second = self.module.install_boot(installed)
        self.assertEqual(first, second)
        text = first.read_text(encoding='utf-8')
        self.assertEqual(text.splitlines()[0], TERMUX_SH)
        self.assertIn('30-trama-registro', str(first))
        up_line = next(line for line in text.splitlines() if line.endswith(' up trama-registro'))
        self.assertEqual(
            shlex.split(up_line),
            [str(installed.prefix / 'bin' / 'sv'), 'up', 'trama-registro'],
        )
        self.assertNotIn('trama-memory', text)
        self.assertNotIn('build', text.lower())


if __name__ == '__main__':
    unittest.main()
