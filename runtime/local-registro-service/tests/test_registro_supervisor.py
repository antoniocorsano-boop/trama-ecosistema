import importlib
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


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
        self.assertIn("'Registro docente'", script)
        self.assertNotIn('cd /data/data/com.termux/files/home/Registro docente', script)

    def test_boot_script_is_bounded_service_specific_and_has_no_build_or_lsm_authority(self):
        boot = self.module.render_registro_boot(Path('/data/data/com.termux/files/usr'))
        self.assertIn('start-services.sh', boot)
        self.assertIn('$SVDIR/trama-registro/supervise/ok', boot)
        self.assertIn('seq 1 30', boot)
        self.assertIn('sv up trama-registro', boot)
        self.assertNotIn('trama-memory', boot)
        self.assertNotIn('trama-embedding', boot)
        self.assertNotIn('trama-memoryd', boot)
        lowered = boot.lower()
        self.assertNotIn('build', lowered)
        self.assertNotIn('git ', lowered)


if __name__ == '__main__':
    unittest.main()
