import json
import tempfile
import unittest
from pathlib import Path
from test_trama_t1_events import bundle, policy
from scripts.trama_t1_events import Ledger
from scripts.trama_t1_github_source import GitHubReadSource, SourceError

REPO = "owner/repo"
SHA = "a" * 40

class Response:
    def __init__(self, status=200, data=None, link="", raw=None):
        self.status, self.link = status, link
        self.payload = raw if raw is not None else json.dumps(data).encode()
    def read(self, size):
        return self.payload[:size]
    def getheader(self, name, default):
        return self.link if name == "Link" else default

class Transport:
    def __init__(self, response):
        self.response = response
        self.calls = []
        self.closed = False
    def __call__(self, host, timeout):
        self.calls.append((host, timeout))
        return self
    def request(self, method, path, headers):
        self.calls.append((method, path, headers))
    def getresponse(self):
        if isinstance(self.response, Exception):
            raise self.response
        return self.response
    def close(self):
        self.closed = True

class SourceTests(unittest.TestCase):
    def make(self, response):
        t = Transport(response)
        return GitHubReadSource(REPO, "test-token", connection_factory=t), t
    def test_pr(self):
        s, t = self.make(Response(data={"number": 1}))
        self.assertEqual(s.pr(REPO, 1), {"number": 1})
        self.assertEqual(t.calls[0], ("api.github.com", 10))
        self.assertEqual(t.calls[1][:2], ("GET", "/repos/owner/repo/pulls/1"))
        self.assertEqual(t.calls[1][2]["Authorization"], "Bearer test-token")
        self.assertTrue(t.closed)
    def test_runs_complete(self):
        s, t = self.make(Response(data={"total_count": 1, "workflow_runs": [{"id": 9}]}))
        self.assertTrue(s.runs(REPO, SHA)["complete"])
        self.assertIn("event=pull_request", t.calls[1][1])
        self.assertIn("head_sha=" + SHA, t.calls[1][1])
    def test_incomplete(self):
        for data, link in [({"total_count": 2, "workflow_runs": [{}]}, ""), ({"workflow_runs": []}, ""), ({"total_count": 0, "workflow_runs": []}, '<https://api.github.com/>; rel="next"'), ({"total_count": True, "workflow_runs": [{}]}, ""), ({"total_count": 0, "workflow_runs": {}}, "")]:
            with self.subTest(data=data, link=link):
                s, _ = self.make(Response(data=data, link=link))
                self.assertFalse(s.runs(REPO, SHA)["complete"])
    def test_reject_foreign_repo(self):
        s, t = self.make(Response(data={}))
        with self.assertRaisesRegex(SourceError, "REPOSITORY_NOT_ALLOWED"):
            s.pr("other/repo", 1)
        self.assertEqual(t.calls, [])
    def test_invalid_inputs(self):
        s, t = self.make(Response(data={}))
        for value in (True, 0, "1", -1):
            with self.assertRaises(ValueError):
                s.pr(REPO, value)
        with self.assertRaises(ValueError):
            s.runs(REPO, "abc")
        self.assertEqual(t.calls, [])
        for repo, token in (("../repo", "test"), (REPO, "test\n"), (REPO, "")):
            with self.assertRaises(ValueError):
                GitHubReadSource(repo, token)
    def test_http_errors_no_retry_or_redirect(self):
        for code, error in ((301, "UNEXPECTED_HTTP_STATUS"), (401, "AUTHENTICATION_FAILED"), (403, "ACCESS_OR_RATE_LIMIT"), (429, "RATE_LIMIT"), (404, "RESOURCE_UNAVAILABLE"), (500, "UNEXPECTED_HTTP_STATUS")):
            with self.subTest(code=code):
                s, t = self.make(Response(status=code, data={"secret": "test-token"}))
                with self.assertRaisesRegex(SourceError, "^" + error + "$"):
                    s.pr(REPO, 1)
                self.assertEqual(len(t.calls), 2)
                self.assertTrue(t.closed)
    def test_malformed_and_oversized(self):
        for raw in (b"{", b"[]", b"x" * (GitHubReadSource.MAX_BYTES + 1)):
            s, t = self.make(Response(raw=raw))
            with self.assertRaises(SourceError):
                s.pr(REPO, 1)
            self.assertTrue(t.closed)
    def test_transport_error(self):
        s, t = self.make(TimeoutError("test-token"))
        with self.assertRaisesRegex(SourceError, "^TRANSPORT_OR_JSON_ERROR$"):
            s.pr(REPO, 1)
        self.assertTrue(t.closed)

class IntegratedTests(unittest.TestCase):
    def source(self, responses):
        transports = iter(Transport(r) for r in responses)
        return GitHubReadSource(policy()["repository"], "test-token", connection_factory=lambda *_a, **_kw: next(transports))

    def replay(self, b, ledger, middle=None):
        responses = [Response(data=b["anchors"][0]), middle or Response(data=b["page"]["data"]), Response(data=b["anchors"][1])]
        return ledger.ingest(policy(), b["event"], self.source(responses))

    def test_adapter_to_persistent_outbox(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "ledger.sqlite"
            b = bundle()
            first = self.replay(b, Ledger(path))
            self.assertEqual(first["status"], "OBSERVED")
            self.assertTrue(first["projection"]["notify"])
            self.assertFalse(self.replay(b, Ledger(path))["projection"]["notify"])
            self.assertEqual(len(Ledger(path).pending()), 1)
            self.assertFalse(first["projection"]["executionAuthorized"])

    def test_incomplete_page_cannot_queue(self):
        with tempfile.TemporaryDirectory() as tmp:
            ledger = Ledger(Path(tmp) / "ledger.sqlite")
            b = bundle()
            self.replay(b, ledger)
            page = Response(data=b["page"]["data"], link='<https://api.github.com/>; rel="next"')
            self.assertEqual(self.replay(b, ledger, page)["status"], "INCOMPLETE_COLLECTION")
            self.assertEqual(len(ledger.pending()), 1)

    def test_rate_limit_cannot_queue(self):
        with tempfile.TemporaryDirectory() as tmp:
            ledger = Ledger(Path(tmp) / "ledger.sqlite")
            b = bundle()
            self.replay(b, ledger)
            self.assertEqual(self.replay(b, ledger, Response(status=429, data={}))["status"], "SOURCE_UNAVAILABLE_OR_INVALID")
            self.assertEqual(len(ledger.pending()), 1)


if __name__ == "__main__":
    unittest.main()
