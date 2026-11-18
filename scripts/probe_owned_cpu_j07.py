#!/usr/bin/env python3
"""Preflight locale J07 in sola lettura: nessuna ammissione o prenotazione.

Profilo candidato del laboratorio qualificato: Linux x86_64, 4 CPU,
6 GiB per il contenitore. Soglie conservative dell'host: 8 GiB di RAM
totale, 6 GiB disponibili, 12 GiB liberi. Non sono misure Q4.
Non contatta Docker, non avvia processi, non legge credenziali.
"""
import datetime as dt
import json
import os
import pathlib
import platform
import shutil
import stat

MIB = 1024**2
MIN_CPU = 4
MIN_RAM_MIB = 8192
MIN_AVAILABLE_MIB = 6144
MIN_DISK_MIB = 12288


def assess(observed):
    reasons = []
    if observed["temporaryCI"]:
        reasons.append("DIAGNOSTIC_ENVIRONMENT_ONLY")
    if observed["os"] != "Linux" or observed["arch"] != "x86_64":
        reasons.append("HOST_PROFILE_NOT_QUALIFIED")
    if observed["cpuAvailable"] < MIN_CPU:
        reasons.append("CPU_INSUFFICIENT")
    if observed["ramMiB"] < MIN_RAM_MIB or observed["ramAvailableMiB"] < MIN_AVAILABLE_MIB:
        reasons.append("RAM_INSUFFICIENT_OR_UNKNOWN")
    if observed["diskFreeMiB"] < MIN_DISK_MIB:
        reasons.append("DISK_INSUFFICIENT")
    if not observed["dockerCliPresent"] or not observed["localDockerSocketPresent"]:
        reasons.append("LOCAL_DOCKER_NOT_CONFIRMED")
    if observed["containerDetected"]:
        reasons.append("CONTAINER_NOT_HOST_ATTESTATION")
    return {
        "schemaVersion": "trama.j07-owned-cpu-preflight/v0.1",
        "scope": "LOCAL_READ_ONLY_CANDIDATE",
        "observed": observed,
        "decision": "HOST_REVIEW_REQUIRED" if not reasons else "STOP_HOST_PREFLIGHT",
        "reasons": reasons,
        "costClass": "UNKNOWN",
        "estimatedRunsRemaining": 0,
        "hostOwnershipVerified": False,
        "availabilityVerified": False,
        "dockerIsolationVerified": False,
        "productionAuthorized": False,
        "executionAuthorized": False,
        "paidComputeAuthorized": False,
        "publicationAuthorityGranted": False,
        "studentAuthorized": False,
    }


def memory():
    try:
        values = {}
        for line in pathlib.Path("/proc/meminfo").read_text().splitlines():
            key, sep, rest = line.partition(":")
            if sep and key in ("MemTotal", "MemAvailable"):
                parts = rest.split()
                if len(parts) == 2 and parts[1] == "kB":
                    values[key] = int(parts[0]) // 1024
        return values.get("MemTotal", 0), values.get("MemAvailable", 0)
    except (OSError, ValueError):
        return 0, 0


def local_socket():
    try:
        return stat.S_ISSOCK(pathlib.Path("/var/run/docker.sock").stat().st_mode)
    except OSError:
        return False


def collect():
    try:
        cpus = len(os.sched_getaffinity(0))
    except (AttributeError, OSError):
        cpus = os.cpu_count() or 0
    total, available = memory()
    try:
        disk = shutil.disk_usage(pathlib.Path.cwd()).free // MIB
    except OSError:
        disk = 0
    try:
        cgroup = pathlib.Path("/proc/1/cgroup").read_text().lower()
    except OSError:
        cgroup = ""
    return {
        "os": platform.system(),
        "arch": platform.machine(),
        "cpuAvailable": cpus,
        "ramMiB": total,
        "ramAvailableMiB": available,
        "diskFreeMiB": disk,
        "dockerCliPresent": shutil.which("docker") is not None,
        "localDockerSocketPresent": local_socket(),
        "temporaryCI": any(os.environ.get(k) for k in ("CI", "GITHUB_ACTIONS", "GITLAB_CI")),
        "containerDetected": pathlib.Path("/.dockerenv").exists()
            or pathlib.Path("/run/.containerenv").exists()
            or any(k in cgroup for k in ("docker", "kubepods", "containerd", "lxc")),
    }


def main():
    result = assess(collect())
    result["observedAt"] = dt.datetime.now(dt.timezone.utc).isoformat()
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
