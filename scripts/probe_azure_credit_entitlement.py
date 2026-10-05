#!/usr/bin/env python3
"""Read-only Azure credit entitlement adapter for TRAMA Visual Factory.

No provisioning and no billing mutation.
Requires Azure CLI authentication plus billing account/profile IDs.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def run_json(cmd: list[str]) -> Any:
    return json.loads(subprocess.check_output(cmd, text=True))


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--billing-account-id", required=True)
    p.add_argument("--billing-profile-id", required=True)
    p.add_argument("--run-cost-upper-bound-usd", type=float, required=True)
    p.add_argument("--system-ram-gib", type=float, default=0)
    p.add_argument("--disk-free-gib", type=float, default=0)
    p.add_argument("--accelerator", default="")
    p.add_argument("--vram-gib", type=float, default=0)
    p.add_argument("--output", required=True)
    args = p.parse_args()

    record: dict[str, Any] = {
        "providerId": "azure-credit",
        "skyInfra": "azure",
        "authorized": True,
        "credentialsAvailable": False,
        "effectiveCostClass": "UNKNOWN",
        "estimatedRunsRemaining": 0,
        "status": "UNKNOWN",
        "systemRamGiB": args.system_ram_gib,
        "diskFreeGiB": args.disk_free_gib,
        "accelerators": [],
        "evidenceRef": "azure-consumption-credit-balance",
    }
    if args.accelerator:
        record["accelerators"] = [{"name": args.accelerator, "vramGiB": args.vram_gib}]

    evidence: dict[str, Any] = {
        "schemaVersion": "trama.compute-entitlement-adapter-evidence/v0.1",
        "adapter": "azure-credit/v0.1",
        "observedAt": datetime.now(timezone.utc).isoformat(),
        "readOnly": True,
        "providerRecord": record,
    }

    if shutil.which("az") is None:
        evidence["decision"] = "NOT_CONFIGURED"
        evidence["reason"] = "AZURE_CLI_MISSING"
        Path(args.output).write_text(json.dumps(evidence, indent=2) + "\n")
        print(json.dumps(evidence, indent=2))
        return 0

    try:
        account = run_json(["az", "account", "show", "-o", "json"])
        record["credentialsAvailable"] = True

        url = (
            "https://management.azure.com/providers/Microsoft.Billing/"
            f"billingAccounts/{args.billing_account_id}/billingProfiles/{args.billing_profile_id}/"
            "providers/Microsoft.Consumption/credits/balanceSummary"
            "?api-version=2026-06-01"
        )
        credit = run_json(["az", "rest", "--method", "get", "--url", url, "-o", "json"])
        props = credit.get("properties", {})
        summary = props.get("balanceSummary", {})
        current = summary.get("currentBalance", {})
        balance = float(current.get("value", 0) or 0)
        currency = current.get("currency")

        evidence["azureAccount"] = {
            "subscriptionId": account.get("id"),
            "tenantId": account.get("tenantId"),
        }
        evidence["credit"] = {
            "currentBalance": balance,
            "currency": currency,
            "isEstimatedBalance": props.get("isEstimatedBalance"),
        }

        if currency != "USD":
            evidence["decision"] = "UNKNOWN"
            evidence["reason"] = "NON_USD_CREDIT_REQUIRES_EXCHANGE_RATE_QUALIFICATION"
        elif args.run_cost_upper_bound_usd <= 0:
            evidence["decision"] = "UNKNOWN"
            evidence["reason"] = "INVALID_RUN_COST_BOUND"
        else:
            runs = math.floor(balance / args.run_cost_upper_bound_usd)
            record["estimatedRunsRemaining"] = max(0, runs)
            record["effectiveCostClass"] = "CREDIT_COVERED" if runs >= 1 else "PAID"
            record["status"] = "AVAILABLE" if runs >= 1 else "UNAVAILABLE"
            evidence["decision"] = "ELIGIBLE" if runs >= 1 else "NOT_FREE"
            evidence["runCostUpperBoundUsd"] = args.run_cost_upper_bound_usd

    except subprocess.CalledProcessError as exc:
        evidence["decision"] = "NOT_CONFIGURED"
        evidence["reason"] = f"AZURE_READ_FAILED_EXIT_{exc.returncode}"
    except Exception as exc:
        evidence["decision"] = "UNKNOWN"
        evidence["reason"] = type(exc).__name__

    Path(args.output).write_text(json.dumps(evidence, indent=2) + "\n")
    print(json.dumps(evidence, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
