import importlib.util, sys, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT/'runtime'/'local-semantic-memory'
sys.path.insert(0, str(RUNTIME))


class RuntimeBoundaryTests(unittest.TestCase):
    def test_production_routes_are_narrow_and_have_no_generic_power_endpoints(self):
        import server
        self.assertEqual(set(server.POST_ROUTES), {'/v1/projections/upsert','/v1/projections/remove','/v1/search'})
        self.assertEqual(server.KNOWN_PATHS, {'/v1/health','/v1/projections/upsert','/v1/projections/remove','/v1/search'})
        joined = ' '.join(server.KNOWN_PATHS).lower()
        for word in ('sql','shell','file','filesystem','download','exec','command'):
            self.assertNotIn(word, joined)

    def test_launcher_and_main_do_not_download_or_execute_remote_content(self):
        text = '\n'.join((RUNTIME/name).read_text(encoding='utf-8') for name in ('run_termux.sh','main.py'))
        lowered = text.lower()
        for marker in ('wget ', 'curl ', 'http://github', 'https://github', '--model-url', 'subprocess', 'os.system', 'shell=true'):
            self.assertNotIn(marker, lowered)
        self.assertNotIn('TRAMA_MEMORY_ALLOWED_ORIGINS=*', text)

    def test_loopback_and_embedding_constraints_remain_explicit(self):
        import config
        self.assertEqual(config.LOOPBACK_HOSTS, {'127.0.0.1','localhost','::1'})
        with self.assertRaises(config.ConfigError):
            config.load_runtime_config({'TRAMA_MEMORY_HOST':'0.0.0.0','TRAMA_MEMORY_ALLOWED_ORIGINS':'https://app.example.test'})
        with self.assertRaises(config.ConfigError):
            config.load_runtime_config({'TRAMA_MEMORY_ALLOWED_ORIGINS':'https://app.example.test','TRAMA_EMBEDDING_URL':'https://example.com/v1'})


if __name__ == '__main__': unittest.main()
