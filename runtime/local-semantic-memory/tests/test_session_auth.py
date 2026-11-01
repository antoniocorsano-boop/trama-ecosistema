import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


class _Clock:
    def __init__(self, value: float = 1_000.0):
        self.value = value

    def __call__(self) -> float:
        return self.value

    def advance(self, seconds: float) -> None:
        self.value += seconds


class SessionCapabilityStoreTests(unittest.TestCase):
    def test_issue_binds_capability_to_exact_origin(self):
        from session_auth import SessionCapabilityStore

        clock = _Clock()
        store = SessionCapabilityStore(ttl_seconds=60, now_fn=clock)
        capability = store.issue('http://127.0.0.1:4173')

        self.assertGreaterEqual(len(capability.token), 43)
        self.assertEqual(capability.origin, 'http://127.0.0.1:4173')
        self.assertEqual(capability.expires_at_epoch, 1060.0)
        self.assertTrue(store.matches(capability.token, 'http://127.0.0.1:4173'))
        self.assertFalse(store.matches(capability.token, 'http://localhost:4173'))
        self.assertFalse(store.matches(capability.token, None))

    def test_expired_capability_fails_and_is_removed_lazily(self):
        from session_auth import SessionCapabilityStore

        clock = _Clock()
        store = SessionCapabilityStore(ttl_seconds=60, now_fn=clock)
        capability = store.issue('http://127.0.0.1:4173')
        self.assertEqual(store.active_count(), 1)

        clock.advance(61)

        self.assertFalse(store.matches(capability.token, 'http://127.0.0.1:4173'))
        self.assertEqual(store.active_count(), 0)

    def test_each_issue_is_unique_and_restart_does_not_restore_capabilities(self):
        from session_auth import SessionCapabilityStore

        clock = _Clock()
        first_store = SessionCapabilityStore(ttl_seconds=60, now_fn=clock)
        first = first_store.issue('http://127.0.0.1:4173')
        second = first_store.issue('http://127.0.0.1:4173')

        self.assertNotEqual(first.token, second.token)
        self.assertEqual(first_store.active_count(), 2)

        restarted_store = SessionCapabilityStore(ttl_seconds=60, now_fn=clock)
        self.assertEqual(restarted_store.active_count(), 0)
        self.assertFalse(restarted_store.matches(first.token, 'http://127.0.0.1:4173'))


if __name__ == '__main__':
    unittest.main()
