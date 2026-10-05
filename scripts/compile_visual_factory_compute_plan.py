#!/usr/bin/env python3
"""Compile TRAMA Visual Factory compute policy into a SkyPilot resource plan.

Pure-stdlib and deterministic. It never provisions compute.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
from pathlib import Path
from typing import Any


FREE_COST_CLASSES = {"ZERO_MARGINAL", "CREDIT_COVERED"}


def load_json(path: str) -> dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def parse_time(value: str) -> dt.datetime:
    parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=dt.timezone.utc)
    return parsed.astimezone(dt.timezone.utc)


def validate_policy(policy: dict[str, Any]) -> None:
    required = {
        "schemaVersion",
        "policyId",
        "costMode",
        "qualityProfile",
        "minVramGiB",
        "minSystemRamGiB",
        "minDiskGiB",
        "acceleratorPreference",
        "maxProviderAttempts",
        "maxSnapshotAgeMinutes",
        "requiredEstimatedRunsRemaining",
        "noPaidFallback",
        "noQualityDowngrade",
    }
    missing = sorted(required - policy.keys())
    if missing:
        raise ValueError(f"policy missing required fields: {missing}")
    if policy["schemaVersion"] != "trama.compute-policy/v0.1":
        raise ValueError("unsupported policy schemaVersion")
    if policy["costMode"] != "FREE_ONLY":
        raise ValueError("v0.1 only supports FREE_ONLY")
    if policy["noPaidFallback"] is not True:
        raise ValueError("noPaidFallback must be true")
    if policy["noQualityDowngrade"] is not True:
        raise ValueError("noQualityDowngrade must be true")
    if not policy["acceleratorPreference"]:
        raise ValueError("acceleratorPreference must not be empty")


def validate_snapshot(snapshot: dict[str, Any]) -> None:
    if snapshot.get("schemaVersion") != "trama.compute-entitlement-snapshot/v0.1":
        raise ValueError("unsupported entitlement snapshot schemaVersion")
    for key in ("snapshotId", "observedAt", "providers"):
        if key not in snapshot:
            raise ValueError(f"snapshot missing required field: {key}")


def choose_accelerator(provider: dict[str, Any], policy: dict[str, Any]) -> dict[str, Any] | None:
    by_name = {x["name"].upper(): x for x in provider.get("accelerators", [])}
    for preferred in policy["acceleratorPreference"]:
        item = by_name.get(preferred.upper())
        if item and float(item.get("vramGiB", 0)) >= float(policy["minVramGiB"]):
            return item
    return None


def provider_reasons(provider: dict[str, Any], policy: dict[str, Any]) -> list[str]:
    reasons: list[str] = []
    allowlist = set(policy.get("providerAllowlist", []))
    if allowlist and provider.get("providerId") not in allowlist:
        reasons.append("NOT_ALLOWLISTED")
    if provider.get("authorized") is not True:
        reasons.append("NOT_AUTHORIZED")
    if provider.get("credentialsAvailable") is not True:
        reasons.append("CREDENTIALS_UNAVAILABLE")
    if provider.get("status") != "AVAILABLE":
        reasons.append(f"STATUS_{provider.get('status', 'UNKNOWN')}")
    if provider.get("effectiveCostClass") not in FREE_COST_CLASSES:
        reasons.append("NOT_ZERO_MARGINAL_COST")
    if int(provider.get("estimatedRunsRemaining", 0)) < int(policy["requiredEstimatedRunsRemaining"]):
        reasons.append("INSUFFICIENT_FREE_ENTITLEMENT")
    if float(provider.get("systemRamGiB", 0)) < float(policy["minSystemRamGiB"]):
        reasons.append("INSUFFICIENT_SYSTEM_RAM")
    if float(provider.get("diskFreeGiB", 0)) < float(policy["minDiskGiB"]):
        reasons.append("INSUFFICIENT_DISK")
    if choose_accelerator(provider, policy) is None:
        reasons.append("NO_QUALIFIED_ACCELERATOR")
    if not provider.get("skyInfra"):
        reasons.append("NO_SKYPILOT_INFRA")
    return reasons


def yaml_scalar(value: Any) -> str:
    s = str(value)
    if not s or any(ch in s for ch in ":#{}[],&*?|-<>=!%@\\\"'") or " " in s:
        return json.dumps(s)
    return s


def render_skypilot_yaml(plan: dict[str, Any], policy: dict[str, Any]) -> str:
    lines = [
        "name: trama-visual-factory-q4",
        "resources:",
        "  ordered:",
    ]
    for candidate in plan["selectedCandidates"]:
        lines.extend(
            [
                f"    - infra: {yaml_scalar(candidate['skyInfra'])}",
                f"      accelerators: {yaml_scalar(candidate['accelerator'] + ':1')}",
            ]
        )
    lines.extend(
        [
            f"  memory: {yaml_scalar(str(policy['minSystemRamGiB']) + '+')}",
            f"  disk_size: {int(policy['minDiskGiB'])}",
            "  autostop:",
            "    idle_minutes: 5",
            "    down: true",
            "    wait_for: none",
            "",
            "# Resource plan only. Workdir/setup/run are bound by the exact VisualProductionRequest.",
            "# TRAMA Compute Policy has already filtered candidates to FREE_ONLY eligibility.",
            "",
        ]
    )
    return "\n".join(lines)


def compile_plan(policy: dict[str, Any], snapshot: dict[str, Any], now: dt.datetime) -> dict[str, Any]:
    validate_policy(policy)
    validate_snapshot(snapshot)

    observed = parse_time(snapshot["observedAt"])
    age_minutes = (now - observed).total_seconds() / 60
    if age_minutes < -1:
        raise ValueError("snapshot observedAt is in the future")
    if age_minutes > int(policy["maxSnapshotAgeMinutes"]):
        return {
            "schemaVersion": "trama.compute-plan/v0.1",
            "policyId": policy["policyId"],
            "snapshotId": snapshot["snapshotId"],
            "qualityProfile": policy["qualityProfile"],
            "costMode": policy["costMode"],
            "decision": "STOP_STALE_ENTITLEMENT_SNAPSHOT",
            "selectedCandidates": [],
            "excludedProviders": [],
            "snapshotAgeMinutes": round(age_minutes, 2),
            "runtimeAuthorized": False,
        }

    preference = {name.upper(): idx for idx, name in enumerate(policy["acceleratorPreference"])}
    eligible: list[dict[str, Any]] = []
    excluded: list[dict[str, Any]] = []

    for provider in snapshot["providers"]:
        reasons = provider_reasons(provider, policy)
        accelerator = choose_accelerator(provider, policy)
        if reasons:
            excluded.append({"providerId": provider.get("providerId"), "reasons": reasons})
            continue
        assert accelerator is not None
        eligible.append(
            {
                "providerId": provider["providerId"],
                "skyInfra": provider["skyInfra"],
                "accelerator": accelerator["name"],
                "vramGiB": accelerator["vramGiB"],
                "estimatedRunsRemaining": provider["estimatedRunsRemaining"],
                "evidenceRef": provider.get("evidenceRef"),
                "_pref": preference.get(accelerator["name"].upper(), 9999),
            }
        )

    eligible.sort(
        key=lambda x: (
            -int(x["estimatedRunsRemaining"]),
            int(x["_pref"]),
            x["providerId"],
        )
    )
    selected = eligible[: int(policy["maxProviderAttempts"])]
    for item in selected:
        item.pop("_pref", None)

    return {
        "schemaVersion": "trama.compute-plan/v0.1",
        "policyId": policy["policyId"],
        "snapshotId": snapshot["snapshotId"],
        "qualityProfile": policy["qualityProfile"],
        "costMode": policy["costMode"],
        "decision": "PLAN_READY" if selected else "STOP_NO_FREE_PROVIDER",
        "selectedCandidates": selected,
        "excludedProviders": excluded,
        "snapshotAgeMinutes": round(age_minutes, 2),
        "noPaidFallback": True,
        "noQualityDowngrade": True,
        "runtimeAuthorized": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--policy", required=True)
    parser.add_argument("--snapshot", required=True)
    parser.add_argument("--plan-out", required=True)
    parser.add_argument("--sky-out")
    parser.add_argument("--now", help="ISO-8601 UTC time for deterministic tests")
    args = parser.parse_args()

    policy = load_json(args.policy)
    snapshot = load_json(args.snapshot)
    now = parse_time(args.now) if args.now else dt.datetime.now(dt.timezone.utc)
    plan = compile_plan(policy, snapshot, now)

    Path(args.plan_out).write_text(json.dumps(plan, indent=2) + "\n", encoding="utf-8")
    if args.sky_out and plan["decision"] == "PLAN_READY":
        Path(args.sky_out).write_text(render_skypilot_yaml(plan, policy), encoding="utf-8")

    print(json.dumps(plan, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
