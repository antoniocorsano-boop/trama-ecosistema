import importlib
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


class SupervisedOwnershipContractTests(unittest.TestCase):
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
        self.installed = self.module.install_stack(
            home=self.home,
            prefix=self.prefix,
            runtime_dir=self.runtime,
            llama_server=self.llama,
            model=self.model,
            origins=('http://127.0.0.1:4174',),
        )

    def test_start_fails_closed_when_listener_is_not_owned_by_running_runit_service(self):
        commands = []

        def runner(args, **kwargs):
            rendered = tuple(str(value) for value in args)
            commands.append(rendered)

            class Result:
                stdout = 'down: service: 1s, normally up\n' if 'status' in rendered else ''
                stderr = ''
                returncode = 0

            return Result()

        with patch.object(self.module, '_loopback_port_in_use', return_value=True, create=True):
            with self.assertRaisesRegex(RuntimeError, '(?i:non supervisionato|già in uso|occupat)'):
                self.module.start_stack(
                    self.installed,
                    runner=runner,
                    health_check=lambda *args, **kwargs: True,
                )

        rendered = [' '.join(command) for command in commands]
        self.assertTrue(any('status' in command and 'trama-embedding' in command for command in rendered))
        self.assertFalse(any('up' in command and 'trama-embedding' in command for command in rendered))

    def test_running_service_does_not_claim_listener_that_survives_service_down(self):
        commands = []

        def runner(args, **kwargs):
            rendered = tuple(str(value) for value in args)
            commands.append(rendered)

            class Result:
                stdout = 'run: service: (pid 42) 12s\n' if 'status' in rendered else ''
                stderr = ''
                returncode = 0

            return Result()

        with patch.object(self.module, '_loopback_port_in_use', side_effect=[True, True]):
            with self.assertRaisesRegex(RuntimeError, '(?i:non supervisionato|già in uso|occupat)'):
                self.module._ensure_listener_is_supervised(
                    self.installed,
                    'trama-memoryd',
                    8765,
                    runner=runner,
                )

        actions = [command[1] for command in commands]
        self.assertEqual(actions[:2], ['status', 'down'])
        self.assertNotIn('up', actions)

    def test_running_service_restores_itself_after_causal_listener_ownership_probe(self):
        commands = []

        def runner(args, **kwargs):
            rendered = tuple(str(value) for value in args)
            commands.append(rendered)

            class Result:
                stdout = 'run: service: (pid 42) 12s\n' if 'status' in rendered else ''
                stderr = ''
                returncode = 0

            return Result()

        with patch.object(self.module, '_loopback_port_in_use', side_effect=[True, False]):
            self.module._ensure_listener_is_supervised(
                self.installed,
                'trama-memoryd',
                8765,
                runner=runner,
            )

        actions = [command[1] for command in commands]
        self.assertEqual(actions, ['status', 'down', 'up'])

    def test_status_parses_actual_sv_status_output_instead_of_requested_state(self):
        commands = []

        def runner(args, **kwargs):
            rendered = tuple(str(value) for value in args)
            commands.append(rendered)

            class Result:
                stdout = 'down: service: 1s, normally up\n'
                stderr = ''
                returncode = 0

            return Result()

        status = self.module.status_stack(
            self.installed,
            runner=runner,
            health_check=lambda *args, **kwargs: False,
        )

        self.assertFalse(status['embedding_service'])
        self.assertFalse(status['memory_service'])
        rendered = [' '.join(command) for command in commands]
        self.assertTrue(any('status' in command and 'trama-embedding' in command for command in rendered))
        self.assertTrue(any('status' in command and 'trama-memoryd' in command for command in rendered))
        self.assertFalse(any(' check ' in f' {command} ' for command in rendered))


if __name__ == '__main__':
    unittest.main()
