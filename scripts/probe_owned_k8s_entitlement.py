#!/usr/bin/env python3
"""Read-only owned Kubernetes GPU entitlement adapter for TRAMA Visual Factory.

The explicit zero-marginal authorization is required and cannot be inferred.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


GPU_KEYS = ("nvidia.com/gpu", "amd.com/gpu")


def kubectl_json(args: list[str], context: str) -> Any:
    cmd = ["kubectl"]
    if context:
        cmd += ["--context", context]
    cmd += args + ["-o", "json"]
    return json.loads(subprocess.check_output(cmd, text=True))


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--context", default="")
    p.add_argument("--provider-id", default="owned-k8s-gpu")
    p.add_argument("--zero-marginal-authorized", action="store_true")
    p.add_argument("--accelerator-name", default="T4")
    p.add_argument("--vram-gib", type=float, default=16)
    p.add_argument("--system-ram-gib", type=float, default=0)
    p.add_argument("--disk-free-gib", type=float, default=0)
    p.add_argument("--estimated-runs-remaining", type=int, default=0)
    p.add_argument("--output", required=True)
    args = p.parse_args()

    record: dict[str, Any] = {
        "providerId": args.provider_id,
        "skyInfra": f"k8s/{args.context}" if args.context else "k8s",
        "authorized": bool(args.zero_marginal_authorized),
        "credentialsAvailable": False,
        "effectiveCostClass": "ZERO_MARGINAL" if args.zero_marginal_authorized else "UNKNOWN",
        "estimatedRunsRemaining": 0,
        "status": "UNKNOWN",
        "systemRamGiB": args.system_ram_gib,
        "diskFreeGiB": args.disk_free_gib,
        "accelerators": [],
        "evidenceRef": "kubernetes-allocatable-gpu",
    }
    evidence: dict[str, Any] = {
        "schemaVersion": "trama.compute-entitlement-adapter-evidence/v0.1",
        "adapter": "owned-kubernetes/v0.1",
        "observedAt": datetime.now(timezone.utc).isoformat(),
        "readOnly": True,
        "providerRecord": record,
    }

    if not args.zero_marginal_authorized:
        evidence["decision"] = "UNKNOWN"
        evidence["reason"] = "ZERO_MARGINAL_USE_NOT_AUTHORIZED"
        Path(args.output).write_text(json.dumps(evidence, indent=2) + "\n")
        print(json.dumps(evidence, indent=2))
        return 0

    if shutil.which("kubectl") is None:
        evidence["decision"] = "NOT_CONFIGURED"
        evidence["reason"] = "KUBECTL_MISSING"
        Path(args.output).write_text(json.dumps(evidence, indent=2) + "\n")
        print(json.dumps(evidence, indent=2))
        return 0

    try:
        nodes = kubectl_json(["get", "nodes"], args.context)
        record["credentialsAvailable"] = True
        allocatable = 0
        node_evidence = []
        for node in nodes.get("items", []):
            alloc = node.get("status", {}).get("allocatable", {})
            gpu_count = 0
            gpu_key = None
            for key in GPU_KEYS:
                if key in alloc:
                    gpu_key = key
                    try:
                        gpu_count = int(alloc[key])
                    except (TypeError, ValueError):
                        gpu_count = 0
                    break
            if gpu_count > 0:
                allocatable += gpu_count
                node_evidence.append({
                    "node": node.get("metadata", {}).get("name"),
                    "gpuResource": gpu_key,
                    "allocatable": gpu_count,
                })

        evidence["gpuNodes"] = node_evidence
        evidence["allocatableGpuCount"] = allocatable

        if allocatable < 1:
            record["status"] = "UNAVAILABLE"
            evidence["decision"] = "NOT_FREE"
            evidence["reason"] = "NO_ALLOCATABLE_GPU"
        elif args.estimated_runs_remaining < 1:
            record["status"] = "DEGRADED"
            evidence["decision"] = "UNKNOWN"
            evidence["reason"] = "RUN_CAPACITY_ESTIMATE_NOT_PROVIDED"
        else:
            record["accelerators"] = [{"name": args.accelerator_name, "vramGiB": args.vram_gib}]
            record["estimatedRunsRemaining"] = args.estimated_runs_remaining
            record["status"] = "AVAILABLE"
            evidence["decision"] = "ELIGIBLE"

    except subprocess.CalledProcessError as exc:
        evidence["decision"] = "NOT_CONFIGURED"
        evidence["reason"] = f"KUBECTL_READ_FAILED_EXIT_{exc.returncode}"
    except Exception as exc:
        evidence["decision"] = "UNKNOWN"
        evidence["reason"] = type(exc).__name__

    Path(args.output).write_text(json.dumps(evidence, indent=2) + "\n")
    print(json.dumps(evidence, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
