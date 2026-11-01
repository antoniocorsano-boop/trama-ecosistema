import importlib
import json
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch


class _FakeResponse:
    def __init__(self, payload):
        self.status = 200
        self._payload = payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def read(self):
        return json.dumps(self._payload).encode('utf-8')


class _HealthOpener:
    def open(self, request, timeout=2):
        url = request.full_url
        if url.endswith('/v1/health'):
            return _FakeResponse({
                'schema': 'trama.semantic-memory-health/v1',
                'status': 'rebuild-required',
                'protocolVersion': 1,
                'modelId': 'embeddinggemma-2-local',
                'dimensions': 768,
                'indexRevision': '9',
            })
        return _FakeResponse({'status': 'ok'})


class ServiceStatusContractTests(unittest.TestCase):
    def setUp(self):
        self.module = importlib.import_module('trama_memory')
        supervisor = importlib.import_module('termux_supervisor')
        config = supervisor.SupervisorConfig(
            runtime_dir=Path('/data/data/com.termux/files/home/trama/runtime/local-semantic-memory'),
            llama_server=Path('/data/data/com.termux/files/usr/bin/llama-server'),
            model=Path('/data/data/com.termux/files/home/models/embeddinggemma-2.gguf'),
            memory_home=Path('/data/data/com.termux/files/home/.local/share/trama-semantic-memory'),
            allowed_origins=('http://127.0.0.1:4174',),
        )
        self.installed = self.module.InstalledStack(
            home=Path('/data/data/com.termux/files/home'),
            prefix=Path('/data/data/com.termux/files/usr'),
            config_path=Path('/data/data/com.termux/files/home/.config/trama-memory/config.env'),
            wrapper_path=Path('/data/data/com.termux/files/usr/bin/trama-memory'),
            service_root=Path('/data/data/com.termux/files/usr/var/service'),
            config=config,
        )

    def _running_runner(self, argv, **_kwargs):
        action = argv[1]
        if action == 'status':
            return SimpleNamespace(
                returncode=0,
                stdout=f'run: {argv[2]}: (pid 123) 10s\n',
                stderr='',
            )
        return SimpleNamespace(returncode=0, stdout='', stderr='')

    def test_status_reports_current_run_state_not_requested_state(self):
        calls = []

        def runner(argv, **_kwargs):
            calls.append(tuple(argv))
            return SimpleNamespace(
                returncode=0,
                stdout=f'down: {argv[2]}: 3s, normally up\n',
                stderr='',
            )

        status = self.module.status_stack(
            self.installed,
            runner=runner,
            health_check=lambda *_args, **_kwargs: False,
        )

        self.assertFalse(status['embedding_service'])
        self.assertFalse(status['memory_service'])
        self.assertEqual([call[1] for call in calls], ['status', 'status'])

    def test_status_does_not_report_rebuild_required_memory_as_ready(self):
        with patch.object(
            self.module.urllib.request,
            'build_opener',
            return_value=_HealthOpener(),
        ):
            status = self.module.status_stack(
                self.installed,
                runner=self._running_runner,
            )

        self.assertFalse(status['memory_ready'])
        self.assertEqual(status['memory_health_status'], 'rebuild-required')
        self.assertIn('ricostruzione richiesta', self.module.format_status(status).lower())

    def test_start_fails_closed_when_memory_health_requires_rebuild(self):
        with patch.object(
            self.module.urllib.request,
            'build_opener',
            return_value=_HealthOpener(),
        ), patch.object(self.module, '_loopback_port_in_use', return_value=False):
            with self.assertRaisesRegex(RuntimeError, '(?i:ricostruzione|rebuild)'):
                self.module.start_stack(
                    self.installed,
                    runner=self._running_runner,
                )


if __name__ == '__main__':
    unittest.main()
