import assert from "node:assert/strict";
import test from "node:test";
import type { VisualGenerationPlan } from "./visual-factory";
import type { OrchestrationContext } from "./visual-factory-orchestrator";
import { createHfZeroGpuAdapter } from "./visual-factory-provider-hf";

const DIGEST = "c".repeat(64);
const TOKEN = "hf_secret_test_value";

function plan(planType: VisualGenerationPlan["planType"] = "REFERENCE_GENERATION"): VisualGenerationPlan {
  return {
    schemaVersion: "atlas.visual-generation-plan/v0.1",
    pathwayId: "pw-strategy-selection-01-museo-zero",
    packageDigest: DIGEST,
    planType,
    decision: planType === "REFERENCE_GENERATION" ? "REFERENCE_GENERATION_READY" : "SHOT_GENERATION_READY",
    jobs: [{
      jobId: planType === "REFERENCE_GENERATION" ? "reference-lia" : "shot-F1",
      purpose: planType === "REFERENCE_GENERATION" ? "CHARACTER_REFERENCE" : "SCENE_FRAME",
      subjectRef: planType === "REFERENCE_GENERATION" ? "lia" : "F1",
      workflowFamily: "flux2-klein-4b/v0.2",
      prompt: "test",
      negativeConstraints: [],
      referenceInputs: [],
      aspectRatio: "4:3",
      maxVariants: 1,
    }],
    blockers: [],
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  };
}

function ctx(overrides: Partial<OrchestrationContext> = {}): OrchestrationContext {
  return {
    unfinishedCanonicalReferenceCount: 5,
    hfConfiguredFloorSeconds: 40,
    hfSafetyMarginSeconds: 20,
    ...overrides,
  };
}

function gradioSuccess() {
  return [{
    schemaVersion: "atlas.visual-execution-receipt/v0.1",
    receiptId: "hf-receipt",
    packageDigest: DIGEST,
    status: "SUCCEEDED",
    costClass: "FREE_ONLY",
    assets: [{
      assetId: "lia-1",
      subjectRef: "lia",
      purpose: "CHARACTER_REFERENCE",
      url: "gradio-file://0",
      sha256: "d".repeat(64),
      modelRef: "black-forest-labs/FLUX.2-klein-4B",
      workflowRef: "hf-zerogpu.flux2-klein-4b/v0.1",
      createdAt: "2026-10-05T05:00:00.000Z",
      packageDigest: DIGEST,
      provenanceStatus: "RECORDED",
    }],
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  }, [{ url: "https://space.invalid/gradio_api/file=/tmp/lia.webp" }]];
}

test("missing token or Space makes HF ineligible without quota or inference calls", async () => {
  let quotaCalls = 0;
  let predictCalls = 0;
  const adapter = createHfZeroGpuAdapter({}, {
    async getQuota() { quotaCalls += 1; return { base: 300, remaining: 300, overquotaUsed: 0 }; },
    async predict() { predictCalls += 1; return gradioSuccess(); },
  });

  const eligibility = await adapter.preflight(plan(), ctx());
  assert.equal(eligibility.eligible, false);
  assert.equal(eligibility.reason, "HF_NOT_CONFIGURED");
  assert.equal(quotaCalls, 0);
  assert.equal(predictCalls, 0);
});

test("protected reference reserve rejects insufficient HF quota before inference", async () => {
  let predictCalls = 0;
  const adapter = createHfZeroGpuAdapter({ token: TOKEN, spaceUrl: "owner/space" }, {
    async getQuota() { return { base: 300, remaining: 210, overquotaUsed: 0 }; },
    async predict() { predictCalls += 1; return gradioSuccess(); },
  });

  const eligibility = await adapter.preflight(plan(), ctx());
  assert.equal(eligibility.eligible, false);
  assert.equal(eligibility.reason, "PROVIDER_EXHAUSTED:HF_QUOTA_PROTECTED");
  assert.equal(eligibility.remainingGpuSeconds, 210);
  assert.equal(predictCalls, 0);
});

test("safe HF quota permits exactly one Gradio inference attempt", async () => {
  let predictCalls = 0;
  const adapter = createHfZeroGpuAdapter({ token: TOKEN, spaceUrl: "owner/space" }, {
    async getQuota() { return { base: 300, remaining: 300, overquotaUsed: 0, resetsAt: "2026-10-06T04:00:00Z" }; },
    async predict() { predictCalls += 1; return gradioSuccess(); },
  });

  const eligibility = await adapter.preflight(plan(), ctx());
  assert.equal(eligibility.eligible, true);
  assert.equal(eligibility.remainingGpuSeconds, 300);

  const outcome = await adapter.execute(plan(), ctx());
  assert.equal(outcome.kind, "SUCCEEDED");
  assert.equal(outcome.receipt?.assets[0]?.modelRef, "black-forest-labs/FLUX.2-klein-4B");
  assert.equal(predictCalls, 1);
});

test("paid overquota usage makes HF ineligible even when a response reports remaining seconds", async () => {
  const adapter = createHfZeroGpuAdapter({ token: TOKEN, spaceUrl: "owner/space" }, {
    async getQuota() { return { base: 300, remaining: 300, overquotaUsed: 1 }; },
    async predict() { throw new Error("must not run"); },
  });

  const eligibility = await adapter.preflight(plan(), ctx());
  assert.equal(eligibility.eligible, false);
  assert.equal(eligibility.reason, "HF_OVERQUOTA_NOT_ALLOWED");
});

test("timeout, 429 and capacity failures are fallback eligible and redact the token", async () => {
  for (const failure of [
    Object.assign(new Error(`timeout ${TOKEN}`), { name: "TimeoutError" }),
    Object.assign(new Error(`rate limited ${TOKEN}`), { status: 429 }),
    Object.assign(new Error(`capacity ${TOKEN}`), { status: 503 }),
  ]) {
    const adapter = createHfZeroGpuAdapter({ token: TOKEN, spaceUrl: "owner/space" }, {
      async getQuota() { return { base: 300, remaining: 300, overquotaUsed: 0 }; },
      async predict() { throw failure; },
    });

    const outcome = await adapter.execute(plan(), ctx());
    assert.ok(outcome.kind === "RETRYABLE_PROVIDER_FAILURE" || outcome.kind === "PROVIDER_EXHAUSTED");
    assert.equal(outcome.detail?.includes(TOKEN), false);
  }
});

test("malformed Gradio success cannot become an accepted asset", async () => {
  const adapter = createHfZeroGpuAdapter({ token: TOKEN, spaceUrl: "owner/space" }, {
    async getQuota() { return { base: 300, remaining: 300, overquotaUsed: 0 }; },
    async predict() { return [{ status: "SUCCEEDED" }, []]; },
  });

  const outcome = await adapter.execute(plan(), ctx());
  assert.equal(outcome.kind, "PERMANENT_FAILURE");
  assert.equal(outcome.receipt, undefined);
});
