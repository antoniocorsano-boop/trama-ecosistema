#!/usr/bin/env python3
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
e=json.loads((ROOT/"config/repository-enrollment.json").read_text())
assert e["schemaVersion"]=="trama.repository-enrollment/v1"
assert e["policy"]=={"discovery":"EXPLICIT_ALLOWLIST_ONLY","wildcards":False,"organizationEnumeration":False,"networkAuthorizationImplied":False}
repos=e["repositories"]
assert len(repos)==4
expected={
 "antoniocorsano-boop/trama-ecosistema":"CONTROL_PLANE",
 "antoniocorsano-boop/CurManLight_arena":"CURRICULUM_AUTHORITY",
 "antoniocorsano-boop/Curriculum-Atlas":"PUBLICATION_SURFACE",
 "antoniocorsano-boop/docente-os-2026-27":"TEACHER_OPERATIONAL_SURFACE"
}
assert {r["repository"]:r["ecosystemRole"] for r in repos}==expected
assert all(r["state"]=="ENROLLED" and r["defaultBranch"]=="main" and r["sourceRefs"] for r in repos)
assert len({r["id"] for r in repos})==len(repos)
assert len({r["repository"] for r in repos})==len(repos)
assert not any("*" in r["repository"] for r in repos)
print("TRAMA_REPOSITORY_ENROLLMENT_PASS")
