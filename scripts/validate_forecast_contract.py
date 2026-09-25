#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POLICY = ROOT / "config/governed-forecast-policy.json"
SCHEMA = ROOT / "schemas/governed-forecast.schema.json"
DECISIONS = ROOT / "docs/decisions/decision-register.json"

FORBIDDEN_FORECAST_FIELDS = {
    "state",
    "runtimeState",
    "approved",
    "authorized",
    "probability",
    "likelihood",
    "score",
    "overallScore",
}


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def fail(message: str) -> None:
    raise SystemExit(message)


def main() -> None:
    policy = load(POLICY)
    schema = load(SCHEMA)
    decisions = load(DECISIONS)

    if policy.get("phase") != "CC3-F0":
        fail("forecast policy must be bound to CC3-F0")
    if policy.get("mode") != "ADVISORY_READ_ONLY":
        fail("forecast policy must remain advisory/read-only")
    if policy.get("confidenceMode") != "QUALITATIVE_ONLY":
        fail("forecast confidence must remain qualitative-only")
    if policy.get("allowedConfidence") != ["LOW", "MEDIUM", "HIGH"]:
        fail("forecast confidence set drifted")
    if policy.get("numericProbability") != "FORBIDDEN_UNTIL_CALIBRATED_AND_REAUTHORIZED":
        fail("numeric probability must remain forbidden")
    for key in (
        "aggregateScore",
        "canonicalStateMutation",
        "gateMutation",
        "autoPromotion",
        "runtimeAuthorization",
        "crossProductWrite",
        "scenarioMutation",
        "dosA1Activation",
    ):
        if policy.get(key) != "FORBIDDEN":
            fail(f"{key} must remain FORBIDDEN")

    adr = next((item for item in decisions.get("decisions", []) if item.get("id") == "TRAMA-ADR-016"), None)
    if adr is None:
        fail("TRAMA-ADR-016 missing from decision register")
    if adr.get("status") != "PROPOSED":
        fail("TRAMA-ADR-016 must remain PROPOSED until human approval")
    if adr.get("humanControlImpact") != "STRENGTHENED":
        fail("TRAMA-ADR-016 must strengthen human control")

    forecast_schema = schema["properties"]["forecasts"]["items"]
    if forecast_schema.get("additionalProperties") is not False:
        fail("forecast records must reject unknown fields")
    forecast_properties = set(forecast_schema.get("properties", {}))
    forbidden_present = FORBIDDEN_FORECAST_FIELDS & forecast_properties
    if forbidden_present:
        fail(f"forbidden forecast fields present: {sorted(forbidden_present)}")

    confidence = forecast_schema["properties"]["confidence"].get("enum")
    if confidence != ["LOW", "MEDIUM", "HIGH"]:
        fail("forecast schema confidence enum drifted")

    for field in ("canonicalStateImpact", "authorityImpact", "runtimeAuthorizationImpact"):
        if forecast_schema["properties"][field].get("const") != "NONE":
            fail(f"{field} must be const NONE")

    scenario_schema = schema["properties"]["scenarios"]["items"]
    if scenario_schema["properties"]["mutationImpact"].get("const") != "NONE":
        fail("scenario mutationImpact must be const NONE")

    receipt_schema = schema["properties"]["receipts"]["items"]
    if receipt_schema["properties"]["promotionImpact"].get("const") != "NONE":
        fail("ForecastReceipt promotionImpact must be const NONE")

    print("TRAMA_CC3_F0_FORECAST_CONTRACT_PASS")


if __name__ == "__main__":
    main()
