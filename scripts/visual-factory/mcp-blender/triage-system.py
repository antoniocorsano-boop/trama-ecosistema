"""Bounded defensive advisory metadata review; not a production security gate."""
import collections
import concurrent.futures
import datetime
import json
import pathlib
import re
import subprocess
import urllib.parse
import urllib.request

root=pathlib.Path.cwd()
out=root/"bridge"
inventory=json.loads((out/"j07-inventory.json").read_text())
report=json.loads((out/"j07-ubuntu-osv.json").read_text())
image=inventory["image"]
assert image==report["image"] and re.fullmatch(r"sha256:[0-9a-f]{64}",image)
baseline={"archiveSha256":"9d7166a4d206275aa984b49de96b21428e36013fdb3adf725efe976e56118e28",
          "artifactId":14400774892,"sourcePackagesChecked":145,"binaryPackages":211,
          "findingCount":171,
          "sourceCounts":{"acl":2,"alsa-lib":3,"coreutils":1,"dash":2,"dbus":4,"dpkg":1,
          "elfutils":2,"expat":10,"glib2.0":1,"glibc":10,"gnupg2":2,"gnutls28":6,
          "icu":1,"libsndfile":7,"libxi":9,"libxml2":2,"libxrender":1,"libxtst":1,
          "lz4":1,"openssl":5,"pam":1,"perl":2,"pixman":1,"python-pip":1,"python3.12":38,
          "setuptools":1,"shadow":1,"sqlite3":11,"systemd":2,"tar":2,"util-linux":2,"xorg-server":38}}
assert sum(baseline["sourceCounts"].values())==baseline["findingCount"]
# Record the standard-package-manager simulations. No automatic removal.
for name in ("remaining-upgrades","autoremove-review","manual-packages"):
    data=subprocess.check_output(["docker","run","--rm","--pull=never","--network","none","--read-only",
         "--user","65534:65534","--cap-drop","ALL","--security-opt","no-new-privileges:true",
         "--memory","256m","--pids-limit","32",image,"cat","/usr/local/share/j07/"+name+".txt"],timeout=30)
    (out/("j07-"+name+".txt")).write_bytes(data)
ids=sorted({f["id"] for f in report["findings"]})
# Bound lookup count and concurrency; missing metadata remains UNKNOWN.
def lookup(advisory_id):
    if not re.fullmatch(r"[A-Za-z0-9._-]{1,120}",advisory_id):
        return advisory_id,None
    try:
        with urllib.request.urlopen("https://api.osv.dev/v1/vulns/"+urllib.parse.quote(advisory_id,safe=""),timeout=8) as res:
            raw=res.read(2*1024**2+1)
            if len(raw)>2*1024**2: return advisory_id,None
            d=json.loads(raw)
        return advisory_id,d if d.get("id")==advisory_id else None
    except (OSError,ValueError):
        return advisory_id,None
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    records=dict(pool.map(lookup,ids[:240]))
priorities={"critical","high","medium","low","negligible"}
def less(a,b):
    return subprocess.run(["dpkg","--compare-versions",a,"lt",b],check=False).returncode==0
rows=[]
for f in report["findings"]:
    d=records.get(f["id"])
    row={**f,"priority":"unknown","fixStatus":"UNKNOWN","fixedVersions":[],"applicability":"REVIEW_REQUIRED"}
    if d:
        p={s.get("score") for s in d.get("severity",[]) if s.get("type")=="Ubuntu"}
        if len(p)==1 and next(iter(p)) in priorities:row["priority"]=next(iter(p))
        matching=[a for a in d.get("affected",[]) if a.get("package",{}).get("name")==f["source"] and a.get("package",{}).get("ecosystem")=="Ubuntu:24.04:LTS"]
        fixed=sorted({ev["fixed"] for a in matching for r in a.get("ranges",[]) for ev in r.get("events",[]) if isinstance(ev.get("fixed"),str)})
        row["fixedVersions"]=fixed
        if d.get("withdrawn"):row["fixStatus"]="WITHDRAWN_REVIEW"
        elif matching and not fixed:row["fixStatus"]="NO_STANDARD_FIX_LISTED"
        elif fixed and all(less(f["version"],v) for v in fixed):row["fixStatus"]="STANDARD_FIX_LISTED_NEWER"
        elif fixed:row["fixStatus"]="VERSION_RECONCILIATION_REQUIRED"
    rows.append(row)
counts=collections.Counter(f["source"] for f in rows)
result={"schema":"trama.j07-system-triage/v0.1","image":image,
        "observedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "baseline":baseline,"current":{"sourcePackagesChecked":report["sourcePackagesChecked"],
        "binaryPackages":report["binaryPackages"],"findingCount":len(rows),"sourceCounts":dict(counts)},
        "findingCountDelta":len(rows)-baseline["findingCount"],
        "priorityCounts":dict(collections.Counter(x["priority"] for x in rows)),
        "fixStatusCounts":dict(collections.Counter(x["fixStatus"] for x in rows)),
        "metadataRequested":min(len(ids),240),"metadataReceived":sum(v is not None for v in records.values()),
        "status":"REVIEW_REQUIRED" if rows else "NO_OSV_FINDINGS_IN_SCOPE",
        "productionAuthorized":False,"findings":rows,
        "limitations":["Feed may change between builds; count delta does not prove remediation.",
                       "A listed fix does not prove availability or installation; inspect source versions.",
                       "No exploitability claims; runtime applicability and other library scopes remain unreviewed.",
                       "No Ubuntu Pro or paid services enabled; no automatic package removal."]}
(out/"j07-system-triage.json").write_text(json.dumps(result,indent=2))
print(json.dumps({k:result[k] for k in ("status","current","findingCountDelta","priorityCounts","fixStatusCounts","metadataRequested","metadataReceived","productionAuthorized")},indent=2))
