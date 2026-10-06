import assert from "node:assert/strict";
import test from "node:test";
import type { VisualExecutionReceipt, VisualGenerationPlan } from "./visual-factory";
import {
  computeProtectedHfReserve,
  orchestrateVisualGeneration,
  selectProviderOrder,
  type OrchestrationContext,
  type ProviderAttemptOutcome,
  type ProviderEligibility,
  type VisualProviderAdapter,
  type VisualProviderId,
} from "./visual-factory-orchestrator";

const DIGEST = "a".repeat(64);

function plan(planType: VisualGenerationPlan["planType"]): VisualGenerationPlan {
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
      shotId: planType === "SHOT_GENERATION" ? "F1" : undefined,
      sceneRef: planType === "SHOT_GENERATION" ? "MZ1_FAILED_REHEARSAL" : undefined,
      workflowFamily: "flux2-klein-4b/v0.2",
      prompt: "test prompt",
      negativeConstraints: [],
      referenceInputs: planType === "SHOT_GENERATION" ? ["https://assets.invalid/lia.webp"] : [],
      aspectRatio: "4:3",
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
}

function ctx(overrides: Partial<OrchestrationContext> = {}): OrchestrationContext {
  return {
    unfinishedCanonicalReferenceCount: 5,
    hfQuotaRemainingSeconds: 300,
    hfConfiguredFloorSeconds: 40,
    hfSafetyMarginSeconds: 20,
    ...overrides,
  };
}

function successReceipt(provider: VisualProviderId): VisualExecutionReceipt {
  return {
    schemaVersion: "atlas.visual-execution-receipt/v0.1",
    receiptId: `receipt-${provider}`,
    packageDigest: DIGEST,
    status: "SUCCEEDED",
    costClass: "FREE_ONLY",
    assets: [{
      assetId: `asset-${provider}`,
      subjectRef: "lia",
      purpose: "CHARACTER_REFERENCE",
      url: "https://assets.invalid/lia.webp",
      sha256: "b".repeat(64),
      modelRef: provider === "HF_ZEROGPU"
        ? "black-forest-labs/FLUX.2-klein-4B"
        : "@cf/black-forest-labs/flux-2-klein-4b",
      workflowRef: provider === "HF_ZEROGPU"
        ? "hf-zerogpu.flux2-klein-4b/v0.1"
        : "cloudflare-workers-ai.flux2-klein-4b/v0.1",
      createdAt: "2026-10-05T04:30:00.000Z",
      packageDigest: DIGEST,
      provenanceStatus: "RECORDED",
    }],
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  };
}

function adapter(
  id: VisualProviderId,
  eligibility: ProviderEligibility,
  outcome: ProviderAttemptOutcome,
  counts: Record<string, number>,
): VisualProviderAdapter {
  return {
    id,
    async preflight() {
      counts[`${id}:preflight`] = (counts[`${id}:preflight`] ?? 0) + 1;
      return eligibility;
    },
    async execute() {
      counts[`${id}:execute`] = (counts[`${id}:execute`] ?? 0) + 1;
      return outcome;
    },
  };
}

test("protected HF reserve uses the conservative reference estimate", () => {
  assert.equal(computeProtectedHfReserve({
    unfinishedReferenceCount: 4,
    configuredFloorSeconds: 40,
    measuredReferenceP95Seconds: 55,
    safetyMarginSeconds: 20,
  }), 240);
});

test("canonical reference orders HF before Cloudflare when quota protects the other references", () => {
  assert.deepEqual(selectProviderOrder(plan("REFERENCE_GENERATION"), ctx({ hfQuotaRemainingSeconds: 300 })), [
    "HF_ZEROGPU",
    "CLOUDFLARE_WORKERS_AI",
  ]);
});

test("canonical reference omits HF when the attempt would invade reserve", () => {
  assert.deepEqual(selectProviderOrder(plan("REFERENCE_GENERATION"), ctx({ hfQuotaRemainingSeconds: 210 })), [
    "CLOUDFLARE_WORKERS_AI",
  ]);
});

test("scene generation prefers Cloudflare while canonical references remain unfinished", () => {
  assert.deepEqual(selectProviderOrder(plan("SHOT_GENERATION"), ctx({ hfQuotaRemainingSeconds: 500 })), [
    "CLOUDFLARE_WORKERS_AI",
    "HF_ZEROGPU",
  ]);
});

test("ineligible providers are skipped and the next eligible provider can succeed", async () => {
  const counts: Record<string, number> = {};
  const receipt = await orchestrateVisualGeneration(
    plan("REFERENCE_GENERATION"),
    {
      HF_ZEROGPU: adapter("HF_ZEROGPU", { eligible: false, reason: "QUOTA_UNKNOWN" }, { kind: "PERMANENT_FAILURE" }, counts),
      CLOUDFLARE_WORKERS_AI: adapter(
        "CLOUDFLARE_WORKERS_AI",
        { eligible: true, reason: "FREE_PLAN_ADMITTED" },
        { kind: "SUCCEEDED", receipt: successReceipt("CLOUDFLARE_WORKERS_AI") },
        counts,
      ),
    },
    ctx(),
  );

  assert.equal(receipt.status, "SUCCEEDED");
  assert.equal(counts["HF_ZEROGPU:execute"] ?? 0, 0);
  assert.equal(counts["CLOUDFLARE_WORKERS_AI:execute"], 1);
});

test("each provider is attempted at most once in a bounded fallback pass", async () => {
  const counts: Record<string, number> = {};
  const receipt = await orchestrateVisualGeneration(
    plan("REFERENCE_GENERATION"),
    {
      HF_ZEROGPU: adapter(
        "HF_ZEROGPU",
        { eligible: true, reason: "QUOTA_OK", remainingGpuSeconds: 300 },
        { kind: "RETRYABLE_PROVIDER_FAILURE", detail: "TIMEOUT" },
        counts,
      ),
      CLOUDFLARE_WORKERS_AI: adapter(
        "CLOUDFLARE_WORKERS_AI",
        { eligible: true, reason: "FREE_PLAN_ADMITTED" },
        { kind: "PROVIDER_EXHAUSTED", detail: "HTTP_429" },
        counts,
      ),
    },
    ctx(),
  );

  assert.equal(receipt.status, "WAITING_FOR_COMPUTE");
  assert.equal(counts["HF_ZEROGPU:execute"], 1);
  assert.equal(counts["CLOUDFLARE_WORKERS_AI:execute"], 1);
});

test("all-provider failure degrades to FREE_ONLY WAITING_FOR_COMPUTE with no authority", async () => {
  const counts: Record<string, number> = {};
  const receipt = await orchestrateVisualGeneration(
    plan("REFERENCE_GENERATION"),
    {
      HF_ZEROGPU: adapter(
        "HF_ZEROGPU",
        { eligible: true, reason: "QUOTA_OK", remainingGpuSeconds: 300 },
        { kind: "RETRYABLE_PROVIDER_FAILURE", detail: "TIMEOUT" },
        counts,
      ),
      CLOUDFLARE_WORKERS_AI: adapter(
        "CLOUDFLARE_WORKERS_AI",
        { eligible: false, reason: "FREE_PLAN_UNKNOWN" },
        { kind: "PERMANENT_FAILURE" },
        counts,
      ),
    },
    ctx(),
  );

  assert.equal(receipt.status, "WAITING_FOR_COMPUTE");
  assert.equal(receipt.costClass, "FREE_ONLY");
  assert.equal(receipt.paidComputeAuthorized, false);
  assert.equal(receipt.allowQualityDowngrade, false);
  assert.equal(receipt.runtimeAuthorized, false);
  assert.equal(receipt.publicationAuthorityGranted, false);
  assert.equal(receipt.failureCategory, "NO_FREE_PROVIDER");
});

test("HF to Cloudflare fallback records both attempts in order and selected model", async () => {
  const counts: Record<string, number> = {};
  const receipt = await orchestrateVisualGeneration(
    plan("REFERENCE_GENERATION"),
    {
      HF_ZEROGPU: adapter(
        "HF_ZEROGPU",
        { eligible: true, reason: "HF_BASE_QUOTA_SUFFICIENT", remainingGpuSeconds: 300 },
        { kind: "RETRYABLE_PROVIDER_FAILURE", detail: "TIMEOUT" },
        counts,
      ),
      CLOUDFLARE_WORKERS_AI: adapter(
        "CLOUDFLARE_WORKERS_AI",
        { eligible: true, reason: "CLOUDFLARE_WORKERS_FREE_ADMITTED" },
        { kind: "SUCCEEDED", receipt: successReceipt("CLOUDFLARE_WORKERS_AI") },
        counts,
      ),
    },
    ctx(),
  );

  assert.equal(receipt.status, "SUCCEEDED");
  assert.equal(receipt.orchestration?.schemaVersion, "atlas.visual-orchestration-evidence/v0.1");
  assert.equal(receipt.orchestration?.workloadClass, "CANONICAL_REFERENCE");
  assert.deepEqual(receipt.orchestration?.consideredProviders, ["HF_ZEROGPU", "CLOUDFLARE_WORKERS_AI"]);
  assert.deepEqual(receipt.orchestration?.attempts.map((item) => [item.provider, item.outcome]), [
    ["HF_ZEROGPU", "RETRYABLE_PROVIDER_FAILURE"],
    ["CLOUDFLARE_WORKERS_AI", "SUCCEEDED"],
  ]);
  assert.equal(receipt.orchestration?.attempts[0]?.quotaRemainingGpuSeconds, 300);
  assert.equal(receipt.orchestration?.selectedProvider, "CLOUDFLARE_WORKERS_AI");
  assert.equal(receipt.orchestration?.selectedModelRef, "@cf/black-forest-labs/flux-2-klein-4b");
  assert.equal(receipt.orchestration?.finalState, "SUCCEEDED");
});

test("orchestration evidence records categories and quota but never copies free-form provider details", async () => {
  const secret = "hf_token_must_not_appear";
  const counts: Record<string, number> = {};
  const receipt = await orchestrateVisualGeneration(
    plan("REFERENCE_GENERATION"),
    {
      HF_ZEROGPU: adapter(
        "HF_ZEROGPU",
        { eligible: true, reason: "HF_BASE_QUOTA_SUFFICIENT", remainingGpuSeconds: 275 },
        { kind: "RETRYABLE_PROVIDER_FAILURE", detail: `TIMEOUT:${secret}` },
        counts,
      ),
      CLOUDFLARE_WORKERS_AI: adapter(
        "CLOUDFLARE_WORKERS_AI",
        { eligible: true, reason: "CLOUDFLARE_WORKERS_FREE_ADMITTED" },
        { kind: "SUCCEEDED", receipt: successReceipt("CLOUDFLARE_WORKERS_AI") },
        counts,
      ),
    },
    ctx(),
  );

  const serializedEvidence = JSON.stringify(receipt.orchestration);
  assert.equal(serializedEvidence.includes(secret), false);
  assert.equal(receipt.orchestration?.attempts[0]?.quotaRemainingGpuSeconds, 275);
});

test("deferred receipt carries Human Visual Review provider evidence", async () => {
  const counts: Record<string, number> = {};
  const receipt = await orchestrateVisualGeneration(
    plan("REFERENCE_GENERATION"),
    {
      HF_ZEROGPU: adapter(
        "HF_ZEROGPU",
        { eligible: false, reason: "HF_QUOTA_UNAVAILABLE" },
        { kind: "PERMANENT_FAILURE" },
        counts,
      ),
      CLOUDFLARE_WORKERS_AI: adapter(
        "CLOUDFLARE_WORKERS_AI",
        { eligible: false, reason: "CLOUDFLARE_FREE_PLAN_NOT_ADMITTED" },
        { kind: "PERMANENT_FAILURE" },
        counts,
      ),
    },
    ctx(),
  );

  assert.equal(receipt.status, "WAITING_FOR_COMPUTE");
  assert.equal(receipt.orchestration?.finalState, "GENERATION_DEFERRED");
  assert.equal(receipt.orchestration?.attempts.length, 2);
  assert.deepEqual(receipt.orchestration?.attempts.map((item) => item.eligibility), ["INELIGIBLE", "INELIGIBLE"]);
  assert.ok(receipt.orchestration?.orchestrationId);
});
