#!/usr/bin/env python3
"""FD-03 anonymous synthetic-only probe; never grants privacy or deploy approval."""
import argparse
import json
import re
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

BASE = "trama-fd03-review.pages.dev"  # proposed, not provisioned
LABEL = r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?"
PREVIEW = re.compile(LABEL + r"\." + re.escape(BASE))
TEAM = re.compile(LABEL + r"\.cloudflareaccess\.com")
ROUTES = ("/", "/index.html", "/style.css", "/app.js",
          "/media/marker.webp", "/media/tone.mp3", "/manifest.json")


def validate_inventory(hosts, team):
    if (not isinstance(team, str) or not TEAM.fullmatch(team)
            or not isinstance(hosts, list) or not 2 <= len(hosts) <= 12
            or any(not isinstance(h, str) for h in hosts)
            or len(set(hosts)) != len(hosts) or BASE not in hosts
            or not all(h == BASE or PREVIEW.fullmatch(h) for h in hosts)):
        raise ValueError("STOP_INVALID_SYNTHETIC_INVENTORY")
    return hosts


def classify(status, location, team, host):
    if 200 <= status < 300:
        return "UNEXPECTED_SUCCESS"
    if status not in (301, 302, 303, 307, 308) or not isinstance(location, str):
        return "INCONCLUSIVE"
    try:
        target = urlsplit(location)
        if (target.scheme == "https" and target.netloc == team
                and target.path == "/cdn-cgi/access/login/" + host):
            return "ACCESS_LOGIN_REDIRECT"
    except ValueError:
        pass
    return "INCONCLUSIVE"


class NoFollow(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def request_probe(host, route, team, ranged=False):
    # No authentication, cookies, redirects, or retries.
    headers = {"User-Agent": "TRAMA-FD03-Anonymous-Verifier/1.0",
               "Accept-Encoding": "identity", "Cache-Control": "no-cache"}
    if ranged:
        headers["Range"] = "bytes=0-31"
    req = Request("https://" + host + route, headers=headers, method="GET")
    opener = build_opener(NoFollow())
    try:
        with opener.open(req, timeout=5) as response:
            return classify(response.status, "", team, host)
    except HTTPError as exc:
        try:
            return classify(exc.code, exc.headers.get("Location", ""), team, host)
        finally:
            exc.close()
    except (URLError, OSError, ValueError):
        return "INCONCLUSIVE"


def assess(hosts, team, probe=request_probe):
    validate_inventory(hosts, team)
    results = []
    for host in hosts:
        for route in ROUTES:
            results.append({"host": host, "route": route, "range": False,
                            "result": probe(host, route, team)})
        results.append({"host": host, "route": "/media/tone.mp3", "range": True,
                        "result": probe(host, "/media/tone.mp3", team, ranged=True)})
    positive = all(x["result"] == "ACCESS_LOGIN_REDIRECT" for x in results)
    return {
        "schema": "trama.free-deploy.anonymous-access/v1",
        "state": "ANONYMOUS_CHALLENGES_OBSERVED" if positive else "BLOCKED",
        "syntheticOnly": True,
        "inventoryCompletenessVerified": False,
        "authenticatedAccessVerified": False,
        "revocationVerified": False,
        "privacyQualified": False,
        "costVerified": False,
        "deployAuthorized": False,
        "studentPublicationAuthorized": False,
        "results": results,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", action="append", required=True)
    parser.add_argument("--team", required=True)
    parser.add_argument("--approved-synthetic-probe", action="store_true")
    args = parser.parse_args()
    if not args.approved_synthetic_probe:
        parser.exit(2, "STOP_EXPLICIT_SYNTHETIC_SCOPE_REQUIRED\n")
    try:
        result = assess(args.host, args.team)
    except ValueError:
        parser.exit(2, "STOP_INVALID_SYNTHETIC_INVENTORY\n")
    print(json.dumps(result, indent=2))
    # Observations never constitute an authorization or privacy qualification.
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
