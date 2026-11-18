"""Prove offline del preflight; nessuna risorsa reale è ammessa."""
import unittest
from scripts.probe_owned_cpu_j07 import assess

def host():
    return {"os":"Linux","arch":"x86_64","cpuAvailable":4,"ramMiB":8192,
            "ramAvailableMiB":6144,"diskFreeMiB":12288,"dockerCliPresent":True,
            "localDockerSocketPresent":True,"temporaryCI":False,"containerDetected":False}

class LocalHostTests(unittest.TestCase):
    def test_candidate_not_authority(self):
        r=assess(host())
        self.assertEqual(r["decision"],"HOST_REVIEW_REQUIRED")
        self.assertEqual(r["costClass"],"UNKNOWN")
        self.assertEqual(r["estimatedRunsRemaining"],0)
        for k in ("hostOwnershipVerified","availabilityVerified","dockerIsolationVerified",
                  "productionAuthorized","executionAuthorized","paidComputeAuthorized",
                  "publicationAuthorityGranted","studentAuthorized"):
            self.assertIs(r[k],False)
    def reject(self,key,value,reason):
        h=host();h[key]=value;r=assess(h)
        self.assertEqual(r["decision"],"STOP_HOST_PREFLIGHT")
        self.assertIn(reason,r["reasons"])
    def test_ci_rejected(self):
        self.reject("temporaryCI",True,"DIAGNOSTIC_ENVIRONMENT_ONLY")
    def test_container_rejected(self):
        self.reject("containerDetected",True,"CONTAINER_NOT_HOST_ATTESTATION")
    def test_arch_rejected(self):
        self.reject("arch","aarch64","HOST_PROFILE_NOT_QUALIFIED")
    def test_cpu_rejected(self):
        self.reject("cpuAvailable",3,"CPU_INSUFFICIENT")
    def test_ram_rejected(self):
        self.reject("ramAvailableMiB",0,"RAM_INSUFFICIENT_OR_UNKNOWN")
    def test_disk_rejected(self):
        self.reject("diskFreeMiB",12287,"DISK_INSUFFICIENT")
    def test_docker_rejected(self):
        self.reject("localDockerSocketPresent",False,"LOCAL_DOCKER_NOT_CONFIRMED")
