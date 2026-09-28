#!/usr/bin/env python3
"""Static audit: offline provider qualification must not acquire token/network/live capability."""
from pathlib import Path
import sys
TARGETS=[
 Path("config/cc-mss-01-credential-provider-actions-ephemeral.json"),
 Path("scripts/validate_cc_mss_actions_ephemeral_provider.py"),
 Path("tests/test_cc_mss_actions_ephemeral_provider.py")]
FORBIDDEN=["github.token","secrets.GITHUB_TOKEN","os.environ","getenv(","requests.","httpx.","urllib.request","socket.","workflow_dispatch:","curl ","wget "]
REQUIRED=["NOT_AUTHORIZED","ACTIONS_EPHEMERAL_TOKEN"]
def main():
 text="\n".join(p.read_text(encoding="utf-8") for p in TARGETS)
 for x in FORBIDDEN:
  if x in text: print("FAIL: forbidden live/token capability marker",x);return 1
 for x in REQUIRED:
  if x not in text: print("FAIL: missing invariant",x);return 1
 print("PASS: Actions provider qualification surface remains offline and token-free");return 0
if __name__=="__main__":sys.exit(main())
