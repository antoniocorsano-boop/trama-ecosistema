"""One-time metadata review of exact OCI-01b diagnostic inventory. No workload."""
import collections
import concurrent.futures
import datetime as dt
import hashlib
import json
import pathlib
import re
import subprocess
import sys
import urllib.request

BASE = {
    "packages.tsv":"1059fc3b54831f0b2f69eed47cbed48df67a2b7608566d033993732f88b595a0",
    "arm-ubuntu-osv.json":"efc2a26716f024ee9a1e9c0fd320f35470154e54a654154ba05aff368d105938",
    "arm-python-osv.json":"1cb3a0b7406a8f01be8185fca26e53105901a673c7bafdb0afc55c8f2a5b298f",
    "isolation.json":"6d97318ac16c672b665c724f4122413913edebb497812f1cae5ba08c8568743f",
    "arm-requirements-observed.lock":"dc180aa9c91eb3c39eeba3fb2370767119bfe3e83232c8b61b03ae9b5679b406",
}
ECO = "Ubuntu:26.04:LTS"
PRIORITIES = ("critical","high","medium","low","negligible")
def require(ok, reason):
    if not ok:
        raise ValueError(reason)

def get(vid):
    require(re.fullmatch(r"UBUNTU-CVE-[0-9]{4}-[0-9]+",vid), "unexpected advisory identity")
    try:
        with urllib.request.urlopen("https://api.osv.dev/v1/vulns/"+vid,timeout=12) as r:
            raw=r.read(4*1024*1024+1)
        require(len(raw)<=4*1024*1024,"advisory too large")
        a=json.loads(raw)
        require(a.get("id")==vid,"advisory identity mismatch")
        return a
    except Exception:
        return None

def less(a,b):
    require(re.fullmatch(r"[0-9A-Za-z.+:~_-]{1,200}",a) and
            re.fullmatch(r"[0-9A-Za-z.+:~_-]{1,200}",b),"invalid version")
    r=subprocess.run(["dpkg","--compare-versions",a,"lt",b],check=False)
    require(r.returncode in (0,1),"version comparison failed")
    return r.returncode==0

def classify(row,a,binaries):
    result={**row,"installedBinaries":binaries,"applicability":"REVIEW_REQUIRED"}
    if a is None:
        return {**result,"priority":"unknown","fixStatus":"METADATA_UNAVAILABLE"}
    sev={x.get("score") for x in a.get("severity",[]) if x.get("type")=="Ubuntu"}
    priority=next(iter(sev)) if len(sev)==1 and next(iter(sev)) in PRIORITIES else "unknown"
    result["priority"]=priority
    if a.get("withdrawn"):
        return {**result,"fixStatus":"WITHDRAWN_REVIEW"}
    matches=[x for x in a.get("affected",[]) if x.get("package",{}).get("name")==row["source"]
             and x.get("package",{}).get("ecosystem")==ECO]
    if not matches:
        return {**result,"fixStatus":"SCOPE_RECONCILIATION_REQUIRED"}
    fixes=sorted({e["fixed"] for x in matches for r in x.get("ranges",[])
                  if r.get("type")=="ECOSYSTEM" for e in r.get("events",[]) if "fixed" in e})
    result["standardFixedVersions"]=fixes
    if not fixes:
        return {**result,"fixStatus":"NO_STANDARD_FIX_LISTED"}
    # OSV metadata is not evidence that a package can be installed from current APT.
    if any(less(row["version"],v) for v in fixes):
        return {**result,"fixStatus":"STANDARD_FIX_LISTED_NEWER"}
    return {**result,"fixStatus":"VERSION_RECONCILIATION_REQUIRED"}

def main():
    root=pathlib.Path(sys.argv[1])
    out=pathlib.Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
    for name,digest in BASE.items():
        require(hashlib.sha256((root/name).read_bytes()).hexdigest()==digest,"baseline digest mismatch: "+name)
    bins=collections.defaultdict(list)
    for line in (root/"packages.tsv").read_text().splitlines():
        b,v,s,sv,status=line.split("\t")
        if status.startswith("ii"):
            bins[(s,sv)].append(b)
    require(len(bins)==325 and sum(map(len,bins.values()))==458,"baseline package count")
    findings=json.loads((root/"arm-ubuntu-osv.json").read_text())["findings"]
    ids=sorted({x["id"] for x in findings})
    require(len(findings)==466 and len(ids)==463,"baseline finding count")
    require(all((x["source"],x["version"]) in bins for x in findings),"unbound finding")
    py=json.loads((root/"arm-python-osv.json").read_text())
    require(py["packages"]==35 and not py["findings"],"python baseline")
    iso=json.loads((root/"isolation.json").read_text())
    require(iso["NetworkMode"]=="none" and iso["ReadonlyRootfs"] and not iso["Privileged"]
        and iso["CapDrop"]==["ALL"] and "no-new-privileges:true" in iso["SecurityOpt"]
        and not iso["PortBindings"] and not iso["Devices"] and iso["NanoCpus"]==2000000000
        and iso["Memory"]==6442450944,"isolation baseline")
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
        metadata=dict(zip(ids,pool.map(get,ids)))
    rows=[classify(x,metadata[x["id"]],bins[(x["source"],x["version"])]) for x in findings]
    counts=lambda seq:dict(sorted(collections.Counter(seq).items()))
    summary={"schema":"trama.oci01-security-review/v0.1","observedAt":dt.datetime.now(dt.timezone.utc).isoformat(),
      "baselineArtifact":14407191254,"sourcePackages":325,"binaryPackages":458,"findings":466,
      "uniqueAdvisories":463,"metadataReceived":sum(x is not None for x in metadata.values()),
      "priorityCounts":counts(x["priority"] for x in rows),
      "fixStatusCounts":counts(x["fixStatus"] for x in rows),
      "priorityBySource":{s:counts(x["priority"] for x in rows if x["source"]==s) for s in sorted({x["source"] for x in rows})},
      "pythonObservedFindings":0,"scope":"exact prior image; metadata classification only",
      "applicabilityAccepted":False,"productionAuthorized":False,
      "decision":"PRODUCTION_HOLD_SECURITY_AND_ENTITLEMENT"}
    (out/"summary.json").write_text(json.dumps(summary,indent=2)+"\n")
    (out/"review.json").write_text(json.dumps({"summary":summary,"rows":rows},indent=2)+"\n")
    print(json.dumps({k:v for k,v in summary.items() if k!="priorityBySource"},indent=2))
    require(summary["metadataReceived"]==463 and not summary["priorityCounts"].get("unknown"),"metadata review incomplete")

if __name__=="__main__":
    main()
