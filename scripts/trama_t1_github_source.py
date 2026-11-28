"""Candidate read-only REST source for the existing T1 collect interface.
No runtime activation, policy authority, dispatch or token acquisition here.
"""
import http.client
import json
import re
from urllib.parse import urlencode


class SourceError(RuntimeError):
    """Fixed diagnostic only; never expose tokens or response bodies."""


class GitHubReadSource:
    MAX_BYTES = 4 * 1024 * 1024

    def __init__(self, repository, token, *, connection_factory=http.client.HTTPSConnection):
        if not isinstance(repository, str) or not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository) or any(x in (".", "..") for x in repository.split("/")):
            raise ValueError("INVALID_REPOSITORY")
        if not isinstance(token, str) or not token or not token.isascii() or any(ord(c) <= 32 or ord(c) >= 127 for c in token):
            raise ValueError("INVALID_CREDENTIAL")
        self.repository = repository
        self._token = token
        self._connection_factory = connection_factory

    def _get(self, repository, path):
        if repository != self.repository:
            raise SourceError("REPOSITORY_NOT_ALLOWED")
        connection = None
        try:
            connection = self._connection_factory("api.github.com", timeout=10)
            connection.request("GET", f"/repos/{repository}/{path}", headers={
                "Authorization": "Bearer " + self._token,
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "TRAMA-T1-readonly",
            })
            response = connection.getresponse()
            if response.status != 200:
                raise SourceError({401: "AUTHENTICATION_FAILED", 403: "ACCESS_OR_RATE_LIMIT", 429: "RATE_LIMIT", 404: "RESOURCE_UNAVAILABLE"}.get(response.status, "UNEXPECTED_HTTP_STATUS"))
            payload = response.read(self.MAX_BYTES + 1)
            if len(payload) > self.MAX_BYTES:
                raise SourceError("RESPONSE_TOO_LARGE")
            result = json.loads(payload)
            if not isinstance(result, dict):
                raise SourceError("INVALID_RESPONSE")
            return result, response.getheader("Link", "")
        except SourceError:
            raise
        except (OSError, http.client.HTTPException, ValueError, UnicodeError):
            raise SourceError("TRANSPORT_OR_JSON_ERROR") from None
        finally:
            if connection is not None:
                connection.close()

    def pr(self, repository, number):
        if type(number) is not int or number <= 0:
            raise ValueError("INVALID_PR_NUMBER")
        return self._get(repository, f"pulls/{number}")[0]

    def runs(self, repository, head):
        if not isinstance(head, str) or not re.fullmatch(r"[0-9a-f]{40}", head):
            raise ValueError("INVALID_HEAD")
        query = urlencode({"head_sha": head, "event": "pull_request", "per_page": 100, "page": 1})
        data, link = self._get(repository, "actions/runs?" + query)
        rows = data.get("workflow_runs")
        complete = (isinstance(rows, list) and len(rows) <= 100
                    and type(data.get("total_count")) is int
                    and data["total_count"] == len(rows)
                    and not re.search(r'rel\s*=\s*["\']?next\b', link, re.I))
        return {"complete": complete, "data": data}
