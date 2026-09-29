#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import sys
import tempfile

ROOT=Path(__file__).resolve().parents[1]

spec=importlib.util.spec_from_file_location(
    "repository_observation_collector",
    ROOT/"scripts/run_public_anonymous_repository_observation.py",
)
collector=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=collector
spec.loader.exec_module(collector)

DEFAULT_HEADS={
    "antoniocorsano-boop/trama-ecosistema":"1"*40,
    "antoniocorsano-boop/CurManLight_arena":"2"*40,
    "antoniocorsano-boop/Curriculum-Atlas":"3"*40,
    "antoniocorsano-boop/docente-os-2026-27":"4"*40,
}
DOS_DEVELOP="5"*40


def repo_from_url(url:str)->str:
    marker="/repos/"
    tail=url.split(marker,1)[1]
    parts=tail.split("/")
    return parts[0]+"/"+parts[1]


def fake_transport(anchor_change:bool=False):
    develop_reads={"count":0}

    def fake(url,budget,resources,**kwargs):
        budget.consume(allow_reserve=bool(kwargs.get("allow_reserve",False)))
        repo=repo_from_url(url)
        if url.endswith(repo):
            return {"private":False,"full_name":repo,"default_branch":"main"}
        if "/git/ref/heads/" in url:
            ref=url.split("/git/ref/heads/",1)[1]
            if repo=="antoniocorsano-boop/docente-os-2026-27" and ref=="develop":
                develop_reads["count"]+=1
                if anchor_change and develop_reads["count"]>1:
                    return {"object":{"sha":"6"*40}}
                return {"object":{"sha":DOS_DEVELOP}}
            return {"object":{"sha":DEFAULT_HEADS[repo]}}
        if "/commits/" in url:
            return {"sha":url.rsplit("/",1)[1]}
        if "/pulls?" in url:
            return []
        raise AssertionError("unexpected URL "+url)
    return fake


enrollment=json.loads((ROOT/"config/repository-enrollment.json").read_text(encoding="utf-8"))
dos=next(x for x in enrollment["repositories"] if x["id"]=="enrollment:docente-os")
assert dos["defaultBranch"]=="main"
assert dos["activeDevelopmentRef"]=="develop"
assert all(
    "activeDevelopmentRef" not in item
    for item in enrollment["repositories"]
    if item["id"]!="enrollment:docente-os"
)

original=collector.t.anonymous_get
try:
    collector.t.anonymous_get=fake_transport(False)
    with tempfile.TemporaryDirectory(prefix="trama-active-ref-") as tmp:
        out,result=collector.collect(str(Path(tmp)/"observation.json"))
        assert out.is_file()
        rows={x["enrollmentRef"]:x for x in result["repositories"]}
        row=rows["enrollment:docente-os"]
        assert row["observedHead"]==DEFAULT_HEADS["antoniocorsano-boop/docente-os-2026-27"]
        assert row["activeDevelopmentRef"]=="develop"
        assert row["observedActiveDevelopmentHead"]==DOS_DEVELOP
        assert len(row["sourceRefs"])==2
        for key,item in rows.items():
            if key=="enrollment:docente-os":
                continue
            assert item["activeDevelopmentRef"] is None
            assert item["observedActiveDevelopmentHead"] is None

    collector.t.anonymous_get=fake_transport(True)
    with tempfile.TemporaryDirectory(prefix="trama-active-ref-change-") as tmp:
        try:
            collector.collect(str(Path(tmp)/"observation.json"))
        except RuntimeError as exc:
            assert str(exc)=="ACTIVE_DEVELOPMENT_ANCHOR_CHANGED", exc
        else:
            raise AssertionError("active development anchor change must fail closed")
finally:
    collector.t.anonymous_get=original

source=(ROOT/"scripts/run_public_anonymous_repository_observation.py").read_text(encoding="utf-8")
assert "activeDevelopmentRef" in source
assert "observedActiveDevelopmentHead" in source
assert "ACTIVE_DEVELOPMENT_ANCHOR_CHANGED" in source
assert "active_ref_calls" in source

print("TRAMA_ACTIVE_DEVELOPMENT_REF_OBSERVATION_PASS")
