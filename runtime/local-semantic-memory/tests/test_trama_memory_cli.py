import importlib
import io
import os
import tempfile
import unittest
from pathlib import Path
from contextlib import redirect_stdout


class TramaMemoryCliContractTests(unittest.TestCase):
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

    def install(self):
        return self.module.install_stack(
            home=self.home,
            prefix=self.prefix,
            runtime_dir=self.runtime,
            llama_server=self.llama,
            model=self.model,
            origins=('http://127.0.0.1:4174',),
        )

    def test_install_creates_nonsecret_config_wrapper_and_two_disabled_services(self):
        installed = self.install()
        config = installed.config_path.read_text(encoding='utf-8')
        self.assertIn('TRAMA_ALLOWED_ORIGINS=', config)
        self.assertIn('http://127.0.0.1:4174', config)
        self.assertIn(str(self.model), config)
        self.assertNotIn('TOKEN=', config.upper())
        self.assertNotIn('semantic-memory.token', config)

        wrapper = installed.wrapper_path.read_text(encoding='utf-8')
        self.assertIn('trama_memory.py', wrapper)
        self.assertIn('"$@"', wrapper)
        self.assertTrue(os.access(installed.wrapper_path, os.X_OK))

        for service_name in ('trama-embedding', 'trama-memoryd'):
            service = installed.service_root / service_name
            self.assertTrue((service / 'run').is_file())
            self.assertTrue(os.access(service / 'run', os.X_OK))
            self.assertTrue((service / 'down').is_file())

        all_text = '\n'.join(
            path.read_text(encoding='utf-8')
            for path in (installed.config_path, installed.wrapper_path,
                         installed.service_root / 'trama-embedding' / 'run',
                         installed.service_root / 'trama-memoryd' / 'run')
        )
        self.assertNotIn('curl | sh', all_text)
        self.assertNotIn('wget ', all_text)

    def test_install_fails_before_writes_for_missing_inputs_or_unsafe_origin(self):
        service_root = self.prefix / 'var' / 'service'
        config_path = self.home / '.config' / 'trama-memory' / 'config.env'

        missing = self.home / 'models' / 'missing.gguf'
        with self.assertRaises(ValueError):
            self.module.install_stack(
                home=self.home,
                prefix=self.prefix,
                runtime_dir=self.runtime,
                llama_server=self.llama,
                model=missing,
                origins=('http://127.0.0.1:4174',),
            )
        self.assertFalse(config_path.exists())
        self.assertFalse((service_root / 'trama-embedding').exists())
        self.assertFalse((service_root / 'trama-memoryd').exists())

        with self.assertRaises(ValueError):
            self.module.install_stack(
                home=self.home,
                prefix=self.prefix,
                runtime_dir=self.runtime,
                llama_server=self.llama,
                model=self.model,
                origins=('*',),
            )
        self.assertFalse(config_path.exists())

    def test_lifecycle_starts_embedding_before_memoryd_and_stops_in_reverse(self):
        installed = self.install()
        commands = []
        probes = []

        def runner(args, **kwargs):
            commands.append(tuple(str(value) for value in args))
            class Result:
                returncode = 0
                stdout = 'run: service: (pid 1) 1s\n'
                stderr = ''
            return Result()

        def health(url, timeout_seconds=0):
            probes.append(url)
            return True

        self.module.start_stack(installed, runner=runner, health_check=health)
        embedding_up = next(i for i, cmd in enumerate(commands) if 'up' in cmd and 'trama-embedding' in ' '.join(cmd))
        memory_up = next(i for i, cmd in enumerate(commands) if 'up' in cmd and 'trama-memoryd' in ' '.join(cmd))
        self.assertLess(embedding_up, memory_up)
        self.assertEqual(probes, [
            'http://127.0.0.1:8080/health',
            'http://127.0.0.1:8765/v1/health',
        ])

        commands.clear()
        self.module.stop_stack(installed, runner=runner)
        memory_down = next(i for i, cmd in enumerate(commands) if 'down' in cmd and 'trama-memoryd' in ' '.join(cmd))
        embedding_down = next(i for i, cmd in enumerate(commands) if 'down' in cmd and 'trama-embedding' in ' '.join(cmd))
        self.assertLess(memory_down, embedding_down)

    def test_status_and_boot_install_are_secret_free(self):
        installed = self.install()

        def runner(args, **kwargs):
            class Result:
                returncode = 0
                stdout = 'run: service: (pid 7) 3s\n'
                stderr = ''
            return Result()

        status = self.module.status_stack(installed, runner=runner, health_check=lambda url, timeout_seconds=0: True)
        rendered = self.module.format_status(status)
        self.assertIn('Embedding', rendered)
        self.assertIn('Memoria', rendered)
        self.assertNotIn('token', rendered.lower())
        self.assertNotIn('bearer', rendered.lower())

        boot = self.module.install_boot(home=self.home, prefix=self.prefix)
        text = boot.read_text(encoding='utf-8')
        self.assertIn('start-services.sh', text)
        self.assertNotIn('token', text.lower())
        self.assertTrue(os.access(boot, os.X_OK))

    def test_install_output_frames_termux_start_as_one_time_and_daily_use_as_browser_activation(self):
        output = io.StringIO()
        argv = [
            'install',
            '--model', str(self.model),
            '--origin', 'http://127.0.0.1:4174',
            '--runtime-dir', str(self.runtime),
            '--llama-server', str(self.llama),
            '--home', str(self.home),
            '--prefix', str(self.prefix),
        ]
        with redirect_stdout(output):
            result = self.module.main(argv)
        self.assertEqual(result, 0)
        rendered = output.getvalue().lower()
        self.assertNotIn('avvio quotidiano: trama-memory start', rendered)
        self.assertIn('prima attivazione', rendered)
        self.assertIn('attiva memoria locale', rendered)

    def test_parser_exposes_single_command_lifecycle(self):
        parser = self.module.build_parser()
        for command in ('install', 'start', 'stop', 'status', 'install-boot'):
            with self.subTest(command=command):
                args = parser.parse_args([command] + (
                    ['--model', str(self.model), '--origin', 'http://127.0.0.1:4174',
                     '--runtime-dir', str(self.runtime), '--llama-server', str(self.llama),
                     '--home', str(self.home), '--prefix', str(self.prefix)]
                    if command == 'install' else
                    ['--home', str(self.home), '--prefix', str(self.prefix)]
                ))
                self.assertEqual(args.command, command)


if __name__ == '__main__':
    unittest.main()
