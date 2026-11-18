"""OCI-01b: exact version, native wheel, PyPI digest and advisory checks.
Diagnostic lock is an observation, not a reviewed production lock.
"""
import email
import hashlib
import json
import pathlib
import re
import urllib.parse
import urllib.request
import zipfile

root=pathlib.Path.cwd()
deps=root/"deps"
def get(url, payload=None):
    req=urllib.request.Request(url,data=None if payload is None else json.dumps(payload).encode(),
        headers={"Content-Type":"application/json","Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=45) as response:
        return json.load(response)

def canonical(n):
    return re.sub(r"[-_.]+","-",n).lower()

pins={}
for line in (deps/"versions.txt").read_text().splitlines():
    name,version=line.split("==")
    assert canonical(name)==name and name not in pins
    pins[name]=version
assert len(pins)==35 and "pillow" not in pins
findings=[]
queries=[{"package":{"name":n,"ecosystem":"PyPI"},"version":v} for n,v in pins.items()]
results=get("https://api.osv.dev/v1/querybatch",{"queries":queries})["results"]
assert len(results)==len(queries)
for (name,version),row in zip(pins.items(),results):
    assert isinstance(row,dict) and set(row)<={"vulns"}
    for item in row.get("vulns",[]):
        findings.append({"package":name,"version":version,"id":item["id"]})
(root/"work"/"arm-python-osv.json").write_text(json.dumps({"scope":"PyPI only","packages":len(pins),"findings":findings},indent=2))
if findings:
    raise SystemExit("STOP_PYPI_ADVISORY_REVIEW")
wheels={}
for p in sorted((deps/"wheels").glob("*.whl")):
    with zipfile.ZipFile(p) as z:
        entries=[n for n in z.namelist() if n.endswith(".dist-info/METADATA")]
        assert len(entries)==1
        m=email.message_from_bytes(z.read(entries[0]))
        name,version=canonical(m["Name"]),m["Version"]
        assert pins.get(name)==version and name not in wheels
        license_files=[{"path":n,"sha256":hashlib.sha256(z.read(n)).hexdigest()}
                       for n in z.namelist() if ".dist-info/" in n and not n.endswith("/")
                       and ("/licenses/" in n or pathlib.PurePosixPath(n).name.lower().startswith(("license","copying","notice")))]
    metadata=get("https://pypi.org/pypi/"+urllib.parse.quote(name,safe="")+"/"+urllib.parse.quote(version,safe="")+"/json")
    digest=hashlib.sha256(p.read_bytes()).hexdigest()
    matches=[x for x in metadata["urls"] if x["filename"]==p.name and x["packagetype"]=="bdist_wheel"]
    assert len(matches)==1 and not matches[0]["yanked"] and matches[0]["digests"]["sha256"]==digest
    wheels[name]={"name":name,"version":version,"file":p.name,"sha256":digest,
                  "licenseExpression":m.get("License-Expression"),"license":m.get("License"),
                  "licenseFiles":license_files}
assert set(wheels)==set(pins)
(deps/"requirements.lock").write_text("".join(f"{n}=={pins[n]} --hash=sha256:{wheels[n]['sha256']}\n" for n in sorted(pins)))
(root/"work"/"arm-wheel-inventory.json").write_text(json.dumps({"scope":"OBSERVED_ARM64_LOCK_NOT_PRODUCTION_ADMITTED","wheels":list(wheels.values()),"productionAuthorized":False},indent=2))
print("ARM_WHEEL_DIGESTS_VERIFIED",len(wheels))
