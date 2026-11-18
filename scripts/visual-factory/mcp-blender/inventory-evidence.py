"""Read-only evidence inventory of exact build inputs and installed Ubuntu packages.
Diagnostic only: no production authorization, no provider entitlement assertion.
Runs on the host after the already qualified container build, before the GUI test.
"""
import datetime
import email
import hashlib
import json
import pathlib
import re
import subprocess
import urllib.request
import zipfile

root=pathlib.Path.cwd()
out=root/"bridge"
image=(out/"probe-image.txt").read_text().strip()
assert re.fullmatch(r"sha256:[0-9a-f]{64}",image)
def run(*args):
    return subprocess.check_output(args,timeout=90)
# No network, secrets, writable mounts or privilege for the inventory command.
raw=run("docker","run","--rm","--pull=never","--network","none","--read-only",
        "--user","65534:65534","--cap-drop","ALL","--security-opt","no-new-privileges:true",
        "--memory","256m","--pids-limit","32",image,"dpkg-query","-W",
        "-f=${binary:Package}\t${Version}\t${source:Package}\t${source:Version}\t${db:Status-Abbrev}\n")
rows=[]
for line in raw.decode().splitlines():
    binary,version,source,source_version,status=line.split("\t")
    if status.startswith("ii"):
        assert all((binary,version,source,source_version))
        rows.append({"binary":binary,"version":version,"source":source,"sourceVersion":source_version})
assert rows and any(x["binary"].split(":")[0]=="python3" for x in rows)
sources=sorted({(x["source"],x["sourceVersion"]) for x in rows})
def sha(raw): return hashlib.sha256(raw).hexdigest()
wheels=[]
for p in sorted((root/"mcp-input/wheels").glob("*.whl")):
    data=p.read_bytes()
    with zipfile.ZipFile(p) as z:
        meta=[n for n in z.namelist() if n.endswith(".dist-info/METADATA")]
        assert len(meta)==1
        m=email.message_from_bytes(z.read(meta[0]))
        licenses=[{"path":n,"sha256":sha(z.read(n))} for n in z.namelist()
                  if not n.endswith("/") and ".dist-info/" in n and
                  ("/licenses/" in n or pathlib.PurePosixPath(n).name.lower().startswith(("license","copying","notice")))]
        wheels.append({"name":m["Name"],"version":m["Version"],"wheelSha256":sha(data),
                       "licenseExpression":m.get("License-Expression"),"license":m.get("License"),
                       "licenseClassifiers":[c for c in m.get_all("Classifier",[]) if c.startswith("License ::")],
                       "licenseFiles":licenses})
assert len(wheels)==35
upstream=[]
for p in ("LICENSE","src/capabilities/blender/NOTICE.md",
          "src/capabilities/blender/qwen_mm_plugins_blender/vendor/LICENSE"):
    data=run("git","-C",str(root/"mcp-upstream"),"show","FETCH_HEAD:"+p)
    upstream.append({"path":p,"sha256":sha(data),"gitBlob":run("git","-C",str(root/"mcp-upstream"),"rev-parse","FETCH_HEAD:"+p).decode().strip()})
    (out/("upstream-"+p.replace("/","_"))).write_bytes(data)
e={"schema":"trama.j07-inventory/v0.1","image":image,"ubuntu":"24.04:LTS",
   "observedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),
   "packages":rows,"wheels":wheels,"upstreamLicenseFiles":upstream,
   "licenseReviewComplete":False,"productionAuthorized":False,
   "scope":"Ubuntu installed source versions, Python wheels and selected upstream license texts; excludes Blender bundled libraries, host kernel and full distribution review"}
(out/"j07-inventory.json").write_text(json.dumps(e,indent=2))
findings=[]
for i in range(0,len(sources),50):
    batch=sources[i:i+50]
    queries=[{"package":{"name":n,"ecosystem":"Ubuntu:24.04:LTS"},"version":v} for n,v in batch]
    req=urllib.request.Request("https://api.osv.dev/v1/querybatch",data=json.dumps({"queries":queries}).encode(),
                               headers={"Content-Type":"application/json"},method="POST")
    with urllib.request.urlopen(req,timeout=45) as response:
        results=json.load(response)["results"]
    assert len(results)==len(batch)
    for (name,version),r in zip(batch,results):
        assert isinstance(r,dict) and set(r)<={"vulns"}
        for item in r.get("vulns",[]):
            findings.append({"source":name,"version":version,"id":item["id"]})
report={"status":"REVIEW_REQUIRED" if findings else "NO_OSV_FINDINGS_IN_SCOPE",
        "scope":"Ubuntu:24.04:LTS source packages; not a complete security certification; no Pro coverage",
        "image":image,"sourcePackagesChecked":len(sources),"binaryPackages":len(rows),
        "findings":findings,"productionAuthorized":False}
(out/"j07-ubuntu-osv.json").write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k!="findings"}|{"findingCount":len(findings)},indent=2))
