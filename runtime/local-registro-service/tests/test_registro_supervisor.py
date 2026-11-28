import importlib
import shlex
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

TERMUX_SH = '#!/data/data/com.termux/files/usr/bin/sh'


class RegistroSupervisorContractTests(unittest.TestCase):
    def setUp(self):
        self.module = importlib.import_module('registro_supervisor')

    def make_config(self, **overrides):
        Config = self.module.RegistroSupervisorConfig
        values = {
            'app_dir': Path('/data/data/com.termux/files/home/registro-docente'),
            'runtime_command': Path('/data/data/com.termux/files/usr/bin/node'),
            'candidate_sha': 'a' * 40,
            'port': 4173,
        }
        values.update(overrides)
        return Config(**values)

    def test_defaults_are_loopback_only_and_use_port_4173(self):
        config = self.make_config()
        self.assertEqual(config.bind_host, '127.0.0.1')
        self.assertEqual(config.port, 4173)

    def test_reserved_lsm_ports_are_rejected(self):
        for port in (8080, 8765):
            with self.subTest(port=port):
                with self.assertRaises(ValueError):
                    self.make_config(port=port)

    def test_run_script_is_production_loopback_only_and_never_builds_or_updates(self):
        script = self.module.render_registro_run(self.make_config())
        self.assertEqual(script.splitlines()[0], TERMUX_SH)
        self.assertIn('exec 2>&1', script)
        self.assertIn("NODE_ENV='production'", script)
        self.assertIn("PORT='4173'", script)
        self.assertIn("TRAMA_BIND_HOST='127.0.0.1'", script)
        self.assertIn("cd '/data/data/com.termux/files/home/registro-docente'", script)
        self.assertIn("exec '/data/data/com.termux/files/usr/bin/node' server.ts", script)
        lowered = script.lower()
        for forbidden in ('git pull', 'git fetch', 'npm install', 'bun install', 'npm run build', 'bun run build', 'wget', 'curl | sh'):
            with self.subTest(forbidden=forbidden):
                self.assertNotIn(forbidden, lowered)
        self.assertNotIn('0.0.0.0', script)

    def test_run_script_shell_quotes_paths(self):
        config = self.make_config(
            app_dir=Path("/data/data/com.termux/files/home/Registro docente's local"),
            runtime_command=Path('/data/data/com.termux/files/usr/bin/node runtime'),
        )
        script = self.module.render_registro_run(config)
        self.assertIn(f'cd {shlex.quote(str(config.app_dir))}', script)
        self.assertIn(f'exec {shlex.quote(str(config.runtime_command))} server.ts', script)
        self.assertNotIn('cd /data/data/com.termux/files/home/Registro docente', script)

    def test_log_script_uses_termux_services_svlogger_without_arguments(self):
        prefix = Path('/data/data/com.termux/files/usr')
        script = self.module.render_log_run(prefix)
        self.assertEqual(script.splitlines()[0], TERMUX_SH)
        expected = prefix / 'share' / 'termux-services' / 'svlogger'
        exec_line = next(line for line in script.splitlines() if line.startswith('exec '))
        self.assertEqual(shlex.split(exec_line), ['exec', str(expected)])
        self.assertNotIn(str(prefix / 'bin' / 'svlogger'), script)
        self.assertNotIn('-tt', script)
        self.assertNotIn(str(prefix / 'var' / 'log' / 'sv' / 'trama-registro'), exec_line)

    def test_boot_script_is_bounded_service_specific_and_has_no_build_or_lsm_authority(self):
        prefix = Path('/data/data/com.termux/files/usr')
        boot = self.module.render_registro_boot(prefix)
        self.assertEqual(boot.splitlines()[0], TERMUX_SH)
        self.assertIn('termux-wake-lock', boot)
        self.assertIn('start-services.sh', boot)
        self.assertLess(boot.index('termux-wake-lock'), boot.index('start-services.sh'))
        self.assertIn('$SVDIR/trama-registro/supervise/ok', boot)
        self.assertIn('seq 1 30', boot)
        start_line = next(line for line in boot.splitlines() if line.endswith(' start'))
        self.assertEqual(
            shlex.split(start_line),
            [str(prefix / 'bin' / 'trama-registro'), 'start'],
        )
        self.assertNotIn(' up trama-registro', boot)
        self.assertNotIn('trama-memory', boot)
        self.assertNotIn('trama-embedding', boot)
        self.assertNotIn('trama-memoryd', boot)
        lowered = boot.lower()
        self.assertNotIn('build', lowered)
        self.assertNotIn('git ', lowered)


if __name__ == '__main__':
    unittest.main()
