import assert from "node:assert/strict";
import test from "node:test";
import type { VisualGenerationPlan } from "./visual-factory";
import {
  executeVisualFactoryPlan,
  normalizeExecutorResponse,
  normalizeGradioExecutionResult,
} from "./visual-factory-executor";

const DIGEST = "d".repeat(64);

const PLAN: VisualGenerationPlan = {
  schemaVersion: "atlas.visual-generation-plan/v0.1",
  pathwayId: "pw-strategy-selection-01-museo-zero",
  packageDigest: DIGEST,
  planType: "REFERENCE_GENERATION",
  decision: "REFERENCE_GENERATION_READY",
  jobs: [{
    jobId: "reference-lia",
    purpose: "CHARACTER_REFERENCE",
    subjectRef: "lia",
    workflowFamily: "flux2-klein-4b/v0.2",
    prompt: "test prompt",
    negativeConstraints: [],
    referenceInputs: [],
    aspectRatio: "3:4",
    maxVariants: 1,
    preflightReceiptId: "vpc-test-receipt",
    preflightSpecDigest: "b".repeat(64),
    compiledPromptDigest: "c".repeat(64),
    preflightState: "PREFLIGHT_PASS",
  }],
  blockers: [],
  paidComputeAuthorized: false,
  allowQualityDowngrade: false,
  runtimeAuthorized: false,
  publicationAuthorityGranted: false,
};

function validReceipt(url = "https://assets.invalid/lia.png") {
  return {
    schemaVersion: "atlas.visual-execution-receipt/v0.1",
    receiptId: "receipt-1",
    packageDigest: DIGEST,
    status: "SUCCEEDED",
    costClass: "FREE_ONLY",
    assets: [{
      assetId: "lia-1",
      subjectRef: "lia",
      purpose: "CHARACTER_REFERENCE",
      url,
      sha256: "e".repeat(64),
      modelRef: "black-forest-labs/FLUX.2-klein-4B",
      workflowRef: "hf-zerogpu.flux2-klein-4b/v0.1",
      createdAt: "2026-10-04T20:00:00.000Z",
      packageDigest: DIGEST,
      provenanceStatus: "RECORDED",
    }],
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  };
}

function validOrchestrationEvidence() {
  return {
    schemaVersion: "atlas.visual-orchestration-evidence/v0.1",
    orchestrationId: "orch-1",
    workloadClass: "CANONICAL_REFERENCE",
    consideredProviders: ["HF_ZEROGPU", "CLOUDFLARE_WORKERS_AI"],
    selectedProvider: "HF_ZEROGPU",
    selectedModelRef: "black-forest-labs/FLUX.2-klein-4B",
    attempts: [{
      provider: "HF_ZEROGPU",
      eligibility: "ELIGIBLE",
      eligibilityReason: "HF_BASE_QUOTA_SUFFICIENT",
      quotaRemainingGpuSeconds: 300,
      outcome: "SUCCEEDED",
      startedAt: "2026-10-05T04:30:00.000Z",
      completedAt: "2026-10-05T04:30:00.042Z",
      durationMs: 42,
    }],
    finalState: "SUCCEEDED",
  };
}

test("malformed executor payload fails closed", () => {
  const receipt = normalizeExecutorResponse({ status: "SUCCEEDED", assets: [] }, DIGEST);
  assert.equal(receipt.status, "FAILED");
  assert.equal(receipt.failureCategory, "INVALID_EXECUTOR_RESPONSE");
  assert.equal(receipt.runtimeAuthorized, false);
  assert.equal(receipt.publicationAuthorityGranted, false);
});

test("valid executor payload preserves asset provenance and no authority", () => {
  const receipt = normalizeExecutorResponse(validReceipt(), DIGEST);

  assert.equal(receipt.status, "SUCCEEDED");
  assert.equal(receipt.assets[0]?.modelRef, "black-forest-labs/FLUX.2-klein-4B");
  assert.equal(receipt.assets[0]?.provenanceStatus, "RECORDED");
  assert.equal(receipt.paidComputeAuthorized, false);
});

test("valid optional orchestration evidence is preserved", () => {
  const receipt = normalizeExecutorResponse({
    ...validReceipt(),
    orchestration: validOrchestrationEvidence(),
  }, DIGEST);

  assert.equal(receipt.status, "SUCCEEDED");
  assert.equal(receipt.orchestration?.selectedProvider, "HF_ZEROGPU");
  assert.equal(receipt.orchestration?.attempts[0]?.quotaRemainingGpuSeconds, 300);
});

test("malformed optional orchestration evidence fails closed", () => {
  const receipt = normalizeExecutorResponse({
    ...validReceipt(),
    orchestration: {
      ...validOrchestrationEvidence(),
      attempts: [{ provider: "UNKNOWN_PROVIDER", eligibility: "ELIGIBLE", durationMs: -1 }],
    },
  }, DIGEST);

  assert.equal(receipt.status, "FAILED");
  assert.equal(receipt.failureCategory, "INVALID_EXECUTOR_RESPONSE");
  assert.equal(receipt.failureDetail, "CONTRACT_MISMATCH");
});

test("Gradio result replaces file placeholders before receipt validation", () => {
  const receipt = normalizeGradioExecutionResult(
    [
      validReceipt("gradio-file://0"),
      [{ url: "https://space.invalid/gradio_api/file=/tmp/lia.webp" }],
    ],
    DIGEST,
  );

  assert.equal(receipt.status, "SUCCEEDED");
  assert.equal(receipt.assets[0]?.url, "https://space.invalid/gradio_api/file=/tmp/lia.webp");
});

test("Gradio result fails closed when a referenced file is missing", () => {
  const receipt = normalizeGradioExecutionResult(
    [validReceipt("gradio-file://1"), [{ url: "https://space.invalid/only-file.webp" }]],
    DIGEST,
  );

  assert.equal(receipt.status, "FAILED");
  assert.equal(receipt.failureCategory, "INVALID_EXECUTOR_RESPONSE");
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
