import importlib
import unittest
from pathlib import Path
from types import SimpleNamespace


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

    def test_status_reports_current_run_state_not_requested_state(self):
        calls = []

        def runner(argv, **_kwargs):
            calls.append(tuple(argv))
            service = Path(argv[2]).name
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


if __name__ == '__main__':
    unittest.main()
