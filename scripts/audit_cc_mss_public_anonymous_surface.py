#!/usr/bin/env python3
from pathlib import Path
p=Path("scripts/cc_mss_public_anonymous_source.py").read_text()
for token in ("requests.","urllib.request","subprocess","os.environ","Authorization\":\"Bearer","github_pat_","ghp_"):
 if token in p:
  raise SystemExit("FORBIDDEN_SURFACE:"+token)
if 'trust_env=False' not in p or 'follow_redirects=False' not in p or 'http2=False' not in p:
 raise SystemExit("CLIENT_BOUNDARY_MISSING")
if 'credential' in p.lower() and 'No credential surface' not in Path("docs/control-center/CC-MSS-01-PUBLIC-ANONYMOUS-READONLY.md").read_text():
 raise SystemExit("CREDENTIAL_BOUNDARY_DOC_MISSING")
print("CC_MSS_PUBLIC_ANONYMOUS_SURFACE_AUDIT_PASS")
