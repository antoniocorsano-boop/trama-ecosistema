import assert from "node:assert/strict";
import test from "node:test";
import type { VisualGenerationPlan } from "./visual-factory";
import {
  executeVisualFactoryPlan,
  normalizeExecutorResponse,
} from "./visual-factory-executor";

const DIGEST = "d".repeat(64);

const PLAN: VisualGenerationPlan = {
  schemaVersion: "atlas.visual-generation-plan/v0.1",
  pathwayId: "pw-strategy-selection-01-museo-zero",
  packageDigest: DIGEST,
  planType: "REFERENCE_GENERATION",
  decision: "REFERENCE_GENERATION_READY",
  jobs: [],
  blockers: [],
  paidComputeAuthorized: false,
  allowQualityDowngrade: false,
  runtimeAuthorized: false,
  publicationAuthorityGranted: false,
};

test("malformed executor payload fails closed", () => {
  const receipt = normalizeExecutorResponse({ status: "SUCCEEDED", assets: [] }, DIGEST);
  assert.equal(receipt.status, "FAILED");
  assert.equal(receipt.failureCategory, "INVALID_EXECUTOR_RESPONSE");
  assert.equal(receipt.runtimeAuthorized, false);
  assert.equal(receipt.publicationAuthorityGranted, false);
});

test("valid executor payload preserves asset provenance and no authority", () => {
  const receipt = normalizeExecutorResponse({
    schemaVersion: "atlas.visual-execution-receipt/v0.1",
    receiptId: "receipt-1",
    packageDigest: DIGEST,
    status: "SUCCEEDED",
    costClass: "FREE_ONLY",
    assets: [{
      assetId: "lia-1",
      subjectRef: "lia",
      purpose: "CHARACTER_REFERENCE",
      url: "https://assets.invalid/lia.png",
      sha256: "e".repeat(64),
      modelRef: "black-forest-labs/FLUX.1-schnell",
      workflowRef: "diffusers.flux1-schnell/v0.1",
      createdAt: "2026-10-04T20:00:00.000Z",
      packageDigest: DIGEST,
      provenanceStatus: "RECORDED",
    }],
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  }, DIGEST);

  assert.equal(receipt.status, "SUCCEEDED");
  assert.equal(receipt.assets[0]?.modelRef, "black-forest-labs/FLUX.1-schnell");
  assert.equal(receipt.assets[0]?.provenanceStatus, "RECORDED");
  assert.equal(receipt.paidComputeAuthorized, false);
});

test("same-origin gateway propagates WAITING_FOR_COMPUTE without throwing", async () => {
  const fetchImpl: typeof fetch = async () => new Response(JSON.stringify({
    schemaVersion: "atlas.visual-execution-receipt/v0.1",
    receiptId: "receipt-wait",
    packageDigest: DIGEST,
    status: "WAITING_FOR_COMPUTE",
    costClass: "FREE_ONLY",
    assets: [],
    failureCategory: "NO_FREE_PROVIDER",
    failureDetail: "EXECUTOR_NOT_CONFIGURED",
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  }), { status: 503, headers: { "content-type": "application/json" } });

  const receipt = await executeVisualFactoryPlan(PLAN, fetchImpl);

  assert.equal(receipt.status, "WAITING_FOR_COMPUTE");
  assert.equal(receipt.failureCategory, "NO_FREE_PROVIDER");
});
