import assert from "node:assert/strict";
import test from "node:test";
import { getVisualFactoryRetryPreflightState } from "./visual-factory-retry";

test("reference retry after reload requires a new explicit preflight confirmation", () => {
  assert.deepEqual(
    getVisualFactoryRetryPreflightState(0, false, false),
    { kind: "REFERENCES", approved: false, requiresConfirmation: true },
  );
  assert.deepEqual(
    getVisualFactoryRetryPreflightState(0, true, false),
    { kind: "REFERENCES", approved: true, requiresConfirmation: false },
  );
});

test("shot retry after reload requires a new explicit preflight confirmation", () => {
  assert.deepEqual(
    getVisualFactoryRetryPreflightState(5, false, false),
    { kind: "SHOTS", approved: false, requiresConfirmation: true },
  );
  assert.deepEqual(
    getVisualFactoryRetryPreflightState(5, false, true),
    { kind: "SHOTS", approved: true, requiresConfirmation: false },
  );
});
