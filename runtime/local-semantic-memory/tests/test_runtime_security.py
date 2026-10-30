import io, os, sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

class RuntimeSecurityTests(unittest.TestCase):
    def test_config_defaults_to_loopback_and_rejects_non_loopback(self):
        from config import load_runtime_config, ConfigError
        with tempfile.TemporaryDirectory() as td:
            env = {"TRAMA_MEMORY_HOME": td, "TRAMA_MEMORY_ALLOWED_ORIGINS": "https://example.test"}
            cfg = load_runtime_config(env)
            self.assertEqual(cfg.host, "127.0.0.1")
            for bad in ("0.0.0.0", "192.168.1.10", "example.com"):
                with self.assertRaises(ConfigError):
                    load_runtime_config({**env, "TRAMA_MEMORY_HOST": bad})

    def test_embedding_url_must_be_loopback(self):
        from config import load_runtime_config, ConfigError
        with tempfile.TemporaryDirectory() as td:
            env = {"TRAMA_MEMORY_HOME": td, "TRAMA_MEMORY_ALLOWED_ORIGINS": "https://example.test"}
            for bad in ("https://api.example.com/v1", "http://192.168.1.2:8080"):
                with self.assertRaises(ConfigError):
                    load_runtime_config({**env, "TRAMA_EMBEDDING_URL": bad})

    def test_token_is_stable_private_and_not_returned_by_health(self):
        from auth import load_or_create_local_token
        from config import load_runtime_config
        with tempfile.TemporaryDirectory() as td:
            env = {"TRAMA_MEMORY_HOME": td, "TRAMA_MEMORY_ALLOWED_ORIGINS": "https://example.test"}
            cfg = load_runtime_config(env)
            a = load_or_create_local_token(cfg.token_file)
            b = load_or_create_local_token(cfg.token_file)
            self.assertEqual(a, b)
            self.assertGreaterEqual(len(a), 43)
            if os.name == 'posix':
                self.assertEqual(os.stat(cfg.token_file).st_mode & 0o777, 0o600)

    def test_server_blocks_bad_origin_before_service_and_requires_bearer(self):
        from config import load_runtime_config
        from server import create_server
        class Service:
            def __init__(self): self.calls = 0
            def health(self): return {"schema":"trama.semantic-memory-health/v1","status":"ready"}
            def search(self, payload): self.calls += 1; return {"schema":"trama.semantic-memory-search-response/v1","hits":[]}
        with tempfile.TemporaryDirectory() as td:
            cfg = load_runtime_config({"TRAMA_MEMORY_HOME": td, "TRAMA_MEMORY_ALLOWED_ORIGINS":"https://allowed.test", "TRAMA_MEMORY_PORT":"0"})
            svc = Service(); server = create_server(cfg, svc)
            self.assertEqual(server.server_address[0], "127.0.0.1")
            self.assertEqual(svc.calls, 0)
            server.server_close()

if __name__ == '__main__': unittest.main()
