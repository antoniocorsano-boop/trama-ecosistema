"""Offline tests for FD-03 anonymous access classification."""
import unittest
from scripts import free_deploy_access as access


class AccessTests(unittest.TestCase):
    def setUp(self):
        self.team = "example.cloudflareaccess.com"
        self.host = access.BASE
        self.login = f"https://{self.team}/cdn-cgi/access/login/{self.host}?example=redacted"

    def test_inventory_requires_base_and_preview(self):
        with self.assertRaises(ValueError):
            access.validate_inventory([self.host], self.team)
        with self.assertRaises(ValueError):
            access.validate_inventory([self.host, "wrong.pages.dev"], self.team)
        self.assertEqual(access.validate_inventory(
            [self.host, "abc123." + self.host], self.team),
            [self.host, "abc123." + self.host])

    def test_reject_duplicate_and_untrusted_team(self):
        for hosts, team in [
            ([self.host, self.host], self.team),
            ([self.host, "abc." + self.host], "evil.example"),
            ([self.host, "abc." + self.host], "a.cloudflareaccess.com.evil.example"),
        ]:
            with self.assertRaises(ValueError):
                access.validate_inventory(hosts, team)

    def test_exact_login_challenge(self):
        self.assertEqual(access.classify(302, self.login, self.team, self.host),
                         "ACCESS_LOGIN_REDIRECT")
        for location in (
            "https://evil.example/cdn-cgi/access/login/" + self.host,
            "https://" + self.team + "/other",
            "https://" + self.team + "/cdn-cgi/access/login/wrong.pages.dev",
            "http://" + self.team + "/cdn-cgi/access/login/" + self.host,
        ):
            self.assertEqual(access.classify(302, location, self.team, self.host),
                             "INCONCLUSIVE")

    def test_http_status_does_not_prove_privacy(self):
        self.assertEqual(access.classify(200, "", self.team, self.host),
                         "UNEXPECTED_SUCCESS")
        for status in (401, 403, 404, 500):
            self.assertEqual(access.classify(status, "", self.team, self.host),
                             "INCONCLUSIVE")

    def test_all_hosts_and_assets_including_range(self):
        hosts = [self.host, "abc." + self.host]
        calls = []
        def probe(host, route, team, ranged=False):
            calls.append((host, route, ranged))
            return "ACCESS_LOGIN_REDIRECT"
        report = access.assess(hosts, self.team, probe)
        self.assertEqual(report["state"], "ANONYMOUS_CHALLENGES_OBSERVED")
        self.assertEqual(len(calls), len(hosts) * len(access.ROUTES) + len(hosts))
        self.assertIn((self.host, "/media/tone.mp3", True), calls)
        self.assertFalse(report["privacyQualified"])
        self.assertFalse(report["deployAuthorized"])
        self.assertFalse(report["studentPublicationAuthorized"])

    def test_one_exposed_asset_blocks_all(self):
        def probe(host, route, team, ranged=False):
            return "UNEXPECTED_SUCCESS" if route == "/media/marker.webp" else "ACCESS_LOGIN_REDIRECT"
        report = access.assess([self.host, "abc." + self.host], self.team, probe)
        self.assertEqual(report["state"], "BLOCKED")
        self.assertFalse(report["privacyQualified"])

    def test_unknown_response_blocks_all(self):
        report = access.assess([self.host, "abc." + self.host], self.team,
                               lambda *a, **k: "INCONCLUSIVE")
        self.assertEqual(report["state"], "BLOCKED")


if __name__ == "__main__":
    unittest.main()
