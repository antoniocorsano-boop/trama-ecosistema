import assert from "node:assert/strict";
import test from "node:test";
import { resolvePreflightState, type SemanticCriticResult } from "./visual-preflight";

const unavailableClaimingPass: SemanticCriticResult = {
  mode: "NOT_AVAILABLE",
  result: "PASS",
  findings: [],
};

test("NOT_AVAILABLE semantic critic cannot claim PASS without Human Preflight", () => {
  assert.equal(resolvePreflightState({
    deterministicFindings: [],
    semanticCritic: unavailableClaimingPass,
  }), "PREFLIGHT_REVISE");
});

test("NOT_AVAILABLE semantic critic only admits through explicit Human Preflight PASS", () => {
  assert.equal(resolvePreflightState({
    deterministicFindings: [],
    semanticCritic: { mode: "NOT_AVAILABLE", result: "NOT_RUN", findings: [] },
    humanPreflightDecision: "PASS",
  }), "PREFLIGHT_PASS");
});
